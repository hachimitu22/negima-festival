import { SCENE_IDS } from '../gameDomain/actions.js';
import { createConversationSceneView } from './scenes/conversationScene/index.js';
import { createMainGameSceneView } from './scenes/mainGameScene/index.js';

class DomGameView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.context = null;
    this.sceneView = null;
    this.sceneId = null;
  }

  configure(context) {
    this.context = context;
  }

  init(snapshot) {
    const view = this.#getSceneView(snapshot);
    view.init(snapshot);
  }

  render(snapshot) {
    const didSceneChange = this.sceneId !== snapshot?.sceneId;
    const view = this.#getSceneView(snapshot);
    if (didSceneChange) {
      view.init(snapshot);
    } else {
      view.update(snapshot);
    }
  }

  destroy() {
    if (!this.sceneView) {
      return;
    }

    this.sceneView.destroy();
    this.sceneView = null;
    this.sceneId = null;
  }

  #getSceneView(snapshot) {
    if (!snapshot || typeof snapshot.sceneId !== 'string') {
      throw new Error('Scene snapshot must include sceneId.');
    }

    if (this.sceneView && this.sceneId !== snapshot.sceneId) {
      this.sceneView.destroy();
      this.sceneView = null;
      this.sceneId = null;
    }

    if (!this.sceneView) {
      this.sceneView = this.#createSceneView(snapshot.sceneId);
      this.sceneId = snapshot.sceneId;
    }

    return this.sceneView;
  }

  #createSceneView(nextSceneId) {
    if (nextSceneId === SCENE_IDS.CONVERSATION) {
      return createConversationSceneView(this.rootElement, this.context);
    }

    if (nextSceneId === SCENE_IDS.MAIN_GAME) {
      return createMainGameSceneView(this.rootElement, this.context);
    }

    throw new Error(`Unsupported sceneId: ${nextSceneId}`);
  }
}

export {
  DomGameView,
};
