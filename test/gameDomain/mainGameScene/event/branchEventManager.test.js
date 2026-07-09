import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Character } from '../../../../src/gameDomain/mainGameScene/character.js';
import {
  BranchEventManager,
} from '../../../../src/gameDomain/mainGameScene/event/branchEventManager.js';
import {
  EventIdSequence,
} from '../../../../src/gameDomain/mainGameScene/event/eventIdSequence.js';
import {
  EXHIBIT_TROUBLE_EVENT_CHOICE_IDS,
  EXHIBIT_TROUBLE_EVENT_TASK_IDS,
  EXHIBIT_TROUBLE_EVENT_TYPE,
} from '../../../../src/gameDomain/mainGameScene/event/exhibitTroubleEvent.js';
import {
  NOTICE_BOARD_EVENT_TASK_IDS,
  NOTICE_BOARD_EVENT_TYPE,
} from '../../../../src/gameDomain/mainGameScene/event/noticeBoardEvent.js';
import {
  BRANCH_TASK_STATES,
} from '../../../../src/gameDomain/mainGameScene/event/branchTask.js';
import {
  LOCATION_IDS,
} from '../../../../src/gameDomain/mainGameScene/locations.js';

function createCharacter(locationId = LOCATION_IDS.GYM_FRONT_PARKING) {
  return new Character(locationId, {
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
    manager: new BranchEventManager({
      character,
      eventIdSequence: new EventIdSequence(),
    }),
  };
}

function visitCurrentTaskDestination(character, manager) {
  const snapshot = manager.getExecutingEventSnapshot();
  character.moveToLocation(snapshot.currentTask.destination.id);
  return manager.visitCurrentLocation();
}

function completeNoticeBoardEvent(character, manager) {
  visitCurrentTaskDestination(character, manager);
  visitCurrentTaskDestination(character, manager);
  return visitCurrentTaskDestination(character, manager);
}

function startExhibitTroubleEvent() {
  const { character, manager } = createManager();
  completeNoticeBoardEvent(character, manager);
  return { character, manager };
}

function completeAllBranchEvents() {
  const { character, manager } = startExhibitTroubleEvent();
  manager.chooseCurrentTask(EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.FETCH_SUPPLIES);
  visitCurrentTaskDestination(character, manager);
  visitCurrentTaskDestination(character, manager);
  return { character, manager };
}

describe('BEM-UT-S01 initial branch event', () => {
  it('BEM-UT-S01-C01 starts the notice board event immediately', () => {
    // Arrange
    const { manager } = createManager();

    // Act
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(snapshot.id, 0);
    assert.equal(snapshot.type, NOTICE_BOARD_EVENT_TYPE);
    assert.equal(snapshot.state, 'executing');
    assert.equal(snapshot.currentTask.id, NOTICE_BOARD_EVENT_TASK_IDS.FIND_NOTICE);
  });

  it('BEM-UT-S01-C02 chooses an initial destination outside the current location', () => {
    // Arrange
    const { character, manager } = createManager();

    // Act
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.notEqual(snapshot.currentTask.destination.id, character.locationId);
  });
});

describe('BEM-UT-S02 movement and time progression', () => {
  it('BEM-UT-S02-C01 advances to the success branch after visiting the destination', () => {
    // Arrange
    const { character, manager } = createManager();

    // Act
    const result = visitCurrentTaskDestination(character, manager);
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.currentTask.id, NOTICE_BOARD_EVENT_TASK_IDS.DELIVER_NOTICE);
    assert.deepEqual(snapshot.lastResult, {
      taskId: NOTICE_BOARD_EVENT_TASK_IDS.FIND_NOTICE,
      result: BRANCH_TASK_STATES.SUCCEEDED,
    });
  });

  it('BEM-UT-S02-C02 advances to the failure branch when the deadline is reached', () => {
    // Arrange
    const { manager } = createManager();
    const initialSnapshot = manager.getExecutingEventSnapshot();

    // Act
    const result = manager.advanceTo(initialSnapshot.currentTask.deadlineHours);
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.currentTask.id, NOTICE_BOARD_EVENT_TASK_IDS.SEARCH_REST_AREA);
    assert.deepEqual(snapshot.lastResult, {
      taskId: NOTICE_BOARD_EVENT_TASK_IDS.FIND_NOTICE,
      result: BRANCH_TASK_STATES.FAILED,
    });
  });

  it('BEM-UT-S02-C03 starts the exhibit trouble event after the notice board chain completes', () => {
    // Arrange
    const { character, manager } = createManager();

    // Act
    const result = completeNoticeBoardEvent(character, manager);
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.id, 1);
    assert.equal(snapshot.type, EXHIBIT_TROUBLE_EVENT_TYPE);
    assert.equal(snapshot.currentTask.id, EXHIBIT_TROUBLE_EVENT_TASK_IDS.DECIDE_APPROACH);
  });

  it('BEM-UT-S02-C04 advances to the success branch after visiting a location id', () => {
    // Arrange
    const { manager } = createManager();
    const initialSnapshot = manager.getExecutingEventSnapshot();

    // Act
    const result = manager.visitLocation(initialSnapshot.currentTask.destination.id);
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.currentTask.id, NOTICE_BOARD_EVENT_TASK_IDS.DELIVER_NOTICE);
    assert.deepEqual(snapshot.lastResult, {
      taskId: NOTICE_BOARD_EVENT_TASK_IDS.FIND_NOTICE,
      result: BRANCH_TASK_STATES.SUCCEEDED,
    });
  });
});

