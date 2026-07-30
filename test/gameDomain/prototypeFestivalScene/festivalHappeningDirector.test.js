import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  FestivalHappeningDirector,
  HAPPENING_PHASES,
  HAPPENING_TYPES,
  MAX_ACTIONABLE_HAPPENING_COUNT,
  MAX_BACKGROUND_HAPPENING_COUNT,
  MAX_HAPPENING_COUNT,
  MIN_HAPPENING_COUNT,
} from '../../../src/gameDomain/prototypeFestivalScene/festivalHappeningDirector.js';

/** directorテストで使用する4エリア。 */
const TEST_AREAS = Object.freeze([
  Object.freeze({ id: 'area-1', name: 'エリア1', area: Object.freeze({ x: 0, y: 0, width: 16, height: 16 }) }),
  Object.freeze({ id: 'area-2', name: 'エリア2', area: Object.freeze({ x: 16, y: 0, width: 16, height: 16 }) }),
  Object.freeze({ id: 'area-3', name: 'エリア3', area: Object.freeze({ x: 0, y: 16, width: 16, height: 16 }) }),
  Object.freeze({ id: 'area-4', name: 'エリア4', area: Object.freeze({ x: 16, y: 16, width: 16, height: 16 }) }),
]);

/** directorテストで使用する通行可能な発生候補地点。 */
const TEST_SITES = Object.freeze(Array.from({ length: 12 }, (unused, index) => Object.freeze({
  id: `site-${index}`,
  areaId: TEST_AREAS[0].id,
  position: Object.freeze({ x: 3 + index % 3 * 0.2, y: 3 + Math.floor(index / 3) * 0.2 }),
})));

/**
 * 指定値を順番に返す乱数関数を生成する。
 * @param {Array<number>} values - 返却値一覧。
 * @param {number} [fallback] - 値を使い切った後の返却値。
 * @returns {Function} テスト用乱数関数。
 */
function createSequenceRandom(values, fallback = 0.9) {
  /**
   * 次の乱数値を返す。
   * @returns {number} 乱数値。
   */
  function getNextValue() {
    return values.shift() ?? fallback;
  }
  return getNextValue;
}

/**
 * directorを指定時刻まで更新する。
 * @param {FestivalHappeningDirector} director - 更新対象。
 * @param {number} previousMinutes - 更新前時刻。
 * @param {number} elapsedMinutes - 更新後時刻。
 * @param {Array<Object>} [fixedEvents] - 固定イベント一覧。
 * @returns {void}
 */
function updateDirector(director, previousMinutes, elapsedMinutes, fixedEvents = [], options = {}) {
  director.update({
    elapsedMinutes,
    deltaMinutes: elapsedMinutes - previousMinutes,
    fixedEvents,
    ...options,
  });
}

/**
 * directorのsnapshotを生成する。
 * @param {FestivalHappeningDirector} director - snapshot生成元。
 * @param {Object} [playerPosition] - プレイヤー座標。
 * @returns {Object} director snapshot。
 */
function createSnapshot(director, playerPosition = { x: 3, y: 3 }) {
  return director.createSnapshot({ playerPosition });
}

/** 連鎖型ハプニングの生成と密度を検証する。 */
function registerDensityTests() {
  /** 開始時に背景ハプニングを1件生成する。 */
  function startsWithMinimumDensity() {
    // Arrange
    const director = new FestivalHappeningDirector({ random: () => 0, areas: TEST_AREAS, sites: TEST_SITES });

    // Act
    const snapshot = createSnapshot(director);

    // Assert
    assert.equal(snapshot.happenings.length, MIN_HAPPENING_COUNT);
  }

  /** 開始時に背景ハプニング上限を超えない。 */
  function capsInitialDensity() {
    // Arrange
    const director = new FestivalHappeningDirector({ random: () => 0.999, areas: TEST_AREAS, sites: TEST_SITES });

    // Act
    const snapshot = createSnapshot(director);

    // Assert
    assert.equal(snapshot.happenings.length, MAX_BACKGROUND_HAPPENING_COUNT);
  }

  /** 介入可能件数を1件に制限する。 */
  function capsActionableHappenings() {
    // Arrange
    const director = new FestivalHappeningDirector({ random: () => 0, areas: TEST_AREAS, sites: TEST_SITES });

    // Act
    updateDirector(director, 0, 2);
    const snapshot = createSnapshot(director);

    // Assert
    assert.equal(snapshot.nearbyHappenings.length, MAX_ACTIONABLE_HAPPENING_COUNT);
  }

  test('PT-UT-HD-S01-C01 開始時に背景ハプニングを1件生成する', startsWithMinimumDensity);
  test('PT-UT-HD-S01-C02 開始時に背景ハプニング上限を超えない', capsInitialDensity);
  test('PT-UT-HD-S01-C03 介入可能なハプニングを1件以下にする', capsActionableHappenings);
}

