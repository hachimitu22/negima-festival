import {
  BRANCH_TASK_STATES,
  BranchTask,
} from './branchTask.js';

const BRANCH_EVENT_STATES = Object.freeze({
  EXECUTING: 'executing',
  COMPLETED: 'completed',
});

const BRANCH_EVENT_TYPE = 'branch';
const BRANCH_EVENT_NAME = 'Branch task';

/**
 * 成功または失敗に応じて次のタスクへ進む分岐イベント。
 *
 * @public
 */
class BranchEvent {
  #id;
  #type;
  #name;
  #taskDefinitions;
  #currentTaskId;
  #currentTask;
  #state;
  #completedTaskCount;
  #stepCount;
  #lastResult;

  /**
   * 分岐イベントを初期化する。
   *
   * @public
   * @param {number} id - イベントID。
   * @param {Object} config - イベント設定。
   * @param {Array<Object>} config.tasks - 分岐タスク定義の配列。
   * @param {string} config.startTaskId - 開始タスクID。
   * @param {number} config.startHours - イベント開始時刻。
   * @param {string} [config.type] - snapshotに公開するイベント種別。
   * @param {string} [config.name] - snapshotに公開するイベント名。
   */
  constructor(id, {
    tasks,
    startTaskId,
    startHours,
    type = BRANCH_EVENT_TYPE,
    name = BRANCH_EVENT_NAME,
  }) {
    this.#id = id;
    this.#type = validateEventLabel(type, 'type');
    this.#name = validateEventLabel(name, 'name');
    this.#taskDefinitions = createTaskDefinitions(tasks);
    validateBranchReferences(this.#taskDefinitions);
    if (!this.#taskDefinitions.has(startTaskId)) {
      throw new Error(`Unknown branch start task id: ${startTaskId}`);
    }

    this.#currentTaskId = startTaskId;
    this.#currentTask = this.#createTask(startTaskId, startHours);
    this.#state = BRANCH_EVENT_STATES.EXECUTING;
    this.#completedTaskCount = 0;
    this.#stepCount = countReachableSteps(
      startTaskId,
      this.#taskDefinitions,
      new Set(),
    );
    this.#lastResult = null;
  }

  /**
   * 現在タスクへ場所訪問を通知し、成功時は成功分岐へ進める。
   *
   * @public
   * @param {string} locationId - 訪問した場所ID。
   * @param {number} currentHours - 現在のゲーム時刻。
   * @returns {boolean} 訪問によって分岐が進んだ場合はtrue。
   */
  visitLocation(locationId, currentHours) {
    if (!this.isExecuting()) {
      return false;
    }

    const didVisit = this.#currentTask.visitLocation(locationId, currentHours);
    if (!didVisit) {
      return false;
    }

    this.#advanceFromResolvedTask(BRANCH_TASK_STATES.SUCCEEDED, currentHours);
    return true;
  }

  /**
   * 現在タスクへ時間経過を通知し、期限切れ時は失敗分岐へ進める。
   *
   * @public
   * @param {number} currentHours - 現在のゲーム時刻。
   * @returns {boolean} 期限切れによって分岐が進んだ場合はtrue。
   */
  advanceTo(currentHours) {
    if (!this.isExecuting()) {
      return false;
    }

    const didFail = this.#currentTask.advanceTo(currentHours);
    if (!didFail) {
      return false;
    }

    this.#advanceFromResolvedTask(BRANCH_TASK_STATES.FAILED, currentHours);
    return true;
  }

  /**
   * イベントが実行中かどうかを返す。
   *
   * @public
   * @returns {boolean} 実行中の場合はtrue。
   */
  isExecuting() {
    return this.#state === BRANCH_EVENT_STATES.EXECUTING;
  }

  /**
   * イベントの分岐チェーンが完了済みかどうかを返す。
   *
   * @public
   * @returns {boolean} 完了済みの場合はtrue。
   */
  isCompleted() {
    return this.#state === BRANCH_EVENT_STATES.COMPLETED;
  }

  /**
   * rendererやイベント管理向けのイベント状態snapshotを返す。
   *
   * @public
   * @param {number} currentHours - 残り時間算出に使う現在のゲーム時刻。
   * @returns {Object} イベント状態snapshot。
   */
  getSnapshot(currentHours) {
    const currentTaskSnapshot = this.#currentTask
      ? createCurrentTaskSnapshot(
        this.#currentTaskId,
        this.#getCurrentTaskDefinition(),
        this.#currentTask.getSnapshot(currentHours),
      )
      : null;

    return {
      id: this.#id,
      type: this.#type,
      name: this.#name,
      description: createBranchDescription({
        currentTask: currentTaskSnapshot,
        lastResult: this.#lastResult,
        state: this.#state,
        stepCount: this.#stepCount,
        stepIndex: this.#completedTaskCount,
      }),
      state: this.#state,
      stepIndex: this.#completedTaskCount,
      stepCount: this.#stepCount,
      currentTask: currentTaskSnapshot,
      lastResult: this.#lastResult ? { ...this.#lastResult } : null,
    };
  }

