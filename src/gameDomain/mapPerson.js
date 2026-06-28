import { GameObject } from '../gameEngine/gameObject.js';
import { findLocation, findLocationByName } from './locations.js';
import { getRandomInt } from './random.js';

const MIN_MOVEMENT_INTERVAL_HOURS = 3;
const MAX_MOVEMENT_INTERVAL_HOURS = 10;

class MapPerson extends GameObject {
  constructor(id, name, locationId, { excludedLocationIds = [] } = {}) {
    super();
    this.id = id;
    this.name = name;
    this.locationId = locationId;
    this.excludedLocationIds = new Set(excludedLocationIds);
    this.nextMoveTimeHours = this.createNextMoveTime(0);
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
      MIN_MOVEMENT_INTERVAL_HOURS,
      MAX_MOVEMENT_INTERVAL_HOURS,
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
        .filter(destinationLocation => (
          destinationLocation !== null
          && !this.excludedLocationIds.has(destinationLocation.id)
        )),
    ];
    const randomIndex = getRandomInt(0, destinationLocations.length - 1);
    this.locationId = destinationLocations[randomIndex].id;
    return true;
  }

  getSnapshot() {
    return {
      id: this.id,
      name: this.name,
      location: findLocation(this.locationId),
    };
  }
}

export {
  MapPerson,
};
