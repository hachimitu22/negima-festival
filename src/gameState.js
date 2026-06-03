import { createEventListScene } from './eventListScene.js';

function createGameState() {
  return {
    frame: {
      beforeTime: null,
      deltaTime: 0,
    },
    currentScene: createEventListScene(),
  };
}

export {
  createGameState,
};
