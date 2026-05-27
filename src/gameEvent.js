const GAME_EVENT_STATE = {
  WAITING: 'waiting',
  EXECUTING: 'executing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
};

function destroyEvent(system, event, succeeded) {
  const index = system.events.indexOf(event);
  if (index !== -1) {
    system.events.splice(index, 1);
    if (succeeded) {
      system.succeededEvents.push(event);
      system.sendViewMessage({ message: 'eventSucceeded', args: [event] });
    } else {
      system.failedEvents.push(event);
      system.sendViewMessage({ message: 'eventFailed', args: [event] });
    }
  }
}

class GameEventBase {
  constructor(id, { name, description, limitTimeMs }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.limitTimeMs = limitTimeMs;
    this.state = GAME_EVENT_STATE.WAITING;
  }
  update(system) {
    // イベント固有の更新処理
    this.updateEvent(system);

    // イベント共通の残り時間の減少処理
    this.limitTimeMs -= system.frame.deltaTime;
    if (this.limitTimeMs <= 0) {
      destroyEvent(system, this, false);
    }
  }
}

// 1回クリックされると完了するイベント
class ClickEvent extends GameEventBase {
  constructor(id) {
    super(id, { name: "Click Event", description: "A simple click event", limitTimeMs: 5000 });

    this.state = GAME_EVENT_STATE.EXECUTING;
    this.clicked = false;
  }
  updateEvent(system) {
    if (this.clicked) {
      destroyEvent(system, this, true);
    }
  }
  click() {
    this.clicked = true;
  }
}

// 特定の文字列が入力されると完了するイベント
class InputEvent extends GameEventBase {
  constructor(id) {
    const targetInput = Array.from({ length: 5 }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join(''); // ランダムな文字列
    super(id, { name: "Input Event", description: `Type "${targetInput}" to complete`, limitTimeMs: 5000 });
    this.targetInput = targetInput;
    this.inputReceived = false;
  }
  updateEvent(system) {
    if (this.inputReceived) {
      destroyEvent(system, this, true);
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
