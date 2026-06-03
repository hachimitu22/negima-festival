import { ACTION_TYPES, MENU_IDS } from './actions.js';

function createDomGameView() {
  let elements = null;
  let dispatch = null;

  function mount(rootElement, options) {
    dispatch = options.dispatch;
    elements = {
      root: rootElement,
      menu: rootElement.querySelector('#menu'),
      back: rootElement.querySelector('#back'),
      eventList: rootElement.querySelector('#event-list'),
      succeededEventList: rootElement.querySelector('#succeeded-event-list'),
      failedEventList: rootElement.querySelector('#failed-event-list'),
    };
  }

  function render(snapshot) {
    hideAll();

    if (snapshot.currentMenu === MENU_IDS.TOP) {
      show(elements.menu);
      renderMenu(snapshot);
    } else if (snapshot.currentMenu === MENU_IDS.EXECUTING) {
      show(elements.back);
      show(elements.eventList);
      renderBackButton();
      renderExecutingEvents(snapshot.executingEvents);
    } else if (snapshot.currentMenu === MENU_IDS.SUCCEEDED) {
      show(elements.back);
      show(elements.succeededEventList);
      renderBackButton();
      renderCompletedEvents(elements.succeededEventList, snapshot.succeededEvents, '成功');
    } else if (snapshot.currentMenu === MENU_IDS.FAILED) {
      show(elements.back);
      show(elements.failedEventList);
      renderBackButton();
      renderCompletedEvents(elements.failedEventList, snapshot.failedEvents, '失敗');
    }
  }

  function destroy() {
    if (!elements) {
      return;
    }

    elements.menu.replaceChildren();
    elements.back.replaceChildren();
    elements.eventList.replaceChildren();
    elements.succeededEventList.replaceChildren();
    elements.failedEventList.replaceChildren();
    elements = null;
    dispatch = null;
  }

  function renderMenu(snapshot) {
    const menuItemIds = new Set(snapshot.menuItems.map(item => item.id));
    const completedRender = elements.menu.children.length > 0
      && Array.from(elements.menu.children).every(menuItem => menuItemIds.has(menuItem.dataset.menuId));

    if (completedRender) {
      return;
    }

    elements.menu.replaceChildren();
    snapshot.menuItems.forEach(item => {
      const menuItem = document.createElement('li');
      menuItem.textContent = item.label;
      menuItem.dataset.menuId = item.id;
      menuItem.addEventListener('click', () => {
        dispatch({
          type: ACTION_TYPES.MENU_SELECT,
          menuId: item.id,
        });
      });
      elements.menu.appendChild(menuItem);
    });
  }

  function renderBackButton() {
    if (elements.back.querySelector('#back-button')) {
      return;
    }

    const backButton = document.createElement('button');
    backButton.id = 'back-button';
    backButton.type = 'button';
    backButton.textContent = 'メニューに戻る';
    backButton.addEventListener('click', () => {
      dispatch({
        type: ACTION_TYPES.MENU_SELECT,
        menuId: MENU_IDS.TOP,
      });
    });
    elements.back.prepend(backButton);
  }

  function renderExecutingEvents(events) {
    const eventIds = new Set(events.map(event => String(event.id)));

    Array.from(elements.eventList.children).forEach(eventItem => {
      if (!eventIds.has(eventItem.dataset.eventId)) {
        eventItem.remove();
      }
    });

    events.forEach(event => {
      const eventItem = getOrCreateExecutingEventItem(event);
      eventItem.querySelector('[data-event-label]').textContent = formatExecutingEvent(event);

      if (!eventItem.isConnected) {
        elements.eventList.appendChild(eventItem);
      }
    });
  }

  function getOrCreateExecutingEventItem(event) {
    const existingItem = elements.eventList.querySelector(`[data-event-id="${event.id}"]`);
    if (existingItem) {
      return existingItem;
    }

    const eventItem = document.createElement('li');
    const label = document.createElement('span');
    const action = createEventAction(event);

    eventItem.id = `event-${event.id}`;
    eventItem.dataset.eventId = String(event.id);

    label.dataset.eventLabel = '';
    eventItem.appendChild(label);

    if (action) {
      eventItem.appendChild(action);
    }

    return eventItem;
  }

  function createEventAction(event) {
    if (event.type === 'click') {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '成功';
      button.addEventListener('click', () => {
        dispatch({
          type: ACTION_TYPES.EVENT_CLICK,
          eventId: event.id,
        });
      });
      return button;
    }

    if (event.type === 'input') {
      const form = document.createElement('form');
      const input = document.createElement('input');
      const button = document.createElement('button');

      input.type = 'text';
      input.value = event.inputValue ?? '';
      input.placeholder = event.targetInput;
      input.addEventListener('input', () => {
        dispatch({
          type: ACTION_TYPES.EVENT_INPUT_CHANGE,
          eventId: event.id,
          value: input.value,
        });
      });

      button.type = 'submit';
      button.textContent = '送信';

      form.addEventListener('submit', submitEvent => {
        submitEvent.preventDefault();
        dispatch({
          type: ACTION_TYPES.EVENT_INPUT_SUBMIT,
          eventId: event.id,
        });
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

  function hideAll() {
    hide(elements.menu);
    hide(elements.back);
    hide(elements.eventList);
    hide(elements.succeededEventList);
    hide(elements.failedEventList);
  }

  return {
    mount,
    render,
    destroy,
  };
}

function show(element) {
  element.style.display = 'block';
}

function hide(element) {
  element.style.display = 'none';
}

function formatExecutingEvent(event) {
  return `${event.id}: ${event.name}: ${event.description} (残り時間: ${event.remainingSeconds}秒)`;
}

function formatCompletedEvent(event, statusText) {
  return `${event.id}: ${event.name}: ${event.description} (${statusText})`;
}

export {
  createDomGameView,
};
