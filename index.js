import { enqueueInput, startGameEngine } from './src/gameEngine.js';
import { createDomGameView } from './src/gameView.js';
import { createMainGameScene } from './src/mainGameScene.js';

window.addEventListener('load', () => {
  main();
});

function main() {
  const gameView = createDomGameView(document.getElementById('game'), {
    enqueueInput,
  });

  startGameEngine({
    initialScene: createMainGameScene(),
    view: gameView,
  });
}
