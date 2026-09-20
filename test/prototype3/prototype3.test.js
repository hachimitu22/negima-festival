import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import GameScene from '../../src/prototype3/gameEngine/gameScene.js';
import GameSystem from '../../src/prototype3/gameEngine/gameSystem.js';
import InputDispatcher from '../../src/prototype3/gameEngine/inputDispatcher.js';
import INPUT_IDS from '../../src/prototype3/inputIds.js';
import Actor from '../../src/prototype3/scenes/mainScene/actors/actor.js';
import ACTOR_IDS from '../../src/prototype3/scenes/mainScene/actors/actorIds.js';
import Negi from '../../src/prototype3/scenes/mainScene/actors/negi.js';
import AREA_IDS from '../../src/prototype3/scenes/mainScene/areaIds.js';
import AreaList from '../../src/prototype3/scenes/mainScene/AreaList.js';
import ClockDateTime from '../../src/prototype3/scenes/mainScene/clockDateTime.js';
import ClockDateTimeRange from '../../src/prototype3/scenes/mainScene/clockDateTimeRange.js';
import { EventTriggerTypes } from '../../src/prototype3/scenes/mainScene/events/eventDataTypes.js';
import EVENT_IDS from '../../src/prototype3/scenes/mainScene/events/eventIds.js';
import MainScene from '../../src/prototype3/scenes/mainScene/mainScene.js';
import Schedule, { SCHEDULE_STATUS } from '../../src/prototype3/scenes/mainScene/schedule.js';
import ScheduleKnowledge from '../../src/prototype3/scenes/mainScene/scheduleKnowledge.js';
import SCHEDULE_IDS from '../../src/prototype3/scenes/mainScene/schedules/scheduleIds.js';
import ActorSystem from '../../src/prototype3/scenes/mainScene/systems/actorSystem.js';
import AreaSystem from '../../src/prototype3/scenes/mainScene/systems/areaSystem.js';
import ClockSystem from '../../src/prototype3/scenes/mainScene/systems/clockSystem.js';
import CassiopeiaSystem from '../../src/prototype3/scenes/mainScene/systems/cassiopeiaSystem.js';
import DialogueSystem from '../../src/prototype3/scenes/mainScene/systems/dialogueSystem.js';
import EventSystem from '../../src/prototype3/scenes/mainScene/systems/eventSystem.js';
import SYSTEM_IDS from '../../src/prototype3/scenes/mainScene/systems/systemIds.js';
import createScheduleTimelineView from '../../src/prototype3/views/scheduleTimelineView.js';

const BASE_CONTEXT = Object.freeze({
  deltaFrames: 0,
  deltaTimeMs: 0,
  frameCount: 1,
  targetFrameTimeMs: 1000 / 60,
});

/** テスト用の具体Scene。 */
class TestScene extends GameScene {
  /**
   * 空のsnapshotを返す。
   * @returns {Object} 空snapshot。
   */
  createSnapshot() {
    return {};
  }
}

/** テスト用の具体System。 */
class TestSystem extends GameSystem {
  /**
   * 指定IDのSystemを生成する。
   * @param {string} systemId - System ID。
   */
  constructor(systemId) {
    super(systemId);
  }
}

/**
 * Sceneを入力付きで1回更新する。
 * @param {GameScene} scene - 対象Scene。
 * @param {Array<Object>} inputs - 入力一覧。
 * @returns {void}
 */
function updateScene(scene, inputs = []) {
  scene.update({ ...BASE_CONTEXT, inputs: [...inputs] });
}

/**
 * 会話の次送り入力を作る。
 * @returns {Object} 次送り入力。
 */
function nextDialogueInput() {
  return { inputId: INPUT_IDS.DIALOGUE.NEXT, params: {} };
}

/**
 * 会話選択入力を作る。
 * @param {string} choiceId - 選択肢ID。
 * @returns {Object} 選択入力。
 */
function chooseDialogueInput(choiceId) {
  return { inputId: INPUT_IDS.DIALOGUE.CHOOSE, params: { choiceId } };
}

/**
 * Actor移動入力を作る。
 * @param {string} areaId - 移動先エリアID。
 * @returns {Object} 移動入力。
 */
function moveInput(areaId) {
  return {
    inputId: INPUT_IDS.ACTOR.AREA_MOVE,
    params: { actorId: ACTOR_IDS.PLAYER, areaId },
  };
}

/**
 * Actorへの会話開始入力を作る。
 * @param {string} actorId - 会話相手のActor ID。
 * @returns {Object} 会話開始入力。
 */
function talkInput(actorId) {
  return { inputId: INPUT_IDS.ACTOR.TALK_START, params: { actorId } };
}

/**
 * 1日目10:00への簡易巻き戻し入力を作る。
 * @returns {Object} 巻き戻し入力。
 */
function rewindTimeInput() {
  return { inputId: INPUT_IDS.CASSIOPEIA.REWIND };
}

/**
 * 実行中会話を最後まで文章送りする。
 * @param {MainScene} scene - 対象Scene。
 * @returns {void}
 */
