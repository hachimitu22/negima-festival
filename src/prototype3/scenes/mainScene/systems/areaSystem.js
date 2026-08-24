import GameSystem from '../../../gameEngine/gameSystem.js';
import SYSTEM_IDS from './systemIds.js';

/** エリア定義する。 */
class AreaSystem extends GameSystem {
  #areas;
  #actorSystem;

  /**
   * @param {Object} options - 初期設定。
   * @param {Array<Object>} options.areas - エリア一覧。
   */
  constructor({ areas }) {
    super(SYSTEM_IDS.AREA);
    this.#areas = new Map(areas.map(area => [area.id, Object.freeze({ ...area })]));
  }

  /**
   * ActorSystemを取得し、各Actorの初期位置を記録する。
   * @param {Object} dependencies - 依存解決API。
   * @param {Function} dependencies.requireSystem - System取得関数。
   * @returns {void}
   */
  attach() {
  }

  /**
   * エリアが存在するか返す。
   * @param {string} areaId - エリアID。
   * @returns {boolean} 存在する場合true。
   */
  hasArea(areaId) {
    return this.#areas.has(areaId);
  }

  getAreaIds() {
    return [...this.#areas.keys()];
  }

  /**
   * エリア一覧をsnapshot形式で返す。
   * @returns {Object} エリア一覧。
   */
  createAreasSnapshot(playerAreaId) {
    const areas = [...this.#areas.values()].map(area => ({ ...area }));
    const moveableAreas = areas.filter(area => area.id !== playerAreaId).map(area => ({ ...area }));

    return Object.freeze({ areas, moveableAreas });
  }
}

export default AreaSystem;
