import { Actor } from './actor.js';

/**
 * 先生キャラクター（Actor を継承）。
 * @public
 */
class Teacher extends Actor {
  /**
   * 先生をインスタンス化する。
   * @public
   * @param {string} id - キャラクター ID
   * @param {string} name - 先生名
   * @param {string} locationId - 初期位置 ID
   * @param {Object} [options={}] - 追加オプション
   */
  constructor(id, name, locationId, options = {}) {
    super(id, name, locationId, options);
  }
}

export {
  Teacher,
};
