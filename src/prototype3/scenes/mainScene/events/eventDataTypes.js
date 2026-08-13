/** EventSystemが判定できる開始条件の種類。 */
const EventTriggerTypes = Object.freeze({
  AREA_ENTER: 'area.enter', // エリアに入ったとき
  CONVERSATION_START: 'conversation.start', // 会話が開始されたとき
});

export {
  EventTriggerTypes,
};
