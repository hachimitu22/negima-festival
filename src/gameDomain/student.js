import { Actor } from './actor.js';
import {
  CONVERSATION_CHOICE_IDS,
  CONVERSATION_IDS,
} from './conversationIds.js';

const MIN_AFFECTION = -100;
const MAX_AFFECTION = 100;
const DEFAULT_CONVERSATION_AFFECTION_CHANGE = 5;
const CONVERSATION_AFFECTION_CHANGES = Object.freeze({
  [CONVERSATION_IDS.EFFORT_FEEDBACK]: Object.freeze({
    [CONVERSATION_CHOICE_IDS.EFFORT_FEEDBACK.WORKED_VERY_HARD]: 10,
    [CONVERSATION_CHOICE_IDS.EFFORT_FEEDBACK.AS_USUAL]: 0,
    [CONVERSATION_CHOICE_IDS.EFFORT_FEEDBACK.NEEDS_MORE_EFFORT]: -5,
  }),
});

class Student extends Actor {
  constructor(name, classAndNumber, locationId, affection = 0) {
    super(createStudentId(classAndNumber), name, locationId);
    this.classAndNumber = classAndNumber;
    this.affection = affection;
  }

  get affection() {
    return this._affection;
  }

  set affection(value) {
    this._affection = Math.min(MAX_AFFECTION, Math.max(MIN_AFFECTION, value));
  }

  getBaseAffectionChange(conversationResult) {
    const changes = CONVERSATION_AFFECTION_CHANGES[conversationResult?.conversationId];
    return changes?.[conversationResult?.choiceId] ?? DEFAULT_CONVERSATION_AFFECTION_CHANGE;
  }

  changeAffection(amount) {
    this.affection += amount;
  }

  getSnapshot() {
    return {
      ...super.getSnapshot(),
      classAndNumber: this.classAndNumber,
      affection: this.affection,
    };
  }
}

function createStudentId(classAndNumber) {
  return `student-${String(classAndNumber).padStart(2, '0')}`;
}

export {
  Student,
};
