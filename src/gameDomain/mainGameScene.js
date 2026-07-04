import { INPUT_TYPES, MAIN_GAME_LAYER_IDS, SCENE_IDS, TARGET_PREFIXES } from './actions.js';
import {
  ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS,
} from './accompanimentConversationSceneScripts.js';
import { AccompanimentEvent } from './accompanimentEvent.js';
import { ACTOR_MOVEMENT_MODES } from './actor.js';
import { ConversationScene } from './conversationScene.js';
import { createConversationSceneScript } from './conversationSceneScripts.js';
import {
  DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS,
} from './deliveryConversationSceneScripts.js';
import { DeliveryEvent } from './deliveryEvent.js';
import { GameSystem } from './gameSystem.js';
import { LOCATIONS } from './locations.js';
import { getRandomInt } from './random.js';

const DELIVERY_AFFECTION_REWARD = 5;
const ACCOMPANIMENT_AFFECTION_REWARD = 20;

class MainGameScene {
  #system;
  #activeLayerId;
  #activeEvent;
  #lastEventId;

  constructor(system = new GameSystem()) {
    this.#system = system;
    this.#activeLayerId = MAIN_GAME_LAYER_IDS.MAP;
    this.#activeEvent = null;
    this.#lastEventId = 0;
  }

  update({
    context,
    sceneControl: { pushScene },
  }) {
    const inputs = context.inputs ?? [];
    const conversationScene = this.#createConversationSceneFromInputs(inputs);
    if (conversationScene) {
      pushScene(conversationScene);
      return;
    }

    this.#handleInputs(inputs);
    this.#system.update(context);
  }

