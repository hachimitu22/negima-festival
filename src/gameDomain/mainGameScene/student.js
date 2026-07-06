import { Actor } from './actor.js';
import {
  CONVERSATION_SCENE_SCRIPT_CHOICE_IDS,
  CONVERSATION_SCENE_SCRIPT_IDS,
} from '../conversationScene/conversationSceneScriptIds.js';

/**
 * 親密度の最小値。
 * @public
 */
const MIN_AFFECTION = -100;
/**
 * 親密度の最大値。
 * @public
 */
const MAX_AFFECTION = 100;

/**
 * 会話シーンデフォルト親密度変化値。
 * @public
 */
const DEFAULT_CONVERSATION_SCENE_AFFECTION_CHANGE = 5;
/**
 * 会話シーンスクリプト別の親密度変化値。
 * @public
 */
const CONVERSATION_SCENE_AFFECTION_CHANGES = Object.freeze({
  [CONVERSATION_SCENE_SCRIPT_IDS.EFFORT_FEEDBACK]: Object.freeze({
    [CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.EFFORT_FEEDBACK.WORKED_VERY_HARD]: 10,
    [CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.EFFORT_FEEDBACK.AS_USUAL]: 0,
    [CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.EFFORT_FEEDBACK.NEEDS_MORE_EFFORT]: -5,
  }),
});

/**
 * 学生キャラクター（Actor を継承）。親密度とクラス番号を管理。
 * @public
 */
class Student extends Actor {
  #classAndNumber;
  #affection;

  /**
   * 学生をインスタンス化する。
   * @public
   * @param {string} name - 学生名
   * @param {number} classAndNumber - クラス番号
   * @param {string} locationId - 初期位置 ID
   * @param {number} [affection=0] - 初期親密度
   */
  constructor(name, classAndNumber, locationId, affection = 0) {
    super(createStudentId(classAndNumber), name, locationId);
    this.#classAndNumber = classAndNumber;
    this.#setAffection(affection);
  }

  /**
   * 会話シーン結果から基本親密度変化値を取得。
   * @public
   * @param {Object} conversationSceneResult - 会話シーン結果
   * @returns {number} 親密度変化値
   */
  getBaseConversationSceneAffectionChange(conversationSceneResult) {
    const changes = CONVERSATION_SCENE_AFFECTION_CHANGES[
      conversationSceneResult?.scriptId
    ];
    return changes?.[conversationSceneResult?.choiceId]
      ?? DEFAULT_CONVERSATION_SCENE_AFFECTION_CHANGE;
  }

  /**
   * 親密度を加算。
   * @public
   * @param {number} amount - 変化量
   * @returns {void}
   */
  changeAffection(amount) {
    this.#setAffection(this.#affection + amount);
  }

  /**
   * 学生状態のスナップショット。
   * @public
   * @returns {Object} スナップショット
   */
  getSnapshot() {
    return {
      ...super.getSnapshot(),
      classAndNumber: this.#classAndNumber,
      affection: this.#affection,
    };
  }

  #setAffection(value) {
    this.#affection = Math.min(MAX_AFFECTION, Math.max(MIN_AFFECTION, value));
  }
}

function createStudentId(classAndNumber) {
  return `student-${String(classAndNumber).padStart(2, '0')}`;
}

export {
  Student,
};
