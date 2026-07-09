import { INPUT_TYPES, TARGET_PREFIXES } from '../../../gameDomain/actions.js';
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
  let root = null;
  let elements = null;
  let enqueueInput = null;

  mount(rootElement, options);

  function mount(rootElement, options) {
    enqueueInput = options.enqueueInput;
    root = document.createElement('section');
    root.id = 'main-game-scene';

    elements = {
      eventPanel: createRegion(createDiv('event-panel')),
      eventTitle: createHeading('executing-events-title', '実行中イベント'),
      mapList: createRegion(createDiv('map-list')),
      eventList: createList('event-list'),
    };

    statusView.mount(root, options);
    mapView = createMapView(elements.mapList.element, options);
    elements.eventPanel.element.setAttribute('aria-labelledby', elements.eventTitle.id);
    elements.eventPanel.element.append(elements.eventTitle, elements.eventList);
    [
      elements.eventPanel,
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
    mapView.update(
      snapshot.map,
      snapshot.character,
      snapshot.actors,
    );
    updateExecutingEvents(snapshot.executingEvents);
  }

  function destroy() {
    if (!elements) {
      return;
    }

    mapView.destroy();
    mapView = null;
    [
      elements.eventPanel,
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

  function updateExecutingEvents(events) {
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

function updateEventChoices(choiceList, choices, enqueueInput) {
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
