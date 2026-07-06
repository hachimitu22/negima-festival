import { PatrolTask } from './patrolTask.js';

const PATROL_REWARD_POINTS_PER_DESTINATION = 100;

class PatrolEvent {
  #id;
  #task;
  #rewardPoints;
  #isRewardClaimed;

  /**
   * 往訪イベントを初期化。
   * @public
   * @param {number} id - イベント ID
   * @param {Object} config - 設定オブジェクト
   * @param {Array<Object>} config.destinations - 訪問先位置配列
   */
  constructor(id, { destinations }) {
    this.#id = id;
    this.#task = new PatrolTask({ destinations });
    this.#rewardPoints = destinations.length * PATROL_REWARD_POINTS_PER_DESTINATION;
    this.#isRewardClaimed = false;
  }

  /**
   * 位置訪問を試みる。
   * @public
   * @param {string} locationId - 訪問先位置 ID
   * @returns {boolean} 訪問の成功判定
   */
  visitLocation(locationId) {
    return this.#task.visitLocation(locationId);
  }

  /**
   * イベント実行中かどうかを確認。
   * @public
   * @returns {boolean} 実行中の場合 true
   */
  isExecuting() {
    return this.#task.isExecuting();
  }

  /**
   * イベント完了かどうかを確認。
   * @public
   * @returns {boolean} 完了時 true
   */
  isSucceeded() {
    return this.#task.isSucceeded();
  }

  /**
   * 报酬ポイントを購布。
   * @public
   * @returns {number|null} 报酬ポイント、未購布時 null
   */
  claimRewardPoints() {
    if (!this.isSucceeded() || this.#isRewardClaimed) {
      return null;
    }

    this.#isRewardClaimed = true;
    return this.#rewardPoints;
  }

  /**
   * イベント状態のスナップショット。
   * @public
   * @returns {Object} スナップショット
   */
  getSnapshot() {
    const task = this.#task.getSnapshot();
    return {
      id: this.#id,
      type: 'patrol',
      name: '見回り',
      description: createPatrolDescription(task.destinations),
      ...task,
      rewardPoints: this.#rewardPoints,
    };
  }
}

function createPatrolDescription(destinations) {
  const destinationDescriptions = destinations.map(destination => (
    `${destination.name}（${destination.isVisited ? '訪問済み' : '未訪問'}）`
  ));
  return `見回り先: ${destinationDescriptions.join('、')}`;
}

export {
  PatrolEvent,
};
