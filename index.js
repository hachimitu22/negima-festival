import { createGameController } from './src/gameController.js';
import { createDomGameView } from './src/gameView.js';

const gameController = createGameController();
const gameView = createDomGameView();

window.addEventListener('load', () => {
  main();
});

function main() {
  gameView.mount(document.getElementById('game'), {
    dispatch: action => {
      gameController.dispatch(action);
    },
  });

  requestAnimationFrame(mainLoop);
}

function mainLoop(now) {
  updateFrame(gameController.getState(), now);
  gameController.update();
  gameView.render(gameController.createSnapshot());

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