/** 連鎖型ハプニングの選択と進行を検証する。 */
function registerProgressTests() {
  /** 現地選択で時間消費と派生を返す。 */
  function appliesNearbyChoice() {
    // Arrange
    const director = new FestivalHappeningDirector({ random: () => 0, areas: TEST_AREAS, sites: TEST_SITES });
    updateDirector(director, 0, 2);
    const nearby = createSnapshot(director).nearbyHappenings[0];

    // Act
    const result = director.choose({
      happeningId: nearby.id,
      choiceId: 'cheer',
      playerPosition: { x: 3, y: 3 },
      magicPower: 100,
    });

    // Assert
    assert.equal(result.accepted, true);
    assert.equal(result.timeCostMinutes, 2);
    assert.equal(result.magicPowerCost, 0);
    assert.equal(createSnapshot(director).happenings.find((entry) => entry.id === nearby.id).phase, HAPPENING_PHASES.FLOWING);
  }

  /** 放置した出来事を次段階へ進める。 */
  function advancesIgnoredHappening() {
    // Arrange
    const director = new FestivalHappeningDirector({ random: () => 0, areas: TEST_AREAS, sites: TEST_SITES });
    updateDirector(director, 0, 2);

    // Act
    updateDirector(director, 2, 7);

    // Assert
    assert.ok(createSnapshot(director).happenings.some((entry) => entry.phase === HAPPENING_PHASES.FLOWING));
  }

  /** ライブとコスプレを合同パレードへ合流する。 */
  function mergesPerformanceAndCosplay() {
    // Arrange
    const random = createSequenceRandom([0, 0, 0, 0.6]);
    const sites = [
      { id: 'background', areaId: 'area-1', position: { x: 1, y: 1 } },
      { id: 'proximity', areaId: 'area-1', position: { x: 6, y: 3 } },
    ];
    const director = new FestivalHappeningDirector({ random, areas: TEST_AREAS, sites });

    // Act
    updateDirector(director, 0, 8, [], {
      playerPosition: { x: 0, y: 3 },
      playerDistanceTraveled: 12,
      hasLineOfSight: () => false,
    });
    updateDirector(director, 8, 10, [], {
      playerPosition: { x: 0, y: 3 },
      hasLineOfSight: () => false,
    });

    // Assert
    assert.ok(createSnapshot(director).happenings.some((entry) => entry.type === HAPPENING_TYPES.JOINT_PARADE));
  }

  test('PT-UT-HD-S02-C01 現地選択で時間消費と派生を返す', appliesNearbyChoice);
  test('PT-UT-HD-S02-C02 放置したハプニングを成長させる', advancesIgnoredHappening);
  test('PT-UT-HD-S02-C03 ライブとコスプレを合同パレードへ合流する', mergesPerformanceAndCosplay);
}

/** エリア状態、群衆、波及表示を検証する。 */
function registerSnapshotTests() {
  /** エリア状態を0から100へ制限する。 */
  function clampsAreaStates() {
    // Arrange
    const director = new FestivalHappeningDirector({ random: () => 0, areas: TEST_AREAS, sites: TEST_SITES });

    // Act
    updateDirector(director, 0, 2, [
      { id: 'opening-stage', status: 'active', areaId: 'area-1' },
      { id: 'stall-trouble', status: 'active', areaId: 'area-1' },
    ]);

    // Assert
    for (const state of createSnapshot(director).areaStates) {
      assert.ok(state.excitement >= 0 && state.excitement <= 100);
      assert.ok(state.congestion >= 0 && state.congestion <= 100);
      assert.ok(state.trouble >= 0 && state.trouble <= 100);
    }
  }

  /** 同じ段階では群衆点IDを維持する。 */
  function keepsCrowdPointIdsStable() {
    // Arrange
    const director = new FestivalHappeningDirector({ random: () => 0, areas: TEST_AREAS, sites: TEST_SITES });
    const before = createSnapshot(director).crowdPoints.map((point) => point.id);

    // Act
    updateDirector(director, 0, 1);
    const after = createSnapshot(director).crowdPoints.map((point) => point.id);

    // Assert
    assert.deepEqual(after, before);
  }

  /** 波及中に進行率と群衆位置を進める。 */
  function movesCrowdAlongFlow() {
    // Arrange
    const director = new FestivalHappeningDirector({ random: () => 0, areas: TEST_AREAS, sites: TEST_SITES });
    updateDirector(director, 0, 2);
    const nearby = createSnapshot(director).nearbyHappenings[0];
    director.choose({ happeningId: nearby.id, choiceId: 'cheer', playerPosition: { x: 3, y: 3 }, magicPower: 100 });
    const before = createSnapshot(director);

    // Act
    updateDirector(director, 2, 5);
    const after = createSnapshot(director);

    // Assert
    assert.equal(before.flows[0].progress, 0);
    assert.equal(after.flows[0].progress, 0.5);
    assert.notDeepEqual(after.crowdPoints[0].position, before.crowdPoints[0].position);
  }

  /** ループ初期化で状態とハプニングを再作成する。 */
  function resetsLoopState() {
    // Arrange
    const random = createSequenceRandom(new Array(4).fill(0), 0.999);
    const director = new FestivalHappeningDirector({ random, areas: TEST_AREAS, sites: TEST_SITES });
    updateDirector(director, 0, 2);

    // Act
    director.resetLoop();
    const after = createSnapshot(director);

    // Assert
    assert.equal(after.happenings.length, 1);
    assert.equal(after.happenings[0].phase, HAPPENING_PHASES.PRELUDE);
    assert.deepEqual(after.eventFeed, []);
    assert.ok(after.areaStates.every((state) => state.excitement >= 20 && state.congestion >= 10 && state.trouble === 0));
  }

  test('PT-UT-HD-S03-C01 エリア状態を0から100へ制限する', clampsAreaStates);
  test('PT-UT-HD-S03-C02 群衆点IDをフレーム間で維持する', keepsCrowdPointIdsStable);
  test('PT-UT-HD-S03-C03 波及中の群衆点を移動させる', movesCrowdAlongFlow);
  test('PT-UT-HD-S03-C04 ループ初期化で状態とハプニングを再作成する', resetsLoopState);
}

