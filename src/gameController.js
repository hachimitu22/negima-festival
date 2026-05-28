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
  handleClickEvent,
  handleInputChange,
  handleInputSubmit,
};
