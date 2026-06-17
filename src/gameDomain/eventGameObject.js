import { ACTION_TYPES } from './actions.js';
import { GAME_EVENT_STATE } from './gameEvent.js';

class EventGameObject {
  constructor(event) {
    this.event = event;
    this.inputValue = '';
  }

  update(context) {
    this.event.update(context);
  }

  handleAction(action) {
    if (action.eventId !== this.event.id) {
      return;
    }

    if (action.type === ACTION_TYPES.EVENT_CLICK && this.event.type === 'click') {
      this.event.click();
    } else if (action.type === ACTION_TYPES.EVENT_INPUT_CHANGE && this.event.type === 'input') {
      this.inputValue = action.value;
    } else if (action.type === ACTION_TYPES.EVENT_INPUT_SUBMIT && this.event.type === 'input') {
      this.event.submit(this.inputValue);
    }
  }

  isExecuting() {
    return this.event.state === GAME_EVENT_STATE.EXECUTING;
  }

  isSucceeded() {
    return this.event.state === GAME_EVENT_STATE.SUCCEEDED;
  }

  isFailed() {
    return this.event.state === GAME_EVENT_STATE.FAILED;
  }

  getSnapshot() {
    return {
      id: this.event.id,
      type: this.event.type,
      name: this.event.name,
      description: this.event.description,
      remainingSeconds: Math.ceil(this.event.limitTimeMs / 1000),
      state: this.event.state,
      targetInput: this.event.targetInput,
      inputValue: this.inputValue,
    };
  }
}

export {
  EventGameObject,
};
