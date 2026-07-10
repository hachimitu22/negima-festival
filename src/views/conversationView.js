import { INPUT_TYPES, TARGET_PREFIXES } from '../gameDomain/actions.js';

/**
 * Creates a reusable conversation content view.
 * @public
 * @param {HTMLElement} conversationElement - Conversation container element.
 * @param {Object} options - View options.
 * @param {Function} options.enqueueInput - Input queue function.
 * @returns {Object} Conversation view API.
 */
function createConversationView(conversationElement, options) {
  let enqueueInput = options.enqueueInput;

  /**
   * Updates the conversation content.
   * @param {Object|null} conversation - Conversation snapshot, or null to clear.
   * @returns {void}
   */
  function update(conversation) {
    if (!conversation) {
      conversationElement.replaceChildren();
      return;
    }

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

  /**
   * Destroys the conversation content view.
   * @returns {void}
   */
  function destroy() {
    conversationElement.replaceChildren();
    enqueueInput = null;
  }

  /**
   * Gets or creates the DOM nodes used by the conversation content.
   * @returns {Object} Conversation DOM node references.
   */
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

  /**
   * Updates available conversation choice buttons.
   * @param {HTMLElement} choiceList - Choice list container.
   * @param {Array<Object>} choices - Choice snapshots.
   * @returns {void}
   */
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

  /**
   * Gets or creates one conversation choice button.
   * @param {HTMLElement} choiceList - Choice list container.
   * @param {Object} choice - Choice snapshot.
   * @returns {HTMLButtonElement} Choice button.
   */
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
    update,
  };
}

/**
 * Creates an input target ID.
 * @param {string} prefix - Input target prefix.
 * @param {string} id - Input target value.
 * @returns {string} Input target ID.
 */
function createTargetId(prefix, id) {
  return `${prefix}:${id}`;
}

export {
  createConversationView,
};
