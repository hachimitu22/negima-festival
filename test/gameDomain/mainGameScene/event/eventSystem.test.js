import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS,
} from '../../../../src/gameDomain/mainGameScene/event/accompanimentConversationSceneScripts.js';
import { ACTOR_MOVEMENT_MODES } from '../../../../src/gameDomain/mainGameScene/actor.js';
import { Character } from '../../../../src/gameDomain/mainGameScene/character.js';
import {
  DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS,
} from '../../../../src/gameDomain/mainGameScene/event/deliveryConversationSceneScripts.js';
import { EventSystem } from '../../../../src/gameDomain/mainGameScene/event/eventSystem.js';
import { LOCATION_IDS } from '../../../../src/gameDomain/mainGameScene/locations.js';
import { Student } from '../../../../src/gameDomain/mainGameScene/student.js';

describe('ES-UT-S01 event progression', () => {
  it('ES-UT-S01-C01 aggregates initial executing event snapshots', () => {
    // Arrange
    const { system } = createEventSystemHarness();

    // Act
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.equal(snapshot.companion, null);
    assert.ok(snapshot.executingEvents.some(event => event.type === 'patrol'));
    assert.ok(snapshot.executingEvents.some(event => (
      event.type === 'notice-board'
    )));
  });

  it('ES-UT-S01-C02 notifies event managers about visited locations', () => {
    // Arrange
    const { character, system } = createEventSystemHarness();
    const beforeSnapshot = system.createSnapshotFragment();
    const patrolEvent = beforeSnapshot.executingEvents.find(event => (
      event.type === 'patrol'
    ));
    const destinationIds = patrolEvent.destinations.map(destination => (
      destination.id
    ));

    // Act
    system.visitLocations(destinationIds);

    // Assert
    assert.equal(
      character.mahoPayPoints,
      patrolEvent.rewardPoints,
    );
  });

  it('ES-UT-S01-C03 discards active conversation events on rewind', () => {
    // Arrange
    const { calls, system, actors } = createEventSystemHarness({
      selectedAdditionalScriptId:
        ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
    });
    system.requestActorConversation(actors.sender, {
      currentLocationId: actors.sender.locationId,
    });
    completeLatestConversation(calls);

    // Act
    system.rewindTo(6);
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.equal(system.getActiveCompanionActorId(), null);
    assert.equal(snapshot.companion, null);
    assert.equal(
      snapshot.executingEvents.some(event => event.type === 'accompaniment'),
      false,
    );
    assert.deepEqual(calls.companionMovementModes.at(-1), {
      actorId: actors.sender.id,
      movementMode: ACTOR_MOVEMENT_MODES.AUTOMATIC,
    });
    assert.deepEqual(calls.resetActorNextMoveTimeActorIds, []);
  });
});

