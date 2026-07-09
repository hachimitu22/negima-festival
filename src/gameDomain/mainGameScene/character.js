import { GameObject } from '../../gameEngine/gameObject.js';
import { findLocation } from './locations.js';
import {
  advanceMovement,
  createMovement,
  createMovementSnapshot,
} from './mapMovement.js';
import {
  getDefaultGridMap,
  getDefaultMovementSpeedCellsPerSecond,
} from './gridMap.js';

/**
 * プレイヤーキャラクター。位置、魔力、マホポイントを管理。
 * 
 * @public
 */
class Character extends GameObject {
  #movement;
  #visitedLocationIds;

  /**
   * キャラクターをインスタンス化する。
   * 
   * @public
   * @param {string} locationId - 初期位置
   * @param {Object} config - 設定オブジェクト
   * @param {Object} config.magicPower - 魔力設定
   */
  constructor(locationId, { magicPower }) {
    super();
    this.locationId = locationId;
    this.position = getDefaultGridMap().getLocationSpawnPosition(locationId);
    this.magicPower = magicPower;
    this.mahoPayPoints = 0;
    this.#movement = null;
    this.#visitedLocationIds = [];
  }

  /**
   * 毎フレーム更新。魔力を回復。
   * 
   * @public
   * @param {Object} context - 更新コンテキスト
   * @returns {void}
   */
  update(context) {
    this.#advanceMovement(context);
    this.#recoverMagicPower(context.elapsedGameHours);
  }

  /**
   * 現在の移動状態を進め、通過した場所IDを記録する。
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
    this.#visitedLocationIds.push(...result.visitedLocationIds);
  }

  #recoverMagicPower(elapsedGameHours) {
    if (elapsedGameHours <= 0) {
      return;
    }

    this.magicPower.current = Math.min(
      this.magicPower.max,
      this.magicPower.current + (elapsedGameHours * this.magicPower.recoveryPerGameHour),
    );
  }

  /**
   * キャラクターを指定位置に移動。
   * 
   * @public
   * @param {string} locationId - 移動先ロケーション ID
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
   *
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
   * 前回取得以降に入った場所IDを返してクリアする。
   *
   * @public
   * @returns {Array<string>} 場所ID配列。
   */
  consumeVisitedLocationIds() {
    const visitedLocationIds = this.#visitedLocationIds;
    this.#visitedLocationIds = [];
    return visitedLocationIds;
  }

  /**
   * マホポイントを加算。
   * 
   * @public
   * @param {number} points - 加算ポイント（非負整数）
   * @returns {void}
   * @throws {TypeError} ポイントが非負整数でない場合
   */
  addMahoPayPoints(points) {
    if (!Number.isInteger(points) || points < 0) {
      throw new TypeError('MahoPay points must be a non-negative integer.');
    }

    this.mahoPayPoints += points;
  }

  /**
   * キャラクター状態のスナップショット。
   * 
   * @public
   * @returns {Object} スナップショット
   */
  getSnapshot() {
    return {
      location: findLocation(this.locationId),
      position: {
        x: this.position.x,
        y: this.position.y,
      },
      movement: createMovementSnapshot(this.#movement),
      magicPower: {
        current: this.magicPower.current,
        max: this.magicPower.max,
        recoveryPerGameHour: this.magicPower.recoveryPerGameHour,
      },
      mahoPayPoints: this.mahoPayPoints,
    };
  }
}

export {
  Character,
};
