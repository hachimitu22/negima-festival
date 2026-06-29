import { INPUT_TYPES, MAIN_GAME_LAYER_IDS, SCENE_IDS, TARGET_PREFIXES } from './actions.js';
import { ConversationScene } from './conversationScene.js';
import { createConversation } from './conversations.js';
import { DELIVERY_CONVERSATION_IDS } from './deliveryConversations.js';
import { DeliveryEvent } from './deliveryEvent.js';
import { GameSystem } from './gameSystem.js';
import { LOCATIONS } from './locations.js';
import { getRandomInt } from './random.js';

const LAYER_ITEMS = [
  { id: MAIN_GAME_LAYER_IDS.EXECUTING_EVENTS, label: '実行中イベント' },
];

const PANEL_LAYER_IDS = [
  MAIN_GAME_LAYER_IDS.MENU,
  MAIN_GAME_LAYER_IDS.EXECUTING_EVENTS,
];

const DELIVERY_AFFECTION_REWARD = 5;

class MainGameScene {
  constructor(system = new GameSystem()) {
    this.system = system;
    this.activeLayerId = MAIN_GAME_LAYER_IDS.MAP;
    this.activePanelLayerId = MAIN_GAME_LAYER_IDS.MENU;
    this.activeDeliveryEvent = null;
    this.lastEventId = 0;
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
    this.system.update(context);
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
    const layerId = getTargetValue(targetId, TARGET_PREFIXES.LAYER);
    if (layerId) {
      this.#selectLayer(layerId);
      return;
    }

    const locationId = getTargetValue(targetId, TARGET_PREFIXES.LOCATION);
    if (locationId) {
      this.system.moveCharacterToLocation(locationId);
      return;
    }

    const actorId = getTargetValue(targetId, TARGET_PREFIXES.ACTOR);
    if (actorId !== null) {
      return;
    }

    if (targetId === TARGET_PREFIXES.CASSIOPEIA) {
      const result = this.system.useCassiopeia();
      if (result) {
        this.#rewind();
      }
    }
  }

  createSnapshot() {
    return {
      ...this.system.createSnapshot(),
      sceneId: SCENE_IDS.MAIN_GAME,
      activeLayerId: this.activeLayerId,
      activePanelLayerId: this.activePanelLayerId,
      layerItems: LAYER_ITEMS,
      mapLocations: LOCATIONS,
      executingEvents: this.activeDeliveryEvent
        ? [this.activeDeliveryEvent.getSnapshot()]
        : [],
    };
  }

  #selectLayer(layerId) {
    if (layerId === MAIN_GAME_LAYER_IDS.MAP) {
      this.activeLayerId = layerId;
      return;
    }

    if (PANEL_LAYER_IDS.includes(layerId)) {
      this.activePanelLayerId = layerId;
    }
  }

  #rewind() {
    this.activeDeliveryEvent = null;
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
    const actor = this.system.findTalkableActor(actorId);
    if (!actor) {
      return null;
    }

    if (this.activeDeliveryEvent) {
      const interaction = this.activeDeliveryEvent.createActorInteraction(actor.id);
      if (interaction) {
        return this.#createDeliveryConversationScene(
          this.activeDeliveryEvent,
          interaction,
        );
      }

      return this.#createNormalConversationScene(actor);
    }

    return this.#createConversationSceneWithDeliveryCandidate(actor);
  }

  #createConversationSceneWithDeliveryCandidate(actor) {
    const deliveryEvent = this.#createDeliveryEventCandidate(actor);
    const requestInteraction = deliveryEvent?.createRequestInteraction() ?? null;
    const conversation = createConversation(actor, {
      additionalConversations: requestInteraction
        ? [requestInteraction.conversation]
        : [],
    });
    if (conversation.messages.length === 0) {
      return null;
    }

    if (
      deliveryEvent
      && requestInteraction
      && conversation.id === DELIVERY_CONVERSATION_IDS.REQUEST
    ) {
      this.lastEventId += 1;
      return this.#createDeliveryConversationScene(deliveryEvent, requestInteraction, {
        activateOnComplete: true,
      });
    }

    return this.#createNormalConversationScene(actor, conversation);
  }

  #createNormalConversationScene(actor, conversation = createConversation(actor)) {
    if (conversation.messages.length === 0) {
      return null;
    }

    return new ConversationScene({
      conversation,
      statusSnapshot: this.system.createSnapshot(),
      onComplete: conversationResult => {
        this.system.applyStudentConversationResult(actor.id, conversationResult);
      },
    });
  }

  #createDeliveryConversationScene(
    deliveryEvent,
    interaction,
    { activateOnComplete = false } = {},
  ) {
    return new ConversationScene({
      conversation: interaction.conversation,
      statusSnapshot: this.system.createSnapshot(),
      onComplete: conversationResult => {
        deliveryEvent.completeInteraction(interaction.kind, conversationResult);

        if (activateOnComplete && deliveryEvent.isExecuting()) {
          this.activeDeliveryEvent = deliveryEvent;
          return;
        }

        this.#finishDeliveryEvent(deliveryEvent);
      },
    });
  }

  #createDeliveryEventCandidate(sender) {
    const recipients = this.system.getActors().filter(actor => actor.id !== sender.id);
    if (recipients.length === 0) {
      return null;
    }

    const recipient = recipients[getRandomInt(0, recipients.length - 1)];
    return new DeliveryEvent(this.lastEventId, {
      sender,
      recipient,
    });
  }

  #finishDeliveryEvent(deliveryEvent) {
    if (deliveryEvent !== this.activeDeliveryEvent) {
      return;
    }

    if (deliveryEvent.isSucceeded()) {
      this.#applyDeliveryReward(deliveryEvent);
      this.activeDeliveryEvent = null;
    } else if (deliveryEvent.isFailed()) {
      this.activeDeliveryEvent = null;
    }
  }

  #applyDeliveryReward(deliveryEvent) {
    deliveryEvent.getParticipantActorIds().forEach(actorId => {
      this.system.applyStudentAffectionChange(actorId, DELIVERY_AFFECTION_REWARD);
    });
  }
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
