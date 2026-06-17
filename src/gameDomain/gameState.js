import {
  CASSIOPEIA_MAGIC_POWER_COST,
  FESTIVAL_DURATION_HOURS,
  MAGIC_POWER_RECOVERY_PER_GAME_HOUR,
  MAX_MAGIC_POWER,
  TIME_TRAVEL_HOURS,
  createGameSystemSnapshot,
  createGameSystemState,
  moveCharacterToLocation as moveSystemCharacterToLocation,
  useCassiopeia as useSystemCassiopeia,
} from './gameSystem.js';

function createGameState() {
  return createGameSystemState();
}

function createGameSnapshot(state) {
  return createGameSystemSnapshot(state);
}

function useCassiopeia(state) {
  return Boolean(useSystemCassiopeia(state));
}

function moveCharacterToLocation(state, locationId) {
  return moveSystemCharacterToLocation(state, locationId);
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
  useCassiopeia,
};
