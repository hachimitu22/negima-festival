const DELIVERY_TASK_STATES = Object.freeze({
  OFFERED: 'offered',
  EXECUTING: 'executing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
});

class DeliveryTask {
  #state;

  constructor({ sender, recipient }) {
    this.sender = createActorIdentity(sender);
    this.recipient = createActorIdentity(recipient);
    this.#state = DELIVERY_TASK_STATES.OFFERED;
  }

  accept() {
    if (this.#state !== DELIVERY_TASK_STATES.OFFERED) {
      return false;
    }

    this.#state = DELIVERY_TASK_STATES.EXECUTING;
    return true;
  }

  complete() {
    if (this.#state !== DELIVERY_TASK_STATES.EXECUTING) {
      return false;
    }

    this.#state = DELIVERY_TASK_STATES.SUCCEEDED;
    return true;
  }

  decline() {
    if (this.#state !== DELIVERY_TASK_STATES.EXECUTING) {
      return false;
    }

    this.#state = DELIVERY_TASK_STATES.FAILED;
    return true;
  }

  isExecuting() {
    return this.#state === DELIVERY_TASK_STATES.EXECUTING;
  }

  isSucceeded() {
    return this.#state === DELIVERY_TASK_STATES.SUCCEEDED;
  }

  isFailed() {
    return this.#state === DELIVERY_TASK_STATES.FAILED;
  }

  getSnapshot() {
    return {
      sender: { ...this.sender },
      recipient: { ...this.recipient },
      state: this.#state,
    };
  }
}

function createActorIdentity(actor) {
  if (!actor || typeof actor.id !== 'string' || typeof actor.name !== 'string') {
    throw new TypeError('Delivery task actors must have an id and name.');
  }

  return {
    id: actor.id,
    name: actor.name,
  };
}

export {
  DELIVERY_TASK_STATES,
  DeliveryTask,
};
