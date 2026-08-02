import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  CANONICAL_INPUT_TYPES,
  CANONICAL_MAIN_EVENT_IDS,
  CANONICAL_PHASE_IDS,
  CANONICAL_PLAYER_SPEED_CELLS_PER_SECOND,
  CanonicalFestivalPrototypeScene,
  HAUNTED_PANIC_RECOVERY_PER_SECOND,
  SCHOOL_POSITIONS,
} from '../../../src/gameDomain/canonicalFestivalPrototypeScene/canonicalFestivalPrototypeScene.js';

/** お化け屋敷の実装済み一本道ルートで使う座標。 */
const HAUNTED_ROUTE_POINTS = Object.freeze({
  ENTRANCE: Object.freeze({ x: 2.5, y: 10.5 }),
  PORTRAIT: Object.freeze({ x: 2.5, y: 7.5 }),
  LEFT_TOP_CORNER: Object.freeze({ x: 2.5, y: 2 }),
  VOICE: Object.freeze({ x: 5.5, y: 2 }),
  CENTER_BOTTOM_CORNER: Object.freeze({ x: 5.5, y: 10 }),
  GHOST: Object.freeze({ x: 9.5, y: 10 }),
  EXIT: Object.freeze({ x: 9.5, y: 10.5 }),
});

test('CFP-UT-S33 主要イベントのスナップショットにチャオ探索を含める', () => {
  // Arrange
  const scene = new CanonicalFestivalPrototypeScene();

  // Act
  const snapshot = scene.createSnapshot();

  // Assert
  assert.equal(snapshot.events['chao-search'].type, 'episode');
  assert.equal(snapshot.events['chao-search'].label, 'チャオ探索');
  assert.equal(snapshot.events['haunted-house'].type, 'episode');
  assert.equal(snapshot.events['mahora-budokai'].type, 'episode');
  assert.ok(snapshot.events['chao-search'].data);
});

test('CFP-UT-SAVE-C01 自由探索中にセーブとロードができる', () => {
  const storage = {
    value: null,
    getItem() { return this.value; },
    setItem(key, value) { this.value = value; },
  };
  const scene = new CanonicalFestivalPrototypeScene({
    storage,
    initialGameTime: { festivalDay: 1, loopCount: 2, hour: 10, minute: 0, label: 'AM10:00' },
    initialPhaseId: CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
  });

  sendInput(scene, { type: CANONICAL_INPUT_TYPES.SAVE_GAME });
  assert.equal(scene.createSnapshot().saveData.status.text, 'セーブしました。');
  waitUntil(scene, 10, 5);
  assert.equal(scene.createSnapshot().gameTime.label, 'AM10:05');

  sendInput(scene, { type: CANONICAL_INPUT_TYPES.LOAD_GAME });
  const snapshot = scene.createSnapshot();
  assert.equal(snapshot.gameTime.label, 'AM10:00');
  assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
  assert.equal(snapshot.saveData.status.text, 'ロードしました。');
});

test('CFP-UT-SAVE-C02 自由探索中以外はセーブとロードを実行できない', () => {
  const storage = {
    value: null,
    getItem() { return this.value; },
    setItem(key, value) { this.value = value; },
  };
  const scene = new CanonicalFestivalPrototypeScene({ storage });

  sendInput(scene, { type: CANONICAL_INPUT_TYPES.SAVE_GAME });
  assert.equal(scene.createSnapshot().saveData.status.kind, 'error');
  assert.equal(storage.value, null);
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.LOAD_GAME });
  assert.equal(scene.createSnapshot().saveData.status.kind, 'error');
});

test('CFP-UT-SAVE-C03 壊れたセーブデータは現在状態を変更しない', () => {
  const storage = {
    value: '{invalid-json',
    getItem() { return this.value; },
    setItem(key, value) { this.value = value; },
  };
  const scene = new CanonicalFestivalPrototypeScene({
    storage,
    initialGameTime: { festivalDay: 1, loopCount: 2, hour: 10, minute: 0, label: 'AM10:00' },
    initialPhaseId: CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
  });

  sendInput(scene, { type: CANONICAL_INPUT_TYPES.LOAD_GAME });
  const snapshot = scene.createSnapshot();
  assert.equal(snapshot.gameTime.label, 'AM10:00');
  assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
  assert.equal(snapshot.saveData.status.kind, 'error');
});

test('CFP-UT-LIBRARY-C01 図書館島へ移動して探検を開始できる', () => {
  const scene = createSceneAtChaoSearch(() => 0);

  selectDestination(scene, 'library-island');
  advanceFreeExploreTravel(scene);
  let snapshot = scene.createSnapshot();
  assert.equal(snapshot.freeExplore.currentLocation.id, 'library-island');
  assert.ok(snapshot.freeExplore.locationActions.some((action) => (
    action.id === 'start-library-dungeon'
  )));

  selectLocationAction(scene, 'start-library-dungeon');
  snapshot = scene.createSnapshot();
  assert.equal(snapshot.freeExplore.libraryDungeon.isActive, true);
  assert.equal(snapshot.freeExplore.libraryDungeon.currentFloor, 1);
  advanceStory(scene);
  snapshot = scene.createSnapshot();
  assert.deepEqual(
    snapshot.freeExplore.locationActions
      .filter((action) => action.kind === 'library-dungeon-choice')
      .map((action) => action.label),
    ['左', '中央', '右'],
  );
});

test('CFP-UT-LIBRARY-C02 探検の選択で5分進み階層が進む', () => {
  const scene = createSceneAtChaoSearch(() => 0);
  selectDestination(scene, 'library-island');
  advanceFreeExploreTravel(scene);
  selectLocationAction(scene, 'start-library-dungeon');
  advanceStory(scene);
  const before = scene.createSnapshot();

  selectLocationAction(scene, 'library-dungeon-choice-0');
  const result = scene.createSnapshot();

  assert.equal(result.gameTime.minute, before.gameTime.minute + 5);
  assert.equal(result.freeExplore.libraryDungeon.currentFloor, 2);
  assert.match(result.freeExplore.actionResult.text, /左の道/);
});

test('CFP-UT-LIBRARY-C03 地下10階到達後に帰還し到達フラグを保持する', () => {
  const scene = createSceneAtChaoSearch(() => 0);
  selectDestination(scene, 'library-island');
  advanceFreeExploreTravel(scene);
  selectLocationAction(scene, 'start-library-dungeon');
  advanceStory(scene);

  for (let floor = 1; floor < 10; floor += 1) {
    selectLocationAction(scene, 'library-dungeon-choice-1');
    if (floor < 9) {
      advanceStory(scene);
    }
  }

  const snapshot = scene.createSnapshot();
  assert.equal(snapshot.freeExplore.currentLocation.id, 'library-island');
  assert.equal(snapshot.freeExplore.libraryDungeon.isActive, false);
  assert.equal(snapshot.freeExplore.libraryDungeon.hasReachedFinalFloor, true);
  assert.match(snapshot.freeExplore.actionResult.text, /地下10階/);
});

test('CFP-UT-FESTIVAL-END-C01 1日目PM11:30で終了演出へ移行する', () => {
  const scene = new CanonicalFestivalPrototypeScene({
    initialGameTime: { festivalDay: 1, loopCount: 1, hour: 23, minute: 25, label: 'PM11:25' },
    initialPhaseId: CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
  });

  waitUntil(scene, 23, 30);
  const snapshot = scene.createSnapshot();

  assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.FESTIVAL_ENDING);
  assert.equal(snapshot.gameTime.label, 'PM11:30');
  assert.equal(snapshot.phase.inputKind, 'story');
  assert.equal(snapshot.dialogue.speaker, '麻帆良祭放送');
});

test('CFP-UT-FESTIVAL-END-C02 終了演出後PM11:37にゲームオーバーになる', () => {
  const scene = new CanonicalFestivalPrototypeScene({
    initialGameTime: { festivalDay: 1, loopCount: 1, hour: 23, minute: 30, label: 'PM11:30' },
    initialPhaseId: CANONICAL_PHASE_IDS.FESTIVAL_ENDING,
  });

  advanceStory(scene);
  advanceStory(scene);
  advanceStory(scene);
  const snapshot = scene.createSnapshot();

  assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.GAME_OVER);
  assert.equal(snapshot.gameTime.label, 'PM11:37');
  assert.deepEqual(snapshot.gameOver, {
    isActive: true,
    reason: 'チャオの計画が発動し、企みが成功した。',
  });
});

test('CFP-UT-FESTIVAL-END-C03 最終決戦ルートでは通常終了処理を行わない', () => {
  const scene = new CanonicalFestivalPrototypeScene({
    initialGameTime: { festivalDay: 1, loopCount: 1, hour: 23, minute: 25, label: 'PM11:25' },
    initialPhaseId: CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
    isFinalBattleRoute: true,
  });

  waitUntil(scene, 23, 30);
  const snapshot = scene.createSnapshot();

  assert.notEqual(snapshot.phase.id, CANONICAL_PHASE_IDS.FESTIVAL_ENDING);
  assert.notEqual(snapshot.phase.id, CANONICAL_PHASE_IDS.GAME_OVER);
  assert.equal(snapshot.gameTime.label, 'PM11:30');
});

test('CFP-UT-S04-C08 お化け屋敷の演出中は次へ入力だけを受け付ける', () => {
  // Arrange
  const scene = createSceneAtMoveTo3A();
  moveForSeconds(scene, 0, 1, 0.8);
  moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);
  selectChoice(scene, 'normal');

  // Act
  selectChoice(scene, 'advance-haunted');
  const scare = scene.createSnapshot();
  advanceStory(scene);
  const snapshot = scene.createSnapshot();

  // Assert
  assert.equal(scare.phase.id, CANONICAL_PHASE_IDS.HAUNTED_HOUSE);
  assert.equal(scare.phase.inputKind, 'story');
  assert.equal(scare.choices.length, 0);
  assert.equal(scare.dialogue.text, '肖像画が動く');
  assert.equal(snapshot.phase.inputKind, 'choice');
  assert.equal(snapshot.hauntedHouse.panic.current, 25);
  assert.ok(snapshot.choices.some((choice) => choice.id === 'advance-haunted'));
});

test.skip('CFP-UT-S14-C08 クラスメイト出し物スケジュールを時刻とエリア付きで返す（旧仕様）', () => {
  // Arrange
  const scene = createSceneAtChaoSearch(() => 0);
  completeChaoSearchToThirdLoopPatrol(scene);
  completeThirdLoopToClassmateAttractionTour(scene);

  // Act
  const snapshot = scene.createSnapshot();
  const schedule = snapshot.schedule.negi.entries;
  const festivalSchedule = snapshot.schedule.festival.entries;

  // Assert
  assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR);
  assert.equal(snapshot.schedule.negi.range.startTimeLabel, 'AM10:00');
  assert.equal(snapshot.schedule.negi.range.endTimeLabel, 'PM9:00');
  assert.equal(schedule.filter((entry) => !['nodoka-date', 'haunted-house-help'].includes(entry.id)).length, snapshot.thirdLoop.attractions.length);
  assert.ok(schedule.every((entry) => entry.areaId && entry.areaName));
  assert.deepEqual(
    schedule.map((entry) => entry.startMinute),
    [...schedule].map((entry) => entry.startMinute).sort((left, right) => left - right),
  );
  assert.equal(snapshot.schedule.festival.range.startTimeLabel, 'AM10:00');
  assert.equal(snapshot.schedule.festival.range.endTimeLabel, 'PM4:00');
  const nodokaDate = schedule.find((entry) => entry.id === 'nodoka-date');
  const hauntedHouse = festivalSchedule.find((entry) => entry.id === 'haunted-house');
  assert.deepEqual(
    {
      actorName: nodokaDate.actorName,
      attractionName: nodokaDate.attractionName,
      areaId: nodokaDate.areaId,
      startTimeLabel: nodokaDate.startTimeLabel,
      endTimeLabel: nodokaDate.endTimeLabel,
    },
    {
      actorName: 'のどか',
      attractionName: 'のどかとのデート',
      areaId: 'dining-street',
      startTimeLabel: 'PM4:00',
      endTimeLabel: 'PM5:30',
    },
  );
  assert.equal(schedule.filter((entry) => !['nodoka-date', 'haunted-house-help'].includes(entry.id)).length, snapshot.thirdLoop.attractions.length);
  assert.deepEqual(
    {
      actorName: hauntedHouse.actorName,
      attractionName: hauntedHouse.attractionName,
      areaId: hauntedHouse.areaId,
      startTimeLabel: hauntedHouse.startTimeLabel,
      endTimeLabel: hauntedHouse.endTimeLabel,
      isAllDay: hauntedHouse.isAllDay,
    },
    {
      actorName: '3-A',
      attractionName: 'ホラーハウス',
      areaId: 'school-building',
      startTimeLabel: 'AM10:00',
      endTimeLabel: 'PM4:00',
      isAllDay: true,
    },
  );
  assert.deepEqual(
    festivalSchedule.map((entry) => entry.id),
    ['haunted-house', 'gun-shooting', 'roller-coaster'],
  );
  assert.ok(festivalSchedule.every((entry) => entry.areaId === 'ground' && entry.isAllDay));
});

test.skip('CFP-UT-S14-C09 クラスメイト出し物はエリア移動後に選択できる（旧仕様）', () => {
  // Arrange
  const scene = createSceneAtChaoSearch(() => 0);
  completeChaoSearchToThirdLoopPatrol(scene);
  completeThirdLoopToClassmateAttractionTour(scene);
  const target = scene.createSnapshot().thirdLoop.attractions
    .find((entry) => entry.id === 'asuna');

  // Act
  selectChoice(scene, `visit-${target.id}`);
  const beforeMove = scene.createSnapshot();
  selectChoice(scene, `go-attraction-area-${target.areaId}`);
  const afterMove = scene.createSnapshot();
  selectChoice(scene, `visit-${target.id}`);
  const dialogue = scene.createSnapshot();

  // Assert
  assert.equal(beforeMove.thirdLoop.completedAttractionActorIds.includes(target.id), false);
  assert.equal(afterMove.thirdLoop.currentAttractionAreaId, target.areaId);
  assert.ok(afterMove.choices.some((choice) => choice.id === `visit-${target.id}`));
  assert.equal(dialogue.thirdLoop.completedAttractionActorIds.includes(target.id), true);
});

