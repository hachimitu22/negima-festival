import { ACTION_TYPES, INPUT_TYPES, MAIN_GAME_LAYER_IDS, SCENE_IDS, TARGET_PREFIXES } from './actions.js';
import {
  CONVERSATION_SESSION_RESULTS,
  ConversationSession,
} from './conversationSession.js';
import { createConversation } from './conversations.js';
import { EventGameObject } from './eventGameObject.js';
import { ClickEvent, InputEvent } from './gameEvent.js';
import { GameSystem } from './gameSystem.js';
import { LOCATIONS } from './locations.js';
import { getRandomInt, rollChance } from './random.js';

const GAME_EVENTS = [
  ClickEvent,
  InputEvent,
];

const LAYER_ITEMS = [
  { id: MAIN_GAME_LAYER_IDS.MAP, label: 'マップ' },
  { id: MAIN_GAME_LAYER_IDS.EXECUTING_EVENTS, label: '実行中イベント' },
  { id: MAIN_GAME_LAYER_IDS.SUCCEEDED_EVENTS, label: '成功イベント' },
  { id: MAIN_GAME_LAYER_IDS.FAILED_EVENTS, label: '失敗イベント' },
];

const EVENT_SPAWN_INTERVAL_HOURS = 2;

class MainGameScene {
  constructor(system = new GameSystem()) {
    this.system = system;
    this.activeLayerId = MAIN_GAME_LAYER_IDS.MENU;
    this.events = [];
    this.succeededEvents = [];
    this.failedEvents = [];
    this.lastEventId = 0;
    this.nextEventTimeHours = 1;
    this.activeConversation = null;
    this.activeConversationActorId = null;
    this.activeConversationResult = null;
  }

  update(context) {
    const inputContext = {
      ...this.system.createUpdateContext(context),
      inputs: context.inputs,
    };
    const wasConversationActive = this.isConversationActive();

    this.handleInputs(inputContext.inputs, inputContext);

    if (wasConversationActive || this.isConversationActive()) {
      return;
    }

    this.system.update(context);
    const sceneContext = {
      ...this.system.createUpdateContext(context),
      inputs: inputContext.inputs,
    };

    this.events.forEach(eventObject => {
      eventObject.update(sceneContext);
    });

    this.moveFinishedEvents();

    const eventObject = this.createEventRandom(sceneContext);
    if (eventObject) {
      this.events.push(eventObject);
    }
  }

  handleInputs(inputs = [], context = {}) {
    inputs.forEach(input => {
      this.processInput(input, context);
    });
  }

  processInput(input, context = {}) {
    if (this.isConversationActive()) {
      this.handleConversationInput(input);
      return;
    }

    if (input.type === INPUT_TYPES.TARGET_ACTIVATE) {
      this.handleTargetActivate(input.targetId, context);
      return;
    }

    if (input.type === INPUT_TYPES.TARGET_INPUT_CHANGE) {
      this.handleEventAction({
        type: ACTION_TYPES.EVENT_INPUT_CHANGE,
        eventId: getTargetValue(input.targetId, TARGET_PREFIXES.EVENT),
        value: input.value,
      });
      return;
    }

    if (input.type === INPUT_TYPES.TARGET_SUBMIT) {
      this.handleEventAction({
        type: ACTION_TYPES.EVENT_INPUT_SUBMIT,
        eventId: getTargetValue(input.targetId, TARGET_PREFIXES.EVENT),
      });
    }
  }

  handleTargetActivate(targetId, context) {
    const conversationAction = getTargetValue(targetId, TARGET_PREFIXES.CONVERSATION);
    if (conversationAction) {
      this.handleConversationAction(conversationAction);
      return;
    }

    const layerId = getTargetValue(targetId, TARGET_PREFIXES.LAYER);
    if (layerId) {
      this.selectLayer(layerId);
      return;
    }

    const locationId = getTargetValue(targetId, TARGET_PREFIXES.LOCATION);
    if (locationId) {
      this.system.moveCharacterToLocation(locationId);
      return;
    }

    const actorId = getTargetValue(targetId, TARGET_PREFIXES.ACTOR);
    if (actorId !== null) {
      this.startConversation(actorId);
      return;
    }

    const eventId = getTargetValue(targetId, TARGET_PREFIXES.EVENT);
    if (eventId !== null) {
      this.handleEventAction({
        type: ACTION_TYPES.EVENT_CLICK,
        eventId,
      });
      return;
    }

    if (targetId === TARGET_PREFIXES.CASSIOPEIA) {
      const result = this.system.useCassiopeia();
      if (result) {
        this.rewindTo(result.currentHours);
      }
    }
  }

