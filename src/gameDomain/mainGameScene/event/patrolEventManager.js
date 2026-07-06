import { getRandomInt } from '../../random.js';
import { LOCATION_IDS, LOCATIONS } from '../locations.js';
import { PatrolEvent } from './patrolEvent.js';

const PATROL_INTERVAL_HOURS = 12;

class PatrolEventManager {
  #character;
  #eventIdSequence;
  #durationHours;
  #activeEvent;
  #nextPatrolTimeHours;

  constructor({ character, eventIdSequence, durationHours }) {
    this.#character = character;
    this.#eventIdSequence = eventIdSequence;
    this.#durationHours = durationHours;
    this.#activeEvent = this.#createEvent();
    this.#nextPatrolTimeHours = PATROL_INTERVAL_HOURS;
  }

  advanceTo(currentHours) {
    while (
      this.#nextPatrolTimeHours < this.#durationHours
      && this.#nextPatrolTimeHours <= currentHours
    ) {
      if (!this.#activeEvent) {
        this.#activeEvent = this.#createEvent();
      }
      this.#nextPatrolTimeHours += PATROL_INTERVAL_HOURS;
    }
  }

  visitCurrentLocation() {
    if (!this.#activeEvent) {
      return false;
    }

    const didVisit = this.#activeEvent.visitLocation(
      this.#character.locationId,
    );
    if (!didVisit || !this.#activeEvent.isSucceeded()) {
      return didVisit;
    }

    const rewardPoints = this.#activeEvent.claimRewardPoints();
    if (rewardPoints !== null) {
      this.#character.addMahoPayPoints(rewardPoints);
    }
    this.#activeEvent = null;
    return true;
  }

  rewindTo(currentHours) {
    this.#activeEvent = null;
    this.#nextPatrolTimeHours = (
      Math.floor(currentHours / PATROL_INTERVAL_HOURS) + 1
    ) * PATROL_INTERVAL_HOURS;
  }

  getExecutingEventSnapshot() {
    return this.#activeEvent?.getSnapshot() ?? null;
  }

  #createEvent() {
    const excludedLocationIds = new Set([
      this.#character.locationId,
      LOCATION_IDS.GIRLS_BATHROOM,
      LOCATION_IDS.GYM_CHANGING_ROOM,
    ]);
    const candidates = LOCATIONS.filter(location => (
      !excludedLocationIds.has(location.id)
    ));
    const destinationCount = getRandomInt(1, 3);
    const destinations = [];

    while (destinations.length < destinationCount) {
      const candidateIndex = getRandomInt(0, candidates.length - 1);
      destinations.push(candidates.splice(candidateIndex, 1)[0]);
    }

    return new PatrolEvent(this.#eventIdSequence.next(), { destinations });
  }
}

export {
  PatrolEventManager,
};
