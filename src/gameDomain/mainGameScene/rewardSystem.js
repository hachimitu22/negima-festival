import { calculateAffectionChange } from './affection.js';
import { Student } from './student.js';

/**
 * 会話やイベントの報酬をゲーム状態へ反映するSystem。
 *
 * @public
 */
class RewardSystem {
  #actorsProvider;
  #character;

  /**
   * RewardSystemを生成する。
   *
   * @public
   * @param {Object} config - 生成設定。
   * @param {Character} config.character - 主人公Character。
   * @param {Function} [config.actorsProvider] - actor配列を返す関数。
   */
  constructor({
    character,
    actorsProvider = () => [],
  }) {
    if (!character) {
      throw new TypeError('character is required.');
    }

    this.#character = character;
    this.#actorsProvider = actorsProvider;
  }

  /**
   * 会話結果から生徒の好感度を反映する。
   *
   * @public
   * @param {string} actorId - actor ID。
   * @param {Object} conversationResult - 会話結果。
   * @returns {boolean} 報酬を反映した場合はtrue。
   */
  applyConversationResult(actorId, conversationResult) {
    const student = this.#findStudent(actorId);
    if (!student) {
      return false;
    }

    const baseChange = student.getBaseConversationSceneAffectionChange(
      conversationResult,
    );
    return this.applyAffection(actorId, baseChange);
  }

  /**
   * 基礎好感度変化量を生徒へ反映する。
   *
   * @public
   * @param {string} actorId - actor ID。
   * @param {number} baseChange - 基礎好感度変化量。
   * @returns {boolean} 報酬を反映した場合はtrue。
   */
  applyAffection(actorId, baseChange) {
    const student = this.#findStudent(actorId);
    if (!student) {
      return false;
    }

    const affectionChange = calculateAffectionChange({ baseChange });
    student.changeAffection(affectionChange);
    return true;
  }

  /**
   * MahoPayポイントを主人公へ加算する。
   *
   * @public
   * @param {number} points - 加算ポイント。
   * @returns {boolean} 報酬を反映した場合はtrue。
   */
  addMahoPayPoints(points) {
    this.#character.addMahoPayPoints(points);
    return true;
  }

  #findStudent(actorId) {
    const actors = this.#actorsProvider();
    if (!Array.isArray(actors)) {
      return null;
    }

    const actor = actors.find(candidate => candidate.id === actorId);
    return actor instanceof Student ? actor : null;
  }
}

export {
  RewardSystem,
};
