import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  PROTOTYPE_AREA_IDS,
  PROTOTYPE_EVENT_ACTION_IDS,
  PROTOTYPE_EVENT_IDS,
  PROTOTYPE_INPUT_TYPES,
  PROTOTYPE_TASK_IDS,
  PLAYER_MOVEMENT_SPEED_CELLS_PER_SECOND,
  PrototypeFestivalScene as RuntimePrototypeFestivalScene,
} from '../../../src/gameDomain/prototypeFestivalScene/prototypeFestivalScene.js';
import {
  PROTOTYPE_MAP_SIZE,
  PROTOTYPE_PLAYER_RADIUS,
  isPrototypePositionWalkable,
} from '../../../src/gameDomain/prototypeFestivalScene/prototypeFestivalMap.js';
import {
  PROTOTYPE_ACTIVITY_IDS,
} from '../../../src/gameDomain/prototypeFestivalScene/prototypeFestivalActivity.js';

/** 既存機能を巻き込みから独立して検証するテスト用シーン。 */
class PrototypeFestivalScene extends RuntimePrototypeFestivalScene {
  /** 巻き込みを無効にしてシーンを生成する。 */
  constructor(options = {}) {
    super({ ...options, enableInterruptions: false, enableGoalSelection: false });
  }
}

/** テストで使用するイベントと目的地の座標。 */
const TEST_POSITIONS = Object.freeze({
  OPENING_STAGE: Object.freeze({ x: 24, y: 5 }),
  LOST_CHILD: Object.freeze({ x: 6, y: 6 }),
  LOST_CHILD_PARENT: Object.freeze({ x: 22, y: 8 }),
  STALL_TROUBLE: Object.freeze({ x: 10, y: 8 }),
  SPREAD_STALL_TROUBLE: Object.freeze({ x: 20, y: 12 }),
  SECRET_EXHIBIT: Object.freeze({ x: 11, y: 20 }),
  GYM_FRONT: Object.freeze({ x: 8, y: 24 }),
  WORLD_TREE_FRONT: Object.freeze({ x: 20, y: 24 }),
});

/**
 * 指定秒数だけシーンを更新する。
 * @param {PrototypeFestivalScene} scene - 更新対象シーン。
 * @param {number} seconds - 経過させる実時間秒数。
 * @returns {void}
 */
function advanceSeconds(scene, seconds) {
  scene.update({
    context: {
      deltaTimeMs: seconds * 1000,
      inputs: [],
    },
  });
}

/**
 * 1件の入力を時間経過なしで処理する。
 * @param {PrototypeFestivalScene} scene - 入力対象シーン。
 * @param {Object} input - 処理する入力。
 * @returns {void}
 */
function sendInput(scene, input) {
  scene.update({
    context: {
      deltaTimeMs: 0,
      inputs: [input],
    },
  });
}

/**
 * 移動方向を指定秒数入力してから停止する。
 * @param {PrototypeFestivalScene} scene - 移動対象シーン。
 * @param {number} x - 左右入力。
 * @param {number} y - 上下入力。
 * @param {number} seconds - 入力を継続する実時間秒数。
 * @returns {void}
 */
function moveForSeconds(scene, x, y, seconds) {
  scene.update({
    context: {
      deltaTimeMs: seconds * 1000,
      inputs: [{ type: PROTOTYPE_INPUT_TYPES.MOVEMENT_SET, x, y }],
    },
  });
  sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.MOVEMENT_SET, x: 0, y: 0 });
}

/**
 * 現在座標から指定座標まで直線移動する。
 * @param {PrototypeFestivalScene} scene - 移動対象シーン。
 * @param {Object} destination - 目的座標。
 * @returns {void}
 */
function moveToPosition(scene, destination) {
  const startPosition = scene.createSnapshot().player.position;
  const start = { x: Math.round(startPosition.x), y: Math.round(startPosition.y) };
  const goal = { x: Math.round(destination.x), y: Math.round(destination.y) };
  const frontier = [start];
  const previousByKey = new Map([[`${start.x},${start.y}`, null]]);
  const directions = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ];
  while (frontier.length > 0 && !previousByKey.has(`${goal.x},${goal.y}`)) {
    const current = frontier.shift();
    for (const direction of directions) {
      const next = { x: current.x + direction.x, y: current.y + direction.y };
      const key = `${next.x},${next.y}`;
      if (!previousByKey.has(key) && isPrototypePositionWalkable(next)) {
        previousByKey.set(key, current);
        frontier.push(next);
      }
    }
  }
  assert.ok(previousByKey.has(`${goal.x},${goal.y}`), `目的地へ到達できる経路がない: ${goal.x},${goal.y}`);
  const path = [];
  let cursor = goal;
  while (cursor && (cursor.x !== start.x || cursor.y !== start.y)) {
    path.unshift(cursor);
    cursor = previousByKey.get(`${cursor.x},${cursor.y}`);
  }
  for (const waypoint of path) {
    moveToWaypoint(scene, waypoint);
  }
  sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.MOVEMENT_SET, x: 0, y: 0 });
}

/** 衝突判定を通しながら隣接する経路点まで移動する。 */
function moveToWaypoint(scene, waypoint) {
  for (let index = 0; index < 100; index += 1) {
    const position = scene.createSnapshot().player.position;
    const delta = { x: waypoint.x - position.x, y: waypoint.y - position.y };
    const distance = Math.hypot(delta.x, delta.y);
    if (distance < 0.01) {
      return;
    }
    const durationSeconds = Math.min(0.05, distance / PLAYER_MOVEMENT_SPEED_CELLS_PER_SECOND);
    scene.update({
      context: {
        deltaTimeMs: durationSeconds * 1000,
        inputs: [{
          type: PROTOTYPE_INPUT_TYPES.MOVEMENT_SET,
          x: delta.x / distance,
          y: delta.y / distance,
        }],
      },
    });
  }
  assert.fail(`経路点へ到達できない: ${waypoint.x},${waypoint.y}`);
}

/**
 * 指定値を順番に返す乱数関数を生成する。
 * @param {Array<number>} values - 順番に返す値。
 * @returns {Function} 決定的な乱数関数。
 */
function createSequenceRandom(values) {
  /** 次の乱数値を返す。 */
  function getNextRandomValue() {
    return values.shift() ?? 0;
  }
  return getNextRandomValue;
}

/**
 * IDを持つsnapshot一覧から対象項目を返す。
 * @param {Array<Object>} snapshots - 検索対象一覧。
 * @param {string} id - 検索するID。
 * @returns {Object|null} 一致した項目。存在しない場合はnull。
 */
function findSnapshotById(snapshots, id) {
  for (const snapshot of snapshots) {
    if (snapshot.id === id) {
      return snapshot;
    }
  }
  return null;
}

/**
 * snapshot一覧からID一覧を生成する。
 * @param {Array<Object>} snapshots - 変換対象一覧。
 * @returns {Array<string>} ID一覧。
 */
function collectSnapshotIds(snapshots) {
  const ids = [];
  for (const snapshot of snapshots) {
    ids.push(snapshot.id);
  }
  return ids;
}

