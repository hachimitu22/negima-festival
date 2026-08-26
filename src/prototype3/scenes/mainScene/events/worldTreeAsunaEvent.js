import ACTOR_IDS from '../actorIds.js';
import AREA_IDS from '../areaIds.js';
import { EventTriggerTypes } from './eventDataTypes.js';
import EVENT_IDS from './eventIds.js';

/** 世界樹への進入で開始する明日菜との会話イベントデータ。 */
const WorldTreeAsunaEvent = {
  id: EVENT_IDS.WORLD_TREE_ASUNA,
  trigger: {
    type: EventTriggerTypes.AREA_ENTER,
    // 誰が移動した
    enteringActorId: ACTOR_IDS.PLAYER,
    // どこに移動した
    enteredAreaId: AREA_IDS.WORLD_TREE,
    // 移動先に誰が居れば
    presentActorId: ACTOR_IDS.ASUNA,
  },
  dialogue: {
    steps: [
      {
        type: 'message',
        message: { speaker: 'ネギ', text: '明日菜さん　こんにちは' },
      },
      {
        type: 'message',
        message: { speaker: '明日菜', text: 'あら、ネギじゃない' },
      },
      {
        type: 'choice',
        message: { speaker: '明日菜', text: 'こんなところで何してるのよ？' },
        choices: [
          {
            id: 'look-around-festival',
            text: '麻帆良祭の様子を見て回っているんです。',
            steps: [
              {
                type: 'message',
                message: { speaker: '明日菜', text: '相変わらず真面目ね。' },
              },
            ],
          },
          {
            id: 'looking-for-asuna',
            text: '明日菜さんを探していたんです。',
            steps: [
              {
                type: 'message',
                message: { speaker: '明日菜', text: 'な、何よ急に。' },
              },
            ],
          },
          {
            id: 'forget',
            text: '忘れちゃいました……',
            steps: [
              {
                type: 'choice',
                message: { speaker: '明日菜', text: 'あんた大丈夫？疲れてるんじゃない？' },
                choices: [
                  {
                    id: 'powerful',
                    text: '全然へっちゃらですよ！',
                    steps: [
                      {
                        type: 'message',
                        message: { speaker: '明日菜', text: 'そう？無理すんじゃないわよ' },
                      },
                      {
                        type: 'message',
                        message: { speaker: 'ネギ', text: 'ありがとうございます' },
                      },
                    ],
                  },
                  {
                    id: 'sick',
                    text: 'ちょっと体調が悪いかも',
                    steps: [
                      {
                        type: 'message',
                        message: { speaker: '明日菜', text: '世話が掛かるわね、保健室に行くわよ' },
                      },
                      {
                        type: 'message',
                        message: { speaker: 'ネギ', text: 'す、すみません' },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};

export default WorldTreeAsunaEvent;
