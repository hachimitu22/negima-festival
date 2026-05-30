import { getRandomInt, rollChance } from './random.js';
import { GAME_EVENT_STATE, ClickEvent, InputEvent } from './gameEvent.js';

const GAME_EVENTS = [
  ClickEvent,
  InputEvent,
];

const MENU_LIST = {
  TOP_MENU: 'TOP_MENU',
  EXECUTING_EVENTS_MENU: 'EXECUTING_EVENTS_MENU',
  SUCCEEDED_EVENTS_MENU: 'SUCCEEDED_EVENTS_MENU',
  FAILED_EVENTS_MENU: 'FAILED_EVENTS_MENU',
};

function updateGame(state) {
  state.events.forEach(event => {
    event.update(state.frame.deltaTime);
  });

  moveFinishedEvents(state);

  const event = createEventRandom(state);
  if (event) {
    state.events.push(event);
  }
}

function moveFinishedEvents(state) {
  const executingEvents = [];

  state.events.forEach(event => {
    if (event.state === GAME_EVENT_STATE.SUCCEEDED) {
      state.succeededEvents.push(event);
      delete state.inputValues[event.id];
    } else if (event.state === GAME_EVENT_STATE.FAILED) {
      state.failedEvents.push(event);
      delete state.inputValues[event.id];
    } else {
      executingEvents.push(event);
    }
  });

  state.events = executingEvents;
}

// イベントをランダム生成する。生成されないこともある。
function createEventRandom(state) {
  if (!rollChance(1)) {
    return null;
  }

  const randomIndex = getRandomInt(0, GAME_EVENTS.length - 1);
  return new GAME_EVENTS[randomIndex](state.lastEventId++);
}

export {
  updateGame,
  MENU_LIST,
};
