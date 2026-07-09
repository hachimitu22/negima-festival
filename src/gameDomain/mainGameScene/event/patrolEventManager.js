import { getRandomInt } from '../../random.js';
import { LOCATION_IDS, LOCATIONS } from '../locations.js';
import { PatrolEvent } from './patrolEvent.js';

const PATROL_INTERVAL_HOURS = 12;

/**
 * 往訪イベントを一括管理。時間進行に基づきイベント生成を制徤。
 * @public
 */
class PatrolEventManager {
  #character;
  #eventIdSequence;
  #durationHours;
  #activeEvent;
  #nextPatrolTimeHours;

  /**
   * 往訪イベントマネージャーを初期化。
   * @public
   * @param {Object} config - 設定オブジェクト
   * @param {Character} config.character - プレイヤーキャラクター
   * @param {EventIdSequence} config.eventIdSequence - イベント ID シークエンス
   * @param {number} config.durationHours - 整体イベント時間
   */
  constructor({ character, eventIdSequence, durationHours }) {
    this.#character = character;
    this.#eventIdSequence = eventIdSequence;
    this.#durationHours = durationHours;
    this.#activeEvent = this.#createEvent();
    this.#nextPatrolTimeHours = PATROL_INTERVAL_HOURS;
  }

  /**
   * 往訪イベントを最新時夙まで関数を実行。
   * @public
   * @param {number} currentHours - 現在ゲーム時間
   * @returns {void}
   */
  advanceTo(currentHours) {
    while (
      this.#nextPatrolTimeHours < this.#durationHours
      && this.#nextPatrolTimeHours <= currentHours
    ) {
      if (!this.#activeEvent) {
        this.#activeEvent = this.#createEvent();
      }
      this.#nextPatrolTimeHours += PATROL_INTERVAL_HOURS;
    }
  }

  /**
   * 現在位置を訪問。
   * @public
   * @returns {boolean} 訪問の成功判定
   */
  visitCurrentLocation() {
    return this.visitLocation(this.#character.locationId);
  }

  /**
   * 指定位置を訪問。
   * @public
   * @param {string} locationId - 訪問した場所ID。
   * @returns {boolean} 訪問の成功判定
   */
  visitLocation(locationId) {
    if (!this.#activeEvent) {
      return false;
    }

    const didVisit = this.#activeEvent.visitLocation(
      locationId,
    );
    if (!didVisit || !this.#activeEvent.isSucceeded()) {
      return didVisit;
    }

    const rewardPoints = this.#activeEvent.claimRewardPoints();
    if (rewardPoints !== null) {
      this.#character.addMahoPayPoints(rewardPoints);
    }
    this.#activeEvent = null;
    return true;
  }

  /**
   * 時間を巻き戻してイベントをリセット。
   * @public
   * @param {number} currentHours - 現在ゲーム時刻
   * @returns {void}
   */
  rewindTo(currentHours) {
    this.#activeEvent = null;
    this.#nextPatrolTimeHours = (
      Math.floor(currentHours / PATROL_INTERVAL_HOURS) + 1
    ) * PATROL_INTERVAL_HOURS;
  }

  /**
   * 実行中の往訪イベントを取得。
   * @public
   * @returns {Object|null} イベントスナップショット、実行中のイベントがない場合は null
   */
  getExecutingEventSnapshot() {
    return this.#activeEvent?.getSnapshot() ?? null;
  }

  #createEvent() {
    const excludedLocationIds = new Set([
      this.#character.locationId,
      LOCATION_IDS.GIRLS_BATHROOM,
      LOCATION_IDS.GYM_CHANGING_ROOM,
    ]);
    const candidates = LOCATIONS.filter(location => (
      !excludedLocationIds.has(location.id)
    ));
    const destinationCount = getRandomInt(1, 3);
    const destinations = [];

    while (destinations.length < destinationCount) {
      const candidateIndex = getRandomInt(0, candidates.length - 1);
      destinations.push(candidates.splice(candidateIndex, 1)[0]);
    }

    return new PatrolEvent(this.#eventIdSequence.next(), { destinations });
  }
}

export {
  PatrolEventManager,
};
