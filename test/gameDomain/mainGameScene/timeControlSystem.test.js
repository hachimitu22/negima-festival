import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Character } from '../../../src/gameDomain/mainGameScene/character.js';
import { LOCATION_IDS } from '../../../src/gameDomain/mainGameScene/locations.js';
import { TimeControlSystem } from '../../../src/gameDomain/mainGameScene/timeControlSystem.js';

describe('TCS-UT-S01 game time progression', () => {
  it('TCS-UT-S01-C01 advances game time from frame elapsed time', () => {
    // Arrange
    const system = createTimeControlSystem({
      hoursPerRealSecond: 0.5,
    });

    // Act
    const result = system.advance({
      deltaTimeMs: 2000,
    });
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.equal(result.elapsedGameHours, 1);
    assert.equal(result.currentHours, 1);
    assert.equal(snapshot.gameTime.currentHours, 1);
    assert.equal(snapshot.gameTime.isEnded, false);
  });

  it('TCS-UT-S01-C02 caps game time at the festival duration', () => {
    // Arrange
    const system = createTimeControlSystem({
      durationHours: 2,
      hoursPerRealSecond: 1,
    });

    // Act
    const result = system.advance({
      deltaTimeMs: 3000,
    });
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.equal(result.elapsedGameHours, 2);
    assert.equal(result.currentHours, 2);
    assert.equal(result.isEnded, true);
    assert.equal(snapshot.gameTime.currentHours, 2);
    assert.equal(snapshot.gameTime.isEnded, true);
  });

  it('TCS-UT-S01-C03 does not advance time after the festival has ended', () => {
    // Arrange
    const system = createTimeControlSystem({
      durationHours: 2,
      hoursPerRealSecond: 1,
    });
    system.advance({
      deltaTimeMs: 3000,
    });

    // Act
    const result = system.advance({
      deltaTimeMs: 1000,
    });
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.equal(result.elapsedGameHours, 0);
    assert.equal(result.currentHours, 2);
    assert.equal(snapshot.gameTime.currentHours, 2);
    assert.equal(snapshot.gameTime.isEnded, true);
  });
});

describe('TCS-UT-S02 cassiopeia rewind', () => {
  it('TCS-UT-S02-C01 spends MP, rewinds time, and increments the loop count', () => {
    // Arrange
    const character = createCharacter({
      magicPowerCurrent: 300,
    });
    const system = createTimeControlSystem({
      character,
      hoursPerRealSecond: 1,
    });
    system.advance({
      deltaTimeMs: 30000,
    });

    // Act
    const result = system.useCassiopeia();
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.deepEqual(result, {
      currentHours: 6,
    });
    assert.equal(snapshot.gameTime.currentHours, 6);
    assert.equal(snapshot.loop.count, 2);
    assert.equal(snapshot.loop.cassiopeiaMagicPowerCost, 288);
    assert.equal(character.getSnapshot().magicPower.current, 12);
  });

  it('TCS-UT-S02-C02 does not change state when MP is insufficient', () => {
    // Arrange
    const character = createCharacter({
      magicPowerCurrent: 287,
    });
    const system = createTimeControlSystem({
      character,
      hoursPerRealSecond: 1,
    });
    system.advance({
      deltaTimeMs: 30000,
    });
    const beforeSnapshot = system.createSnapshotFragment();

    // Act
    const result = system.useCassiopeia();
    const afterSnapshot = system.createSnapshotFragment();

    // Assert
    assert.equal(result, false);
    assert.deepEqual(afterSnapshot, beforeSnapshot);
    assert.equal(character.getSnapshot().magicPower.current, 287);
  });

  it('TCS-UT-S02-C03 rewinds to zero when current time is below 24 hours', () => {
    // Arrange
    const character = createCharacter({
      magicPowerCurrent: 300,
    });
    const system = createTimeControlSystem({
      character,
      hoursPerRealSecond: 1,
    });
    system.advance({
      deltaTimeMs: 10000,
    });

    // Act
    const result = system.useCassiopeia();
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.deepEqual(result, {
      currentHours: 0,
    });
    assert.equal(snapshot.gameTime.currentHours, 0);
    assert.equal(snapshot.loop.count, 2);
    assert.equal(character.getSnapshot().magicPower.current, 12);
  });
});

describe('TCS-UT-S03 update context', () => {
  it('TCS-UT-S03-C01 creates an update context fragment from frame and current time', () => {
    // Arrange
    const system = createTimeControlSystem({
      hoursPerRealSecond: 0.5,
    });
    system.advance({
      deltaTimeMs: 2000,
    });

    // Act
    const context = system.createUpdateContextFragment({
      deltaTimeMs: 1000,
      frameCount: 2,
      targetFrameTimeMs: 1000 / 60,
    });

    // Assert
    assert.equal(context.deltaTimeMs, 1000);
    assert.equal(context.frameCount, 2);
    assert.equal(context.targetFrameTimeMs, 1000 / 60);
    assert.ok(Math.abs(context.deltaFrames - 60) < 1e-12);
    assert.equal(context.gameTimeHours, 1);
    assert.equal(context.isFestivalEnded, false);
  });
});

function createTimeControlSystem({
  character = createCharacter(),
  durationHours = 72,
  hoursPerRealSecond = 0.5,
  timeTravelHours = 24,
} = {}) {
  return new TimeControlSystem({
    character,
    durationHours,
    hoursPerRealSecond,
    timeTravelHours,
  });
}

function createCharacter({
  magicPowerCurrent = 300,
} = {}) {
  return new Character(LOCATION_IDS.GYM_FRONT_PARKING, {
    magicPower: {
      current: magicPowerCurrent,
      max: 300,
      recoveryPerGameHour: 5,
    },
  });
}
