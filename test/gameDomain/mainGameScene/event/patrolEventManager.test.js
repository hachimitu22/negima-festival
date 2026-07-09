import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Character } from '../../../../src/gameDomain/mainGameScene/character.js';
import {
  EventIdSequence,
} from '../../../../src/gameDomain/mainGameScene/event/eventIdSequence.js';
import {
  PatrolEventManager,
} from '../../../../src/gameDomain/mainGameScene/event/patrolEventManager.js';
import {
  LOCATION_IDS,
} from '../../../../src/gameDomain/mainGameScene/locations.js';

const FESTIVAL_DURATION_HOURS = 72;

function createCharacter() {
  return new Character(LOCATION_IDS.GYM_FRONT_PARKING, {
    magicPower: {
      current: 100,
      max: 100,
      recoveryPerGameHour: 5,
    },
  });
}

function createManager(character = createCharacter()) {
  return {
    character,
    manager: new PatrolEventManager({
      character,
      eventIdSequence: new EventIdSequence(),
      durationHours: FESTIVAL_DURATION_HOURS,
    }),
  };
}

function completePatrol(manager, character) {
  const snapshot = manager.getExecutingEventSnapshot();
  snapshot.destinations.forEach(destination => {
    character.moveToLocation(destination.id);
    manager.visitCurrentLocation();
  });
  return snapshot;
}

describe('PEM-UT-S01 初期イベント', () => {
  it('PEM-UT-S01-C01 生成直後から見回りを実行する', () => {
    // Arrange
    const { manager } = createManager();

    // Act
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(snapshot.id, 0);
    assert.equal(snapshot.type, 'patrol');
    assert.equal(snapshot.state, 'executing');
  });

  it('PEM-UT-S01-C02 見回り先を1地点以上3地点以下にする', () => {
    // Arrange
    const { manager } = createManager();

    // Act
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.ok(snapshot.destinations.length >= 1);
    assert.ok(snapshot.destinations.length <= 3);
  });

  it('PEM-UT-S01-C03 見回り先を重複させない', () => {
    // Arrange
    const { manager } = createManager();

    // Act
    const snapshot = manager.getExecutingEventSnapshot();
    const destinationIds = snapshot.destinations.map(destination => (
      destination.id
    ));

    // Assert
    assert.equal(new Set(destinationIds).size, destinationIds.length);
  });

  it('PEM-UT-S01-C04 現在地を見回り先から除外する', () => {
    // Arrange
    const { character, manager } = createManager();

    // Act
    const snapshot = manager.getExecutingEventSnapshot();
    const destinationIds = snapshot.destinations.map(destination => (
      destination.id
    ));

    // Assert
    assert.equal(destinationIds.includes(character.locationId), false);
  });

  it('PEM-UT-S01-C05 女子トイレを見回り先から除外する', () => {
    // Arrange
    const { manager } = createManager();

    // Act
    const snapshot = manager.getExecutingEventSnapshot();
    const destinationIds = snapshot.destinations.map(destination => (
      destination.id
    ));

    // Assert
    assert.equal(
      destinationIds.includes(LOCATION_IDS.GIRLS_BATHROOM),
      false,
    );
  });

  it('PEM-UT-S01-C06 更衣室を見回り先から除外する', () => {
    // Arrange
    const { manager } = createManager();

    // Act
    const snapshot = manager.getExecutingEventSnapshot();
    const destinationIds = snapshot.destinations.map(destination => (
      destination.id
    ));

    // Assert
    assert.equal(
      destinationIds.includes(LOCATION_IDS.GYM_CHANGING_ROOM),
      false,
    );
  });
});

