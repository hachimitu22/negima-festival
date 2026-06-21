import { GameObject } from '../gameEngine/gameObject.js';

class Student extends GameObject {
  constructor(name, classAndNumber, locationId) {
    super();
    this.name = name;
    this.classAndNumber = classAndNumber;
    this.locationId = locationId;
  }
  update(context) {
  }
}

export {
  Student,
};
