import { ACTION_TYPES, INPUT_TYPES, MAIN_GAME_LAYER_IDS, SCENE_IDS, TARGET_PREFIXES } from './actions.js';
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
const CONVERSATION_SPEAKERS = {
  NEGI: 'negi',
  STUDENT: 'student',
};
const COMMON_CONVERSATION_IDS = {
  GREETING: 'greeting',
};
const COMMON_CONVERSATIONS = {
  [COMMON_CONVERSATION_IDS.GREETING]: [
    { speaker: CONVERSATION_SPEAKERS.STUDENT, text: '{$生徒名}です。' },
    { speaker: CONVERSATION_SPEAKERS.STUDENT, text: '先生こんにちは。' },
    { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'こんにちは。' },
  ],
};
const STUDENT_CONVERSATIONS = {
  1: COMMON_CONVERSATION_IDS.GREETING,
  2: COMMON_CONVERSATION_IDS.GREETING,
  3: COMMON_CONVERSATION_IDS.GREETING,
  4: COMMON_CONVERSATION_IDS.GREETING,
  5: COMMON_CONVERSATION_IDS.GREETING,
  6: COMMON_CONVERSATION_IDS.GREETING,
  7: COMMON_CONVERSATION_IDS.GREETING,
  8: COMMON_CONVERSATION_IDS.GREETING,
  9: COMMON_CONVERSATION_IDS.GREETING,
  10: COMMON_CONVERSATION_IDS.GREETING,
  11: COMMON_CONVERSATION_IDS.GREETING,
  12: COMMON_CONVERSATION_IDS.GREETING,
  13: COMMON_CONVERSATION_IDS.GREETING,
  14: COMMON_CONVERSATION_IDS.GREETING,
  15: COMMON_CONVERSATION_IDS.GREETING,
  16: COMMON_CONVERSATION_IDS.GREETING,
  17: COMMON_CONVERSATION_IDS.GREETING,
  18: COMMON_CONVERSATION_IDS.GREETING,
  19: COMMON_CONVERSATION_IDS.GREETING,
  20: COMMON_CONVERSATION_IDS.GREETING,
  21: COMMON_CONVERSATION_IDS.GREETING,
  22: COMMON_CONVERSATION_IDS.GREETING,
  23: COMMON_CONVERSATION_IDS.GREETING,
  24: COMMON_CONVERSATION_IDS.GREETING,
  25: COMMON_CONVERSATION_IDS.GREETING,
  26: COMMON_CONVERSATION_IDS.GREETING,
  27: COMMON_CONVERSATION_IDS.GREETING,
  28: COMMON_CONVERSATION_IDS.GREETING,
  29: COMMON_CONVERSATION_IDS.GREETING,
  30: COMMON_CONVERSATION_IDS.GREETING,
  31: COMMON_CONVERSATION_IDS.GREETING,
  default: COMMON_CONVERSATION_IDS.GREETING,
};

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

    const studentClassAndNumber = getTargetValue(targetId, TARGET_PREFIXES.STUDENT);
    if (studentClassAndNumber !== null) {
      this.startConversation(studentClassAndNumber);
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

  startConversation(classAndNumber) {
    if (!this.system.canTalkToStudent(classAndNumber)) {
      return false;
    }

    const student = this.system.createStudentSnapshotByClassAndNumber(classAndNumber);
    if (!student) {
      return false;
    }

    this.activeConversation = {
      student,
      messages: this.createConversationMessages(classAndNumber, student),
      messageIndex: 0,
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
    if (action !== 'next' || !this.activeConversation) {
      return;
    }

    const nextMessageIndex = this.activeConversation.messageIndex + 1;
    if (nextMessageIndex >= this.activeConversation.messages.length) {
      this.activeConversation = null;
      this.activeLayerId = MAIN_GAME_LAYER_IDS.MAP;
      return;
    }

    this.activeConversation.messageIndex = nextMessageIndex;
  }

  createConversationMessages(classAndNumber, student) {
    const conversationId = STUDENT_CONVERSATIONS[classAndNumber] ?? STUDENT_CONVERSATIONS.default;
    const messages = COMMON_CONVERSATIONS[conversationId] ?? [];
    return messages.map(message => ({
      speakerName: resolveConversationSpeakerName(message, student),
      message: formatConversationMessage(message.text, student),
    }));
  }

  createActiveConversationSnapshot() {
    if (!this.activeConversation) {
      return null;
    }

    const { student, messages, messageIndex } = this.activeConversation;
    const message = messages[messageIndex];
    return {
      student,
      speakerName: message.speakerName,
      messages,
      messageIndex,
      message: message.message,
      isLastMessage: messageIndex === messages.length - 1,
    };
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

function resolveConversationSpeakerName(message, student) {
  return message.speaker === CONVERSATION_SPEAKERS.STUDENT
    ? student.name
    : 'ネギ';
}

function formatConversationMessage(text, student) {
  return text.replaceAll('{$生徒名}', student.name);
}

function getTargetValue(targetId, prefix) {
  const expectedPrefix = `${prefix}:`;
  if (typeof targetId !== 'string' || !targetId.startsWith(expectedPrefix)) {
    return null;
  }

  const value = targetId.slice(expectedPrefix.length);
  if (prefix === TARGET_PREFIXES.EVENT || prefix === TARGET_PREFIXES.STUDENT) {
    return Number(value);
  }

  return value;
}

export {
  MainGameScene,
};
