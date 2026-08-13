class InputDispatcher {
  #handlers = new Map();

  constructor() {
  }

  register({ inputId, handler }) {
    if (this.#handlers.has(inputId)) {
      throw new Error(`Duplicate inputId: ${inputId}`);
    }
    this.#handlers.set(inputId, handler);
  }

  dispatchAll(inputs, context) {
    while (inputs.length > 0) {
      const { inputId, params } = inputs.shift();
      const handler = this.#handlers.get(inputId);
      if (!handler) {
        throw new Error(`No handler registered for inputId: ${inputId}`);
      }
      handler(params, context);
    }
  }
}

export default InputDispatcher;
