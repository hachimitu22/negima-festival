import { createGameState } from './src/gameState.js';
import { createDomGameView } from './src/gameView.js';

const gameState = createGameState();
const gameView = createDomGameView();

window.addEventListener('load', () => {
  main();
});

function main() {
  gameView.mount(document.getElementById('game'), {
    dispatch: action => {
      gameState.currentScene.handleAction(action);
    },
  });

  requestAnimationFrame(mainLoop);
}

function mainLoop(now) {
  updateFrame(gameState, now);
  gameState.currentScene.update(gameState.frame.deltaTime);
  gameView.render(gameState.currentScene.createSnapshot());

  requestAnimationFrame(mainLoop);
}

function updateFrame(state, now) {
  const frame = state.frame;
  if (frame.beforeTime === null) {
    frame.beforeTime = now;
  }

  frame.deltaTime = now - frame.beforeTime;
  frame.beforeTime = now;
}
