/**
 * 配達会話シーンスクリプト ID値。
 * @public
 */
const DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS = Object.freeze({
  REQUEST: 'deliveryRequest',
  RECONFIRM: 'deliveryReconfirm',
  COMPLETE: 'deliveryComplete',
});

/**
 * 配達会話選抚肢 ID値。
 * @public
 */
const DELIVERY_CONVERSATION_SCENE_SCRIPT_CHOICE_IDS = Object.freeze({
  CONTINUE: 'continue-delivery',
  DECLINE: 'decline-delivery',
});

/**
 * 配達要求会話を初期化。
 * @public
 * @param {DeliveryTask} task - 配達タスク
 * @returns {Object} 会話スクリプトオブジェクト
 */
function createDeliveryRequestConversationSceneScript(task) {
  const { sender, recipient } = task;
  return {
    id: DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
    choice: null,
    messages: [
      {
        speakerName: sender.name,
        message: `ネギ先生、${recipient.name}さんにこの届け物を渡してもらえませんか？`,
      },
      {
        speakerName: 'ネギ',
        message: 'はい、分かりました。',
      },
    ],
  };
}

/**
 * 配達再確認会話を初期化。
 * @private
 * @param {DeliveryTask} task - 配達タスク
 * @returns {Object} 会話スクリプトオブジェクト
 */
function createDeliveryReconfirmConversationSceneScript(task) {
  const { sender, recipient } = task;
  return {
    id: DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS.RECONFIRM,
    messages: [
      {
        speakerName: sender.name,
        message: `${recipient.name}さんへの届け物は、引き続きお願いできますか？`,
      },
    ],
    choice: {
      messageIndex: 0,
      options: [
        {
          id: DELIVERY_CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.CONTINUE,
          label: 'はい、このまま続けます。',
          messages: [
            {
              speakerName: 'ネギ',
              message: 'はい、このまま続けます。',
            },
            {
              speakerName: sender.name,
              message: 'よろしくお願いします。',
            },
          ],
        },
        {
          id: DELIVERY_CONVERSATION_SCENE_SCRIPT_CHOICE_IDS.DECLINE,
          label: 'すみません、今回はお断りします。',
          messages: [
            {
              speakerName: 'ネギ',
              message: 'すみません、今回はお断りします。',
            },
            {
              speakerName: sender.name,
              message: '分かりました。',
            },
          ],
        },
      ],
    },
  };
}

/**
 * 配達完了会話を初期化。
 * @private
 * @param {DeliveryTask} task - 配達タスク
 * @returns {Object} 会話スクリプトオブジェクト
 */
function createDeliveryCompleteConversationSceneScript(task) {
  const { sender, recipient } = task;
  return {
    id: DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS.COMPLETE,
    choice: null,
    messages: [
      {
        speakerName: 'ネギ',
        message: `${sender.name}さんから届け物を預かっています。`,
      },
      {
        speakerName: recipient.name,
        message: 'ありがとうございます。',
      },
    ],
  };
}

export {
  DELIVERY_CONVERSATION_SCENE_SCRIPT_CHOICE_IDS,
  DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS,
  createDeliveryCompleteConversationSceneScript,
  createDeliveryReconfirmConversationSceneScript,
  createDeliveryRequestConversationSceneScript,
};
