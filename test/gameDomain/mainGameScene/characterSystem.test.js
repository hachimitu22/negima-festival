import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Actor } from '../../../src/gameDomain/mainGameScene/actor.js';
import { Character } from '../../../src/gameDomain/mainGameScene/character.js';
import { CharacterSystem } from '../../../src/gameDomain/mainGameScene/characterSystem.js';
import { getDefaultGridMap } from '../../../src/gameDomain/mainGameScene/gridMap.js';
import { LOCATION_IDS } from '../../../src/gameDomain/mainGameScene/locations.js';

describe('CS-UT-S01 player movement', () => {
  it('CS-UT-S01-C01 updates the player snapshot and visited locations after map movement', () => {
    // Arrange
    const gridMap = getDefaultGridMap();
    const system = createCharacterSystem({ gridMap });
    const destination = gridMap.getLocationCenter(LOCATION_IDS.GYM_ARENA);

    // Act
    const didMove = system.movePlayerToMapPosition(destination);
    system.update(createUpdateContext({ gridMap, deltaTimeMs: 10000 }));
    const snapshot = system.createSnapshotFragment();
    const visitedLocationIds = system.consumeVisitedPlayerLocationIds();

    // Assert
    assert.equal(didMove, true);
    assert.equal(snapshot.character.location.id, LOCATION_IDS.GYM_ARENA);
    assert.ok(visitedLocationIds.includes(LOCATION_IDS.GYM_ARENA));
  });

  it('CS-UT-S01-C02 starts companion movement toward the same destination', () => {
    // Arrange
    const gridMap = getDefaultGridMap();
    const companion = new Actor(
      'actor-1',
      '同行者',
      LOCATION_IDS.GYM_FRONT_PARKING,
    );
    const system = createCharacterSystem({
      actors: [companion],
      gridMap,
    });
    const destination = gridMap.getLocationCenter(LOCATION_IDS.GYM_ARENA);

    // Act
    const didMove = system.movePlayerToMapPosition(destination, {
      companionActorId: companion.id,
    });
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.equal(didMove, true);
    assert.deepEqual(snapshot.character.movement.destination, destination);
    assert.deepEqual(snapshot.actors[0].movement.destination, destination);
  });
});

describe('CS-UT-S02 actor lookup and spatial subjects', () => {
  it('CS-UT-S02-C01 finds only actors at the player location as talkable', () => {
    // Arrange
    const sameLocationActor = new Actor(
      'actor-1',
      '同じ場所の人物',
      LOCATION_IDS.GYM_FRONT_PARKING,
    );
    const otherLocationActor = new Actor(
      'actor-2',
      '別の場所の人物',
      LOCATION_IDS.GYM_ARENA,
    );
    const system = createCharacterSystem({
      actors: [sameLocationActor, otherLocationActor],
    });

    // Act
    const talkableActor = system.findTalkableActor(sameLocationActor.id);
    const blockedActor = system.findTalkableActor(otherLocationActor.id);

    // Assert
    assert.equal(talkableActor, sameLocationActor);
    assert.equal(blockedActor, null);
  });

  it('CS-UT-S02-C02 returns spatial subjects as read-only models', () => {
    // Arrange
    const actor = new Actor(
      'actor-1',
      '人物',
      LOCATION_IDS.GYM_ARENA,
    );
    const system = createCharacterSystem({
      actors: [actor],
    });

    // Act
    const subjects = system.getSpatialSubjects();
    subjects[0].position.x = 999;
    const nextSubjects = system.getSpatialSubjects();

    // Assert
    assert.equal(nextSubjects.length, 2);
    assert.deepEqual(
      nextSubjects.map(subject => subject.subjectId),
      ['player', actor.id],
    );
    assert.notEqual(nextSubjects[0].position.x, 999);
  });
});

function createCharacterSystem({
  actors = [],
  gridMap = getDefaultGridMap(),
} = {}) {
  return new CharacterSystem({
    playerCharacter: createPlayerCharacter(),
    actors,
    gridMap,
  });
}

function createPlayerCharacter() {
  return new Character(LOCATION_IDS.GYM_FRONT_PARKING, {
    magicPower: {
      current: 100,
      max: 100,
      recoveryPerGameHour: 5,
    },
  });
}

function createUpdateContext({
  gridMap = getDefaultGridMap(),
  deltaTimeMs = 0,
  gameTimeHours = 0,
} = {}) {
  return {
    deltaTimeMs,
    frameCount: 1,
    targetFrameTimeMs: 1000 / 60,
    deltaFrames: deltaTimeMs / (1000 / 60),
    elapsedGameHours: 0,
    gameTimeHours,
    isFestivalEnded: false,
    gridMap,
  };
}
