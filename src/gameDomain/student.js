import { Actor } from './actor.js';

const MIN_AFFECTION = -100;
const MAX_AFFECTION = 100;

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
