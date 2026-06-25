import { getRandomInt } from './random.js';

const CONVERSATION_SPEAKERS = {
  NEGI: 'negi',
  STUDENT: 'student',
};

const COMMON_CONVERSATION_IDS = {
  ASUNA_WHERE_WERE_YOU: 'asunaWhereWereYou',
  FAREWELL: 'farewell',
  GREETING: 'greeting',
  QUESTION: 'question',
};

const COMMON_CONVERSATIONS = {
  [COMMON_CONVERSATION_IDS.ASUNA_WHERE_WERE_YOU]: [
    { speaker: CONVERSATION_SPEAKERS.STUDENT, text: 'ネギ！あんたどこ行ってたのよ！' },
    { speaker: CONVERSATION_SPEAKERS.NEGI, text: '明日菜さん。職員会議でした。' },
    { speaker: CONVERSATION_SPEAKERS.STUDENT, text: 'そうだったの、それなら良かったわ。' },
  ],
  [COMMON_CONVERSATION_IDS.FAREWELL]: [
    { speaker: CONVERSATION_SPEAKERS.STUDENT, text: '先生さようなら。' },
    { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'さようなら。' },
  ],
  [COMMON_CONVERSATION_IDS.GREETING]: [
    { speaker: CONVERSATION_SPEAKERS.STUDENT, text: '{$生徒名}です。' },
    { speaker: CONVERSATION_SPEAKERS.STUDENT, text: '先生こんにちは。' },
    { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'こんにちは。' },
  ],
  [COMMON_CONVERSATION_IDS.QUESTION]: [
    { speaker: CONVERSATION_SPEAKERS.STUDENT, text: '授業での質問です。' },
    { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'ここはこうすれば良いですよ。' },
    { speaker: CONVERSATION_SPEAKERS.STUDENT, text: 'ありがとうございます。' },
    { speaker: CONVERSATION_SPEAKERS.NEGI, text: 'いえいえ、どういたしまして。' },
  ],
};

const DEFAULT_STUDENT_CONVERSATIONS = [
  COMMON_CONVERSATION_IDS.GREETING,
  COMMON_CONVERSATION_IDS.FAREWELL,
  COMMON_CONVERSATION_IDS.QUESTION,
];

const STUDENT_CONVERSATIONS = {
  8: [
    ...DEFAULT_STUDENT_CONVERSATIONS,
    COMMON_CONVERSATION_IDS.ASUNA_WHERE_WERE_YOU,
  ],
  default: DEFAULT_STUDENT_CONVERSATIONS,
};

function createConversationMessages(classAndNumber, student) {
  const conversationId = selectConversationId(
    STUDENT_CONVERSATIONS[classAndNumber] ?? STUDENT_CONVERSATIONS.default,
  );
  const messages = COMMON_CONVERSATIONS[conversationId] ?? [];
  return messages.map(message => ({
    speakerName: resolveConversationSpeakerName(message, student),
    message: formatConversationMessage(message.text, student),
  }));
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
  return message.speaker === CONVERSATION_SPEAKERS.STUDENT
    ? student.name
    : 'ネギ';
}

function formatConversationMessage(text, student) {
  return text.replaceAll('{$生徒名}', student.name);
}

export {
  createConversationMessages,
};
