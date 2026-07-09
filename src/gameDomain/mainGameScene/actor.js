import { GameObject } from '../../gameEngine/gameObject.js';
import { findLocation } from './locations.js';
import { getRandomInt } from '../random.js';
import {
  advanceMovement,
  createMovement,
  createMovementSnapshot,
} from './mapMovement.js';
import {
  getDefaultGridMap,
  getDefaultMovementSpeedCellsPerSecond,
} from './gridMap.js';

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
  #movement;
  #randomInt;

  /**
   * アクターをインスタンス化する。
   * @public
   * @param {string} id - アクター ID
   * @param {string} name - アクター名
   * @param {string} locationId - 初期位置 ID
   * @param {Object} [config={}] - 設定オブジェクト
   * @param {Array<string>} [config.excludedLocationIds=[]] - 移動禁止位置 ID 配列
   * @param {Function} [config.randomInt] - 乱数生成関数
   */
  constructor(
    id,
    name,
    locationId,
    { excludedLocationIds = [], randomInt = getRandomInt } = {},
  ) {
    super();
    this.id = id;
    this.name = name;
    this.locationId = locationId;
    this.position = getDefaultGridMap().getLocationSpawnPosition(locationId);
    this.#excludedLocationIds = new Set(excludedLocationIds);
    this.#randomInt = randomInt;
    this.#movementMode = ACTOR_MOVEMENT_MODES.AUTOMATIC;
    this.#nextMoveTimeHours = this.#createNextMoveTime(0);
    this.#movement = null;
  }

  /**
   * 毎フレーム更新。自動移動を処理。
   * @public
   * @param {Object} context - 更新コンテキスト
   * @returns {void}
   */
  update(context) {
    const hadMovement = this.#movement !== null;
    this.#advanceMovement(context);
    if (hadMovement) {
      return;
    }

    this.#updateAutomaticMovement(context);
  }

  /**
   * 現在の移動状態を進める。
   * @private
   * @param {Object} context - 更新コンテキスト。
   * @returns {void}
   */
  #advanceMovement(context) {
    const result = advanceMovement({
      position: this.position,
      locationId: this.locationId,
      movement: this.#movement,
      deltaTimeMs: context.deltaTimeMs,
      gridMap: context.gridMap ?? getDefaultGridMap(),
    });

    this.position = result.position;
    this.locationId = result.locationId;
    this.#movement = result.movement;
  }

  /**
   * 自動移動モードのアクター移動を更新する。
   * @private
   * @param {Object} context - 更新コンテキスト。
   * @param {number} context.gameTimeHours - 現在ゲーム内時刻。
   * @param {GridMap} [context.gridMap] - グリッドマップ。
   * @returns {void}
   */
  #updateAutomaticMovement({ gameTimeHours, gridMap = getDefaultGridMap() }) {
    if (this.#movementMode !== ACTOR_MOVEMENT_MODES.AUTOMATIC) {
      return;
    }

    if (typeof gameTimeHours !== 'number') {
      return;
    }

    if (gameTimeHours < this.#nextMoveTimeHours) {
      return;
    }

    this.#moveToRandomDestination(gridMap);
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
   * @returns {boolean} 移動できた場合はtrue。
   */
  moveToLocation(locationId) {
    const position = getDefaultGridMap().getLocationSpawnPosition(locationId);
    if (!findLocation(locationId) || !position) {
      return false;
    }

    this.locationId = locationId;
    this.position = position;
    this.#movement = null;
    return true;
  }

  /**
   * 指定された経路で移動を開始する。
   * @public
   * @param {Array<Object>} waypoints - 目的地までのwaypoint配列。
   * @param {number} [speedCellsPerSecond] - 1秒あたりの移動マス数。
   * @returns {boolean} 移動開始できた場合はtrue。
   */
  startMovement(
    waypoints,
    speedCellsPerSecond = getDefaultMovementSpeedCellsPerSecond(),
  ) {
    const movement = createMovement(waypoints, speedCellsPerSecond);
    if (!movement) {
      return false;
    }

    this.#movement = movement;
    return true;
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
    if (movementMode === ACTOR_MOVEMENT_MODES.EXTERNAL) {
      this.#movement = null;
    }
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
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      movement: createMovementSnapshot(this.#movement),
    };
  }

  /**
   * 次回自動移動時刻を現在時刻基準で進める。
   * @private
   * @param {number} currentGameTimeHours - 現在ゲーム内時刻。
   * @returns {void}
   */
  #advanceNextMoveTime(currentGameTimeHours) {
    this.#nextMoveTimeHours = this.#createNextMoveTime(currentGameTimeHours);
  }

  /**
   * 次回自動移動時刻を作成する。
   * @private
   * @param {number} baseGameTimeHours - 基準ゲーム内時刻。
   * @returns {number} 次回自動移動時刻。
   */
  #createNextMoveTime(baseGameTimeHours) {
    return baseGameTimeHours + this.#randomInt(
      MIN_MOVEMENT_INTERVAL_HOURS,
      MAX_MOVEMENT_INTERVAL_HOURS,
    );
  }

  /**
   * 現在地または隣接移動先からランダムな目的地を選んで移動を開始する。
   * @private
   * @param {GridMap} gridMap - 経路探索に使うグリッドマップ。
   * @returns {boolean} 移動先選択または移動開始が成立した場合はtrue。
   */
  #moveToRandomDestination(gridMap) {
    const currentLocation = findLocation(this.locationId);
    if (!currentLocation) {
      return false;
    }

    const destinationLocations = [
      currentLocation,
      ...currentLocation.destinations
        .map(destinationId => findLocation(destinationId))
        .filter(destinationLocation => (
          destinationLocation !== null
          && !this.#excludedLocationIds.has(destinationLocation.id)
        )),
    ];
    const randomIndex = this.#randomInt(0, destinationLocations.length - 1);
    const destinationLocation = destinationLocations[randomIndex];
    if (destinationLocation.id === this.locationId) {
      return true;
    }

    const destinationPosition = this.#createRandomPositionInLocation(
      destinationLocation,
    );
    const path = gridMap.findPath(
      this.position,
      destinationPosition,
    );
    return this.startMovement(path);
  }

  /**
   * 場所内のランダムなセル中心座標を作成する。
   * @private
   * @param {Object} location - 目的地の場所定義。
   * @returns {Object} 場所内のセル中心座標。
   */
  #createRandomPositionInLocation(location) {
    const { x, y, width, height } = location.area;
    return {
      x: x + this.#randomInt(0, width - 1) + 0.5,
      y: y + this.#randomInt(0, height - 1) + 0.5,
    };
  }
}

export {
  ACTOR_MOVEMENT_MODES,
  Actor,
};
