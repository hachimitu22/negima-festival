import { handlerClickMenu, handleClickEvent, handleInputChange, handleInputSubmit } from './src/gameController.js';
import { updateGame } from './src/gameLogic.js';
import { createGameState } from './src/gameState.js';
import { render } from './src/gameView.js';

const gameState = createGameState();
const viewHandlers = {
  onClickMenu: menuId => {
    handlerClickMenu(gameState, menuId);
  },
  onClickEvent: eventId => {
    handleClickEvent(gameState, eventId);
  },
  onInputChange: (eventId, value) => {
    handleInputChange(gameState, eventId, value);
  },
  onInputSubmit: eventId => {
    handleInputSubmit(gameState, eventId);
  },
};

window.addEventListener('load', () => {
  main();
});

function main() {
  requestAnimationFrame(mainLoop);
}

function mainLoop(now) {
  updateFrame(gameState, now);
  updateGame(gameState);
  render(gameState, viewHandlers);

  requestAnimationFrame(mainLoop);
}

function updateFrame(state, now) {
  const frame = state.frame;
  if (frame.beforeTime === null) {
    frame.beforeTime = now;
  }

  frame.deltaTime = now - frame.beforeTime;
  frame.beforeTime = now;
}