describe('BEM-UT-S03 choice progression', () => {
  it('BEM-UT-S03-C01 advances to the supply task from the success choice', () => {
    // Arrange
    const { manager } = startExhibitTroubleEvent();

    // Act
    const result = manager.chooseCurrentTask(
      EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.FETCH_SUPPLIES,
    );
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.currentTask.id, EXHIBIT_TROUBLE_EVENT_TASK_IDS.FETCH_SUPPLIES);
    assert.deepEqual(snapshot.lastResult, {
      taskId: EXHIBIT_TROUBLE_EVENT_TASK_IDS.DECIDE_APPROACH,
      result: BRANCH_TASK_STATES.SUCCEEDED,
      choiceId: EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.FETCH_SUPPLIES,
    });
  });

  it('BEM-UT-S03-C02 advances to the move exhibit task from the failure choice', () => {
    // Arrange
    const { manager } = startExhibitTroubleEvent();

    // Act
    const result = manager.chooseCurrentTask(
      EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.MOVE_EXHIBIT,
    );
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.currentTask.id, EXHIBIT_TROUBLE_EVENT_TASK_IDS.MOVE_EXHIBIT);
    assert.deepEqual(snapshot.lastResult, {
      taskId: EXHIBIT_TROUBLE_EVENT_TASK_IDS.DECIDE_APPROACH,
      result: BRANCH_TASK_STATES.FAILED,
      choiceId: EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.MOVE_EXHIBIT,
    });
  });

  it('BEM-UT-S03-C03 ignores an unknown choice id', () => {
    // Arrange
    const { manager } = startExhibitTroubleEvent();

    // Act
    const result = manager.chooseCurrentTask('unknown-choice');
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(result, false);
    assert.equal(snapshot.currentTask.id, EXHIBIT_TROUBLE_EVENT_TASK_IDS.DECIDE_APPROACH);
    assert.equal(snapshot.lastResult, null);
  });

  it('BEM-UT-S03-C04 ignores choices while the active task is not a choice task', () => {
    // Arrange
    const { manager } = createManager();

    // Act
    const result = manager.chooseCurrentTask(
      EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.FETCH_SUPPLIES,
    );
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(result, false);
    assert.equal(snapshot.currentTask.id, NOTICE_BOARD_EVENT_TASK_IDS.FIND_NOTICE);
    assert.equal(snapshot.lastResult, null);
  });
});

describe('BEM-UT-S04 completion and disposal', () => {
  it('BEM-UT-S04-C01 clears the active event after the exhibit trouble event completes', () => {
    // Arrange
    const { character, manager } = startExhibitTroubleEvent();

    // Act
    manager.chooseCurrentTask(EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.FETCH_SUPPLIES);
    visitCurrentTaskDestination(character, manager);
    const result = visitCurrentTaskDestination(character, manager);

    // Assert
    assert.equal(result, true);
    assert.equal(manager.getExecutingEventSnapshot(), null);
  });

  it('BEM-UT-S04-C02 ignores operations when no active event exists', () => {
    // Arrange
    const { manager } = completeAllBranchEvents();

    // Act
    const advanceResult = manager.advanceTo(99);
    const visitResult = manager.visitCurrentLocation();
    const chooseResult = manager.chooseCurrentTask(
      EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.FETCH_SUPPLIES,
    );

    // Assert
    assert.equal(advanceResult, false);
    assert.equal(visitResult, false);
    assert.equal(chooseResult, false);
    assert.equal(manager.getExecutingEventSnapshot(), null);
  });

  it('BEM-UT-S04-C03 discards the active event on rewind and does not regenerate it', () => {
    // Arrange
    const { manager } = createManager();

    // Act
    manager.rewindTo(0);
    const advanceResult = manager.advanceTo(24);
    const visitResult = manager.visitCurrentLocation();
    const chooseResult = manager.chooseCurrentTask(
      EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.FETCH_SUPPLIES,
    );

    // Assert
    assert.equal(advanceResult, false);
    assert.equal(visitResult, false);
    assert.equal(chooseResult, false);
    assert.equal(manager.getExecutingEventSnapshot(), null);
  });
});