/**
 * 指定した教師仕事地点を操作する。
 * @param {PrototypeFestivalScene} scene - 操作対象シーン。
 * @param {Object} marker - 操作する仕事地点snapshot。
 * @returns {void}
 */
function interactWithTaskMarker(scene, marker) {
  sendInput(scene, {
    type: PROTOTYPE_INPUT_TYPES.TASK_INTERACT,
    taskId: marker.taskId,
    stepId: marker.stepId,
  });
}

/**
 * 現在支給されている教師仕事一式を完了する。
 * @param {PrototypeFestivalScene} scene - 操作対象シーン。
 * @returns {void}
 */
function completeActiveTaskBatch(scene) {
  const patrolMarkers = scene.createSnapshot().map.tasks.filter(
    (marker) => marker.taskId === PROTOTYPE_TASK_IDS.PATROL,
  );
  for (const marker of patrolMarkers) {
    moveToPosition(scene, marker.position);
  }

  for (let step = 0; step < 2; step += 1) {
    const deliveryMarker = scene.createSnapshot().map.tasks.find(
      (marker) => marker.taskId === PROTOTYPE_TASK_IDS.DELIVERY,
    );
    moveToPosition(scene, deliveryMarker.position);
    interactWithTaskMarker(scene, deliveryMarker);
  }

  const worldTreeMarkers = scene.createSnapshot().map.tasks.filter(
    (marker) => marker.taskId === PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK,
  );
  for (const marker of worldTreeMarkers) {
    moveToPosition(scene, marker.position);
    interactWithTaskMarker(scene, marker);
  }
}

/**
 * 小規模な屋台トラブルの対応セッションを開始する。
 * @param {PrototypeFestivalScene} scene - 操作対象シーン。
 * @returns {void}
 */
function startSmallStallInteraction(scene) {
  advanceSeconds(scene, 20);
  moveToPosition(scene, TEST_POSITIONS.STALL_TROUBLE);
  sendInput(scene, {
    type: PROTOTYPE_INPUT_TYPES.EVENT_INTERACT,
    eventId: PROTOTYPE_EVENT_IDS.STALL_TROUBLE,
  });
}

/**
 * 屋台通りで迷子を保護して同行状態にする。
 * @param {PrototypeFestivalScene} scene - 操作対象シーン。
 * @returns {void}
 */
function startLostChildCompanion(scene) {
  advanceSeconds(scene, 30);
  moveToPosition(scene, TEST_POSITIONS.LOST_CHILD);
  sendInput(scene, {
    type: PROTOTYPE_INPUT_TYPES.EVENT_INTERACT,
    eventId: PROTOTYPE_EVENT_IDS.LOST_CHILD,
  });
}

/** PT-UT-S18のテストケースを登録する。 */
function registerTimeAndInputTests() {
  /** PT-UT-S18-C01 実時間をゲーム内時間へ変換する。 */
  function advancesGameTime() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    advanceSeconds(scene, 120);

    // Assert
    assert.equal(scene.createSnapshot().gameTime.label, 'AM11:00');
  }

  /** PT-UT-S18-C02 ポーズ中は時間を止める。 */
  function pausesGameTime() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    scene.update({
      context: {
        deltaTimeMs: 30000,
        inputs: [{ type: PROTOTYPE_INPUT_TYPES.PAUSE_TOGGLE }],
      },
    });

    // Assert
    assert.equal(scene.createSnapshot().gameTime.elapsedMinutes, 0);
  }

  /** PT-UT-S18-C03 右方向へ移動速度どおり進む。 */
  function movesRightContinuously() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    moveForSeconds(scene, 1, 0, 1);

    // Assert
    const snapshot = scene.createSnapshot();
    assert.ok(Math.abs(snapshot.player.position.x - 28) < 0.000001);
    assert.equal(snapshot.player.position.y, 8);
    assert.equal(snapshot.gameTime.elapsedMinutes, 0.5);
  }

  /** PT-UT-S18-C04 斜め方向を正規化する。 */
  function normalizesDiagonalMovement() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    // Act
    moveForSeconds(scene, 1, -1, 1);

    // Assert
    const position = scene.createSnapshot().player.position;
    assert.ok(Math.abs(position.x - (24 + Math.SQRT2 * 2)) < 0.000001);
    assert.ok(Math.abs(position.y - (8 - Math.SQRT2 * 2)) < 0.000001);
  }

  /** PT-UT-S18-C05 反対方向入力を相殺する。 */
  function cancelsOppositeMovement() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    moveForSeconds(scene, 0, 0, 1);

    // Assert
    assert.deepEqual(scene.createSnapshot().player.position, { x: 24, y: 8 });
  }

  /** PT-UT-S18-C06 マップ端で座標を制限する。 */
  function clampsPositionAtMapEdge() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    moveForSeconds(scene, 1, 0, 10);

    // Assert
    const position = scene.createSnapshot().player.position;
    assert.ok(position.x <= PROTOTYPE_MAP_SIZE - PROTOTYPE_PLAYER_RADIUS);
    assert.ok(position.x >= PROTOTYPE_MAP_SIZE - PROTOTYPE_PLAYER_RADIUS - 0.2);
    assert.equal(position.y, 8);
  }

  /** PT-UT-S18-C07 境界通過時に現在地だけを変更する。 */
  function changesAreaWithoutExtraTime() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    moveForSeconds(scene, 0, 1, 2.5);

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.player.areaId, PROTOTYPE_AREA_IDS.WORLD_TREE_FRONT);
    assert.equal(snapshot.gameTime.elapsedMinutes, 1.25);
  }

  /** PT-UT-S18-C08 イベント対応中は移動を止める。 */
  function stopsMovementDuringInteraction() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    startSmallStallInteraction(scene);
    const before = scene.createSnapshot().player.position;

    // Act
    scene.update({
      context: {
        deltaTimeMs: 1000,
        inputs: [{ type: PROTOTYPE_INPUT_TYPES.MOVEMENT_SET, x: 1, y: 0 }],
      },
    });

    // Assert
    assert.deepEqual(scene.createSnapshot().player.position, before);
  }

  test('PT-UT-S18-C01 実時間120秒でゲーム内時間が1時間進む', advancesGameTime);
  test('PT-UT-S18-C02 ポーズ中はゲーム内時間が進まない', pausesGameTime);
  test('PT-UT-S18-C03 Dを1秒入力すると右へ4マス進む', movesRightContinuously);
  test('PT-UT-S18-C04 斜め入力を正規化して4マス進む', normalizesDiagonalMovement);
  test('PT-UT-S18-C05 反対方向入力が相殺される', cancelsOppositeMovement);
  test('PT-UT-S18-C06 マップ端から外へ移動しない', clampsPositionAtMapEdge);
  test('PT-UT-S18-C07 場所境界で追加時間を発生させない', changesAreaWithoutExtraTime);
  test('PT-UT-S18-C08 イベント対応中は移動しない', stopsMovementDuringInteraction);
}