describe('ES-UT-S02 actor conversation routing', () => {
  it('ES-UT-S02-C01 activates a delivery event after a selected request conversation completes', () => {
    // Arrange
    const { calls, system, actors } = createEventSystemHarness({
      selectedAdditionalScriptId: DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
    });

    // Act
    const started = system.requestActorConversation(actors.sender, {
      currentLocationId: actors.sender.locationId,
    });
    completeLatestConversation(calls);
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.equal(started, true);
    assert.equal(calls.startedConversations.length, 1);
    assert.ok(snapshot.executingEvents.some(event => (
      event.type === 'delivery'
      && event.state === 'executing'
      && event.sender.id === actors.sender.id
      && event.recipient.id === actors.recipient.id
    )));
  });

  it('ES-UT-S02-C02 applies rewards and clears delivery after completion conversation', () => {
    // Arrange
    const { calls, system, actors } = createEventSystemHarness({
      selectedAdditionalScriptId: DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
    });
    system.requestActorConversation(actors.sender, {
      currentLocationId: actors.sender.locationId,
    });
    completeLatestConversation(calls);

    // Act
    const started = system.requestActorConversation(actors.recipient, {
      currentLocationId: actors.recipient.locationId,
    });
    completeLatestConversation(calls);
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.equal(started, true);
    assert.deepEqual(calls.affectionRewards, [
      {
        actorId: actors.sender.id,
        amount: 5,
      },
      {
        actorId: actors.recipient.id,
        amount: 5,
      },
    ]);
    assert.equal(
      snapshot.executingEvents.some(event => event.type === 'delivery'),
      false,
    );
  });

  it('ES-UT-S02-C03 activates accompaniment and externally controls the companion', () => {
    // Arrange
    const { calls, system, actors } = createEventSystemHarness({
      selectedAdditionalScriptId:
        ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
    });

    // Act
    const started = system.requestActorConversation(actors.sender, {
      currentLocationId: actors.sender.locationId,
    });
    completeLatestConversation(calls);
    const snapshot = system.createSnapshotFragment();

    // Assert
    assert.equal(started, true);
    assert.equal(system.getActiveCompanionActorId(), actors.sender.id);
    assert.equal(snapshot.companion.id, actors.sender.id);
    assert.ok(snapshot.executingEvents.some(event => (
      event.type === 'accompaniment'
      && event.state === 'executing'
    )));
    assert.deepEqual(calls.companionMovementModes, [
      {
        actorId: actors.sender.id,
        movementMode: ACTOR_MOVEMENT_MODES.EXTERNAL,
      },
    ]);
  });

  it('ES-UT-S02-C04 blocks companion conversation outside the accompaniment destination', () => {
    // Arrange
    const { calls, system, actors } = createEventSystemHarness({
      selectedAdditionalScriptId:
        ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
    });
    system.requestActorConversation(actors.sender, {
      currentLocationId: actors.sender.locationId,
    });
    completeLatestConversation(calls);
    const startedConversationCount = calls.startedConversations.length;

    // Act
    const started = system.requestActorConversation(actors.sender, {
      currentLocationId: actors.sender.locationId,
    });

    // Assert
    assert.equal(started, false);
    assert.equal(calls.startedConversations.length, startedConversationCount);
    assert.equal(
      system.isActorInteractionBlocked(
        actors.sender.id,
        actors.sender.locationId,
      ),
      true,
    );
  });
});

function createEventSystemHarness({
  selectedAdditionalScriptId = null,
} = {}) {
  const character = new Character(LOCATION_IDS.GYM_FRONT_PARKING, {
    magicPower: {
      current: 100,
      max: 100,
      recoveryPerGameHour: 5,
    },
  });
  const actors = {
    sender: new Student('依頼者', 1, LOCATION_IDS.GYM_ARENA),
    recipient: new Student('受取人', 2, LOCATION_IDS.LIBRARY_ROOM),
  };
  const calls = createCallLog();
  const system = new EventSystem({
    character,
    durationHours: 72,
    actorsProvider: () => [actors.sender, actors.recipient],
    conversationRequests: {
      start(conversation) {
        calls.startedConversations.push(conversation);
        return true;
      },
    },
    rewardRequests: {
      applyConversationResult(actorId, conversationResult) {
        calls.conversationResults.push({
          actorId,
          conversationResult,
        });
        return true;
      },
      applyAffection(actorId, amount) {
        calls.affectionRewards.push({
          actorId,
          amount,
        });
        return true;
      },
    },
    companionRequests: {
      setActorMovementMode(actorId, movementMode) {
        calls.companionMovementModes.push({
          actorId,
          movementMode,
        });
        return true;
      },
      resetActorNextMoveTime(actorId) {
        calls.resetActorNextMoveTimeActorIds.push(actorId);
      },
    },
    createConversationScript(actor, { additionalScripts = [] } = {}) {
      const selectedAdditionalScript = additionalScripts.find(script => (
        script.id === selectedAdditionalScriptId
      ));
      if (selectedAdditionalScript) {
        return selectedAdditionalScript;
      }

      return {
        id: 'normalConversation',
        choice: null,
        messages: [
          {
            speakerName: actor.name,
            message: '通常会話',
          },
        ],
      };
    },
  });

  return {
    actors,
    calls,
    character,
    system,
  };
}

function createCallLog() {
  return {
    affectionRewards: [],
    companionMovementModes: [],
    conversationResults: [],
    resetActorNextMoveTimeActorIds: [],
    startedConversations: [],
  };
}

function completeLatestConversation(calls, result = {}) {
  const latestConversation = calls.startedConversations.at(-1);
  assert.ok(latestConversation);
  latestConversation.onComplete?.(result);
}
