import { GameObject } from '../../../gameEngine/gameObject.js';
import ClockDateTime from '../clockDateTime.js';

/**
 * ゲーム上のアクター（キャラクター）。自動移動や位置管理を行う GameObject。
 * @public
 */
class Actor extends GameObject {
  /**
   * アクターをインスタンス化する。
   * @public
   * @param {string} id - アクター ID
   * @param {string} name - アクター名
   * @param {string} areaId - 初期エリア ID
   */
  constructor({
    id,
    name,
    areaId,
    talks,
    schedules,
  }) {
    super();
    this.id = id;
    this.name = name;
    this.areaId = areaId;
    this.talks = talks || [];
    this.schedules = schedules || [];
  }

  /**
   * 更新処理
   * @public
   * @param {Object} context - 更新コンテキスト
   * @returns {void}
   */
  update({ areas, dateTime }) {
    if (this.schedules.length) {
      // スケジュールの時間帯はエリアを固定化
      const schedule = this.schedules.find(schedule => schedule?.dateTimeRange?.contains(dateTime));
      if (schedule) {
        this.moveTo(schedule.areaId);
        return;
      }
    }

    // ランダム移動
    const index = Math.floor(Math.random() * areas.length);
    const nextAreaId = areas[index];
    if (nextAreaId) {
      this.moveTo(nextAreaId);
    }
  }

  getTalkId() {
    return this.talks?.length && this.talks[0];
  }

  moveTo(areaId) {
    this.areaId = areaId;
  }

  /**
   * アクター状態のスナップショット。
   * @public
   * @returns {Object} スナップショット
   */
  createSnapshot() {
    return {
      id: this.id,
      name: this.name,
      areaId: this.areaId,
      hasTalk: this.talks.length > 0,
    };
  }
}

export default Actor;
