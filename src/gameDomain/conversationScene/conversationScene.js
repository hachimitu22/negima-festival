import { INPUT_TYPES, SCENE_IDS, TARGET_PREFIXES } from '../actions.js';
import {
  CONVERSATION_SCENE_SESSION_RESULTS,
  ConversationSceneSession,
} from './conversationSceneSession.js';

/**
 * 会話シーン。ゲームエンジンから呼び出されるシーン（GameObject を継承）。
 * 
 * ユーザー入力を受け取り、会話を進める。会話完了時はシーンスタックからポップされる。
 * 
 * @public
 */
class ConversationScene {
  #session;
  #statusSnapshot;
  #onComplete;
  #result;
  #isCompleted;

  /**
   * 会話シーンをインスタンス化する。
   * 
   * @public
   * @param {Object} config - 設定オブジェクト
   * @param {Object} config.script - 会話スクリプト（id, messages, choice を含む）
   * @param {Object} config.statusSnapshot - ステータスUIのスナップショット（会話シーン終了後に共有）
   * @param {Function} [config.onComplete] - 会話完了時のコールバック関数
   * 
   * @example
   * const scene = new ConversationScene({
   *   script: conversationScript,
   *   statusSnapshot: { UI状態 },
   *   onComplete: (result) => console.log('会話完了:', result)
   * });
   */
  constructor({ script, statusSnapshot, onComplete }) {
    this.#session = new ConversationSceneSession(script);
    this.#statusSnapshot = statusSnapshot;
    this.#onComplete = onComplete;
    this.#result = {
      scriptId: script.id,
      choiceId: null,
    };
    this.#isCompleted = false;
  }

  /**
   * ゲームエンジンから毎フレーム呼び出される。入力を処理して会話を進める。
   * 
   * @public
   * @param {Object} options - 更新オプション
   * @param {Object} options.context - 更新コンテキスト（inputs を含む）
   * @param {Array<Object>} options.context.inputs - 現フレームの入力イベント配列
   * @param {Object} options.sceneControl - シーン制御オブジェクト
   * @param {Function} options.sceneControl.popScene - 現シーンをスタックからポップ
   * @returns {void}
   */
  update({
    context,
    sceneControl: { popScene },
  }) {
    const inputs = context.inputs ?? [];

    for (const input of inputs) {
      if (this.#processInput(input, popScene)) {
        break;
      }
    }
  }

  /**
   * 入力イベントを処理する。
   * 
   * @private
   * @param {Object} input - 入力イベント
   * @param {Function} popScene - シーンをポップする関数
   * @returns {boolean} 処理済み（true）/ スキップ（false）
   */
  #processInput(input, popScene) {
    if (input.type !== INPUT_TYPES.TARGET_ACTIVATE) {
      return false;
    }

    const action = getTargetValue(
      input.targetId,
      TARGET_PREFIXES.CONVERSATION_SCENE,
    );
    if (!action) {
      return false;
    }

    return this.#handleConversationAction(action, popScene);
  }

  /**
   * 会話アクション（選択肢選択・次進行）を処理する。
   * 
   * @private
   * @param {string} action - アクション識別子
   * @param {Function} popScene - シーンをポップする関数
   * @returns {boolean} 処理済み（true）/ スキップ（false）
   */
  #handleConversationAction(action, popScene) {
    const choiceId = getTargetValue(action, 'choice');
    if (choiceId) {
      const result = this.#session.selectChoice(choiceId);
      if (result) {
        this.#result = result;
      }
      return false;
    }

    if (action !== 'next') {
      return false;
    }

    const result = this.#session.next();
    if (
      result !== CONVERSATION_SCENE_SESSION_RESULTS.COMPLETED
      || this.#isCompleted
    ) {
      return false;
    }

    this.#isCompleted = true;
    if (typeof this.#onComplete === 'function') {
      this.#onComplete(this.#result);
    }
    if (typeof popScene === 'function') {
      popScene();
    }
    return true;
  }

  /**
   * ゲーム状態のスナップショットを作成する。ビューレンダラーがこれを描画。
   * 
   * @public
   * @returns {Object} 会話シーン用スナップショット（sceneId, conversation を含む）
   */
  createSnapshot() {
    return {
      ...this.#statusSnapshot,
      sceneId: SCENE_IDS.CONVERSATION,
      conversation: this.#session.getSnapshot(),
    };
  }
}

/**
 * ターゲットIDからプレフィックス以降の値を抽出する。
 * 
 * @private
 * @param {string} targetId - ターゲットID（例: 'conversation:next'、'choice:worked-very-hard'）
 * @param {string} prefix - プレフィックス（例: 'conversation'、'choice'）
 * @returns {string|null} プレフィックス以降の値。形式が不正な場合は null
 */
function getTargetValue(targetId, prefix) {
  const expectedPrefix = `${prefix}:`;
  if (typeof targetId !== 'string' || !targetId.startsWith(expectedPrefix)) {
    return null;
  }

  return targetId.slice(expectedPrefix.length);
}

export {
  ConversationScene,
};