/** PT-UT-S19のテストケースを登録する。 */
function registerEventProgressTests() {
  /** PT-UT-S19-C01 定時イベントを開始する。 */
  function startsScheduledEvent() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    advanceSeconds(scene, 40);
    moveToPosition(scene, TEST_POSITIONS.OPENING_STAGE);

    // Assert
    const event = findSnapshotById(
      scene.createSnapshot().nearbyActivities,
      PROTOTYPE_EVENT_IDS.OPENING_STAGE,
    );
    assert.equal(event?.title, 'クラスメイトの開幕ステージ');
  }

  /** PT-UT-S19-C02 逃した秘密の展示を判明済みにする。 */
  function learnsMissedSecretExhibit() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    advanceSeconds(scene, 120);

    // Assert
    const scheduleIds = collectSnapshotIds(scene.createSnapshot().schedule);
    assert.ok(scheduleIds.includes(PROTOTYPE_EVENT_IDS.SECRET_EXHIBIT));
  }

  /** PT-UT-S19-C03 屋台トラブルを成長させて波及させる。 */
  function spreadsStallTrouble() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0.9, 0.9]) });

    // Act
    advanceSeconds(scene, 80);

    // Assert
    const snapshot = scene.createSnapshot();
    const mapEvent = findSnapshotById(
      snapshot.map.events,
      PROTOTYPE_EVENT_IDS.STALL_TROUBLE,
    );
    assert.deepEqual(mapEvent?.position, TEST_POSITIONS.SPREAD_STALL_TROUBLE);
    assert.equal(findSnapshotById(snapshot.quickEvents, PROTOTYPE_EVENT_IDS.STALL_TROUBLE), null);
  }

  /** PT-UT-S19-C04 波及イベントとランダム突発を合流させる。 */
  function mergesFestivalEvents() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0.34, 0]) });

    // Act
    advanceSeconds(scene, 80);

    // Assert
    assert.ok(scene.createSnapshot().achievements.includes('festival-events-merged'));
  }

  /** PT-UT-S19-C05 ループごとにランダム突発を再抽選する。 */
  function rerollsRandomEvent() {
    // Arrange
    let useLaterLoopValues = false;
    /** ループ境界の前後で異なる抽選値を返す。 */
    function random() {
      return useLaterLoopValues ? 0.9 : 0;
    }
    const scene = new PrototypeFestivalScene({ random });
    const before = scene.createSnapshot().randomEvent;
    advanceSeconds(scene, 20);
    useLaterLoopValues = true;

    // Act
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });

    // Assert
    const after = scene.createSnapshot().randomEvent;
    assert.notDeepEqual(after, before);
  }

  test('PT-UT-S19-C01 開始時刻に定時イベントが発生する', startsScheduledEvent);
  test('PT-UT-S19-C02 秘密の展示を逃すと時刻と場所が判明する', learnsMissedSecretExhibit);
  test('PT-UT-S19-C03 屋台トラブルが成長して別エリアへ波及する', spreadsStallTrouble);
  test('PT-UT-S19-C04 波及イベントとランダム突発が合流する', mergesFestivalEvents);
  test('PT-UT-S19-C05 巻き戻しでランダム突発を再抽選する', rerollsRandomEvent);
}

/** PT-UT-S20のテストケースを登録する。 */
function registerAdviceAndRewindTests() {
  /** PT-UT-S20-C01 期限の迫ったイベントを優先して助言する。 */
  function prioritizesUrgentAdvice() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0.9, 0.9]) });

    // Act
    advanceSeconds(scene, 100);

    // Assert
    assert.match(scene.createSnapshot().kamoAdvice, /あと10分/);
  }

  /** PT-UT-S20-C02 経過時間比例のMPで巻き戻す。 */
  function rewindsWithProportionalCost() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0, 0, 0]) });
    advanceSeconds(scene, 120);

    // Act
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.gameTime.elapsedMinutes, 0);
    assert.equal(snapshot.player.magicPower.current, 90);
    assert.equal(snapshot.loop.count, 2);
  }

  /** PT-UT-S20-C03 巻き戻し後もイベント知識を維持する。 */
  function keepsScheduleKnowledge() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0, 0, 0]) });
    advanceSeconds(scene, 120);

    // Act
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });

    // Assert
    const scheduleIds = collectSnapshotIds(scene.createSnapshot().schedule);
    assert.ok(scheduleIds.includes(PROTOTYPE_EVENT_IDS.SECRET_EXHIBIT));
  }

  /** PT-UT-S20-C04 判明した秘密の展示を次ループで完了する。 */
  function completesLearnedSecretExhibit() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0, 0, 0]) });
    advanceSeconds(scene, 120);
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });
    advanceSeconds(scene, 90);
    moveToPosition(scene, TEST_POSITIONS.SECRET_EXHIBIT);

    // Act
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.EVENT_INTERACT,
      eventId: PROTOTYPE_EVENT_IDS.SECRET_EXHIBIT,
    });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });

    // Assert
    assert.ok(
      scene.createSnapshot().achievements.includes(
        `completed:${PROTOTYPE_EVENT_IDS.SECRET_EXHIBIT}`,
      ),
    );
  }

  test('PT-UT-S20-C01 カモ君は期限の迫ったイベントを優先する', prioritizesUrgentAdvice);
  test('PT-UT-S20-C02 経過時間に比例したMPでAM10時へ戻る', rewindsWithProportionalCost);
  test('PT-UT-S20-C03 巻き戻し後も判明したスケジュールを維持する', keepsScheduleKnowledge);
  test('PT-UT-S20-C04 次のループで秘密の展示を完了できる', completesLearnedSecretExhibit);
}