describe('PEM-UT-S02 場所の訪問と報酬', () => {
  it('PEM-UT-S02-C01 対象外の現在地では進行しない', () => {
    // Arrange
    const { character, manager } = createManager();
    const beforeSnapshot = manager.getExecutingEventSnapshot();
    character.moveToLocation(LOCATION_IDS.GYM_FRONT_PARKING);

    // Act
    const result = manager.visitCurrentLocation();
    const afterSnapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(result, false);
    assert.deepEqual(afterSnapshot, beforeSnapshot);
    assert.equal(character.mahoPayPoints, 0);
  });

  it('PEM-UT-S02-C02 対象の現在地を訪問する', () => {
    // Arrange
    const { character, manager } = createManager();
    const snapshot = manager.getExecutingEventSnapshot();
    character.moveToLocation(snapshot.destinations[0].id);

    // Act
    const result = manager.visitCurrentLocation();

    // Assert
    assert.equal(result, true);
  });

  it('PEM-UT-S02-C03 全地点の訪問完了時に報酬を加算してeventを破棄する', () => {
    // Arrange
    const { character, manager } = createManager();
    const snapshot = manager.getExecutingEventSnapshot();
    const expectedRewardPoints = snapshot.rewardPoints;

    // Act
    completePatrol(manager, character);

    // Assert
    assert.equal(character.mahoPayPoints, expectedRewardPoints);
    assert.equal(manager.getExecutingEventSnapshot(), null);
  });

  it('PEM-UT-S02-C04 完了後に同じ場所を訪問しても報酬を再加算しない', () => {
    // Arrange
    const { character, manager } = createManager();
    const snapshot = completePatrol(manager, character);
    const completedRewardPoints = character.mahoPayPoints;
    character.moveToLocation(snapshot.destinations.at(-1).id);

    // Act
    const result = manager.visitCurrentLocation();

    // Assert
    assert.equal(result, false);
    assert.equal(character.mahoPayPoints, completedRewardPoints);
  });

  it('PEM-UT-S02-C05 指定した場所IDを訪問する', () => {
    // Arrange
    const { manager } = createManager();
    const snapshot = manager.getExecutingEventSnapshot();

    // Act
    const result = manager.visitLocation(snapshot.destinations[0].id);

    // Assert
    assert.equal(result, true);
  });
});

describe('PEM-UT-S03 定期発生', () => {
  it('PEM-UT-S03-C01 発生境界前には新しい見回りを生成しない', () => {
    // Arrange
    const { character, manager } = createManager();
    completePatrol(manager, character);

    // Act
    manager.advanceTo(11.999);

    // Assert
    assert.equal(manager.getExecutingEventSnapshot(), null);
  });

  it('PEM-UT-S03-C02 発生境界で新しい見回りを生成する', () => {
    // Arrange
    const { character, manager } = createManager();
    completePatrol(manager, character);

    // Act
    manager.advanceTo(12);
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(snapshot.id, 1);
    assert.equal(snapshot.state, 'executing');
  });

  it('PEM-UT-S03-C03 実行中の発生境界を見送る', () => {
    // Arrange
    const { character, manager } = createManager();
    manager.advanceTo(12);
    completePatrol(manager, character);

    // Act
    manager.advanceTo(12);

    // Assert
    assert.equal(manager.getExecutingEventSnapshot(), null);
  });

  it('PEM-UT-S03-C04 複数境界を越えても一件だけ生成する', () => {
    // Arrange
    const { character, manager } = createManager();
    completePatrol(manager, character);

    // Act
    manager.advanceTo(36);
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(snapshot.id, 1);
  });

  it('PEM-UT-S03-C05 祭終了時刻には新しい見回りを生成しない', () => {
    // Arrange
    const { character, manager } = createManager();
    manager.advanceTo(60);
    completePatrol(manager, character);

    // Act
    manager.advanceTo(72);

    // Assert
    assert.equal(manager.getExecutingEventSnapshot(), null);
  });
});

describe('PEM-UT-S04 時刻の巻き戻し', () => {
  it('PEM-UT-S04-C01 巻き戻し時に実行中の見回りを破棄する', () => {
    // Arrange
    const { manager } = createManager();

    // Act
    manager.rewindTo(6);

    // Assert
    assert.equal(manager.getExecutingEventSnapshot(), null);
  });

  it('PEM-UT-S04-C02 巻き戻し後の次の境界で見回りを生成する', () => {
    // Arrange
    const { manager } = createManager();
    manager.rewindTo(6);

    // Act
    manager.advanceTo(12);
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(snapshot.id, 1);
  });

  it('PEM-UT-S04-C03 時刻0への巻き戻しでは初期見回りを再生成しない', () => {
    // Arrange
    const { manager } = createManager();
    manager.rewindTo(0);

    // Act
    manager.advanceTo(0);

    // Assert
    assert.equal(manager.getExecutingEventSnapshot(), null);
  });
});
