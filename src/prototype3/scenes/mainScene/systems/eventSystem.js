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

  /**
   * Actorへの会話開始時に、条件へ一致するイベントを通常会話より優先して開始する。
   * @param {Object} params - 会話開始情報。
   * @param {string} params.initiatingActorId - 会話を開始したActor ID。
   * @param {string} params.actorId - 会話相手のActor ID。
   * @param {Object} context - System参照を持つ更新コンテキスト。
   * @returns {boolean} イベントを開始した場合はtrue。
   */
  onTalkStarted({ initiatingActorId, actorId }, context) {
    if (this.#activeEventState) {
      return false;
    }

    const actorSystem = context.getSystem(SYSTEM_IDS.ACTOR);
    const currentDateTime = context.getSystem(SYSTEM_IDS.CLOCK).getDateTime();
    const state = [...this.#eventStates.values()].find(candidate => {
      const trigger = candidate.definition.trigger;

      return candidate.status === 'waiting'
        && trigger.type === EventTriggerTypes.TALK_START
        && trigger.initiatingActorId === initiatingActorId
        && trigger.actorId === actorId
        && trigger.dateTimeRange.contains(currentDateTime,  { includeFrom: true, includeTo: false })
        && actorSystem.isActorInArea({ actorId: initiatingActorId, areaId: trigger.areaId })
        && actorSystem.isActorInArea({ actorId, areaId: trigger.areaId });
    });

    if (!state) {
      return false;
    }

    this.#activeEventState = state;
    state.status = 'executing';
    context.getSystem(SYSTEM_IDS.DIALOGUE).start({
      ownerId: state.definition.id,
      dialogue: state.definition.dialogue,
      complete: this.complete.bind(this),
    }, context);

    return true;
  }

  /**
   * 実行中イベントを完了する。
   * @param {Object} params - 会話完了情報。
   * @param {Object} context - 更新コンテキスト。
   * @returns {void}
   */
  complete(params, context) {
    this.#activeEventState.status = 'complete';
    this.#activeEventState = null;
  }

  /** 全イベントの実行状態をID付きで記録する。 */
  captureState() {
    return [...this.#eventStates.values()].map(state => ({
      id: state.definition.id,
      status: state.status,
    }));
  }

  /** 記録したイベントの実行状態を復元する。 */
  restoreState(eventStates) {
    for (const { id, status } of eventStates) {
      const state = this.#eventStates.get(id);
      if (!state) {
        throw new Error(`event-not-found: ${id}`);
      }
      state.status = status;
    }
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
    return this.captureState();
  }
}

export default EventSystem;
