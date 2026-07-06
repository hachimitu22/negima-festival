import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  PATROL_TASK_STATES,
  PatrolTask,
} from '../../../../src/gameDomain/mainGameScene/event/patrolTask.js';

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

describe('PT-UT-S01 生成と入力検証', () => {
  it('PT-UT-S01-C01 1地点で初期化する', () => {
    // Arrange
    const destinations = [createLocationA()];

    // Act
    const task = new PatrolTask({
      destinations,
    });
    const snapshot = task.getSnapshot();

    // Assert
    assert.equal(task.isExecuting(), true);
    assert.equal(task.isSucceeded(), false);
    assert.deepEqual(snapshot, {
      state: PATROL_TASK_STATES.EXECUTING,
      destinations: [
        {
          ...createLocationA(),
          isVisited: false,
        },
      ],
    });
  });

  it('PT-UT-S01-C02 3地点の順序を維持する', () => {
    // Arrange
    const destinations = [
      createLocationB(),
      createLocationA(),
      createLocationC(),
    ];

    // Act
    const task = new PatrolTask({
      destinations,
    });
    const snapshot = task.getSnapshot();

    // Assert
    assert.deepEqual(snapshot.destinations, [
      { ...createLocationB(), isVisited: false },
      { ...createLocationA(), isVisited: false },
      { ...createLocationC(), isVisited: false },
    ]);
  });

  it('PT-UT-S01-C03 nullのdestinationsを拒否する', () => {
    // Arrange
    const destinations = null;

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      TypeError,
    );
  });

  it('PT-UT-S01-C04 plain objectのdestinationsを拒否する', () => {
    // Arrange
    const destinations = {};

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      TypeError,
    );
  });

  it('PT-UT-S01-C05 文字列のdestinationsを拒否する', () => {
    // Arrange
    const destinations = 'library_room';

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      TypeError,
    );
  });

  it('PT-UT-S01-C06 0地点を拒否する', () => {
    // Arrange
    const destinations = [];

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      RangeError,
    );
  });

  it('PT-UT-S01-C07 4地点を拒否する', () => {
    // Arrange
    const destinations = [
      createLocationA(),
      createLocationB(),
      createLocationC(),
      createLocation('staff_room', '職員室'),
    ];

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      RangeError,
    );
  });

  it('PT-UT-S01-C08 nullの場所を拒否する', () => {
    // Arrange
    const destinations = [null];

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      TypeError,
    );
  });

  it('PT-UT-S01-C09 IDがない場所を拒否する', () => {
    // Arrange
    const destinations = [{ name: '図書室' }];

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      TypeError,
    );
  });

  it('PT-UT-S01-C10 名前がない場所を拒否する', () => {
    // Arrange
    const destinations = [{ id: 'library_room' }];

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      TypeError,
    );
  });

  it('PT-UT-S01-C11 空のIDを拒否する', () => {
    // Arrange
    const destinations = [{ id: '', name: '図書室' }];

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      TypeError,
    );
  });

  it('PT-UT-S01-C12 空の名前を拒否する', () => {
    // Arrange
    const destinations = [{ id: 'library_room', name: '' }];

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      TypeError,
    );
  });

  it('PT-UT-S01-C13 文字列でないIDを拒否する', () => {
    // Arrange
    const destinations = [{ id: 1, name: '図書室' }];

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      TypeError,
    );
  });

  it('PT-UT-S01-C14 文字列でない名前を拒否する', () => {
    // Arrange
    const destinations = [{ id: 'library_room', name: 1 }];

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      TypeError,
    );
  });

  it('PT-UT-S01-C15 重複した場所IDを拒否する', () => {
    // Arrange
    const destinations = [
      createLocationA(),
      createLocation('library_room', '別の図書室'),
    ];

    // Act
    const createTask = () => new PatrolTask({ destinations });

    // Assert
    assert.throws(
      createTask,
      /Duplicate patrol destination id/,
    );
  });
});