/** PT-UT-S21のテストケースを登録する。 */
function registerStallInteractionTests() {
  /** PT-UT-S21-C01 屋台トラブル選択後に対応を開始する。 */
  function startsInteractionWithoutCompletion() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    startSmallStallInteraction(scene);

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.eventInteraction?.eventId, PROTOTYPE_EVENT_IDS.STALL_TROUBLE);
    assert.equal(snapshot.eventInteraction?.progress, 0);
    assert.equal(snapshot.eventInteraction?.requiredProgress, 4);
    assert.ok(!snapshot.achievements.includes(`completed:${PROTOTYPE_EVENT_IDS.STALL_TROUBLE}`));
  }

  /** PT-UT-S21-C02 魔法対応でMPと時間を消費して進捗を得る。 */
  function usesMagicSupport() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    startSmallStallInteraction(scene);
    const beforeTime = scene.createSnapshot().gameTime.elapsedMinutes;

    // Act
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.EVENT_ACTION,
      actionId: PROTOTYPE_EVENT_ACTION_IDS.MAGIC_SUPPORT,
    });

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.player.magicPower.current, 85);
    assert.equal(snapshot.gameTime.elapsedMinutes, beforeTime + 2);
    assert.equal(snapshot.eventInteraction?.progress, 3);
  }

  /** PT-UT-S21-C03 MP不足時は魔法対応を拒否する。 */
  function rejectsMagicWithoutEnoughPower() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([]) });
    for (let loop = 0; loop < 5; loop += 1) {
      advanceSeconds(scene, 240);
      sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });
    }
    startSmallStallInteraction(scene);
    const before = scene.createSnapshot();

    // Act
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.EVENT_ACTION,
      actionId: PROTOTYPE_EVENT_ACTION_IDS.MAGIC_SUPPORT,
    });

    // Assert
    const after = scene.createSnapshot();
    assert.equal(after.player.magicPower.current, before.player.magicPower.current);
    assert.equal(after.gameTime.elapsedMinutes, before.gameTime.elapsedMinutes);
    assert.equal(after.eventInteraction?.progress, 0);
  }

  /** PT-UT-S21-C04 必要進捗で屋台トラブルを完了する。 */
  function completesStallTrouble() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    startSmallStallInteraction(scene);
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.EVENT_ACTION,
      actionId: PROTOTYPE_EVENT_ACTION_IDS.MAGIC_SUPPORT,
    });

    // Act
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.EVENT_ACTION,
      actionId: PROTOTYPE_EVENT_ACTION_IDS.CLEAR_CROWD,
    });

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.eventInteraction, null);
    assert.ok(snapshot.achievements.includes(`completed:${PROTOTYPE_EVENT_IDS.STALL_TROUBLE}`));
  }

  /** PT-UT-S21-C05 波及時に対応セッションを中断する。 */
  function interruptsInteractionOnSpread() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0.9, 0.9]) });
    startSmallStallInteraction(scene);

    // Act
    advanceSeconds(scene, 60);

    // Assert
    const snapshot = scene.createSnapshot();
    const quickEvent = findSnapshotById(snapshot.quickEvents, PROTOTYPE_EVENT_IDS.STALL_TROUBLE);
    assert.equal(snapshot.eventInteraction, null);
    assert.equal(quickEvent, null);
    assert.deepEqual(
      findSnapshotById(snapshot.map.events, PROTOTYPE_EVENT_IDS.STALL_TROUBLE)?.position,
      TEST_POSITIONS.SPREAD_STALL_TROUBLE,
    );
  }

  /** PT-UT-S21-C06 合流後は協力依頼の効果を下げる。 */
  function reducesHelpEffectAfterMerge() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0.34, 0]) });
    advanceSeconds(scene, 80);
    moveToPosition(scene, TEST_POSITIONS.SPREAD_STALL_TROUBLE);
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.EVENT_INTERACT,
      eventId: PROTOTYPE_EVENT_IDS.STALL_TROUBLE,
    });

    // Act
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.EVENT_ACTION,
      actionId: PROTOTYPE_EVENT_ACTION_IDS.CALL_FOR_HELP,
    });

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.eventInteraction?.progress, 1);
    assert.equal(snapshot.eventInteraction?.requiredProgress, 6);
  }

  test('PT-UT-S21-C01 屋台トラブル選択後に対応セッションを開始する', startsInteractionWithoutCompletion);
  test('PT-UT-S21-C02 魔法対応でMPと時間を消費して進捗を得る', usesMagicSupport);
  test('PT-UT-S21-C03 MP不足時は魔法対応を実行できない', rejectsMagicWithoutEnoughPower);
  test('PT-UT-S21-C04 必要進捗へ到達すると屋台トラブルを完了する', completesStallTrouble);
  test('PT-UT-S21-C05 対応中に波及すると対応セッションを中断する', interruptsInteractionOnSpread);
  test('PT-UT-S21-C06 合流後は協力依頼の効果が下がる', reducesHelpEffectAfterMerge);
}

/** PT-UT-S22のテストケースを登録する。 */
function registerLostChildCompanionTests() {
  /** PT-UT-S22-C01 迷子を保護して同行状態にする。 */
  function startsLostChildCompanion() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    startLostChildCompanion(scene);

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.companion?.id, PROTOTYPE_EVENT_IDS.LOST_CHILD);
    assert.equal(snapshot.companion?.areaId, PROTOTYPE_AREA_IDS.FOOD_STREET);
  }

  /** PT-UT-S22-C02 迷子を任意のエリアへ同行させる。 */
  function movesLostChildToAnotherArea() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    startLostChildCompanion(scene);

    // Act
    moveToPosition(scene, TEST_POSITIONS.GYM_FRONT);

    // Assert
    const snapshot = scene.createSnapshot();
    const currentEvent = findSnapshotById(snapshot.currentEvents, PROTOTYPE_EVENT_IDS.LOST_CHILD);
    assert.equal(snapshot.companion?.areaId, PROTOTYPE_AREA_IDS.GYM_FRONT);
    assert.equal(currentEvent?.id, PROTOTYPE_EVENT_IDS.LOST_CHILD);
  }

  /** PT-UT-S22-C03 デイビット広場で迷子の親を見つける。 */
  function completesAtParentArea() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    startLostChildCompanion(scene);
    moveToPosition(scene, TEST_POSITIONS.LOST_CHILD_PARENT);

    // Act
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.EVENT_INTERACT,
      eventId: PROTOTYPE_EVENT_IDS.LOST_CHILD,
    });

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.companion, null);
    assert.ok(snapshot.achievements.includes(`completed:${PROTOTYPE_EVENT_IDS.LOST_CHILD}`));
  }

  /** PT-UT-S22-C04 親のいないエリアでは迷子イベントを完了しない。 */
  function rejectsCompletionOutsideParentArea() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    startLostChildCompanion(scene);
    moveToPosition(scene, TEST_POSITIONS.GYM_FRONT);

    // Act
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.EVENT_INTERACT,
      eventId: PROTOTYPE_EVENT_IDS.LOST_CHILD,
    });

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.companion?.areaId, PROTOTYPE_AREA_IDS.GYM_FRONT);
    assert.ok(!snapshot.achievements.includes(`completed:${PROTOTYPE_EVENT_IDS.LOST_CHILD}`));
  }

  test('PT-UT-S22-C01 屋台通りで迷子を保護すると同行状態になる', startsLostChildCompanion);
  test('PT-UT-S22-C02 迷子を体育館前まで同行させられる', movesLostChildToAnotherArea);
  test('PT-UT-S22-C03 デイビット広場で迷子の親を見つける', completesAtParentArea);
  test('PT-UT-S22-C04 親のいないエリアでは迷子イベントを完了しない', rejectsCompletionOutsideParentArea);
}

