import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PatrolEvent } from '../../../../src/gameDomain/mainGameScene/event/patrolEvent.js';

function createLocation(id, name) {
  return { id, name };
}

function createLocationA() {
  return createLocation('library_room', '図書室');
}

function createLocationB() {
  return createLocation('world_tree', '世界樹');
}

function createLocationC() {
  return createLocation('school_ground', 'グラウンド');
}

describe('PE-UT-S01 生成と公開情報', () => {
  it('PE-UT-S01-C01 1地点のeventを初期化する', () => {
    // Arrange
    const destinations = [createLocationA()];

    // Act
    const event = new PatrolEvent(7, {
      destinations,
    });
    const snapshot = event.getSnapshot();

    // Assert
    assert.equal(event.isExecuting(), true);
    assert.equal(event.isSucceeded(), false);
    assert.deepEqual(snapshot, {
      id: 7,
      type: 'patrol',
      name: '見回り',
      description: '見回り先: 図書室（未訪問）',
      state: 'executing',
      destinations: [
        { ...createLocationA(), isVisited: false },
      ],
      rewardPoints: 100,
    });
  });

  it('PE-UT-S01-C02 3地点分の報酬を確定する', () => {
    // Arrange
    const destinations = [
      createLocationA(),
      createLocationB(),
      createLocationC(),
    ];

    // Act
    const event = new PatrolEvent(7, {
      destinations,
    });
    const snapshot = event.getSnapshot();

    // Assert
    assert.equal(snapshot.rewardPoints, 300);
  });

  it('PE-UT-S01-C03 初期descriptionへ順序と訪問状態を反映する', () => {
    // Arrange
    const destinations = [createLocationB(), createLocationA()];

    // Act
    const event = new PatrolEvent(7, {
      destinations,
    });
    const snapshot = event.getSnapshot();

    // Assert
    assert.equal(
      snapshot.description,
      '見回り先: 世界樹（未訪問）、図書室（未訪問）',
    );
    assert.deepEqual(
      snapshot.destinations.map(destination => destination.id),
      [createLocationB().id, createLocationA().id],
    );
  });
});

describe('PE-UT-S02 訪問と状態遷移', () => {
  it('PE-UT-S02-C01 対象外の訪問ではeventの進捗を変更しない', () => {
    // Arrange
    const event = new PatrolEvent(7, {
      destinations: [createLocationA(), createLocationB()],
    });
    const beforeSnapshot = event.getSnapshot();

    // Act
    const result = event.visitLocation(createLocationC().id);
    const afterSnapshot = event.getSnapshot();

    // Assert
    assert.equal(result, false);
    assert.equal(event.isExecuting(), true);
    assert.deepEqual(afterSnapshot, beforeSnapshot);
  });

  it('PE-UT-S02-C02 訪問進捗をsnapshotへ反映する', () => {
    // Arrange
    const event = new PatrolEvent(7, {
      destinations: [createLocationA(), createLocationB()],
    });

    // Act
    const result = event.visitLocation(createLocationA().id);
    const snapshot = event.getSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(event.isExecuting(), true);
    assert.deepEqual(
      snapshot.destinations.map(destination => destination.isVisited),
      [true, false],
    );
    assert.equal(
      snapshot.description,
      '見回り先: 図書室（訪問済み）、世界樹（未訪問）',
    );
  });

  it('PE-UT-S02-C03 最後の訪問で成功する', () => {
    // Arrange
    const event = new PatrolEvent(7, {
      destinations: [createLocationA(), createLocationB()],
    });
    event.visitLocation(createLocationA().id);

    // Act
    const result = event.visitLocation(createLocationB().id);
    const snapshot = event.getSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(event.isExecuting(), false);
    assert.equal(event.isSucceeded(), true);
    assert.deepEqual(
      snapshot.destinations.map(destination => destination.isVisited),
      [true, true],
    );
    assert.equal(snapshot.state, 'succeeded');
  });

  it('PE-UT-S02-C04 進行によって報酬額を変更しない', () => {
    // Arrange
    const event = new PatrolEvent(7, {
      destinations: [createLocationA(), createLocationB()],
    });

    // Act
    const initialRewardPoints = event.getSnapshot().rewardPoints;
    event.visitLocation(createLocationA().id);
    const progressingRewardPoints = event.getSnapshot().rewardPoints;
    event.visitLocation(createLocationB().id);
    const succeededRewardPoints = event.getSnapshot().rewardPoints;

    // Assert
    assert.equal(initialRewardPoints, 200);
    assert.equal(progressingRewardPoints, 200);
    assert.equal(succeededRewardPoints, 200);
  });
});

describe('PE-UT-S03 報酬の請求', () => {
  it('PE-UT-S03-C01 成功前は報酬を請求できない', () => {
    // Arrange
    const event = new PatrolEvent(7, {
      destinations: [createLocationA()],
    });

    // Act
    const rewardPoints = event.claimRewardPoints();

    // Assert
    assert.equal(rewardPoints, null);
  });

  it('PE-UT-S03-C02 成功後の初回請求で報酬を取得する', () => {
    // Arrange
    const event = new PatrolEvent(7, {
      destinations: [createLocationA(), createLocationB()],
    });
    event.visitLocation(createLocationA().id);
    event.visitLocation(createLocationB().id);

    // Act
    const rewardPoints = event.claimRewardPoints();

    // Assert
    assert.equal(rewardPoints, 200);
  });

  it('PE-UT-S03-C03 報酬を二回請求できない', () => {
    // Arrange
    const event = new PatrolEvent(7, {
      destinations: [createLocationA()],
    });
    event.visitLocation(createLocationA().id);
    event.claimRewardPoints();

    // Act
    const rewardPoints = event.claimRewardPoints();

    // Assert
    assert.equal(rewardPoints, null);
  });
});

describe('PE-UT-S04 snapshot', () => {
  it('PE-UT-S04-C01 snapshotからeventの状態を変更できない', () => {
    // Arrange
    const event = new PatrolEvent(7, {
      destinations: [createLocationA(), createLocationB()],
    });
    event.visitLocation(createLocationA().id);
    const snapshot = event.getSnapshot();

    // Act
    snapshot.id = 99;
    snapshot.type = 'changed';
    snapshot.name = '変更';
    snapshot.description = '変更';
    snapshot.state = 'succeeded';
    snapshot.destinations.reverse();
    snapshot.destinations[0].id = 'changed';
    snapshot.destinations[0].name = '変更';
    snapshot.destinations[0].isVisited = true;
    snapshot.rewardPoints = 0;
    const currentSnapshot = event.getSnapshot();

    // Assert
    assert.deepEqual(currentSnapshot, {
      id: 7,
      type: 'patrol',
      name: '見回り',
      description: '見回り先: 図書室（訪問済み）、世界樹（未訪問）',
      state: 'executing',
      destinations: [
        { ...createLocationA(), isVisited: true },
        { ...createLocationB(), isVisited: false },
      ],
      rewardPoints: 200,
    });
  });
});
