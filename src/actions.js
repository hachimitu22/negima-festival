const ACTION_TYPES = {
  EVENT_CLICK: 'event.click',
  EVENT_INPUT_CHANGE: 'event.input.change',
  EVENT_INPUT_SUBMIT: 'event.input.submit',
};

const INPUT_TYPES = {
  TARGET_ACTIVATE: 'target.activate',
  TARGET_INPUT_CHANGE: 'target.input.change',
  TARGET_SUBMIT: 'target.submit',
};

const TARGET_PREFIXES = {
  CASSIOPEIA: 'cassiopeia',
  EVENT: 'event',
  LAYER: 'layer',
  LOCATION: 'location',
};

const MAIN_GAME_LAYER_IDS = {
  MENU: 'menu',
  MAP: 'map',
  EXECUTING_EVENTS: 'executing-events',
  SUCCEEDED_EVENTS: 'succeeded-events',
  FAILED_EVENTS: 'failed-events',
};

const SCENE_IDS = {
  MAIN_GAME: 'main-game',
};

export {
  ACTION_TYPES,
  INPUT_TYPES,
  MAIN_GAME_LAYER_IDS,
  SCENE_IDS,
  TARGET_PREFIXES,
};
