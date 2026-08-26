import GameSystem from '../../../gameEngine/gameSystem.js';
import SYSTEM_IDS from './systemIds.js';

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
    this.#clock = new Date('2003/06/20 10:00');
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

    this.#clock.setMinutes(this.#clock.getMinutes() + 5);

    // イベントシステムに時刻経過を通知する
    context.getSystem(SYSTEM_IDS.EVENT).onTimeReached({
      day: this.#clock.getDate(),
      hour: this.#clock.getHours(),
      min: this.#clock.getMinutes(),
    }, context)
  }

  setStep() {
    this.#status = CLOCK_STATUS.STEP;
  }

  createClockSnapshot() {
    const timeOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return Intl.DateTimeFormat('ja-JP', timeOptions).format(this.#clock);
  }
}

export default ClockSystem;
