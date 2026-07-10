import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  INPUT_TYPES,
  TARGET_PREFIXES,
} from '../../../src/gameDomain/actions.js';
import { PlayerControlSystem } from '../../../src/gameDomain/mainGameScene/playerControlSystem.js';

describe('PCS-UT-S01 normal input request conversion', () => {
  it('PCS-UT-S01-C01 converts map-position input to a player movement request', () => {
    // Arrange
    const calls = createCallLog();
    const system = createPlayerControlSystem(calls);

    // Act
    const result = system.update([
      createTargetInput(TARGET_PREFIXES.MAP_POSITION, '10.5,20.5'),
    ]);

    // Assert
    assert.deepEqual(calls.characterMapPositions, [
      {
        x: 10.5,
        y: 20.5,
      },
    ]);
    assert.equal(result.handledCount, 1);
  });

  it('PCS-UT-S01-C02 converts location input to a player location movement request', () => {
    // Arrange
    const calls = createCallLog();
    const system = createPlayerControlSystem(calls);

    // Act
    const result = system.update([
      createTargetInput(TARGET_PREFIXES.LOCATION, 'gym-arena'),
    ]);

    // Assert
    assert.deepEqual(calls.characterLocationIds, ['gym-arena']);
    assert.equal(result.handledCount, 1);
  });

  it('PCS-UT-S01-C03 converts branch-choice input to a branch choice request', () => {
    // Arrange
    const calls = createCallLog();
    const system = createPlayerControlSystem(calls);

    // Act
    const result = system.update([
      createTargetInput(TARGET_PREFIXES.BRANCH_CHOICE, 'choice-a'),
    ]);

    // Assert
    assert.deepEqual(calls.branchChoiceIds, ['choice-a']);
    assert.equal(result.handledCount, 1);
  });

  it('PCS-UT-S01-C04 converts cassiopeia input to a cassiopeia request', () => {
    // Arrange
    const calls = createCallLog();
    const system = createPlayerControlSystem(calls);

    // Act
    const result = system.update([
      {
        type: INPUT_TYPES.TARGET_ACTIVATE,
        targetId: TARGET_PREFIXES.CASSIOPEIA,
      },
    ]);

    // Assert
    assert.equal(calls.cassiopeiaRequestCount, 1);
    assert.equal(result.handledCount, 1);
  });
});

describe('PCS-UT-S02 input blocking and ignored targets', () => {
  it('PCS-UT-S02-C01 does not issue requests when gameplay input is disabled', () => {
    // Arrange
    const calls = createCallLog();
    const system = createPlayerControlSystem(calls);

    // Act
    const result = system.update(
      [createTargetInput(TARGET_PREFIXES.MAP_POSITION, '10.5,20.5')],
      { gameplayInputEnabled: false },
    );

    // Assert
    assert.equal(calls.characterMapPositions.length, 0);
    assert.equal(result.handledCount, 0);
  });

  it('PCS-UT-S02-C02 ignores actor and conversation targets as normal input', () => {
    // Arrange
    const calls = createCallLog();
    const system = createPlayerControlSystem(calls);

    // Act
    const result = system.update([
      createTargetInput(TARGET_PREFIXES.ACTOR, 'student-01'),
      createTargetInput(TARGET_PREFIXES.CONVERSATION_SCENE, 'next'),
    ]);

    // Assert
    assert.deepEqual(calls, createCallLog());
    assert.equal(result.handledCount, 0);
  });
});

function createPlayerControlSystem(calls) {
  return new PlayerControlSystem({
    characterRequests: {
      movePlayerToMapPosition(position) {
        calls.characterMapPositions.push(position);
        return true;
      },
      movePlayerToLocation(locationId) {
        calls.characterLocationIds.push(locationId);
        return true;
      },
    },
    branchRequests: {
      chooseCurrentTask(choiceId) {
        calls.branchChoiceIds.push(choiceId);
        return true;
      },
    },
    cassiopeiaRequests: {
      requestUseCassiopeia() {
        calls.cassiopeiaRequestCount += 1;
        return true;
      },
    },
  });
}

function createCallLog() {
  return {
    characterMapPositions: [],
    characterLocationIds: [],
    branchChoiceIds: [],
    cassiopeiaRequestCount: 0,
  };
}

function createTargetInput(prefix, value) {
  return {
    type: INPUT_TYPES.TARGET_ACTIVATE,
    targetId: `${prefix}:${value}`,
  };
}