  handleEventAction(action) {
    if (action.eventId === null) {
      return;
    }

    this.events.forEach(eventObject => {
      eventObject.handleAction(action);
    });
  }

  createSnapshot() {
    return {
      ...this.system.createSnapshot(),
      sceneId: SCENE_IDS.MAIN_GAME,
      activeLayerId: this.activeLayerId,
      layerItems: LAYER_ITEMS,
      mapLocations: LOCATIONS,
      activeConversation: this.createActiveConversationSnapshot(),
      executingEvents: this.events.map(eventObject => eventObject.getSnapshot()),
      succeededEvents: this.succeededEvents.map(eventObject => eventObject.getSnapshot()),
      failedEvents: this.failedEvents.map(eventObject => eventObject.getSnapshot()),
    };
  }

  selectLayer(layerId) {
    if (
      layerId !== MAIN_GAME_LAYER_IDS.CONVERSATION
      && Object.values(MAIN_GAME_LAYER_IDS).includes(layerId)
    ) {
      this.activeLayerId = layerId;
    }
  }

  moveFinishedEvents() {
    const executingEvents = [];

    this.events.forEach(eventObject => {
      if (eventObject.isSucceeded()) {
        this.succeededEvents.push(eventObject);
      } else if (eventObject.isFailed()) {
        this.failedEvents.push(eventObject);
      } else {
        executingEvents.push(eventObject);
      }
    });

    this.events = executingEvents;
  }

  rewindTo(currentHours) {
    this.events = [];
    this.nextEventTimeHours = currentHours + EVENT_SPAWN_INTERVAL_HOURS;
  }

  startConversation(actorId) {
    const actor = this.system.findTalkableActor(actorId);
    if (!actor) {
      return false;
    }

    const conversation = createConversation(actor);
    if (conversation.messages.length === 0) {
      return false;
    }

    this.activeConversation = new ConversationSession(conversation);
    this.activeConversationActorId = actor.id;
    this.activeConversationResult = {
      conversationId: conversation.id,
      choiceId: null,
    };
    this.activeLayerId = MAIN_GAME_LAYER_IDS.CONVERSATION;
    return true;
  }

  isConversationActive() {
    return Boolean(this.activeConversation);
  }

  handleConversationInput(input) {
    if (input.type !== INPUT_TYPES.TARGET_ACTIVATE) {
      return;
    }

    const conversationAction = getTargetValue(input.targetId, TARGET_PREFIXES.CONVERSATION);
    if (conversationAction) {
      this.handleConversationAction(conversationAction);
    }
  }

  handleConversationAction(action) {
    if (!this.activeConversation) {
      return;
    }

    const choiceId = getTargetValue(action, 'choice');
    if (choiceId) {
      this.selectConversationChoice(choiceId);
      return;
    }

    if (action !== 'next') {
      return;
    }

    const result = this.activeConversation.next();
    if (result === CONVERSATION_SESSION_RESULTS.COMPLETED) {
      if (this.activeConversationActorId !== null) {
        this.system.applyStudentConversationResult(
          this.activeConversationActorId,
          this.activeConversationResult,
        );
      }
      this.activeConversation = null;
      this.activeConversationActorId = null;
      this.activeConversationResult = null;
      this.activeLayerId = MAIN_GAME_LAYER_IDS.MAP;
    }
  }

  selectConversationChoice(choiceId) {
    const result = this.activeConversation.selectChoice(choiceId);
    if (result) {
      this.activeConversationResult = result;
    }
  }

  createActiveConversationSnapshot() {
    if (!this.activeConversation) {
      return null;
    }

    return this.activeConversation.getSnapshot();
  }

  createEventRandom(context) {
    if (
      context.isFestivalEnded
      || typeof context.gameTimeHours !== 'number'
      || context.gameTimeHours < this.nextEventTimeHours
    ) {
      return null;
    }

    this.nextEventTimeHours += EVENT_SPAWN_INTERVAL_HOURS;

    if (!rollChance(50)) {
      return null;
    }

    const randomIndex = getRandomInt(0, GAME_EVENTS.length - 1);
    const event = new GAME_EVENTS[randomIndex](this.lastEventId++);
    if (typeof context.rememberEvent === 'function') {
      context.rememberEvent(event.name);
    }
    return new EventGameObject(event);
  }
}

function getTargetValue(targetId, prefix) {
  const expectedPrefix = `${prefix}:`;
  if (typeof targetId !== 'string' || !targetId.startsWith(expectedPrefix)) {
    return null;
  }

  const value = targetId.slice(expectedPrefix.length);
  if (prefix === TARGET_PREFIXES.EVENT) {
    return Number(value);
  }

  return value;
}

export {
  MainGameScene,
};
