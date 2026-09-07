import GameSystem from '../../../gameEngine/gameSystem.js';
import SYSTEM_IDS from './systemIds.js';
import ClockDateTime from '../clockDateTime.js';
import INPUT_IDS from '../../../inputIds.js';

const CLOCK_STATUS = {
  STOP: 'stop',
  RUN: 'run',
  STEP: 'step',
};

class ClockSystem extends GameSystem {
  #clock;
  #status;
  #canRewind;
  #rewinding;

  constructor() {
    super(SYSTEM_IDS.CLOCK);
    this.#clock = new ClockDateTime();
    this.#status = CLOCK_STATUS.STOP;
    this.#canRewind = true;
    this.#rewinding = false;
  }

  /**
   * 全System登録後に依存Systemを解決する。
   * @param {Object} dependencies - 依存解決API。
   * @param {Function} dependencies.requireSystem - System取得関数。
   * @returns {void}
   */
  attach(context) {
    context.inputDispatcher.register({
      inputId: INPUT_IDS.CLOCK.REWIND_TO_START,
      handler: () => {
        this.rewindToStart();
      },
    });
  }

  /**
   * Systemを更新する。
   * @param {Object} context - フレームコンテキスト。
   * @returns {void}
   */
  update(context) {
    if (this.#status === CLOCK_STATUS.STOP) return;
    if (this.#status === CLOCK_STATUS.STEP) this.#status = CLOCK_STATUS.STOP;

    this.#clock = this.#clock.add({ min: 5 });

    // イベントシステムに時刻経過を通知する
    context.getSystem(SYSTEM_IDS.EVENT).onTimeReached({
      dateTime: this.getDateTime(),
    }, context)
  }

  cleanup() {
    this.#rewinding = false;
  }

  setStep() {
    this.#status = CLOCK_STATUS.STEP;
  }

  /**
   * 他のゲーム状態を変更せず、時刻を1日目10:00へ戻す。
   * @returns {boolean} 巻き戻しを実行した場合はtrue。
   */
  rewindToStart() {
    if (!this.canRewindToStart()) {
      return false;
    }

    this.#clock = new ClockDateTime();
    this.#status = CLOCK_STATUS.STOP;
    this.#rewinding = true;
    return true;
  }

  /**
   * 簡易巻き戻しが成立した更新中かを返す。
   * @returns {boolean} 巻き戻しが成立した更新中の場合はtrue。
   */
  isRewinding() {
    return this.#rewinding;
  }

  /**
   * 現在時刻が簡易巻き戻し先より後かを返す。
   * @returns {boolean} 1日目10:00より後の場合はtrue。
   */
  canRewindToStart() {
    return this.#canRewind && this.#clock.getTime() > new ClockDateTime().getTime();
  }

  enableRewind() {
    this.#canRewind = true;
  }

  disableRewind() {
    this.#canRewind = false;
  }

  getDateTime() {
    return this.#clock;
  }

  createClockSnapshot() {
    return this.#clock.toString();
  }
}

export default ClockSystem;
