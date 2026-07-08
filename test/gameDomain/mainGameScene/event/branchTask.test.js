import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BRANCH_TASK_STATES,
  BranchTask,
} from '../../../../src/gameDomain/mainGameScene/event/branchTask.js';

function createLocation(id, name) {
  return { id, name };
}

function createLocationA() {
  return createLocation('library_room', 'Library');
}

function createLocationB() {
  return createLocation('staff_room', 'Staff room');
}

function createTask(config = {}) {
  return new BranchTask({
    destination: createLocationA(),
    startHours: 1,
    durationHours: 3,
    ...config,
  });
}

describe('BT-UT-S01 initialization and snapshot', () => {
  it('BT-UT-S01-C01 creates an executing time-limited task', () => {
    // Arrange
    const destination = createLocationA();

    // Act
    const task = new BranchTask({
      destination,
      startHours: 2,
      durationHours: 3,
    });
    const snapshot = task.getSnapshot(2);

    // Assert
    assert.equal(task.isExecuting(), true);
    assert.equal(task.isSucceeded(), false);
    assert.equal(task.isFailed(), false);
    assert.deepEqual(snapshot, {
      destination,
      state: BRANCH_TASK_STATES.EXECUTING,
      startHours: 2,
      durationHours: 3,
      deadlineHours: 5,
      remainingHours: 3,
    });
  });

  it('BT-UT-S01-C02 prevents snapshot mutation from changing task state', () => {
    // Arrange
    const task = new BranchTask({
      destination: createLocationA(),
      startHours: 0,
      durationHours: 4,
    });
    const snapshot = task.getSnapshot(1);

    // Act
    snapshot.destination.id = 'changed';
    snapshot.destination.name = 'Changed';
    snapshot.state = BRANCH_TASK_STATES.SUCCEEDED;
    snapshot.remainingHours = 0;
    const currentSnapshot = task.getSnapshot(1);

    // Assert
    assert.deepEqual(currentSnapshot, {
      destination: createLocationA(),
      state: BRANCH_TASK_STATES.EXECUTING,
      startHours: 0,
      durationHours: 4,
      deadlineHours: 4,
      remainingHours: 3,
    });
  });

  it('BT-UT-S01-C03 calculates remaining hours for fractional times', () => {
    // Arrange
    const task = new BranchTask({
      destination: createLocationA(),
      startHours: 1.5,
      durationHours: 2.25,
    });

    // Act
    const snapshot = task.getSnapshot(2.25);

    // Assert
    assert.equal(snapshot.deadlineHours, 3.75);
    assert.equal(snapshot.remainingHours, 1.5);
  });
});

describe('BT-UT-S02 input validation', () => {
  it('BT-UT-S02-C01 rejects null destination', () => {
    // Arrange
    const createInvalidTask = () => createTask({ destination: null });

    // Act
    // Assert
    assert.throws(createInvalidTask, TypeError);
  });

  it('BT-UT-S02-C02 rejects non-string destination id', () => {
    // Arrange
    const createInvalidTask = () => createTask({
      destination: { id: 1, name: 'Library' },
    });

    // Act
    // Assert
    assert.throws(createInvalidTask, TypeError);
  });

  it('BT-UT-S02-C03 rejects non-string destination name', () => {
    // Arrange
    const createInvalidTask = () => createTask({
      destination: { id: 'library_room', name: 1 },
    });

    // Act
    // Assert
    assert.throws(createInvalidTask, TypeError);
  });

  it('BT-UT-S02-C04 rejects negative start hours', () => {
    // Arrange
    const createInvalidTask = () => createTask({ startHours: -1 });

    // Act
    // Assert
    assert.throws(createInvalidTask, TypeError);
  });

  it('BT-UT-S02-C05 rejects zero duration hours', () => {
    // Arrange
    const createInvalidTask = () => createTask({ durationHours: 0 });

    // Act
    // Assert
    assert.throws(createInvalidTask, RangeError);
  });

  it('BT-UT-S02-C06 rejects negative current hours in advanceTo', () => {
    // Arrange
    const task = createTask();
    const advanceToInvalidTime = () => task.advanceTo(-1);

    // Act
    // Assert
    assert.throws(advanceToInvalidTime, TypeError);
  });

  it('BT-UT-S02-C07 rejects non-finite current hours in getSnapshot', () => {
    // Arrange
    const task = createTask();
    const getInvalidSnapshot = () => task.getSnapshot(Infinity);

    // Act
    // Assert
    assert.throws(getInvalidSnapshot, TypeError);
  });
});

describe('BT-UT-S03 location visits and deadlines', () => {
  it('BT-UT-S03-C01 succeeds when the destination is visited before deadline', () => {
    // Arrange
    const task = createTask();

    // Act
    const result = task.visitLocation(createLocationA().id, 3);

    // Assert
    assert.equal(result, true);
    assert.equal(task.isExecuting(), false);
    assert.equal(task.isSucceeded(), true);
    assert.equal(task.isFailed(), false);
  });

  it('BT-UT-S03-C02 ignores visits to non-destination locations', () => {
    // Arrange
    const task = createTask();

    // Act
    const result = task.visitLocation(createLocationB().id, 3);
    const snapshot = task.getSnapshot(3);

    // Assert
    assert.equal(result, false);
    assert.equal(task.isExecuting(), true);
    assert.equal(snapshot.state, BRANCH_TASK_STATES.EXECUTING);
    assert.equal(snapshot.remainingHours, 1);
  });

  it('BT-UT-S03-C03 fails when visiting the destination exactly at deadline', () => {
    // Arrange
    const task = createTask();

    // Act
    const result = task.visitLocation(createLocationA().id, 4);

    // Assert
    assert.equal(result, false);
    assert.equal(task.isExecuting(), false);
    assert.equal(task.isSucceeded(), false);
    assert.equal(task.isFailed(), true);
  });

  it('BT-UT-S03-C04 does not change state before deadline in advanceTo', () => {
    // Arrange
    const task = createTask();

    // Act
    const result = task.advanceTo(3.99);
    const snapshot = task.getSnapshot(3.99);

    // Assert
    assert.equal(result, false);
    assert.equal(task.isExecuting(), true);
    assert.equal(snapshot.state, BRANCH_TASK_STATES.EXECUTING);
    assert.ok(Math.abs(snapshot.remainingHours - 0.01) < Number.EPSILON * 10);
  });

  it('BT-UT-S03-C05 fails when advanceTo reaches the deadline', () => {
    // Arrange
    const task = createTask();

    // Act
    const result = task.advanceTo(4);

    // Assert
    assert.equal(result, true);
    assert.equal(task.isExecuting(), false);
    assert.equal(task.isSucceeded(), false);
    assert.equal(task.isFailed(), true);
  });

  it('BT-UT-S03-C06 ignores visits and time progression after success', () => {
    // Arrange
    const task = createTask();
    task.visitLocation(createLocationA().id, 3);

    // Act
    const visitResult = task.visitLocation(createLocationA().id, 10);
    const advanceResult = task.advanceTo(10);

    // Assert
    assert.equal(visitResult, false);
    assert.equal(advanceResult, false);
    assert.equal(task.isExecuting(), false);
    assert.equal(task.isSucceeded(), true);
    assert.equal(task.isFailed(), false);
  });
});
