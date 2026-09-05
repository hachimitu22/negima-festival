
const SCHEDULE_STATUS = {
  WAITING: 'waiting', // スケジュール開始前
  ACTIVE: 'active', // スケジュール実行中
  FINISHED: 'finished', // スケジュール終了後
};

class Schedule {
  #id;
  #dateTimeRange;
  #areaId;
  #enabled;
  #status;

  constructor(scheduleData, enable, dateTime) {
    this.#id = scheduleData.id;
    this.#dateTimeRange = scheduleData.dateTimeRange;
    this.#areaId = scheduleData.areaId;
    this.#enabled = enable;
    this.#status = SCHEDULE_STATUS.WAITING;

    this.update(dateTime);
  }

  update(dateTime) {
    // 無効化中は何もしない
    if (!this.#enabled) return;

    if (this.#status === SCHEDULE_STATUS.WAITING) {
      if (this.#hasStarted(dateTime)) {
        this.#status = SCHEDULE_STATUS.ACTIVE;
      }
    } else if (this.#status === SCHEDULE_STATUS.ACTIVE) {
      if (!this.#hasStarted(dateTime)) {
        this.#status = SCHEDULE_STATUS.FINISHED;
      }
    }
  }

  #hasStarted(dateTime) {
    return this.#dateTimeRange.contains(dateTime, { includeFrom: true, includeTo: false });
  }

  isActive() {
    return this.#enabled && this.#status === SCHEDULE_STATUS.ACTIVE;
  }

  get id() {
    return this.#id;
  }

  get areaId() {
    return this.#areaId;
  }

  enable() {
    this.#enabled = true;
  }

  createSnapshot() {
    return {
      id: this.#id,
      dateTimeRange: this.#dateTimeRange.createSnapshot(),
      areaId: this.#areaId,
      enabled: this.#enabled,
      status: this.#status,
    };
  }
}

export default Schedule;
export { SCHEDULE_STATUS };
