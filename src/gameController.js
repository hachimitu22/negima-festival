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