describe.skip('CFP-UT-S14 3ループ目以降（旧仕様）', () => {
  test('CFP-UT-S14-C01 世界樹事件後は3ループ目PM1:30の見回りへ進む', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 12, 10);

    // Act
    completeChaoSearchToThirdLoopWorldTree(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.gameTime.loopCount, 3);
    assert.equal(snapshot.gameTime.label, 'PM1:30');
    assert.equal(snapshot.freeExplore.currentLocation.id, 'world-tree');
    assert.equal(snapshot.thirdLoop.patrolStepIndex, 0);
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'start-world-tree-patrol'));
    assert.equal(snapshot.freeExplore.locationActions.some((action) => action.id === 'talk-ayaka-third-loop'), false);
  });

  test('CFP-UT-S14-C02 見回りチェックポイントを完了するとPM4:12の夕映合流へ進む', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    completeChaoSearchToThirdLoopPatrol(scene);

    // Act
    completeThirdLoopPatrol(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.THIRD_LOOP_CAFE);
    assert.equal(snapshot.gameTime.label, 'PM4:12');
    assert.deepEqual(snapshot.thirdLoop.completedPatrolStepIds.slice(0, 3), ['start-patrol', 'join-kotaro', 'finish-patrol']);
  });

  test('CFP-UT-S14-C03 夕映とカフェへ到着すると観光船へ進み、観光船後はPM6:00の夕食へ進む', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    completeChaoSearchToThirdLoopPatrol(scene);
    completeThirdLoopPatrol(scene);

    // Act
    moveNear(scene, SCHOOL_POSITIONS.CAFE);
    const boat = scene.createSnapshot();
    advanceCurrentDialogue(scene);
    const dinner = scene.createSnapshot();

    // Assert
    assert.equal(boat.phase.id, CANONICAL_PHASE_IDS.THIRD_LOOP_BOAT);
    assert.equal(dinner.phase.id, CANONICAL_PHASE_IDS.THIRD_LOOP_DINNER);
    assert.equal(dinner.gameTime.label, 'PM6:00');
  });

  test('CFP-UT-S14-C04 夕食後に会場変更を確認し龍宮神社へ行くと武道会予選へ進む', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    completeChaoSearchToThirdLoopPatrol(scene);
    completeThirdLoopPatrol(scene);
    moveNear(scene, SCHOOL_POSITIONS.CAFE);
    advanceCurrentDialogue(scene);

    // Act
    advanceCurrentDialogue(scene);
    moveNear(scene, SCHOOL_POSITIONS.TOURNAMENT_NOTICE);
    const notice = scene.createSnapshot();
    moveNear(scene, SCHOOL_POSITIONS.RYUGU_SHRINE);
    const qualifier = scene.createSnapshot();

    // Assert
    assert.equal(notice.objective.position.x, SCHOOL_POSITIONS.RYUGU_SHRINE.x);
    assert.equal(qualifier.phase.id, CANONICAL_PHASE_IDS.TOURNAMENT_QUALIFIER);
  });

  test('CFP-UT-S14-C05 武道会予選後はPM9:00の3-A反省会へ進み、さらに4ループ目AM11:30へ戻る', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    completeChaoSearchToThirdLoopPatrol(scene);

    // Act
    completeThirdLoopToFourthLoopHauntedHouse(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.gameTime.loopCount, 4);
    assert.equal(snapshot.gameTime.label, 'AM11:30');
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'visit-haunted-house'));
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'help-haunted-house'));
  });

  test('CFP-UT-S14-C10 3-Aホラーハウスを客として利用できる', () => {
    // Arrange
  const scene = createSceneAtChaoSearch(() => 0);
  completeChaoSearchToThirdLoopPatrol(scene);
  completeThirdLoopToFourthLoopHauntedHouse(scene);

    // Act
    selectLocationAction(scene, 'visit-haunted-house');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    assert.equal(snapshot.gameTime.label, 'AM11:35');
    assert.equal(snapshot.thirdLoop.isAyakaCompanion, false);
  });

  test('CFP-UT-S14-C11 3-Aホラーハウスの手伝いは小太郎非同行ならPM12:00で終了する', () => {
    // Arrange
  const scene = createSceneAtChaoSearch(() => 0);
  completeChaoSearchToThirdLoopPatrol(scene);
  completeThirdLoopToFourthLoopHauntedHouse(scene);

    // Act
    selectLocationAction(scene, 'help-haunted-house');
    const helping = scene.createSnapshot();
    advanceCurrentDialogue(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(helping.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    assert.equal(helping.gameTime.label, 'PM12:00');
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.thirdLoop.isAyakaCompanion, false);
  });

  test('CFP-UT-S14-C13 小太郎へ話しかけてパーティ加入を選択できる', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    completeChaoSearchToThirdLoopPatrol(scene);
    completeThirdLoopToFourthLoopHauntedHouse(scene);
    selectDestination(scene, 'ground');
    advanceFreeExploreTravel(scene);

    // Act
    selectLocationAction(scene, 'talk-classmate-kotaro');
    const conversation = scene.createSnapshot();
    selectChoice(scene, 'join-kotaro');
    const joined = scene.createSnapshot();

    // Assert
    assert.ok(conversation.choices.some((choice) => choice.id === 'join-kotaro'));
    assert.ok(joined.companions.some((companion) => companion.id === 'kotaro'));
    assert.equal(joined.freeExplore.currentLocation.id, 'ground');
  });

  test('CFP-UT-S14-C14 小太郎同行時の手伝いはあやかとの専用イベントになりPM6:00で終了する', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    completeChaoSearchToThirdLoopPatrol(scene);
    completeThirdLoopToFourthLoopHauntedHouse(scene);
    selectDestination(scene, 'ground');
    advanceFreeExploreTravel(scene);
    selectLocationAction(scene, 'talk-classmate-kotaro');
    selectChoice(scene, 'join-kotaro');
    selectDestination(scene, 'school-building');
    advanceFreeExploreTravel(scene);

    // Act
    selectLocationAction(scene, 'help-haunted-house');
    const active = scene.createSnapshot();
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);
    const finished = scene.createSnapshot();

    // Assert
    assert.equal(active.phase.id, CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR);
    assert.equal(active.gameTime.label, 'AM11:50');
    assert.equal(active.activeEvent.id, 'kotaro-ayaka-attraction-tour');
    assert.equal(active.activeEvent.endTimeLabel, 'PM6:00');
    assert.equal(finished.gameTime.label, 'PM6:00');
    assert.equal(finished.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(finished.freeExplore.currentLocation.id, 'school-building');
    assert.equal(finished.companions.some((companion) => companion.id === 'kotaro'), false);
  });

  test('CFP-UT-S14-C12 時間外のホラーハウス手伝いではあやかと合流しない', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 12, 5);
    selectDestination(scene, 'school-building');
    advanceFreeExploreTravel(scene);

    // Act
    selectLocationAction(scene, 'help-haunted-house');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    assert.equal(snapshot.gameTime.label, 'PM12:15');
    assert.equal(snapshot.thirdLoop.isAyakaCompanion, false);
    assert.equal(snapshot.freeExplore.actionResult.text, 'ホラーハウスの客引きを手伝った。');
  });

  test.skip('CFP-UT-S14-C06 出し物担当生徒に話しかけると訪問済みになる', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    completeChaoSearchToThirdLoopPatrol(scene);
    completeThirdLoopToClassmateAttractionTour(scene);
    const attraction = scene.createSnapshot().thirdLoop.attractions[0];

    // Act
    moveToClassmateAttraction(scene, attraction);
    interact(scene, attraction.id);
    const dialogue = scene.createSnapshot();
    advanceStory(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(dialogue.dialogue.anchor.type, 'actor');
    assert.deepEqual(snapshot.thirdLoop.completedAttractionActorIds, [attraction.id]);
    assert.equal(snapshot.routeComplete, false);
  });

  test.skip('CFP-UT-S14-C07 全出し物担当生徒と会話するとルート完了になる', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    completeChaoSearchToThirdLoopPatrol(scene);
    completeThirdLoopToClassmateAttractionTour(scene);

    // Act
    completeClassmateAttractionTour(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.COMPLETE);
    assert.equal(snapshot.routeComplete, true);
  });

  test('CFP-UT-S14-C15 2-loop haunted-house help can start with Kotaro outside loop four', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    const kotaro = scene.createSnapshot().classmateStatus.find((actor) => actor.id === 'kotaro');
    if (kotaro.areaId !== scene.createSnapshot().freeExplore.currentLocation.id) {
      selectDestination(scene, kotaro.areaId);
      advanceFreeExploreTravel(scene);
    }
    selectLocationAction(scene, 'talk-classmate-kotaro');
    selectChoice(scene, 'join-kotaro');
    advanceCurrentDialogue(scene);
    waitUntil(scene, 11, 30);
    selectDestination(scene, 'school-building');
    advanceFreeExploreTravel(scene);

    // Act
    selectLocationAction(scene, 'help-haunted-house');
    const active = scene.createSnapshot();
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);
    const finished = scene.createSnapshot();

    // Assert
    assert.equal(active.gameTime.loopCount, 2);
    assert.equal(active.phase.id, CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR);
    assert.equal(finished.gameTime.loopCount, 2);
    assert.equal(finished.gameTime.label, 'PM6:00');
    assert.equal(finished.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
  });

});

/** 時間経過なしで入力を1件送る。 */
function sendInput(scene, input) {
  scene.update({
    context: {
      deltaTimeMs: 0,
      inputs: [input],
    },
  });
}

/** 指定秒数だけ入力なしで更新する。 */
function advanceSeconds(scene, seconds) {
  scene.update({
    context: {
      deltaTimeMs: seconds * 1000,
      inputs: [],
    },
  });
}

/** ストーリー送りを1回実行する。 */
function advanceStory(scene) {
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.STORY_ADVANCE });
}

/** 現在段階の選択肢を1件選択する。 */
function selectChoice(scene, choiceId) {
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.CHOICE_SELECT, choiceId });
}

/** 現在位置近くの対象へ話す、調べる操作を行う。 */
function interact(scene, targetId = null) {
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.INTERACT, targetId });
}

/** 場所選択式の目的地を選択する。 */
function selectDestination(scene, destinationId) {
  if (scene.createSnapshot().phase.id === CANONICAL_PHASE_IDS.LOCATION_ACTIONS) {
    selectLocationAction(scene, `move-to-${destinationId}`);
    return;
  }
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.DESTINATION_SELECT, destinationId });
}

/** 場所選択式の現地行動を選択する。 */
function selectLocationAction(scene, actionId) {
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.LOCATION_ACTION_SELECT, actionId });
}

/** 場所選択式の巻き込み対応を選択する。 */
function selectInterruption(scene, choiceId) {
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.INTERRUPTION_SELECT, choiceId });
}

/** メインイベントを設定する。 */
function setMainEvent(scene, eventId) {
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.MAIN_EVENT_SET, eventId });
}

/** メインイベントを未設定にする。 */
function clearMainEvent(scene) {
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.MAIN_EVENT_CLEAR });
}

/** チャオ探索中の検証用未来時刻を指定する。 */
function waitUntil(scene, hour, minute) {
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.WAIT_UNTIL, targetMinute: hour * 60 + minute });
}

/** チャオ探索中にのどかデートを開始する。 */
/** 現在段階の会話を最後まで送る。 */
function advanceCurrentDialogue(scene) {
  for (let index = 0; index < 10; index += 1) {
    const before = scene.createSnapshot().phase.id;
    advanceStory(scene);
    const after = scene.createSnapshot().phase.id;
    if (after !== before) {
      return;
    }
  }
}

/** 場所選択式の移動中フェーズを到着または巻き込みまで進める。 */
function advanceFreeExploreTravel(scene) {
  if (scene.createSnapshot().phase.id === CANONICAL_PHASE_IDS.TRAVEL) {
    advanceStory(scene);
  }
}

/** 移動方向を指定秒数入力して止める。 */
function moveForSeconds(scene, x, y, seconds) {
  scene.update({
    context: {
      deltaTimeMs: seconds * 1000,
      inputs: [{ type: CANONICAL_INPUT_TYPES.MOVEMENT_SET, x, y }],
    },
  });
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.MOVEMENT_SET, x: 0, y: 0 });
}

/** 指定座標へ直線で近づく操作を繰り返す。 */
function moveNear(scene, destination, maximumSteps = 260) {
  void maximumSteps;
  const snapshot = scene.createSnapshot();
  if (snapshot.phase.id === CANONICAL_PHASE_IDS.MOVE_TO_3A) {
    selectChoice(scene, 'go-to-3a');
    return;
  }
  if (snapshot.phase.id === CANONICAL_PHASE_IDS.MOVE_TO_HEALTH_ROOM) {
    selectChoice(scene, 'go-to-health-room');
    return;
  }
  if (snapshot.phase.id === CANONICAL_PHASE_IDS.MOVE_TO_CAFE) {
    selectChoice(scene, 'go-to-cafe');
    return;
  }
  if (snapshot.phase.id === CANONICAL_PHASE_IDS.HAUNTED_HOUSE) {
    selectChoice(scene, 'advance-haunted');
    return;
  }
  if (snapshot.phase.id === CANONICAL_PHASE_IDS.FOLLOW_NODOKA) {
    selectChoice(scene, 'keep-distance-nodoka');
    return;
  }
  if (snapshot.phase.id === CANONICAL_PHASE_IDS.EVA_ESCAPE) {
    const isCaptureTarget = Math.abs(destination.x - SCHOOL_POSITIONS.EVA_START.x) < 0.01
      && Math.abs(destination.y - SCHOOL_POSITIONS.EVA_START.y) < 0.01;
    selectChoice(scene, isCaptureTarget ? 'eva-captured' : 'eva-escape');
    return;
  }
  if (snapshot.phase.id === CANONICAL_PHASE_IDS.ESCAPE_PATROL_STUDENTS) {
    selectChoice(scene, 'escape-patrol');
    return;
  }
  if (snapshot.phase.id === CANONICAL_PHASE_IDS.THIRD_LOOP_PATROL) {
    selectChoice(scene, 'next-patrol');
    return;
  }
  if (snapshot.phase.id === CANONICAL_PHASE_IDS.THIRD_LOOP_CAFE) {
    selectChoice(scene, 'go-third-loop-cafe');
    return;
  }
  return;

  const startPhaseId = scene.createSnapshot().phase.id;
  for (let index = 0; index < maximumSteps; index += 1) {
    const snapshot = scene.createSnapshot();
    if (snapshot.phase.id !== startPhaseId) {
      return;
    }
    const position = snapshot.player.position;
    const distance = Math.hypot(destination.x - position.x, destination.y - position.y);
    if (distance <= 0.7) {
      sendInput(scene, { type: CANONICAL_INPUT_TYPES.MOVEMENT_SET, x: 0, y: 0 });
      return;
    }
    const seconds = Math.min(0.06, distance / CANONICAL_PLAYER_SPEED_CELLS_PER_SECOND);
    scene.update({
      context: {
        deltaTimeMs: seconds * 1000,
        inputs: [{
          type: CANONICAL_INPUT_TYPES.MOVEMENT_SET,
          x: (destination.x - position.x) / distance,
          y: (destination.y - position.y) / distance,
        }],
      },
    });
  }
  assert.fail(`目的地へ到達できない: ${destination.x},${destination.y}`);
}