function finishLinearDialogue(scene) {
  while (scene.createSnapshot().dialogue) {
    updateScene(scene, [nextDialogueInput()]);
  }
}

/**
 * 指定回数だけ時計を5分進め、定時会話があれば完了する。
 * @param {MainScene} scene - 対象Scene。
 * @param {number} count - 進める回数。
 * @returns {void}
 */
function advanceClock(scene, count) {
  const clockSystem = scene.getSystem(SYSTEM_IDS.CLOCK);
  for (let index = 0; index < count; index += 1) {
    clockSystem.setStep();
    updateScene(scene);
    finishLinearDialogue(scene);
  }
}

/**
 * 木乃香イベントを選択直前まで進める。
 * @param {MainScene} scene - 対象Scene。
 * @returns {Object} 選択肢を表示したsnapshot。
 */
function startKonokaHelpEvent(scene) {
  updateScene(scene, [moveInput(AREA_IDS.CAFETERIA)]);
  advanceClock(scene, 5);
  updateScene(scene, [talkInput(ACTOR_IDS.KONOKA)]);
  updateScene(scene, [nextDialogueInput()]);
  return scene.createSnapshot();
}

/**
 * 世界樹前の明日菜イベントを完了する。
 * @param {MainScene} scene - 対象Scene。
 * @returns {void}
 */
function completeWorldTreeAsunaEvent(scene) {
  updateScene(scene, [moveInput(AREA_IDS.WORLD_TREE)]);
  updateScene(scene, [nextDialogueInput()]);
  updateScene(scene, [nextDialogueInput()]);
  updateScene(scene, [chooseDialogueInput('looking-for-asuna')]);
  finishLinearDialogue(scene);
}

describe('GameScene', () => {
  test('SystemをIDで取得し、同じIDの二重登録を拒否する', () => {
    // Arrange
    const scene = new TestScene();
    const system = new TestSystem('system');

    // Act
    scene.addSystem(system);
    const duplicate = () => scene.addSystem(new TestSystem('system'));

    // Assert
    assert.equal(scene.getSystem('system'), system);
    assert.throws(duplicate, /Duplicate systemId/);
  });

});

describe('ClockSystem', () => {
  test('任意の過去日時へ戻し、同時刻と巻き戻し禁止中は変更しない', () => {
    // Arrange
    const clockSystem = new ClockSystem();
    const systems = new Map([[SYSTEM_IDS.EVENT, new EventSystem({ events: [] })]]);
    const context = { getSystem: systems.get.bind(systems) };
    clockSystem.setStep();
    clockSystem.update(context);
    const checkpointDateTime = clockSystem.getDateTime();
    clockSystem.setStep();
    clockSystem.update(context);

    // Act
    const rewound = clockSystem.rewindTo(checkpointDateTime);
    clockSystem.update(context);
    const sameTime = clockSystem.rewindTo(checkpointDateTime);
    clockSystem.setStep();
    clockSystem.update(context);
    clockSystem.disableRewind();
    const disabled = clockSystem.rewindTo(checkpointDateTime);

    // Assert
    assert.equal(rewound, true);
    assert.equal(sameTime, false);
    assert.equal(disabled, false);
    assert.equal(clockSystem.getDateTime().getTime(), checkpointDateTime.add({ min: 5 }).getTime());
  });
});

