const ACCOMPANIMENT_CONVERSATION_IDS = Object.freeze({
  REQUEST: 'accompanimentRequest',
  COMPLETE: 'accompanimentComplete',
});

function createAccompanimentRequestConversation(task) {
  const { companion, destination } = task;
  return {
    id: ACCOMPANIMENT_CONVERSATION_IDS.REQUEST,
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

function createAccompanimentCompleteConversation(task) {
  const { companion, destination } = task;
  return {
    id: ACCOMPANIMENT_CONVERSATION_IDS.COMPLETE,
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
  ACCOMPANIMENT_CONVERSATION_IDS,
  createAccompanimentCompleteConversation,
  createAccompanimentRequestConversation,
};