/** PT-UT-S23のテストケースを登録する。 */
function registerEventProximityTests() {
  /** PT-UT-S23-C01 同じ場所でも遠いイベントを選択対象にしない。 */
  function hidesDistantEvent() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    advanceSeconds(scene, 40);

    // Assert
    const event = findSnapshotById(
      scene.createSnapshot().nearbyActivities,
      PROTOTYPE_EVENT_IDS.OPENING_STAGE,
    );
    assert.equal(event, null);
  }

  /** PT-UT-S23-C02 半径2マス以内のイベントを選択対象にする。 */
  function exposesNearbyEvent() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    advanceSeconds(scene, 40);

    // Act
    moveToPosition(scene, TEST_POSITIONS.OPENING_STAGE);

    // Assert
    const event = findSnapshotById(
      scene.createSnapshot().nearbyActivities,
      PROTOTYPE_EVENT_IDS.OPENING_STAGE,
    );
    assert.equal(event?.id, PROTOTYPE_EVENT_IDS.OPENING_STAGE);
  }

  /** PT-UT-S23-C03 波及した屋台トラブルのマーカーを移す。 */
  function movesSpreadEventMarker() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0.9, 0.9]) });

    // Act
    advanceSeconds(scene, 80);

    // Assert
    const marker = findSnapshotById(
      scene.createSnapshot().map.events,
      PROTOTYPE_EVENT_IDS.STALL_TROUBLE,
    );
    assert.deepEqual(marker?.position, TEST_POSITIONS.SPREAD_STALL_TROUBLE);
  }

  /** PT-UT-S23-C04 同行中の迷子をネギの座標へ追従させる。 */
  function followsPlayerPosition() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    startLostChildCompanion(scene);

    // Act
    moveToPosition(scene, TEST_POSITIONS.WORLD_TREE_FRONT);

    // Assert
    const snapshot = scene.createSnapshot();
    assert.deepEqual(snapshot.companion?.position, snapshot.player.position);
  }

  /** PT-UT-S23-C05 親の接近範囲内で迷子イベントを完了する。 */
  function completesNearParentPosition() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    startLostChildCompanion(scene);
    moveToPosition(scene, TEST_POSITIONS.LOST_CHILD_PARENT);

    // Act
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.EVENT_INTERACT,
      eventId: PROTOTYPE_EVENT_IDS.LOST_CHILD,
    });

    // Assert
    assert.equal(scene.createSnapshot().companion, null);
  }

  /** PT-UT-S23-C06 巻き戻し時に座標と移動入力を初期化する。 */
  function resetsMovementOnRewind() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0, 0, 0]) });
    scene.update({
      context: {
        deltaTimeMs: 20000,
        inputs: [{ type: PROTOTYPE_INPUT_TYPES.MOVEMENT_SET, x: 1, y: 0 }],
      },
    });

    // Act
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });
    advanceSeconds(scene, 1);

    // Assert
    assert.deepEqual(scene.createSnapshot().player.position, { x: 24, y: 8 });
  }

  test('PT-UT-S23-C01 同じ場所でも遠いイベントは選択できない', hidesDistantEvent);
  test('PT-UT-S23-C02 半径2マス以内のイベントを選択できる', exposesNearbyEvent);
  test('PT-UT-S23-C03 波及したイベントのマーカー位置が変わる', movesSpreadEventMarker);
  test('PT-UT-S23-C04 迷子がネギの連続座標へ追従する', followsPlayerPosition);
  test('PT-UT-S23-C05 親から2マス以内で迷子イベントを完了する', completesNearParentPosition);
  test('PT-UT-S23-C06 巻き戻しで座標と移動入力を初期化する', resetsMovementOnRewind);
}

/** PT-UT-S24の教師仕事テストケースを登録する。 */
function registerTeacherTaskTests() {
  /** PT-UT-S24-C01 開始時に3種類の教師仕事を支給する。 */
  function startsThreeTeacherTasks() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.deepEqual(collectSnapshotIds(snapshot.tasks), Object.values(PROTOTYPE_TASK_IDS));
    assert.equal(snapshot.taskBatch.status, 'active');
  }

  /** PT-UT-S24-C02 接近した見回り地点を自動完了する。 */
  function automaticallyChecksPatrolPoint() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    const marker = scene.createSnapshot().map.tasks.find(
      (entry) => entry.taskId === PROTOTYPE_TASK_IDS.PATROL,
    );

    // Act
    moveToPosition(scene, marker.position);

    // Assert
    assert.equal(findSnapshotById(scene.createSnapshot().tasks, PROTOTYPE_TASK_IDS.PATROL).progressLabel, '1 / 3');
  }

  /** PT-UT-S24-C03 受取前の配達操作を拒否する。 */
  function rejectsDeliveryBeforePickup() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    const pickup = scene.createSnapshot().map.tasks.find(
      (entry) => entry.taskId === PROTOTYPE_TASK_IDS.DELIVERY,
    );
    const destination = { x: 12, y: 8 };
    moveToPosition(scene, destination);

    // Act
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.TASK_INTERACT,
      taskId: PROTOTYPE_TASK_IDS.DELIVERY,
      stepId: 'delivery-destination-1',
    });

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(findSnapshotById(snapshot.tasks, PROTOTYPE_TASK_IDS.DELIVERY).progressLabel, '0 / 2');
    assert.equal(snapshot.player.mahoPayPoints, 0);
    assert.equal(pickup.stepId, 'delivery-pickup-1');
  }

  /** PT-UT-S24-C04 受取と配達を順番に完了する。 */
  function completesDeliveryInOrder() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    for (let step = 0; step < 2; step += 1) {
      const marker = scene.createSnapshot().map.tasks.find(
        (entry) => entry.taskId === PROTOTYPE_TASK_IDS.DELIVERY,
      );
      moveToPosition(scene, marker.position);
      interactWithTaskMarker(scene, marker);
    }

    // Assert
    const task = findSnapshotById(scene.createSnapshot().tasks, PROTOTYPE_TASK_IDS.DELIVERY);
    assert.equal(task.status, 'completed');
    assert.equal(task.progressLabel, '2 / 2');
  }

  /** PT-UT-S24-C05 世界樹確認は接近だけでは進まない。 */
  function requiresWorldTreeInteraction() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    const marker = scene.createSnapshot().map.tasks.find(
      (entry) => entry.taskId === PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK,
    );

    // Act
    moveToPosition(scene, marker.position);

    // Assert
    assert.equal(findSnapshotById(scene.createSnapshot().tasks, PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK).progressLabel, '0 / 2');
  }

  /** PT-UT-S24-C06 世界樹確認操作で対象地点を完了する。 */
  function checksWorldTreeSpot() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    const marker = scene.createSnapshot().map.tasks.find(
      (entry) => entry.taskId === PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK,
    );
    moveToPosition(scene, marker.position);

    // Act
    interactWithTaskMarker(scene, marker);

    // Assert
    assert.equal(findSnapshotById(scene.createSnapshot().tasks, PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK).progressLabel, '1 / 2');
  }

  /** PT-UT-S24-C07 期限内完了時に満額を付与する。 */
  function awardsFullRewardsBeforeDeadline() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    completeActiveTaskBatch(scene);

    // Assert
    assert.equal(scene.createSnapshot().player.mahoPayPoints, 700);
  }

  /** PT-UT-S24-C08 期限後も半額報酬で仕事を継続する。 */
  function awardsHalfRewardAfterDeadline() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    advanceSeconds(scene, 82);

    // Act
    for (let step = 0; step < 2; step += 1) {
      const marker = scene.createSnapshot().map.tasks.find(
        (entry) => entry.taskId === PROTOTYPE_TASK_IDS.DELIVERY,
      );
      moveToPosition(scene, marker.position);
      interactWithTaskMarker(scene, marker);
    }

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(findSnapshotById(snapshot.tasks, PROTOTYPE_TASK_IDS.DELIVERY).status, 'completed');
    assert.equal(snapshot.player.mahoPayPoints, 100);
  }

  /** PT-UT-S24-C09 全件完了から5分後に次便を支給する。 */
  function refreshesFiveMinutesAfterCompletion() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    completeActiveTaskBatch(scene);

    // Act
    advanceSeconds(scene, 9);
    const before = scene.createSnapshot();
    advanceSeconds(scene, 1);
    const after = scene.createSnapshot();

    // Assert
    assert.equal(before.taskBatch.status, 'waiting');
    assert.equal(after.taskBatch.status, 'active');
    assert.equal(after.taskBatch.batchNumber, 2);
  }

  /** PT-UT-S24-C10 3配置の次に最初の配置へ戻る。 */
  function cyclesThreeTaskPatterns() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });

    // Act
    for (let batch = 0; batch < 3; batch += 1) {
      completeActiveTaskBatch(scene);
      advanceSeconds(scene, 10);
    }

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.taskBatch.batchNumber, 4);
    assert.ok(snapshot.map.tasks.some((marker) => marker.stepId === 'patrol-food-1'));
  }

  /** PT-UT-S24-C11 正午以降の次便を支給しない。 */
  function doesNotIssueTasksAfterNoon() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0]) });
    const worldMarkers = scene.createSnapshot().map.tasks.filter(
      (marker) => marker.taskId === PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK,
    );
    for (const marker of scene.createSnapshot().map.tasks.filter((entry) => entry.taskId === PROTOTYPE_TASK_IDS.PATROL)) {
      moveToPosition(scene, marker.position);
    }
    for (let step = 0; step < 2; step += 1) {
      const marker = scene.createSnapshot().map.tasks.find((entry) => entry.taskId === PROTOTYPE_TASK_IDS.DELIVERY);
      moveToPosition(scene, marker.position);
      interactWithTaskMarker(scene, marker);
    }
    moveToPosition(scene, worldMarkers[0].position);
    interactWithTaskMarker(scene, worldMarkers[0]);
    moveToPosition(scene, worldMarkers[1].position);
    const remainingMinutes = 117 - scene.createSnapshot().gameTime.elapsedMinutes;
    advanceSeconds(scene, remainingMinutes / 0.5);

    // Act
    interactWithTaskMarker(scene, worldMarkers[1]);
    advanceSeconds(scene, 6);

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.gameTime.isEnded, true);
    assert.equal(snapshot.taskBatch.status, 'ended');
    assert.equal(snapshot.tasks.length, 0);
  }

  /** PT-UT-S24-C12 巻き戻し後もMahoPayを維持する。 */
  function preservesMahoPayOnRewind() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0, 0, 0]) });
    for (let step = 0; step < 2; step += 1) {
      const marker = scene.createSnapshot().map.tasks.find((entry) => entry.taskId === PROTOTYPE_TASK_IDS.DELIVERY);
      moveToPosition(scene, marker.position);
      interactWithTaskMarker(scene, marker);
    }

    // Act
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });

    // Assert
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.player.mahoPayPoints, 200);
    assert.equal(snapshot.taskBatch.batchNumber, 1);
    assert.equal(findSnapshotById(snapshot.tasks, PROTOTYPE_TASK_IDS.DELIVERY).progressLabel, '0 / 2');
  }

  test('PT-UT-S24-C01 開始時に3種類の教師仕事を支給する', startsThreeTeacherTasks);
  test('PT-UT-S24-C02 見回り地点への接近で自動進行する', automaticallyChecksPatrolPoint);
  test('PT-UT-S24-C03 受取前には配達できない', rejectsDeliveryBeforePickup);
  test('PT-UT-S24-C04 受取後に指定地点へ配達できる', completesDeliveryInOrder);
  test('PT-UT-S24-C05 世界樹確認は接近だけでは進まない', requiresWorldTreeInteraction);
  test('PT-UT-S24-C06 世界樹確認は操作で進行する', checksWorldTreeSpot);
  test('PT-UT-S24-C07 期限内完了で満額報酬を得る', awardsFullRewardsBeforeDeadline);
  test('PT-UT-S24-C08 期限後も半額報酬で完了できる', awardsHalfRewardAfterDeadline);
  test('PT-UT-S24-C09 全件完了から5分後に次便を支給する', refreshesFiveMinutesAfterCompletion);
  test('PT-UT-S24-C10 3配置を循環する', cyclesThreeTaskPatterns);
  test('PT-UT-S24-C11 正午以降は次便を支給しない', doesNotIssueTasksAfterNoon);
  test('PT-UT-S24-C12 巻き戻し後もMahoPayを維持する', preservesMahoPayOnRewind);
}

