import {
  DELIVERY_CONVERSATION_SCENE_SCRIPT_CHOICE_IDS,
  createDeliveryCompleteConversationSceneScript,
  createDeliveryReconfirmConversationSceneScript,
  createDeliveryRequestConversationSceneScript,
} from './deliveryConversationSceneScripts.js';
import { DeliveryTask } from './deliveryTask.js';

const DELIVERY_INTERACTION_KINDS = Object.freeze({
  REQUEST: 'request',
  RECONFIRM: 'reconfirm',
  COMPLETE: 'complete',
});

class DeliveryEvent {
  #id;
  #task;

  /**
   * 配達イベントを初期化。
   * @public
   * @param {number} id - イベント ID
   * @param {Object} config - 設定オブジェクト
   * @param {Object} config.sender - 送信者
   * @param {Object} config.recipient - 受取人
   */
  constructor(id, { sender, recipient }) {
    this.#id = id;
    this.#task = new DeliveryTask({ sender, recipient });
  }

  /**
   * 配達スクリプトを要求。
   * @public
   * @returns {Object} 会話シーン一式
   */
  createRequestInteraction() {
    return {
      kind: DELIVERY_INTERACTION_KINDS.REQUEST,
      conversationSceneScript: createDeliveryRequestConversationSceneScript(
        this.#task,
      ),
    };
  }

  /**
   * アクターとのインタラクションを作成。
   * @private
   * @param {string} actorId - アクター ID
   * @returns {Object|null} インタラクション
   */
  createActorInteraction(actorId) {
    if (!this.#task.isExecuting()) {
      return null;
    }

    if (actorId === this.#task.sender.id) {
      return {
        kind: DELIVERY_INTERACTION_KINDS.RECONFIRM,
        conversationSceneScript: createDeliveryReconfirmConversationSceneScript(
          this.#task,
        ),
      };
    }

    if (actorId === this.#task.recipient.id) {
      return {
        kind: DELIVERY_INTERACTION_KINDS.COMPLETE,
        conversationSceneScript: createDeliveryCompleteConversationSceneScript(
          this.#task,
        ),
      };
    }

    return null;
  }

  /**
   * インタラクションを完了。
   * @private
   * @param {string} kind - インタラクション種別
   * @param {Object} [conversationSceneResult={}] - 会話結果
   * @returns {boolean} 処理成功の可否
   */
  completeInteraction(kind, conversationSceneResult = {}) {
    if (kind === DELIVERY_INTERACTION_KINDS.REQUEST) {
      return this.#task.accept();
    }

    if (kind === DELIVERY_INTERACTION_KINDS.COMPLETE) {
      return this.#task.complete();
    }

    if (
      kind === DELIVERY_INTERACTION_KINDS.RECONFIRM
      && conversationSceneResult.choiceId
        === DELIVERY_CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.DECLINE
    ) {
      return this.#task.decline();
    }

    return (
      kind === DELIVERY_INTERACTION_KINDS.RECONFIRM
      && conversationSceneResult.choiceId
        === DELIVERY_CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.CONTINUE
    );
  }

  isExecuting() {
    return this.#task.isExecuting();
  }

  isSucceeded() {
    return this.#task.isSucceeded();
  }

  isFailed() {
    return this.#task.isFailed();
  }

  getParticipantActorIds() {
    return [
      this.#task.sender.id,
      this.#task.recipient.id,
    ];
  }

  /**
   * イベント状態のスナップショット。
   * @private
   * @returns {Object} スナップショット
   */
  getSnapshot() {
    const task = this.#task.getSnapshot();
    return {
      id: this.#id,
      type: 'delivery',
      name: 'お使い',
      description: `${task.sender.name}から${task.recipient.name}への届け物`,
      ...task,
    };
  }
}

export {
  DELIVERY_INTERACTION_KINDS,
  DeliveryEvent,
};
