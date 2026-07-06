import { GameObject } from '../../gameEngine/gameObject.js';
import { findLocation } from './locations.js';

/**
 * プレイヤーキャラクター。位置、魔力、マホポイントを管理。
 * 
 * @public
 */
class Character extends GameObject {
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
    this.magicPower = magicPower;
    this.mahoPayPoints = 0;
  }

  /**
   * 毎フレーム更新。魔力を回復。
   * 
   * @public
   * @param {Object} context - 更新コンテキスト
   * @returns {void}
   */
  update(context) {
    this.#recoverMagicPower(context.elapsedGameHours);
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
   * @returns {void}
   */
  moveToLocation(locationId) {
    this.locationId = locationId;
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
