import { MAIN_GAME_LAYER_IDS } from '../actions.js';

const GAME_FLOW_INPUT_MODES = Object.freeze({
  GAMEPLAY: 'gameplay',
  DIALOGUE: 'dialogue',
});

/**
 * メインゲーム中の入力モード、フレーム制御、表示layerを決定するSystem。
 *
 * @public
 */
class GameFlowSystem {
  #inputMode;

  /**
   * GameFlowSystemを生成する。
   *
   * @public
   */
  constructor() {
    this.#inputMode = GAME_FLOW_INPUT_MODES.GAMEPLAY;
  }

  /**
   * フレーム開始時点の入力モードを確定する。
   *
   * @public
   * @param {Object} options - フレーム開始時の状態。
   * @param {Object} options.dialogue - DialogueSystem。
   * @returns {Object} control context。
   */
  beginFrame({ dialogue } = {}) {
    this.#inputMode = hasActiveDialogue(dialogue)
      ? GAME_FLOW_INPUT_MODES.DIALOGUE
      : GAME_FLOW_INPUT_MODES.GAMEPLAY;
    return this.createControlContext({ dialogue });
  }

  /**
   * フィールド入力を処理してよいかを返す。
   *
   * @public
   * @returns {boolean} フィールド入力を処理できる場合はtrue。
   */
  canProcessFieldInput() {
    return this.#inputMode === GAME_FLOW_INPUT_MODES.GAMEPLAY;
  }

  /**
   * 通常入力とゲームシミュレーションの制御状態を作る。
   *
   * @public
   * @param {Object} options - 現在のSystem状態。
   * @param {Object} options.dialogue - DialogueSystem。
   * @returns {Object} control context。
   */
  createControlContext({ dialogue } = {}) {
    const frameControl = getDialogueFrameControlState(dialogue);
    const gameplaySimulationEnabled = !frameControl.gameplaySimulationBlocked;
    const gameplayInputEnabled = (
      this.#inputMode === GAME_FLOW_INPUT_MODES.GAMEPLAY
      && !frameControl.playerControlBlocked
      && gameplaySimulationEnabled
    );

    return {
      inputMode: this.#inputMode,
      gameplayInputEnabled,
      playerControlEnabled: gameplayInputEnabled,
      gameplaySimulationEnabled,
    };
  }

  /**
   * Scene snapshot向けのfragmentを作る。
   *
   * @public
   * @param {Object} options - 現在のSystem状態。
   * @param {Object} options.dialogue - DialogueSystem。
   * @returns {Object} snapshot fragment。
   */
  createSnapshotFragment({ dialogue } = {}) {
    return {
      activeLayerId: hasActiveDialogue(dialogue)
        ? MAIN_GAME_LAYER_IDS.CONVERSATION
        : MAIN_GAME_LAYER_IDS.MAP,
    };
  }
}

function hasActiveDialogue(dialogue) {
  return typeof dialogue?.hasActiveSession === 'function'
    && dialogue.hasActiveSession();
}

function getDialogueFrameControlState(dialogue) {
  const frameControl = typeof dialogue?.getFrameControlState === 'function'
    ? dialogue.getFrameControlState()
    : {};
  const gameplaySimulationBlocked = Boolean(
    frameControl.gameplaySimulationBlocked,
  );

  return {
    gameplaySimulationBlocked,
    playerControlBlocked: (
      frameControl.playerControlBlocked ?? gameplaySimulationBlocked
    ),
  };
}

export {
  GAME_FLOW_INPUT_MODES,
  GameFlowSystem,
};
