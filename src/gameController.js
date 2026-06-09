import { ACTION_TYPES } from './actions.js';
import {
  createGameSnapshot,
  createGameState,
  moveCharacterToLocation,
  updateGameState,
  useCassiopeia,
} from './gameState.js';

function createGameController() {
  const state = createGameState();

  function dispatch(action) {
    if (action.type === ACTION_TYPES.CASSIOPEIA_USE) {
      useCassiopeia(state);
      return;
    }

    if (action.type === ACTION_TYPES.LOCATION_SELECT) {
      moveCharacterToLocation(state, action.locationId);
      return;
    }

    state.currentScene.handleAction(action);
  }

  function update(now) {
    updateGameState(state, now);
  }

  function createSnapshot() {
    return createGameSnapshot(state);
  }

  return {
    createSnapshot,
    dispatch,
    update,
  };
}

export {
  createGameController,
};
