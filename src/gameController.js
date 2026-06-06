import { ACTION_TYPES } from './actions.js';
import {
  createGameSnapshot,
  createGameState,
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

    state.currentScene.handleAction(action);
  }

  function update() {
    updateGameState(state);
  }

  function createSnapshot() {
    return createGameSnapshot(state);
  }

  function getState() {
    return state;
  }

  return {
    createSnapshot,
    dispatch,
    getState,
    update,
  };
}

export {
  createGameController,
};
