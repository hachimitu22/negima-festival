import { createEventListScene } from './eventListScene.js';

const FESTIVAL_DURATION_HOURS = 72;
const TIME_TRAVEL_HOURS = 24;
const GAME_HOURS_PER_REAL_SECOND = 1;

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
    },
    knownEvents: new Set(),
    currentScene: createEventListScene(),
  };
}

function updateGameState(state) {
  updateGameTime(state);
  state.currentScene.update(createUpdateContext(state));
}

function updateGameTime(state) {
  if (state.gameTime.isEnded) {
    return;
  }

  const elapsedHours = (state.frame.deltaTime / 1000) * state.gameTime.hoursPerRealSecond;
  state.gameTime.currentHours = Math.min(
    state.gameTime.currentHours + elapsedHours,
    state.gameTime.durationHours,
  );
  state.gameTime.isEnded = state.gameTime.currentHours >= state.gameTime.durationHours;
}

function useCassiopeia(state) {
  state.gameTime.currentHours = Math.max(
    0,
    state.gameTime.currentHours - state.loop.timeTravelHours,
  );
  state.gameTime.isEnded = false;
  state.loop.count += 1;
  state.currentScene.rewindTo(state.gameTime.currentHours);
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
  FESTIVAL_DURATION_HOURS,
  TIME_TRAVEL_HOURS,
  createGameSnapshot,
  createGameState,
  updateGameState,
  useCassiopeia,
};
