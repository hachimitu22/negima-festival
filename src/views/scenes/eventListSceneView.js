import { ACTION_TYPES, MENU_IDS } from '../../actions.js';

function createEventListSceneView() {
  let elements = null;
  let dispatch = null;
  let activeMenu = null;

  function mount(rootElement, options) {
    dispatch = options.dispatch;
    elements = {
      menu: createRegion(rootElement.querySelector('#menu')),
      back: createRegion(rootElement.querySelector('#back')),
      eventList: createRegion(rootElement.querySelector('#event-list')),
      succeededEventList: createRegion(rootElement.querySelector('#succeeded-event-list')),
      failedEventList: createRegion(rootElement.querySelector('#failed-event-list')),
    };
  }

  function init(snapshot) {
    update(snapshot);
  }

  function update(snapshot) {
    updateActiveMenu(snapshot.currentMenu);

    if (snapshot.currentMenu === MENU_IDS.TOP) {
      updateMenu(snapshot);
    } else if (snapshot.currentMenu === MENU_IDS.EXECUTING) {
      updateBackButton();
      updateExecutingEvents(snapshot.executingEvents);
    } else if (snapshot.currentMenu === MENU_IDS.SUCCEEDED) {
      updateBackButton();
      updateCompletedEvents(elements.succeededEventList.element, snapshot.succeededEvents, '成功');
    } else if (snapshot.currentMenu === MENU_IDS.FAILED) {
      updateBackButton();
      updateCompletedEvents(elements.failedEventList.element, snapshot.failedEvents, '失敗');
    }
  }

  function destroy() {
    if (!elements) {
      return;
    }

    Object.values(elements).forEach(region => {
      region.element.replaceChildren();
      region.element.remove();
      region.anchor.remove();
    });
    elements = null;
    dispatch = null;
    activeMenu = null;
  }

  function updateActiveMenu(currentMenu) {
    if (activeMenu === currentMenu) {
      return;
    }

    detachInactiveRegions(currentMenu);
    attachActiveRegions(currentMenu);
    activeMenu = currentMenu;
  }

  function detachInactiveRegions(currentMenu) {
    getInactiveRegions(currentMenu).forEach(region => {
      region.element.remove();
    });
  }

  function attachActiveRegions(currentMenu) {
    getActiveRegions(currentMenu).forEach(region => {
      if (!region.element.isConnected) {
        region.anchor.after(region.element);
      }
    });
  }

  function getActiveRegions(currentMenu) {
    if (currentMenu === MENU_IDS.TOP) {
      return [elements.menu];
    }

    if (currentMenu === MENU_IDS.EXECUTING) {
      return [elements.back, elements.eventList];
    }

    if (currentMenu === MENU_IDS.SUCCEEDED) {
      return [elements.back, elements.succeededEventList];
    }

    if (currentMenu === MENU_IDS.FAILED) {
      return [elements.back, elements.failedEventList];
    }

    return [];
  }

  function getInactiveRegions(currentMenu) {
    const activeRegions = new Set(getActiveRegions(currentMenu));
    return Object.values(elements).filter(region => !activeRegions.has(region));
  }

  function updateMenu(snapshot) {
    const menuItemIds = new Set(snapshot.menuItems.map(item => item.id));

    Array.from(elements.menu.element.children).forEach(menuItem => {
      if (!menuItemIds.has(menuItem.dataset.menuId)) {
        menuItem.remove();
      }
    });

    snapshot.menuItems.forEach(item => {
      const menuItem = getOrCreateMenuItem(item);
      menuItem.textContent = item.label;

      if (!menuItem.isConnected) {
        elements.menu.element.appendChild(menuItem);
      }
    });
  }

  function getOrCreateMenuItem(item) {
    const existingItem = elements.menu.element.querySelector(`[data-menu-id="${item.id}"]`);
    if (existingItem) {
      return existingItem;
    }

    const menuItem = document.createElement('li');
    menuItem.dataset.menuId = item.id;
    menuItem.addEventListener('click', () => {
      dispatch({
        type: ACTION_TYPES.MENU_SELECT,
        menuId: item.id,
      });
    });
    return menuItem;
  }

  function updateBackButton() {
    if (elements.back.element.querySelector('#back-button')) {
      return;
    }

    createBackButton();
  }

  function createBackButton() {
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
    elements.back.element.prepend(backButton);
  }

  function updateExecutingEvents(events) {
    const eventIds = new Set(events.map(event => String(event.id)));

    Array.from(elements.eventList.element.children).forEach(eventItem => {
      if (!eventIds.has(eventItem.dataset.eventId)) {
        eventItem.remove();
      }
    });

    events.forEach(event => {
      const eventItem = getOrCreateExecutingEventItem(event);
      eventItem.querySelector('[data-event-label]').textContent = formatExecutingEvent(event);

      if (!eventItem.isConnected) {
        elements.eventList.element.appendChild(eventItem);
      }
    });
  }

  function getOrCreateExecutingEventItem(event) {
    const existingItem = elements.eventList.element.querySelector(`[data-event-id="${event.id}"]`);
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

  function updateCompletedEvents(eventList, events, statusText) {
    const eventIds = new Set(events.map(event => String(event.id)));

    Array.from(eventList.children).forEach(eventItem => {
      if (!eventIds.has(eventItem.dataset.eventId)) {
        eventItem.remove();
      }
    });

    events.forEach(event => {
      const eventItem = getOrCreateCompletedEventItem(eventList, event);
      eventItem.textContent = formatCompletedEvent(event, statusText);

      if (!eventItem.isConnected) {
        eventList.appendChild(eventItem);
      }
    });
  }

  function getOrCreateCompletedEventItem(eventList, event) {
    const existingItem = eventList.querySelector(`[data-event-id="${event.id}"]`);
    if (existingItem) {
      return existingItem;
    }

    const eventItem = document.createElement('li');
    eventItem.dataset.eventId = String(event.id);
    return eventItem;
  }

  return {
    destroy,
    init,
    mount,
    update,
  };
}

function createRegion(element) {
  const anchor = document.createComment(`${element.id}-anchor`);
  element.before(anchor);
  return {
    anchor,
    element,
  };
}

function formatExecutingEvent(event) {
  return `${event.id}: ${event.name}: ${event.description} (残り時間: ${event.remainingSeconds}秒)`;
}

function formatCompletedEvent(event, statusText) {
  return `${event.id}: ${event.name}: ${event.description} (${statusText})`;
}

export {
  createEventListSceneView,
};
