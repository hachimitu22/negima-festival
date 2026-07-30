import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  PROTOTYPE_HAPPENING_SITES,
  PROTOTYPE_LOCAL_VIEW_SIZE,
  createPrototypeViewport,
  getPrototypeMovementSpeed,
  hasPrototypeLineOfSight,
  isPositionInPrototypeViewport,
  isPrototypePositionWalkable,
  movePrototypePosition,
} from '../../../src/gameDomain/prototypeFestivalScene/prototypeFestivalMap.js';

/** PT-UT-PM-S01の移動と視界テストを登録する。 */
function registerMovementAndVisibilityTests() {
  /** PT-UT-PM-S01-C01 障害物を横切る移動を止める。 */
  function blocksObstacleCrossing() {
    // Arrange
    const start = { x: 7, y: 2 };

    // Act
    const result = movePrototypePosition(start, { x: -4, y: 0 });

    // Assert
    assert.ok(result.x >= 6.3);
    assert.equal(result.y, 2);
  }

  /** PT-UT-PM-S01-C02 衝突していない軸の移動を継続する。 */
  function slidesAlongObstacle() {
    // Arrange
    const start = { x: 7, y: 2 };

    // Act
    const result = movePrototypePosition(start, { x: -1, y: 1 });

    // Assert
    assert.ok(result.x >= 6.3);
    assert.ok(result.y > 2);
  }

  /** PT-UT-PM-S01-C03 建物の向こうを視認できない。 */
  function blocksLineOfSight() {
    // Arrange
    const from = { x: 7, y: 2 };
    const to = { x: 0.5, y: 2 };

    // Act
    const isVisible = hasPrototypeLineOfSight(from, to);

    // Assert
    assert.equal(isVisible, false);
  }

  /** PT-UT-PM-S01-C04 高混雑の発生地点周辺だけ速度を半減する。 */
  function slowsMovementNearCrowd() {
    // Arrange
    const options = {
      baseSpeed: 4,
      playerPosition: { x: 5, y: 5 },
      currentAreaId: 'food-street',
      areaStates: [{ id: 'food-street', congestion: 70 }],
      happenings: [{ areaId: 'food-street', position: { x: 7, y: 5 } }],
    };

    // Act
    const nearSpeed = getPrototypeMovementSpeed(options);
    const farSpeed = getPrototypeMovementSpeed({
      ...options,
      playerPosition: { x: 1, y: 1 },
    });

    // Assert
    assert.equal(nearSpeed, 2);
    assert.equal(farSpeed, 4);
  }

  test('PT-UT-PM-S01-C01 障害物を通過しない', blocksObstacleCrossing);
  test('PT-UT-PM-S01-C02 障害物に沿って移動する', slidesAlongObstacle);
  test('PT-UT-PM-S01-C03 障害物が視線を遮る', blocksLineOfSight);
  test('PT-UT-PM-S01-C04 高混雑地点から3マス以内だけ速度を半減する', slowsMovementNearCrowd);
}

/** PT-UT-PM-S02の表示範囲と配置テストを登録する。 */
function registerViewportAndPlacementTests() {
  /** PT-UT-PM-S02-C01 中央ではネギを中心に表示する。 */
  function centersViewport() {
    // Arrange
    const playerPosition = { x: 16, y: 16 };

    // Act
    const viewport = createPrototypeViewport(playerPosition);

    // Assert
    assert.deepEqual(viewport, { x: 10, y: 10, width: 12, height: 12 });
  }

  /** PT-UT-PM-S02-C02 マップ端では表示範囲を固定する。 */
  function clampsViewportAtEdge() {
    // Arrange
    const playerPosition = { x: 31, y: 1 };

    // Act
    const viewport = createPrototypeViewport(playerPosition);

    // Assert
    assert.equal(viewport.x, 20);
    assert.equal(viewport.y, 0);
    assert.equal(viewport.width, PROTOTYPE_LOCAL_VIEW_SIZE);
    assert.equal(isPositionInPrototypeViewport(playerPosition, viewport), true);
  }

  /** PT-UT-PM-S02-C03 全候補地点を通行可能な場所へ置く。 */
  function keepsAllHappeningSitesWalkable() {
    // Arrange
    const siteCount = PROTOTYPE_HAPPENING_SITES.length;

    // Act
    const blockedSites = PROTOTYPE_HAPPENING_SITES.filter((site) => (
      !isPrototypePositionWalkable(site.position)
    ));

    // Assert
    assert.equal(siteCount, 24);
    assert.deepEqual(blockedSites, []);
  }

  test('PT-UT-PM-S02-C01 ローカル表示をネギ中心の12×12にする', centersViewport);
  test('PT-UT-PM-S02-C02 マップ端でローカル表示を範囲内へ固定する', clampsViewportAtEdge);
  test('PT-UT-PM-S02-C03 24候補地点を通行可能にする', keepsAllHappeningSitesWalkable);
}

describe('PT-UT-PM-S01 PrototypeFestivalMap 移動と視界', registerMovementAndVisibilityTests);
describe('PT-UT-PM-S02 PrototypeFestivalMap 表示範囲と配置', registerViewportAndPlacementTests);
