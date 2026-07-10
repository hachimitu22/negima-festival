import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LocationSystem } from '../../../src/gameDomain/mainGameScene/locationSystem.js';

describe('LS-UT-S01 spatial versions and location visit requests', () => {
  it('LS-UT-S01-C01 consumes visit sources and issues requests when a version changes', () => {
    // Arrange
    const calls = createCallLog();
    const system = createLocationSystem(calls, {
      characters: () => {
        calls.sourceKeys.push('characters');
        return ['library_room', 'staff_room', 'library_room'];
      },
    });

    // Act
    const result = system.update({
      spatialVersions: {
        characters: 1,
      },
    });

    // Assert
    assert.deepEqual(calls.sourceKeys, ['characters']);
    assert.deepEqual(calls.locationVisits, [['library_room', 'staff_room']]);
    assert.deepEqual(result.changedSpatialKeys, ['characters']);
    assert.deepEqual(result.visitedLocationIds, ['library_room', 'staff_room']);
  });

  it('LS-UT-S01-C02 does not consume visit sources when versions are unchanged', () => {
    // Arrange
    const calls = createCallLog();
    const system = createLocationSystem(calls, {
      characters: () => {
        calls.sourceKeys.push('characters');
        return ['library_room'];
      },
    });
    system.update({
      spatialVersions: {
        characters: 1,
      },
    });
    calls.sourceKeys.length = 0;
    calls.locationVisits.length = 0;

    // Act
    const result = system.update({
      spatialVersions: {
        characters: 1,
      },
    });

    // Assert
    assert.deepEqual(calls.sourceKeys, []);
    assert.deepEqual(calls.locationVisits, []);
    assert.deepEqual(result.changedSpatialKeys, []);
    assert.deepEqual(result.visitedLocationIds, []);
  });

  it('LS-UT-S01-C03 consumes only sources whose versions changed', () => {
    // Arrange
    const calls = createCallLog();
    const system = createLocationSystem(calls, {
      characters: () => {
        calls.sourceKeys.push('characters');
        return ['library_room'];
      },
      worldObjects: () => {
        calls.sourceKeys.push('worldObjects');
        return ['world_tree'];
      },
    });
    system.update({
      spatialVersions: {
        characters: 1,
        worldObjects: 1,
      },
    });
    calls.sourceKeys.length = 0;
    calls.locationVisits.length = 0;

    // Act
    const result = system.update({
      spatialVersions: {
        characters: 1,
        worldObjects: 2,
      },
    });

    // Assert
    assert.deepEqual(calls.sourceKeys, ['worldObjects']);
    assert.deepEqual(calls.locationVisits, [['world_tree']]);
    assert.deepEqual(result.changedSpatialKeys, ['worldObjects']);
    assert.deepEqual(result.visitedLocationIds, ['world_tree']);
  });
});

function createLocationSystem(calls, visitSources) {
  return new LocationSystem({
    visitSources,
    locationRequests: {
      visitLocations(locationIds) {
        calls.locationVisits.push(locationIds);
      },
    },
  });
}

function createCallLog() {
  return {
    locationVisits: [],
    sourceKeys: [],
  };
}
