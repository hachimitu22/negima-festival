import { GameObject } from '../../gameEngine/gameObject.js';
import { findLocation, findLocationByName } from './locations.js';
import { getRandomInt } from '../random.js';

const MIN_MOVEMENT_INTERVAL_HOURS = 3;
const MAX_MOVEMENT_INTERVAL_HOURS = 10;
const ACTOR_MOVEMENT_MODES = Object.freeze({
  AUTOMATIC: 'automatic',
  EXTERNAL: 'external',
});

class Actor extends GameObject {
  #excludedLocationIds;
  #movementMode;
  #nextMoveTimeHours;

  constructor(id, name, locationId, { excludedLocationIds = [] } = {}) {
    super();
    this.id = id;
    this.name = name;
    this.locationId = locationId;
    this.#excludedLocationIds = new Set(excludedLocationIds);
    this.#movementMode = ACTOR_MOVEMENT_MODES.AUTOMATIC;
    this.#nextMoveTimeHours = this.#createNextMoveTime(0);
  }

  update(context) {
    this.#updateAutomaticMovement(context);
  }

  #updateAutomaticMovement({ gameTimeHours }) {
    if (this.#movementMode !== ACTOR_MOVEMENT_MODES.AUTOMATIC) {
      return;
    }

    if (typeof gameTimeHours !== 'number') {
      return;
    }

    if (gameTimeHours < this.#nextMoveTimeHours) {
      return;
    }

    this.#moveToRandomDestination();
    this.#advanceNextMoveTime(gameTimeHours);
  }

  resetNextMoveTime(currentGameTimeHours) {
    this.#nextMoveTimeHours = this.#createNextMoveTime(currentGameTimeHours);
  }

  moveToLocation(locationId) {
    this.locationId = locationId;
  }

  setMovementMode(movementMode) {
    if (!Object.values(ACTOR_MOVEMENT_MODES).includes(movementMode)) {
      return false;
    }

    this.#movementMode = movementMode;
    return true;
  }

  #advanceNextMoveTime(currentGameTimeHours) {
    this.#nextMoveTimeHours = this.#createNextMoveTime(currentGameTimeHours);
  }

  #createNextMoveTime(baseGameTimeHours) {
    return baseGameTimeHours + getRandomInt(
      MIN_MOVEMENT_INTERVAL_HOURS,
      MAX_MOVEMENT_INTERVAL_HOURS,
    );
  }

  #moveToRandomDestination() {
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
          && !this.#excludedLocationIds.has(destinationLocation.id)
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
  ACTOR_MOVEMENT_MODES,
  Actor,
};
