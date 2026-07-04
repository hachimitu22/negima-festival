import {
  CONVERSATION_SCENE_SCRIPT_CHOICE_IDS,
  CONVERSATION_SCENE_SCRIPT_IDS,
} from './conversationSceneScriptIds.js';
import { getRandomInt } from './random.js';

const CONVERSATION_SCENE_SCRIPT_SPEAKERS = {
  ACTOR: 'actor',
  NEGI: 'negi',
};

const COMMON_CONVERSATION_SCENE_SCRIPTS = {
  [CONVERSATION_SCENE_SCRIPT_IDS.ASUNA_WHERE_WERE_YOU]: {
    messages: [
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR, text: 'ネギ！あんたどこ行ってたのよ！' },
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.NEGI, text: '明日菜さん。職員会議でした。' },
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR, text: 'そうだったの、それなら良かったわ。' },
    ],
  },
  [CONVERSATION_SCENE_SCRIPT_IDS.EFFORT_FEEDBACK]: {
    messages: [
      {
        speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR,
        text: '先生、今日の私の頑張り、どうでしたか？',
      },
    ],
    choice: {
      messageIndex: 0,
      options: [
        {
          id: CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.EFFORT_FEEDBACK.WORKED_VERY_HARD,
          text: 'とてもよく頑張っていました。',
          messages: [
            {
              speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR,
              text: '本当ですか？ ありがとうございます、先生！',
            },
          ],
        },
        {
          id: CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.EFFORT_FEEDBACK.AS_USUAL,
          text: 'いつも通りでした。',
          messages: [
            {
              speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR,
              text: 'そうですか……次はもっと頑張ります。',
            },
          ],
        },
        {
          id: CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.EFFORT_FEEDBACK.NEEDS_MORE_EFFORT,
          text: 'もう少し頑張りましょう。',
          messages: [
            {
              speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR,
              text: 'うっ……次は認めてもらえるように頑張ります。',
            },
          ],
        },
      ],
    },
  },
  [CONVERSATION_SCENE_SCRIPT_IDS.FAREWELL]: {
    messages: [
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR, text: '先生さようなら。' },
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.NEGI, text: 'さようなら。' },
    ],
  },
  [CONVERSATION_SCENE_SCRIPT_IDS.FESTIVAL_PLANS]: {
    messages: [
      {
        speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR,
        text: '先生、麻帆良祭ではどこを見て回るんですか？',
      },
    ],
    choice: {
      messageIndex: 0,
      options: [
        {
          id: 'martial-arts-tournament',
          text: '武道会を見に行きます。',
          messages: [
            {
              speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR,
              text: '武道会ですか。私も応援に行きます！',
            },
            {
              speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.NEGI,
              text: '会場で会えるかもしれませんね。',
            },
          ],
        },
        {
          id: 'class-exhibits',
          text: 'クラスの出し物を見に行きます。',
          messages: [
            {
              speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR,
              text: 'それなら、ぜひ私たちのクラスにも来てください！',
            },
            {
              speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.NEGI,
              text: 'はい、楽しみにしています。',
            },
          ],
        },
      ],
    },
  },
  [CONVERSATION_SCENE_SCRIPT_IDS.GREETING]: {
    messages: [
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR, text: '{$名前}です。' },
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR, text: '先生こんにちは。' },
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.NEGI, text: 'こんにちは。' },
    ],
  },
  [CONVERSATION_SCENE_SCRIPT_IDS.QUESTION]: {
    messages: [
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR, text: '授業での質問です。' },
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.NEGI, text: 'ここはこうすれば良いですよ。' },
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR, text: 'ありがとうございます。' },
      { speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.NEGI, text: 'いえいえ、どういたしまして。' },
    ],
  },
  [CONVERSATION_SCENE_SCRIPT_IDS.TEACHER_CHECK_IN]: {
    messages: [
      {
        speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.ACTOR,
        text: 'ネギ先生こんにちは、調子はどう？',
      },
      {
        speaker: CONVERSATION_SCENE_SCRIPT_SPEAKERS.NEGI,
        text: '元気一杯です！',
      },
    ],
  },
};

