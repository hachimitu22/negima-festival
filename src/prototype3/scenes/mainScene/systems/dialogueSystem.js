import GameSystem from '../../../gameEngine/gameSystem.js';
import SYSTEM_IDS from './systemIds.js';
import INPUT_IDS from '../../../inputIds.js';

class Dialogue {
  #status = '';
  #steps = [];
  #complete = () => { };
  #index = 0;
  #nextAction = null;

  constructor({ id, steps, complete }) {
    this.id = id;
    this.#status = 'waiting';
    this.#steps = steps;
    this.#complete = complete;
    this.currentMessage = null;
    this.choices = [];
  }
  start() {
    this.#status = 'running';
    this.#index = 0;
    this.#setCurrentStep();
  }

  next(params, context) {
    if (this.#status !== 'running') {
      return;
    }

    this.#index++;
    if (this.#steps.length <= this.#index) {
      this.#status = 'complete';
      this.#complete(params, context);
      return;
    }

    this.#setCurrentStep();

    if (this.#nextAction) {
      this.#nextAction(context);
      this.next(params, context);
    }
  }

  // TODO: 選択したあとの操作なので choiced に近いニュアンスが良い
  choice({ choiceId }, context) {
    const choice = this.choices.find(choice => choice.id === choiceId);
    if (!choice) {
      throw new Error('dialogue-none-choice-id');
    }

    this.#index = 0;
    this.#steps = choice.steps;

    this.#setCurrentStep();
  }

  #setCurrentStep() {
    const step = this.#steps[this.#index];

    this.currentMessage = '';
    this.choices = [];
    this.#nextAction = null;

    switch (step.type) {
      case 'message':
        this.currentMessage = step.message;
        break;
      case 'choice':
        this.currentMessage = step.message;
        this.choices = step.choices;
        break;
      case 'action':
        this.#nextAction = step.action;
        break;
      default:
        throw new Error('dialogue-none-step-type');
    }
  }

  isRunning() {
    return this.#status === 'running';
  }
  isComplete() {
    return this.#status === 'complete';
  }
}

function createDialogue({ id, dialogue, complete }) {
  return new Dialogue({
    id,
    steps: dialogue.steps,
    complete,
  });
}

/** 一度に一つの会話と、その要求結果を管理する。 */
class DialogueSystem extends GameSystem {
  #activeDialogue = null;
  // #results = new Map();

  /** DialogueSystemを生成する。 */
  constructor() {
    super(SYSTEM_IDS.DIALOGUE);
  }

  attach(context) {
    // 入力受付設定
    context.inputDispatcher.register({
      inputId: INPUT_IDS.DIALOGUE.NEXT,
      handler: this.next.bind(this),
    });
    context.inputDispatcher.register({
      inputId: INPUT_IDS.DIALOGUE.CHOOSE,
      handler: this.choice.bind(this),
    });
  }

  /**
   * 会話開始を要求する。
   * @param {Object} request - 会話要求。
   * @param {string} request.ownerId - 要求元ID。
   * @param {Array<Object>} request.messages - 話者と本文の配列。
   * @param {Array<Object>} [request.choices=[]] - 分岐選択肢。
   * @returns {Object} 受付結果。
   */
  start({ ownerId, dialogue, complete }, context) {
    if (this.#activeDialogue) {
      throw new Error('dialogue-active');
    }

    this.#activeDialogue = createDialogue({ id: ownerId, dialogue, complete });
    this.#activeDialogue.start();

    // 会話中は巻き戻し不可
    context.getSystem(SYSTEM_IDS.CLOCK).disableRewind();
  }

  next(params, context) {
    if (!this.#activeDialogue.isRunning()) {
      return;
    }

    this.#activeDialogue.next(params, context);

    if (this.#activeDialogue.isComplete()) {
      this.#activeDialogue = null;
      // 会話終了後は巻き戻し可能
      context.getSystem(SYSTEM_IDS.CLOCK).enableRewind();
    }
  }

  choice(params, context) {
    this.#activeDialogue.choice(params, context);
  }

  hasActiveDialogue() {
    return this.#activeDialogue !== null;
  }

  /**
   * 表示中会話のsnapshotを返す。
   * @returns {Object|null} 会話snapshot。
   */
  createDialogueSnapshot() {
    if (!this.#activeDialogue) {
      return null;
    }
    const message = this.#activeDialogue.currentMessage;
    return {
      speaker: message.speaker,
      text: message.text,
      // isLast: false,
      // index: this.#activeDialogue.#index,
      // messageCount: this.#activeDialogue.steps.length,
      // choices: this.#isChoiceRequired()
      //   ? this.#activeDialogue.choices.map(choice => ({ id: choice.id, text: choice.text }))
      //   : [],
      choices: this.#activeDialogue.choices.map(choice => ({ id: choice.id, text: choice.text })),
    };
  }

  /**
   * 会話状態を更新する。現在は同期要求だけのため処理しない。
   * @param {Object} context - フレームコンテキスト。
   * @returns {void}
   */
  update(context) {
  }
}

export default DialogueSystem;
