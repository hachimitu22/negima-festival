/**
 * ゲームエンジン。フレーム制御、シーン管理、入力キュー、ビューレンダリングを統合。
 * 
 * アーキテクチャ上、GameEngine がゲームループの実行制御を担当し、
 * シーンおよびビューレンダラーの公開 API（configure/init/render/destroy）を呼び出す。
 * @public
 */
class GameEngine {
  #sceneStack;
  #currentScene;
  #inputQueue;
  #isRunning;
  #view;
  #sceneControl;

  /**
   * GameEngine インスタンスを生成する。
   * 
   * @public
   * @param {Object} config - 設定オブジェクト
   * @param {GameObject} config.initialScene - 初期シーン（必須）
   * @param {Object} config.view - ビューレンダラー（optional。ない場合は configure/init/destroy 処理はスキップ）
   * @param {Function} config.view.configure - レンダラー初期化（GameEngine → view への enqueueInput コールバックを渡す）
   * @param {Function} config.view.init - 描画初期化（スナップショット受け取り）
   * @param {Function} config.view.render - 各フレーム描画（スナップショット受け取り）
   * @param {Function} config.view.destroy - ビューのクリーンアップ
   * @throws {TypeError} initialScene が指定されていない場合
   * 
   * @example
   * const scene = new MainGameScene();
   * const view = createDOMGameView();
   * const engine = new GameEngine({ initialScene: scene, view });
   */
  constructor({ initialScene, view }) {
    this.#sceneStack = [];
    this.#currentScene = null;
    this.#inputQueue = [];
    this.#isRunning = false;
    this.#view = view;
    this.#sceneControl = Object.freeze({
      pushScene: scene => this.#pushScene(scene),
      popScene: () => this.#popScene(),
    });

    this.#pushScene(initialScene);

    if (this.#view && typeof this.#view.configure === 'function') {
      this.#view.configure({
        enqueueInput: input => this.#enqueueInput(input),
        requestRenderStep: () => this.step(),
      });
    }
  }

  /**
   * ゲームエンジンを起動する。ビューの init メソッドを呼び出し、フラグを有効化。
   * 
   * @public
   * @returns {void}
   * 
   * @example
   * engine.start();
   * // この後、毎フレーム engine.update(now) を呼び出す（例: requestAnimationFrame）
   */
  start() {
    this.#view.init(this.#createSnapshot());
    this.#isRunning = true;
  }

  /**
   * ゲームエンジンを停止する。ビューの destroy メソッドを呼び出し、リソースをクリーンアップ。
   * 
   * @public
   * @returns {void}
   * 
   * @example
   * engine.stop();
   */
  stop() {
    this.#isRunning = false;

    if (this.#view && typeof this.#view.destroy === 'function') {
      this.#view.destroy();
    }

    this.#view = null;
  }

  /**
   * 入力イベントを処理し1回だけ更新と描画を行う。
   *
   * @public
   * @returns {void}
   */
  step() {
    if (!this.#isRunning) {
      return;
    }

    this.#update();
    this.#renderView();
  }

  /**
   * 入力イベントを入力キューに追加する。
   * 
   * ビューレンダラーが configure で受け取った enqueueInput コールバック経由で呼び出されることを想定。
   * 
   * @private
   * @param {Object} input - 入力オブジェクト
   * @returns {void}
   * 
   * @example
   * this.#enqueueInput({ type: 'target.activate', target: 'actor:id' });
   */
  #enqueueInput(input) {
    this.#inputQueue.push(input);
  }

  /**
   * 入力キューをすべて取り出す。キューは空になる。
   * 
   * @private
   * @returns {Array<Object>} 取り出された入力イベント配列
   */
  #drainInputQueue() {
    const inputs = this.#inputQueue;
    this.#inputQueue = [];
    return inputs;
  }

  /**
   * シーンスタックにシーンをプッシュする。新規シーンはアクティブシーンになる。
   * 
   * @private
   * @param {GameObject} scene - プッシュするシーン
   * @returns {GameObject} プッシュされたシーン
   * @throws {TypeError} scene が falsy の場合
   * 
   * @example
   * const newScene = new ConversationScene();
   * this.#pushScene(newScene);
   */
  #pushScene(scene) {
    if (!scene) {
      throw new TypeError('Scene is required.');
    }

    this.#sceneStack.push(scene);
    this.#currentScene = scene;
    return scene;
  }

  /**
   * シーンスタックからシーンをポップする。スタックに1つ以上のシーンが残る場合のみ可能。
   * 
   * @private
   * @returns {GameObject|null} ポップされたシーン。ポップできない場合は null
   * 
   * @example
   * const poppedScene = this.#popScene();
   */
  #popScene() {
    if (this.#sceneStack.length <= 1) {
      return null;
    }

    const poppedScene = this.#sceneStack.pop();
    this.#currentScene = this.#sceneStack[this.#sceneStack.length - 1];
    return poppedScene;
  }

  /**
   * 経過時間なしの単発更新としてアクティブシーンを更新する。
   *
   * @private
   * @returns {void}
   */
  #update() {
    const inputs = this.#drainInputQueue();

    if (!this.#currentScene || typeof this.#currentScene.update !== 'function') {
      return;
    }

    this.#currentScene.update({
      inputs,
      sceneControl: this.#sceneControl,
    });
  }

  /**
   * ビューレンダラーを1フレーム描画する。
   * 
   * @private
   * @returns {void}
   */
  #renderView() {
    if (this.#view && typeof this.#view.render === 'function') {
      this.#view.render(this.#createSnapshot());
    }
  }

  /**
   * アクティブシーンからゲーム状態のスナップショットを取得する。
   * 
   * ビューレンダラーはこのスナップショットから DOM を描画する。
   * ゲーム状態 → スナップショット → ビュー描画 という依存方向を維持する。
   * 
   * @private
   * @returns {Object} ゲーム状態スナップショット。スナップショット作成メソッドがない場合は空オブジェクト
   */
  #createSnapshot() {
    if (!this.#currentScene || typeof this.#currentScene.createSnapshot !== 'function') {
      return {};
    }

    return this.#currentScene.createSnapshot();
  }
}

export {
  GameEngine,
};
