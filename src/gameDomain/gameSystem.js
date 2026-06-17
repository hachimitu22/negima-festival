import { LOCATION_IDS, findLocation } from './locations.js';

const FESTIVAL_DURATION_HOURS = 72;
const TIME_TRAVEL_HOURS = 24;
const GAME_HOURS_PER_REAL_SECOND = 1;
const MAX_MAGIC_POWER = 100;
const CASSIOPEIA_MAGIC_POWER_COST = 30;
const MAGIC_POWER_RECOVERY_PER_GAME_HOUR = 5;

function createGameSystemState() {
  return {
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
  };
}

function createGameSystem() {
  const state = createGameSystemState();

  return {
    state,
    createSnapshot: () => createGameSystemSnapshot(state),
    createUpdateContext: frame => createGameSystemUpdateContext(state, frame),
    moveCharacterToLocation: locationId => moveCharacterToLocation(state, locationId),
    update: frame => updateGameSystem(state, frame),
    useCassiopeia: () => useCassiopeia(state),
  };
}

function updateGameSystem(systemState, frame) {
  const elapsedGameHours = updateGameTime(systemState, frame);
  recoverMagicPower(systemState, elapsedGameHours);
  return {
    elapsedGameHours,
  };
}

function updateGameTime(systemState, frame) {
  if (systemState.gameTime.isEnded) {
    return 0;
  }

  const deltaTimeMs = getFrameDeltaTimeMs(frame);
  const elapsedHours = (deltaTimeMs / 1000) * systemState.gameTime.hoursPerRealSecond;
  const beforeHours = systemState.gameTime.currentHours;
  systemState.gameTime.currentHours = Math.min(
    systemState.gameTime.currentHours + elapsedHours,
    systemState.gameTime.durationHours,
  );
  systemState.gameTime.isEnded = systemState.gameTime.currentHours >= systemState.gameTime.durationHours;
  return systemState.gameTime.currentHours - beforeHours;
}

function recoverMagicPower(systemState, elapsedGameHours) {
  if (elapsedGameHours <= 0) {
    return;
  }

  const magicPower = systemState.character.magicPower;
  magicPower.current = Math.min(
    magicPower.max,
    magicPower.current + (elapsedGameHours * magicPower.recoveryPerGameHour),
  );
}

function useCassiopeia(systemState) {
  const magicPower = systemState.character.magicPower;
  if (magicPower.current < systemState.loop.cassiopeiaMagicPowerCost) {
    return false;
  }

  magicPower.current -= systemState.loop.cassiopeiaMagicPowerCost;
  systemState.gameTime.currentHours = Math.max(
    0,
    systemState.gameTime.currentHours - systemState.loop.timeTravelHours,
  );
  systemState.gameTime.isEnded = false;
  systemState.loop.count += 1;
  return {
    currentHours: systemState.gameTime.currentHours,
  };
}

function moveCharacterToLocation(systemState, locationId) {
  const location = findLocation(locationId);
  if (!location) {
    return false;
  }

  systemState.character.locationId = location.id;
  return true;
}

function createGameSystemSnapshot(systemState) {
  return {
    gameTime: {
      currentHours: systemState.gameTime.currentHours,
      durationHours: systemState.gameTime.durationHours,
      isEnded: systemState.gameTime.isEnded,
    },
    loop: {
      count: systemState.loop.count,
      timeTravelHours: systemState.loop.timeTravelHours,
      cassiopeiaMagicPowerCost: systemState.loop.cassiopeiaMagicPowerCost,
    },
    character: {
      location: findLocation(systemState.character.locationId),
      magicPower: {
        current: systemState.character.magicPower.current,
        max: systemState.character.magicPower.max,
        recoveryPerGameHour: systemState.character.magicPower.recoveryPerGameHour,
      },
    },
    knownEvents: Array.from(systemState.knownEvents),
  };
}

function createGameSystemUpdateContext(systemState, frame) {
  const deltaTimeMs = getFrameDeltaTimeMs(frame);
  const targetFrameTimeMs = frame.targetFrameTimeMs;
  return {
    deltaTimeMs,
    frameCount: getFrameCount(frame),
    targetFrameTimeMs,
    deltaFrames: deltaTimeMs / targetFrameTimeMs,
    gameTimeHours: systemState.gameTime.currentHours,
    isFestivalEnded: systemState.gameTime.isEnded,
    rememberEvent: eventName => rememberEvent(systemState, eventName),
  };
}

function getFrameDeltaTimeMs(frame) {
  return typeof frame.deltaTimeMs === 'number' ? frame.deltaTimeMs : frame.deltaTime;
}

function getFrameCount(frame) {
  return typeof frame.frameCount === 'number' ? frame.frameCount : frame.count;
}

function rememberEvent(systemState, eventName) {
  systemState.knownEvents.add(eventName);
}

export {
  CASSIOPEIA_MAGIC_POWER_COST,
  FESTIVAL_DURATION_HOURS,
  MAGIC_POWER_RECOVERY_PER_GAME_HOUR,
  MAX_MAGIC_POWER,
  TIME_TRAVEL_HOURS,
  createGameSystem,
  createGameSystemSnapshot,
  createGameSystemState,
  createGameSystemUpdateContext,
  moveCharacterToLocation,
  updateGameSystem,
  useCassiopeia,
};
