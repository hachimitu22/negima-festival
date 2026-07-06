import { GameObject } from '../../gameEngine/gameObject.js';
import { findLocation } from './locations.js';

class Character extends GameObject {
  constructor(locationId, { magicPower }) {
    super();
    this.locationId = locationId;
    this.magicPower = magicPower;
    this.mahoPayPoints = 0;
  }

  update(context) {
    this.#recoverMagicPower(context.elapsedGameHours);
  }

  #recoverMagicPower(elapsedGameHours) {
    if (elapsedGameHours <= 0) {
      return;
    }

    this.magicPower.current = Math.min(
      this.magicPower.max,
      this.magicPower.current + (elapsedGameHours * this.magicPower.recoveryPerGameHour),
    );
  }

  moveToLocation(locationId) {
    this.locationId = locationId;
  }

  addMahoPayPoints(points) {
    if (!Number.isInteger(points) || points < 0) {
      throw new TypeError('MahoPay points must be a non-negative integer.');
    }

    this.mahoPayPoints += points;
  }

  getSnapshot() {
    return {
      location: findLocation(this.locationId),
      magicPower: {
        current: this.magicPower.current,
        max: this.magicPower.max,
        recoveryPerGameHour: this.magicPower.recoveryPerGameHour,
      },
      mahoPayPoints: this.mahoPayPoints,
    };
  }
}

export {
  Character,
};
