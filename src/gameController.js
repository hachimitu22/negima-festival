import { MENU_LIST } from './gameLogic.js';

function handlerClickMenu(state, menuId) {
  if (menuId === 'executing') {
    state.currentMenu = MENU_LIST.EXECUTING_EVENTS_MENU;
  } else if (menuId === 'succeeded') {
    state.currentMenu = MENU_LIST.SUCCEEDED_EVENTS_MENU;
  } else if (menuId === 'failed') {
    state.currentMenu = MENU_LIST.FAILED_EVENTS_MENU;
  } else if (menuId === 'top') {
    state.currentMenu = MENU_LIST.TOP_MENU;
  }
}

function handleClickEvent(state, eventId) {
  const event = findExecutingEvent(state, eventId);
  if (event && event.type === 'click') {
    event.click();
  }
}

function handleInputChange(state, eventId, value) {
  state.inputValues[eventId] = value;
}

function handleInputSubmit(state, eventId) {
  const event = findExecutingEvent(state, eventId);
  if (event && event.type === 'input') {
    event.submit(state.inputValues[eventId] ?? '');
  }
}

function findExecutingEvent(state, eventId) {
  return state.events.find(event => event.id === eventId);
}

export {
  handlerClickMenu,
  handleClickEvent,
  handleInputChange,
  handleInputSubmit,
};
