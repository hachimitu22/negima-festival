function createKnownEventsView() {
  let root = null;
  let element = null;

  function mount(rootElement) {
    root = document.createElement('section');

    const heading = document.createElement('h2');
    heading.textContent = '既知情報';

    element = document.createElement('ul');
    element.id = 'known-event-list';

    root.append(heading, element);
    rootElement.appendChild(root);
  }

  function init(knownEvents) {
    renderKnownEvents(knownEvents);
  }

  function update(knownEvents) {
    renderKnownEvents(knownEvents);
  }

  function setHidden(hidden) {
    if (root) {
      root.hidden = hidden;
    }
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
    root.remove();
    root = null;
    element = null;
  }

  return {
    destroy,
    init,
    mount,
    setHidden,
    update,
  };
}

export {
  createKnownEventsView,
};
