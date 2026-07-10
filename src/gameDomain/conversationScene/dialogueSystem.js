import { INPUT_TYPES, TARGET_PREFIXES } from '../actions.js';
import {
  CONVERSATION_SCENE_SESSION_RESULTS,
  ConversationSceneSession,
} from './conversationSceneSession.js';

const DIALOGUE_REQUEST_ACCEPTANCE = Object.freeze({
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
});

const DIALOGUE_REQUEST_PURPOSES = Object.freeze({
  START_CONVERSATION: 'startConversation',
});

/**
 * メインゲーム中の会話状態、入力処理、フレーム停止状態を管理するSystem。
 *
 * @public
 */
class DialogueSystem {
  #activeSession;
  #activeRequest;
  #conversationResult;
  #onComplete;
  #gameplaySimulationBlockedForFrame;
  #nextRequestNumber;

  /**
   * 会話Systemを生成する。
   *
   * @public
   */
  constructor() {
    this.#activeSession = null;
    this.#activeRequest = null;
    this.#conversationResult = null;
    this.#onComplete = null;
    this.#gameplaySimulationBlockedForFrame = false;
    this.#nextRequestNumber = 1;
  }

  /**
   * フレーム開始時の一時停止状態を初期化する。
   *
   * 進行中の会話がある場合は、このフレームのシミュレーション停止を維持する。
   *
   * @public
   * @returns {void}
   */
  beginFrame() {
    this.#gameplaySimulationBlockedForFrame = this.#activeSession !== null;
  }

  /**
   * 会話開始requestを受け付ける。
   *
   * @public
   * @param {Object} request - 会話開始request。
   * @param {Object} request.script - 生成済み会話script。
   * @param {Object} [request.owner] - request所有者。
   * @param {Function} [request.onComplete] - 会話完了callback。
   * @returns {Object} request受付結果。
   */
  requestStart({ script, owner = null, onComplete = null } = {}) {
    if (this.#activeSession) {
      return {
        acceptance: DIALOGUE_REQUEST_ACCEPTANCE.REJECTED,
        reason: 'conversationAlreadyActive',
      };
    }

    if (!script || !Array.isArray(script.messages) || script.messages.length === 0) {
      return {
        acceptance: DIALOGUE_REQUEST_ACCEPTANCE.REJECTED,
        reason: 'invalidConversationScript',
      };
    }

    const requestId = this.#createRequestId();
    this.#activeSession = new ConversationSceneSession(script);
    this.#activeRequest = {
      requestId,
      owner,
      blocking: true,
      purpose: DIALOGUE_REQUEST_PURPOSES.START_CONVERSATION,
    };
    this.#conversationResult = {
      scriptId: script.id,
      choiceId: null,
    };
    this.#onComplete = onComplete;
    this.#gameplaySimulationBlockedForFrame = true;

    return {
      acceptance: DIALOGUE_REQUEST_ACCEPTANCE.ACCEPTED,
      requestId,
      blocking: true,
      purpose: DIALOGUE_REQUEST_PURPOSES.START_CONVERSATION,
    };
  }

  /**
   * 進行中会話の入力を処理する。
   *
   * @public
   * @param {Array<Object>|Object} inputSnapshot - 入力配列またはinputsを持つsnapshot。
   * @returns {boolean} この呼び出しで会話が完了した場合はtrue。
   */
  processInput(inputSnapshot = []) {
    if (!this.#activeSession) {
      return false;
    }

    const inputs = getInputEvents(inputSnapshot);
    for (const input of inputs) {
      if (this.#processInput(input)) {
        return true;
      }
    }

    return false;
  }

  /**
   * このSystemが要求するフレーム制御状態を返す。
   *
   * @public
   * @returns {Object} フレーム制御状態。
   */
  getFrameControlState() {
    const blocked = (
      this.#activeSession !== null
      || this.#gameplaySimulationBlockedForFrame
    );
    return {
      gameplaySimulationBlocked: blocked,
      playerControlBlocked: blocked,
    };
  }

  /**
   * 会話snapshot fragmentを作る。
   *
   * @public
   * @returns {Object|null} 進行中会話snapshot。未実行時はnull。
   */
  createSnapshotFragment() {
    return this.#activeSession?.getSnapshot() ?? null;
  }

  /**
   * 進行中会話があるかを返す。
   *
   * @public
   * @returns {boolean} 進行中会話がある場合はtrue。
   */
  hasActiveSession() {
    return this.#activeSession !== null;
  }

  /**
   * 会話Systemの一時状態を破棄する。
   *
   * @public
   * @returns {void}
   */
  dispose() {
    this.#activeSession = null;
    this.#activeRequest = null;
    this.#conversationResult = null;
    this.#onComplete = null;
    this.#gameplaySimulationBlockedForFrame = false;
  }

  #processInput(input) {
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

    return this.#handleAction(action);
  }

  #handleAction(action) {
    const choiceId = getTargetValue(action, 'choice');
    if (choiceId) {
      const result = this.#activeSession.selectChoice(choiceId);
      if (result) {
        this.#conversationResult = result;
      }
      return false;
    }

    if (action !== 'next') {
      return false;
    }

    const result = this.#activeSession.next();
    if (result !== CONVERSATION_SCENE_SESSION_RESULTS.COMPLETED) {
      return false;
    }

    this.#completeActiveConversation();
    return true;
  }

  #completeActiveConversation() {
    if (!this.#activeSession) {
      return;
    }

    const conversationResult = this.#conversationResult;
    const onComplete = this.#onComplete;
    this.#activeSession = null;
    this.#activeRequest = null;
    this.#conversationResult = null;
    this.#onComplete = null;
    this.#gameplaySimulationBlockedForFrame = true;

    if (typeof onComplete === 'function') {
      onComplete(conversationResult);
    }
  }

  #createRequestId() {
    const requestId = `dialogue-request-${this.#nextRequestNumber}`;
    this.#nextRequestNumber += 1;
    return requestId;
  }
}

function getInputEvents(inputSnapshot) {
  if (Array.isArray(inputSnapshot)) {
    return inputSnapshot;
  }

  if (Array.isArray(inputSnapshot?.inputs)) {
    return inputSnapshot.inputs;
  }

  return [];
}

function getTargetValue(targetId, prefix) {
  const expectedPrefix = `${prefix}:`;
  if (typeof targetId !== 'string' || !targetId.startsWith(expectedPrefix)) {
    return null;
  }

  return targetId.slice(expectedPrefix.length);
}

export {
  DIALOGUE_REQUEST_ACCEPTANCE,
  DIALOGUE_REQUEST_PURPOSES,
  DialogueSystem,
};
