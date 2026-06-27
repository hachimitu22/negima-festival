import { MapPerson } from './mapPerson.js';

class Teacher extends MapPerson {
  constructor(id, name, locationId, options = {}) {
    super(id, name, locationId, options);
  }
}

export {
  Teacher,
};
