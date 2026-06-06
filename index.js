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
  gameController.update(now);
  gameView.render(gameController.createSnapshot());

  requestAnimationFrame(mainLoop);
}
