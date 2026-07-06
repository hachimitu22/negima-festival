/**
 * ゲームループのフレーム情報を初期化する。
 * 
 * @private
 * @returns {Object} フレーム情報オブジェクト
 * @returns {null} returns.beforeTime - 前フレームのタイムスタンプ（初期: null）
 * @returns {number} returns.deltaTime - フレーム間のデルタ時間（ミリ秒）
 * @returns {number} returns.count - 累積フレーム数
 * @returns {number} returns.targetFrameTimeMs - 目標フレームレート（ミリ秒、デフォルト: 1000/60 ≈ 16.67ms）
 * 
 * @example
 * const frame = createInitialFrame();
 * // frame = { beforeTime: null, deltaTime: 0, count: 0, targetFrameTimeMs: 16.666... }
 */
function createInitialFrame() {
  return {
    beforeTime: null,
    deltaTime: 0,
    count: 0,
    targetFrameTimeMs: 1000 / 60,
  };
}

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
  #frame;
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
    this.#frame = createInitialFrame();
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
   * ゲームエンジンを1フレーム更新する。毎フレーム requestAnimationFrame などで呼び出される想定。
   * 
   * 実行順序: フレーム情報更新 → シーン update → ビューレンダリング
   * 
   * @public
   * @param {number} now - 現在のタイムスタンプ（DOMHighResTimeStamp または Date.now() など）
   * @returns {void}
   * 
   * @example
   * let animationFrameId;
   * const tick = (now) => {
   *   engine.update(now);
   *   animationFrameId = requestAnimationFrame(tick);
   * };
   * animationFrameId = requestAnimationFrame(tick);
   */
  update(now) {
    if (!this.#isRunning) {
      return;
    }

    this.#updateScene(now);
    this.#renderView();
  }

  /**
   * アクティブシーンを更新する。フレーム更新 → 入力キュー処理 → シーン update メソッド呼び出し。
   * 
   * @private
   * @param {number} now - 現在のタイムスタンプ
   * @returns {void}
   */
  #updateScene(now) {
    this.#updateFrame(now);
    const inputs = this.#drainInputQueue();

    if (!this.#currentScene || typeof this.#currentScene.update !== 'function') {
      return;
    }

    const context = this.#createUpdateContext();
    context.inputs = inputs;
    this.#currentScene.update({
      context,
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
   * シーン update メソッドに渡すコンテキストオブジェクトを生成する。
   * 
   * @private
   * @returns {Object} 更新コンテキスト
   * @returns {number} returns.deltaFrames - フレーム間の相対フレーム数（理想フレームレート基準）
   * @returns {number} returns.deltaTimeMs - フレーム間のデルタ時間（ミリ秒）
   * @returns {number} returns.frameCount - 累積フレーム数
   * @returns {number} returns.targetFrameTimeMs - 目標フレームレート（ミリ秒）
   * @returns {Array} returns.inputs - 現フレームの入力イベント配列
   */
  #createUpdateContext() {
    return {
      deltaFrames: this.#frame.deltaTime / this.#frame.targetFrameTimeMs,
      deltaTimeMs: this.#frame.deltaTime,
      frameCount: this.#frame.count,
      targetFrameTimeMs: this.#frame.targetFrameTimeMs,
      inputs: [],
    };
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
   * ゲームループのフレーム情報を更新する。デルタ時間、フレームカウントを計算。
   * 
   * @private
   * @param {number} now - 現在のタイムスタンプ
   * @returns {void}
   */
  #updateFrame(now) {
    if (this.#frame.beforeTime === null) {
      this.#frame.beforeTime = now;
    }

    this.#frame.deltaTime = now - this.#frame.beforeTime;
    this.#frame.beforeTime = now;
    this.#frame.count += 1;
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
