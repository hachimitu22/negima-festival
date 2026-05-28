function render(state, handlers) {
  renderExecutingEvents(state, handlers);
  renderCompletedEvents(
    document.getElementById('succeeded-event-list'),
    state.succeededEvents,
    '成功',
  );
  renderCompletedEvents(
    document.getElementById('failed-event-list'),
    state.failedEvents,
    '失敗',
  );
}

function renderExecutingEvents(state, handlers) {
  const eventList = document.getElementById('event-list');
  const eventIds = new Set(state.events.map(event => String(event.id)));

  Array.from(eventList.children).forEach(eventItem => {
    if (!eventIds.has(eventItem.dataset.eventId)) {
      eventItem.remove();
    }
  });

  state.events.forEach(event => {
    const eventItem = getOrCreateExecutingEventItem(state, handlers, event);
    eventItem.querySelector('[data-event-label]').textContent = formatExecutingEvent(event);

    if (!eventItem.isConnected) {
      eventList.appendChild(eventItem);
    }
  });
}

function getOrCreateExecutingEventItem(state, handlers, event) {
  const eventList = document.getElementById('event-list');
  const existingItem = eventList.querySelector(`[data-event-id="${event.id}"]`);
  if (existingItem) {
    return existingItem;
  }

  const eventItem = document.createElement('li');
  const label = document.createElement('span');
  const action = createEventAction(state, handlers, event);

  eventItem.id = `event-${event.id}`;
  eventItem.dataset.eventId = String(event.id);

  label.dataset.eventLabel = '';
  eventItem.appendChild(label);

  if (action) {
    eventItem.appendChild(action);
  }

  return eventItem;
}

function createEventAction(state, handlers, event) {
  if (event.type === 'click') {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = '成功';
    button.addEventListener('click', () => {
      handlers.onClickEvent(event.id);
    });
    return button;
  }

  if (event.type === 'input') {
    const form = document.createElement('form');
    const input = document.createElement('input');
    const button = document.createElement('button');

    input.type = 'text';
    input.value = state.inputValues[event.id] ?? '';
    input.placeholder = event.targetInput;
    input.addEventListener('input', () => {
      handlers.onInputChange(event.id, input.value);
    });

    button.type = 'submit';
    button.textContent = '送信';

    form.addEventListener('submit', submitEvent => {
      submitEvent.preventDefault();
      handlers.onInputSubmit(event.id);
    });

    form.append(input, button);
    return form;
  }

  return null;
}

function renderCompletedEvents(eventList, events, statusText) {
  eventList.replaceChildren();

  events.forEach(event => {
    const eventItem = document.createElement('li');
    eventItem.textContent = formatCompletedEvent(event, statusText);
    eventList.appendChild(eventItem);
  });
}

function formatExecutingEvent(event) {
  return `${event.id}: ${event.name}: ${event.description} (残り時間: ${Math.ceil(event.limitTimeMs / 1000)}秒)`;
}

function formatCompletedEvent(event, statusText) {
  return `${event.id}: ${event.name}: ${event.description} (${statusText})`;
}

export {
  render,
};
