import { startGameEngine } from './src/gameEngine.js';
import { createDomGameView } from './src/gameView.js';
import { createMainGameScene } from './src/mainGameScene.js';

const gameView = createDomGameView();

window.addEventListener('load', () => {
  main();
});

function main() {
  startGameEngine({
    rootElement: document.getElementById('game'),
    initialScene: createMainGameScene(),
    view: gameView,
  });
}