const DEFAULT_STUDENT_CONVERSATION_SCENE_SCRIPT_IDS = [
  CONVERSATION_SCENE_SCRIPT_IDS.GREETING,
  CONVERSATION_SCENE_SCRIPT_IDS.FAREWELL,
  CONVERSATION_SCENE_SCRIPT_IDS.QUESTION,
  CONVERSATION_SCENE_SCRIPT_IDS.FESTIVAL_PLANS,
  CONVERSATION_SCENE_SCRIPT_IDS.EFFORT_FEEDBACK,
];

const ACTOR_CONVERSATION_SCENE_SCRIPT_IDS = {
  student: {
    'student-08': [
      ...DEFAULT_STUDENT_CONVERSATION_SCENE_SCRIPT_IDS,
      CONVERSATION_SCENE_SCRIPT_IDS.ASUNA_WHERE_WERE_YOU,
    ],
    default: DEFAULT_STUDENT_CONVERSATION_SCENE_SCRIPT_IDS,
  },
  teacher: {
    default: [
      CONVERSATION_SCENE_SCRIPT_IDS.TEACHER_CHECK_IN,
    ],
  },
};

function createConversationSceneScript(actor, { additionalScripts = [] } = {}) {
  const scriptIds = findActorConversationSceneScriptIds(actor?.id);
  const scripts = Array.isArray(scriptIds)
    ? scriptIds
      .map(scriptId => createCommonConversationSceneScript(scriptId, actor))
      .filter(Boolean)
    : [createCommonConversationSceneScript(scriptIds, actor)].filter(Boolean);
  const candidates = [
    ...scripts,
    ...additionalScripts.filter(isConversationSceneScript),
  ];
  if (candidates.length === 0) {
    return createEmptyConversationSceneScript();
  }

  return candidates[getRandomInt(0, candidates.length - 1)];
}

function createCommonConversationSceneScript(scriptId, actor) {
  const script = COMMON_CONVERSATION_SCENE_SCRIPTS[scriptId];
  if (!script) {
    return null;
  }

  return {
    id: scriptId,
    choice: createConversationSceneScriptChoice(script.choice, actor),
    messages: createConversationSceneScriptMessages(script.messages, actor),
  };
}

function createEmptyConversationSceneScript() {
  return {
    id: null,
    choice: null,
    messages: [],
  };
}

function isConversationSceneScript(script) {
  return (
    script
    && typeof script.id === 'string'
    && Array.isArray(script.messages)
    && script.messages.length > 0
  );
}

function findActorConversationSceneScriptIds(actorId) {
  if (typeof actorId !== 'string') {
    return null;
  }

  const separatorIndex = actorId.indexOf('-');
  if (separatorIndex < 1) {
    return null;
  }

  const actorType = actorId.slice(0, separatorIndex);
  const scriptIds = ACTOR_CONVERSATION_SCENE_SCRIPT_IDS[actorType];
  return scriptIds?.[actorId] ?? scriptIds?.default ?? null;
}

function createConversationSceneScriptMessages(messages = [], actor) {
  return messages.map(message => ({
    speakerName: resolveConversationSceneScriptSpeakerName(message, actor),
    message: formatConversationSceneScriptMessage(message.text, actor),
  }));
}

function createConversationSceneScriptChoice(choice, actor) {
  if (!choice) {
    return null;
  }

  return {
    messageIndex: choice.messageIndex,
    options: choice.options.map(option => ({
      id: option.id,
      label: formatConversationSceneScriptMessage(option.text, actor),
      messages: [
        {
          speakerName: 'ネギ',
          message: formatConversationSceneScriptMessage(option.text, actor),
        },
        ...createConversationSceneScriptMessages(option.messages, actor),
      ],
    })),
  };
}

function resolveConversationSceneScriptSpeakerName(message, actor) {
  return message.speaker === CONVERSATION_SCENE_SCRIPT_SPEAKERS.NEGI
    ? 'ネギ'
    : actor.name;
}

function formatConversationSceneScriptMessage(text, actor) {
  return text.replaceAll('{$名前}', actor.name);
}

export {
  createConversationSceneScript,
};
