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

function createRootTask(overrides = {}) {
  return {
    id: TASK_IDS.ROOT,
    title: 'Root task',
    destination: createLocationA(),
    durationHours: 2,
    branches: {
      [BRANCH_TASK_STATES.SUCCEEDED]: TASK_IDS.SUCCESS,
      [BRANCH_TASK_STATES.FAILED]: TASK_IDS.FAILURE,
    },
    ...overrides,
  };
}

function createSuccessTask(overrides = {}) {
  return {
    id: TASK_IDS.SUCCESS,
    title: 'Success task',
    destination: createLocationB(),
    durationHours: 3,
    branches: {
      [BRANCH_TASK_STATES.SUCCEEDED]: TASK_IDS.FINAL,
      [BRANCH_TASK_STATES.FAILED]: TASK_IDS.FAILURE,
    },
    ...overrides,
  };
}

function createFailureTask(overrides = {}) {
  return {
    id: TASK_IDS.FAILURE,
    title: 'Failure task',
    destination: createLocationC(),
    durationHours: 4,
    ...overrides,
  };
}

function createFinalTask(overrides = {}) {
  return {
    id: TASK_IDS.FINAL,
    title: 'Final task',
    destination: createLocationD(),
    durationHours: 5,
    ...overrides,
  };
}

function createLocationTasks() {
  return [
    createRootTask(),
    createSuccessTask(),
    createFailureTask(),
    createFinalTask(),
  ];
}

function createEvent(config = {}) {
  return new BranchEvent(7, {
    type: 'test-branch',
    name: 'Test branch event',
    tasks: createLocationTasks(),
    startTaskId: TASK_IDS.ROOT,
    startHours: 0,
    ...config,
  });
}

function createChoiceTask(overrides = {}) {
  return {
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
      [BRANCH_TASK_STATES.SUCCEEDED]: TASK_IDS.SUCCESS,
      [BRANCH_TASK_STATES.FAILED]: TASK_IDS.FAILURE,
    },
    ...overrides,
  };
}

function createChoiceEvent(config = {}) {
  return createEvent({
    id: 8,
    type: 'test-choice-branch',
    name: 'Test choice branch event',
    tasks: [
      createChoiceTask(),
      createSuccessTask({ branches: undefined }),
      createFailureTask(),
    ],
    startTaskId: TASK_IDS.DECIDE,
    ...config,
  });
}

function completeEvent(event) {
  event.visitLocation(createLocationA().id, 1);
  event.visitLocation(createLocationB().id, 2);
  event.visitLocation(createLocationD().id, 3);
}

describe('BE-UT-S01 construction and validation', () => {
  it('BE-UT-S01-C01 initializes an event with valid location tasks', () => {
    // Arrange

    // Act
    const event = createEvent();
    const snapshot = event.getSnapshot(0);

    // Assert
    assert.equal(event.isExecuting(), true);
    assert.equal(event.isCompleted(), false);
    assert.equal(snapshot.id, 7);
    assert.equal(snapshot.type, 'test-branch');
    assert.equal(snapshot.name, 'Test branch event');
    assert.equal(snapshot.state, BRANCH_EVENT_STATES.EXECUTING);
    assert.equal(snapshot.currentTask.id, TASK_IDS.ROOT);
    assert.equal(snapshot.stepIndex, 0);
    assert.equal(snapshot.stepCount, 3);
  });

  it('BE-UT-S01-C02 rejects empty tasks', () => {
    // Arrange
    const createInvalidEvent = () => createEvent({ tasks: [] });

    // Act
    // Assert
    assert.throws(createInvalidEvent, TypeError);
  });

  it('BE-UT-S01-C03 rejects duplicate task ids', () => {
    // Arrange
    const createInvalidEvent = () => createEvent({
      tasks: [
        createRootTask(),
        createRootTask(),
      ],
    });

    // Act
    // Assert
    assert.throws(createInvalidEvent, Error);
  });

  it('BE-UT-S01-C04 rejects an unknown start task id', () => {
    // Arrange
    const createInvalidEvent = () => createEvent({
      tasks: [createRootTask({ branches: undefined })],
      startTaskId: 'unknown',
    });

    // Act
    // Assert
    assert.throws(createInvalidEvent, Error);
  });

  it('BE-UT-S01-C05 rejects an unknown branch target task id', () => {
    // Arrange
    const createInvalidEvent = () => createEvent({
      tasks: [
        createRootTask({
          branches: {
            [BRANCH_TASK_STATES.SUCCEEDED]: 'unknown',
          },
        }),
      ],
    });

    // Act
    // Assert
    assert.throws(createInvalidEvent, Error);
  });

  it('BE-UT-S01-C06 rejects a reachable branch cycle', () => {
    // Arrange
    const createInvalidEvent = () => createEvent({
      tasks: [
        createRootTask({
          branches: {
            [BRANCH_TASK_STATES.SUCCEEDED]: TASK_IDS.ROOT,
          },
        }),
      ],
    });

    // Act
    // Assert
    assert.throws(createInvalidEvent, Error);
  });

  it('BE-UT-S01-C07 rejects a choice with an invalid result', () => {
    // Arrange
    const createInvalidEvent = () => createChoiceEvent({
      tasks: [
        createChoiceTask({
          choices: [
            {
              id: CHOICE_IDS.SUCCESS,
              title: 'Invalid result',
              result: 'unknown',
            },
          ],
        }),
      ],
    });

    // Act
    // Assert
    assert.throws(createInvalidEvent, TypeError);
  });
});

