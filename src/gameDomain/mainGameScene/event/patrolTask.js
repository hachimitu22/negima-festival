/**
 * 往訪タスクステート値。
 * @private
 */
const PATROL_TASK_STATES = Object.freeze({
  EXECUTING: 'executing',
  SUCCEEDED: 'succeeded',
});

/**
 * 往訪タスク。複数の位置を訪問して成功を目指す。
 * @private
 */
class PatrolTask {
  #state;
  #destinations;

  constructor({ destinations }) {
    if (!Array.isArray(destinations)) {
      throw new TypeError('Patrol task destinations must be an array.');
    }
    if (destinations.length < 1 || destinations.length > 3) {
      throw new RangeError('Patrol task must have between one and three destinations.');
    }

    const destinationIds = new Set();
    this.#destinations = destinations.map(destination => {
      if (
        !destination
        || typeof destination.id !== 'string'
        || destination.id.length === 0
        || typeof destination.name !== 'string'
        || destination.name.length === 0
      ) {
        throw new TypeError('Patrol task destinations must have an id and name.');
      }
      if (destinationIds.has(destination.id)) {
        throw new Error(`Duplicate patrol destination id: ${destination.id}`);
      }

      destinationIds.add(destination.id);
      return {
        id: destination.id,
        name: destination.name,
        isVisited: false,
      };
    });
    this.#state = PATROL_TASK_STATES.EXECUTING;
  }

  /**
   * 位置訪問を試みる。
   * @private
   * @param {string} locationId - 訪問先位置 ID
   * @returns {boolean} 訪問の成功判定
   */
  visitLocation(locationId) {
    if (this.#state !== PATROL_TASK_STATES.EXECUTING) {
      return false;
    }

    const destination = this.#destinations.find(candidate => (
      candidate.id === locationId
      && !candidate.isVisited
    ));
    if (!destination) {
      return false;
    }

    destination.isVisited = true;
    if (this.#destinations.every(candidate => candidate.isVisited)) {
      this.#state = PATROL_TASK_STATES.SUCCEEDED;
    }
    return true;
  }

  /**
   * タスク実行中かどうかを確認。
   * @private
   * @returns {boolean} 実行中の場合 true
   */
  isExecuting() {
    return this.#state === PATROL_TASK_STATES.EXECUTING;
  }

  /**
   * タスク完了かどうかを確認。
   * @private
   * @returns {boolean} 完了時 true
   */
  isSucceeded() {
    return this.#state === PATROL_TASK_STATES.SUCCEEDED;
  }

  /**
   * タスク状態のスナップショット。
   * @private
   * @returns {Object} スナップショット
   */
  getSnapshot() {
    return {
      state: this.#state,
      destinations: this.#destinations.map(destination => ({
        ...destination,
      })),
    };
  }
}

export {
  PATROL_TASK_STATES,
  PatrolTask,
};