/** 近傍ハプニングの発生条件テストを登録する。 */
function registerProximitySpawnTests() {
  /** 近傍発生テスト用の候補地点を生成する。 */
  function createProximitySites() {
    return [
      { id: 'background-1', areaId: 'area-1', position: { x: 1, y: 1 } },
      { id: 'background-2', areaId: 'area-1', position: { x: 2, y: 1 } },
      { id: 'background-3', areaId: 'area-1', position: { x: 3, y: 1 } },
      { id: 'background-4', areaId: 'area-1', position: { x: 20, y: 20 } },
      { id: 'proximity', areaId: 'area-1', position: { x: 6, y: 3 } },
    ];
  }

  /** 距離または時間が不足している間は近傍発生させない。 */
  function waitsForBothThresholds() {
    // Arrange
    const director = new FestivalHappeningDirector({
      random: () => 0,
      areas: TEST_AREAS,
      sites: createProximitySites(),
    });

    // Act
    updateDirector(director, 0, 7.9, [], {
      playerPosition: { x: 0, y: 3 },
      playerDistanceTraveled: 12,
      hasLineOfSight: () => false,
    });

    // Assert
    assert.equal(createSnapshot(director).happenings.some((entry) => entry.source === 'proximity'), false);
  }

  /** 距離と時間の成立後に死角へ1件生成する。 */
  function spawnsOneHiddenProximityHappening() {
    // Arrange
    const director = new FestivalHappeningDirector({
      random: () => 0,
      areas: TEST_AREAS,
      sites: createProximitySites(),
    });

    // Act
    updateDirector(director, 0, 7.9, [], {
      playerPosition: { x: 0, y: 3 },
      playerDistanceTraveled: 12,
      hasLineOfSight: () => false,
    });
    updateDirector(director, 7.9, 9, [], {
      playerPosition: { x: 0, y: 3 },
      playerDistanceTraveled: 20,
      hasLineOfSight: () => false,
    });
    const proximityHappenings = createSnapshot(director).happenings.filter((entry) => (
      entry.source === 'proximity'
    ));

    // Assert
    assert.equal(proximityHappenings.length, 1);
    assert.equal(proximityHappenings[0].isDiscovered, false);
  }

  /** 候補が見えている間は条件を保持して後から再試行する。 */
  function retriesAfterNoHiddenCandidate() {
    // Arrange
    const director = new FestivalHappeningDirector({
      random: () => 0,
      areas: TEST_AREAS,
      sites: createProximitySites(),
    });
    updateDirector(director, 0, 7.9, [], {
      playerPosition: { x: 0, y: 3 },
      playerDistanceTraveled: 12,
      hasLineOfSight: () => true,
    });

    // Act
    updateDirector(director, 7.9, 8, [], {
      playerPosition: { x: 0, y: 3 },
      playerDistanceTraveled: 0,
      hasLineOfSight: () => false,
    });

    // Assert
    assert.equal(createSnapshot(director).happenings.filter((entry) => entry.source === 'proximity').length, 1);
  }

  test('PT-UT-HD-S04-C01 12マスと8分の両方を発生条件にする', waitsForBothThresholds);
  test('PT-UT-HD-S04-C02 死角の候補地点へ近傍ハプニングを1件生成する', spawnsOneHiddenProximityHappening);
  test('PT-UT-HD-S04-C03 候補がない場合は条件を維持して再試行する', retriesAfterNoHiddenCandidate);
}

describe('PT-UT-HD-S01 FestivalHappeningDirector 密度', registerDensityTests);
describe('PT-UT-HD-S02 FestivalHappeningDirector 進行', registerProgressTests);
describe('PT-UT-HD-S03 FestivalHappeningDirector snapshot', registerSnapshotTests);
describe('PT-UT-HD-S04 FestivalHappeningDirector 近傍発生', registerProximitySpawnTests);
