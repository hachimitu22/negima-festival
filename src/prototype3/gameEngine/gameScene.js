import InputDispatcher from './inputDispatcher.js';

/** 登録されたSystemの初期化と更新を管理するScene基底クラス。 */
class GameScene {
  #systems = [];
  #systemsById = new Map();
  #inputDispatcher = new InputDispatcher();
  #initialized = false;

  /** Sceneを生成する。 */
  constructor() {
  }

  /**
   * ゲームシーンにSystemを登録する。
   * @param {Object} system - systemIdを持つSystem。
   * @returns {void}
   */
  addSystem(system) {
    if (!system?.systemId) {
      throw new TypeError('A system with systemId is required.');
    }
    if (this.#initialized) {
      throw new Error('Systems cannot be added after initialization.');
    }
    if (this.#systemsById.has(system.systemId)) {
      throw new Error(`Duplicate systemId: ${system.systemId}`);
    }

    this.#systems.push(system);
    this.#systemsById.set(system.systemId, system);
  }

  /**
   * IDに一致するSystemを返す。
   * @param {string} systemId - System ID。
   * @returns {Object|undefined} 登録済みSystem。
   */
  getSystem(systemId) {
    return this.#systemsById.get(systemId);
  }

  /**
   * 登録済みSystemの依存を解決する。
   * @returns {void}
   */
  initializeSystems() {
    if (this.#initialized) {
      return;
    }

    for (const system of this.#systems) {
      system.attach({
        inputDispatcher: this.#inputDispatcher,
      });
    }
    this.#initialized = true;
  }

  /**
   * 登録順にSystemを更新する。
   * @param {Object} context - 更新コンテキスト
   * @returns {void}
   */
  update(context) {
    if (!this.#initialized) {
      throw new Error('Systems must be initialized before update.');
    }

    context.inputDispatcher = this.#inputDispatcher;
    context.getSystem = this.getSystem.bind(this);

    this.#inputDispatcher.dispatchAll(context.inputs, context);

    for (const system of this.#systems) {
      system.update(context);
    }

    for (const system of this.#systems) {
      system.cleanup(context);
    }
  }

  /**
   * 描画用snapshotを作成する。
   * @returns {Object} SceneSnapshot。
   */
  createSnapshot() {
    throw new Error('createSnapshot() must be implemented in subclass.');
  }
}

export default GameScene;
