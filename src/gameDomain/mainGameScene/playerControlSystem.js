import { INPUT_TYPES, TARGET_PREFIXES } from '../actions.js';

/**
 * メインゲーム中の通常入力をGameplay requestへ変換するSystem。
 *
 * @public
 */
class PlayerControlSystem {
  #characterRequests;
  #branchRequests;
  #cassiopeiaRequests;

  /**
   * PlayerControlSystemを生成する。
   *
   * @public
   * @param {Object} config - 生成設定。
   * @param {Object} [config.characterRequests] - 移動request API。
   * @param {Object} [config.branchRequests] - 分岐request API。
   * @param {Object} [config.cassiopeiaRequests] - カシオペアrequest API。
   */
  constructor({
    characterRequests = {},
    branchRequests = {},
    cassiopeiaRequests = {},
  } = {}) {
    this.#characterRequests = characterRequests;
    this.#branchRequests = branchRequests;
    this.#cassiopeiaRequests = cassiopeiaRequests;
  }

  /**
   * 通常入力を処理し、対応するrequest APIへ変換する。
   *
   * @public
   * @param {Array<Object>|Object} inputSnapshot - 入力配列またはinputsを持つsnapshot。
   * @param {Object} [controlContext={}] - 入力制御状態。
   * @param {boolean} [controlContext.gameplayInputEnabled=true] - 通常入力を有効にするか。
   * @returns {Object} 処理結果。
   */
  update(inputSnapshot = [], { gameplayInputEnabled = true } = {}) {
    if (!gameplayInputEnabled) {
      return {
        handledCount: 0,
      };
    }

    let handledCount = 0;
    for (const input of getInputEvents(inputSnapshot)) {
      if (this.#processInput(input)) {
        handledCount += 1;
      }
    }

    return {
      handledCount,
    };
  }

  #processInput(input) {
    if (input.type !== INPUT_TYPES.TARGET_ACTIVATE) {
      return false;
    }

    return this.#handleTargetActivate(input.targetId);
  }

  #handleTargetActivate(targetId) {
    const mapPosition = getMapPositionTargetValue(
      targetId,
      TARGET_PREFIXES.MAP_POSITION,
    );
    if (mapPosition) {
      this.#characterRequests.movePlayerToMapPosition?.(mapPosition);
      return true;
    }

    const locationId = getTargetValue(targetId, TARGET_PREFIXES.LOCATION);
    if (locationId) {
      this.#characterRequests.movePlayerToLocation?.(locationId);
      return true;
    }

    const actorId = getTargetValue(targetId, TARGET_PREFIXES.ACTOR);
    if (actorId !== null) {
      return false;
    }

    const conversationAction = getTargetValue(
      targetId,
      TARGET_PREFIXES.CONVERSATION_SCENE,
    );
    if (conversationAction !== null) {
      return false;
    }

    const branchChoiceId = getTargetValue(
      targetId,
      TARGET_PREFIXES.BRANCH_CHOICE,
    );
    if (branchChoiceId !== null) {
      this.#branchRequests.chooseCurrentTask?.(branchChoiceId);
      return true;
    }

    if (targetId === TARGET_PREFIXES.CASSIOPEIA) {
      this.#cassiopeiaRequests.requestUseCassiopeia?.();
      return true;
    }

    return false;
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

/**
 * ターゲットIDからマップ座標を取得する。
 *
 * @param {string} targetId - ターゲットID。
 * @param {string} prefix - 期待するprefix。
 * @returns {Object|null} マップ座標。形式不正の場合はnull。
 */
function getMapPositionTargetValue(targetId, prefix) {
  const value = getTargetValue(targetId, prefix);
  if (value === null) {
    return null;
  }

  const [x, y] = value.split(',').map(Number);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }

  return { x, y };
}

export {
  PlayerControlSystem,
};
