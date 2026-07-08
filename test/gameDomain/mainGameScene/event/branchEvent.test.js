import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  BRANCH_EVENT_STATES,
  BranchEvent,
} from '../../../../src/gameDomain/mainGameScene/event/branchEvent.js';
import {
  BRANCH_TASK_STATES,
} from '../../../../src/gameDomain/mainGameScene/event/branchTask.js';

const TASK_IDS = Object.freeze({
  ROOT: 'root',
  SUCCESS: 'success',
  FAILURE: 'failure',
  FINAL: 'final',
  DECIDE: 'decide',
});

const CHOICE_IDS = Object.freeze({
  SUCCESS: 'success-choice',
  FAILURE: 'failure-choice',
});

function createLocation(id, name) {
  return { id, name };
}

function createLocationA() {
  return createLocation('library_room', 'Library');
}

function createLocationB() {
  return createLocation('staff_room', 'Staff room');
}

function createLocationC() {
  return createLocation('rest_area', 'Rest area');
}

function createLocationD() {
  return createLocation('world_tree', 'World tree');
}

function createTasks() {
  return [
    {
      id: TASK_IDS.ROOT,
      title: 'Root task',
      destination: createLocationA(),
      durationHours: 2,
      branches: {
        succeeded: TASK_IDS.SUCCESS,
        failed: TASK_IDS.FAILURE,
      },
    },
    {
      id: TASK_IDS.SUCCESS,
      title: 'Success task',
      destination: createLocationB(),
      durationHours: 3,
      branches: {
        succeeded: TASK_IDS.FINAL,
        failed: TASK_IDS.FAILURE,
      },
    },
    {
      id: TASK_IDS.FAILURE,
      title: 'Failure task',
      destination: createLocationC(),
      durationHours: 4,
    },
    {
      id: TASK_IDS.FINAL,
      title: 'Final task',
      destination: createLocationD(),
      durationHours: 5,
    },
  ];
}

function createEvent() {
  return new BranchEvent(7, {
    type: 'test-branch',
    name: 'Test branch event',
    tasks: createTasks(),
    startTaskId: TASK_IDS.ROOT,
    startHours: 0,
  });
}

function createChoiceEvent() {
  return new BranchEvent(8, {
    type: 'test-choice-branch',
    name: 'Test choice branch event',
    tasks: [
      {
        id: TASK_IDS.DECIDE,
        title: 'Decide task',
        choices: [
          {
            id: CHOICE_IDS.SUCCESS,
            title: 'Choose success',
            result: BRANCH_TASK_STATES.SUCCEEDED,
          },
          {
            id: CHOICE_IDS.FAILURE,
            title: 'Choose failure',
            result: BRANCH_TASK_STATES.FAILED,
          },
        ],
        branches: {
          succeeded: TASK_IDS.SUCCESS,
          failed: TASK_IDS.FAILURE,
        },
      },
      {
        id: TASK_IDS.SUCCESS,
        title: 'Success task',
        destination: createLocationB(),
        durationHours: 3,
      },
      {
        id: TASK_IDS.FAILURE,
        title: 'Failure task',
        destination: createLocationC(),
        durationHours: 4,
      },
    ],
    startTaskId: TASK_IDS.DECIDE,
    startHours: 0,
  });
}

describe('BE-UT-S01 success and failure branches', () => {
  it('BE-UT-S01-C01 advances to the success branch when the task succeeds', () => {
    // Arrange
    const event = createEvent();

    // Act
    const result = event.visitLocation(createLocationA().id, 1);
    const snapshot = event.getSnapshot(1);

    // Assert
    assert.equal(result, true);
    assert.equal(event.isExecuting(), true);
    assert.equal(snapshot.type, 'test-branch');
    assert.equal(snapshot.name, 'Test branch event');
    assert.equal(snapshot.state, BRANCH_EVENT_STATES.EXECUTING);
    assert.equal(snapshot.stepIndex, 1);
    assert.equal(snapshot.stepCount, 3);
    assert.equal(snapshot.currentTask.id, TASK_IDS.SUCCESS);
    assert.equal(snapshot.currentTask.destination.id, createLocationB().id);
    assert.deepEqual(snapshot.lastResult, {
      taskId: TASK_IDS.ROOT,
      result: BRANCH_TASK_STATES.SUCCEEDED,
    });
  });

  it('BE-UT-S01-C02 advances to the failure branch when the task times out', () => {
    // Arrange
    const event = createEvent();

    // Act
    const result = event.advanceTo(2);
    const snapshot = event.getSnapshot(2);

    // Assert
    assert.equal(result, true);
    assert.equal(event.isExecuting(), true);
    assert.equal(snapshot.stepIndex, 1);
    assert.equal(snapshot.currentTask.id, TASK_IDS.FAILURE);
    assert.equal(snapshot.currentTask.destination.id, createLocationC().id);
    assert.deepEqual(snapshot.lastResult, {
      taskId: TASK_IDS.ROOT,
      result: BRANCH_TASK_STATES.FAILED,
    });
  });
});

