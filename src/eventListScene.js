import { ACTION_TYPES, MENU_IDS } from './actions.js';
import { EventGameObject } from './eventGameObject.js';
import { ClickEvent, InputEvent } from './gameEvent.js';
import { getRandomInt, rollChance } from './random.js';

const GAME_EVENTS = [
  ClickEvent,
  InputEvent,
];

const MENU_ITEMS = [
  { id: MENU_IDS.EXECUTING, label: '実行中イベント' },
  { id: MENU_IDS.SUCCEEDED, label: '成功イベント' },
  { id: MENU_IDS.FAILED, label: '失敗イベント' },
];

const EVENT_SPAWN_INTERVAL_HOURS = 2;

class EventListScene {
  constructor() {
    this.currentMenu = MENU_IDS.TOP;
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
    if (action.type === ACTION_TYPES.MENU_SELECT) {
      this.selectMenu(action.menuId);
      return;
    }

    this.events.forEach(eventObject => {
      eventObject.handleAction(action);
    });
  }

  createSnapshot() {
    return {
      currentMenu: this.currentMenu,
      menuItems: MENU_ITEMS,
      executingEvents: this.events.map(eventObject => eventObject.getSnapshot()),
      succeededEvents: this.succeededEvents.map(eventObject => eventObject.getSnapshot()),
      failedEvents: this.failedEvents.map(eventObject => eventObject.getSnapshot()),
    };
  }

  selectMenu(menuId) {
    if ([MENU_IDS.TOP, MENU_IDS.EXECUTING, MENU_IDS.SUCCEEDED, MENU_IDS.FAILED].includes(menuId)) {
      this.currentMenu = menuId;
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

function createEventListScene() {
  return new EventListScene();
}

export {
  createEventListScene,
};
