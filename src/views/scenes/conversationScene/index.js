import { createConversationView } from '../../conversationView.js';
import { createStatusView } from '../../statusView.js';

/**
 * 会話シーン用ビューを作成する。会話内容と選択肢を表示する。
 * @public
 * @param {HTMLElement} rootElement - 描画対象要素
 * @param {Object} options - オプション設定
 * @returns {Object} 会話シーン view API (init, update, destroy)
 */
function createConversationSceneView(rootElement, options) {
  const statusView = createStatusView();
  let root = null;
  let conversationElement = null;
  let conversationView = null;

  mount(rootElement, options);

  /**
   * Mounts the conversation scene view.
   * @param {HTMLElement} rootElement - Root element.
   * @param {Object} options - View options.
   * @returns {void}
   */
  function mount(rootElement, options) {
    root = document.createElement('section');
    root.id = 'conversation-scene';
    conversationElement = document.createElement('div');
    conversationElement.id = 'conversation';
    conversationView = createConversationView(conversationElement, options);

    statusView.mount(root, options);
    root.appendChild(conversationElement);
    rootElement.appendChild(root);
  }

  /**
   * Initializes the conversation scene view.
   * @param {Object} snapshot - Scene snapshot.
   * @returns {void}
   */
  function init(snapshot) {
    statusView.init(snapshot);
    conversationView.update(snapshot.conversation);
  }

  /**
   * Updates the conversation scene view.
   * @param {Object} snapshot - Scene snapshot.
   * @returns {void}
   */
  function update(snapshot) {
    statusView.update(snapshot);
    conversationView.update(snapshot.conversation);
  }

  /**
   * Destroys the conversation scene view.
   * @returns {void}
   */
  function destroy() {
    if (!root) {
      return;
    }

    conversationView.destroy();
    statusView.destroy();
    root.remove();
    root = null;
    conversationElement = null;
    conversationView = null;
  }

  return {
    destroy,
    init,
    update,
  };
}

export {
  createConversationSceneView,
};
