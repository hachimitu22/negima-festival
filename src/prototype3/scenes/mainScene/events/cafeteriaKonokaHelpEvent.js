import ACTOR_IDS from '../actors/actorIds.js';
import AREA_IDS from '../areaIds.js';
import ClockDuration from '../clockDuration.js';
import SCHEDULE_IDS from '../schedules/scheduleIds.js';
import SCHEDULES from '../schedules/schedules.js';
import { EventTriggerTypes } from './eventDataTypes.js';
import EVENT_IDS from './eventIds.js';

/** 指定時間に食堂の木乃香へ話しかけると開始する手伝いイベント。 */
const CafeteriaKonokaHelpEvent = Object.freeze({
  id: EVENT_IDS.CAFETERIA_KONOKA_HELP,
  trigger: Object.freeze({
    type: EventTriggerTypes.TALK_START,
    initiatingActorId: ACTOR_IDS.PLAYER,
    actorId: ACTOR_IDS.KONOKA,
    areaId: AREA_IDS.CAFETERIA,
    receptionTimeRange: SCHEDULES[SCHEDULE_IDS.KONOKA.CAFETERIA_HELP].dateTimeRange,
  }),
  dialogue: Object.freeze({
    steps: Object.freeze([
      Object.freeze({
        type: 'message',
        message: Object.freeze({ speaker: '木乃香', text: 'ネギ君、ちょうどええところに。食堂の手伝い、お願いしてもええ？' }),
      }),
      Object.freeze({
        type: 'choice',
        message: Object.freeze({ speaker: '木乃香', text: 'どっちを手伝ってくれる？' }),
        choices: Object.freeze([
          Object.freeze({
            id: 'serve-food',
            text: '料理を運びます',
            steps: Object.freeze([
              Object.freeze({
                type: 'message',
                message: Object.freeze({ speaker: 'ネギ', text: '料理を運びます。僕に任せてください！' }),
              }),
              Object.freeze({
                type: 'message',
                message: Object.freeze({ speaker: '木乃香', text: 'おおきに。待っとったお客さんに、みんな届けられたわ。' }),
              }),
            ]),
          }),
          Object.freeze({
            id: 'clear-dishes',
            text: '食器を片づけます',
            steps: Object.freeze([
              Object.freeze({
                type: 'message',
                message: Object.freeze({ speaker: 'ネギ', text: '食器を片づけます。空いた席から始めますね！' }),
              }),
              Object.freeze({
                type: 'message',
                message: Object.freeze({ speaker: '木乃香', text: 'おおきに。これで次のお客さんを案内できるわ。' }),
              }),
            ]),
          }),
        ]),
      }),
    ]),
  }),
});

export default CafeteriaKonokaHelpEvent;