  /**
   * 解決済みタスクの結果から次タスクまたはイベント完了へ遷移する。
   *
   * @private
   * @param {string} result - 解決結果。成功または失敗。
   * @param {number} currentHours - 次タスクの開始時刻。
   * @returns {void}
   */
  #advanceFromResolvedTask(result, currentHours) {
    const completedTaskId = this.#currentTaskId;
    const currentDefinition = this.#getCurrentTaskDefinition();
    const nextTaskId = currentDefinition.branches[result] ?? null;

    this.#completedTaskCount += 1;
    this.#lastResult = {
      taskId: completedTaskId,
      result,
    };

    if (nextTaskId) {
      this.#currentTaskId = nextTaskId;
      this.#currentTask = this.#createTask(nextTaskId, currentHours);
      return;
    }

    this.#currentTaskId = null;
    this.#currentTask = null;
    this.#state = BRANCH_EVENT_STATES.COMPLETED;
  }

  /**
   * タスク定義から実行用のBranchTaskを生成する。
   *
   * @private
   * @param {string} taskId - 生成対象のタスクID。
   * @param {number} startHours - タスク開始時刻。
   * @returns {BranchTask} 実行用タスク。
   */
  #createTask(taskId, startHours) {
    const definition = this.#taskDefinitions.get(taskId);
    return new BranchTask({
      destination: definition.destination,
      durationHours: definition.durationHours,
      startHours,
    });
  }

  /**
   * 現在タスクの定義を返す。
   *
   * @private
   * @returns {Object|null} 現在タスク定義。未実行時はnull。
   */
  #getCurrentTaskDefinition() {
    return this.#taskDefinitions.get(this.#currentTaskId) ?? null;
  }
}

/**
 * snapshotへ公開するイベント種別やイベント名を検証する。
 *
 * @private
 * @param {string} value - 検証対象のラベル値。
 * @param {string} label - エラーメッセージに使う項目名。
 * @returns {string} 検証済みのラベル値。
 */
function validateEventLabel(value, label) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`Branch event ${label} must be a non-empty string.`);
  }

  return value;
}

/**
 * タスク定義配列をID検索用のMapへ変換する。
 *
 * @private
 * @param {Array<Object>} tasks - 分岐イベントのタスク定義配列。
 * @returns {Map<string, Object>} タスクIDをキーにしたタスク定義Map。
 */
function createTaskDefinitions(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new TypeError('Branch event tasks must be a non-empty array.');
  }

  const definitions = new Map();
  tasks.forEach(task => {
    const definition = createTaskDefinition(task);
    if (definitions.has(definition.id)) {
      throw new Error(`Duplicate branch task id: ${definition.id}`);
    }
    definitions.set(definition.id, definition);
  });
  return definitions;
}

/**
 * 外部から渡されたタスク定義を検証し、内部保持用の定義へ変換する。
 *
 * @private
 * @param {Object} task - 分岐タスク定義。
 * @returns {Object} 検証済みの分岐タスク定義。
 */
function createTaskDefinition(task) {
  if (!task || typeof task.id !== 'string' || task.id.length === 0) {
    throw new TypeError('Branch event task must have an id.');
  }
  if (typeof task.title !== 'string' || task.title.length === 0) {
    throw new TypeError('Branch event task must have a title.');
  }
  if (!Number.isFinite(task.durationHours) || task.durationHours <= 0) {
    throw new RangeError('Branch event task durationHours must be greater than zero.');
  }
  if (
    !task.destination
    || typeof task.destination.id !== 'string'
    || typeof task.destination.name !== 'string'
  ) {
    throw new TypeError('Branch event task destination must have an id and name.');
  }

  return {
    id: task.id,
    title: task.title,
    destination: {
      id: task.destination.id,
      name: task.destination.name,
    },
    durationHours: task.durationHours,
    branches: createBranches(task.branches),
  };
}

/**
 * 成功・失敗ごとの分岐先タスクIDを正規化する。
 *
 * @private
 * @param {Object} [branches={}] - 分岐先タスクID定義。
 * @returns {Object} 成功・失敗キーを必ず持つ分岐定義。
 */