/** PT-UT-S25の連鎖型ハプニング統合テストを登録する。 */
function registerHappeningIntegrationTests() {
  /** PT-UT-S25-C01 開始時にハプニングとエリア状態を公開する。 */
  function exposesInitialHappenings() {
    // Arrange
    const scene = new PrototypeFestivalScene({ random: createSequenceRandom([0, 0, 0]) });

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.ok(snapshot.happenings.length <= 5);
    assert.equal(snapshot.areaStates.length, 1);
    assert.equal('events' in snapshot.map.overview, false);
    assert.equal('areaStates' in snapshot.map.overview, false);
  }

  /** PT-UT-S25-C05 近くのハプニングを直接操作一覧へ出さない。 */
  function hidesDirectHappeningChoices() {
    // Arrange
    const scene = new RuntimePrototypeFestivalScene({ random: () => 0.9 });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.PLAN_SELECT,
      actionId: PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE,
    });
    moveToPosition(scene, TEST_POSITIONS.SPREAD_STALL_TROUBLE);
    advanceSeconds(scene, 60);
    const before = scene.createSnapshot();

    // Act
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.INTERRUPTION_CHOOSE, choiceId: 'rescue' });

    // Assert
    const after = scene.createSnapshot();
    assert.deepEqual(before.nearbyHappenings, []);
    assert.equal(before.interruption?.severity, 'major');
    assert.equal(after.gameTime.elapsedMinutes, before.gameTime.elapsedMinutes + 3);
    assert.equal(after.interruption, null);
  }

  /** PT-UT-S25-C13 巻き戻しで連鎖状態を初期化する。 */
  function resetsHappeningsOnRewind() {
    // Arrange
    const random = createSequenceRandom([
      0, 0,
      ...new Array(13).fill(0),
      0.9, 0.9,
      0.9, 0.9,
      0.9,
    ]);
    const scene = new PrototypeFestivalScene({ random });
    advanceSeconds(scene, 20);

    // Act
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });

    // Assert
    const after = scene.createSnapshot();
    assert.equal(after.gameTime.elapsedMinutes, 0);
    assert.ok(after.happenings.length <= 5);
    assert.equal(after.map.local.viewport.width, 12);
  }

  test('PT-UT-S25-C01 開始時にハプニングとエリア状態を公開する', exposesInitialHappenings);
  test('PT-UT-S25-C05 近くのハプニングは巻き込み判断として扱う', hidesDirectHappeningChoices);
  test('PT-UT-S25-C13 巻き戻しで連鎖状態を初期化する', resetsHappeningsOnRewind);
}

