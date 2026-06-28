import { ACTION_TYPES, INPUT_TYPES, MAIN_GAME_LAYER_IDS, SCENE_IDS, TARGET_PREFIXES } from './actions.js';
import { ConversationScene } from './conversationScene.js';
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
  { id: MAIN_GAME_LAYER_IDS.EXECUTING_EVENTS, label: '実行中イベント' },
  { id: MAIN_GAME_LAYER_IDS.SUCCEEDED_EVENTS, label: '成功イベント' },
  { id: MAIN_GAME_LAYER_IDS.FAILED_EVENTS, label: '失敗イベント' },
];

const PANEL_LAYER_IDS = [
  MAIN_GAME_LAYER_IDS.MENU,
  MAIN_GAME_LAYER_IDS.EXECUTING_EVENTS,
  MAIN_GAME_LAYER_IDS.SUCCEEDED_EVENTS,
  MAIN_GAME_LAYER_IDS.FAILED_EVENTS,
];

const EVENT_SPAWN_INTERVAL_HOURS = 2;

class MainGameScene {
  constructor(system = new GameSystem()) {
    this.system = system;
    this.activeLayerId = MAIN_GAME_LAYER_IDS.MAP;
    this.activePanelLayerId = MAIN_GAME_LAYER_IDS.MENU;
    this.events = [];
    this.succeededEvents = [];
    this.failedEvents = [];
    this.lastEventId = 0;
    this.nextEventTimeHours = 1;
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
    const sceneContext = {
      ...this.system.createUpdateContext(context),
      inputs,
    };

    this.events.forEach(eventObject => {
      eventObject.update(sceneContext);
    });

    this.#moveFinishedEvents();

    const eventObject = this.#createEventRandom(sceneContext);
    if (eventObject) {
      this.events.push(eventObject);
    }
  }

  #handleInputs(inputs = []) {
    inputs.forEach(input => {
      this.#processInput(input);
    });
  }

  #processInput(input) {
    if (input.type === INPUT_TYPES.TARGET_ACTIVATE) {
      this.#handleTargetActivate(input.targetId);
      return;
    }

    if (input.type === INPUT_TYPES.TARGET_INPUT_CHANGE) {
      this.#handleEventAction({
        type: ACTION_TYPES.EVENT_INPUT_CHANGE,
        eventId: getTargetValue(input.targetId, TARGET_PREFIXES.EVENT),
        value: input.value,
      });
      return;
    }

    if (input.type === INPUT_TYPES.TARGET_SUBMIT) {
      this.#handleEventAction({
        type: ACTION_TYPES.EVENT_INPUT_SUBMIT,
        eventId: getTargetValue(input.targetId, TARGET_PREFIXES.EVENT),
      });
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

    const eventId = getTargetValue(targetId, TARGET_PREFIXES.EVENT);
    if (eventId !== null) {
      this.#handleEventAction({
        type: ACTION_TYPES.EVENT_CLICK,
        eventId,
      });
      return;
    }

    if (targetId === TARGET_PREFIXES.CASSIOPEIA) {
      const result = this.system.useCassiopeia();
      if (result) {
        this.#rewindTo(result.currentHours);
      }
    }
  }

  #handleEventAction(action) {
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
      activePanelLayerId: this.activePanelLayerId,
      layerItems: LAYER_ITEMS,
      mapLocations: LOCATIONS,
      executingEvents: this.events.map(eventObject => eventObject.getSnapshot()),
      succeededEvents: this.succeededEvents.map(eventObject => eventObject.getSnapshot()),
      failedEvents: this.failedEvents.map(eventObject => eventObject.getSnapshot()),
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

  #moveFinishedEvents() {
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

  #rewindTo(currentHours) {
    this.events = [];
    this.nextEventTimeHours = currentHours + EVENT_SPAWN_INTERVAL_HOURS;
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

    const conversation = createConversation(actor);
    if (conversation.messages.length === 0) {
      return null;
    }

    const conversationScene = new ConversationScene({
      conversation,
      statusSnapshot: this.system.createSnapshot(),
      onComplete: conversationResult => {
        this.system.applyStudentConversationResult(actor.id, conversationResult);
      },
    });
    return conversationScene;
  }

  #createEventRandom(context) {
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
