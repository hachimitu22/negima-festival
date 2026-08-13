import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import GameScene from '../../src/prototype3/gameEngine/gameScene.js';
import GameSystem from '../../src/prototype3/gameEngine/gameSystem.js';
import Actor from '../../src/prototype3/scenes/mainScene/actor.js';
import AREA_IDS from '../../src/prototype3/scenes/mainScene/areaIds.js';
import MainScene from '../../src/prototype3/scenes/mainScene/mainScene.js';
import ActorSystem from '../../src/prototype3/scenes/mainScene/systems/actorSystem.js';
import AreaSystem from '../../src/prototype3/scenes/mainScene/systems/areaSystem.js';
import DialogueSystem from '../../src/prototype3/scenes/mainScene/systems/dialogueSystem.js';
import EventSystem from '../../src/prototype3/scenes/mainScene/systems/eventSystem.js';

const CONTEXT = Object.freeze({
  deltaFrames: 0,
  deltaTimeMs: 0,
  frameCount: 1,
  targetFrameTimeMs: 1000 / 60,
  inputs: [],
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
   * @param {string} systemId - System ID。
   * @param {string|null} requiredSystemId - 要求するSystem ID。
   */
  constructor(systemId, requiredSystemId = null) {
    super(systemId);
    this.requiredSystemId = requiredSystemId;
    this.dependency = null;
  }

  /**
   * 任意の依存を取得する。
   * @param {Object} dependencies - 依存解決API。
   * @param {Function} dependencies.requireSystem - System取得関数。
   * @returns {void}
   */
  attach({ requireSystem }) {
    if (this.requiredSystemId) {
      this.dependency = requireSystem(this.requiredSystemId);
    }
  }
}

/**
 * MainSceneを入力付きで1回更新する。
 * @param {MainScene} scene - 対象Scene。
 * @param {Array<Object>} inputs - 入力一覧。
 * @returns {void}
 */
function updateScene(scene, inputs = []) {
  scene.update({ context: { ...CONTEXT, inputs } });
}

describe('GameScene', () => {
  test('SystemをIDで取得し、全登録後に依存を解決する', () => {
    // Arrange
    const scene = new TestScene();
    const provider = new TestSystem('provider');
    const consumer = new TestSystem('consumer', 'provider');
    scene.addSystem(consumer);
    scene.addSystem(provider);

    // Act
    scene.initializeSystems();

    // Assert
    assert.equal(scene.getSystem('provider'), provider);
    assert.equal(consumer.dependency, provider);
  });

  test('同じSystem IDを二重登録できない', () => {
    // Arrange
    const scene = new TestScene();
    scene.addSystem(new TestSystem('same'));

    // Act
    const action = () => scene.addSystem(new TestSystem('same'));

    // Assert
    assert.throws(action, /Duplicate systemId/);
  });
});

describe('ActorSystemとAreaSystem', () => {
  test('存在するエリアへ移動し、snapshotへ反映する', () => {
    // Arrange
    const scene = new TestScene();
    const actorSystem = new ActorSystem();
    const areaSystem = new AreaSystem({
      areas: [
        { id: 'one', name: '一' },
        { id: 'two', name: '二' },
      ],
    });
    actorSystem.addActor(new Actor({ id: 'player', name: 'Player', areaId: 'one' }));
    scene.addSystem(actorSystem);
    scene.addSystem(areaSystem);
    scene.initializeSystems();

    // Act
    const moved = actorSystem.requestMoveActor({ actorId: 'player', areaId: 'two' });
    const actors = actorSystem.createActorsSnapshot();
    const areas = areaSystem.createAreasSnapshot();
    const rejected = actorSystem.requestMoveActor({ actorId: 'player', areaId: 'missing' });

    // Assert
    assert.deepEqual(moved, { accepted: true, succeeded: true });
    assert.equal(actors[0].areaId, 'two');
    assert.deepEqual(areas.map(area => area.id), ['one', 'two']);
    assert.equal(rejected.reason, 'area-not-found');
  });
});

describe('DialogueSystem', () => {
  test('会話を順に進め、完了結果を一度だけ返す', () => {
    // Arrange
    const dialogueSystem = new DialogueSystem();
    const messages = [
      { speaker: 'A', text: 'one' },
      { speaker: 'B', text: 'two' },
    ];

    // Act
    const started = dialogueSystem.requestStart({ ownerId: 'event', messages });
    const duplicate = dialogueSystem.requestStart({ ownerId: 'other', messages });
    const firstAdvance = dialogueSystem.requestAdvance();
    const secondAdvance = dialogueSystem.requestAdvance();
    const result = dialogueSystem.takeRequestResult(started.requestId);

    // Assert
    assert.equal(started.accepted, true);
    assert.equal(duplicate.accepted, false);
    assert.deepEqual(firstAdvance, { accepted: true, completed: false });
    assert.deepEqual(secondAdvance, { accepted: true, completed: true });
    assert.deepEqual(result, { succeeded: true });
    assert.equal(dialogueSystem.takeRequestResult(started.requestId), null);
  });

  test('選択が必要な会話で選んだ分岐へ進む', () => {
    // Arrange
    const dialogueSystem = new DialogueSystem();
    dialogueSystem.requestStart({
      ownerId: 'event',
      messages: [{ speaker: 'A', text: 'question' }],
      choices: [
        { id: 'first', text: 'First', messages: [{ speaker: 'B', text: 'first result' }] },
        { id: 'second', text: 'Second', messages: [{ speaker: 'B', text: 'second result' }] },
      ],
    });

    // Act
    const choiceSnapshot = dialogueSystem.createDialogueSnapshot();
    const advanceRejected = dialogueSystem.requestAdvance();
    const unknownRejected = dialogueSystem.requestChoose('unknown');
    const selected = dialogueSystem.requestChoose('second');
    const branchSnapshot = dialogueSystem.createDialogueSnapshot();

    // Assert
    assert.deepEqual(choiceSnapshot.choices, [
      { id: 'first', text: 'First' },
      { id: 'second', text: 'Second' },
    ]);
    assert.equal(advanceRejected.reason, 'choice-required');
    assert.equal(unknownRejected.reason, 'choice-not-found');
    assert.deepEqual(selected, { accepted: true });
    assert.equal(branchSnapshot.text, 'second result');
    assert.deepEqual(branchSnapshot.choices, []);
  });
});

describe('EventSystem', () => {
  test('任意のイベントデータに記述されたエリアと会話を実行する', () => {
    // Arrange
    const events = [{
      id: 'plaza-greeting',
      areaId: AREA_IDS.PLAZA,
      dialogue: {
        messages: [{ speaker: '案内役', text: '広場へようこそ。' }],
      },
    }];
    const scene = new TestScene();
    const eventSystem = new EventSystem({ events });
    const dialogueSystem = new DialogueSystem();
    scene.addSystem(eventSystem);
    scene.addSystem(dialogueSystem);
    scene.initializeSystems();

    // Act
    eventSystem.requestAreaEntered(AREA_IDS.WORLD_TREE);
    const beforeTrigger = dialogueSystem.createDialogueSnapshot();
    eventSystem.requestAreaEntered(AREA_IDS.PLAZA);
    const executing = dialogueSystem.createDialogueSnapshot();
    dialogueSystem.requestAdvance();
    updateScene(scene);
    const completed = eventSystem.createEventsSnapshot();

    // Assert
    assert.equal(beforeTrigger, null);
    assert.deepEqual(executing, {
      speaker: '案内役',
      text: '広場へようこそ。',
      messageIndex: 0,
      messageCount: 1,
      choices: [],
    });
    assert.deepEqual(completed, [{ id: 'plaza-greeting', status: 'completed' }]);
  });

  test('重複したイベントIDを拒否する', () => {
    // Arrange
    const event = {
      id: 'duplicate',
      areaId: AREA_IDS.PLAZA,
      dialogue: { messages: [{ speaker: 'A', text: 'message' }] },
    };

    // Act
    const action = () => new EventSystem({ events: [event, event] });

    // Assert
    assert.throws(action, /Duplicate event id/);
  });

  test('発生エリアのないイベントデータを拒否する', () => {
    // Arrange
    const event = {
      id: 'unsupported',
      dialogue: { messages: [{ speaker: 'A', text: 'message' }] },
    };

    // Act
    const action = () => new EventSystem({ events: [event] });

    // Assert
    assert.throws(action, /must have an areaId/);
  });
});

describe('MainScene', () => {
  test('世界樹への移動で会話を開始し、完了後は再実行しない', () => {
    // Arrange
    const scene = new MainScene();

    // Act
    const initial = scene.createSnapshot();
    updateScene(scene, [{ type: 'area.move', areaId: AREA_IDS.WORLD_TREE }]);
    const asunaDialogue = scene.createSnapshot();
    updateScene(scene, [{ type: 'area.move', areaId: AREA_IDS.PLAZA }]);
    const moveBlocked = scene.createSnapshot();
    updateScene(scene, [{ type: 'dialogue.next' }]);
    const advanceBlocked = scene.createSnapshot();
    updateScene(scene, [{ type: 'dialogue.choose', choiceId: 'look-around-festival' }]);
    const negiDialogue = scene.createSnapshot();
    updateScene(scene, [{ type: 'dialogue.next' }]);
    const branchDialogue = scene.createSnapshot();
    updateScene(scene, [{ type: 'dialogue.next' }]);
    const completed = scene.createSnapshot();
    updateScene(scene, [{ type: 'area.move', areaId: AREA_IDS.PLAZA }]);
    updateScene(scene, [{ type: 'area.move', areaId: AREA_IDS.WORLD_TREE }]);
    const revisited = scene.createSnapshot();

    // Assert
    assert.equal(initial.player.areaId, AREA_IDS.SCHOOL_ENTRANCE);
    assert.deepEqual(initial.moveableAreas.map(area => area.id), [AREA_IDS.WORLD_TREE, AREA_IDS.PLAZA]);
    assert.equal(asunaDialogue.dialogue.speaker, '明日菜');
    assert.deepEqual(asunaDialogue.dialogue.choices.map(choice => choice.id), [
      'look-around-festival',
      'looking-for-asuna',
    ]);
    assert.equal(moveBlocked.player.areaId, AREA_IDS.WORLD_TREE);
    assert.equal(advanceBlocked.dialogue.speaker, '明日菜');
    assert.equal(negiDialogue.dialogue.speaker, 'ネギ');
    assert.equal(negiDialogue.dialogue.text, '麻帆良祭の様子を見て回っているんです。');
    assert.equal(branchDialogue.dialogue.text, '相変わらず真面目ね。');
    assert.equal(completed.dialogue, null);
    assert.equal(completed.events[0].status, 'completed');
    assert.equal(revisited.dialogue, null);
    assert.equal(revisited.events[0].status, 'completed');
  });

  test('明日菜を探す選択肢で異なる会話へ分岐する', () => {
    // Arrange
    const scene = new MainScene();

    // Act
    updateScene(scene, [{ type: 'area.move', areaId: AREA_IDS.WORLD_TREE }]);
    updateScene(scene, [{ type: 'dialogue.choose', choiceId: 'looking-for-asuna' }]);
    const negiDialogue = scene.createSnapshot();
    updateScene(scene, [{ type: 'dialogue.next' }]);
    const asunaDialogue = scene.createSnapshot();
    updateScene(scene, [{ type: 'dialogue.next' }]);
    const completed = scene.createSnapshot();

    // Assert
    assert.equal(negiDialogue.dialogue.text, '明日菜さんを探していたんです。');
    assert.equal(asunaDialogue.dialogue.text, 'な、何よ急に。');
    assert.equal(completed.events[0].status, 'completed');
  });

  test('広場への移動ではイベントを開始しない', () => {
    // Arrange
    const scene = new MainScene();

    // Act
    updateScene(scene, [{ type: 'area.move', areaId: AREA_IDS.PLAZA }]);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.player.areaId, AREA_IDS.PLAZA);
    assert.equal(snapshot.dialogue, null);
    assert.equal(snapshot.events[0].status, 'waiting');
  });

  test('移動要求の失敗時はイベントを開始しない', () => {
    // Arrange
    const scene = new MainScene();

    // Act
    updateScene(scene, [{ type: 'area.move', areaId: 'missing' }]);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.player.areaId, AREA_IDS.SCHOOL_ENTRANCE);
    assert.equal(snapshot.dialogue, null);
    assert.equal(snapshot.events[0].status, 'waiting');
  });
});
