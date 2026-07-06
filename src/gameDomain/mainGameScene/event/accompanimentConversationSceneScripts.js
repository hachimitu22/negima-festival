/**
 * 同伴会話シーンスクリプト ID値。
 * @public
 */
const ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS = Object.freeze({
  REQUEST: 'accompanimentRequest',
  COMPLETE: 'accompanimentComplete',
});

/**
 * 同伴要求会話を初期化。
 * @public
 * @param {AccompanimentTask} task - 同伴タスク
 * @returns {Object} 会話スクリプトオブジェクト
 */
function createAccompanimentRequestConversationSceneScript(task) {
  const { companion, destination } = task;
  return {
    id: ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
    choice: null,
    messages: [
      {
        speakerName: companion.name,
        message: `ネギ先生、${destination.name}まで一緒に行ってもらえませんか？`,
      },
      {
        speakerName: 'ネギ',
        message: 'はい、分かりました。',
      },
    ],
  };
}

/**
 * 同伴完了会話を初期化。
 * @private
 * @param {AccompanimentTask} task - 同伴タスク
 * @returns {Object} 会話スクリプトオブジェクト
 */
function createAccompanimentCompleteConversationSceneScript(task) {
  const { companion, destination } = task;
  return {
    id: ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS.COMPLETE,
    choice: null,
    messages: [
      {
        speakerName: companion.name,
        message: `${destination.name}に着きましたね。ありがとうございました。`,
      },
      {
        speakerName: 'ネギ',
        message: 'どういたしまして。',
      },
    ],
  };
}

export {
  ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS,
  createAccompanimentCompleteConversationSceneScript,
  createAccompanimentRequestConversationSceneScript,
};
