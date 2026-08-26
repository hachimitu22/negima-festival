import { EventTriggerTypes } from './eventDataTypes.js';
import EventIds from './eventIds.js';

/** 麻帆良祭のアナウンスイベントデータ。 */
const FestivalAnnouncementEvent = Object.freeze({
  id: EventIds.FESTIVAL_ANNOUNCEMENT,
  trigger: Object.freeze({
    type: EventTriggerTypes.TIME_REACHED,
    time: { day: 20, hour: 10, min: 15 },
  }),
  dialogue: {
    steps: [
      {
        type: 'message',
        message: { speaker: 'アナウンス', text: 'こちらは麻帆良祭実行委員です' },
      },
      {
        type: 'message',
        message: { speaker: 'アナウンス', text: '大変混雑しておりますのでお気を付けください' },
      },
    ],
  },
});

export default FestivalAnnouncementEvent;
