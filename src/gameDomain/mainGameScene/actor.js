import { GameObject } from '../../gameEngine/gameObject.js';
import { findLocation, findLocationByName } from './locations.js';
import { getRandomInt } from '../random.js';

const MIN_MOVEMENT_INTERVAL_HOURS = 3;
const MAX_MOVEMENT_INTERVAL_HOURS = 10;

/**
 * キャラクター移動モード。
 * @public
 */
const ACTOR_MOVEMENT_MODES = Object.freeze({
  AUTOMATIC: 'automatic',
  EXTERNAL: 'external',
});

/**
 * ゲーム上のアクター（キャラクター）。自動移動や位置管理を行う GameObject。
 * @public
 */
class Actor extends GameObject {
  #excludedLocationIds;
  #movementMode;
  #nextMoveTimeHours;

  /**
   * アクターをインスタンス化する。
   * @public
   * @param {string} id - アクター ID
   * @param {string} name - アクター名
   * @param {string} locationId - 初期位置 ID
   * @param {Object} [config={}] - 設定オブジェクト
   * @param {Array<string>} [config.excludedLocationIds=[]] - 移動禁止位置 ID 配列
   */
  constructor(id, name, locationId, { excludedLocationIds = [] } = {}) {
    super();
    this.id = id;
    this.name = name;
    this.locationId = locationId;
    this.#excludedLocationIds = new Set(excludedLocationIds);
    this.#movementMode = ACTOR_MOVEMENT_MODES.AUTOMATIC;
    this.#nextMoveTimeHours = this.#createNextMoveTime(0);
  }

  /**
   * 毎フレーム更新。自動移動を処理。
   * @public
   * @param {Object} context - 更新コンテキスト
   * @returns {void}
   */
  update(context) {
    this.#updateAutomaticMovement(context);
  }

  #updateAutomaticMovement({ gameTimeHours }) {
    if (this.#movementMode !== ACTOR_MOVEMENT_MODES.AUTOMATIC) {
      return;
    }

    if (typeof gameTimeHours !== 'number') {
      return;
    }

    if (gameTimeHours < this.#nextMoveTimeHours) {
      return;
    }

    this.#moveToRandomDestination();
    this.#advanceNextMoveTime(gameTimeHours);
  }

  /**
   * 次移動時刻をリセット。
   * @public
   * @param {number} currentGameTimeHours - 現在ゲーム時刻
   * @returns {void}
   */
  resetNextMoveTime(currentGameTimeHours) {
    this.#nextMoveTimeHours = this.#createNextMoveTime(currentGameTimeHours);
  }

  /**
   * 指定位置にアクターを移動。
   * @public
   * @param {string} locationId - 移動先位置 ID
   * @returns {void}
   */
  moveToLocation(locationId) {
    this.locationId = locationId;
  }

  /**
   * 移動モードを設定。
   * @public
   * @param {string} movementMode - 移動モード
   * @returns {boolean} 設定成功の可否
   */
  setMovementMode(movementMode) {
    if (!Object.values(ACTOR_MOVEMENT_MODES).includes(movementMode)) {
      return false;
    }

    this.#movementMode = movementMode;
    return true;
  }

  /**
   * アクター状態のスナップショット。
   * @public
   * @returns {Object} スナップショット
   */
  getSnapshot() {
    return {
      id: this.id,
      name: this.name,
      location: findLocation(this.locationId),
    };
  }

  #advanceNextMoveTime(currentGameTimeHours) {
    this.#nextMoveTimeHours = this.#createNextMoveTime(currentGameTimeHours);
  }

  #createNextMoveTime(baseGameTimeHours) {
    return baseGameTimeHours + getRandomInt(
      MIN_MOVEMENT_INTERVAL_HOURS,
      MAX_MOVEMENT_INTERVAL_HOURS,
    );
  }

  #moveToRandomDestination() {
    const currentLocation = findLocation(this.locationId);
    if (!currentLocation) {
      return false;
    }

    const destinationLocations = [
      currentLocation,
      ...currentLocation.destinations
        .map(destinationName => findLocationByName(destinationName))
        .filter(destinationLocation => (
          destinationLocation !== null
          && !this.#excludedLocationIds.has(destinationLocation.id)
        )),
    ];
    const randomIndex = getRandomInt(0, destinationLocations.length - 1);
    this.locationId = destinationLocations[randomIndex].id;
    return true;
  }

  getSnapshot() {
    return {
      id: this.id,
      name: this.name,
      location: findLocation(this.locationId),
    };
  }
}

export {
  ACTOR_MOVEMENT_MODES,
  Actor,
};
