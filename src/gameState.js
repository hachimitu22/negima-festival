import { createEventListScene } from './eventListScene.js';

function createGameState() {
  return {
    frame: {
      beforeTime: null,
      deltaTime: 0,
      count: 0,
      targetFrameTimeMs: 1000 / 60,
    },
    currentScene: createEventListScene(),
  };
}

export {
  createGameState,
};