/** 原作導入プロトタイプを移動開始まで進める。 */
function createSceneAtMoveTo3A(options = {}) {
  const scene = new CanonicalFestivalPrototypeScene(options);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  return scene;
}

/** お化け屋敷を完了して保健室移動まで進める。 */
function completeHauntedHouse(scene) {
  selectChoice(scene, 'normal');
  moveNear(scene, HAUNTED_ROUTE_POINTS.PORTRAIT);
  advanceStory(scene);
  moveNear(scene, HAUNTED_ROUTE_POINTS.LEFT_TOP_CORNER);
  moveNear(scene, HAUNTED_ROUTE_POINTS.VOICE);
  advanceStory(scene);
  moveNear(scene, HAUNTED_ROUTE_POINTS.CENTER_BOTTOM_CORNER);
  moveNear(scene, HAUNTED_ROUTE_POINTS.GHOST);
  advanceStory(scene);
  moveNear(scene, HAUNTED_ROUTE_POINTS.EXIT);
  advanceCurrentDialogue(scene);
}

/** 2ループ目のカフェ会話まで進める。 */
function createSceneAtCafe(options = {}) {
  const scene = createSceneAtMoveTo3A(options);
  moveForSeconds(scene, 0, 1, 0.8);
  moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);
  completeHauntedHouse(scene);
  moveForSeconds(scene, 1, 0, 3);
  moveForSeconds(scene, 0, -1, 1);
  moveNear(scene, SCHOOL_POSITIONS.HEALTH_ROOM);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  moveNear(scene, { x: 17, y: 16 });
  moveNear(scene, { x: 24, y: 16 });
  moveNear(scene, SCHOOL_POSITIONS.CAFE);
  return scene;
}

/** カシオペア起動直後まで進める。 */
function createSceneAfterRewind(options = {}) {
  const scene = createSceneAtRewindDialogue(options);
  advanceCurrentDialogue(scene);
  return scene;
}

/** カシオペア起動演出の会話段階まで進める。 */
function createSceneAtRewindDialogue(options = {}) {
  const scene = createSceneAtMoveTo3A(options);
  moveForSeconds(scene, 0, 1, 0.8);
  moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);
  completeHauntedHouse(scene);
  moveForSeconds(scene, 1, 0, 3);
  moveForSeconds(scene, 0, -1, 1);
  moveNear(scene, SCHOOL_POSITIONS.HEALTH_ROOM);
  advanceCurrentDialogue(scene);
  return scene;
}

/** のどか尾行を開始する。 */
function createSceneAtFollowNodoka(options = {}) {
  const scene = createSceneAtCafe(options);
  advanceCurrentDialogue(scene);
  return scene;
}

/** 尾行を成功させて隠れる段階まで進める。 */
function completeFollowToHide(scene) {
  for (let index = 0; index < 10; index += 1) {
    if (scene.createSnapshot().phase.id !== CANONICAL_PHASE_IDS.FOLLOW_NODOKA) {
      return;
    }
    selectChoice(scene, 'keep-distance-nodoka');
  }
}

/** エヴァ逃走地点まで通路沿いに移動する。 */
function completeEvaEscape(scene) {
  moveNear(scene, { x: 20, y: 24 });
  moveNear(scene, { x: 20, y: 16 });
  moveNear(scene, { x: 29, y: 16 });
  moveNear(scene, SCHOOL_POSITIONS.ESCAPE_GOAL);
}

/** チャオ探索開始まで進める。 */
function createSceneAtChaoSearch(random = () => 0) {
  const scene = createSceneAtFollowNodoka({ random });
  completeFollowToHide(scene);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  completeEvaEscape(scene);
  return scene;
}

/** チャオ探索候補地点へ移動して調べる。 */
function visitChaoLocation(scene, locationId) {
  const location = scene.createSnapshot().chaoSearch.locations.find((entry) => entry.id === locationId);
  assert.ok(location, `候補地点が存在する: ${locationId}`);
  selectDestination(scene, location.areaId);
  advanceFreeExploreTravel(scene);
  if (scene.createSnapshot().phase.id === CANONICAL_PHASE_IDS.INTERRUPTION) {
    selectInterruption(scene, 'ignore');
    advanceFreeExploreTravel(scene);
  }
  assert.equal(scene.createSnapshot().phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
  selectLocationAction(scene, `investigate-${location.id}`);
}

/** デート前自由時間まで進める。 */
function createSceneAtPrepareDate(random = () => 0) {
  const scene = createSceneAtChaoSearch(random);
  visitChaoLocation(scene, 'gun-shooting');
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  return scene;
}

/** チャオ探索から3ループ目の世界樹周辺まで進める。 */
function completeChaoSearchToThirdLoopWorldTree(scene) {
  visitChaoLocation(scene, 'gun-shooting');
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  waitUntil(scene, 16, 0);
  advanceCurrentDialogue(scene);
  selectDestination(scene, 'dining-street');
  advanceFreeExploreTravel(scene);
  selectLocationAction(scene, 'talk-nodoka-date');
  advanceCurrentDialogue(scene);
  moveNear(scene, SCHOOL_POSITIONS.ESCAPE_GOAL);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
}

/** チャオ探索から3ループ目の世界樹見回りまで進める。 */
function completeChaoSearchToThirdLoopPatrol(scene) {
  completeChaoSearchToThirdLoopWorldTree(scene);
  selectLocationAction(scene, 'start-world-tree-patrol');
}

/** 3ループ目見回りを完了して夕映とのカフェ移動へ進める。 */
function completeThirdLoopPatrol(scene) {
  for (let index = 0; index < 10; index += 1) {
    if (scene.createSnapshot().phase.id !== CANONICAL_PHASE_IDS.THIRD_LOOP_PATROL) {
      return;
    }
    selectChoice(scene, 'next-patrol');
  }
}

/** 3ループ目の夕映行動から4ループ目の出し物巡り開始まで進める。 */
function completeThirdLoopToClassmateAttractionTour(scene) {
  completeThirdLoopPatrol(scene);
  moveNear(scene, SCHOOL_POSITIONS.CAFE);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  moveNear(scene, SCHOOL_POSITIONS.TOURNAMENT_NOTICE);
  moveNear(scene, SCHOOL_POSITIONS.RYUGU_SHRINE);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  selectLocationAction(scene, 'help-haunted-house');
  advanceCurrentDialogue(scene);
}

/** 4ループ目AM11:30の3-A現地行動まで進める。 */
function completeThirdLoopToFourthLoopHauntedHouse(scene) {
  completeThirdLoopPatrol(scene);
  moveNear(scene, SCHOOL_POSITIONS.CAFE);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  moveNear(scene, SCHOOL_POSITIONS.TOURNAMENT_NOTICE);
  moveNear(scene, SCHOOL_POSITIONS.RYUGU_SHRINE);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
  advanceCurrentDialogue(scene);
}

/** 障害物を避けて出し物担当生徒の場所へ移動する。 */
function moveToClassmateAttraction(scene, attraction) {
  const snapshot = scene.createSnapshot();
  if (snapshot.thirdLoop.currentAttractionAreaId !== attraction.areaId) {
    selectChoice(scene, `go-attraction-area-${attraction.areaId}`);
  }
}

/** クラスメイト出し物巡りを完了する。 */
/** Wait until the classmate attraction can be selected in the current area. */
function waitUntilClassmateAttractionOpen(scene, attraction) {
  for (let index = 0; index < 40; index += 1) {
    const snapshot = scene.createSnapshot();
    if (snapshot.choices.some((choice) => choice.id === `visit-${attraction.id}`)) {
      return;
    }
    selectChoice(scene, 'wait-attraction-time');
  }
}

function completeClassmateAttractionTour(scene) {
  for (const attraction of [...scene.createSnapshot().thirdLoop.attractions]) {
    moveToClassmateAttraction(scene, attraction);
    waitUntilClassmateAttractionOpen(scene, attraction);
    selectChoice(scene, `visit-${attraction.id}`);
    advanceStory(scene);
  }
}

/** 原作導入プロトタイプの現在実装範囲を最後まで進める。 */
function completeChaoSearchToEnd(scene) {
  completeChaoSearchToThirdLoopPatrol(scene);
  completeThirdLoopToClassmateAttractionTour(scene);
  completeClassmateAttractionTour(scene);
}

/** Skip the tutorial sequence. */
function skipTutorial(scene) {
  sendInput(scene, { type: CANONICAL_INPUT_TYPES.TUTORIAL_SKIP });
}

describe('CFP-UT-S01 初期状態と文章進行', () => {
  test('CFP-UT-S01-C01 シーンを生成するとprologue、MP100、携帯電話時刻なしで開始する', () => {
    // Arrange
    const scene = new CanonicalFestivalPrototypeScene();

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.PROLOGUE);
    assert.equal(snapshot.player.magicPower.current, 300);
    assert.equal(snapshot.phoneTime, null);
  });

  test('CFP-UT-S01-C02 プロローグの文章を進めるとopeningへ移る', () => {
    // Arrange
    const scene = new CanonicalFestivalPrototypeScene();

    // Act
    advanceCurrentDialogue(scene);

    // Assert
    assert.equal(scene.createSnapshot().phase.id, CANONICAL_PHASE_IDS.OPENING);
  });

  test('CFP-UT-S01-C03 許可されていない段階の移動入力は進行状態を変更しない', () => {
    // Arrange
    const scene = new CanonicalFestivalPrototypeScene();
    const before = scene.createSnapshot();

    // Act
    moveForSeconds(scene, 1, 0, 1);
    const after = scene.createSnapshot();

    // Assert
    assert.equal(after.phase.id, before.phase.id);
    assert.deepEqual(after.player.position, before.player.position);
  });
});

describe('CFP-UT-S15 tutorial skip', () => {
  test('CFP-UT-S15-C01 skips from prologue to post-tutorial free exploration', () => {
    // Arrange
    const scene = new CanonicalFestivalPrototypeScene({ random: () => 0 });

    // Act
    skipTutorial(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.phase.inputKind, 'choice');
    assert.equal(snapshot.gameTime.label, 'AM10:10');
    assert.equal(snapshot.gameTime.loopCount, 2);
    assert.equal(snapshot.phoneTime, '20:06');
    assert.equal(snapshot.player.magicPower.current, 179);
    assert.equal(snapshot.freeExplore.currentLocation.id, 'entrance-gate');
    assert.equal(snapshot.mainEvent.activeEventId, CANONICAL_MAIN_EVENT_IDS.CHAO_SEARCH);
    assert.equal(snapshot.chaoSearch.isSetsunaWaiting, true);
    assert.equal(snapshot.tutorial.canSkip, false);
    assert.equal(snapshot.tutorial.isSkipped, true);
    assert.equal(Object.hasOwn(snapshot.chaoSearch, 'targetLocationId'), false);
    assert.ok(snapshot.log.some((entry) => entry.includes('チュートリアルをスキップ')));
  });

  test('CFP-UT-S15-C02 skips from Eva escape to the same post-tutorial state', () => {
    // Arrange
    const scene = createSceneAtFollowNodoka();
    completeFollowToHide(scene);
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);

    // Act
    skipTutorial(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.gameTime.label, 'AM10:10');
    assert.equal(snapshot.player.magicPower.current, 179);
    assert.equal(snapshot.freeExplore.currentLocation.id, 'entrance-gate');
    assert.equal(snapshot.mainEvent.activeEventId, CANONICAL_MAIN_EVENT_IDS.CHAO_SEARCH);
  });

  test('CFP-UT-S15-C03 ignores skip after tutorial completion', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    const before = scene.createSnapshot();

    // Act
    skipTutorial(scene);
    const after = scene.createSnapshot();

    // Assert
    assert.equal(after.phase.id, before.phase.id);
    assert.equal(after.gameTime.label, before.gameTime.label);
    assert.equal(after.tutorial.canSkip, false);
    assert.equal(after.tutorial.isSkipped, false);
    assert.equal(after.chaoSearch.visitedLocationIds.length, before.chaoSearch.visitedLocationIds.length);
  });
});

