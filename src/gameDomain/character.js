import { GameObject } from '../gameEngine/gameObject.js';

class Character extends GameObject {
  constructor(locationId, { magicPower }) {
    super();
    this.locationId = locationId;
    this.magicPower = magicPower;
  }

  update(context) {
    this.recoverMagicPower(context.elapsedGameHours);
  }

  recoverMagicPower(elapsedGameHours) {
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
}

export {
  Character,
};
