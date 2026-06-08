function createKnownEventsView() {
  let element = null;

  function mount(rootElement) {
    element = rootElement.querySelector('#known-event-list');
  }

  function init(knownEvents) {
    renderKnownEvents(knownEvents);
  }

  function update(knownEvents) {
    renderKnownEvents(knownEvents);
  }

  function renderKnownEvents(knownEvents) {
    element.replaceChildren();

    if (knownEvents.length === 0) {
      const emptyItem = document.createElement('li');
      emptyItem.textContent = 'まだ既知情報はありません';
      element.appendChild(emptyItem);
      return;
    }

    knownEvents.forEach(eventName => {
      const eventItem = document.createElement('li');
      eventItem.textContent = eventName;
      element.appendChild(eventItem);
    });
  }

  function destroy() {
    if (!element) {
      return;
    }

    element.replaceChildren();
    element = null;
  }

  return {
    destroy,
    init,
    mount,
    update,
  };
}

export {
  createKnownEventsView,
};