describe('CFP-UT-S02 固定時刻', () => {
  test('CFP-UT-S02-C01 操作中にフレーム更新してもゲーム内時刻が変化しない', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    const beforeTime = scene.createSnapshot().gameTime.label;

    // Act
    moveForSeconds(scene, 0, 1, 0.5);
    const afterTime = scene.createSnapshot().gameTime.label;

    // Assert
    assert.equal(afterTime, beforeTime);
  });

  test('CFP-UT-S02-C03 お化け屋敷を完了するとAM11:00になる', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);

    // Act
    completeHauntedHouse(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.MOVE_TO_HEALTH_ROOM);
    assert.equal(snapshot.gameTime.label, 'AM11:00');
  });

  test('CFP-UT-S02-C06 カシオペア起動を完了すると2ループ目AM09:55になる', () => {
    // Arrange
    const scene = createSceneAfterRewind();

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.gameTime.loopCount, 2);
    assert.equal(snapshot.gameTime.label, 'AM09:55');
    assert.equal(snapshot.phoneTime, '20:06');
    assert.equal(snapshot.player.magicPower.current, 179);
  });

  test('CFP-UT-S02-C07 同一ループ内の固定時刻前進でMPが回復する', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert: 初回巻き戻し後の70MPに、AM09:55からAM10:10の6MPが加算される。
    assert.equal(snapshot.gameTime.label, 'AM10:10');
    assert.equal(snapshot.player.magicPower.current, 185);
  });
});

describe('CFP-UT-S03 目的地移動', () => {
  test('CFP-UT-S03-C01 移動入力を1秒更新すると入力方向へ4マス移動する', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    const before = scene.createSnapshot().player.position;

    // Act
    moveForSeconds(scene, 0, 1, 1);
    const after = scene.createSnapshot().player.position;

    // Assert
    assert.deepEqual(after, before);
  });

  test('CFP-UT-S03-C02 斜め入力は移動ベクトルを正規化する', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    const before = scene.createSnapshot().player.position;

    // Act
    moveForSeconds(scene, 1, 1, 1);
    const after = scene.createSnapshot().player.position;
    const distance = Math.hypot(after.x - before.x, after.y - before.y);

    // Assert
    assert.equal(distance, 0);
  });
});

describe('CFP-UT-S04 お化け屋敷', () => {
  test('CFP-UT-S04-C01 ホラーハウス開始時は入口に配置される', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);

    // Act
    selectChoice(scene, 'normal');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.deepEqual(snapshot.player.position, HAUNTED_ROUTE_POINTS.ENTRANCE);
  });

  test('CFP-UT-S04-C02 入口から出口へ直進しても出口へ到達しない', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);
    selectChoice(scene, 'normal');

    // Act
    moveForSeconds(scene, 1, 0, 3);
    const snapshot = scene.createSnapshot();
    const distanceToExit = Math.hypot(
      HAUNTED_ROUTE_POINTS.EXIT.x - snapshot.player.position.x,
      HAUNTED_ROUTE_POINTS.EXIT.y - snapshot.player.position.y,
    );

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.HAUNTED_HOUSE);
    assert.ok(distanceToExit > 3);
  });

  test('CFP-UT-S04-C03 入口と出口は別座標になる', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);
    selectChoice(scene, 'normal');

    // Act
    const snapshot = scene.createSnapshot();
    const distance = Math.hypot(
      snapshot.objective.position.x - snapshot.player.position.x,
      snapshot.objective.position.y - snapshot.player.position.y,
    );

    // Assert
    assert.equal(snapshot.objective.title, '肖像画が動くの地点へ進む');
    assert.ok(distance > 2);
  });

  test('CFP-UT-S04-C04 3件の演出後に出口へ到達すると学園マップへ戻る', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);

    // Act
    completeHauntedHouse(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.map.id, 'school');
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.MOVE_TO_HEALTH_ROOM);
  });

  test('CFP-UT-S04-C05 ホラーハウス受付は難しいを推奨する', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);

    // Act
    const snapshot = scene.createSnapshot();
    const recommended = snapshot.choices.find((choice) => choice.isRecommended);

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.SELECT_HAUNTED_DIFFICULTY);
    assert.equal(recommended.id, 'hard');
  });

  test('CFP-UT-S04-C07 驚かし演出でパニックメーターが難易度に応じて上昇する', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);
    selectChoice(scene, 'normal');
    moveNear(scene, HAUNTED_ROUTE_POINTS.PORTRAIT);

    // Act
    advanceStory(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.hauntedHouse.difficulty.id, 'normal');
    assert.equal(snapshot.hauntedHouse.panic.current, 25);
  });

  test('CFP-UT-S04-C10 パニック最大で未クリアを記録してAM11:00へ合流する', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);
    selectChoice(scene, 'hard');

    // Act
    moveNear(scene, HAUNTED_ROUTE_POINTS.PORTRAIT);
    advanceStory(scene);
    moveNear(scene, HAUNTED_ROUTE_POINTS.LEFT_TOP_CORNER);
    moveNear(scene, HAUNTED_ROUTE_POINTS.VOICE);
    advanceStory(scene);
    moveNear(scene, HAUNTED_ROUTE_POINTS.CENTER_BOTTOM_CORNER);
    moveNear(scene, HAUNTED_ROUTE_POINTS.GHOST);
    advanceStory(scene);
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.MOVE_TO_HEALTH_ROOM);
    assert.equal(snapshot.gameTime.label, 'AM11:00');
    assert.equal(snapshot.hauntedHouse.result, 'uncleared');
    assert.deepEqual(snapshot.hauntedHouse.rechallengeIds, ['hard']);
  });

  test('CFP-UT-S04-C12 停止中はパニックメーターが減少する', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);
    selectChoice(scene, 'normal');
    moveNear(scene, HAUNTED_ROUTE_POINTS.PORTRAIT);
    advanceStory(scene);

    // Act
    selectChoice(scene, 'calm-down');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.hauntedHouse.panic.current, 25 - HAUNTED_PANIC_RECOVERY_PER_SECOND * 2);
    assert.equal(snapshot.hauntedHouse.panic.recoveryPerSecond, HAUNTED_PANIC_RECOVERY_PER_SECOND);
  });

  test('CFP-UT-S04-C13 移動中はパニックメーターが減少しない', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);
    selectChoice(scene, 'normal');
    moveNear(scene, HAUNTED_ROUTE_POINTS.PORTRAIT);
    advanceStory(scene);

    // Act
    moveForSeconds(scene, 0, 1, 1);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.hauntedHouse.panic.current, 25);
  });

  test('CFP-UT-S04-C14 驚かし演出中はパニックメーターが減少しない', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);
    selectChoice(scene, 'normal');
    moveNear(scene, HAUNTED_ROUTE_POINTS.PORTRAIT);
    advanceStory(scene);
    moveNear(scene, HAUNTED_ROUTE_POINTS.LEFT_TOP_CORNER);
    moveNear(scene, HAUNTED_ROUTE_POINTS.VOICE);

    // Act
    advanceSeconds(scene, 2);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.dialogue?.speaker, 'お化け屋敷');
    assert.equal(snapshot.hauntedHouse.panic.current, 25);
  });
});

describe('CFP-UT-S05 同行者とカシオペア', () => {
  test('CFP-UT-S05-C02 保健室へ向かう段階を開始すると刹那が同行者へ加わる', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();
    moveForSeconds(scene, 0, 1, 0.8);
    moveNear(scene, SCHOOL_POSITIONS.CLASS_3A);

    // Act
    completeHauntedHouse(scene);
    const names = scene.createSnapshot().companions.map((companion) => companion.name);

    // Assert
    assert.deepEqual(names, ['カモ', '刹那']);
  });

  test('CFP-UT-S05-C07 カモは同行者だがマップ表示対象ではない', () => {
    // Arrange
    const scene = createSceneAtMoveTo3A();

    // Act
    const kamo = scene.createSnapshot().companions.find((companion) => companion.id === 'kamo');

    // Assert
    assert.equal(kamo.isActive, true);
    assert.equal(kamo.displayOnMap, false);
  });

  test('CFP-UT-S05-C08 刹那はネギの移動履歴上の後続座標へ追従する', () => {
    // Arrange
    const scene = createSceneAfterRewind();
    const before = scene.createSnapshot().companions.find((companion) => companion.id === 'setsuna').position;

    // Act
    moveForSeconds(scene, 1, 0, 1);
    const snapshot = scene.createSnapshot();
    const after = snapshot.companions.find((companion) => companion.id === 'setsuna').position;

    // Assert
    assert.deepEqual(after, before);
    assert.deepEqual(snapshot.player.position, scene.createSnapshot().player.position);
  });

  test('CFP-UT-S05-C05 起動後に祭り時刻AM09:55と携帯電話20:06を同時に返す', () => {
    // Arrange
    const scene = createSceneAtCafe();

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.gameTime.label, 'AM10:00');
    assert.equal(snapshot.phoneTime, '20:06');
    assert.equal(snapshot.player.magicPower.current, 181);
  });

  test('CFP-UT-S05-C06 カシオペア起動後もネギの位置を起動した場所に保つ', () => {
    // Arrange
    const scene = createSceneAtRewindDialogue();
    const before = scene.createSnapshot().player.position;

    // Act
    advanceCurrentDialogue(scene);
    const after = scene.createSnapshot();

    // Assert
    assert.deepEqual(after.player.position, before);
    assert.notDeepEqual(after.player.position, SCHOOL_POSITIONS.REWIND_START);
  });
});

describe('CFP-UT-S06 のどかの尾行', () => {
  test('CFP-UT-S06-C03 距離3マス未満を1秒維持すると尾行開始位置から再試行する', () => {
    // Arrange
    const scene = createSceneAtFollowNodoka();

    // Act
    selectChoice(scene, 'too-close-nodoka');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.FOLLOW_NODOKA);
    assert.deepEqual(snapshot.player.position, SCHOOL_POSITIONS.FOLLOW_START);
  });

  test('CFP-UT-S06-C04 距離8マスより大きい状態を2秒未満維持すると尾行を継続する', () => {
    // Arrange
    const scene = createSceneAtFollowNodoka();

    // Act
    moveForSeconds(scene, 1, 0, 1);
    advanceSeconds(scene, 1);

    // Assert
    assert.equal(scene.createSnapshot().phase.id, CANONICAL_PHASE_IDS.FOLLOW_NODOKA);
  });
});

describe('CFP-UT-S07 のどかから隠れる', () => {
  test('CFP-UT-S07-C01 のどかは尾行パートの最終位置で振り返る', () => {
    // Arrange
    const scene = createSceneAtFollowNodoka();

    // Act
    completeFollowToHide(scene);
    const snapshot = scene.createSnapshot();
    const nodoka = snapshot.actors.find((actor) => actor.id === 'nodoka');

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA);
    assert.deepEqual(nodoka.position, { x: 8, y: 24 });
  });

  test('CFP-UT-S07-C02 隠れる段階はカットシーンとしてstory入力を待つ', () => {
    // Arrange
    const scene = createSceneAtFollowNodoka();
    completeFollowToHide(scene);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA);
    assert.equal(snapshot.phase.inputKind, 'story');
    assert.equal(snapshot.visibility, null);
  });

  test('CFP-UT-S07-C03 隠れるカットシーンを進めるとタイムスリップ確信場面へ進む', () => {
    // Arrange
    const scene = createSceneAtFollowNodoka();
    completeFollowToHide(scene);

    // Act
    advanceCurrentDialogue(scene);

    // Assert
    assert.equal(scene.createSnapshot().phase.id, CANONICAL_PHASE_IDS.TIME_TRAVEL_CONFIRMED);
  });
});

describe('CFP-UT-S08 エヴァからの逃走', () => {
  test('CFP-UT-S08-C01 逃走開始から2秒未満はエヴァを移動させない', () => {
    // Arrange
    const scene = createSceneAtFollowNodoka();
    completeFollowToHide(scene);
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);
    const before = scene.createSnapshot().actors.find((actor) => actor.id === 'eva').position;

    // Act
    advanceSeconds(scene, 1);
    const after = scene.createSnapshot().actors.find((actor) => actor.id === 'eva').position;

    // Assert
    assert.deepEqual(after, before);
  });

  test('CFP-UT-S08-C04 逃走地点へ到達するとチャオ探索へ進む', () => {
    // Arrange
    const scene = createSceneAtFollowNodoka();
    completeFollowToHide(scene);
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);

    // Act
    completeEvaEscape(scene);

    // Assert
    assert.equal(scene.createSnapshot().phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
  });

  test('CFP-UT-S08-C03 エヴァに捕まってもチャオ探索へ進む', () => {
    // Arrange
    const scene = createSceneAtFollowNodoka();
    completeFollowToHide(scene);
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);

    // Act
    moveNear(scene, SCHOOL_POSITIONS.EVA_START);
    advanceSeconds(scene, 3);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.ok(snapshot.log.some((entry) => entry.includes('エヴァに捕まり')));
  });
});

describe('CFP-UT-S09 Snapshotと再開', () => {
  test.skip('CFP-UT-S09-C03 completeで再開入力を行うとconstructor直後と同じ状態へ戻る', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    completeChaoSearchToEnd(scene);

    // Act
    sendInput(scene, { type: CANONICAL_INPUT_TYPES.ROUTE_RESTART });
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.PROLOGUE);
    assert.equal(snapshot.player.magicPower.current, 100);
    assert.equal(snapshot.phoneTime, null);
  });
});

describe('CFP-UT-S10 会話anchor', () => {
  test('CFP-UT-S10-C01 カモのセリフはネギの近くに表示する', () => {
    // Arrange
    const scene = createSceneAtRewindDialogue();

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.dialogue.speaker, 'カモ');
    assert.deepEqual(snapshot.dialogue.anchor, { type: 'player', id: null });
  });

  test('CFP-UT-S10-C02 のどかのセリフはのどかの近くに表示する', () => {
    // Arrange
    const scene = createSceneAtCafe();

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.dialogue.speaker, 'のどか');
    assert.deepEqual(snapshot.dialogue.anchor, { type: 'actor', id: 'nodoka' });
  });

  test('CFP-UT-S10-C03 エヴァのセリフはエヴァの近くに表示する', () => {
    // Arrange
    const scene = createSceneAtFollowNodoka();
    completeFollowToHide(scene);
    advanceCurrentDialogue(scene);
    advanceStory(scene);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.dialogue.speaker, 'エヴァ');
    assert.deepEqual(snapshot.dialogue.anchor, { type: 'actor', id: 'eva' });
  });

  test('CFP-UT-S10-C04 プロローグのネギのセリフはネギの近くに表示する', () => {
    // Arrange
    const scene = new CanonicalFestivalPrototypeScene();

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.dialogue.speaker, 'ネギ');
    assert.deepEqual(snapshot.dialogue.anchor, { type: 'player', id: null });
  });
});

