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
  [TALK_IDS.KONOKA_NORMAL]: {
    dialogue: {
      steps: [
        {
          type: 'message',
          message: { speaker: '木乃香', text: 'ネギ君、麻帆良祭楽しんどる？' },
        },
        {
          type: 'message',
          message: { speaker: 'ネギ', text: 'はい、木乃香さんも楽しんでくださいね。' },
        },
      ],
    },
  },
};

export default TALKS;
