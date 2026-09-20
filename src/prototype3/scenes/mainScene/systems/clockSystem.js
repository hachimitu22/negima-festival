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
  #status;
  #canRewind;

  constructor() {
    super(SYSTEM_IDS.CLOCK);
    this.#clock = new ClockDateTime();
    this.#status = CLOCK_STATUS.STOP;
    this.#canRewind = true;
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

  /** 他のゲーム状態を変更せず、指定日時へ戻す。 */
  rewindTo(dateTime) {
    if (!this.#canRewind || this.#clock.getTime() <= dateTime.getTime()) {
      return false;
    }

    this.#clock = dateTime;
    this.#status = CLOCK_STATUS.STOP;
    return true;
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
