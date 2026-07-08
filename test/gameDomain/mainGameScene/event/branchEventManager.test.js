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
  LOCATION_IDS,
} from '../../../../src/gameDomain/mainGameScene/locations.js';
import {
  NOTICE_BOARD_EVENT_NAME,
  NOTICE_BOARD_EVENT_TASK_IDS,
  NOTICE_BOARD_EVENT_TYPE,
} from '../../../../src/gameDomain/mainGameScene/event/noticeBoardEvent.js';
import {
  EXHIBIT_TROUBLE_EVENT_CHOICE_IDS,
  EXHIBIT_TROUBLE_EVENT_TASK_IDS,
  EXHIBIT_TROUBLE_EVENT_TYPE,
} from '../../../../src/gameDomain/mainGameScene/event/exhibitTroubleEvent.js';

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

describe('BEM-UT-S01 initial event', () => {
  it('BEM-UT-S01-C01 creates a branch event at game start', () => {
    // Arrange
    const { character, manager } = createManager();

    // Act
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(snapshot.id, 0);
    assert.equal(snapshot.type, NOTICE_BOARD_EVENT_TYPE);
    assert.equal(snapshot.name, NOTICE_BOARD_EVENT_NAME);
    assert.equal(snapshot.state, 'executing');
    assert.equal(snapshot.currentTask.id, NOTICE_BOARD_EVENT_TASK_IDS.FIND_NOTICE);
    assert.equal(snapshot.currentTask.title, '紛失した連絡掲示を探す');
    assert.notEqual(snapshot.currentTask.destination.id, character.locationId);
  });
});

describe('BEM-UT-S02 movement and time branch progression', () => {
  it('BEM-UT-S02-C01 advances to the success branch after visiting the destination', () => {
    // Arrange
    const { character, manager } = createManager();

    // Act
    const result = visitCurrentTaskDestination(character, manager);
    const snapshot = manager.getExecutingEventSnapshot();

    // Assert
    assert.equal(result, true);
    assert.equal(snapshot.stepIndex, 1);
    assert.equal(snapshot.currentTask.id, NOTICE_BOARD_EVENT_TASK_IDS.DELIVER_NOTICE);
    assert.equal(snapshot.currentTask.title, '連絡掲示を届ける');
    assert.deepEqual(snapshot.lastResult, {
      taskId: NOTICE_BOARD_EVENT_TASK_IDS.FIND_NOTICE,
      result: 'succeeded',
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
    assert.equal(snapshot.stepIndex, 1);
    assert.equal(snapshot.currentTask.id, NOTICE_BOARD_EVENT_TASK_IDS.SEARCH_REST_AREA);
    assert.equal(snapshot.currentTask.title, '代替の集合場所を確認');
    assert.deepEqual(snapshot.lastResult, {
      taskId: NOTICE_BOARD_EVENT_TASK_IDS.FIND_NOTICE,
      result: 'failed',
    });
  });

  it('BEM-UT-S02-C03 starts the next branch event after the notice board chain completes', () => {
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
    assert.deepEqual(
      snapshot.currentTask.choices.map(choice => choice.id),
      [
        EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.FETCH_SUPPLIES,
        EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.MOVE_EXHIBIT,
      ],
    );
  });

  it('BEM-UT-S02-C04 advances the active branch event from a selected choice', () => {
    // Arrange
    const { character, manager } = createManager();
    completeNoticeBoardEvent(character, manager);

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
      result: 'succeeded',
      choiceId: EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.FETCH_SUPPLIES,
    });
  });
});

describe('BEM-UT-S03 rewind', () => {
  it('BEM-UT-S03-C01 discards the active branch event when time rewinds', () => {
    // Arrange
    const { manager } = createManager();

    // Act
    manager.rewindTo(0);
    manager.advanceTo(24);

    // Assert
    assert.equal(manager.getExecutingEventSnapshot(), null);
  });
});
