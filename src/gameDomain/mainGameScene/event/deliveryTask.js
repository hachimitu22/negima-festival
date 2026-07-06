/**
 * 配達タスクステート値。
 * @private
 */
const DELIVERY_TASK_STATES = Object.freeze({
  OFFERED: 'offered',
  EXECUTING: 'executing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
});

/**
 * 配達タスク。送信者から受取人への配達を管理。
 * @private
 */
class DeliveryTask {
  #state;

  constructor({ sender, recipient }) {
    this.sender = createActorIdentity(sender);
    this.recipient = createActorIdentity(recipient);
    this.#state = DELIVERY_TASK_STATES.OFFERED;
  }

  /**
   * 配達を承認。
   * @private
   * @returns {boolean} 承認成功時 true
   */
  accept() {
    if (this.#state !== DELIVERY_TASK_STATES.OFFERED) {
      return false;
    }

    this.#state = DELIVERY_TASK_STATES.EXECUTING;
    return true;
  }

  /**
   * 配達を完了。
   * @private
   * @returns {boolean} 完了成功時 true
   */
  complete() {
    if (this.#state !== DELIVERY_TASK_STATES.EXECUTING) {
      return false;
    }

    this.#state = DELIVERY_TASK_STATES.SUCCEEDED;
    return true;
  }

  /**
   * 配達を売事。
   * @private
   * @returns {boolean} 売事成功時 true
   */
  decline() {
    if (this.#state !== DELIVERY_TASK_STATES.EXECUTING) {
      return false;
    }

    this.#state = DELIVERY_TASK_STATES.FAILED;
    return true;
  }

  /**
   * 配達実行中かどうかを確認。
   * @private
   * @returns {boolean} 実行中の場合 true
   */
  isExecuting() {
    return this.#state === DELIVERY_TASK_STATES.EXECUTING;
  }

  /**
   * 配達完了かどうかを確認。
   * @private
   * @returns {boolean} 完了時 true
   */
  isSucceeded() {
    return this.#state === DELIVERY_TASK_STATES.SUCCEEDED;
  }

  /**
   * 配達失敗かどうかを確認。
   * @private
   * @returns {boolean} 失敗時 true
   */
  isFailed() {
    return this.#state === DELIVERY_TASK_STATES.FAILED;
  }

  /**
   * 配達タスク状態のスナップショット。
   * @private
   * @returns {Object} スナップショット
   */
  getSnapshot() {
    return {
      sender: { ...this.sender },
      recipient: { ...this.recipient },
      state: this.#state,
    };
  }
}

/**
 * アクター識別オブジェクトを作成。
 * @private
 * @param {Object} actor - アクター情報
 * @returns {Object} 識別オブジェクト
 */
function createActorIdentity(actor) {
  if (!actor || typeof actor.id !== 'string' || typeof actor.name !== 'string') {
    throw new TypeError('Delivery task actors must have an id and name.');
  }

  return {
    id: actor.id,
    name: actor.name,
  };
}

export {
  DELIVERY_TASK_STATES,
  DeliveryTask,
};
