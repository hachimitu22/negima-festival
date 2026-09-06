/** EventSystemが判定できる開始条件の種類。 */
const EventTriggerTypes = Object.freeze({
  /**
   * エリア移動時イベント
   * 対象アクターと同時にエリアに入った場合は発生しない。
   */
  AREA_ENTER: 'area.enter',
  /**
   * 会話が開始されたとき
   */
  TALK_START: 'talk.start',
  /**
   * 特定の時間になった時のイベント
   */
  TIME_REACHED: 'time.reached',
});

export {
  EventTriggerTypes,
};
