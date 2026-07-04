import { GameEngine } from './src/gameEngine/gameEngine.js';
import { DomGameView } from './src/views/domGameView.js';
import { MainGameScene } from './src/gameDomain/mainGameScene/mainGameScene.js';

window.addEventListener('load', () => {
  main();
});

function main() {
  const gameView = new DomGameView(document.getElementById('game'));

  const engine = new GameEngine({
    initialScene: new MainGameScene(),
    view: gameView,
  });
  engine.start();

  function loop(now) {
    engine.update(now);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}
