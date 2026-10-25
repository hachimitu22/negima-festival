/**
 * 麻帆良祭の時刻を表すクラス
 */
class ClockDateTime {
  #date

  constructor({ year = 2020, month = 6, date = 20, hour = 10, min = 0 } = {}) {
    this.#date = new Date(`${year}/${month}/${date} ${hour}:${min}`);
  }

  getTime() {
    return this.#date.getTime();
  }

  /**
   * 指定した時間量を加算した新しい日時を返す。
   * @param {Object} duration - 加算する時間量。
   * @param {number} [duration.hour=0] - 時間数。
   * @param {number} [duration.min=0] - 分数。
   * @returns {ClockDateTime} 加算後の日時。
   */
  add({ hour = 0, min = 0 }) {
    const date = new Date(this.#date);
    date.setMinutes(date.getMinutes() + hour * 60 + min);

    return new ClockDateTime({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      date: date.getDate(),
      hour: date.getHours(),
      min: date.getMinutes(),
    });
  }

  get year() {
    return this.#date.getFullYear();
  }

  get month() {
    return this.#date.getMonth() + 1;
  }

  get date() {
    return this.#date.getDate();
  }

  get hour() {
    return this.#date.getHours();
  }

  get min() {
    return this.#date.getMinutes();
  }

  toString() {
    const timeOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return Intl.DateTimeFormat('ja-JP', timeOptions).format(this.#date);
  }
}

export default ClockDateTime;
