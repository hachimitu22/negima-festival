import GameSystem from '../../../gameEngine/gameSystem.js';
import SYSTEM_IDS from './systemIds.js';
import ClockDateTime from '../clockDateTime.js';
import ClockDuration from '../clockDuration.js';

/** ゲーム内時計と1更新につき1件の時間変更予約を管理する。 */
class ClockSystem extends GameSystem {
  #clock;
  #reservedDateTime = null;
  #canRewind;

  /** 1日目10:00の時計を生成する。 */
  constructor() {
    super(SYSTEM_IDS.CLOCK);
    this.#clock = new ClockDateTime();
    this.#canRewind = true;
  }

  /**
   * 予約された日時へ時計を進め、変更前後の日時を通知する。
   * @param {Object} context - フレームコンテキスト。
   * @returns {void}
   */
  update(context) {
    if (this.#reservedDateTime === null
      || this.#reservedDateTime.getTime() === this.#clock.getTime()) {
      return;
    }

    const previousDateTime = this.#clock;
    this.#clock = this.#reservedDateTime;

    // イベントシステムに時刻経過を通知する
    context.getSystem(SYSTEM_IDS.EVENT).onTimeReached({
      dateTime: this.getDateTime(),
      previousDateTime,
    }, context);
  }

  /**
   * 次のupdateで反映する時間変更を予約する。
   * @param {ClockDuration|ClockDateTime} timeChange - 加算時間量または変更先日時。
   * @returns {void}
   * @throws {Error} 同じ更新内で既に予約している場合。
   * @throws {TypeError} 未対応の値を指定した場合。
   * @throws {RangeError} 変更先が無効または現在より前の場合。
   */
  requestTimeChange(timeChange) {
    if (this.#reservedDateTime !== null) {
      throw new Error('time-change-already-requested');
    }

    let dateTime;
    if (timeChange instanceof ClockDuration) {
      dateTime = this.#clock.add(timeChange);
    } else if (timeChange instanceof ClockDateTime) {
      dateTime = timeChange;
    } else {
      throw new TypeError('timeChange must be ClockDuration or ClockDateTime.');
    }

    if (!Number.isFinite(dateTime.getTime()) || dateTime.getTime() < this.#clock.getTime()) {
      throw new RangeError('timeChange must not move the clock backward or to an invalid date.');
    }
    this.#reservedDateTime = dateTime;
  }

  /**
   * 移動に伴う5分の時間経過を予約する。
   * @returns {void}
   * @throws {Error} 同じ更新内で既に予約している場合。
   */
  setStep() {
    this.requestTimeChange(new ClockDuration({ min: 5 }));
  }

  /**
   * 全Systemの更新後に予約を解除する。
   * @returns {void}
   */
  cleanup() {
    this.#reservedDateTime = null;
  }

  /**
   * 他のゲーム状態を変更せず指定日時へ戻し、古い時間変更予約を取り消す。
   * @param {ClockDateTime} dateTime - 復元する日時。
   * @returns {boolean} 巻き戻した場合はtrue。
   */
  rewindTo(dateTime) {
    if (!this.#canRewind || this.#clock.getTime() <= dateTime.getTime()) {
      return false;
    }

    this.#clock = dateTime;
    if (this.#reservedDateTime !== null) {
      this.#reservedDateTime = dateTime;
    }
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
