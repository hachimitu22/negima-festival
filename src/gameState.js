import { MENU_LIST } from './gameLogic.js';

function createGameState() {
  return {
    frame: {
      beforeTime: null,
      deltaTime: 0,
    },
    events: [],
    succeededEvents: [],
    failedEvents: [],
    lastEventId: 0,
    inputValues: {},
    currentMenu: MENU_LIST.TOP_MENU,
  };
}

export {
  createGameState,
};
