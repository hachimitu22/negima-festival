/** ゲーム内の単一責務を所有するSystemの基底クラス。 */
class GameSystem {
  /**
   * @param {string} systemId - Scene内で一意なSystem ID。
   */
  constructor(systemId) {
    if (!systemId) {
      throw new TypeError('systemId is required.');
    }
    this.systemId = systemId;
  }

  /**
   * 全System登録後に依存Systemを解決する。
   * @param {Object} dependencies - 依存解決API。
   * @param {Function} dependencies.requireSystem - System取得関数。
   * @returns {void}
   */
  attach(context) {
  }

  /**
   * Systemを更新する。
   * @param {Object} context - フレームコンテキスト。
   * @returns {void}
   */
  update(context) {
  }

  /**
   * Systemを更新後に呼ばれる。Systemが保持する状態をクリアする。
   * @param {Object} context - フレームコンテキスト。
   * @returns {void}
   */
  cleanup(context) {
  }
}

export default GameSystem;
