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

  mount(rootElement, options);

  function mount(rootElement, options) {
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
      snapshot.mapLocations,
      snapshot.character.location,
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

    eventItem.id = `event-${event.id}`;
    eventItem.dataset.eventId = String(event.id);

    label.dataset.eventLabel = '';
    eventItem.appendChild(label);

    return eventItem;
  }

  return {
    destroy,
    init,
    update,
  };
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

export {
  createMainGameSceneView,
};
