import createClockView from './clockView.js';
import createCurrentAreaView from './currentAreaView.js';
import createCurrentAreaVisitorsView from './currentAreaVisitorsView.js';
import createDialogueView from './dialogueView.js';
import createMoveableAreasView from './moveableAreasView.js';
import createScheduleTimelineView from './scheduleTimelineView.js';
// Debug
import createEventsView from './debug/eventsView.js'
import createActorsView from './debug/actorsView.js'

/** SceneSnapshotを操作確認用DOMへ描画する。 */
class MainView {
  #containerElement;
  #enqueueInput;
  #requestRenderStep;

  /**
   * @param {HTMLElement} containerElement - 描画先要素。
   */
  constructor(containerElement) {
    if (!containerElement) {
      throw new TypeError('containerElement is required.');
    }
    this.#containerElement = containerElement;
  }

  /**
   * GameEngineとの入出力を設定する。
   * @param {Object} api - Engine API。
   * @param {Function} api.enqueueInput - 入力追加関数。
   * @param {Function} api.requestRenderStep - 単発更新関数。
   * @returns {void}
   */
  configure({ enqueueInput, requestRenderStep }) {
    this.#enqueueInput = enqueueInput;
    this.#requestRenderStep = requestRenderStep;
  }

  /**
   * DOMイベントを登録して初回描画する。
   * @param {Object} snapshot - SceneSnapshot。
   * @returns {void}
   */
  init(snapshot) {
    this.render(snapshot);
  }

  /**
   * snapshotから画面全体を描画する。
   * @param {Object} snapshot - SceneSnapshot。
   * @returns {void}
   */
  render(snapshot) {
    this.#containerElement.replaceChildren();

    const title = document.createElement('h1');
    title.textContent = '麻帆良祭 プロトタイプver3';
    this.#containerElement.appendChild(title);

    // 時刻
    this.#containerElement.appendChild(createClockView(this.#submitInput.bind(this), snapshot));
    // 現在地
    this.#containerElement.appendChild(createCurrentAreaView(this.#submitInput.bind(this), snapshot));
    // 滞在者
    this.#containerElement.appendChild(createCurrentAreaVisitorsView(this.#submitInput.bind(this), snapshot));

    if (snapshot.dialogue) {
      // ダイアログ
      this.#containerElement.appendChild(createDialogueView(this.#submitInput.bind(this), snapshot.dialogue));
    } else {
      // 移動可能なエリア一覧
      this.#containerElement.appendChild(createMoveableAreasView(this.#submitInput.bind(this), snapshot));
    }

    // スケジュール表
    this.#containerElement.appendChild(createScheduleTimelineView(this.#submitInput.bind(this), snapshot));

    // デバッグ
    this.#containerElement.appendChild(createEventsView(this.#submitInput.bind(this), snapshot));
    this.#containerElement.appendChild(createActorsView(this.#submitInput.bind(this), snapshot));
  }

  /**
   * DOMイベントを解除して表示を破棄する。
   * @returns {void}
   */
  destroy() {
    this.#containerElement.replaceChildren();
  }

  /**
   * 入力をEngineへ渡して単発更新を要求する。
   * @param {Object} input - ゲーム入力。
   * @returns {void}
   */
  #submitInput(input) {
    this.#enqueueInput(input);
    this.#requestRenderStep();
  }
}

export default MainView;
