/**
 * 会話シーン進行結果の定数。
 * 
 * @public
 * @type {Object}
 * @property {string} ADVANCED - 会話が次のメッセージに進んだ
 * @property {string} BLOCKED - 選択肢待機中のため進行不可
 * @property {string} COMPLETED - 会話が完了した
 */
const CONVERSATION_SCENE_SESSION_RESULTS = Object.freeze({
  ADVANCED: 'advanced',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
});

/**
 * 会話シーンのセッション。スクリプトの進行状態と選択肢の処理を管理。
 * 
 * @public
 */
class ConversationSceneSession {
  #scriptId;
  #choice;
  #messages;
  #messageIndex;

  /**
   * 会話セッションを初期化する。
   * 
   * @public
   * @param {Object} script - スクリプトオブジェクト
   * @param {string} script.id - スクリプトID
   * @param {Array<Object>} script.messages - メッセージ配列
   * @param {Object} [script.choice] - 選択肢情報（optional）
   * @param {number} script.choice.messageIndex - 選択肢を表示するメッセージインデックス
   * @param {Array<Object>} script.choice.options - 選択肢の配列
   * @param {string} script.choice.options[].id - 選択肢ID
   * @param {string} script.choice.options[].text - 選択肢のテキスト
   * @param {Array<Object>} script.choice.options[].messages - 選択後に挿入されるメッセージ配列
   * 
   * @example
   * const script = {
   *   id: 'greeting',
   *   messages: [{ speaker: 'negi', text: 'こんにちは' }]
   * };
   * const session = new ConversationSceneSession(script);
   */
  constructor(script) {
    this.#scriptId = script.id;
    this.#choice = script.choice;
    this.#messages = script.messages;
    this.#messageIndex = 0;
  }

  /**
   * 会話を次のメッセージに進める。選択肢がある場合は進行不可。
   * 
   * @public
   * @returns {string} ConversationSceneSessionResults 列挙値（ADVANCED / BLOCKED / COMPLETED）
   * 
   * @example
   * const result = session.next();
   * if (result === CONVERSATION_SCENE_SESSION_RESULTS.COMPLETED) {
   *   console.log('会話完了');
   * }
   */
  next() {
    if (getConversationSceneChoices(this.#choice, this.#messageIndex).length > 0) {
      return CONVERSATION_SCENE_SESSION_RESULTS.BLOCKED;
    }

    const nextMessageIndex = this.#messageIndex + 1;
    if (nextMessageIndex >= this.#messages.length) {
      return CONVERSATION_SCENE_SESSION_RESULTS.COMPLETED;
    }

    this.#messageIndex = nextMessageIndex;
    return CONVERSATION_SCENE_SESSION_RESULTS.ADVANCED;
  }

  /**
   * ユーザーが選択肢を選んだ場合の処理。選択に対応するメッセージをセッションに挿入。
   * 
   * @public
   * @param {string} choiceId - 選択された選択肢ID
   * @returns {Object|null} 選択結果オブジェクト（scriptId, choiceId を含む）。選択できない場合は null
   * @returns {string} returns.scriptId - スクリプトID
   * @returns {string} returns.choiceId - 選択された選択肢ID
   * 
   * @example
   * const result = session.selectChoice('worked-very-hard');
   * if (result) {
   *   console.log('選択ID:', result.choiceId);
   * }
   */
  selectChoice(choiceId) {
    if (!this.#choice || this.#choice.messageIndex !== this.#messageIndex) {
      return null;
    }

    const selectedOption = this.#choice.options.find(option => option.id === choiceId);
    if (!selectedOption) {
      return null;
    }

    this.#messages = [
      ...this.#messages.slice(0, this.#messageIndex + 1),
      ...selectedOption.messages,
      ...this.#messages.slice(this.#messageIndex + 1),
    ];
    this.#choice = null;
    this.#messageIndex += 1;
    return {
      scriptId: this.#scriptId,
      choiceId: selectedOption.id,
    };
  }

  /**
   * 現在の会話状態のスナップショットを取得する。ビューの描画用。
   * 
   * @public
   * @returns {Object} 会話状態スナップショット
   * @returns {string} returns.speakerName - 話者名
   * @returns {number} returns.messageIndex - 現在のメッセージインデックス
   * @returns {number} returns.messageCount - 総メッセージ数
   * @returns {string} returns.message - 現在のメッセージテキスト
   * @returns {Array<Object>} returns.choices - 現在利用可能な選択肢配列（id, label を含む）
   * @returns {boolean} returns.isLastMessage - 最後のメッセージかどうか
   * 
   * @example
   * const snapshot = session.getSnapshot();
   * console.log(snapshot.message); // 現在のメッセージ表示
   * console.log(snapshot.choices); // 選択肢表示
   */
  getSnapshot() {
    const message = this.#messages[this.#messageIndex];
    const choices = getConversationSceneChoices(this.#choice, this.#messageIndex);
    return {
      speakerName: message.speakerName,
      messageIndex: this.#messageIndex,
      messageCount: this.#messages.length,
      message: message.message,
      choices,
      isLastMessage: (
        choices.length === 0
        && this.#messageIndex === this.#messages.length - 1
      ),
    };
  }
}

/**
 * 指定メッセージインデックスで選択可能な選択肢を取得する。
 * 
 * @private
 * @param {Object|null} choice - 選択肢定義オブジェクト
 * @param {number} messageIndex - メッセージインデックス
 * @returns {Array<Object>} 選択肢配列（id, label を含む）
 */
function getConversationSceneChoices(choice, messageIndex) {
  if (!choice || choice.messageIndex !== messageIndex) {
    return [];
  }

  return choice.options.map(option => ({
    id: option.id,
    label: option.label,
  }));
}

export {
  CONVERSATION_SCENE_SESSION_RESULTS,
  ConversationSceneSession,
};