describe('BE-UT-S02 location task branches', () => {
  it('BE-UT-S02-C01 advances to the success branch when the task succeeds', () => {
    // Arrange
    const event = createEvent();

    // Act
    const result = event.visitLocation(createLocationA().id, 1);
    const snapshot = event.getSnapshot(1);

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.currentTask.id, TASK_IDS.SUCCESS);
    assert.equal(snapshot.currentTask.destination.id, createLocationB().id);
    assert.equal(snapshot.stepIndex, 1);
    assert.deepEqual(snapshot.lastResult, {
      taskId: TASK_IDS.ROOT,
      result: BRANCH_TASK_STATES.SUCCEEDED,
    });
  });

  it('BE-UT-S02-C02 advances to the failure branch when the task times out', () => {
    // Arrange
    const event = createEvent();

    // Act
    const result = event.advanceTo(2);
    const snapshot = event.getSnapshot(2);

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.currentTask.id, TASK_IDS.FAILURE);
    assert.equal(snapshot.currentTask.destination.id, createLocationC().id);
    assert.deepEqual(snapshot.lastResult, {
      taskId: TASK_IDS.ROOT,
      result: BRANCH_TASK_STATES.FAILED,
    });
  });

  it('BE-UT-S02-C03 ignores visits to non-destination locations', () => {
    // Arrange
    const event = createEvent();

    // Act
    const result = event.visitLocation(createLocationB().id, 1);
    const snapshot = event.getSnapshot(1);

    // Assert
    assert.equal(result, false);
    assert.equal(snapshot.currentTask.id, TASK_IDS.ROOT);
    assert.equal(snapshot.stepIndex, 0);
    assert.equal(snapshot.lastResult, null);
  });

  it('BE-UT-S02-C04 can branch from a later step failure', () => {
    // Arrange
    const event = createEvent();
    event.visitLocation(createLocationA().id, 1);

    // Act
    const result = event.advanceTo(4);
    const snapshot = event.getSnapshot(4);

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.currentTask.id, TASK_IDS.FAILURE);
    assert.deepEqual(snapshot.lastResult, {
      taskId: TASK_IDS.SUCCESS,
      result: BRANCH_TASK_STATES.FAILED,
    });
  });

  it('BE-UT-S02-C05 completes after the final task resolves', () => {
    // Arrange
    const event = createEvent();
    event.visitLocation(createLocationA().id, 1);
    event.visitLocation(createLocationB().id, 2);

    // Act
    const result = event.visitLocation(createLocationD().id, 3);
    const snapshot = event.getSnapshot(3);

    // Assert
    assert.equal(result, true);
    assert.equal(event.isExecuting(), false);
    assert.equal(event.isCompleted(), true);
    assert.equal(snapshot.state, BRANCH_EVENT_STATES.COMPLETED);
    assert.equal(snapshot.currentTask, null);
    assert.equal(snapshot.stepIndex, 3);
  });

  it('BE-UT-S02-C06 ignores visits and time progression after completion', () => {
    // Arrange
    const event = createEvent();
    completeEvent(event);

    // Act
    const visitResult = event.visitLocation(createLocationD().id, 10);
    const advanceResult = event.advanceTo(10);
    const snapshot = event.getSnapshot(10);

    // Assert
    assert.equal(visitResult, false);
    assert.equal(advanceResult, false);
    assert.equal(snapshot.state, BRANCH_EVENT_STATES.COMPLETED);
    assert.equal(snapshot.currentTask, null);
  });
});

describe('BE-UT-S03 choice task branches', () => {
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
    assert.equal('result' in snapshot.currentTask.choices[0], false);
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

  it('BE-UT-S03-C03 advances to the selected failure branch', () => {
    // Arrange
    const event = createChoiceEvent();

    // Act
    const result = event.choose(CHOICE_IDS.FAILURE, 1);
    const snapshot = event.getSnapshot(1);

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.currentTask.id, TASK_IDS.FAILURE);
    assert.deepEqual(snapshot.lastResult, {
      taskId: TASK_IDS.DECIDE,
      result: BRANCH_TASK_STATES.FAILED,
      choiceId: CHOICE_IDS.FAILURE,
    });
  });

  it('BE-UT-S03-C04 ignores an unknown choice id', () => {
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

  it('BE-UT-S03-C05 ignores location visits and time progression on choice tasks', () => {
    // Arrange
    const event = createChoiceEvent();

    // Act
    const visitResult = event.visitLocation(createLocationA().id, 10);
    const advanceResult = event.advanceTo(10);
    const snapshot = event.getSnapshot(10);

    // Assert
    assert.equal(visitResult, false);
    assert.equal(advanceResult, false);
    assert.equal(snapshot.currentTask.id, TASK_IDS.DECIDE);
    assert.equal(snapshot.stepIndex, 0);
    assert.equal(snapshot.lastResult, null);
  });
});

describe('BE-UT-S04 snapshot', () => {
  it('BE-UT-S04-C01 prevents snapshot mutation from changing event state', () => {
    // Arrange
    const event = createEvent();
    event.visitLocation(createLocationA().id, 1);
    const snapshot = event.getSnapshot(1);

    // Act
    snapshot.currentTask.id = 'changed';
    snapshot.currentTask.destination.id = 'changed';
    snapshot.lastResult.taskId = 'changed';
    snapshot.lastResult.result = BRANCH_TASK_STATES.FAILED;
    const currentSnapshot = event.getSnapshot(1);

    // Assert
    assert.equal(currentSnapshot.currentTask.id, TASK_IDS.SUCCESS);
    assert.equal(currentSnapshot.currentTask.destination.id, createLocationB().id);
    assert.deepEqual(currentSnapshot.lastResult, {
      taskId: TASK_IDS.ROOT,
      result: BRANCH_TASK_STATES.SUCCEEDED,
    });
  });
});
