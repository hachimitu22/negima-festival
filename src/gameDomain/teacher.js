import { Actor } from './actor.js';

class Teacher extends Actor {
  constructor(id, name, locationId, options = {}) {
    super(id, name, locationId, options);
  }
}

export {
  Teacher,
};
