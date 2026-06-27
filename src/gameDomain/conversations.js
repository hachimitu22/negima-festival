import { getRandomInt } from './random.js';

const CONVERSATION_SPEAKERS = {
  NEGI: 'negi',
  STUDENT: 'student',
  TEACHER: 'teacher',
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
      { speaker: CONVERSATION_SPEAKERS.STUDENT, text: 'ネギ！あんたどこ行ってたのよ！' },
      { speaker: CONVERSATION_SPEAKERS.NEGI, text: '明日菜さん。職員会議でした。' },
      { speaker: CONVERSATION_SPEAKERS.STUDENT, text: 'そうだったの、それなら良かったわ。' },
    ],
  },
  [COMMON_CONVERSATION_IDS.FAREWELL]: {
    messages: [
      { speaker: CONVERSATION_SPEAKERS.STUDENT, text: '先生さようなら。' },
      { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'さようなら。' },
    ],
  },
  [COMMON_CONVERSATION_IDS.FESTIVAL_PLANS]: {
    messages: [
      {
        speaker: CONVERSATION_SPEAKERS.STUDENT,
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
              speaker: CONVERSATION_SPEAKERS.STUDENT,
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
              speaker: CONVERSATION_SPEAKERS.STUDENT,
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
      { speaker: CONVERSATION_SPEAKERS.STUDENT, text: '{$生徒名}です。' },
      { speaker: CONVERSATION_SPEAKERS.STUDENT, text: '先生こんにちは。' },
      { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'こんにちは。' },
    ],
  },
  [COMMON_CONVERSATION_IDS.QUESTION]: {
    messages: [
      { speaker: CONVERSATION_SPEAKERS.STUDENT, text: '授業での質問です。' },
      { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'ここはこうすれば良いですよ。' },
      { speaker: CONVERSATION_SPEAKERS.STUDENT, text: 'ありがとうございます。' },
      { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'いえいえ、どういたしまして。' },
    ],
  },
  [COMMON_CONVERSATION_IDS.TEACHER_CHECK_IN]: {
    messages: [
      {
        speaker: CONVERSATION_SPEAKERS.TEACHER,
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

const STUDENT_CONVERSATIONS = {
  8: [
    ...DEFAULT_STUDENT_CONVERSATIONS,
    COMMON_CONVERSATION_IDS.ASUNA_WHERE_WERE_YOU,
  ],
  default: DEFAULT_STUDENT_CONVERSATIONS,
};

const TEACHER_CONVERSATIONS = {
  default: [
    COMMON_CONVERSATION_IDS.TEACHER_CHECK_IN,
  ],
};

function createConversation(classAndNumber, student) {
  const conversationId = selectConversationId(
    STUDENT_CONVERSATIONS[classAndNumber] ?? STUDENT_CONVERSATIONS.default,
  );
  const conversation = COMMON_CONVERSATIONS[conversationId];
  if (!conversation) {
    return {
      choice: null,
      messages: [],
    };
  }

  return {
    choice: createConversationChoice(conversation.choice, student),
    messages: createConversationMessages(conversation.messages, student),
  };
}

function createTeacherConversation(teacherId, teacher) {
  const conversationId = selectConversationId(
    TEACHER_CONVERSATIONS[teacherId] ?? TEACHER_CONVERSATIONS.default,
  );
  const conversation = COMMON_CONVERSATIONS[conversationId];
  if (!conversation) {
    return {
      choice: null,
      messages: [],
    };
  }

  return {
    choice: createConversationChoice(conversation.choice, teacher),
    messages: createConversationMessages(conversation.messages, teacher),
  };
}

function createConversationMessages(messages = [], student) {
  return messages.map(message => ({
    speakerName: resolveConversationSpeakerName(message, student),
    message: formatConversationMessage(message.text, student),
  }));
}

function createConversationChoice(choice, student) {
  if (!choice) {
    return null;
  }

  return {
    messageIndex: choice.messageIndex,
    options: choice.options.map(option => ({
      id: option.id,
      label: formatConversationMessage(option.text, student),
      messages: [
        {
          speakerName: 'ネギ',
          message: formatConversationMessage(option.text, student),
        },
        ...createConversationMessages(option.messages, student),
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

function resolveConversationSpeakerName(message, student) {
  return message.speaker === CONVERSATION_SPEAKERS.NEGI
    ? 'ネギ'
    : student.name;
}

function formatConversationMessage(text, student) {
  return text.replaceAll('{$生徒名}', student.name);
}

export {
  createConversation,
  createTeacherConversation,
};
