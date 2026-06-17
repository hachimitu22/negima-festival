import { enqueueInput, startGameEngine } from './src/gameEngine/gameEngine.js';
import { createDomGameView } from './src/views/gameView.js';
import { createMainGameScene } from './src/gameDomain/mainGameScene.js';

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
