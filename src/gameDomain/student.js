import { MapPerson } from './mapPerson.js';

const MIN_AFFECTION = -100;
const MAX_AFFECTION = 100;

class Student extends MapPerson {
  constructor(name, classAndNumber, locationId, affection = 0) {
    super(name, locationId);
    this.classAndNumber = classAndNumber;
    this.affection = affection;
  }

  get affection() {
    return this._affection;
  }

  set affection(value) {
    this._affection = Math.min(MAX_AFFECTION, Math.max(MIN_AFFECTION, value));
  }

}

export {
  Student,
};