describe('CassiopeiaSystem', () => {
  test('MainSceneからSystem IDで取得できる', () => {
    // Arrange
    const scene = new MainScene();

    // Act
    const cassiopeiaSystem = scene.getSystem(SYSTEM_IDS.CASSIOPEIA);

    // Assert
    assert.ok(cassiopeiaSystem instanceof CassiopeiaSystem);
  });

  test('10:00に記録した値へ戻し、生成時の値やその後の変更に依存しない', () => {
    // Arrange
    const clockSystem = new ClockSystem();
    const actorSystem = new ActorSystem({ scheduleKnowledge: new ScheduleKnowledge() });
    const eventSystem = new EventSystem({ events: [{
      id: 'event.checkpoint',
      trigger: {
        type: EventTriggerTypes.TIME_REACHED,
        time: { date: 20, hour: 10, min: 0 },
      },
      dialogue: {
        steps: [{ type: 'message', message: { speaker: 'テスト', text: '会話' } }],
      },
    }] });
    const inputDispatcher = new InputDispatcher();
    const systems = new Map([[SYSTEM_IDS.EVENT, eventSystem]]);
    const context = { getSystem: systems.get.bind(systems) };
    const dateTime = clockSystem.getDateTime();
    const schedule = new Schedule({
      id: 'schedule.checkpoint',
      dateTimeRange: new ClockDateTimeRange({
        from: dateTime,
        to: dateTime.add({ min: 5 }),
      }),
      areaId: AREA_IDS.CAFETERIA,
    }, false, dateTime);
    const player = new Negi({ areaId: AREA_IDS.SCHOOL_ENTRANCE });
    const npc = new Actor({
      id: ACTOR_IDS.ASUNA,
      name: '明日菜',
      areaId: AREA_IDS.WORLD_TREE,
      schedules: [schedule],
    });
    actorSystem.addActor(player);
    actorSystem.addActor(npc);
    npc.moveTo(AREA_IDS.PLAZA);
    schedule.enable();
    schedule.update(dateTime);
    eventSystem.restoreState([{ id: 'event.checkpoint', status: 'complete' }]);
    const cassiopeiaSystem = new CassiopeiaSystem({ clockSystem, actorSystem, eventSystem });
    cassiopeiaSystem.attach({ inputDispatcher });
    player.moveTo(AREA_IDS.CAFETERIA);
    npc.moveTo(AREA_IDS.WORLD_TREE);
    schedule.update(dateTime.add({ min: 5 }));
    eventSystem.restoreState([{ id: 'event.checkpoint', status: 'waiting' }]);
    clockSystem.setStep();
    clockSystem.update(context);

    // Act
    inputDispatcher.dispatchAll([rewindTimeInput()], context);
    const restored = actorSystem.createActorsSnapshot();
    const restoredEvents = eventSystem.createEventsSnapshot();
    clockSystem.setStep();
    clockSystem.update(context);
    npc.moveTo(AREA_IDS.WORLD_TREE);
    eventSystem.restoreState([{ id: 'event.checkpoint', status: 'waiting' }]);
    inputDispatcher.dispatchAll([rewindTimeInput()], context);
    const restoredAgain = actorSystem.createActorsSnapshot();

    // Assert
    assert.equal(clockSystem.getDateTime().getTime(), dateTime.getTime());
    assert.equal(restored.find(actor => actor.id === ACTOR_IDS.PLAYER).areaId, AREA_IDS.CAFETERIA);
    assert.equal(restored.find(actor => actor.id === ACTOR_IDS.ASUNA).areaId, AREA_IDS.PLAZA);
    assert.equal(restored.find(actor => actor.id === ACTOR_IDS.ASUNA).schedules[0].enabled, true);
    assert.equal(restored.find(actor => actor.id === ACTOR_IDS.ASUNA).schedules[0].status, SCHEDULE_STATUS.ACTIVE);
    assert.equal(restoredEvents[0].status, 'complete');
    assert.equal(restoredAgain.find(actor => actor.id === ACTOR_IDS.ASUNA).areaId, AREA_IDS.PLAZA);
    assert.equal(restoredAgain.find(actor => actor.id === ACTOR_IDS.ASUNA).schedules[0].status, SCHEDULE_STATUS.ACTIVE);
    assert.equal(eventSystem.createEventsSnapshot()[0].status, 'complete');
  });
});

describe('Actor', () => {
  test('現在地とScheduleの記録と復元を独立した値で行う', () => {
    // Arrange
    const dateTime = new ClockDateTime();
    const actor = new Actor({
      id: ACTOR_IDS.ASUNA,
      name: '明日菜',
      areaId: AREA_IDS.WORLD_TREE,
      schedules: [true, false].map((enabled, index) => new Schedule({
        id: `schedule.${index}`,
        dateTimeRange: new ClockDateTimeRange({
          from: dateTime,
          to: dateTime.add({ min: 60 }),
        }),
        areaId: AREA_IDS.WORLD_TREE,
      }, enabled, dateTime)),
    });

    // Act
    const state = actor.captureState();
    actor.enableSchedule('schedule.1');
    actor.update({ areas: [], dateTime });
    actor.update({ areas: [], dateTime: dateTime.add({ min: 60 }) });
    actor.moveTo(AREA_IDS.CAFETERIA);
    const finished = actor.captureState();
    const recorded = structuredClone(state);
    actor.restore(state);
    state.areaId = AREA_IDS.PLAZA;
    state.schedules[0].enabled = false;
    const restored = actor.createSnapshot();

    // Assert
    assert.deepEqual(recorded, {
      areaId: AREA_IDS.WORLD_TREE,
      schedules: [
        { scheduleId: 'schedule.0', enabled: true, status: SCHEDULE_STATUS.ACTIVE },
        { scheduleId: 'schedule.1', enabled: false, status: SCHEDULE_STATUS.WAITING },
      ],
    });
    assert.equal(finished.areaId, AREA_IDS.CAFETERIA);
    assert.ok(finished.schedules.every(state => state.status === SCHEDULE_STATUS.FINISHED));
    assert.equal(restored.areaId, AREA_IDS.WORLD_TREE);
    assert.deepEqual(restored.schedules.map(({ id, enabled, status }) => ({ id, enabled, status })), [
      { id: 'schedule.0', enabled: true, status: SCHEDULE_STATUS.ACTIVE },
      { id: 'schedule.1', enabled: false, status: SCHEDULE_STATUS.WAITING },
    ]);
  });

  test('ScheduleがないActorの現在地を記録・復元する', () => {
    // Arrange
    const actor = new Actor({ id: ACTOR_IDS.ASUNA, name: '明日菜', areaId: AREA_IDS.WORLD_TREE });

    // Act
    const state = actor.captureState();
    actor.moveTo(AREA_IDS.CAFETERIA);
    actor.restore(state);
    const snapshot = actor.createSnapshot();

    // Assert
    assert.deepEqual(state, { areaId: AREA_IDS.WORLD_TREE, schedules: [] });
    assert.equal(snapshot.areaId, AREA_IDS.WORLD_TREE);
    assert.deepEqual(snapshot.schedules, []);
  });

  test('不明なScheduleの復元を拒否する', () => {
    // Arrange
    const actor = new Actor({ id: ACTOR_IDS.ASUNA, name: '明日菜', areaId: AREA_IDS.WORLD_TREE });
    const before = actor.createSnapshot();

    // Act
    const restore = () => actor.restore({
      areaId: AREA_IDS.CAFETERIA,
      schedules: [{
        scheduleId: 'schedule.missing',
        enabled: true,
        status: SCHEDULE_STATUS.ACTIVE,
      }],
    });

    // Assert
    assert.throws(restore, { message: `schedule-not-found: ${ACTOR_IDS.ASUNA}/schedule.missing` });
    assert.deepEqual(actor.createSnapshot(), before);
  });
});