function createBranches(branches = {}) {
  const branchConfig = branches ?? {};
  return {
    [BRANCH_TASK_STATES.SUCCEEDED]: normalizeBranchTaskId(
      branchConfig[BRANCH_TASK_STATES.SUCCEEDED],
    ),
    [BRANCH_TASK_STATES.FAILED]: normalizeBranchTaskId(
      branchConfig[BRANCH_TASK_STATES.FAILED],
    ),
  };
}

/**
 * 分岐先タスクIDを検証し、省略値をnullへ正規化する。
 *
 * @private
 * @param {string|null|undefined} taskId - 分岐先タスクID。
 * @returns {string|null} 正規化済みの分岐先タスクID。
 */
function normalizeBranchTaskId(taskId) {
  if (taskId === undefined || taskId === null) {
    return null;
  }
  if (typeof taskId !== 'string' || taskId.length === 0) {
    throw new TypeError('Branch task references must be non-empty strings.');
  }

  return taskId;
}

/**
 * 全タスク定義の分岐先が存在するタスクIDを参照しているか検証する。
 *
 * @private
 * @param {Map<string, Object>} taskDefinitions - 検証対象のタスク定義Map。
 * @returns {void}
 */
function validateBranchReferences(taskDefinitions) {
  taskDefinitions.forEach(definition => {
    Object.values(definition.branches).forEach(taskId => {
      if (taskId && !taskDefinitions.has(taskId)) {
        throw new Error(`Unknown branch task id: ${taskId}`);
      }
    });
  });
}

/**
 * 指定タスクから到達可能な最大ステップ数を数える。
 *
 * @private
 * @param {string} taskId - 起点となるタスクID。
 * @param {Map<string, Object>} taskDefinitions - タスク定義Map。
 * @param {Set<string>} path - 循環検出用の訪問済みタスクID。
 * @returns {number} 到達可能な最大ステップ数。
 */
function countReachableSteps(taskId, taskDefinitions, path) {
  if (path.has(taskId)) {
    throw new Error(`Branch task cycle detected at: ${taskId}`);
  }

  const definition = taskDefinitions.get(taskId);
  if (!definition) {
    return 0;
  }

  const nextPath = new Set(path);
  nextPath.add(taskId);
  const childCounts = Object.values(definition.branches)
    .filter(Boolean)
    .map(nextTaskId => countReachableSteps(
      nextTaskId,
      taskDefinitions,
      nextPath,
    ));
  return 1 + Math.max(0, ...childCounts);
}

/**
 * 現在タスクの公開snapshotを作成する。
 *
 * @private
 * @param {string} taskId - 現在タスクID。
 * @param {Object} definition - 現在タスク定義。
 * @param {Object} taskSnapshot - BranchTaskが返したsnapshot。
 * @returns {Object} イベントsnapshotへ埋め込む現在タスクsnapshot。
 */
function createCurrentTaskSnapshot(taskId, definition, taskSnapshot) {
  return {
    id: taskId,
    title: definition.title,
    ...taskSnapshot,
  };
}

/**
 * 実行中イベント一覧へ表示する分岐イベントの説明文を作成する。
 *
 * @private
 * @param {Object} context - 説明文作成に使う状態。
 * @param {Object|null} context.currentTask - 現在タスクsnapshot。
 * @param {Object|null} context.lastResult - 直前に解決したタスク結果。
 * @param {string} context.state - イベント状態。
 * @param {number} context.stepCount - 最大ステップ数。
 * @param {number} context.stepIndex - 完了済みステップ数。
 * @returns {string} 実行中イベント一覧向けの説明文。
 */
function createBranchDescription({
  currentTask,
  lastResult,
  state,
  stepCount,
  stepIndex,
}) {
  const lastResultDescription = lastResult
    ? ` Last result: ${lastResult.result}.`
    : '';
  if (state === BRANCH_EVENT_STATES.COMPLETED || !currentTask) {
    return `Chain completed after ${stepIndex}/${stepCount} step(s).${lastResultDescription}`;
  }

  const stepNumber = stepIndex + 1;
  return [
    `Step ${stepNumber}/${stepCount}: ${currentTask.title}.`,
    `Go to ${currentTask.destination.name}`,
    `before ${formatHours(currentTask.deadlineHours)}h`,
    `(${formatHours(currentTask.remainingHours)}h left).`,
    lastResultDescription.trimStart(),
  ]
    .filter(Boolean)
    .join(' ');
}

/**
 * ゲーム時刻を短い表示用文字列へ整形する。
 *
 * @private
 * @param {number} hours - 表示対象のゲーム時刻。
 * @returns {string} 整形済み時刻。
 */
function formatHours(hours) {
  return Number.isInteger(hours)
    ? String(hours)
    : hours.toFixed(1);
}

export {
  BRANCH_EVENT_STATES,
  BranchEvent,
};
