import { GameEngine } from './src/prototype3/gameEngine/gameEngine.js';
import MainScene from './src/prototype3/scenes/mainScene/mainScene.js';
import MainView from './src/prototype3/views/mainView.js';


/** ブラウザ初期化を開始するイベント名。 */
const WINDOW_LOAD_EVENT = 'load';

/**
 * プロトタイプを起動して描画ループを開始する。
 * @returns {void}
 */
function main() {
  const gameView = new MainView(document.getElementById('game'));

  const engine = new GameEngine({
    initialScene: new MainScene(),
    view: gameView,
  });
  engine.start();
}

window.addEventListener(WINDOW_LOAD_EVENT, main);
