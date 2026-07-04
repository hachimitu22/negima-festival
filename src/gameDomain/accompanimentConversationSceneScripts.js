const ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS = Object.freeze({
  REQUEST: 'accompanimentRequest',
  COMPLETE: 'accompanimentComplete',
});

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