describe('Negi', () => {
  test('記録を復元しても現在地を維持する', () => {
    // Arrange
    const player = new Negi({ areaId: AREA_IDS.SCHOOL_ENTRANCE });
    const state = player.captureState();
    player.moveTo(AREA_IDS.CAFETERIA);
    const before = player.createSnapshot();

    // Act
    player.restore(state);

    // Assert
    assert.deepEqual(state, { areaId: AREA_IDS.SCHOOL_ENTRANCE, schedules: [] });
    assert.deepEqual(player.createSnapshot(), before);
  });
});

describe('ActorSystem', () => {
  test('記録したNPC位置へ戻し、同じ更新ではActorを移動させない', () => {
    // Arrange
    const actorSystem = new ActorSystem({ scheduleKnowledge: new ScheduleKnowledge() });
    const dateTime = new ClockDateTime();
    const scene = new TestScene();
    const player = new Negi({ areaId: AREA_IDS.SCHOOL_ENTRANCE });
    const npc = new Actor({
      id: ACTOR_IDS.ASUNA,
      name: '明日菜',
      areaId: AREA_IDS.WORLD_TREE,
      schedules: [new Schedule({
        id: 'schedule.test',
        dateTimeRange: new ClockDateTimeRange({
          from: dateTime,
          to: dateTime.add({ min: 60 }),
        }),
        areaId: AREA_IDS.CAFETERIA,
      }, true, dateTime)],
    });
    actorSystem.addActor(player);
    actorSystem.addActor(npc);
    scene.addSystem(new ClockSystem());
    scene.addSystem(actorSystem);
    scene.addSystem(new AreaSystem({ areas: AreaList }));
    scene.addSystem(new DialogueSystem());
    scene.initializeSystems();
    const context = { getSystem: scene.getSystem.bind(scene) };
    npc.moveTo(AREA_IDS.PLAZA);
    const state = actorSystem.captureState();
    player.moveTo(AREA_IDS.CAFETERIA);
    npc.moveTo(AREA_IDS.SCHOOL_ENTRANCE);

    // Act
    actorSystem.restoreState(state);
    actorSystem.update(context);
    const restored = actorSystem.createActorsSnapshot();
    actorSystem.cleanup();
    actorSystem.update(context);
    const resumed = actorSystem.createActorsSnapshot();

    // Assert
    assert.deepEqual(state.map(actor => actor.actorId), [ACTOR_IDS.PLAYER, ACTOR_IDS.ASUNA]);
    assert.equal(state[0].areaId, AREA_IDS.SCHOOL_ENTRANCE);
    assert.equal(restored.find(actor => actor.id === ACTOR_IDS.PLAYER).areaId, AREA_IDS.CAFETERIA);
    assert.equal(restored.find(actor => actor.id === ACTOR_IDS.ASUNA).areaId, AREA_IDS.PLAZA);
    assert.equal(resumed.find(actor => actor.id === ACTOR_IDS.ASUNA).areaId, AREA_IDS.CAFETERIA);
  });

  test('不明なActorの復元を拒否する', () => {
    // Arrange
    const actorSystem = new ActorSystem({ scheduleKnowledge: new ScheduleKnowledge() });

    // Act
    const restore = () => actorSystem.restoreState([{
      actorId: 'actor.missing',
      areaId: AREA_IDS.WORLD_TREE,
      schedules: [],
    }]);

    // Assert
    assert.throws(restore, { message: 'actor-not-found: actor.missing' });
  });

  test('Scheduleを記録時点の有効・実行状態へ戻す', () => {
    // Arrange
    const dateTime = new ClockDateTime();
    const actorSystem = new ActorSystem({ scheduleKnowledge: new ScheduleKnowledge() });
    const npc = new Actor({
      id: ACTOR_IDS.ASUNA,
      name: '明日菜',
      areaId: AREA_IDS.WORLD_TREE,
      schedules: [new Schedule({
        id: 'schedule.test',
        dateTimeRange: new ClockDateTimeRange({
          from: dateTime,
          to: dateTime.add({ min: 60 }),
        }),
        areaId: AREA_IDS.WORLD_TREE,
      }, false, dateTime)],
    });
    actorSystem.addActor(npc);
    actorSystem.enableSchedule(ACTOR_IDS.ASUNA, 'schedule.test');
    npc.update({ areas: [], dateTime });
    const state = actorSystem.captureState();
    npc.update({ areas: [], dateTime: dateTime.add({ min: 60 }) });

    // Act
    actorSystem.restoreState(state);
    const [restored] = actorSystem.createActorsSnapshot();

    // Assert
    assert.equal(restored.schedules[0].enabled, true);
    assert.equal(restored.schedules[0].status, SCHEDULE_STATUS.ACTIVE);
  });

  test('Scheduleの有効化に成功した場合だけScheduleKnowledgeへ登録する', () => {
    // Arrange
    const scheduleKnowledge = new ScheduleKnowledge();
    const actorSystem = new ActorSystem({ scheduleKnowledge });
    const dateTime = new ClockDateTime();
    actorSystem.addActor(new Actor({
      id: ACTOR_IDS.ASUNA,
      name: '明日菜',
      areaId: AREA_IDS.WORLD_TREE,
      schedules: [new Schedule({
        id: 'schedule.exists',
        dateTimeRange: new ClockDateTimeRange({
          from: dateTime,
          to: dateTime.add({ min: 60 }),
        }),
        areaId: AREA_IDS.WORLD_TREE,
      }, false, dateTime)],
    }));

    // Act
    const enabled = actorSystem.enableSchedule(ACTOR_IDS.ASUNA, 'schedule.exists');
    const missing = actorSystem.enableSchedule(ACTOR_IDS.ASUNA, 'schedule.missing');
    const [actorSnapshot] = actorSystem.createActorsSnapshot();
    const scheduleSnapshot = { ...actorSnapshot.schedules[0], actorId: actorSnapshot.id };

    // Assert
    assert.equal(enabled, true);
    assert.equal(missing, false);
    assert.deepEqual(scheduleKnowledge.createScheduleBook([scheduleSnapshot]), {
      schedules: [scheduleSnapshot],
    });
  });
});

