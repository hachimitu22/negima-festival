import { ACTION_TYPES } from './src/actions.js';
import {
  createGameSnapshot,
  createGameState,
  rememberEvent,
  updateGameTime,
  useCassiopeia,
} from './src/gameState.js';
import { createDomGameView } from './src/gameView.js';

const gameState = createGameState();
const gameView = createDomGameView();

window.addEventListener('load', () => {
  main();
});

function main() {
  gameView.mount(document.getElementById('game'), {
    dispatch: action => {
      if (action.type === ACTION_TYPES.CASSIOPEIA_USE) {
        useCassiopeia(gameState);
        return;
      }

      gameState.currentScene.handleAction(action);
    },
  });

  requestAnimationFrame(mainLoop);
}

function mainLoop(now) {
  updateFrame(gameState, now);
  updateGameTime(gameState);
  gameState.currentScene.update(createUpdateContext(gameState));
  gameView.render(createGameSnapshot(gameState));

  requestAnimationFrame(mainLoop);
}

function updateFrame(state, now) {
  const frame = state.frame;
  if (frame.beforeTime === null) {
    frame.beforeTime = now;
  }

  frame.deltaTime = now - frame.beforeTime;
  frame.beforeTime = now;
  frame.count += 1;
}

function createUpdateContext(state) {
  return {
    deltaTimeMs: state.frame.deltaTime,
    frameCount: state.frame.count,
    targetFrameTimeMs: state.frame.targetFrameTimeMs,
    deltaFrames: state.frame.deltaTime / state.frame.targetFrameTimeMs,
    gameTimeHours: state.gameTime.currentHours,
    isFestivalEnded: state.gameTime.isEnded,
    rememberEvent: eventName => rememberEvent(state, eventName),
  };
}
