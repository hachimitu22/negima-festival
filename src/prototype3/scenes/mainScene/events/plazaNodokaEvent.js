import ActorIds from '../actorIds.js';
import AREA_IDS from '../areaIds.js';
import { EventTriggerTypes } from './eventDataTypes.js';
import EventIds from './eventIds.js';
import SYSTEM_IDS from '../systems/systemIds.js';

// のどかからの質問ステップ定義
const questionSteps = Object.freeze([
  {
    type: 'message',
    message: { speaker: 'のどか', text: '麻帆良祭を一緒に回りませんか？' },
  },
  {
    type: 'choice',
    message: { speaker: 'のどか', text: '麻帆良祭を一緒に回りませんか？' },
    choices: Object.freeze([
      Object.freeze({
        id: 'together-tour-festival',
        text: 'いいですよ',
        steps: Object.freeze([
          {
            type: 'message',
            message: { speaker: 'ネギ', text: 'いいですよ、一緒に回りましょう' },
          },
          {
            type: 'message',
            message: { speaker: 'のどか', text: 'ありがとうございます。' },
            // callback: (context) => {
            //   // のどかの好感度を上げる
            //   const actorSystem = context.requireSystem(SYSTEM_IDS.ACTOR);
            //   actorSystem.requestChangeAffection(ACTOR_IDS.NODOKA, 1);

            //   // イベント完了フラグを立てる
            //   const eventSystem = context.requireSystem(SYSTEM_IDS.EVENT);
            //   eventSystem.requestCompleteEvent(PlazaNodokaEvent.id);
            // },
          },
        ]),
      }),
      Object.freeze({
        id: 'busy-now',
        text: 'すみません、今はちょっと忙しいです',
        steps: Object.freeze([
          {
            type: 'message',
            message: { speaker: 'ネギ', text: 'すみません、今はちょっと忙しいです' },
          },
          {
            type: 'message',
            message: { speaker: 'のどか', text: 'そうですか、残念です' },
            // callback: (context) => {
            //   // のどかの好感度を下げる
            //   const actorSystem = context.requireSystem(SYSTEM_IDS.ACTOR);
            //   actorSystem.requestChangeAffection(ACTOR_IDS.NODOKA, -1);
            // },
          },
        ]),
      }),
      // Object.freeze({
      //   id: 'ask-again',
      //   text: 'なんですか？もう一回お願いします',
      //   steps: Object.freeze([
      //     {
      //       type: 'message',
      //       message: { speaker: 'ネギ', text: 'なんですか？もう一回お願いします' },
      //     },
      //     {
      //       type: 'steps',
      //       steps: questionSteps,
      //     }
      //   ]),
      // }),
    ]),
  },
]);

/** 広場でのどかと会話するイベントデータ。 */
const PlazaNodokaEvent = Object.freeze({
  id: EventIds.PLAZA_NODOKA,
  trigger: Object.freeze({
    type: EventTriggerTypes.AREA_ENTER,
    actorId: ActorIds.PLAYER,
    areaId: AREA_IDS.PLAZA,
  }),
  dialogue: {
    steps: [
      // {
      // type: 'dialogue',
      // steps: Object.freeze([
      {
        type: 'message',
        message: { speaker: 'ネギ', text: 'のどかさん、こんにちは。' },
      },
      {
        type: 'message',
        message: { speaker: 'のどか', text: 'ネギ先生、こんにちは。' },
      },
      // {
      //   type: 'handle',
      //   handle: (params, context) => {
      //     context.getSystem(SYSTEM_IDS.EVENT).finish(context);
      //   },
      // },
      ...questionSteps,
      // ]),
      // },
    ],
  },
});

export default PlazaNodokaEvent;
