const BRANCH_TASK_STATES = Object.freeze({
  EXECUTING: 'executing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
});

/**
 * 時間制限付きで目的地到達を判定する分岐イベント用タスク。
 *
 * @public
 */
class BranchTask {
  #state;
  #destination;
  #startHours;
  #durationHours;
  #deadlineHours;

  /**
   * 分岐タスクを初期化する。
   *
   * @public
   * @param {Object} config - タスク設定。
   * @param {Object} config.destination - 到達対象の場所。
   * @param {string} config.destination.id - 場所ID。
   * @param {string} config.destination.name - 場所名。
   * @param {number} config.startHours - タスク開始時刻。
   * @param {number} config.durationHours - 制限時間。
   */
  constructor({ destination, startHours, durationHours }) {
    this.#destination = createIdentity(destination, 'destination');
    this.#startHours = validateHours(startHours, 'startHours');
    this.#durationHours = validateDurationHours(durationHours);
    this.#deadlineHours = this.#startHours + this.#durationHours;
    this.#state = BRANCH_TASK_STATES.EXECUTING;
  }

  /**
   * 指定場所への訪問を処理し、期限内に目的地ならタスクを成功させる。
   *
   * @public
   * @param {string} locationId - 訪問した場所ID。
   * @param {number} currentHours - 現在のゲーム時刻。
   * @returns {boolean} 訪問によって成功した場合はtrue。
   */
  visitLocation(locationId, currentHours) {
    if (this.advanceTo(currentHours)) {
      return false;
    }
    if (
      this.#state !== BRANCH_TASK_STATES.EXECUTING
      || locationId !== this.#destination.id
    ) {
      return false;
    }

    this.#state = BRANCH_TASK_STATES.SUCCEEDED;
    return true;
  }

  /**
   * 指定時刻までタスクを進め、期限到達時は失敗させる。
   *
   * @public
   * @param {number} currentHours - 現在のゲーム時刻。
   * @returns {boolean} 期限到達によって失敗した場合はtrue。
   */
  advanceTo(currentHours) {
    const checkedCurrentHours = validateHours(currentHours, 'currentHours');
    if (
      this.#state !== BRANCH_TASK_STATES.EXECUTING
      || checkedCurrentHours < this.#deadlineHours
    ) {
      return false;
    }

    this.#state = BRANCH_TASK_STATES.FAILED;
    return true;
  }

  /**
   * タスクが実行中かどうかを返す。
   *
   * @public
   * @returns {boolean} 実行中の場合はtrue。
   */
  isExecuting() {
    return this.#state === BRANCH_TASK_STATES.EXECUTING;
  }

  /**
   * タスクが成功済みかどうかを返す。
   *
   * @public
   * @returns {boolean} 成功済みの場合はtrue。
   */
  isSucceeded() {
    return this.#state === BRANCH_TASK_STATES.SUCCEEDED;
  }

  /**
   * タスクが失敗済みかどうかを返す。
   *
   * @public
   * @returns {boolean} 失敗済みの場合はtrue。
   */
  isFailed() {
    return this.#state === BRANCH_TASK_STATES.FAILED;
  }

  /**
   * rendererやイベント管理向けのタスク状態snapshotを返す。
   *
   * @public
   * @param {number} [currentHours] - 残り時間算出に使う現在のゲーム時刻。
   * @returns {Object} タスク状態snapshot。
   */
  getSnapshot(currentHours = this.#startHours) {
    const checkedCurrentHours = validateHours(currentHours, 'currentHours');
    return {
      destination: { ...this.#destination },
      state: this.#state,
      startHours: this.#startHours,
      durationHours: this.#durationHours,
      deadlineHours: this.#deadlineHours,
      remainingHours: Math.max(0, this.#deadlineHours - checkedCurrentHours),
    };
  }
}

/**
 * IDと名前だけを持つ識別用オブジェクトを作成する。
 *
 * @private
 * @param {Object} value - 識別対象の値。
 * @param {string} value.id - 識別ID。
 * @param {string} value.name - 表示名。
 * @param {string} label - エラーメッセージに使う対象名。
 * @returns {Object} コピー済みの識別用オブジェクト。
 */
function createIdentity(value, label) {
  if (!value || typeof value.id !== 'string' || typeof value.name !== 'string') {
    throw new TypeError(`Branch task ${label} must have an id and name.`);
  }

  return {
    id: value.id,
    name: value.name,
  };
}

/**
 * ゲーム時刻として有効な非負数を検証する。
 *
 * @private
 * @param {number} value - 検証対象の時刻。
 * @param {string} label - エラーメッセージに使う項目名。
 * @returns {number} 検証済みの時刻。
 */
function validateHours(value, label) {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`Branch task ${label} must be a non-negative number.`);
  }

  return value;
}

/**
 * 制限時間として有効な正数を検証する。
 *
 * @private
 * @param {number} value - 検証対象の制限時間。
 * @returns {number} 検証済みの制限時間。
 */
function validateDurationHours(value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError('Branch task durationHours must be greater than zero.');
  }

  return value;
}

export {
  BRANCH_TASK_STATES,
  BranchTask,
};