describe('CFP-UT-S11 チャオ探索以降', () => {
  test('CFP-UT-S11-C01 チャオ探索開始時に出現候補を公開し正解場所は公開しない', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.phase.inputKind, 'choice');
    assert.deepEqual(snapshot.choices, []);
    assert.equal(snapshot.map.name, '入場門');
    assert.equal(snapshot.freeExplore.currentLocation.id, 'entrance-gate');
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'watch-parade' && action.kind === 'generic'));
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'move-to-ground' && action.kind === 'destination'));
    assert.ok(snapshot.chaoSearch.locations.length >= 5);
    assert.equal(Object.hasOwn(snapshot.chaoSearch, 'targetLocationId'), false);
  });

  test('CFP-UT-S11-C27 クラスメイトの居場所と現在状態を返す', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    const snapshot = scene.createSnapshot();
    const nodoka = snapshot.classmateStatus.find((entry) => entry.id === 'nodoka');
    const yue = snapshot.classmateStatus.find((entry) => entry.id === 'yuue');
    const kotaro = snapshot.classmateStatus.find((entry) => entry.id === 'kotaro');

    // Assert
    assert.ok(snapshot.classmateStatus.length >= 10);
    assert.ok(kotaro);
    assert.deepEqual(kotaro.affection, { current: 0, max: 100 });
    assert.deepEqual(
      {
        areaId: nodoka.areaId,
        areaName: nodoka.areaName,
        statusLabel: nodoka.statusLabel,
        affection: nodoka.affection,
      },
      {
        areaId: 'entrance-gate',
        areaName: '入場門',
        statusLabel: '自由行動',
        affection: { current: 0, max: 100 },
      },
    );
    assert.deepEqual(
      { areaId: yue.areaId, areaName: yue.areaName, statusLabel: yue.statusLabel },
      { areaId: 'entrance-gate', areaName: '入場門', statusLabel: '聞き込み可能' },
    );
  });

  test('CFP-UT-S11-C02 チャオ探索開始時に刹那は同行から外れて解散場所に残る', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.companions.some((companion) => companion.id === 'setsuna'), false);
    assert.equal(snapshot.chaoSearch.isSetsunaWaiting, true);
  });

  test('CFP-UT-S11-C22 チャオ探索中の対象クラスメイトにチャオの質問肢を表示する', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    const before = scene.createSnapshot();

    // Act
    selectLocationAction(scene, 'talk-classmate-asuna');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(before.gameTime.label, 'AM10:10');
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION);
    assert.ok(snapshot.choices.some((choice) => choice.id === 'ask-chao-asuna'));
    assert.ok(snapshot.choices.some((choice) => choice.id === 'talk-classmate-asuna'));
  });

  test('CFP-UT-S11-C23 チャオの質問で曖昧な手がかりを取得し同じ相手へ再質問できる', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    selectLocationAction(scene, 'talk-classmate-asuna');
    const before = scene.createSnapshot();

    // Act
    selectChoice(scene, 'ask-chao-asuna');
    const result = scene.createSnapshot();
    advanceStory(scene);
    selectLocationAction(scene, 'talk-classmate-asuna');
    const repeatConversation = scene.createSnapshot();
    selectChoice(scene, 'ask-chao-asuna');
    const repeatedResult = scene.createSnapshot();

    // Assert
    assert.equal(result.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    assert.match(result.freeExplore.actionResult.text, /射的|乗り物|空|展示|屋台/);
    assert.equal(result.gameTime.minute, before.gameTime.minute + 5);
    assert.equal(repeatConversation.phase.id, CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION);
    assert.ok(repeatConversation.choices.some((choice) => choice.id === 'ask-chao-asuna'));
    assert.equal(repeatedResult.freeExplore.actionResult.text, result.freeExplore.actionResult.text);
    assert.equal(repeatedResult.chaoSearch.hints.length, 1);
  });

  test('CFP-UT-S11-C25 全クラスメイトにチャオの質問肢を表示する', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    selectLocationAction(scene, 'talk-classmate-ku-fei');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION);
    assert.ok(snapshot.choices.some((choice) => choice.id === 'ask-chao-ku-fei'));
  });

  test('CFP-UT-S11-C26 のどかとの通常会話で好感度が10増える', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    selectLocationAction(scene, 'talk-classmate-nodoka');
    const conversation = scene.createSnapshot();
    selectChoice(scene, 'talk-classmate-nodoka');
    const result = scene.createSnapshot();

    // Assert
    assert.equal(conversation.phase.id, CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION);
    assert.equal(result.affection.nodoka.current, 10);
    assert.equal(result.affection.nodoka.max, 100);
    assert.equal(result.affection.nodoka.kissThreshold, 60);
    assert.deepEqual(
      result.classmateStatus.find((entry) => entry.id === 'nodoka').affection,
      { current: 10, max: 100 },
    );
  });

  test('CFP-UT-S11-C27 のどか以外のクラスメイトとの通常会話で好感度が10増える', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    selectLocationAction(scene, 'talk-classmate-ku-fei');
    selectChoice(scene, 'talk-classmate-ku-fei');
    const result = scene.createSnapshot();

    // Assert
    assert.equal(result.affection['ku-fei'].current, 10);
    assert.deepEqual(
      result.classmateStatus.find((entry) => entry.id === 'ku-fei').affection,
      { current: 10, max: 100 },
    );
  });

  test('CFP-UT-S11-C28 チャオ聞き込みでも対象クラスメイトの好感度が10増える', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    selectLocationAction(scene, 'talk-classmate-ku-fei');
    selectChoice(scene, 'ask-chao-ku-fei');
    const result = scene.createSnapshot();

    // Assert
    assert.equal(result.affection['ku-fei'].current, 10);
  });

  test('CFP-UT-S11-C29 クラスメイトの好感度は100を上限にする', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    for (let index = 0; index < 11; index += 1) {
      selectLocationAction(scene, 'talk-classmate-ku-fei');
      selectChoice(scene, 'talk-classmate-ku-fei');
      advanceStory(scene);
    }
    const result = scene.createSnapshot();

    // Assert
    assert.equal(result.affection['ku-fei'].current, 100);
  });

  test('CFP-UT-S11-C24 チャオ探索以外をメインにするとチャオの質問肢を表示しない', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    clearMainEvent(scene);

    // Act
    selectLocationAction(scene, 'talk-classmate-asuna');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION);
    assert.equal(snapshot.choices.some((choice) => choice.id === 'ask-chao-asuna'), false);
    assert.ok(snapshot.choices.some((choice) => choice.id === 'talk-classmate-asuna'));
  });

  test('CFP-UT-S11-C19 schedule outside attraction time only allows classmate talk', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    const snapshot = scene.createSnapshot();
    selectLocationAction(scene, 'visit-classmate-attraction-ku-fei');
    const afterInvalidVisit = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.freeExplore.locationActions.some((action) => action.id === 'visit-classmate-attraction-ku-fei'), false);
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'talk-classmate-ku-fei'));
    assert.equal(snapshot.actors.some((actor) => actor.id === 'chao'), false);
    assert.equal(afterInvalidVisit.thirdLoop.completedAttractionActorIds.includes('ku-fei'), false);
    assert.equal(afterInvalidVisit.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
  });

  test('CFP-UT-S11-C20 off-schedule classmates can randomly move during travel start', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    const before = scene.createSnapshot().schedule.negi.entries.find((entry) => entry.id === 'ku-fei');

    // Act
    selectLocationAction(scene, 'move-to-ground');
    const snapshot = scene.createSnapshot();
    const after = snapshot.schedule.negi.entries.find((entry) => entry.id === 'ku-fei');

    // Assert
    assert.equal(before.currentAreaId, 'entrance-gate');
    assert.equal(after.currentAreaId, 'school-building');
    assert.equal(snapshot.actors.some((actor) => actor.id === 'chao'), false);
  });

  test('CFP-UT-S11-C03 場所を選択すると移動中を経て現地行動へ進む', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    selectDestination(scene, 'ground');
    const travel = scene.createSnapshot();
    advanceFreeExploreTravel(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(travel.phase.id, CANONICAL_PHASE_IDS.TRAVEL);
    assert.equal(travel.gameTime.label, 'AM10:10');
    assert.equal(travel.freeExplore.travel.destinationId, 'ground');
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.freeExplore.currentLocation.id, 'ground');
    assert.equal(snapshot.gameTime.label, 'AM10:15');
  });

  test('CFP-UT-S11-C04 移動中の巻き込みへ対応できる', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0.99);

    // Act
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);
    const interruption = scene.createSnapshot();
    selectInterruption(scene, 'engage');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(interruption.phase.id, CANONICAL_PHASE_IDS.INTERRUPTION);
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    assert.ok(snapshot.freeExplore.actionResult);
    assert.equal(snapshot.gameTime.label, 'AM10:15');
  });

  test('CFP-UT-S11-C40 Chao clue interruption hides legacy destinations', () => {
    // Arrange
    let forceInterruption = false;
    const scene = createSceneAtChaoSearch(() => (forceInterruption ? 0.99 : 0));
    selectDestination(scene, 'school-building');
    advanceFreeExploreTravel(scene);

    // Act
    forceInterruption = true;
    selectLocationAction(scene, 'investigate-school-exhibit');
    const interruption = scene.createSnapshot();
    selectInterruption(scene, 'ignore');
    const afterInterruption = scene.createSnapshot();

    // Assert
    assert.equal(interruption.phase.id, CANONICAL_PHASE_IDS.INTERRUPTION);
    assert.deepEqual(interruption.freeExplore.destinations, []);
    assert.deepEqual(interruption.freeExplore.locationActions, []);
    assert.ok(interruption.freeExplore.interruption.choices.some((choice) => choice.id === 'engage'));
    assert.equal(afterInterruption.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(afterInterruption.freeExplore.currentLocation.id, 'school-building');
    assert.ok(afterInterruption.freeExplore.locationActions.some((action) => action.id === 'investigate-school-exhibit'));
  });

  test('CFP-UT-S11-C16 入場門では正午までパレードを見られる', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    selectDestination(scene, 'entrance-gate');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'watch-parade'));
  });

  test('CFP-UT-S11-C17 正午以降の入場門ではパレードを表示しない', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 12, 0);

    // Act
    selectDestination(scene, 'entrance-gate');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.freeExplore.locationActions.some((action) => action.id === 'watch-parade'), false);
  });

  test('CFP-UT-S11-C18 現地行動の結果後は現在地の現地行動へ戻る', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    selectLocationAction(scene, 'watch-parade');
    const result = scene.createSnapshot();
    advanceStory(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(result.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.freeExplore.currentLocation.id, 'entrance-gate');
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'watch-parade'));
  });

  test('CFP-UT-S11-C13 エリア到着後に現在エリアのクラスメイト出し物を表示する', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 12, 10);

    // Act
    selectDestination(scene, 'school-building');
    advanceFreeExploreTravel(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'visit-classmate-attraction-yue'));
    assert.equal(snapshot.freeExplore.locationActions.some((action) => action.id === 'visit-classmate-attraction-konoka-attraction'), false);
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'visit-haunted-house'));
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'help-haunted-house'));
    assert.equal(snapshot.freeExplore.locationActions.some((action) => action.id === 'visit-classmate-attraction-asuna'), false);
  });

  test('CFP-UT-S11-C14 チャオ探索中に見た出し物を訪問済みにする', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 11, 50);
    selectDestination(scene, 'club-building');
    advanceFreeExploreTravel(scene);

    // Act
    selectLocationAction(scene, 'visit-classmate-attraction-asuna');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    assert.equal(snapshot.thirdLoop.completedAttractionActorIds.includes('asuna'), true);
    assert.equal(snapshot.schedule.negi.entries.find((entry) => entry.id === 'asuna').isCompleted, true);
  });