describe('EventSystem', () => {
  test('記録した待機状態へ戻すと完了済みイベントを再び開始できる', () => {
    // Arrange
    const scene = new TestScene();
    const clockSystem = new ClockSystem();
    const eventSystem = new EventSystem({ events: [{
      id: 'event.test',
      trigger: {
        type: EventTriggerTypes.TIME_REACHED,
        time: { date: 20, hour: 10, min: 0 },
      },
      dialogue: {
        steps: [{ type: 'message', message: { speaker: 'テスト', text: '会話' } }],
      },
    }] });
    const dialogueSystem = new DialogueSystem();
    scene.addSystem(clockSystem);
    scene.addSystem(eventSystem);
    scene.addSystem(dialogueSystem);
    scene.initializeSystems();
    const context = { getSystem: scene.getSystem.bind(scene) };
    const dateTime = clockSystem.getDateTime();
    const checkpoint = eventSystem.captureState();
    eventSystem.onTimeReached({ dateTime }, context);
    dialogueSystem.next({}, context);
    const completed = eventSystem.createEventsSnapshot();

    // Act
    eventSystem.restoreState(checkpoint);
    const restored = eventSystem.createEventsSnapshot();
    eventSystem.onTimeReached({ dateTime }, context);
    const restarted = eventSystem.createEventsSnapshot();

    // Assert
    assert.equal(completed[0].status, 'complete');
    assert.equal(restored[0].status, 'waiting');
    assert.equal(restarted[0].status, 'executing');
  });

  test('記録した完了状態も一律waitingにせず復元する', () => {
    // Arrange
    const eventSystem = new EventSystem({ events: [{
      id: 'event.completed',
      trigger: { type: EventTriggerTypes.TIME_REACHED, time: { date: 20, hour: 10, min: 0 } },
      dialogue: { steps: [] },
    }] });
    eventSystem.restoreState([{ id: 'event.completed', status: 'complete' }]);
    const checkpoint = eventSystem.captureState();
    eventSystem.restoreState([{ id: 'event.completed', status: 'waiting' }]);

    // Act
    eventSystem.restoreState(checkpoint);

    // Assert
    assert.deepEqual(eventSystem.createEventsSnapshot(), checkpoint);
    assert.equal(eventSystem.createEventsSnapshot()[0].status, 'complete');
  });
});

