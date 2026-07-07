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

  it('BT-UT-S01-C02 snapshot cannot mutate task state', () => {
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
});

describe('BT-UT-S02 location visit and timeout', () => {
  it('BT-UT-S02-C01 succeeds when the destination is visited before deadline', () => {
    // Arrange
    const task = new BranchTask({
      destination: createLocationA(),
      startHours: 1,
      durationHours: 3,
    });

    // Act
    const result = task.visitLocation(createLocationA().id, 3);

    // Assert
    assert.equal(result, true);
    assert.equal(task.isExecuting(), false);
    assert.equal(task.isSucceeded(), true);
    assert.equal(task.isFailed(), false);
  });

  it('BT-UT-S02-C02 ignores visits to non-destination locations', () => {
    // Arrange
    const task = new BranchTask({
      destination: createLocationA(),
      startHours: 1,
      durationHours: 3,
    });

    // Act
    const result = task.visitLocation(createLocationB().id, 3);
    const snapshot = task.getSnapshot(3);

    // Assert
    assert.equal(result, false);
    assert.equal(task.isExecuting(), true);
    assert.equal(snapshot.state, BRANCH_TASK_STATES.EXECUTING);
    assert.equal(snapshot.remainingHours, 1);
  });

  it('BT-UT-S02-C03 fails when the deadline is reached', () => {
    // Arrange
    const task = new BranchTask({
      destination: createLocationA(),
      startHours: 1,
      durationHours: 3,
    });

    // Act
    const result = task.advanceTo(4);
    const visitAfterDeadlineResult = task.visitLocation(createLocationA().id, 4);

    // Assert
    assert.equal(result, true);
    assert.equal(visitAfterDeadlineResult, false);
    assert.equal(task.isExecuting(), false);
    assert.equal(task.isSucceeded(), false);
    assert.equal(task.isFailed(), true);
  });
});
