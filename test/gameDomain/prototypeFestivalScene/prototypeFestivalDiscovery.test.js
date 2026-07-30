import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  PROTOTYPE_DISCOVERY_SITES,
  PROTOTYPE_DISCOVERY_TYPES,
  createPrototypeDiscoveries,
} from '../../../src/gameDomain/prototypeFestivalScene/prototypeFestivalDiscovery.js';
import { isPrototypePositionWalkable } from '../../../src/gameDomain/prototypeFestivalScene/prototypeFestivalMap.js';

/** 発見地点の配置と内容割当を検証する。 */
function registerPrototypeDiscoveryTests() {
  /** 4エリアへ2地点ずつ配置する。 */
  function placesTwoSitesInEachArea() {
    const counts = new Map();
    for (const site of PROTOTYPE_DISCOVERY_SITES) {
      counts.set(site.areaId, (counts.get(site.areaId) ?? 0) + 1);
      assert.equal(isPrototypePositionWalkable(site.position), true);
    }
    assert.deepEqual([...counts.values()].sort(), [2, 2, 2, 2]);
  }

  /** 各ループへ4種の内容を2件ずつ割り当てる。 */
  function assignsTwoOfEachContentType() {
    const discoveries = createPrototypeDiscoveries(1);
    const counts = new Map();
    for (const discovery of discoveries) {
      counts.set(discovery.type, (counts.get(discovery.type) ?? 0) + 1);
    }
    assert.equal(counts.get(PROTOTYPE_DISCOVERY_TYPES.SCHEDULE), 2);
    assert.equal(counts.get(PROTOTYPE_DISCOVERY_TYPES.HAPPENING), 2);
    assert.equal(counts.get(PROTOTYPE_DISCOVERY_TYPES.MAGIC_POWER), 2);
    assert.equal(counts.get(PROTOTYPE_DISCOVERY_TYPES.MAHOPAY), 2);
  }

  /** 巻き戻し後に地点の内容を並べ替えて未利用状態へ戻す。 */
  function changesAssignmentsForNextLoop() {
    const firstLoop = createPrototypeDiscoveries(1);
    firstLoop[0].isDiscovered = true;
    const secondLoop = createPrototypeDiscoveries(2);
    assert.notEqual(secondLoop[0].type, firstLoop[0].type);
    assert.equal(secondLoop[0].isDiscovered, false);
  }

  test('PT-UT-S28-C01 4エリアへ2地点ずつ配置する', placesTwoSitesInEachArea);
  test('PT-UT-S28-C01 4種の内容を2件ずつ割り当てる', assignsTwoOfEachContentType);
  test('PT-UT-S28-C03 次ループで内容と利用状態を作り直す', changesAssignmentsForNextLoop);
}

describe('PT-UT-PD-S01 PrototypeFestivalDiscovery 配置とループ', registerPrototypeDiscoveryTests);