describe('ScheduleKnowledge', () => {
  test('認知済みIDを重複なく保持し、現在状態から登録順のScheduleBookを作る', () => {
    // Arrange
    const scheduleKnowledge = new ScheduleKnowledge();
    scheduleKnowledge.learn('schedule.second');
    scheduleKnowledge.learn('schedule.first');
    scheduleKnowledge.learn('schedule.second');

    // Act
    const scheduleBook = scheduleKnowledge.createScheduleBook([
      { id: 'schedule.first', status: SCHEDULE_STATUS.WAITING },
      { id: 'schedule.second', status: SCHEDULE_STATUS.ACTIVE },
    ]);

    // Assert
    assert.deepEqual(scheduleBook, {
      schedules: [
        { id: 'schedule.second', status: SCHEDULE_STATUS.ACTIVE },
        { id: 'schedule.first', status: SCHEDULE_STATUS.WAITING },
      ],
    });
  });

  test('認知済みIDに対応するScheduleがなければ拒否する', () => {
    // Arrange
    const scheduleKnowledge = new ScheduleKnowledge();
    scheduleKnowledge.learn('schedule.missing');

    // Act
    const createScheduleBook = () => scheduleKnowledge.createScheduleBook([]);

    // Assert
    assert.throws(createScheduleBook, /schedule-not-found/);
  });
});

describe('Schedule', () => {
  test('生成時と異なる有効・実行状態を記録どおり復元する', () => {
    // Arrange
    const dateTime = new ClockDateTime({ date: 20, hour: 10, min: 0 });
    const schedule = new Schedule({
      id: 'schedule.dynamic',
      dateTimeRange: new ClockDateTimeRange({
        from: new ClockDateTime({ date: 20, hour: 10, min: 0 }),
        to: new ClockDateTime({ date: 20, hour: 11, min: 0 }),
      }),
      areaId: AREA_IDS.PLAZA,
    }, false, dateTime);
    schedule.enable();
    schedule.update(dateTime);
    const checkpoint = schedule.captureState();
    schedule.update(dateTime.add({ min: 60 }));

    // Act
    schedule.restoreState(checkpoint);
    const restored = schedule.createSnapshot();

    // Assert
    assert.equal(restored.enabled, true);
    assert.equal(restored.status, SCHEDULE_STATUS.ACTIVE);
    assert.deepEqual(checkpoint, { enabled: true, status: SCHEDULE_STATUS.ACTIVE });
  });

  test('終了済みの状態を時刻による再計算なしで復元する', () => {
    // Arrange
    const dateTime = new ClockDateTime();
    const schedule = new Schedule({
      id: 'schedule.initial',
      dateTimeRange: new ClockDateTimeRange({
        from: dateTime,
        to: dateTime.add({ min: 15 }),
      }),
      areaId: AREA_IDS.WORLD_TREE,
    }, true, dateTime);
    schedule.update(dateTime.add({ min: 20 }));
    const checkpoint = schedule.captureState();
    schedule.restoreState({ enabled: true, status: SCHEDULE_STATUS.WAITING });

    // Act
    schedule.restoreState(checkpoint);
    const restored = schedule.createSnapshot();

    // Assert
    assert.equal(restored.enabled, true);
    assert.equal(restored.status, SCHEDULE_STATUS.FINISHED);
  });
});

describe('ScheduleTimelineView', () => {
  test('認知済みScheduleの実行判定と実行状態を表示する', () => {
    // Arrange
    const previousDocument = globalThis.document;
    const previousVis = globalThis.vis;
    let dataset;
    globalThis.document = {
      createElement: () => ({}),
    };
    globalThis.vis = {
      DataSet: class {
        constructor(items) {
          this.items = [...items];
          dataset = this;
        }

        clear() {
          this.items = [];
        }

        add(items) {
          this.items.push(...items);
        }
      },
      Timeline: class {
        setCurrentTime() {}
      },
    };
    const schedules = [
      {
        id: 'schedule.active',
        actorId: ACTOR_IDS.ASUNA,
        dateTimeRange: { from: '2020/06/20 10:00', to: '2020/06/20 11:00' },
        enabled: true,
        status: SCHEDULE_STATUS.ACTIVE,
      },
      {
        id: 'schedule.waiting',
        actorId: ACTOR_IDS.NODOKA,
        dateTimeRange: { from: '2020/06/20 11:00', to: '2020/06/20 12:00' },
        enabled: true,
        status: SCHEDULE_STATUS.WAITING,
      },
      {
        id: 'schedule.disabled',
        actorId: ACTOR_IDS.KONOKA,
        dateTimeRange: { from: '2020/06/20 12:00', to: '2020/06/20 13:00' },
        enabled: false,
        status: SCHEDULE_STATUS.WAITING,
      },
    ];

    try {
      // Act
      createScheduleTimelineView(() => {}, {
        clock: '2020/06/20 10:00',
        scheduleBook: { schedules },
      });

      // Assert
      assert.deepEqual(dataset.items.map(item => ({
        id: item.id,
        group: item.group,
        content: item.content,
        style: item.style,
      })), [
        {
          id: 'schedule.active',
          group: ACTOR_IDS.ASUNA,
          content: 'schedule.active',
          style: 'background-color: green;',
        },
        {
          id: 'schedule.waiting',
          group: ACTOR_IDS.NODOKA,
          content: 'schedule.waiting',
          style: 'background-color: gray;',
        },
        {
          id: 'schedule.disabled',
          group: ACTOR_IDS.KONOKA,
          content: 'schedule.disabled（無効）',
          style: 'background-color: gray;',
        },
      ]);
    } finally {
      if (previousDocument === undefined) {
        delete globalThis.document;
      } else {
        globalThis.document = previousDocument;
      }
      if (previousVis === undefined) {
        delete globalThis.vis;
      } else {
        globalThis.vis = previousVis;
      }
    }
  });
});

