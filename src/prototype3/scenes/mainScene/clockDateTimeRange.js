class ClockDateTimeRange {
  #from;
  #to;

  constructor({ from, to }) {
    this.#from = from;
    this.#to = to;
  }

  contains(dateTime) {
    const time = dateTime.getTime();
    const from = this.#from.getTime();
    const to = this.#to.getTime();
    return from <= time && time <= to;
  }

  createSnapshot() {
    return {
      from: this.#from.toString(),
      to: this.#to.toString(),
    };
  }
}

export default ClockDateTimeRange;
