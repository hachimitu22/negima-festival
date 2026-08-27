import GameSystem from '../../../gameEngine/gameSystem.js';
import { EventTriggerTypes } from '../events/eventDataTypes.js';
import SYSTEM_IDS from './systemIds.js';
import INPUT_IDS from '../../../inputIds.js';
import ClockDateTime from '../clockDateTime.js';

/** 宣言されたイベントの開始条件と完了状態を管理する。 */
class EventSystem extends GameSystem {
  #eventStates;
  #activeEventState = null;

  /**
   * @param {Object} options - 初期設定。
   * @param {Array<Object>} options.events - 実行対象のイベントデータ一覧。
   */
  constructor({ events }) {
    super(SYSTEM_IDS.EVENT);
    this.#eventStates = new Map(events.map(event => [event.id, {
      definition: event,
      status: 'waiting',
    }]));
  }

  /**
   * AreaSystemとDialogueSystemを取得する。
   * @param {Object} context - コンテキスト
   * @returns {void}
   */
  attach(context) {
  }

  onActorAreaMoved({ actorId, areaId }, context) {
    // イベント中は新しいイベントを開始しない
    if (this.#activeEventState) {
      return;
    }

    // 条件に一致する待機中イベントを探す
    const state = this.#eventStates.values().find(state =>
      state.status === 'waiting'
      && state.definition.trigger.type === EventTriggerTypes.AREA_ENTER
      && state.definition.trigger.enteringActorId === actorId
      && state.definition.trigger.enteredAreaId === areaId
      && context.getSystem(SYSTEM_IDS.ACTOR).isActorInArea({
        actorId: state.definition.trigger.presentActorId,
        areaId: state.definition.trigger.enteredAreaId,
      })
    );

    // イベントが見つからなければ何もしない
    if (!state) {
      return;
    }

    this.#activeEventState = state;
    this.#activeEventState.status = 'executing';

    const dialogue = this.#activeEventState.definition.dialogue;
    context.getSystem(SYSTEM_IDS.DIALOGUE).start({
      ownerId: this.#activeEventState.definition.id,
      dialogue: dialogue,
      complete: this.complete.bind(this),
    }, context);
  }

  complete(params, context) {
    this.#activeEventState.status = 'complete';
    this.#activeEventState = null;
  }

  onTimeReached({ dateTime }, context) {
    // イベント中は新しいイベントを開始しない
    if (this.#activeEventState) {
      return;
    }

    // 条件に一致する待機中イベントを探す
    const state = this.#eventStates.values().find(state => {
      if (state.status !== 'waiting') return false;
      if (state.definition.trigger.type !== EventTriggerTypes.TIME_REACHED) return false;

      const currentTime = dateTime.getTime();
      const eventTime = new ClockDateTime(state.definition.trigger.time).getTime();
      return currentTime === eventTime;
    });

    // イベントが見つからなければ何もしない
    if (!state) {
      return;
    }

    this.#activeEventState = state;
    this.#activeEventState.status = 'executing';

    const dialogue = this.#activeEventState.definition.dialogue;
    context.getSystem(SYSTEM_IDS.DIALOGUE).start({
      ownerId: this.#activeEventState.definition.id,
      dialogue: dialogue,
      complete: this.complete.bind(this),
    }, context);
  }

  /**
   * 実行中会話の完了確認または待機中イベントの開始を行う。
   * @param {Object} options - 更新情報。
   * @param {Object} options.context - フレームコンテキスト。
   * @returns {void}
   */

  /**
   * 全イベントの状態を登録順で返す。
   * @returns {Array<Object>} イベント状態一覧。
   */
  createEventsSnapshot() {
    return [...this.#eventStates.values()].map(state => ({
      id: state.definition.id,
      status: state.status,
    }));
  }
}

export default EventSystem;
