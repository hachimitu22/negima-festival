import { SCENE_IDS } from '../gameDomain/actions.js';
import { createMainGameSceneView } from './scenes/mainGameScene/index.js';

class DomGameView {
  constructor(rootElement, options) {
    this.rootElement = rootElement;
    this.options = options;
    this.sceneView = null;
    this.sceneId = null;
  }

  init(snapshot) {
    const view = this.getSceneView(snapshot);
    view.init(snapshot);
  }

  render(snapshot) {
    const view = this.getSceneView(snapshot);
    view.update(snapshot);
  }

  destroy() {
    if (!this.sceneView) {
      return;
    }

    this.sceneView.destroy();
    this.sceneView = null;
    this.sceneId = null;
  }

  getSceneView(snapshot) {
    if (!snapshot || typeof snapshot.sceneId !== 'string') {
      throw new Error('Scene snapshot must include sceneId.');
    }

    if (!this.sceneView) {
      this.sceneView = this.createSceneView(snapshot.sceneId);
      this.sceneId = snapshot.sceneId;
    }

    if (this.sceneId !== snapshot.sceneId) {
      throw new Error(`Scene view switching is not supported: ${this.sceneId} -> ${snapshot.sceneId}`);
    }

    return this.sceneView;
  }

  createSceneView(nextSceneId) {
    if (nextSceneId === SCENE_IDS.MAIN_GAME) {
      return createMainGameSceneView(this.rootElement, this.options);
    }

    throw new Error(`Unsupported sceneId: ${nextSceneId}`);
  }
}

export {
  DomGameView,
};
