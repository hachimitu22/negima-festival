import { INPUT_TYPES, TARGET_PREFIXES } from '../../../gameDomain/actions.js';
import { createStatusView } from '../../statusView.js';

/**
 * 会話シーン用ビューを作成。会話内容と選択肢を表示。
 * @public
 * @param {HTMLElement} rootElement - 描画対象的要素
 * @param {Object} options - オプション設定
 * @returns {Object} 会話シーン view API (init, update, destroy)
 */
function createConversationSceneView(rootElement, options) {
  const statusView = createStatusView();
  let root = null;
  let conversationElement = null;
  let enqueueInput = null;

  mount(rootElement, options);

  function mount(rootElement, options) {
    enqueueInput = options.enqueueInput;
    root = document.createElement('section');
    root.id = 'conversation-scene';
    conversationElement = document.createElement('div');
    conversationElement.id = 'conversation';

    statusView.mount(root, options);
    root.appendChild(conversationElement);
    rootElement.appendChild(root);
  }

  function init(snapshot) {
    statusView.init(snapshot);
    updateConversation(snapshot.conversation);
  }

  function update(snapshot) {
    statusView.update(snapshot);
    updateConversation(snapshot.conversation);
  }

  function destroy() {
    if (!root) {
      return;
    }

    conversationElement.replaceChildren();
    statusView.destroy();
    root.remove();
    root = null;
    conversationElement = null;
    enqueueInput = null;
  }

  function updateConversation(conversation) {
    const conversationView = getOrCreateConversationView();
    const choices = conversation.choices ?? [];
    conversationView.speaker.textContent = conversation.speakerName;
    conversationView.message.textContent = conversation.message;
    conversationView.progress.textContent = `${conversation.messageIndex + 1} / ${conversation.messageCount}`;
    conversationView.next.textContent = conversation.isLastMessage ? '会話を終える' : '次へ';
    conversationView.progress.hidden = choices.length > 0;
    conversationView.next.hidden = choices.length > 0;
    updateConversationChoices(conversationView.choices, choices);
  }

  function getOrCreateConversationView() {
    let speaker = conversationElement.querySelector('[data-conversation-speaker]');
    if (speaker) {
      return {
        speaker,
        message: conversationElement.querySelector('[data-conversation-message]'),
        progress: conversationElement.querySelector('[data-conversation-progress]'),
        choices: conversationElement.querySelector('[data-conversation-choices]'),
        next: conversationElement.querySelector('[data-conversation-next]'),
      };
    }

    speaker = document.createElement('h2');
    const message = document.createElement('p');
    const progress = document.createElement('p');
    const choices = document.createElement('div');
    const next = document.createElement('button');

    speaker.dataset.conversationSpeaker = '';
    message.dataset.conversationMessage = '';
    progress.dataset.conversationProgress = '';
    choices.dataset.conversationChoices = '';
    next.dataset.conversationNext = '';
    next.type = 'button';
    next.addEventListener('click', () => {
      enqueueInput({
        type: INPUT_TYPES.TARGET_ACTIVATE,
        targetId: createTargetId(TARGET_PREFIXES.CONVERSATION_SCENE, 'next'),
      });
    });

    conversationElement.append(speaker, message, progress, choices, next);
    return {
      speaker,
      message,
      progress,
      choices,
      next,
    };
  }

  function updateConversationChoices(choiceList, choices) {
    const choiceIds = new Set(choices.map(choice => choice.id));

    Array.from(choiceList.children).forEach(choiceButton => {
      if (!choiceIds.has(choiceButton.dataset.conversationChoiceId)) {
        choiceButton.remove();
      }
    });

    choices.forEach(choice => {
      const choiceButton = getOrCreateConversationChoice(choiceList, choice);
      choiceButton.textContent = choice.label;

      if (!choiceButton.isConnected) {
        choiceList.appendChild(choiceButton);
      }
    });

    choiceList.hidden = choices.length === 0;
  }

  function getOrCreateConversationChoice(choiceList, choice) {
    const existingChoice = Array.from(choiceList.children)
      .find(choiceButton => choiceButton.dataset.conversationChoiceId === choice.id);
    if (existingChoice) {
      return existingChoice;
    }

    const choiceButton = document.createElement('button');
    choiceButton.type = 'button';
    choiceButton.dataset.conversationChoiceId = choice.id;
    choiceButton.addEventListener('click', () => {
      enqueueInput({
        type: INPUT_TYPES.TARGET_ACTIVATE,
        targetId: createTargetId(
          TARGET_PREFIXES.CONVERSATION_SCENE,
          `choice:${choice.id}`,
        ),
      });
    });
    return choiceButton;
  }

  return {
    destroy,
    init,
    update,
  };
}

function createTargetId(prefix, id) {
  return `${prefix}:${id}`;
}

export {
  createConversationSceneView,
};
