import { getRandomInt, rollChance } from './src/random.js';
import { InputEvent } from './src/gameEvent.js';


const GameSystem = {
  fps: 60,
  frame: {
    beforeDate: null,
    deltaTime: 0,
  },
  currentEvent: null,
  events: [],
  succeededEvents: [],
  failedEvents: [],
  lastEventId: 0,

  gameObjects: [],  // { model, view }

  nextView: 'menu',
};

window.onload = () => {
  main();
};

function main() {
  mainLoop();
  // setInterval(() => {
  //   mainLoop();
  // }, Math.floor(1000 / GameSystem.fps));
}

const GAME_EVENTS = [
  InputEvent,
];

// イベントをランダム生成する。生成されないこともある。
function createEventRandom() {
  if (rollChance(10)) {
    const randomIndex = getRandomInt(0, GAME_EVENTS.length - 1);
    const event = new GAME_EVENTS[randomIndex](GameSystem.lastEventId++);
    return event;
  }
  return null;
}

function destroyEvent(event, succeeded) {
  const index = GameSystem.events.indexOf(event);
  if (index !== -1) {
    GameSystem.events.splice(index, 1);
    if (succeeded) {
      GameSystem.succeededEvents.push(event);
    } else {
      GameSystem.failedEvents.push(event);
    }
  }
}

function setCurrentEvent(system, event) {
  system.currentEvent = event;
  system.nextView = event.constructor.name;
}

// メインループ
function mainLoop() {
  while (true) {
    const now = Date.now();
    if (GameSystem.frame.beforeDate === null) {
      GameSystem.frame.beforeDate = now;
    }
    GameSystem.frame.deltaTime = now - GameSystem.frame.beforeDate;
    GameSystem.frame.beforeDate = now;

    update(GameSystem);
    render(GameSystem);
  }
}

// ゲームの状態を更新する関数
function update(system) {
  const event = createEventRandom();
  if (event) {
    system.events.push(event);
  }
  // イベントの更新
  system.events.forEach(event => {
    event.update(system);
  });
}

const VIEW_LIST = {
  'menu': {
    render: system => {
      const messages = [
        'メニューを選択してください。',
        '発生中のイベント一覧: 1',
        '成功したイベント一覧: 2',
        '失敗したイベント一覧: 3',
      ];
      console.log(messages.join('\n'));
    },
    controller: (system, input) => {
      if (input === '1') {
        system.nextView = 'executingEvents';
      } else if (input === '2') {
        system.nextView = 'succeededEvents';
      } else if (input === '3') {
        system.nextView = 'failedEvents';
      } else {
        system.nextView = 'menu';
      }
    },
  },
  'executingEvents': {
    render: system => {
      if (system.events.length >= 1) {
        console.log('イベントのIDを選択してください:');
        console.log('発生中のイベント:');
        system.events.forEach(event => {
          console.log(`${event.id}: ${event.name}: ${event.description} (残り時間: ${Math.ceil(event.limitTimeMs / 1000)}秒)`);
        });
      } else {
        console.log('発生中のイベントはありません。');
        return null;
      }
    },
    controller: (system, input) => {
      const event = system.events.find(event => event.id === input);
      if (event) {
        setCurrentEvent(system, event);
      } else {
        console.log('無効なイベントIDです。');
        system.nextView = 'menu';
      }
    },
  },
  'succeededEvents': {
    render: system => {
      if (system.succeededEvents.length >= 1) {
        console.log('成功したイベント:');
        system.succeededEvents.forEach(event => {
          console.log(`${event.id}: ${event.name}: ${event.description} (成功)`);
        });
      } else {
        console.log('成功したイベントはありません。');
      }
    },
    controller: (system, input) => {
      // 成功したイベントは操作できないため、コントローラーは空
      system.nextView = 'menu';
    },
  },
  'failedEvents': {
    render: system => {
      if (system.failedEvents.length >= 1) {
        console.log('失敗したイベント:');
        system.failedEvents.forEach(event => {
          console.log(`${event.id}: ${event.name}: ${event.description} (失敗)`);
        });
      } else {
        console.log('失敗したイベントはありません。');
      }
    },
    controller: (system, input) => {
      // 失敗したイベントは操作できないため、コントローラーは空
      system.nextView = 'menu';
    },
  },
  'InputEvent': {
    render: system => {
      console.log(`イベントID: ${system.currentEvent.id}`);
      console.log(`イベント名: ${system.currentEvent.name}`);
      console.log(`イベント説明: ${system.currentEvent.description}`);
      console.log(`残り時間: ${Math.ceil(system.currentEvent.limitTimeMs / 1000)}秒`);
      console.log(`入力待ち: ${system.currentEvent.targetInput}`);
    },
    controller: (system, input) => {
      system.currentEvent.receiveMessage(input);
    },
  },
};

// ゲームの状態を描画する関数
function render(system) {
  const view = VIEW_LIST[system.nextView];
  if (view) {
    view.render(system);
    const input = prompt();
    view.controller(system, input);
  } else {
    console.log('無効なビューです。');
  }
}

