import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import GameScene from '../../src/prototype3/gameEngine/gameScene.js';
import GameSystem from '../../src/prototype3/gameEngine/gameSystem.js';
import INPUT_IDS from '../../src/prototype3/inputIds.js';
import ACTOR_IDS from '../../src/prototype3/scenes/mainScene/actors/actorIds.js';
import AREA_IDS from '../../src/prototype3/scenes/mainScene/areaIds.js';
import EVENT_IDS from '../../src/prototype3/scenes/mainScene/events/eventIds.js';
import MainScene from '../../src/prototype3/scenes/mainScene/mainScene.js';
import ActorSystem from '../../src/prototype3/scenes/mainScene/systems/actorSystem.js';
import ClockSystem from '../../src/prototype3/scenes/mainScene/systems/clockSystem.js';
import SYSTEM_IDS from '../../src/prototype3/scenes/mainScene/systems/systemIds.js';

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

/** ClockSystemの時刻到達通知を受けるテスト用System。 */
class TestEventSystem extends GameSystem {
  constructor() {
    super(SYSTEM_IDS.EVENT);
  }

  onTimeReached() {
  }
}

/** ClockSystemの巻き戻し状態をSystem更新中に記録するテスト用System。 */
class RewindObserverSystem extends GameSystem {
  states = [];

  constructor() {
    super('rewind-observer');
  }

  update(context) {
    this.states.push(context.getSystem(SYSTEM_IDS.CLOCK).isRewinding());
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
  return { inputId: INPUT_IDS.CLOCK.REWIND_TO_START };
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

  test('巻き戻し状態をSystem更新中だけ公開する', () => {
    // Arrange
    const scene = new TestScene();
    const clockSystem = new ClockSystem();
    const observerSystem = new RewindObserverSystem();
    scene.addSystem(clockSystem);
    scene.addSystem(new TestEventSystem());
    scene.addSystem(observerSystem);
    scene.initializeSystems();
    clockSystem.setStep();
    updateScene(scene);

    // Act
    updateScene(scene, [rewindTimeInput()]);
    const afterCleanup = clockSystem.isRewinding();
    updateScene(scene, [rewindTimeInput()]);

    // Assert
    assert.deepEqual(observerSystem.states, [false, true, false]);
    assert.equal(afterCleanup, false);
    assert.equal(clockSystem.isRewinding(), false);
  });
});

describe('ActorSystem', () => {
  test('巻き戻し状態ではActorを更新しない', () => {
    // Arrange
    const actorSystem = new ActorSystem();
    let updateCount = 0;
    actorSystem.addActor({
      id: 'test-actor',
      update: () => {
        updateCount += 1;
      },
    });
    const context = {
      getSystem: systemId => {
        assert.equal(systemId, SYSTEM_IDS.CLOCK);
        return { isRewinding: () => true };
      },
    };

    // Act
    actorSystem.update(context);

    // Assert
    assert.equal(updateCount, 0);
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

  test('簡易巻き戻しは時刻だけを1日目10:00へ戻す', () => {
    // Arrange
    const scene = new MainScene();
    updateScene(scene, [moveInput(AREA_IDS.CAFETERIA)]);
    updateScene(scene, [moveInput(AREA_IDS.SCHOOL_ENTRANCE)]);
    const before = scene.createSnapshot();

    // Act
    updateScene(scene, [rewindTimeInput()]);
    const after = scene.createSnapshot();

    // Assert
    assert.match(before.clock, /10:10/);
    assert.equal(before.canRewindTime, true);
    assert.match(after.clock, /10:00/);
    assert.equal(after.canRewindTime, false);
    assert.equal(after.player.areaId, before.player.areaId);
    assert.deepEqual(after.actors, before.actors);
    assert.deepEqual(after.events, before.events);
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
