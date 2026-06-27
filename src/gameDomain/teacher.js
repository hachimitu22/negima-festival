import { MapPerson } from './mapPerson.js';

class Teacher extends MapPerson {
  constructor(id, name, locationId, options = {}) {
    super(name, locationId, options);
    this.id = id;
  }
}

export {
  Teacher,
};
