const ACTION_TYPES = {
  LAYER_SELECT: 'layer.select',
  CASSIOPEIA_USE: 'cassiopeia.use',
  LOCATION_SELECT: 'location.select',
  EVENT_CLICK: 'event.click',
  EVENT_INPUT_CHANGE: 'event.input.change',
  EVENT_INPUT_SUBMIT: 'event.input.submit',
};

const MAIN_GAME_LAYER_IDS = {
  MENU: 'menu',
  MAP: 'map',
  EXECUTING_EVENTS: 'executing-events',
  SUCCEEDED_EVENTS: 'succeeded-events',
  FAILED_EVENTS: 'failed-events',
};

export {
  ACTION_TYPES,
  MAIN_GAME_LAYER_IDS,
};
