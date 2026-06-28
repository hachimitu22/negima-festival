import { GameObject } from '../gameEngine/gameObject.js';
import { findLocation } from './locations.js';

class Character extends GameObject {
  constructor(locationId, { magicPower }) {
    super();
    this.locationId = locationId;
    this.magicPower = magicPower;
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

  getSnapshot() {
    return {
      location: findLocation(this.locationId),
      magicPower: {
        current: this.magicPower.current,
        max: this.magicPower.max,
        recoveryPerGameHour: this.magicPower.recoveryPerGameHour,
      },
    };
  }
}

export {
  Character,
};
