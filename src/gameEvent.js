const GAME_EVENT_STATE = {
  EXECUTING: 'executing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

class GameEventBase {
  constructor(id, { name, description, limitTimeMs }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.limitTimeMs = limitTimeMs;
    this.state = GAME_EVENT_STATE.EXECUTING;
  }

  update(deltaTime) {
    if (this.state !== GAME_EVENT_STATE.EXECUTING) {
      return;
    }

    this.updateEvent();

    if (this.state !== GAME_EVENT_STATE.EXECUTING) {
      return;
    }

    this.limitTimeMs -= deltaTime;
    if (this.limitTimeMs <= 0) {
      this.limitTimeMs = 0;
      this.state = GAME_EVENT_STATE.FAILED;
    }
  }

  updateEvent() {
    // Override in subclasses.
  }
}

// 1回クリックされると完了するイベント
class ClickEvent extends GameEventBase {
  constructor(id) {
    super(id, {
      name: 'Click Event',
      description: 'A simple click event',
      limitTimeMs: 5000,
    });

    this.type = 'click';
    this.clicked = false;
  }

  updateEvent() {
    if (this.clicked) {
      this.state = GAME_EVENT_STATE.SUCCEEDED;
    }
  }

  click() {
    this.clicked = true;
  }
}

// 特定の文字列が入力されると完了するイベント
class InputEvent extends GameEventBase {
  constructor(id) {
    const targetInput = Array.from(
      { length: 5 },
      () => String.fromCharCode(Math.floor(Math.random() * 26) + 97),
    ).join('');

    super(id, {
      name: 'Input Event',
      description: `Type "${targetInput}" to complete`,
      limitTimeMs: 5000,
    });

    this.type = 'input';
    this.targetInput = targetInput;
  }

  submit(input) {
    this.state = input === this.targetInput
      ? GAME_EVENT_STATE.SUCCEEDED
      : GAME_EVENT_STATE.FAILED;
  }
}

export {
  GAME_EVENT_STATE,
  ClickEvent,
  InputEvent,
};