describe('MainScene', () => {
  test('世界樹への進入で明日菜イベントを開始して選択結果へ分岐する', () => {
    // Arrange
    const scene = new MainScene();

    // Act
    updateScene(scene, [moveInput(AREA_IDS.WORLD_TREE)]);
    updateScene(scene, [nextDialogueInput()]);
    updateScene(scene, [nextDialogueInput()]);
    const choices = scene.createSnapshot();
    updateScene(scene, [chooseDialogueInput('looking-for-asuna')]);
    const result = scene.createSnapshot();

    // Assert
    assert.deepEqual(choices.dialogue.choices.map(choice => choice.id), [
      'look-around-festival',
      'looking-for-asuna',
      'forget',
    ]);
    assert.equal(result.dialogue.text, 'な、何よ急に。');
  });

  test('10:30に木乃香へ話しかけると手伝いイベントを開始する', () => {
    // Arrange
    const scene = new MainScene();

    // Act
    const snapshot = startKonokaHelpEvent(scene);

    // Assert
    assert.match(snapshot.clock, /10:30/);
    assert.equal(snapshot.dialogue.text, 'どっちを手伝ってくれる？');
    assert.deepEqual(snapshot.dialogue.choices, [
      { id: 'serve-food', text: '料理を運びます' },
      { id: 'clear-dishes', text: '食器を片づけます' },
    ]);
  });

  test('料理を運ぶ選択結果を表示して完了後は通常会話へ戻る', () => {
    // Arrange
    const scene = new MainScene();
    startKonokaHelpEvent(scene);

    // Act
    updateScene(scene, [chooseDialogueInput('serve-food')]);
    const selected = scene.createSnapshot();
    updateScene(scene, [nextDialogueInput()]);
    const result = scene.createSnapshot();
    updateScene(scene, [nextDialogueInput()]);
    updateScene(scene, [talkInput(ACTOR_IDS.KONOKA)]);
    const repeated = scene.createSnapshot();

    // Assert
    assert.match(selected.dialogue.text, /料理を運びます/);
    assert.match(result.dialogue.text, /みんな届けられた/);
    assert.equal(
      result.events.find(event => event.id === EVENT_IDS.CAFETERIA_KONOKA_HELP).status,
      'executing',
    );
    assert.equal(
      repeated.events.find(event => event.id === EVENT_IDS.CAFETERIA_KONOKA_HELP).status,
      'complete',
    );
    assert.match(repeated.dialogue.text, /麻帆良祭楽しんどる/);
  });

  test('食器を片づける選択では異なる結果を表示する', () => {
    // Arrange
    const scene = new MainScene();
    startKonokaHelpEvent(scene);

    // Act
    updateScene(scene, [chooseDialogueInput('clear-dishes')]);
    updateScene(scene, [nextDialogueInput()]);
    const result = scene.createSnapshot();

    // Assert
    assert.match(result.dialogue.text, /次のお客さんを案内できる/);
  });

  test('10:45ちょうどは木乃香手伝いイベントを開始できる', () => {
    // Arrange
    const scene = new MainScene();
    updateScene(scene, [moveInput(AREA_IDS.CAFETERIA)]);
    advanceClock(scene, 8);

    // Act
    updateScene(scene, [talkInput(ACTOR_IDS.KONOKA)]);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.match(snapshot.clock, /10:45/);
    assert.match(snapshot.dialogue.text, /食堂の手伝い/);
  });

  test('10:30より前は木乃香の通常会話を開始する', () => {
    // Arrange
    const scene = new MainScene();
    updateScene(scene, [moveInput(AREA_IDS.CAFETERIA)]);

    // Act
    updateScene(scene, [talkInput(ACTOR_IDS.KONOKA)]);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.match(snapshot.clock, /10:05/);
    assert.match(snapshot.dialogue.text, /麻帆良祭楽しんどる/);
    assert.equal(
      snapshot.events.find(event => event.id === EVENT_IDS.CAFETERIA_KONOKA_HELP).status,
      'waiting',
    );
  });

  test('10:45を過ぎると木乃香の通常会話を開始する', () => {
    // Arrange
    const originalRandom = Math.random;
    Math.random = () => 0.99;

    try {
      const scene = new MainScene();
      updateScene(scene, [moveInput(AREA_IDS.CAFETERIA)]);
      advanceClock(scene, 9);

      // Act
      updateScene(scene, [talkInput(ACTOR_IDS.KONOKA)]);
      const snapshot = scene.createSnapshot();

      // Assert
      assert.match(snapshot.clock, /10:50/);
      assert.match(snapshot.dialogue.text, /麻帆良祭楽しんどる/);
      assert.equal(
        snapshot.events.find(event => event.id === EVENT_IDS.CAFETERIA_KONOKA_HELP).status,
        'waiting',
      );
    } finally {
      Math.random = originalRandom;
    }
  });

  test('簡易巻き戻しはプレイヤーの現在地を維持し、NPCとイベントを10:00時点へ戻す', () => {
    // Arrange
    const scene = new MainScene();
    completeWorldTreeAsunaEvent(scene);
    updateScene(scene, [moveInput(AREA_IDS.CAFETERIA)]);
    const actorSystem = scene.getSystem(SYSTEM_IDS.ACTOR);
    actorSystem.moveActor({ actorId: ACTOR_IDS.ASUNA, areaId: AREA_IDS.PLAZA }, {
      getSystem: scene.getSystem.bind(scene),
    });
    const before = scene.createSnapshot();

    // Act
    updateScene(scene, [rewindTimeInput()]);
    const after = scene.createSnapshot();
    updateScene(scene, [moveInput(AREA_IDS.WORLD_TREE)]);
    const replayed = scene.createSnapshot();

    // Assert
    assert.match(before.clock, /10:10/);
    assert.equal(before.canRewindTime, true);
    assert.equal(before.actors.find(actor => actor.id === ACTOR_IDS.ASUNA).areaId, AREA_IDS.PLAZA);
    assert.equal(before.events.find(event => event.id === EVENT_IDS.WORLD_TREE_ASUNA).status, 'complete');
    assert.match(after.clock, /10:00/);
    assert.equal(after.canRewindTime, false);
    assert.equal(after.player.areaId, before.player.areaId);
    assert.equal(after.actors.find(actor => actor.id === ACTOR_IDS.ASUNA).areaId, AREA_IDS.WORLD_TREE);
    assert.ok(after.events.every(event => event.status === 'waiting'));
    assert.equal(replayed.events.find(event => event.id === EVENT_IDS.WORLD_TREE_ASUNA).status, 'executing');
  });

  test('初期認知スケジュールをScheduleBookへ表示する', () => {
    // Arrange & Act
    const snapshot = new MainScene().createSnapshot();

    // Assert
    assert.deepEqual(snapshot.scheduleBook.schedules.map(schedule => schedule.id), [
      SCHEDULE_IDS.ASUNA.WORLD_TREE_WAITING,
      SCHEDULE_IDS.NODOKA.PLAZA_WAITING,
      SCHEDULE_IDS.KONOKA.CAFETERIA_HELP,
    ]);
    assert.deepEqual(snapshot.scheduleBook.schedules.map(schedule => schedule.actorId), [
      ACTOR_IDS.ASUNA,
      ACTOR_IDS.NODOKA,
      ACTOR_IDS.KONOKA,
    ]);
  });

  test('一度認知したScheduleは巻き戻し後も表示し、実行状態だけを初期化する', () => {
    // Arrange
    const scene = new MainScene();
    completeWorldTreeAsunaEvent(scene);
    const enabled = scene.createSnapshot();

    // Act
    updateScene(scene, [rewindTimeInput()]);
    const rewound = scene.createSnapshot();

    // Assert
    const enabledSchedule = enabled.scheduleBook.schedules
      .find(schedule => schedule.id === SCHEDULE_IDS.ASUNA.PLAZA_WAITING);
    const rewoundSchedule = rewound.scheduleBook.schedules
      .find(schedule => schedule.id === SCHEDULE_IDS.ASUNA.PLAZA_WAITING);
    assert.equal(enabledSchedule.enabled, true);
    assert.equal(rewoundSchedule.enabled, false);
    assert.equal(rewoundSchedule.status, SCHEDULE_STATUS.WAITING);
  });

  test('1日目10:00では簡易巻き戻しを実行しない', () => {
    // Arrange
    const scene = new MainScene();
    const before = scene.createSnapshot();

    // Act
    updateScene(scene, [rewindTimeInput()]);
    const after = scene.createSnapshot();

    // Assert
    assert.equal(before.canRewindTime, false);
    assert.deepEqual(after, before);
  });

  test('会話中は簡易巻き戻しを実行しない', () => {
    // Arrange
    const scene = new MainScene();
    updateScene(scene, [moveInput(AREA_IDS.CAFETERIA)]);
    updateScene(scene, [talkInput(ACTOR_IDS.KONOKA)]);
    const before = scene.createSnapshot();

    // Act
    updateScene(scene, [rewindTimeInput()]);
    const after = scene.createSnapshot();

    // Assert
    assert.match(before.clock, /10:05/);
    assert.equal(before.canRewindTime, false);
    assert.equal(after.clock, before.clock);
    assert.deepEqual(after.dialogue, before.dialogue);
    assert.deepEqual(after.actors, before.actors);
    assert.deepEqual(after.events, before.events);
  });

  test('巻き戻し後に時刻を進めると再び簡易巻き戻し可能になる', () => {
    // Arrange
    const scene = new MainScene();
    updateScene(scene, [moveInput(AREA_IDS.CAFETERIA)]);
    updateScene(scene, [rewindTimeInput()]);

    // Act
    updateScene(scene, [moveInput(AREA_IDS.SCHOOL_ENTRANCE)]);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.match(snapshot.clock, /10:05/);
    assert.equal(snapshot.canRewindTime, true);
  });
});
