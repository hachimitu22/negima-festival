import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Character } from '../../../src/gameDomain/mainGameScene/character.js';
import { LOCATION_IDS } from '../../../src/gameDomain/mainGameScene/locations.js';
import { RewardSystem } from '../../../src/gameDomain/mainGameScene/rewardSystem.js';
import { Student } from '../../../src/gameDomain/mainGameScene/student.js';
import { Teacher } from '../../../src/gameDomain/mainGameScene/teacher.js';

describe('RS-UT-S01 affection rewards', () => {
  it('RS-UT-S01-C01 applies a conversation result to a student affection value', () => {
    // Arrange
    const student = new Student('生徒', 1, LOCATION_IDS.GYM_ARENA);
    const system = createRewardSystem({ actors: [student] });

    // Act
    const result = system.applyConversationResult(student.id, {
      scriptId: 'greeting',
    });

    // Assert
    assert.equal(result, true);
    assert.equal(student.getSnapshot().affection, 5);
  });

  it('RS-UT-S01-C02 ignores conversation results for teachers', () => {
    // Arrange
    const teacher = new Teacher(
      'teacher-test',
      '教師',
      LOCATION_IDS.STAFF_ROOM,
    );
    const system = createRewardSystem({ actors: [teacher] });

    // Act
    const result = system.applyConversationResult(teacher.id, {
      scriptId: 'teacher-check-in',
    });

    // Assert
    assert.equal(result, false);
  });

  it('RS-UT-S01-C03 applies an affection base change to a student', () => {
    // Arrange
    const student = new Student('生徒', 1, LOCATION_IDS.GYM_ARENA);
    const system = createRewardSystem({ actors: [student] });

    // Act
    const result = system.applyAffection(student.id, 20);

    // Assert
    assert.equal(result, true);
    assert.equal(student.getSnapshot().affection, 20);
  });
});

describe('RS-UT-S02 MahoPay rewards', () => {
  it('RS-UT-S02-C01 adds MahoPay points to the player character', () => {
    // Arrange
    const character = createCharacter();
    const system = createRewardSystem({ character });

    // Act
    const result = system.addMahoPayPoints(100);

    // Assert
    assert.equal(result, true);
    assert.equal(character.getSnapshot().mahoPayPoints, 100);
  });
});

function createRewardSystem({
  character = createCharacter(),
  actors = [],
} = {}) {
  return new RewardSystem({
    character,
    actorsProvider: () => actors,
  });
}

function createCharacter() {
  return new Character(LOCATION_IDS.GYM_FRONT_PARKING, {
    magicPower: {
      current: 100,
      max: 100,
      recoveryPerGameHour: 5,
    },
  });
}
