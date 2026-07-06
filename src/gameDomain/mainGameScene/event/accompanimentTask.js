/**
 * 同伴タスクステート値。
 * @private
 */
const ACCOMPANIMENT_TASK_STATES = Object.freeze({
  OFFERED: 'offered',
  EXECUTING: 'executing',
  SUCCEEDED: 'succeeded',
});

/**
 * 同伴タスク。キャラクターと一緒に目的地を訪れるを管理。
 * @private
 */
class AccompanimentTask {
  #state;

  constructor({ companion, destination }) {
    this.companion = createIdentity(companion, 'actor');
    this.destination = createIdentity(destination, 'location');
    this.#state = ACCOMPANIMENT_TASK_STATES.OFFERED;
  }

  /**
   * 同伴を承認。
   * @private
   * @returns {boolean} 承認成功時 true
   */
  accept() {
    if (this.#state !== ACCOMPANIMENT_TASK_STATES.OFFERED) {
      return false;
    }

    this.#state = ACCOMPANIMENT_TASK_STATES.EXECUTING;
    return true;
  }

  /**
   * 同伴を完了。
   * @private
   * @returns {boolean} 完了成功時 true
   */
  complete() {
    if (this.#state !== ACCOMPANIMENT_TASK_STATES.EXECUTING) {
      return false;
    }

    this.#state = ACCOMPANIMENT_TASK_STATES.SUCCEEDED;
    return true;
  }

  /**
   * 同伴実行中かどうかを確認。
   * @private
   * @returns {boolean} 実行中の場合 true
   */
  isExecuting() {
    return this.#state === ACCOMPANIMENT_TASK_STATES.EXECUTING;
  }

  /**
   * 同伴完了かどうかを確認。
   * @private
   * @returns {boolean} 完了時 true
   */
  isSucceeded() {
    return this.#state === ACCOMPANIMENT_TASK_STATES.SUCCEEDED;
  }

  /**
   * 同伴タスク状態のスナップショット。
   * @private
   * @returns {Object} スナップショット
   */
  getSnapshot() {
    return {
      companion: { ...this.companion },
      destination: { ...this.destination },
      state: this.#state,
    };
  }
  };
}

/**
 * 識別オブジェクトを作成。
 * @private
 * @param {Object} value - 値オブジェクト
 * @param {string} label - ラベル
 * @returns {Object} 識別オブジェクト
 */
function createIdentity(value, label) {
  if (!value || typeof value.id !== 'string' || typeof value.name !== 'string') {
    throw new TypeError(`Accompaniment task ${label} must have an id and name.`);
  }

  return {
    id: value.id,
    name: value.name,
  };
}

export {
  ACCOMPANIMENT_TASK_STATES,
  AccompanimentTask,
};
