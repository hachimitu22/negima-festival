class EventIdSequence {
  #nextId;

  constructor() {
    this.#nextId = 0;
  }

  peek() {
    return this.#nextId;
  }

  next() {
    const id = this.#nextId;
    this.#nextId += 1;
    return id;
  }
}

export {
  EventIdSequence,
};
