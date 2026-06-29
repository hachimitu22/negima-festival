const ACCOMPANIMENT_TASK_STATES = Object.freeze({
  OFFERED: 'offered',
  EXECUTING: 'executing',
  SUCCEEDED: 'succeeded',
});

class AccompanimentTask {
  #state;

  constructor({ companion, destination }) {
    this.companion = createIdentity(companion, 'actor');
    this.destination = createIdentity(destination, 'location');
    this.#state = ACCOMPANIMENT_TASK_STATES.OFFERED;
  }

  accept() {
    if (this.#state !== ACCOMPANIMENT_TASK_STATES.OFFERED) {
      return false;
    }

    this.#state = ACCOMPANIMENT_TASK_STATES.EXECUTING;
    return true;
  }

  complete() {
    if (this.#state !== ACCOMPANIMENT_TASK_STATES.EXECUTING) {
      return false;
    }

    this.#state = ACCOMPANIMENT_TASK_STATES.SUCCEEDED;
    return true;
  }

  isExecuting() {
    return this.#state === ACCOMPANIMENT_TASK_STATES.EXECUTING;
  }

  isSucceeded() {
    return this.#state === ACCOMPANIMENT_TASK_STATES.SUCCEEDED;
  }

  getSnapshot() {
    return {
      companion: { ...this.companion },
      destination: { ...this.destination },
      state: this.#state,
    };
  }
}

function createIdentity(value, label) {
  if (!value || typeof value.id !== 'string' || typeof value.name !== 'string') {
    throw new TypeError(`Accompaniment task ${label} must have an id and name.`);
  }

  return {
    id: value.id,
    name: value.name,
  };
}

export {
  ACCOMPANIMENT_TASK_STATES,
  AccompanimentTask,
};
