import { ACTION_TYPES, MAIN_GAME_LAYER_IDS } from './actions.js';
import { EventGameObject } from './eventGameObject.js';
import { ClickEvent, InputEvent } from './gameEvent.js';
import { LOCATIONS } from './locations.js';
import { getRandomInt, rollChance } from './random.js';

const GAME_EVENTS = [
  ClickEvent,
  InputEvent,
];

const LAYER_ITEMS = [
  { id: MAIN_GAME_LAYER_IDS.MAP, label: 'マップ' },
  { id: MAIN_GAME_LAYER_IDS.EXECUTING_EVENTS, label: '実行中イベント' },
  { id: MAIN_GAME_LAYER_IDS.SUCCEEDED_EVENTS, label: '成功イベント' },
  { id: MAIN_GAME_LAYER_IDS.FAILED_EVENTS, label: '失敗イベント' },
];

const EVENT_SPAWN_INTERVAL_HOURS = 2;

class MainGameScene {
  constructor() {
    this.activeLayerId = MAIN_GAME_LAYER_IDS.MENU;
    this.events = [];
    this.succeededEvents = [];
    this.failedEvents = [];
    this.lastEventId = 0;
    this.nextEventTimeHours = 1;
  }

  update(context) {
    this.events.forEach(eventObject => {
      eventObject.update(context);
    });

    this.moveFinishedEvents();

    const eventObject = this.createEventRandom(context);
    if (eventObject) {
      this.events.push(eventObject);
    }
  }

  handleAction(action) {
    if (action.type === ACTION_TYPES.LAYER_SELECT) {
      this.selectLayer(action.layerId);
      return;
    }

    this.events.forEach(eventObject => {
      eventObject.handleAction(action);
    });
  }

  createSnapshot() {
    return {
      activeLayerId: this.activeLayerId,
      layerItems: LAYER_ITEMS,
      mapLocations: LOCATIONS,
      executingEvents: this.events.map(eventObject => eventObject.getSnapshot()),
      succeededEvents: this.succeededEvents.map(eventObject => eventObject.getSnapshot()),
      failedEvents: this.failedEvents.map(eventObject => eventObject.getSnapshot()),
    };
  }

  selectLayer(layerId) {
    if (Object.values(MAIN_GAME_LAYER_IDS).includes(layerId)) {
      this.activeLayerId = layerId;
    }
  }

  moveFinishedEvents() {
    const executingEvents = [];

    this.events.forEach(eventObject => {
      if (eventObject.isSucceeded()) {
        this.succeededEvents.push(eventObject);
      } else if (eventObject.isFailed()) {
        this.failedEvents.push(eventObject);
      } else {
        executingEvents.push(eventObject);
      }
    });

    this.events = executingEvents;
  }

  rewindTo(currentHours) {
    this.events = [];
    this.nextEventTimeHours = currentHours + EVENT_SPAWN_INTERVAL_HOURS;
  }

  createEventRandom(context) {
    if (
      context.isFestivalEnded
      || typeof context.gameTimeHours !== 'number'
      || context.gameTimeHours < this.nextEventTimeHours
    ) {
      return null;
    }

    this.nextEventTimeHours += EVENT_SPAWN_INTERVAL_HOURS;

    if (!rollChance(50)) {
      return null;
    }

    const randomIndex = getRandomInt(0, GAME_EVENTS.length - 1);
    const event = new GAME_EVENTS[randomIndex](this.lastEventId++);
    if (typeof context.rememberEvent === 'function') {
      context.rememberEvent(event.name);
    }
    return new EventGameObject(event);
  }
}

function createMainGameScene() {
  return new MainGameScene();
}

export {
  createMainGameScene,
};
