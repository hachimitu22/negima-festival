import { LOCATION_IDS, findLocation } from './locations.js';

const FESTIVAL_DURATION_HOURS = 72;
const TIME_TRAVEL_HOURS = 24;
const GAME_HOURS_PER_REAL_SECOND = 1;
const MAX_MAGIC_POWER = 100;
const CASSIOPEIA_MAGIC_POWER_COST = 30;
const MAGIC_POWER_RECOVERY_PER_GAME_HOUR = 5;

class GameSystem {
  constructor() {
    this.gameTime = {
      currentHours: 0,
      durationHours: FESTIVAL_DURATION_HOURS,
      hoursPerRealSecond: GAME_HOURS_PER_REAL_SECOND,
      isEnded: false,
    };
    this.loop = {
      count: 1,
      timeTravelHours: TIME_TRAVEL_HOURS,
      cassiopeiaMagicPowerCost: CASSIOPEIA_MAGIC_POWER_COST,
    };
    this.character = {
      locationId: LOCATION_IDS.GYM_FRONT_PARKING,
      magicPower: {
        current: MAX_MAGIC_POWER,
        max: MAX_MAGIC_POWER,
        recoveryPerGameHour: MAGIC_POWER_RECOVERY_PER_GAME_HOUR,
      },
    };
    this.knownEvents = new Set();
  }

  update(frame) {
    const elapsedGameHours = this.updateGameTime(frame);
    this.recoverMagicPower(elapsedGameHours);
    return {
      elapsedGameHours,
    };
  }

  updateGameTime(frame) {
    if (this.gameTime.isEnded) {
      return 0;
    }

    const deltaTimeMs = getFrameDeltaTimeMs(frame);
    const elapsedHours = (deltaTimeMs / 1000) * this.gameTime.hoursPerRealSecond;
    const beforeHours = this.gameTime.currentHours;
    this.gameTime.currentHours = Math.min(
      this.gameTime.currentHours + elapsedHours,
      this.gameTime.durationHours,
    );
    this.gameTime.isEnded = this.gameTime.currentHours >= this.gameTime.durationHours;
    return this.gameTime.currentHours - beforeHours;
  }

  recoverMagicPower(elapsedGameHours) {
    if (elapsedGameHours <= 0) {
      return;
    }

    const magicPower = this.character.magicPower;
    magicPower.current = Math.min(
      magicPower.max,
      magicPower.current + (elapsedGameHours * magicPower.recoveryPerGameHour),
    );
  }

  useCassiopeia() {
    const magicPower = this.character.magicPower;
    if (magicPower.current < this.loop.cassiopeiaMagicPowerCost) {
      return false;
    }

    magicPower.current -= this.loop.cassiopeiaMagicPowerCost;
    this.gameTime.currentHours = Math.max(
      0,
      this.gameTime.currentHours - this.loop.timeTravelHours,
    );
    this.gameTime.isEnded = false;
    this.loop.count += 1;
    return {
      currentHours: this.gameTime.currentHours,
    };
  }

  moveCharacterToLocation(locationId) {
    const location = findLocation(locationId);
    if (!location) {
      return false;
    }

    this.character.locationId = location.id;
    return true;
  }

  createSnapshot() {
    return {
      gameTime: {
        currentHours: this.gameTime.currentHours,
        durationHours: this.gameTime.durationHours,
        isEnded: this.gameTime.isEnded,
      },
      loop: {
        count: this.loop.count,
        timeTravelHours: this.loop.timeTravelHours,
        cassiopeiaMagicPowerCost: this.loop.cassiopeiaMagicPowerCost,
      },
      character: {
        location: findLocation(this.character.locationId),
        magicPower: {
          current: this.character.magicPower.current,
          max: this.character.magicPower.max,
          recoveryPerGameHour: this.character.magicPower.recoveryPerGameHour,
        },
      },
      knownEvents: Array.from(this.knownEvents),
    };
  }

  createUpdateContext(frame) {
    const deltaTimeMs = getFrameDeltaTimeMs(frame);
    const targetFrameTimeMs = frame.targetFrameTimeMs;
    return {
      deltaTimeMs,
      frameCount: getFrameCount(frame),
      targetFrameTimeMs,
      deltaFrames: deltaTimeMs / targetFrameTimeMs,
      gameTimeHours: this.gameTime.currentHours,
      isFestivalEnded: this.gameTime.isEnded,
      rememberEvent: eventName => this.rememberEvent(eventName),
    };
  }

  rememberEvent(eventName) {
    this.knownEvents.add(eventName);
  }
}

function getFrameDeltaTimeMs(frame) {
  return typeof frame.deltaTimeMs === 'number' ? frame.deltaTimeMs : frame.deltaTime;
}

function getFrameCount(frame) {
  return typeof frame.frameCount === 'number' ? frame.frameCount : frame.count;
}

export {
  CASSIOPEIA_MAGIC_POWER_COST,
  FESTIVAL_DURATION_HOURS,
  MAGIC_POWER_RECOVERY_PER_GAME_HOUR,
  MAX_MAGIC_POWER,
  TIME_TRAVEL_HOURS,
  GameSystem,
};
