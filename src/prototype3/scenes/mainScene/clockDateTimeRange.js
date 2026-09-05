class ClockDateTimeRange {
  #from;
  #to;

  constructor({ from, to }) {
    this.#from = from;
    this.#to = to;
  }

  contains(dateTime, { includeFrom = true, includeTo = true } = {}) {
    const time = dateTime.getTime();
    const from = this.#from.getTime();
    const to = this.#to.getTime();

    const afterFrom = includeFrom ? from <= time : from < time;
    const beforeTo = includeTo ? time <= to : time < to;

    return afterFrom && beforeTo;
  }

  createSnapshot() {
    return {
      from: this.#from.toString(),
      to: this.#to.toString(),
    };
  }
}

export default ClockDateTimeRange;
