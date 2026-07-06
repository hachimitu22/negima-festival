const PATROL_TASK_STATES = Object.freeze({
  EXECUTING: 'executing',
  SUCCEEDED: 'succeeded',
});

class PatrolTask {
  #state;
  #destinations;

  constructor({ destinations }) {
    if (!Array.isArray(destinations)) {
      throw new TypeError('Patrol task destinations must be an array.');
    }
    if (destinations.length < 1 || destinations.length > 3) {
      throw new RangeError('Patrol task must have between one and three destinations.');
    }

    const destinationIds = new Set();
    this.#destinations = destinations.map(destination => {
      if (
        !destination
        || typeof destination.id !== 'string'
        || destination.id.length === 0
        || typeof destination.name !== 'string'
        || destination.name.length === 0
      ) {
        throw new TypeError('Patrol task destinations must have an id and name.');
      }
      if (destinationIds.has(destination.id)) {
        throw new Error(`Duplicate patrol destination id: ${destination.id}`);
      }

      destinationIds.add(destination.id);
      return {
        id: destination.id,
        name: destination.name,
        isVisited: false,
      };
    });
    this.#state = PATROL_TASK_STATES.EXECUTING;
  }

  visitLocation(locationId) {
    if (this.#state !== PATROL_TASK_STATES.EXECUTING) {
      return false;
    }

    const destination = this.#destinations.find(candidate => (
      candidate.id === locationId
      && !candidate.isVisited
    ));
    if (!destination) {
      return false;
    }

    destination.isVisited = true;
    if (this.#destinations.every(candidate => candidate.isVisited)) {
      this.#state = PATROL_TASK_STATES.SUCCEEDED;
    }
    return true;
  }

  isExecuting() {
    return this.#state === PATROL_TASK_STATES.EXECUTING;
  }

  isSucceeded() {
    return this.#state === PATROL_TASK_STATES.SUCCEEDED;
  }

  getSnapshot() {
    return {
      state: this.#state,
      destinations: this.#destinations.map(destination => ({
        ...destination,
      })),
    };
  }
}

export {
  PATROL_TASK_STATES,
  PatrolTask,
};