  #handleInputs(inputs = []) {
    inputs.forEach(input => {
      this.#processInput(input);
    });
  }

  #processInput(input) {
    if (input.type === INPUT_TYPES.TARGET_ACTIVATE) {
      this.#handleTargetActivate(input.targetId);
    }
  }

  #handleTargetActivate(targetId) {
    const locationId = getTargetValue(targetId, TARGET_PREFIXES.LOCATION);
    if (locationId) {
      const didMove = this.#system.moveCharacterToLocation(locationId);
      const companionActorId = this.#getActiveCompanionActorId();
      if (didMove && companionActorId) {
        this.#system.moveActorToLocation(companionActorId, locationId);
      }
      return;
    }

    const actorId = getTargetValue(targetId, TARGET_PREFIXES.ACTOR);
    if (actorId !== null) {
      return;
    }

    if (targetId === TARGET_PREFIXES.CASSIOPEIA) {
      const result = this.#system.useCassiopeia();
      if (result) {
        this.#rewind();
      }
    }
  }

  createSnapshot() {
    const statusSnapshot = this.#createStatusSnapshot();
    return {
      ...statusSnapshot,
      sceneId: SCENE_IDS.MAIN_GAME,
      activeLayerId: this.#activeLayerId,
      mapLocations: LOCATIONS,
      executingEvents: this.#activeEvent
        ? [this.#activeEvent.getSnapshot()]
        : [],
    };
  }

  #rewind() {
    this.#releaseActiveCompanion({ resetNextMoveTime: false });
    this.#activeEvent = null;
  }

  #createConversationSceneFromInputs(inputs = []) {
    for (const input of inputs) {
      if (input.type !== INPUT_TYPES.TARGET_ACTIVATE) {
        continue;
      }

      const actorId = getTargetValue(input.targetId, TARGET_PREFIXES.ACTOR);
      if (actorId === null) {
        continue;
      }

      const conversationScene = this.#createConversationScene(actorId);
      if (conversationScene) {
        return conversationScene;
      }
    }

    return null;
  }

  #createConversationScene(actorId) {
    const actor = this.#system.findTalkableActor(actorId);
    if (!actor) {
      return null;
    }

    if (this.#activeEvent) {
      const currentLocationId = this.#system.createSnapshot().character.location.id;
      const interaction = this.#activeEvent.createActorInteraction(
        actor.id,
        currentLocationId,
      );
      if (interaction) {
        return this.#createEventConversationScene(
          this.#activeEvent,
          interaction,
        );
      }

      if (this.#isActorInteractionBlocked(actor.id, currentLocationId)) {
        return null;
      }

      return this.#createNormalConversationScene(actor);
    }

    return this.#createConversationSceneWithEventCandidates(actor);
  }

  #createConversationSceneWithEventCandidates(actor) {
    const deliveryEvent = this.#createDeliveryEventCandidate(actor);
    const accompanimentEvent = this.#createAccompanimentEventCandidate(actor);
    const eventCandidates = [
      createEventCandidate(
        deliveryEvent,
        DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
      ),
      createEventCandidate(
        accompanimentEvent,
        ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
      ),
    ].filter(Boolean);
    const script = createConversationSceneScript(actor, {
      additionalScripts: eventCandidates.map(candidate => (
        candidate.interaction.conversationSceneScript
      )),
    });
    if (script.messages.length === 0) {
      return null;
    }

    const selectedCandidate = eventCandidates.find(candidate => (
      candidate.scriptId === script.id
    ));
    if (selectedCandidate) {
      this.#lastEventId += 1;
      return this.#createEventConversationScene(
        selectedCandidate.event,
        selectedCandidate.interaction,
        {
          activateOnComplete: true,
        },
      );
    }

    return this.#createNormalConversationScene(actor, script);
  }

  #createNormalConversationScene(
    actor,
    script = createConversationSceneScript(actor),
  ) {
    if (script.messages.length === 0) {
      return null;
    }

    return new ConversationScene({
      script,
      statusSnapshot: this.#createStatusSnapshot(),
      onComplete: conversationSceneResult => {
        this.#system.applyStudentConversationSceneResult(
          actor.id,
          conversationSceneResult,
        );
      },
    });
  }

  #createEventConversationScene(
    event,
    interaction,
    { activateOnComplete = false } = {},
  ) {
    return new ConversationScene({
      script: interaction.conversationSceneScript,
      statusSnapshot: this.#createStatusSnapshot(),
      onComplete: conversationSceneResult => {
        event.completeInteraction(interaction.kind, conversationSceneResult);

        if (activateOnComplete && event.isExecuting()) {
          this.#activeEvent = event;
          this.#controlActiveCompanionExternally();
          return;
        }

        this.#finishActiveEvent(event);
      },
    });
  }

  #createDeliveryEventCandidate(sender) {
    const recipients = this.#system.getActors().filter(actor => actor.id !== sender.id);
    if (recipients.length === 0) {
      return null;
    }

    const recipient = recipients[getRandomInt(0, recipients.length - 1)];
    return new DeliveryEvent(this.#lastEventId, {
      sender,
      recipient,
    });
  }

  #createAccompanimentEventCandidate(companion) {
    const destinationLocations = LOCATIONS.filter(location => (
      location.id !== companion.locationId
    ));
    if (destinationLocations.length === 0) {
      return null;
    }

    const destination = destinationLocations[
      getRandomInt(0, destinationLocations.length - 1)
    ];
    return new AccompanimentEvent(this.#lastEventId, {
      companion,
      destination,
    });
  }

  #finishActiveEvent(event) {
    if (event !== this.#activeEvent) {
      return;
    }

    if (event.isSucceeded()) {
      this.#applyEventReward(event);
      this.#releaseActiveCompanion();
      this.#activeEvent = null;
    } else if (typeof event.isFailed === 'function' && event.isFailed()) {
      this.#releaseActiveCompanion();
      this.#activeEvent = null;
    }
  }

  #applyEventReward(event) {
    if (event instanceof AccompanimentEvent) {
      this.#system.applyStudentAffectionChange(
        event.getCompanionActorId(),
        ACCOMPANIMENT_AFFECTION_REWARD,
      );
      return;
    }

    event.getParticipantActorIds().forEach(actorId => {
      this.#system.applyStudentAffectionChange(actorId, DELIVERY_AFFECTION_REWARD);
    });
  }

  #getActiveCompanionActorId() {
    return this.#activeEvent instanceof AccompanimentEvent
      ? this.#activeEvent.getCompanionActorId()
      : null;
  }

  #controlActiveCompanionExternally() {
    const companionActorId = this.#getActiveCompanionActorId();
    if (!companionActorId) {
      return;
    }

    this.#system.setActorMovementMode(
      companionActorId,
      ACTOR_MOVEMENT_MODES.EXTERNAL,
    );
  }

  #releaseActiveCompanion({ resetNextMoveTime = true } = {}) {
    const companionActorId = this.#getActiveCompanionActorId();
    if (!companionActorId) {
      return;
    }

    this.#system.setActorMovementMode(
      companionActorId,
      ACTOR_MOVEMENT_MODES.AUTOMATIC,
    );
    if (resetNextMoveTime) {
      this.#system.resetActorNextMoveTime(companionActorId);
    }
  }

  #isActorInteractionBlocked(actorId, currentLocationId) {
    return (
      this.#activeEvent instanceof AccompanimentEvent
      && this.#activeEvent.isActorInteractionBlocked(actorId, currentLocationId)
    );
  }

  #createStatusSnapshot() {
    const snapshot = this.#system.createSnapshot();
    const currentLocationId = snapshot.character.location.id;
    return {
      ...snapshot,
      companion: this.#activeEvent instanceof AccompanimentEvent
        ? this.#activeEvent.getCompanionSnapshot()
        : null,
      actors: snapshot.actors.map(actor => ({
        ...actor,
        isTalkable: (
          actor.location?.id === currentLocationId
          && !this.#isActorInteractionBlocked(actor.id, currentLocationId)
        ),
      })),
    };
  }
}

function createEventCandidate(event, scriptId) {
  if (!event) {
    return null;
  }

  const interaction = event.createRequestInteraction();
  return {
    scriptId,
    event,
    interaction,
  };
}

function getTargetValue(targetId, prefix) {
  const expectedPrefix = `${prefix}:`;
  if (typeof targetId !== 'string' || !targetId.startsWith(expectedPrefix)) {
    return null;
  }

  return targetId.slice(expectedPrefix.length);
}

export {
  MainGameScene,
};
