import GameSystem from '../../../gameEngine/gameSystem.js';
import SYSTEM_IDS from './systemIds.js';
import ClockDateTime from '../clockDateTime.js';

const CLOCK_STATUS = {
  STOP: 'stop',
  RUN: 'run',
  STEP: 'step',
};

class ClockSystem extends GameSystem {
  #clock;
  #status

  constructor() {
    super(SYSTEM_IDS.CLOCK);
    this.#clock = new ClockDateTime();
    this.#status = CLOCK_STATUS.STOP;
  }

  /**
   * 全System登録後に依存Systemを解決する。
   * @param {Object} dependencies - 依存解決API。
   * @param {Function} dependencies.requireSystem - System取得関数。
   * @returns {void}
   */
  attach(context) {
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

  setStep() {
    this.#status = CLOCK_STATUS.STEP;
  }

  getDateTime() {
    return this.#clock;
  }

  createClockSnapshot() {
    return this.#clock.toString();
  }
}

export default ClockSystem;
