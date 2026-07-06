import { SCENE_IDS } from '../gameDomain/actions.js';
import { createConversationSceneView } from './scenes/conversationScene/index.js';
import { createMainGameSceneView } from './scenes/mainGameScene/index.js';

/**
 * DOMレンダラー。ユーザーインタフェースを DOM で描画し、ユーザー入力を受け付ける。
 * @public
 * @example
 * const domGameView = new DomGameView(document.getElementById('root'));
 * domGameView.configure(context);
 * domGameView.init(initialSnapshot);
 * domGameView.render(snapshot);
 */
class DomGameView {
  #rootElement;
  #context;
  #sceneView;
  #sceneId;
  #viewState;

  /**
   * DOMレンダラーを初期化。
   * @public
   * @param {HTMLElement} rootElement - 描画対象的要素
   */
  constructor(rootElement) {
    this.#rootElement = rootElement;
    this.#context = null;
    this.#sceneView = null;
    this.#sceneId = null;
    this.#viewState = {
      trackedActorId: null,
    };
  }

  /**
   * レンダラーを設定。
   * @public
   * @param {Object} context - インプットやのコンテキスト
   * @returns {void}
   */
  configure(context) {
    this.#context = {
      ...context,
      viewState: this.#viewState,
    };
  }

  /**
   * 第一回轉画を実行。
   * @public
   * @param {Object} snapshot - ゲーム状態スナップショット
   * @returns {void}
   */
  init(snapshot) {
    const view = this.#getSceneView(snapshot);
    view.init(snapshot);
  }

  /**
   * 描画を実行。シーン变更時は init をコール。
   * @public
   * @param {Object} snapshot - ゲーム状態スナップショット
   * @returns {void}
   */
  render(snapshot) {
    const didSceneChange = this.#sceneId !== snapshot?.sceneId;
    const view = this.#getSceneView(snapshot);
    if (didSceneChange) {
      view.init(snapshot);
    } else {
      view.update(snapshot);
    }
  }

  /**
   * レンダラーを終了。
   * @public
   * @returns {void}
   */
  destroy() {
    if (this.#sceneView) {
      this.#sceneView.destroy();
      this.#sceneView = null;
      this.#sceneId = null;
    }

    this.#viewState.trackedActorId = null;
  }

  #getSceneView(snapshot) {
    if (!snapshot || typeof snapshot.sceneId !== 'string') {
      throw new Error('Scene snapshot must include sceneId.');
    }

    if (this.#sceneView && this.#sceneId !== snapshot.sceneId) {
      this.#sceneView.destroy();
      this.#sceneView = null;
      this.#sceneId = null;
    }

    if (!this.#sceneView) {
      this.#sceneView = this.#createSceneView(snapshot.sceneId);
      this.#sceneId = snapshot.sceneId;
    }

    return this.#sceneView;
  }

  #createSceneView(nextSceneId) {
    if (nextSceneId === SCENE_IDS.CONVERSATION) {
      return createConversationSceneView(this.#rootElement, this.#context);
    }

    if (nextSceneId === SCENE_IDS.MAIN_GAME) {
      return createMainGameSceneView(this.#rootElement, this.#context);
    }

    throw new Error(`Unsupported sceneId: ${nextSceneId}`);
  }
}

export {
  DomGameView,
};
