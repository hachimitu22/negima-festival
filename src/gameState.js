import { createMainGameScene } from './mainGameScene.js';
import { LOCATION_IDS, findLocation } from './locations.js';

const FESTIVAL_DURATION_HOURS = 72;
const TIME_TRAVEL_HOURS = 24;
const GAME_HOURS_PER_REAL_SECOND = 1;
const MAX_MAGIC_POWER = 100;
const CASSIOPEIA_MAGIC_POWER_COST = 30;
const MAGIC_POWER_RECOVERY_PER_GAME_HOUR = 5;

function createGameState() {
  return {
    frame: {
      beforeTime: null,
      deltaTime: 0,
      count: 0,
      targetFrameTimeMs: 1000 / 60,
    },
    gameTime: {
      currentHours: 0,
      durationHours: FESTIVAL_DURATION_HOURS,
      hoursPerRealSecond: GAME_HOURS_PER_REAL_SECOND,
      isEnded: false,
    },
    loop: {
      count: 1,
      timeTravelHours: TIME_TRAVEL_HOURS,
      cassiopeiaMagicPowerCost: CASSIOPEIA_MAGIC_POWER_COST,
    },
    character: {
      locationId: LOCATION_IDS.SCHOOL_BUILDING,
      magicPower: {
        current: MAX_MAGIC_POWER,
        max: MAX_MAGIC_POWER,
        recoveryPerGameHour: MAGIC_POWER_RECOVERY_PER_GAME_HOUR,
      },
    },
    knownEvents: new Set(),
    currentScene: createMainGameScene(),
  };
}

function updateGameState(state, now) {
  updateFrame(state, now);
  const elapsedGameHours = updateGameTime(state);
  recoverMagicPower(state, elapsedGameHours);
  state.currentScene.update(createUpdateContext(state));
}

function updateFrame(state, now) {
  const frame = state.frame;
  if (frame.beforeTime === null) {
    frame.beforeTime = now;
  }

  frame.deltaTime = now - frame.beforeTime;
  frame.beforeTime = now;
  frame.count += 1;
}

function updateGameTime(state) {
  if (state.gameTime.isEnded) {
    return 0;
  }

  const elapsedHours = (state.frame.deltaTime / 1000) * state.gameTime.hoursPerRealSecond;
  const beforeHours = state.gameTime.currentHours;
  state.gameTime.currentHours = Math.min(
    state.gameTime.currentHours + elapsedHours,
    state.gameTime.durationHours,
  );
  state.gameTime.isEnded = state.gameTime.currentHours >= state.gameTime.durationHours;
  return state.gameTime.currentHours - beforeHours;
}

function recoverMagicPower(state, elapsedGameHours) {
  if (elapsedGameHours <= 0) {
    return;
  }

  const magicPower = state.character.magicPower;
  magicPower.current = Math.min(
    magicPower.max,
    magicPower.current + (elapsedGameHours * magicPower.recoveryPerGameHour),
  );
}

function useCassiopeia(state) {
  const magicPower = state.character.magicPower;
  if (magicPower.current < state.loop.cassiopeiaMagicPowerCost) {
    return false;
  }

  magicPower.current -= state.loop.cassiopeiaMagicPowerCost;
  state.gameTime.currentHours = Math.max(
    0,
    state.gameTime.currentHours - state.loop.timeTravelHours,
  );
  state.gameTime.isEnded = false;
  state.loop.count += 1;
  state.currentScene.rewindTo(state.gameTime.currentHours);
  return true;
}

function moveCharacterToLocation(state, locationId) {
  const location = findLocation(locationId);
  if (!location) {
    return false;
  }

  state.character.locationId = location.id;
  return true;
}

function rememberEvent(state, eventName) {
  state.knownEvents.add(eventName);
}

function createGameSnapshot(state) {
  return {
    ...state.currentScene.createSnapshot(),
    gameTime: {
      currentHours: state.gameTime.currentHours,
      durationHours: state.gameTime.durationHours,
      isEnded: state.gameTime.isEnded,
    },
    loop: {
      count: state.loop.count,
      timeTravelHours: state.loop.timeTravelHours,
      cassiopeiaMagicPowerCost: state.loop.cassiopeiaMagicPowerCost,
    },
    character: {
      location: findLocation(state.character.locationId),
      magicPower: {
        current: state.character.magicPower.current,
        max: state.character.magicPower.max,
        recoveryPerGameHour: state.character.magicPower.recoveryPerGameHour,
      },
    },
    knownEvents: Array.from(state.knownEvents),
  };
}

function createUpdateContext(state) {
  return {
    deltaTimeMs: state.frame.deltaTime,
    frameCount: state.frame.count,
    targetFrameTimeMs: state.frame.targetFrameTimeMs,
    deltaFrames: state.frame.deltaTime / state.frame.targetFrameTimeMs,
    gameTimeHours: state.gameTime.currentHours,
    isFestivalEnded: state.gameTime.isEnded,
    rememberEvent: eventName => rememberEvent(state, eventName),
  };
}

export {
  CASSIOPEIA_MAGIC_POWER_COST,
  FESTIVAL_DURATION_HOURS,
  MAGIC_POWER_RECOVERY_PER_GAME_HOUR,
  MAX_MAGIC_POWER,
  TIME_TRAVEL_HOURS,
  createGameSnapshot,
  createGameState,
  moveCharacterToLocation,
  updateGameState,
  useCassiopeia,
};