describe('PT-UT-S02 訪問と状態遷移', () => {
  it('PT-UT-S02-C01 対象外の場所を訪問しても変更しない', () => {
    // Arrange
    const task = new PatrolTask({
      destinations: [createLocationA(), createLocationB()],
    });

    // Act
    const result = task.visitLocation(createLocationC().id);
    const snapshot = task.getSnapshot();

    // Assert
    assert.equal(result, false);
    assert.equal(task.isExecuting(), true);
    assert.deepEqual(
      snapshot.destinations.map(destination => destination.isVisited),
      [false, false],
    );
  });

  it('PT-UT-S02-C02 未訪問地点を訪問済みにする', () => {
    // Arrange
    const task = new PatrolTask({
      destinations: [createLocationA(), createLocationB()],
    });

    // Act
    const result = task.visitLocation(createLocationA().id);
    const snapshot = task.getSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(task.isExecuting(), true);
    assert.deepEqual(
      snapshot.destinations.map(destination => destination.isVisited),
      [true, false],
    );
  });

  it('PT-UT-S02-C03 訪問済み地点の再訪問を無視する', () => {
    // Arrange
    const task = new PatrolTask({
      destinations: [createLocationA(), createLocationB()],
    });
    task.visitLocation(createLocationA().id);

    // Act
    const result = task.visitLocation(createLocationA().id);
    const snapshot = task.getSnapshot();

    // Assert
    assert.equal(result, false);
    assert.equal(task.isExecuting(), true);
    assert.deepEqual(
      snapshot.destinations.map(destination => destination.isVisited),
      [true, false],
    );
  });

  it('PT-UT-S02-C04 任意の順序で全地点を訪問して成功する', () => {
    // Arrange
    const task = new PatrolTask({
      destinations: [
        createLocationA(),
        createLocationB(),
        createLocationC(),
      ],
    });

    // Act
    const firstResult = task.visitLocation(createLocationC().id);
    const isExecutingAfterFirstVisit = task.isExecuting();
    const secondResult = task.visitLocation(createLocationA().id);
    const isExecutingAfterSecondVisit = task.isExecuting();
    const finalResult = task.visitLocation(createLocationB().id);
    const snapshot = task.getSnapshot();

    // Assert
    assert.equal(firstResult, true);
    assert.equal(isExecutingAfterFirstVisit, true);
    assert.equal(secondResult, true);
    assert.equal(isExecutingAfterSecondVisit, true);
    assert.equal(finalResult, true);
    assert.equal(task.isExecuting(), false);
    assert.equal(task.isSucceeded(), true);
    assert.deepEqual(
      snapshot.destinations.map(destination => destination.isVisited),
      [true, true, true],
    );
  });

  it('PT-UT-S02-C05 1地点では最初の訪問で成功する', () => {
    // Arrange
    const task = new PatrolTask({
      destinations: [createLocationA()],
    });

    // Act
    const result = task.visitLocation(createLocationA().id);
    const snapshot = task.getSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(task.isExecuting(), false);
    assert.equal(task.isSucceeded(), true);
    assert.equal(snapshot.destinations[0].isVisited, true);
  });

  it('PT-UT-S02-C06 成功後の訪問済み地点を無視する', () => {
    // Arrange
    const task = new PatrolTask({
      destinations: [createLocationA()],
    });
    task.visitLocation(createLocationA().id);

    // Act
    const result = task.visitLocation(createLocationA().id);
    const snapshot = task.getSnapshot();

    // Assert
    assert.equal(result, false);
    assert.equal(task.isSucceeded(), true);
    assert.equal(snapshot.destinations[0].isVisited, true);
  });

  it('PT-UT-S02-C07 成功後の対象外地点を無視する', () => {
    // Arrange
    const task = new PatrolTask({
      destinations: [createLocationA()],
    });
    task.visitLocation(createLocationA().id);

    // Act
    const result = task.visitLocation(createLocationB().id);
    const snapshot = task.getSnapshot();

    // Assert
    assert.equal(result, false);
    assert.equal(task.isSucceeded(), true);
    assert.equal(snapshot.destinations[0].isVisited, true);
  });
});

describe('PT-UT-S03 snapshot', () => {
  it('PT-UT-S03-C01 snapshotからtaskの状態を変更できない', () => {
    // Arrange
    const task = new PatrolTask({
      destinations: [createLocationA(), createLocationB()],
    });
    task.visitLocation(createLocationA().id);
    const snapshot = task.getSnapshot();

    // Act
    snapshot.state = PATROL_TASK_STATES.SUCCEEDED;
    snapshot.destinations.reverse();
    snapshot.destinations[0].id = 'changed';
    snapshot.destinations[0].name = '変更';
    snapshot.destinations[0].isVisited = true;
    const currentSnapshot = task.getSnapshot();

    // Assert
    assert.deepEqual(currentSnapshot, {
      state: PATROL_TASK_STATES.EXECUTING,
      destinations: [
        { ...createLocationA(), isVisited: true },
        { ...createLocationB(), isVisited: false },
      ],
    });
  });
});
