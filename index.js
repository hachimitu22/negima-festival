import { GameEngine } from './src/gameEngine/gameEngine.js';
import { CanonicalFestivalPrototypeScene } from './src/gameDomain/canonicalFestivalPrototypeScene/canonicalFestivalPrototypeScene.js';
import { CanonicalFestivalPrototypeView } from './src/views/canonicalFestivalPrototypeView.js';

/** ブラウザ初期化を開始するイベント名。 */
const WINDOW_LOAD_EVENT = 'load';

/**
 * プロトタイプを起動して描画ループを開始する。
 * @returns {void}
 */
function main() {
  const gameView = new CanonicalFestivalPrototypeView(document.getElementById('game'));

  const engine = new GameEngine({
    initialScene: new CanonicalFestivalPrototypeScene(),
    view: gameView,
  });
  engine.start();
}

window.addEventListener(WINDOW_LOAD_EVENT, main);
