import { createKnownEventsView } from './views/knownEventsView.js';
import { createStatusView } from './views/statusView.js';
import { createMainGameSceneView } from './views/scenes/mainGameSceneView.js';

function createDomGameView() {
  const statusView = createStatusView();
  const knownEventsView = createKnownEventsView();
  const mainGameSceneView = createMainGameSceneView();

  function mount(rootElement, options) {
    statusView.mount(rootElement, options);
    knownEventsView.mount(rootElement);
    mainGameSceneView.mount(rootElement, options);
  }

  function init(snapshot) {
    statusView.init(snapshot);
    knownEventsView.init(snapshot.knownEvents);
    mainGameSceneView.init(snapshot);
  }

  function render(snapshot) {
    statusView.update(snapshot);
    knownEventsView.update(snapshot.knownEvents);
    mainGameSceneView.update(snapshot);
  }

  function destroy() {
    statusView.destroy();
    knownEventsView.destroy();
    mainGameSceneView.destroy();
  }

  return {
    mount,
    init,
    render,
    destroy,
  };
}

export {
  createDomGameView,
};
