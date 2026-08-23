import TALK_IDS from './talkIds.js';

const TALKS = {
  [TALK_IDS.ASUNA_NORMAL]: {
    dialogue: {
      steps: [
        {
          type: 'message',
          message: { speaker: '明日菜', text: 'ネギ　元気？' },
        },
        {
          type: 'message',
          message: { speaker: 'ネギ', text: '元気ですよ明日菜さん' },
        },
      ],
    },
  },
  [TALK_IDS.NODOKA_NORMAL]: {
    dialogue: {
      steps: [
        {
          type: 'message',
          message: { speaker: 'のどか', text: 'ネギ先生　こんにちは' },
        },
        {
          type: 'message',
          message: { speaker: 'ネギ', text: 'のどかさん　こんにちは' },
        },
      ],
    },
  },
};

export default TALKS;