/** タスク追跡、発見地点、噂、カモ君通知を検証する。 */
function registerExplorationGuidanceTests() {
  /** PT-UT-S27-C01 開始時に最寄りの未完了仕事を追跡する。 */
  function tracksNearestTaskInitially() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.taskNavigation.taskId, PROTOTYPE_TASK_IDS.DELIVERY);
    assert.equal(snapshot.tasks.find((task) => task.id === PROTOTYPE_TASK_IDS.DELIVERY).isTracked, true);
    assert.equal(snapshot.map.overview.targetAreaId, PROTOTYPE_AREA_IDS.DAVID_PLAZA);
  }

  /** PT-UT-S27-C02 手動選択した進行中仕事を維持する。 */
  function keepsManuallyTrackedTask() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.TASK_TRACK,
      taskId: PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK,
    });
    moveForSeconds(scene, 1, 0, 0.25);
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.taskNavigation.taskId, PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK);
    assert.equal(snapshot.taskNavigation.isManual, true);
    assert.equal(snapshot.taskNavigation.areaId, PROTOTYPE_AREA_IDS.WORLD_TREE_FRONT);
  }

  /** PT-UT-S27-C04 目的地点までの正規化方向を返す。 */
  function exposesTaskDirection() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    const navigation = scene.createSnapshot().taskNavigation;
    assert.ok(Math.abs(Math.hypot(navigation.direction.x, navigation.direction.y) - 1) < 0.000001);
    assert.equal(typeof navigation.isTargetVisible, 'boolean');
    assert.ok(navigation.distance > 0);
  }

  /** PT-UT-S27-C03 追跡中仕事の完了後に別の仕事へ切り替える。 */
  function switchesTrackingAfterCompletion() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    moveToPosition(scene, { x: 22, y: 5 });
    let task = scene.createSnapshot().nearbyTasks.find((entry) => entry.taskId === PROTOTYPE_TASK_IDS.DELIVERY);
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.TASK_INTERACT,
      taskId: task.taskId,
      stepId: task.stepId,
    });
    moveToPosition(scene, { x: 12, y: 8 });
    task = scene.createSnapshot().nearbyTasks.find((entry) => entry.taskId === PROTOTYPE_TASK_IDS.DELIVERY);
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.TASK_INTERACT,
      taskId: task.taskId,
      stepId: task.stepId,
    });
    assert.notEqual(scene.createSnapshot().taskNavigation.taskId, PROTOTYPE_TASK_IDS.DELIVERY);
  }

  /** PT-UT-S28-C02 発見地点を調べてMahoPayを得る。 */
  function awardsDiscoveryMahoPay() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    moveToPosition(scene, { x: 30, y: 14 });
    const discovery = scene.createSnapshot().nearbyDiscoveries[0];
    assert.ok(discovery);
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.DISCOVERY_INTERACT,
      discoveryId: discovery.id,
    });
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.player.mahoPayPoints, 50);
    assert.equal(snapshot.nearbyDiscoveries.length, 0);
  }

  /** PT-UT-S28-C03 発見報酬を巻き戻し後も維持する。 */
  function keepsDiscoveryMahoPayOnRewind() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    moveToPosition(scene, { x: 30, y: 14 });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.DISCOVERY_INTERACT,
      discoveryId: scene.createSnapshot().nearbyDiscoveries[0].id,
    });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.loop.count, 2);
    assert.equal(snapshot.player.mahoPayPoints, 50);
  }

  /** PT-UT-S28-C04 遠方ハプニングを常時一覧へ出さない。 */
  function hidesRemoteHappeningList() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    const leads = scene.createSnapshot().areaLeads;
    assert.deepEqual(leads, []);
  }

  /** PT-UT-S29-C04 追跡変更時だけ新しい構造化通知を返す。 */
  function createsAndDeduplicatesTaskNotice() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.TASK_TRACK,
      taskId: PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK,
    });
    const firstNotice = scene.createSnapshot().kamoNotice;
    assert.equal(firstNotice.type, 'task');
    assert.equal(firstNotice.priority, 1);
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.TASK_TRACK,
      taskId: PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK,
    });
    assert.equal(scene.createSnapshot().kamoNotice.id, firstNotice.id);
  }

  /** PT-UT-S29-C03 残り10分へ到達したイベントを期限通知する。 */
  function createsUrgentNotice() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    advanceSeconds(scene, 50);
    const notice = scene.createSnapshot().kamoNotice;
    assert.equal(notice.type, 'urgent');
    assert.equal(notice.priority, 4);
    assert.match(notice.message, /あと10分/);
  }

  /** PT-UT-S29-C05 巻き戻し後は同じ仕事変更を新しい通知として扱う。 */
  function allowsNoticeAgainAfterRewind() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.TASK_TRACK,
      taskId: PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK,
    });
    const firstId = scene.createSnapshot().kamoNotice.id;
    advanceSeconds(scene, 2);
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.TASK_TRACK,
      taskId: PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK,
    });
    assert.notEqual(scene.createSnapshot().kamoNotice.id, firstId);
  }

  test('PT-UT-S27-C01 最寄りの未完了仕事を初期追跡する', tracksNearestTaskInitially);
  test('PT-UT-S27-C02 手動追跡を維持する', keepsManuallyTrackedTask);
  test('PT-UT-S27-C04 目的地点への方向を返す', exposesTaskDirection);
  test('PT-UT-S27-C03 完了後に別の仕事へ追跡を切り替える', switchesTrackingAfterCompletion);
  test('PT-UT-S28-C02 発見地点からMahoPayを得る', awardsDiscoveryMahoPay);
  test('PT-UT-S28-C03 発見報酬を巻き戻し後も維持する', keepsDiscoveryMahoPayOnRewind);
  test('PT-UT-S28-C04 遠方ハプニングを常時一覧へ出さない', hidesRemoteHappeningList);
  test('PT-UT-S29-C04 追跡変更通知を重複させない', createsAndDeduplicatesTaskNotice);
  test('PT-UT-S29-C03 イベント期限の接近を通知する', createsUrgentNotice);
  test('PT-UT-S29-C05 巻き戻し後に同じ条件を再通知する', allowsNoticeAgainAfterRewind);
}

/** PT-UT-S30とS31の予定行動・巻き込みテストを登録する。 */
function registerPlannedActivityAndInterruptionTests() {
  /** ポーズ中でも予定行動を1件選択できる。 */
  function selectsOnePlannedActionWhilePaused() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.PAUSE_TOGGLE });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.PLAN_SELECT,
      actionId: PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE,
    });
    assert.equal(scene.createSnapshot().plannedAction.id, PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE);
  }

  /** 出店利用を段階進行して完了する。 */
  function completesStallActivityInSteps() {
    const scene = new PrototypeFestivalScene({ random: () => 0 });
    moveToPosition(scene, { x: 7, y: 6 });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.ACTIVITY_START,
      activityId: PROTOTYPE_ACTIVITY_IDS.FOOD_STALL,
    });
    assert.equal(scene.createSnapshot().activitySession.requiredMinutes, 5);
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    assert.equal(scene.createSnapshot().activitySession, null);
  }

  /** 巻き込みの判断中は通常フレームで時間を進めない。 */
  function freezesTimeDuringInterruptionDecision() {
    const scene = new RuntimePrototypeFestivalScene({ random: () => 0.9 });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.PLAN_SELECT,
      actionId: PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE,
    });
    moveToPosition(scene, TEST_POSITIONS.SPREAD_STALL_TROUBLE);
    advanceSeconds(scene, 60);
    const before = scene.createSnapshot().gameTime.elapsedMinutes;
    advanceSeconds(scene, 20);
    assert.equal(scene.createSnapshot().gameTime.elapsedMinutes, before);
  }

  test('PT-UT-S30-C04 ポーズ中に予定行動を選択する', selectsOnePlannedActionWhilePaused);
  test('PT-UT-S30-C05 出店利用を段階進行して完了する', completesStallActivityInSteps);
  test('PT-UT-S31-C01 巻き込み判断中はゲーム内時間を止める', freezesTimeDuringInterruptionDecision);
}

