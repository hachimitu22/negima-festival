import GameSystem from '../../../gameEngine/gameSystem.js';
import SYSTEM_IDS from './systemIds.js';
import INPUT_IDS from '../../../inputIds.js';
import TALKS from '../talks/talks.js';

/** Actorと現在地を所有する。 */
class ActorSystem extends GameSystem {
  #actors = new Map();

  /** ActorSystemを生成する。 */
  constructor() {
    super(SYSTEM_IDS.ACTOR);
  }

  /**
   * AreaSystemを取得する。
   * @param {Object} context - 依存解決API。
   * @param {Function} dependencies.requireSystem - System取得関数。
   * @returns {void}
   */
  attach(context) {
    // 入力受付設定
    context.inputDispatcher.register({
      inputId: INPUT_IDS.ACTOR.AREA_MOVE,
      handler: (params, context) => {
        this.moveActor(params, context);
        context.getSystem(SYSTEM_IDS.EVENT).onActorAreaMoved(params, context);
        context.getSystem(SYSTEM_IDS.CLOCK).setStep();
      },
    });

    context.inputDispatcher.register({
      inputId: INPUT_IDS.ACTOR.TALK_START,
      handler: (params, context) => {
        this.startTalk(params, context);
      },
    });
  }

  /**
   * Actorを更新する。
   * @param {Object} context - フレームコンテキスト。
   * @returns {void}
   */
  update(context) {
    // ダイアログ表示中は何もしない
    if (context.getSystem(SYSTEM_IDS.DIALOGUE).hasActiveDialogue()) {
      return;
    }

    const actorContext = {
      areas: context.getSystem(SYSTEM_IDS.AREA).getAreaIds(),
      dateTime: context.getSystem(SYSTEM_IDS.CLOCK).getDateTime(),
    };
    for (const actor of this.#actors.values()) {
      actor.update(actorContext);
    }
  }

  /**
   * Actorを登録する。
   * @param {Object} actor - 登録するActor。
   * @returns {void}
   */
  addActor(actor) {
    if (this.#actors.has(actor.id)) {
      throw new Error(`Duplicate actor id: ${actor.id}`);
    }
    this.#actors.set(actor.id, actor);
  }

  /**
   * Actorの移動を要求する。
   * @param {Object} request - 移動要求。
   * @param {string} request.actorId - Actor ID。
   * @param {string} request.areaId - 移動先エリアID。
   * @returns {Object} 受付結果と完了結果。
   */
  moveActor({ actorId, areaId }, context) {
    const actor = this.#actors.get(actorId);
    if (!actor) {
      throw new Error('actor-not-found');
    }
    if (!context.getSystem(SYSTEM_IDS.AREA).hasArea(areaId)) {
      throw new Error('area-not-found');
    }

    actor.moveTo(areaId);
  }

  isActorInArea({ actorId, areaId }) {
    const actor = this.#actors.get(actorId);
    if (!actor) {
      return false;
    }

    return actor.areaId === areaId;
  }

  startTalk({ actorId }, context) {
    const actor = this.#actors.get(actorId);
    if (!actor) {
      throw new Error('actor-not-found');
    }
    const talkId = actor.getTalkId();
    if (!talkId) {
      throw new Error('talkId-not-found');
    }
    const talk = TALKS[talkId];
    if (!talk) {
      throw new Error('talk-not-found');
    }

    const dialogue = talk.dialogue;
    context.getSystem(SYSTEM_IDS.DIALOGUE).start({
      ownerId: talkId,
      dialogue: dialogue,
      complete: () => {},
    }, context);
  }

  enableSchedule(actorId, scheduleId) {
    const actor = this.#actors.get(actorId);
    if (!actor) {
      throw new Error('actor-not-found');
    }
    actor.enableSchedule(scheduleId);
  }

  /**
   * 全Actorのsnapshotを返す。
   * @returns {Array<Object>} Actor一覧。
   */
  createActorsSnapshot() {
    return [...this.#actors.values()].map(actor => actor.createSnapshot());
  }
}

export default ActorSystem;
