import { createKnownEventsView } from './views/knownEventsView.js';
import { createStatusView } from './views/statusView.js';
import { createEventListSceneView } from './views/scenes/eventListSceneView.js';

function createDomGameView() {
  const statusView = createStatusView();
  const knownEventsView = createKnownEventsView();
  const eventListSceneView = createEventListSceneView();

  function mount(rootElement, options) {
    statusView.mount(rootElement, options);
    knownEventsView.mount(rootElement);
    eventListSceneView.mount(rootElement, options);
  }

  function render(snapshot) {
    statusView.update(snapshot);
    knownEventsView.update(snapshot.knownEvents);
    eventListSceneView.update(snapshot);
  }

  function destroy() {
    statusView.destroy();
    knownEventsView.destroy();
    eventListSceneView.destroy();
  }

  return {
    mount,
    render,
    destroy,
  };
}

export {
  createDomGameView,
};