test('CFP-UT-S11-C28 ホラーハウス営業とネギの手伝いを別スケジュールで返す', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    const snapshot = scene.createSnapshot();
    const help = snapshot.schedule.negi.entries.find((entry) => entry.id === 'haunted-house-help');
    const hauntedHouse = snapshot.schedule.festival.entries.find((entry) => entry.id === 'haunted-house');

    // Assert
    assert.equal(snapshot.schedule.classmate, undefined);
    assert.deepEqual(
      {
        startTimeLabel: help.startTimeLabel,
        endTimeLabel: help.endTimeLabel,
        areaId: help.areaId,
        isAllDay: help.isAllDay,
      },
      {
        startTimeLabel: 'AM11:30',
        endTimeLabel: 'PM12:00',
        areaId: 'school-building',
        isAllDay: false,
      },
    );
    assert.deepEqual(
      {
        startTimeLabel: hauntedHouse.startTimeLabel,
        endTimeLabel: hauntedHouse.endTimeLabel,
        areaId: hauntedHouse.areaId,
        isAllDay: hauntedHouse.isAllDay,
      },
      {
        startTimeLabel: 'AM10:00',
        endTimeLabel: 'PM4:00',
        areaId: 'school-building',
        isAllDay: true,
      },
    );
  });

  test.skip('CFP-UT-S11-C15 チャオ探索中の出し物訪問済みを後続巡りへ引き継ぐ（旧仕様）', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 12, 0);
    selectDestination(scene, 'ground');
    advanceFreeExploreTravel(scene);
    selectLocationAction(scene, 'visit-classmate-attraction-ku-fei');
    advanceStory(scene);
    selectDestination(scene, 'school-building');
    advanceFreeExploreTravel(scene);
    selectLocationAction(scene, 'look-around');
    advanceStory(scene);

    // Act
    completeChaoSearchToThirdLoopPatrol(scene);
    completeThirdLoopToClassmateAttractionTour(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR);
    assert.equal(snapshot.thirdLoop.completedAttractionActorIds.includes('ku-fei'), true);
    assert.equal(snapshot.choices.some((choice) => choice.id === 'visit-ku-fei'), false);
  });

  test('CFP-UT-S11-C05 不正解候補を調べると訪問済みになり探索を継続する', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    visitChaoLocation(scene, 'roller-coaster');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.CHAO_ATTRACTION);
    assert.equal(snapshot.chaoSearch.currentAttractionId, 'roller-coaster');
    assert.deepEqual(snapshot.chaoSearch.visitedLocationIds, ['roller-coaster']);
  });

  test('CFP-UT-S11-C06 正解候補を調べるとチャオ遭遇へ進む', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    visitChaoLocation(scene, 'gun-shooting');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.MEET_CHAO);
    assert.equal(snapshot.chaoSearch.isChaoFound, true);
    assert.deepEqual(snapshot.chaoSearch.visitedLocationIds, ['gun-shooting']);
  });

  test('CFP-UT-S11-C21 チャオ発見後は手がかり調査行動を表示しない', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    selectDestination(scene, 'ground');
    advanceFreeExploreTravel(scene);
    const before = scene.createSnapshot();

    // Act
    selectLocationAction(scene, 'investigate-gun-shooting');
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.ok(before.freeExplore.locationActions.some((action) => action.kind === 'chao-location'));
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.chaoSearch.isChaoFound, true);
    assert.equal(snapshot.freeExplore.locationActions.some((action) => action.kind === 'chao-location'), false);
    assert.equal(snapshot.chaoSearch.locations.find((location) => location.id === 'gun-shooting').isFound, true);
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.kind === 'destination'));
  });

  test('CFP-UT-S11-C07 正解が飛行船の場合は全体地図後にチャオ遭遇へ進む', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0.45);

    // Act
    visitChaoLocation(scene, 'airship');
    const overview = scene.createSnapshot();
    advanceCurrentDialogue(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(overview.phase.id, CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW);
    assert.equal(overview.chaoSearch.airshipOverview.title, '飛行船から見た麻帆良祭');
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.MEET_CHAO);
  });

  test('CFP-UT-S11-C08 正解が飛行船以外なら飛行船全体地図後に探索へ戻る', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    visitChaoLocation(scene, 'airship');
    advanceCurrentDialogue(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.deepEqual(snapshot.chaoSearch.visitedLocationIds, ['airship']);
  });

  test.skip('CFP-UT-S11-C12 世界樹事件後に1日目3ループ目PM1:30の見回りへ進む（旧仕様）', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    completeChaoSearchToThirdLoopPatrol(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.THIRD_LOOP_PATROL);
    assert.equal(snapshot.gameTime.loopCount, 3);
    assert.equal(snapshot.gameTime.label, 'PM1:30');
    assert.equal(snapshot.routeComplete, false);
  });
});

test('CFP-UT-S11-C29 PM3:00以降のネギの予定を返す', () => {
  // Arrange
  const scene = createSceneAtChaoSearch(() => 0);

  // Act
  const entries = scene.createSnapshot().schedule.negi.entries;

  // Assert
  assert.deepEqual(
    entries
      .filter((entry) => [
        'world-tree-patrol-afternoon',
        'nodoka-date',
        'mahora-budokai-qualifier',
        'world-tree-patrol-evening',
      ].includes(entry.id))
      .map((entry) => ({
        id: entry.id,
        startTimeLabel: entry.startTimeLabel,
        endTimeLabel: entry.endTimeLabel,
        areaId: entry.areaId,
      })),
    [
      { id: 'world-tree-patrol-afternoon', startTimeLabel: 'PM3:00', endTimeLabel: 'PM4:00', areaId: 'world-tree' },
      { id: 'nodoka-date', startTimeLabel: 'PM4:00', endTimeLabel: 'PM5:30', areaId: 'dining-street' },
      { id: 'mahora-budokai-qualifier', startTimeLabel: 'PM5:30', endTimeLabel: 'PM7:00', areaId: 'ground' },
      { id: 'world-tree-patrol-evening', startTimeLabel: 'PM7:00', endTimeLabel: 'PM9:00', areaId: 'world-tree' },
    ],
  );
});

test('CFP-UT-S11-C30 チャオ発見後ののどかデート予定はPM8:00までになる', () => {
  // Arrange
  const scene = createSceneAtPrepareDate(() => 0);

  // Act
  const entry = scene.createSnapshot().schedule.negi.entries
    .find((scheduleEntry) => scheduleEntry.id === 'nodoka-date');

  // Assert
  assert.equal(entry.startTimeLabel, 'PM4:00');
  assert.equal(entry.endTimeLabel, 'PM8:00');
  assert.equal(entry.endMinute, 1200);
});

test('CFP-UT-S11-C31 AM10:00からAM11:30のチラシ配りを全エリア行動として返す', () => {
  // Arrange
  const scene = createSceneAtChaoSearch(() => 0);

  // Act
  const snapshot = scene.createSnapshot();
  const flyer = snapshot.schedule.negi.entries.find((entry) => entry.id === 'haunted-house-flyer');

  // Assert
  assert.deepEqual(
    {
      startTimeLabel: flyer.startTimeLabel,
      endTimeLabel: flyer.endTimeLabel,
      areaId: flyer.areaId,
      currentAreaId: flyer.currentAreaId,
      isAvailableInCurrentArea: flyer.isAvailableInCurrentArea,
      isCompleted: flyer.isCompleted,
    },
    {
      startTimeLabel: 'AM10:00',
      endTimeLabel: 'AM11:30',
      areaId: null,
      currentAreaId: null,
      isAvailableInCurrentArea: true,
      isCompleted: false,
    },
  );
  assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'hand-out-haunted-house-flyers'));
});

test('CFP-UT-S11-C31 チラシ配りで5分進みホラーハウスが盛り上がる', () => {
  // Arrange
  const scene = createSceneAtChaoSearch(() => 0);

  // Act
  selectLocationAction(scene, 'hand-out-haunted-house-flyers');
  const result = scene.createSnapshot();

  // Assert
  assert.equal(result.gameTime.label, 'AM10:15');
  assert.equal(result.player.magicPower.current, 187);
  assert.deepEqual(result.hauntedHouse.excitement, { current: 10, max: 100, increasePerFlyer: 10 });
  assert.equal(result.schedule.negi.entries.find((entry) => entry.id === 'haunted-house-flyer').isCompleted, true);
});

test('CFP-UT-S11-C32 AM11:30以降はチラシ配りを表示しない', () => {
  // Arrange
  const scene = createSceneAtChaoSearch(() => 0);
  waitUntil(scene, 11, 30);

  // Act
  const snapshot = scene.createSnapshot();

  // Assert
  assert.equal(snapshot.gameTime.label, 'AM11:30');
  assert.equal(snapshot.freeExplore.locationActions.some((action) => action.id === 'hand-out-haunted-house-flyers'), false);
});

test('CFP-UT-S11-C33 チラシ配りの盛り上がりは100を上限にする', () => {
  // Arrange
  const scene = createSceneAtChaoSearch(() => 0);

  // Act
  for (let index = 0; index < 20; index += 1) {
    selectLocationAction(scene, 'hand-out-haunted-house-flyers');
    advanceCurrentDialogue(scene);
  }
  const snapshot = scene.createSnapshot();

  // Assert
  assert.equal(snapshot.hauntedHouse.excitement.current, 100);
  assert.equal(snapshot.hauntedHouse.excitement.max, 100);
  assert.equal(snapshot.player.magicPower.current, 217);
});

test('CFP-UT-S11-C34 カシオペア使用時のホラーハウス初期値を確認する', () => {
  // Arrange
  const scene = createSceneAtPrepareDate(() => 0);
  selectLocationAction(scene, 'hand-out-haunted-house-flyers');
  advanceCurrentDialogue(scene);
  const rewindAction = scene.createSnapshot().freeExplore.locationActions.find(
    (action) => action.kind === 'cassiopeia-rewind' && action.id.endsWith('-600'),
  );

  // Act
  assert.ok(rewindAction);
  selectLocationAction(scene, rewindAction.id);
  const rewindSnapshot = scene.createSnapshot();

  // 巻き戻し先では、同じチラシ配りを新しいループで再実行できる。
  selectLocationAction(scene, 'hand-out-haunted-house-flyers');
  const snapshot = scene.createSnapshot();

  // Assert
  assert.equal(rewindSnapshot.hauntedHouse.excitement.current, 0);
  assert.equal(rewindSnapshot.gameTime.minute, 0);
  assert.equal(rewindSnapshot.gameTime.loopCount, 3);
  assert.equal(snapshot.hauntedHouse.excitement.current, 10);
  assert.equal(snapshot.gameTime.minute, 5);
});

test('CFP-UT-S11-C35 麻帆良祭スケジュールに出店ごとの初期盛り上がりを表示する', () => {
  const scene = createSceneAtChaoSearch(() => 0);
  const entries = scene.createSnapshot().schedule.festival.entries;

  assert.deepEqual(
    Object.fromEntries(entries.map((entry) => [entry.id, entry.excitement.current])),
    { 'haunted-house': 0, 'gun-shooting': 30, 'roller-coaster': 30 },
  );
});

test('CFP-UT-S11-C36 5分経過ごとにガンシューティングとジェットコースターの盛り上がりが変動する', () => {
  const scene = createSceneAtChaoSearch(() => 1);
  waitUntil(scene, 10, 15);
  const entries = scene.createSnapshot().schedule.festival.entries;

  assert.equal(entries.find((entry) => entry.id === 'gun-shooting').excitement.current, 35);
  assert.equal(entries.find((entry) => entry.id === 'roller-coaster').excitement.current, 35);
});

test('CFP-UT-S11-C37 出店の盛り上がりは0から100の範囲に収まる', () => {
  const downwardScene = createSceneAtChaoSearch(() => 0);
  waitUntil(downwardScene, 11, 55);
  const downwardEntries = downwardScene.createSnapshot().schedule.festival.entries;
  assert.equal(downwardEntries.find((entry) => entry.id === 'gun-shooting').excitement.current, 0);
  assert.equal(downwardEntries.find((entry) => entry.id === 'roller-coaster').excitement.current, 0);

  const upwardScene = createSceneAtChaoSearch(() => 1);
  waitUntil(upwardScene, 11, 55);
  const upwardEntries = upwardScene.createSnapshot().schedule.festival.entries;
  assert.equal(upwardEntries.find((entry) => entry.id === 'gun-shooting').excitement.current, 100);
  assert.equal(upwardEntries.find((entry) => entry.id === 'roller-coaster').excitement.current, 100);
});

test('CFP-UT-S13-C16 出店の盛り上がりが60以上になると同時に通知する', () => {
  // Arrange
  const scene = createSceneAtChaoSearch(() => 1);

  // Act
  waitUntil(scene, 10, 40);
  const snapshot = scene.createSnapshot();

  // Assert
  assert.deepEqual(
    snapshot.festivalNotification.map((notification) => notification.id),
    ['festival-stall-excitement-gun-shooting', 'festival-stall-excitement-roller-coaster'],
  );
  assert.equal(snapshot.schedule.festival.entries.find((entry) => entry.id === 'gun-shooting').excitement.current, 60);
  assert.equal(snapshot.schedule.festival.entries.find((entry) => entry.id === 'roller-coaster').excitement.current, 60);
  assert.ok(snapshot.log.filter((entry) => entry.includes('盛り上がりが60以上')).length >= 2);
});

test('CFP-UT-S13-C17 60未満へ下がるだけでは出店通知を再発生させない', () => {
  // Arrange
  let direction = 1;
  const scene = createSceneAtChaoSearch(() => direction);
  waitUntil(scene, 10, 40);

  // Act
  direction = 0;
  waitUntil(scene, 10, 45);
  direction = 1;
  waitUntil(scene, 10, 50);
  const snapshot = scene.createSnapshot();

  // Assert
  assert.deepEqual(snapshot.festivalNotification, []);
  assert.equal(snapshot.schedule.festival.entries.find((entry) => entry.id === 'gun-shooting').excitement.current, 60);
});

test('CFP-UT-S13-C18 40以下へ下がった出店は再び60以上で通知する', () => {
  // Arrange
  let direction = 1;
  const scene = createSceneAtChaoSearch(() => direction);
  waitUntil(scene, 10, 40);

  // Act
  direction = 0;
  waitUntil(scene, 11, 0);
  direction = 1;
  waitUntil(scene, 11, 20);
  const snapshot = scene.createSnapshot();

  // Assert
  assert.deepEqual(
    snapshot.festivalNotification.map((notification) => notification.id),
    ['festival-stall-excitement-gun-shooting', 'festival-stall-excitement-roller-coaster'],
  );
  assert.equal(snapshot.schedule.festival.entries.find((entry) => entry.id === 'gun-shooting').excitement.current, 60);
});

  test('CFP-UT-S11-C41 flyer activity does not derive the Ayaka attraction tour with Kotaro', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    const initial = scene.createSnapshot();
    const kotaro = initial.classmateStatus.find((actor) => actor.id === 'kotaro');
    if (kotaro.areaId !== initial.freeExplore.currentLocation.id) {
      selectDestination(scene, kotaro.areaId);
      advanceFreeExploreTravel(scene);
    }
    selectLocationAction(scene, 'talk-classmate-kotaro');
    selectChoice(scene, 'join-kotaro');
    advanceCurrentDialogue(scene);

    // Act
    selectLocationAction(scene, 'hand-out-haunted-house-flyers');
    const snapshot = scene.createSnapshot();
    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    assert.equal(snapshot.activeEvent, null);
    assert.equal(snapshot.gameTime.label, 'AM10:20');
    assert.equal(snapshot.hauntedHouse.excitement.current, 10);
    assert.equal(snapshot.schedule.negi.entries.some((entry) => entry.id === 'haunted-house-flyer-ayaka'), false);
  });

  test('CFP-UT-S11-C42 Ayaka branch is hidden before haunted-house help is attempted', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    // Assert
    assert.equal(snapshot.schedule.negi.entries.some((entry) => entry.id === 'haunted-house-flyer-ayaka'), false);
  });

  test('CFP-UT-S11-C44 helping without Kotaro keeps the Ayaka branch undisclosed', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 11, 30);
    selectDestination(scene, 'school-building');
    advanceFreeExploreTravel(scene);

    // Act
    selectLocationAction(scene, 'help-haunted-house');
    const snapshot = scene.createSnapshot();
    const entry = snapshot.schedule.negi.entries.find((item) => item.id === 'haunted-house-flyer-ayaka');

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    assert.equal(entry.actorName, '???');
    assert.equal(entry.attractionName, '???');
    assert.equal(entry.isNameHidden, true);
    assert.equal(entry.conditionText, '小太郎がパーティに同行している');
    assert.equal(entry.startTimeLabel, 'AM11:30');
    assert.equal(entry.endTimeLabel, 'PM6:00');
    assert.equal(entry.areaId, 'school-building');
  });

  test('CFP-UT-S11-C43 helping at the haunted house follows the Ayaka branch with Kotaro', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 11, 30);
    const kotaro = scene.createSnapshot().classmateStatus.find((actor) => actor.id === 'kotaro');
    if (kotaro.areaId !== scene.createSnapshot().freeExplore.currentLocation.id) {
      selectDestination(scene, kotaro.areaId);
      advanceFreeExploreTravel(scene);
    }
    selectLocationAction(scene, 'talk-classmate-kotaro');
    selectChoice(scene, 'join-kotaro');
    advanceCurrentDialogue(scene);
    selectDestination(scene, 'school-building');
    advanceFreeExploreTravel(scene);

    // Act
    selectLocationAction(scene, 'help-haunted-house');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR);
    assert.equal(snapshot.activeEvent.id, 'kotaro-ayaka-attraction-tour');
    assert.equal(snapshot.schedule.negi.entries.find((entry) => entry.id === 'haunted-house-flyer-ayaka').actorName, 'あやか');
    assert.equal(snapshot.schedule.negi.entries.find((entry) => entry.id === 'haunted-house-flyer-ayaka').isNameHidden, false);
    assert.equal(snapshot.schedule.negi.entries.find((entry) => entry.id === 'haunted-house-flyer-ayaka').branchOfId, 'haunted-house-help');
    assert.equal(snapshot.schedule.negi.entries.find((entry) => entry.id === 'haunted-house-flyer-ayaka').conditionText, null);
    assert.equal(snapshot.gameTime.label, 'AM11:45');
  });

