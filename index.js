import { GameEngine } from './src/gameEngine/gameEngine.js';
import { DomGameView } from './src/views/gameView.js';
import { MainGameScene } from './src/gameDomain/mainGameScene.js';

window.addEventListener('load', () => {
  main();
});

function main() {
  let engine = null;
  const gameView = new DomGameView(document.getElementById('game'), {
    enqueueInput: input => engine.enqueueInput(input),
  });

  engine = new GameEngine({
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
