const GAME_EVENT_STATE = {
  WAITING: 'waiting',
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
    this.state = GAME_EVENT_STATE.WAITING;
  }
  update(state) {
    // イベント固有の更新処理
    this.updateEvent(state);

    // イベント共通の残り時間の減少処理
    this.limitTimeMs -= state.frame.deltaTime;
    if (this.limitTimeMs <= 0) {
      destroyEvent(this, false);
    }
  }
  receiveMessage(message) {
    // イベント固有のメッセージ処理
    this.receiveMessageEvent(message);
  }
}

// 1回クリックされると完了するイベント
class ClickEvent extends GameEventBase {
  constructor(id) {
    super(id, { name: "Click Event", description: "A simple click event", limitTimeMs: 5000 });

    this.state = GAME_EVENT_STATE.EXECUTING;
    this.clicked = false;
  }
  updateEvent() {
    if (this.clicked) {
      destroyEvent(this, true);
    }
  }
  receiveMessageEvent(message) {
    if (message === 'click') {
      this.clicked = true;
    }
  }
}

// 特定の文字列が入力されると完了するイベント
class InputEvent extends GameEventBase {
  constructor(id) {
    const targetInput = Array.from({ length: 5 }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join(''); // ランダムな文字列
    super(id, { name: "Input Event", description: `Type "${targetInput}" to complete`, limitTimeMs: 100000 });
    this.targetInput = targetInput;
    this.inputReceived = false;
  }
  updateEvent() {
    if (this.inputReceived) {
      destroyEvent(this, true);
    }
  }
  receiveMessageEvent(message) {
    if (message === this.targetInput) {
      this.state = GAME_EVENT_STATE.SUCCEEDED;
    } else {
      this.state = GAME_EVENT_STATE.FAILED;
    }
  }
}

export {
  ClickEvent,
  InputEvent,
};