describe('BE-UT-S02 multi-step chain', () => {
  it('BE-UT-S02-C01 completes after the final branch task resolves', () => {
    // Arrange
    const event = createEvent();

    // Act
    event.visitLocation(createLocationA().id, 1);
    event.visitLocation(createLocationB().id, 2);
    const result = event.visitLocation(createLocationD().id, 3);
    const snapshot = event.getSnapshot(3);

    // Assert
    assert.equal(result, true);
    assert.equal(event.isExecuting(), false);
    assert.equal(event.isCompleted(), true);
    assert.equal(snapshot.state, BRANCH_EVENT_STATES.COMPLETED);
    assert.equal(snapshot.stepIndex, 3);
    assert.equal(snapshot.stepCount, 3);
    assert.equal(snapshot.currentTask, null);
    assert.deepEqual(snapshot.lastResult, {
      taskId: TASK_IDS.FINAL,
      result: BRANCH_TASK_STATES.SUCCEEDED,
    });
  });

  it('BE-UT-S02-C02 can branch from a later step failure', () => {
    // Arrange
    const event = createEvent();

    // Act
    event.visitLocation(createLocationA().id, 1);
    const result = event.advanceTo(4);
    const snapshot = event.getSnapshot(4);

    // Assert
    assert.equal(result, true);
    assert.equal(event.isExecuting(), true);
    assert.equal(snapshot.stepIndex, 2);
    assert.equal(snapshot.currentTask.id, TASK_IDS.FAILURE);
    assert.equal(snapshot.currentTask.destination.id, createLocationC().id);
    assert.deepEqual(snapshot.lastResult, {
      taskId: TASK_IDS.SUCCESS,
      result: BRANCH_TASK_STATES.FAILED,
    });
  });
});

describe('BE-UT-S03 choice branches', () => {
  it('BE-UT-S03-C01 exposes choices in the current task snapshot', () => {
    // Arrange
    const event = createChoiceEvent();

    // Act
    const snapshot = event.getSnapshot(0);

    // Assert
    assert.equal(snapshot.currentTask.id, TASK_IDS.DECIDE);
    assert.deepEqual(snapshot.currentTask.choices, [
      {
        id: CHOICE_IDS.SUCCESS,
        title: 'Choose success',
      },
      {
        id: CHOICE_IDS.FAILURE,
        title: 'Choose failure',
      },
    ]);
  });

  it('BE-UT-S03-C02 advances to the selected success branch', () => {
    // Arrange
    const event = createChoiceEvent();

    // Act
    const result = event.choose(CHOICE_IDS.SUCCESS, 1);
    const snapshot = event.getSnapshot(1);

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.currentTask.id, TASK_IDS.SUCCESS);
    assert.deepEqual(snapshot.lastResult, {
      taskId: TASK_IDS.DECIDE,
      result: BRANCH_TASK_STATES.SUCCEEDED,
      choiceId: CHOICE_IDS.SUCCESS,
    });
  });

  it('BE-UT-S03-C03 ignores an unknown choice id', () => {
    // Arrange
    const event = createChoiceEvent();

    // Act
    const result = event.choose('unknown-choice', 1);
    const snapshot = event.getSnapshot(1);

    // Assert
    assert.equal(result, false);
    assert.equal(snapshot.currentTask.id, TASK_IDS.DECIDE);
    assert.equal(snapshot.stepIndex, 0);
    assert.equal(snapshot.lastResult, null);
  });
});