describe('CFP-UT-S12 デート前自由時間', () => {
  test('CFP-UT-S12-C01 スケジュール見直し後はAM11:30のまま現地行動へ戻る', () => {
    // Arrange
    const scene = createSceneAtPrepareDate(() => 0);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.phase.inputKind, 'choice');
    assert.equal(snapshot.gameTime.label, 'AM11:30');
    assert.equal(snapshot.mainEvent.activeEventId, 'nodoka-date-prepare');
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.kind === 'wait-until'));
  });

  test('CFP-UT-S12-C02 デート準備中も場所移動を現地行動から選べる', () => {
    // Arrange
    const scene = createSceneAtPrepareDate(() => 0);

    // Act
    selectDestination(scene, 'dining-street');
    const travel = scene.createSnapshot();

    // Assert
    assert.equal(travel.phase.id, CANONICAL_PHASE_IDS.TRAVEL);
    assert.equal(travel.freeExplore.travel.destinationId, 'dining-street');
  });

  test('CFP-UT-S12-C03 食堂街で木乃香に相談すると服装コーディネートが完了する', () => {
    // Arrange
    const scene = createSceneAtPrepareDate(() => 0);
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);

    // Act
    selectLocationAction(scene, 'prepare-konoka');
    const dialogue = scene.createSnapshot();
    advanceStory(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(dialogue.dialogue.speaker, '木乃香');
    assert.deepEqual(dialogue.dialogue.anchor, { type: 'actor', id: 'konoka' });
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.phase.inputKind, 'choice');
    assert.equal(snapshot.prepareDate.hasCoordinated, true);
  });

  test('CFP-UT-S12-C04 場所別のデート準備行動を選ぶと各状態が完了する', () => {
    // Arrange
    const scene = createSceneAtPrepareDate(() => 0);

    // Act
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);
    selectLocationAction(scene, 'prepare-date-prep');
    advanceStory(scene);
    selectDestination(scene, 'entrance-gate');
    advanceFreeExploreTravel(scene);
    selectLocationAction(scene, 'prepare-festival-stroll');
    advanceStory(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.prepareDate.hasPrepared, true);
    assert.equal(snapshot.prepareDate.hasStrolled, true);
  });

  test('CFP-UT-S12-C05 任意イベント未実施でも指定時刻まで待てる', () => {
    // Arrange
    const scene = createSceneAtPrepareDate(() => 0);

    // Act
    waitUntil(scene, 16, 0);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.gameTime.label, 'PM4:00');
    assert.equal(snapshot.prepareDate.hasPrepared, false);
    assert.equal(snapshot.prepareDate.hasStrolled, false);
    assert.equal(snapshot.prepareDate.hasCoordinated, false);
  });

  test('CFP-UT-S12-C06 PM4:00からPM5:30の食堂街でのどかデートを開始できる', () => {
    // Arrange
    const scene = createSceneAtPrepareDate(() => 0);
    waitUntil(scene, 16, 0);
    advanceStory(scene);
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);

    // Act
    const before = scene.createSnapshot();
    selectLocationAction(scene, 'talk-nodoka-date');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.ok(before.freeExplore.locationActions.some((action) => action.id === 'talk-nodoka-date'));
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.NODOKA_DATE);
    assert.equal(snapshot.gameTime.label, 'PM4:00');
  });

  test('CFP-UT-S12-C10 デート受付中ののどかは食堂街に配置される', () => {
    // Arrange
    const scene = createSceneAtPrepareDate(() => 0);
    waitUntil(scene, 16, 0);
    advanceStory(scene);
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);

    // Act
    const snapshot = scene.createSnapshot();
    const nodokaStatus = snapshot.classmateStatus.find((entry) => entry.id === 'nodoka');
    const nodokaActor = snapshot.actors.find((actor) => actor.id === 'nodoka-date');

    // Assert
    assert.ok(snapshot.freeExplore.locationActions.some((action) => action.id === 'talk-nodoka-date'));
    assert.deepEqual(
      { areaId: nodokaStatus.areaId, areaName: nodokaStatus.areaName, statusLabel: nodokaStatus.statusLabel },
      { areaId: 'dining-street', areaName: '食堂街', statusLabel: 'デート待ち' },
    );
    assert.deepEqual(nodokaActor.position, { x: 24, y: 24 });
  });

  test('CFP-UT-S12-C11 チャオ未発見でもデート時間帯ののどかは食堂街に配置される', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 16, 0);
    advanceStory(scene);
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);

    // Act
    const before = scene.createSnapshot();
    selectLocationAction(scene, 'talk-nodoka-date');
    const after = scene.createSnapshot();

    // Assert
    const nodokaStatus = before.classmateStatus.find((entry) => entry.id === 'nodoka');
    const nodokaActor = before.actors.find((actor) => actor.id === 'nodoka-date');
    assert.equal(before.chaoSearch.isChaoFound, false);
    assert.deepEqual(
      { areaId: nodokaStatus.areaId, statusLabel: nodokaStatus.statusLabel },
      { areaId: 'dining-street', statusLabel: 'デート待ち' },
    );
    assert.deepEqual(nodokaActor.position, { x: 24, y: 24 });
    assert.equal(after.phase.id, CANONICAL_PHASE_IDS.NODOKA_DATE);

    // Act: complete the no-Chao branch.
    advanceCurrentDialogue(scene);
    selectChoice(scene, 'escape-patrol');
    const ending = scene.createSnapshot();
    advanceCurrentDialogue(scene);
    const freeExplore = scene.createSnapshot();

    // Assert
    assert.equal(ending.phase.id, CANONICAL_PHASE_IDS.NODOKA_DATE_NO_CHAO);
    assert.equal(freeExplore.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(freeExplore.gameTime.label, 'PM5:30');
    assert.equal(freeExplore.mainEvent.activeEventId, CANONICAL_MAIN_EVENT_IDS.CHAO_SEARCH);
  });

  test('CFP-UT-S12-C08 好感度が閾値未満のデートは通常終了する', () => {
    // Arrange
    const scene = createSceneAtPrepareDate(() => 0);
    waitUntil(scene, 16, 0);
    advanceStory(scene);
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);
    selectLocationAction(scene, 'talk-nodoka-date');

    // Act
    advanceCurrentDialogue(scene);
    const escape = scene.createSnapshot();
    selectChoice(scene, 'escape-patrol');
    const ending = scene.createSnapshot();
    advanceCurrentDialogue(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(escape.phase.id, CANONICAL_PHASE_IDS.ESCAPE_PATROL_STUDENTS);
    assert.equal(ending.phase.id, CANONICAL_PHASE_IDS.NODOKA_DATE_END);
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.gameTime.label, 'PM8:00');
    assert.equal(snapshot.cgFlags.nodokaKiss, false);
  });

  test('CFP-UT-S12-C09 好感度が閾値以上のデートはキスシーンとCG取得へ進む', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    for (let index = 0; index < 6; index += 1) {
      selectLocationAction(scene, 'talk-classmate-nodoka');
      selectChoice(scene, 'talk-classmate-nodoka');
      advanceStory(scene);
    }
    assert.equal(scene.createSnapshot().affection.nodoka.current, 60);
    visitChaoLocation(scene, 'gun-shooting');
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);
    waitUntil(scene, 16, 0);
    advanceStory(scene);
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);
    selectLocationAction(scene, 'talk-nodoka-date');

    // Act
    advanceCurrentDialogue(scene);
    assert.equal(scene.createSnapshot().phase.id, CANONICAL_PHASE_IDS.ESCAPE_PATROL_STUDENTS);
    selectChoice(scene, 'escape-patrol');
    const kissScene = scene.createSnapshot();
    advanceCurrentDialogue(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(kissScene.phase.id, CANONICAL_PHASE_IDS.NODOKA_DATE_KISS);
    assert.equal(snapshot.cgFlags.nodokaKiss, true);
    assert.notEqual(snapshot.phase.id, CANONICAL_PHASE_IDS.NODOKA_DATE_KISS);
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.gameTime.label, 'PM8:00');
    assert.equal(snapshot.freeExplore.currentLocation.id, 'dining-street');
    sendInput(scene, {
      type: CANONICAL_INPUT_TYPES.CASSIOPEIA_REWIND,
      targetMinute: 16 * 60,
    });
    const rewindSnapshot = scene.createSnapshot();
    assert.equal(rewindSnapshot.affection.nodoka.current, 60);
    assert.equal(rewindSnapshot.cgFlags.nodokaKiss, true);
    assert.equal(rewindSnapshot.chaoSearch.isChaoFound, true);
  });

  test('CFP-UT-S12-C13 キスルート未達時は夕映イベントを表示しない', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.schedule.negi.entries.some((entry) => entry.id === 'yue-festival-tour'), false);
  });

  test('CFP-UT-S12-C14 キスルート後の次ループPM4:30から夕映イベントを開始してPM6:00に終了する', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    for (let index = 0; index < 6; index += 1) {
      selectLocationAction(scene, 'talk-classmate-nodoka');
      selectChoice(scene, 'talk-classmate-nodoka');
      advanceStory(scene);
    }
    visitChaoLocation(scene, 'gun-shooting');
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);
    waitUntil(scene, 16, 0);
    advanceStory(scene);
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);
    selectLocationAction(scene, 'talk-nodoka-date');
    advanceCurrentDialogue(scene);
    selectChoice(scene, 'escape-patrol');
    advanceCurrentDialogue(scene);
    sendInput(scene, {
      type: CANONICAL_INPUT_TYPES.CASSIOPEIA_REWIND,
      targetMinute: 16 * 60,
    });
    waitUntil(scene, 16, 25);
    assert.equal(scene.createSnapshot().freeExplore.locationActions.some((action) => action.id === 'talk-yue-festival-tour'), false);
    waitUntil(scene, 16, 30);

    // Act
    const before = scene.createSnapshot();
    selectLocationAction(scene, 'talk-yue-festival-tour');
    const started = scene.createSnapshot();

    // Assert
    const scheduleEntry = before.schedule.negi.entries.find((entry) => entry.id === 'yue-festival-tour');
    assert.equal(before.gameTime.loopCount, 3);
    assert.equal(before.gameTime.label, 'PM4:30');
    assert.equal(scheduleEntry.startTimeLabel, 'PM4:30');
    assert.equal(scheduleEntry.endTimeLabel, 'PM6:00');
    assert.equal(scheduleEntry.areaId, 'dining-street');
    assert.equal(before.freeExplore.locationActions.some((action) => action.id === 'talk-yue-festival-tour'), true);
    assert.equal(started.phase.id, CANONICAL_PHASE_IDS.YUE_FESTIVAL_TOUR);
    assert.equal(started.activeEvent.id, 'yue-festival-tour');
    assert.equal(started.activeEvent.endTimeLabel, 'PM6:00');
    assert.equal(started.companions.some((companion) => companion.id === 'yue'), true);

    // Act: complete the event dialogue.
    advanceCurrentDialogue(scene);
    const finished = scene.createSnapshot();

    // Assert
    assert.equal(finished.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(finished.gameTime.label, 'PM6:00');
    assert.equal(finished.activeEvent, null);
    assert.equal(finished.companions.some((companion) => companion.id === 'yue'), false);
    assert.equal(finished.freeExplore.currentLocation.id, 'dining-street');
    assert.equal(finished.freeExplore.locationActions.some((action) => action.id === 'talk-yue-festival-tour'), false);
  });

  test('CFP-UT-S12-C07 PM5:30を過ぎるとのどかデートを開始できない', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 17, 30);
    advanceStory(scene);
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.gameTime.label, 'PM5:35');
    assert.equal(snapshot.chaoSearch.hasMissedNodokaDate, true);
    assert.equal(snapshot.freeExplore.locationActions.some((action) => action.id === 'talk-nodoka-date'), false);
  });

  test('CFP-UT-S12-C12 チャオ発見後はPM8:00を過ぎるとのどかデートを開始できない', () => {
    // Arrange
    const scene = createSceneAtPrepareDate(() => 0);
    waitUntil(scene, 20, 0);
    advanceStory(scene);
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.gameTime.label, 'PM8:05');
    assert.equal(snapshot.chaoSearch.hasMissedNodokaDate, true);
    assert.equal(snapshot.freeExplore.locationActions.some((action) => action.id === 'talk-nodoka-date'), false);
  });
});

