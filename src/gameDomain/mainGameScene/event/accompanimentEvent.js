import {
  createAccompanimentCompleteConversationSceneScript,
  createAccompanimentRequestConversationSceneScript,
} from './accompanimentConversationSceneScripts.js';
import { AccompanimentTask } from './accompanimentTask.js';

const ACCOMPANIMENT_INTERACTION_KINDS = Object.freeze({
  REQUEST: 'request',
  COMPLETE: 'complete',
});

class AccompanimentEvent {
  #id;
  #task;

  /**
   * 同伴イベントを初期化。
   * @public
   * @param {number} id - イベント ID
   * @param {Object} config - 設定オブジェクト
   * @param {Object} config.companion - 同伴キャラクター
   * @param {Object} config.destination - 目的地
   */
  constructor(id, { companion, destination }) {
    this.#id = id;
    this.#task = new AccompanimentTask({ companion, destination });
  }

  /**
   * 同伴リクエストを申し出る。
   * @public
   * @returns {Object} 会話シーン一式
   */
  createRequestInteraction() {
    return {
      kind: ACCOMPANIMENT_INTERACTION_KINDS.REQUEST,
      conversationSceneScript: createAccompanimentRequestConversationSceneScript(
        this.#task,
      ),
    };
  }

  /**
   * アクターとのインタラクションを作成。
   * @private
   * @param {string} actorId - アクター ID
   * @param {string} currentLocationId - 現在位置 ID
   * @returns {Object|null} インタラクション
   */
  createActorInteraction(actorId, currentLocationId) {
    if (
      !this.#task.isExecuting()
      || actorId !== this.#task.companion.id
      || currentLocationId !== this.#task.destination.id
    ) {
      return null;
    }

    return {
      kind: ACCOMPANIMENT_INTERACTION_KINDS.COMPLETE,
      conversationSceneScript: createAccompanimentCompleteConversationSceneScript(
        this.#task,
      ),
    };
  }

  completeInteraction(kind) {
    if (kind === ACCOMPANIMENT_INTERACTION_KINDS.REQUEST) {
      return this.#task.accept();
    }

    if (kind === ACCOMPANIMENT_INTERACTION_KINDS.COMPLETE) {
      return this.#task.complete();
    }

    return false;
  }

  /**
   * アクターとのインタラクションがブロックされているかどうかを確認。
   * @private
   * @param {string} actorId - アクター ID
   * @param {string} currentLocationId - 現在位置 ID
   * @returns {boolean} ブロック中の場合 true
   */
  isActorInteractionBlocked(actorId, currentLocationId) {
    return (
      this.#task.isExecuting()
      && actorId === this.#task.companion.id
      && currentLocationId !== this.#task.destination.id
    );
  }

  /**
   * イベント実行中かどうかを確認。
   * @private
   * @returns {boolean} 実行中の場合 true
   */
  isExecuting() {
    return this.#task.isExecuting();
  }

  isSucceeded() {
    return this.#task.isSucceeded();
  }

  getCompanionActorId() {
    return this.#task.companion.id;
  }

  getCompanionSnapshot() {
    return { ...this.#task.companion };
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
      type: 'accompaniment',
      name: '同行',
      description: `${task.companion.name}と${task.destination.name}へ移動`,
      ...task,
    };
  }
}

export {
  ACCOMPANIMENT_INTERACTION_KINDS,
  AccompanimentEvent,
};
