import { SCENE_IDS } from '../gameDomain/actions.js';
import { createMainGameSceneView } from './scenes/mainGameScene/index.js';

function createDomGameView(rootElement, options) {
  let sceneView = null;
  let sceneId = null;

  function init(snapshot) {
    const view = getSceneView(snapshot);
    view.init(snapshot);
  }

  function render(snapshot) {
    const view = getSceneView(snapshot);
    view.update(snapshot);
  }

  function destroy() {
    if (!sceneView) {
      return;
    }

    sceneView.destroy();
    sceneView = null;
    sceneId = null;
  }

  function getSceneView(snapshot) {
    if (!snapshot || typeof snapshot.sceneId !== 'string') {
      throw new Error('Scene snapshot must include sceneId.');
    }

    if (!sceneView) {
      sceneView = createSceneView(snapshot.sceneId);
      sceneId = snapshot.sceneId;
    }

    if (sceneId !== snapshot.sceneId) {
      throw new Error(`Scene view switching is not supported: ${sceneId} -> ${snapshot.sceneId}`);
    }

    return sceneView;
  }

  function createSceneView(nextSceneId) {
    if (nextSceneId === SCENE_IDS.MAIN_GAME) {
      return createMainGameSceneView(rootElement, options);
    }

    throw new Error(`Unsupported sceneId: ${nextSceneId}`);
  }

  return {
    init,
    render,
    destroy,
  };
}

export {
  createDomGameView,
};
