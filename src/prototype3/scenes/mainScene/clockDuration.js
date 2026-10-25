/** ゲーム内の時間量を時・分で保持する。 */
class ClockDuration {
  #hour;
  #min;

  /**
   * 非負の整数で指定された時・分から時間量を生成する。
   * @param {Object} [options={}] - 時間量の設定。
   * @param {number} [options.hour=0] - 時間数。
   * @param {number} [options.min=0] - 分数。
   * @throws {RangeError} 時・分のいずれかが非負の整数でない場合。
   */
  constructor({ hour = 0, min = 0 } = {}) {
    if (!Number.isInteger(hour) || hour < 0) {
      throw new RangeError('hour must be a non-negative integer.');
    }
    if (!Number.isInteger(min) || min < 0) {
      throw new RangeError('min must be a non-negative integer.');
    }
    this.#hour = hour;
    this.#min = min;
  }

  /**
   * 指定された時の値を返す。
   * @returns {number} 時間数。
   */
  get hour() {
    return this.#hour;
  }

  /**
   * 指定された分の値を返す。
   * @returns {number} 分数。
   */
  get min() {
    return this.#min;
  }
}

export default ClockDuration;