/** PT-UT-S32の主目的、ランドマーク、寄り道テストを登録する。 */
function registerPrimaryGoalTests() {
  /** 開始時に3種類の動機を提示し、選択まで時間を止める。 */
  function offersPrimaryGoalsAndFreezesTime() {
    const scene = new RuntimePrototypeFestivalScene({ random: () => 0, enableInterruptions: false });
    advanceSeconds(scene, 20);
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.gameTime.elapsedMinutes, 0);
    assert.equal(snapshot.goalSelection.reason, 'initial');
    assert.deepEqual(
      new Set(snapshot.goalSelection.candidates.map((candidate) => candidate.motivationKind)),
      new Set(['classmate', 'famous', 'teacher']),
    );
  }

  /** 選択した主目的の動機とランドマークをナビゲーションへ反映する。 */
  function selectsGoalAndHighlightsLandmark() {
    const scene = new RuntimePrototypeFestivalScene({ random: () => 0, enableInterruptions: false });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.PLAN_SELECT,
      actionId: PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE,
    });
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.goalSelection, null);
    assert.equal(snapshot.plannedAction.motivationKind, 'classmate');
    assert.equal(snapshot.plannedAction.landmarkId, 'david-plaza');
    assert.equal(
      snapshot.map.overview.landmarks.find((landmark) => landmark.id === 'david-plaza').isGoalLandmark,
      true,
    );
    assert.equal(
      snapshot.map.local.landmarks.find((landmark) => landmark.id === 'david-plaza').isGoalLandmark,
      true,
    );
  }

  /** 出店へ寄り道しても選択済みの主目的を維持する。 */
  function keepsGoalDuringStallDetour() {
    const scene = new RuntimePrototypeFestivalScene({ random: () => 0, enableInterruptions: false });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.PLAN_SELECT,
      actionId: PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE,
    });
    moveToPosition(scene, { x: 7, y: 6 });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.ACTIVITY_START,
      activityId: PROTOTYPE_ACTIVITY_IDS.FOOD_STALL,
    });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    assert.equal(scene.createSnapshot().plannedAction.id, PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE);
  }

  /** 主目的完了後に次の目的選択へ戻る。 */
  function selectsNextGoalAfterCompletion() {
    const scene = new RuntimePrototypeFestivalScene({ random: () => 0, enableInterruptions: false });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.PLAN_SELECT,
      actionId: PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE,
    });
    advanceSeconds(scene, 40);
    moveToPosition(scene, TEST_POSITIONS.OPENING_STAGE);
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.ACTIVITY_START,
      activityId: PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE,
    });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.plannedAction, null);
    assert.equal(snapshot.goalSelection.reason, 'completed');
  }

  /** 主目的を見逃しても終了せず次の目的選択へ戻る。 */
  function selectsNextGoalAfterMiss() {
    const scene = new RuntimePrototypeFestivalScene({ random: () => 0, enableInterruptions: false });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.PLAN_SELECT,
      actionId: PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE,
    });
    advanceSeconds(scene, 72);
    const snapshot = scene.createSnapshot();
    assert.equal(snapshot.gameTime.isEnded, false);
    assert.equal(snapshot.goalSelection.reason, 'missed');
  }

  /** 発見地点は内容を伏せた手掛かりだけを公開する。 */
  function hidesDiscoveryContentsBehindCues() {
    const scene = new RuntimePrototypeFestivalScene({ random: () => 0, enableInterruptions: false });
    const discovery = scene.createSnapshot().map.local.discoveries[0];
    assert.ok(['crowd', 'voice', 'sign', 'glimmer'].includes(discovery.cueKind));
    assert.equal(typeof discovery.cueLabel, 'string');
    assert.equal('type' in discovery, false);
  }

  /** 巻き戻し後は主目的を再選択する。 */
  function resetsGoalSelectionOnRewind() {
    const scene = new RuntimePrototypeFestivalScene({ random: () => 0, enableInterruptions: false });
    sendInput(scene, {
      type: PROTOTYPE_INPUT_TYPES.PLAN_SELECT,
      actionId: PROTOTYPE_ACTIVITY_IDS.WORLD_TREE_STAGE,
    });
    advanceSeconds(scene, 20);
    sendInput(scene, { type: PROTOTYPE_INPUT_TYPES.REWIND });
    assert.equal(scene.createSnapshot().goalSelection.reason, 'initial');
  }

  test('PT-UT-S32-C01 開始時に主目的候補を提示して時間を止める', offersPrimaryGoalsAndFreezesTime);
  test('PT-UT-S32-C02/C06 主目的とランドマークを選択する', selectsGoalAndHighlightsLandmark);
  test('PT-UT-S32-C03 寄り道中も主目的を維持する', keepsGoalDuringStallDetour);
  test('PT-UT-S32-C04 主目的完了後に再選択する', selectsNextGoalAfterCompletion);
  test('PT-UT-S32-C05 主目的を見逃しても再選択できる', selectsNextGoalAfterMiss);
  test('PT-UT-S32-C07 発見内容を手掛かりの裏に隠す', hidesDiscoveryContentsBehindCues);
  test('PT-UT-S32-C08 巻き戻し後に主目的を再選択する', resetsGoalSelectionOnRewind);
}

describe('PT-UT-S18 PrototypeFestivalScene 時間と操作', registerTimeAndInputTests);
describe('PT-UT-S19 PrototypeFestivalScene イベント進行', registerEventProgressTests);
describe('PT-UT-S20 PrototypeFestivalScene 助言と巻き戻し', registerAdviceAndRewindTests);
describe('PT-UT-S21 PrototypeFestivalScene 屋台トラブル対応', registerStallInteractionTests);
describe('PT-UT-S22 PrototypeFestivalScene 迷子の同行', registerLostChildCompanionTests);
describe('PT-UT-S23 PrototypeFestivalScene イベント接近判定', registerEventProximityTests);
describe('PT-UT-S24 PrototypeFestivalScene 教師仕事', registerTeacherTaskTests);
describe('PT-UT-S25 PrototypeFestivalScene 連鎖型ハプニング', registerHappeningIntegrationTests);
describe('PT-UT-S27-S29 PrototypeFestivalScene 探索導線', registerExplorationGuidanceTests);
describe('PT-UT-S30-S31 PrototypeFestivalScene 予定行動と巻き込み', registerPlannedActivityAndInterruptionTests);
describe('PT-UT-S32 PrototypeFestivalScene 主目的とランドマーク', registerPrimaryGoalTests);
