import { GameObject } from '../gameEngine/gameObject.js';
import { findLocation, findLocationByName } from './locations.js';
import { getRandomInt } from './random.js';

const MIN_STUDENT_MOVEMENT_INTERVAL_HOURS = 3;
const MAX_STUDENT_MOVEMENT_INTERVAL_HOURS = 10;
const MIN_AFFECTION = -100;
const MAX_AFFECTION = 100;

class Student extends GameObject {
  constructor(name, classAndNumber, locationId, affection = 0) {
    super();
    this.name = name;
    this.classAndNumber = classAndNumber;
    this.locationId = locationId;
    this.affection = affection;
    this.nextMoveTimeHours = this.createNextMoveTime(0);
  }

  get affection() {
    return this._affection;
  }

  set affection(value) {
    this._affection = Math.min(MAX_AFFECTION, Math.max(MIN_AFFECTION, value));
  }

  update(context) {
    const gameTimeHours = context.gameTimeHours;
    if (typeof gameTimeHours !== 'number') {
      return;
    }

    if (gameTimeHours < this.nextMoveTimeHours) {
      return;
    }

    this.moveToRandomDestination();
    this.advanceNextMoveTime(gameTimeHours);
  }

  resetNextMoveTime(currentGameTimeHours) {
    this.nextMoveTimeHours = this.createNextMoveTime(currentGameTimeHours);
  }

  advanceNextMoveTime(currentGameTimeHours) {
    this.nextMoveTimeHours = this.createNextMoveTime(currentGameTimeHours);
  }

  createNextMoveTime(baseGameTimeHours) {
    return baseGameTimeHours + getRandomInt(
      MIN_STUDENT_MOVEMENT_INTERVAL_HOURS,
      MAX_STUDENT_MOVEMENT_INTERVAL_HOURS,
    );
  }

  moveToRandomDestination() {
    const currentLocation = findLocation(this.locationId);
    if (!currentLocation) {
      return false;
    }

    const destinationLocations = [
      currentLocation,
      ...currentLocation.destinations
        .map(destinationName => findLocationByName(destinationName))
        .filter(destinationLocation => destinationLocation !== null),
    ];
    const randomIndex = getRandomInt(0, destinationLocations.length - 1);
    this.locationId = destinationLocations[randomIndex].id;
    return true;
  }
}

export {
  Student,
};