describe('CFP-UT-S13 メインイベントとチャオ探索中の時刻指定', () => {
  test('CFP-UT-S13-C01 チャオ探索開始時にチャオ探索をメインイベントへ自動設定する', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.mainEvent.activeEventId, 'chao-search');
    assert.equal(snapshot.mainEvent.isManual, false);
    assert.deepEqual(snapshot.mainEvent.events.map((event) => event.id), ['chao-search']);
  });

  test('CFP-UT-S13-C02 メインイベントを手動で未設定にできる', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    clearMainEvent(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.mainEvent.activeEventId, null);
    assert.equal(snapshot.mainEvent.isManual, true);
    assert.equal(snapshot.mainEvent.events[0].isActive, false);
  });

  test('CFP-UT-S13-C03 受注中イベントを手動でメインイベントへ設定できる', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    clearMainEvent(scene);

    // Act
    setMainEvent(scene, 'chao-search');
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.mainEvent.activeEventId, 'chao-search');
    assert.equal(snapshot.mainEvent.isManual, true);
  });

  test('CFP-UT-S13-C04 チャオ探索成功時にPM4:00前ならデート準備を自動設定する', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    visitChaoLocation(scene, 'gun-shooting');
    advanceCurrentDialogue(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.REVIEW_SCHEDULE);
    assert.equal(snapshot.mainEvent.activeEventId, 'nodoka-date-prepare');
    assert.ok(snapshot.mainEvent.events.some((event) => event.id === 'nodoka-date-prepare'));
  });

  test.skip('CFP-UT-S13-C05 チャオ探索中にPM3:30へ進めるとカモがデート接近を警告する（旧仕様）', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    waitUntil(scene, 15, 30);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.phase.inputKind, 'story');
    assert.equal(snapshot.gameTime.label, 'PM3:30');
    assert.equal(snapshot.dialogue.speaker, 'カモ');
    assert.match(snapshot.dialogue.text, /デート/);
    assert.equal(snapshot.chaoSearch.hasDateWarningShown, true);
  });

  test.skip('CFP-UT-S13-C06 チャオ探索中にPM4:00へ進めるとデートを受注中イベントに追加する（旧仕様）', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    waitUntil(scene, 16, 0);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.gameTime.label, 'PM4:00');
    assert.equal(snapshot.chaoSearch.canStartNodokaDate, true);
    assert.equal(snapshot.mainEvent.activeEventId, 'nodoka-date');
    assert.ok(snapshot.mainEvent.events.some((event) => event.id === 'nodoka-date'));
  });

  test.skip('CFP-UT-S13-C07 チャオ未発見のままデートを実行するとチャオ探索へ戻る（旧仕様）', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    visitChaoLocation(scene, 'roller-coaster');
    advanceStory(scene);
    waitUntil(scene, 16, 0);
    advanceStory(scene);
    selectDestination(scene, 'dining-street');
    advanceFreeExploreTravel(scene);

    // Act
    selectLocationAction(scene, 'talk-nodoka-date');
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.chaoSearch.isChaoFound, false);
    assert.equal(snapshot.chaoSearch.isNodokaDateCompleted, true);
    assert.deepEqual(snapshot.chaoSearch.visitedLocationIds, ['roller-coaster']);
    assert.equal(snapshot.mainEvent.activeEventId, 'chao-search');
  });

  test.skip('CFP-UT-S13-C08 無効な未来時刻指定は時刻を変えない（旧仕様）', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    waitUntil(scene, 17, 0);
    const snapshot = scene.createSnapshot();
    const notification = snapshot.festivalNotification.find((entry) => entry.id === 'mahora-budokai-delay');

    // Assert
    assert.equal(snapshot.gameTime.label, 'AM10:10');
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.dialogue.speaker, 'カモ');
  });

  test('CFP-UT-S13-C09 待機時刻は5分刻みで1日目PM11:30まで選べる', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    const before = scene.createSnapshot();

    // Act
    const waitActions = before.freeExplore.locationActions.filter((action) => action.kind === 'wait-until');
    waitUntil(scene, 10, 15);
    const after = scene.createSnapshot();

    // Assert
    assert.equal(waitActions[0].targetMinute, 615);
    assert.equal(waitActions.at(-1).targetMinute, 1410);
    assert.equal(after.gameTime.label, 'AM10:15');
    assert.equal(after.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
  });

  test('CFP-UT-S13-C09 カシオペアは1日目AM10:00より前を候補に表示しない', () => {
    // Arrange
    const scene = createSceneAtPrepareDate(() => 0);
    waitUntil(scene, 23, 25);

    // Act
    const before = scene.createSnapshot();
    const rewindActions = before.freeExplore.locationActions.filter(
      (action) => action.kind === 'cassiopeia-rewind',
    );
    sendInput(scene, {
      type: CANONICAL_INPUT_TYPES.CASSIOPEIA_REWIND,
      targetMinute: 9 * 60 + 55,
    });
    const after = scene.createSnapshot();

    // Assert
    assert.ok(rewindActions.some((action) => action.targetMinute === 10 * 60));
    assert.equal(rewindActions.some((action) => action.targetMinute < 10 * 60), false);
    assert.equal(after.gameTime.label, 'PM11:25');
    assert.equal(after.gameTime.loopCount, before.gameTime.loopCount);
  });

  test('CFP-UT-S13-C09 チュートリアルスキップ後もAM10:00へ巻き戻せる', () => {
    // Arrange
    const scene = new CanonicalFestivalPrototypeScene({ random: () => 0 });
    sendInput(scene, { type: CANONICAL_INPUT_TYPES.TUTORIAL_SKIP });
    const before = scene.createSnapshot();

    // Act
    const rewindAction = before.freeExplore.locationActions.find(
      (action) => action.kind === 'cassiopeia-rewind' && action.targetMinute === 10 * 60,
    );
    sendInput(scene, {
      type: CANONICAL_INPUT_TYPES.CASSIOPEIA_REWIND,
      targetMinute: 10 * 60,
    });
    const after = scene.createSnapshot();

    // Assert
    assert.equal(rewindAction, undefined);
    assert.equal(after.gameTime.label, before.gameTime.label);
    assert.equal(after.gameTime.loopCount, before.gameTime.loopCount);
    assert.equal(after.player.magicPower.current, before.player.magicPower.current);
    assert.equal(after.chaoSearch.hasCassiopeiaManual, false);
  });

  test('CFP-UT-S13-C09 skip route unlocks Cassiopeia after Chao is found', () => {
    // Arrange
    const scene = new CanonicalFestivalPrototypeScene({ random: () => 0 });
    sendInput(scene, { type: CANONICAL_INPUT_TYPES.TUTORIAL_SKIP });
    visitChaoLocation(scene, 'gun-shooting');
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);
    const before = scene.createSnapshot();

    // Act
    const rewindAction = before.freeExplore.locationActions.find(
      (action) => action.kind === 'cassiopeia-rewind' && action.targetMinute === 10 * 60,
    );
    sendInput(scene, {
      type: CANONICAL_INPUT_TYPES.CASSIOPEIA_REWIND,
      targetMinute: 10 * 60,
    });
    const after = scene.createSnapshot();

    // Assert
    assert.ok(rewindAction);
    assert.equal(after.gameTime.label, 'AM10:00');
    assert.equal(after.gameTime.loopCount, before.gameTime.loopCount + 1);
    assert.equal(after.chaoSearch.hasCassiopeiaManual, true);
  });

  test('CFP-UT-S13-C13 麻帆良祭通知はループ数に関係なくPM5:00に表示される', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    waitUntil(scene, 17, 0);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.gameTime.loopCount, 2);
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    const notification = snapshot.festivalNotification.find((entry) => entry.id === 'mahora-budokai-delay');
    assert.equal(notification.speaker, '麻帆良祭放送');
    assert.match(notification.text, /まほら武道会の開始時刻が延期/);
    assert.ok(snapshot.log.some((entry) => entry.includes('麻帆良祭放送')));
    assert.equal(snapshot.schedule.negi.entries.find((entry) => entry.id === 'mahora-budokai').isTimeUnknown, true);
  });

  test('CFP-UT-S13-C14 麻帆良祭通知後も現在地の行動を選択できる', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 17, 0);
    const before = scene.createSnapshot();

    // Act
    const action = before.freeExplore.locationActions.find((entry) => entry.id === 'look-around');
    assert.ok(action);
    selectLocationAction(scene, action.id);
    const after = scene.createSnapshot();

    // Assert
    assert.equal(after.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    assert.deepEqual(after.festivalNotification, []);
    assert.ok(after.log.some((entry) => entry.includes('まほら武道会')));
  });

  test('CFP-UT-S13-C15 通知後は任意のループで小太郎と会場確認へ進める', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    waitUntil(scene, 17, 0);
    selectDestination(scene, 'ground');
    advanceFreeExploreTravel(scene);

    // Act
    const beforeTalk = scene.createSnapshot();
    selectLocationAction(scene, 'talk-kotaro-tournament');
    advanceCurrentDialogue(scene);
    const afterTalk = scene.createSnapshot();
    selectLocationAction(scene, 'go-mahora-budokai-venue');
    const venue = scene.createSnapshot();
    const notice = scene.createSnapshot();
    const venueNotification = notice.festivalNotification.find((entry) => entry.id === 'mahora-budokai-venue-change');
    advanceCurrentDialogue(scene);
    const afterVenue = scene.createSnapshot();

    // Assert
    assert.equal(beforeTalk.gameTime.loopCount, 2);
    assert.ok(beforeTalk.freeExplore.locationActions.some((action) => action.id === 'talk-kotaro-tournament'));
    assert.ok(afterTalk.companions.some((companion) => companion.id === 'kotaro'));
    assert.ok(afterTalk.freeExplore.locationActions.some((action) => action.id === 'go-mahora-budokai-venue'));
    assert.equal(venue.phase.id, CANONICAL_PHASE_IDS.TOURNAMENT_VENUE);
    assert.match(venueNotification.text, /龍宮神社へ変更された/);
    assert.match(venueNotification.text, /受付はPM6:00から/);
    assert.match(venueNotification.text, /予選はPM7:00から/);
    assert.equal(notice.companions.some((companion) => companion.id === 'kotaro'), false);
    assert.equal(afterVenue.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(afterVenue.freeExplore.currentLocation.id, 'ground');
    assert.deepEqual(
      afterVenue.schedule.negi.entries
        .filter((entry) => entry.id.startsWith('mahora-budokai'))
        .map((entry) => [entry.id, entry.areaId, entry.startTimeLabel, entry.endTimeLabel]),
      [
        ['mahora-budokai-reception', 'ryugu-shrine', 'PM6:00', 'PM7:00'],
        ['mahora-budokai-qualifier', 'ryugu-shrine', 'PM7:00', 'PM7:30'],
      ],
    );
  });

  test('CFP-UT-S13-C10 カシオペアは現在地を維持し、経過時間の切り上げMPを消費して次ループへ進む', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    visitChaoLocation(scene, 'gun-shooting');
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);
    const before = scene.createSnapshot();

    // Act
    sendInput(scene, {
      type: CANONICAL_INPUT_TYPES.CASSIOPEIA_REWIND,
      targetMinute: 685,
    });
    const after = scene.createSnapshot();

    // Assert
    assert.equal(before.gameTime.label, 'AM11:30');
    assert.equal(after.gameTime.label, 'AM11:25');
    assert.equal(after.gameTime.loopCount, before.gameTime.loopCount + 1);
    assert.equal(after.freeExplore.currentLocation.id, before.freeExplore.currentLocation.id);
    assert.equal(after.player.magicPower.current, before.player.magicPower.current - 1);
  });

  test('CFP-UT-S13-C11 チャオ発見後の時刻待機ではデート接近のカモ助言を表示しない', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    visitChaoLocation(scene, 'gun-shooting');
    advanceCurrentDialogue(scene);
    advanceCurrentDialogue(scene);

    // Act
    const snapshot = scene.createSnapshot();

    // Assert
    assert.doesNotMatch(snapshot.dialogue?.text ?? '', /デートの時間|デートの時刻/);
  });

  test('CFP-UT-S13-C12 のどかデート後は自動巻き戻しせず同じループの自由探索へ戻る', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);

    // Act
    completeChaoSearchToThirdLoopWorldTree(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.phase.id, CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    assert.equal(snapshot.gameTime.loopCount, 2);
    assert.equal(snapshot.freeExplore.currentLocation.id, 'dining-street');
    assert.equal(snapshot.gameTime.label, 'PM8:00');
  });

  test('CFP-UT-S13-C19 rewinding after a date restores the target-time schedule state', () => {
    // Arrange
    const scene = createSceneAtChaoSearch(() => 0);
    completeChaoSearchToThirdLoopWorldTree(scene);
    const beforeRewind = scene.createSnapshot();

    // Act
    sendInput(scene, {
      type: CANONICAL_INPUT_TYPES.CASSIOPEIA_REWIND,
      targetMinute: 16 * 60,
    });
    const afterRewind = scene.createSnapshot();

    // Assert
    assert.equal(beforeRewind.chaoSearch.isChaoFound, true);
    assert.equal(beforeRewind.chaoSearch.isNodokaDateCompleted, true);
    assert.equal(beforeRewind.schedule.negi.entries.find((entry) => entry.id === 'nodoka-date').isCompleted, true);
    assert.equal(afterRewind.gameTime.label, 'PM4:00');
    assert.equal(afterRewind.freeExplore.currentLocation.id, 'dining-street');
    assert.equal(afterRewind.chaoSearch.isNodokaDateCompleted, false);
    assert.equal(afterRewind.schedule.negi.entries.find((entry) => entry.id === 'nodoka-date').isCompleted, true);
    assert.ok(afterRewind.freeExplore.locationActions.some((action) => action.id === 'talk-nodoka-date'));
    assert.equal(afterRewind.chaoSearch.hasCassiopeiaManual, true);
  });
});
