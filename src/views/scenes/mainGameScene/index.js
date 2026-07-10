import { INPUT_TYPES, TARGET_PREFIXES } from '../../../gameDomain/actions.js';
import { createConversationView } from '../../conversationView.js';
import { createStatusView } from '../../statusView.js';
import { createMapView } from './mapView.js';

/**
 * メインゲームシーン用ビューを作成。ステータス・マップ・イベント一覧を表示。
 * @public
 * @param {HTMLElement} rootElement - 描画対象的要素
 * @param {Object} options - オプション設定
 * @returns {Object} メインゲームシーン view API (init, update, destroy)
 */
function createMainGameSceneView(rootElement, options) {
  const statusView = createStatusView();
  let mapView = null;
  let conversationView = null;
  let root = null;
  let elements = null;
  let enqueueInput = null;

  mount(rootElement, options);

  function mount(rootElement, options) {
    enqueueInput = options.enqueueInput;
    root = document.createElement('section');
    root.id = 'main-game-scene';

    elements = {
      conversationPanel: createRegion(createDiv('conversation-panel')),
      conversationTitle: createHeading('conversation-title', '会話'),
      conversationBody: createDiv('conversation'),
      eventPanel: createRegion(createDiv('event-panel')),
      eventTitle: createHeading('executing-events-title', '実行中イベント'),
      mapList: createRegion(createDiv('map-list')),
      eventList: createList('event-list'),
    };

    statusView.mount(root, options);
    mapView = createMapView(elements.mapList.element, options);
    conversationView = createConversationView(elements.conversationBody, options);
    elements.conversationPanel.element.setAttribute('aria-labelledby', elements.conversationTitle.id);
    elements.conversationPanel.element.append(
      elements.conversationTitle,
      elements.conversationBody,
    );
    elements.eventPanel.element.setAttribute('aria-labelledby', elements.eventTitle.id);
    elements.eventPanel.element.append(elements.eventTitle, elements.eventList);
    [
      elements.eventPanel,
      elements.conversationPanel,
      elements.mapList,
    ].forEach(region => {
      root.append(region.anchor, region.element);
    });
    rootElement.appendChild(root);
  }

  function init(snapshot) {
    statusView.init(snapshot);
    updateSceneContent(snapshot);
  }

  function update(snapshot) {
    statusView.update(snapshot);
    updateSceneContent(snapshot);
  }

  function updateSceneContent(snapshot) {
    const isConversationActive = Boolean(snapshot.conversation);
    mapView.update(
      snapshot.map,
      snapshot.character,
      snapshot.actors,
      { isInputDisabled: isConversationActive },
    );
    updateConversation(snapshot.conversation);
    updateExecutingEvents(snapshot.executingEvents, isConversationActive);
  }

  function destroy() {
    if (!elements) {
      return;
    }

    mapView.destroy();
    conversationView.destroy();
    mapView = null;
    conversationView = null;
    [
      elements.eventPanel,
      elements.conversationPanel,
      elements.mapList,
    ].forEach(region => {
      region.element.remove();
      region.anchor.remove();
    });
    statusView.destroy();
    root.remove();
    root = null;
    elements = null;
    enqueueInput = null;
  }

  /**
   * Updates the embedded conversation panel.
   * @param {Object|null} conversation - Conversation snapshot.
   * @returns {void}
   */
  function updateConversation(conversation) {
    conversationView.update(conversation);
  }

  function updateExecutingEvents(events, isInputDisabled) {
    const eventIds = new Set(events.map(event => String(event.id)));

    Array.from(elements.eventList.children).forEach(eventItem => {
      if (!eventIds.has(eventItem.dataset.eventId)) {
        eventItem.remove();
      }
    });

    events.forEach(event => {
      const eventItem = getOrCreateExecutingEventItem(event);
      eventItem.querySelector('[data-event-label]').textContent = formatExecutingEvent(event);
      updateEventChoices(
        eventItem.querySelector('[data-event-choices]'),
        event.currentTask?.choices ?? [],
        enqueueInput,
        isInputDisabled,
      );

      if (!eventItem.isConnected) {
        elements.eventList.appendChild(eventItem);
      }
    });
  }

  function getOrCreateExecutingEventItem(event) {
    const existingItem = elements.eventList.querySelector(`[data-event-id="${event.id}"]`);
    if (existingItem) {
      return existingItem;
    }

    const eventItem = document.createElement('li');
    const label = document.createElement('span');
    const choices = document.createElement('menu');

    eventItem.id = `event-${event.id}`;
    eventItem.dataset.eventId = String(event.id);

    label.dataset.eventLabel = '';
    choices.dataset.eventChoices = '';
    eventItem.append(label, choices);

    return eventItem;
  }

  return {
    destroy,
    init,
    update,
  };
}

/**
 * Updates event choice buttons.
 * @param {HTMLElement} choiceList - Choice list element.
 * @param {Array<Object>} choices - Event choice snapshots.
 * @param {Function} enqueueInput - Input queue function.
 * @param {boolean} isInputDisabled - Whether event choice input is disabled.
 * @returns {void}
 */
function updateEventChoices(choiceList, choices, enqueueInput, isInputDisabled) {
  const choiceIds = new Set(choices.map(choice => choice.id));

  Array.from(choiceList.children).forEach(choiceItem => {
    if (!choiceIds.has(choiceItem.dataset.choiceId)) {
      choiceItem.remove();
    }
  });

  choices.forEach(choice => {
    const choiceItem = getOrCreateChoiceItem(choiceList, choice, enqueueInput);
    const button = choiceItem.querySelector('[data-event-choice-button]');

    if (button.textContent !== choice.title) {
      button.textContent = choice.title;
    }
    button.disabled = isInputDisabled;
    if (!choiceItem.isConnected) {
      choiceList.appendChild(choiceItem);
    }
  });

  choiceList.hidden = choices.length === 0;
}

function getOrCreateChoiceItem(choiceList, choice, enqueueInput) {
  const existingItem = choiceList.querySelector(`[data-choice-id="${choice.id}"]`);
  if (existingItem) {
    return existingItem;
  }

  const choiceItem = document.createElement('li');
  const button = document.createElement('button');

  choiceItem.dataset.choiceId = choice.id;
  button.type = 'button';
  button.dataset.eventChoiceButton = '';
  button.addEventListener('click', () => {
    enqueueInput({
      type: INPUT_TYPES.TARGET_ACTIVATE,
      targetId: createTargetId(TARGET_PREFIXES.BRANCH_CHOICE, choice.id),
    });
  });
  choiceItem.appendChild(button);

  return choiceItem;
}

function createRegion(element) {
  const anchor = document.createComment(`${element.id}-anchor`);
  return {
    anchor,
    element,
  };
}

function createDiv(id) {
  const element = document.createElement('div');
  element.id = id;
  return element;
}

function createList(id) {
  const element = document.createElement('ul');
  element.id = id;
  return element;
}

function createHeading(id, text) {
  const element = document.createElement('h2');
  element.id = id;
  element.textContent = text;
  return element;
}

function formatExecutingEvent(event) {
  return `${event.id}: ${event.name}: ${event.description}`;
}

function createTargetId(prefix, id) {
  return `${prefix}:${id}`;
}

export {
  createMainGameSceneView,
};
