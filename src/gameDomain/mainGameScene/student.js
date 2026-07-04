import { Actor } from './actor.js';
import {
  CONVERSATION_SCENE_SCRIPT_CHOICE_IDS,
  CONVERSATION_SCENE_SCRIPT_IDS,
} from '../conversationScene/conversationSceneScriptIds.js';

const MIN_AFFECTION = -100;
const MAX_AFFECTION = 100;
const DEFAULT_CONVERSATION_SCENE_AFFECTION_CHANGE = 5;
const CONVERSATION_SCENE_AFFECTION_CHANGES = Object.freeze({
  [CONVERSATION_SCENE_SCRIPT_IDS.EFFORT_FEEDBACK]: Object.freeze({
    [CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.EFFORT_FEEDBACK.WORKED_VERY_HARD]: 10,
    [CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.EFFORT_FEEDBACK.AS_USUAL]: 0,
    [CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.EFFORT_FEEDBACK.NEEDS_MORE_EFFORT]: -5,
  }),
});

class Student extends Actor {
  #classAndNumber;
  #affection;

  constructor(name, classAndNumber, locationId, affection = 0) {
    super(createStudentId(classAndNumber), name, locationId);
    this.#classAndNumber = classAndNumber;
    this.#setAffection(affection);
  }

  getBaseConversationSceneAffectionChange(conversationSceneResult) {
    const changes = CONVERSATION_SCENE_AFFECTION_CHANGES[
      conversationSceneResult?.scriptId
    ];
    return changes?.[conversationSceneResult?.choiceId]
      ?? DEFAULT_CONVERSATION_SCENE_AFFECTION_CHANGE;
  }

  changeAffection(amount) {
    this.#setAffection(this.#affection + amount);
  }

  getSnapshot() {
    return {
      ...super.getSnapshot(),
      classAndNumber: this.#classAndNumber,
      affection: this.#affection,
    };
  }

  #setAffection(value) {
    this.#affection = Math.min(MAX_AFFECTION, Math.max(MIN_AFFECTION, value));
  }
}

function createStudentId(classAndNumber) {
  return `student-${String(classAndNumber).padStart(2, '0')}`;
}

export {
  Student,
};
