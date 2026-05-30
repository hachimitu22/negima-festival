import { MENU_LIST } from './gameLogic.js';

function render(state, handlers) {
  hiddenMenu();
  hiddenBackButton();
  hiddenEvent();

  if (state.currentMenu === MENU_LIST.TOP_MENU) {
    visibilityMenu();
    renderMenu(state, handlers);
  } else if (state.currentMenu === MENU_LIST.EXECUTING_EVENTS_MENU) {
    visibilityBackButton();
    visibilityExecutingEvent();
    renderBackButton(state, handlers);
    renderExecutingEvents(state, handlers);
  } else if (state.currentMenu === MENU_LIST.SUCCEEDED_EVENTS_MENU) {
    visibilityBackButton();
    visibilitySucceededEvents();
    renderBackButton(state, handlers);
    renderCompletedEvents(
      document.getElementById('succeeded-event-list'),
      state.succeededEvents,
      '成功',
    );
  } else if (state.currentMenu === MENU_LIST.FAILED_EVENTS_MENU) {
    visibilityBackButton();
    visibilityFailedEvents();
    renderBackButton(state, handlers);
    renderCompletedEvents(
      document.getElementById('failed-event-list'),
      state.failedEvents,
      '失敗',
    );
  }
}

function renderMenu(state, handlers) {
  const menu = document.getElementById('menu');

  if (state.currentMenu !== MENU_LIST.TOP_MENU) {
    menu.style.display = 'none';
    return;
  }

  const menuItems = [
    { label: '実行中イベント', id: 'executing' },
    { label: '成功イベント', id: 'succeeded' },
    { label: '失敗イベント', id: 'failed' },
  ];
  const menuItemIds = new Set(menuItems.map(item => item.id));

  // レンダリング未完了のメニューがあるか。なければ再レンダリングしない。
  const completedRender = menu.children.length === 0 ? false : Array.from(menu.children).every(menuItem => {
    return menuItemIds.has(menuItem.dataset.eventId);
  });
  if (completedRender) {
    return;
  }

  menu.replaceChildren();
  menuItems.forEach(item => {
    const menuItem = document.createElement('li');
    menuItem.textContent = item.label;
    menuItem.dataset.eventId = item.id;
    menuItem.addEventListener('click', () => {
      handlers.onClickMenu(item.id);
    });
    menu.appendChild(menuItem);
  });
}

function visibilityMenu() {
  const menu = document.getElementById('menu');
  menu.style.display = 'block';
}

function hiddenMenu() {
  const menu = document.getElementById('menu');
  menu.style.display = 'none';
}

function renderBackButton(state, handlers) {
  const back = document.getElementById('back');

  if (back.querySelector('#back-button')) {
    return;
  }

  const backButton = document.createElement('button');
  backButton.id = 'back-button';
  backButton.type = 'button';
  backButton.textContent = 'メニューに戻る';
  backButton.addEventListener('click', () => {
    handlers.onClickMenu('top');
  });
  back.prepend(backButton);
}

function visibilityBackButton() {
  const back = document.getElementById('back');
  back.style.display = 'block';
}

function hiddenBackButton() {
  const back = document.getElementById('back');
  back.style.display = 'none';
}

function renderExecutingEvents(state, handlers) {
  const eventList = document.getElementById('event-list');
  const eventIds = new Set(state.events.map(event => String(event.id)));

  // 終了イベントをビューから削除する
  Array.from(eventList.children).forEach(eventItem => {
    if (!eventIds.has(eventItem.dataset.eventId)) {
      eventItem.remove();
    }
  });

  // 未表示の実行中イベントをビューに追加する
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

function visibilityExecutingEvent() {
  const eventList = document.getElementById('event-list');
  eventList.style.display = 'block';
}

function visibilitySucceededEvents() {
  const succeededEventList = document.getElementById('succeeded-event-list');
  succeededEventList.style.display = 'block';
}

function visibilityFailedEvents() {
  const failedEventList = document.getElementById('failed-event-list');
  failedEventList.style.display = 'block';
}

function hiddenExecutingEvent() {
  const eventList = document.getElementById('event-list');
  eventList.style.display = 'none';
}

function hiddenSucceededEvents() {
  const succeededEventList = document.getElementById('succeeded-event-list');
  succeededEventList.style.display = 'none';
}

function hiddenFailedEvents() {
  const failedEventList = document.getElementById('failed-event-list');
  failedEventList.style.display = 'none';
}

function hiddenEvent() {
  hiddenExecutingEvent();
  hiddenSucceededEvents();
  hiddenFailedEvents();
}

export {
  render,
};
