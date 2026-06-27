import { getRandomInt } from './random.js';

const CONVERSATION_SPEAKERS = {
  MAP_PERSON: 'mapPerson',
  NEGI: 'negi',
};

const COMMON_CONVERSATION_IDS = {
  ASUNA_WHERE_WERE_YOU: 'asunaWhereWereYou',
  FAREWELL: 'farewell',
  FESTIVAL_PLANS: 'festivalPlans',
  GREETING: 'greeting',
  QUESTION: 'question',
  TEACHER_CHECK_IN: 'teacherCheckIn',
};

const COMMON_CONVERSATIONS = {
  [COMMON_CONVERSATION_IDS.ASUNA_WHERE_WERE_YOU]: {
    messages: [
      { speaker: CONVERSATION_SPEAKERS.MAP_PERSON, text: 'ネギ！あんたどこ行ってたのよ！' },
      { speaker: CONVERSATION_SPEAKERS.NEGI, text: '明日菜さん。職員会議でした。' },
      { speaker: CONVERSATION_SPEAKERS.MAP_PERSON, text: 'そうだったの、それなら良かったわ。' },
    ],
  },
  [COMMON_CONVERSATION_IDS.FAREWELL]: {
    messages: [
      { speaker: CONVERSATION_SPEAKERS.MAP_PERSON, text: '先生さようなら。' },
      { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'さようなら。' },
    ],
  },
  [COMMON_CONVERSATION_IDS.FESTIVAL_PLANS]: {
    messages: [
      {
        speaker: CONVERSATION_SPEAKERS.MAP_PERSON,
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
              speaker: CONVERSATION_SPEAKERS.MAP_PERSON,
              text: '武道会ですか。私も応援に行きます！',
            },
            {
              speaker: CONVERSATION_SPEAKERS.NEGI,
              text: '会場で会えるかもしれませんね。',
            },
          ],
        },
        {
          id: 'class-exhibits',
          text: 'クラスの出し物を見に行きます。',
          messages: [
            {
              speaker: CONVERSATION_SPEAKERS.MAP_PERSON,
              text: 'それなら、ぜひ私たちのクラスにも来てください！',
            },
            {
              speaker: CONVERSATION_SPEAKERS.NEGI,
              text: 'はい、楽しみにしています。',
            },
          ],
        },
      ],
    },
  },
  [COMMON_CONVERSATION_IDS.GREETING]: {
    messages: [
      { speaker: CONVERSATION_SPEAKERS.MAP_PERSON, text: '{$名前}です。' },
      { speaker: CONVERSATION_SPEAKERS.MAP_PERSON, text: '先生こんにちは。' },
      { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'こんにちは。' },
    ],
  },
  [COMMON_CONVERSATION_IDS.QUESTION]: {
    messages: [
      { speaker: CONVERSATION_SPEAKERS.MAP_PERSON, text: '授業での質問です。' },
      { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'ここはこうすれば良いですよ。' },
      { speaker: CONVERSATION_SPEAKERS.MAP_PERSON, text: 'ありがとうございます。' },
      { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'いえいえ、どういたしまして。' },
    ],
  },
  [COMMON_CONVERSATION_IDS.TEACHER_CHECK_IN]: {
    messages: [
      {
        speaker: CONVERSATION_SPEAKERS.MAP_PERSON,
        text: 'ネギ先生こんにちは、調子はどう？',
      },
      {
        speaker: CONVERSATION_SPEAKERS.NEGI,
        text: '元気一杯です！',
      },
    ],
  },
};

const DEFAULT_STUDENT_CONVERSATIONS = [
  COMMON_CONVERSATION_IDS.GREETING,
  COMMON_CONVERSATION_IDS.FAREWELL,
  COMMON_CONVERSATION_IDS.QUESTION,
  COMMON_CONVERSATION_IDS.FESTIVAL_PLANS,
];

const MAP_PERSON_CONVERSATIONS = {
  student: {
    'student-08': [
      ...DEFAULT_STUDENT_CONVERSATIONS,
      COMMON_CONVERSATION_IDS.ASUNA_WHERE_WERE_YOU,
    ],
    default: DEFAULT_STUDENT_CONVERSATIONS,
  },
  teacher: {
    default: [
      COMMON_CONVERSATION_IDS.TEACHER_CHECK_IN,
    ],
  },
};

function createConversation(mapPerson) {
  const conversationIds = findMapPersonConversationIds(mapPerson?.id);
  const conversationId = selectConversationId(conversationIds);
  const conversation = COMMON_CONVERSATIONS[conversationId];
  if (!conversation) {
    return {
      choice: null,
      messages: [],
    };
  }

  return {
    choice: createConversationChoice(conversation.choice, mapPerson),
    messages: createConversationMessages(conversation.messages, mapPerson),
  };
}

function findMapPersonConversationIds(mapPersonId) {
  if (typeof mapPersonId !== 'string') {
    return null;
  }

  const separatorIndex = mapPersonId.indexOf('-');
  if (separatorIndex < 1) {
    return null;
  }

  const mapPersonType = mapPersonId.slice(0, separatorIndex);
  const conversations = MAP_PERSON_CONVERSATIONS[mapPersonType];
  return conversations?.[mapPersonId] ?? conversations?.default ?? null;
}

function createConversationMessages(messages = [], mapPerson) {
  return messages.map(message => ({
    speakerName: resolveConversationSpeakerName(message, mapPerson),
    message: formatConversationMessage(message.text, mapPerson),
  }));
}

function createConversationChoice(choice, mapPerson) {
  if (!choice) {
    return null;
  }

  return {
    messageIndex: choice.messageIndex,
    options: choice.options.map(option => ({
      id: option.id,
      label: formatConversationMessage(option.text, mapPerson),
      messages: [
        {
          speakerName: 'ネギ',
          message: formatConversationMessage(option.text, mapPerson),
        },
        ...createConversationMessages(option.messages, mapPerson),
      ],
    })),
  };
}

function selectConversationId(conversationIds) {
  if (!Array.isArray(conversationIds)) {
    return conversationIds;
  }

  if (conversationIds.length === 0) {
    return null;
  }

  return conversationIds[getRandomInt(0, conversationIds.length - 1)];
}

function resolveConversationSpeakerName(message, mapPerson) {
  return message.speaker === CONVERSATION_SPEAKERS.NEGI
    ? 'ネギ'
    : mapPerson.name;
}

function formatConversationMessage(text, mapPerson) {
  return text.replaceAll('{$名前}', mapPerson.name);
}

export {
  createConversation,
};
