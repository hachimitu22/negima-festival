import {
  ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS,
} from './accompanimentConversationSceneScripts.js';
import { AccompanimentEvent } from './accompanimentEvent.js';
import { ACTOR_MOVEMENT_MODES } from '../actor.js';
import { BranchEventManager } from './branchEventManager.js';
import { createConversationSceneScript } from '../../conversationScene/conversationSceneScripts.js';
import {
  DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS,
} from './deliveryConversationSceneScripts.js';
import { DeliveryEvent } from './deliveryEvent.js';
import { EventIdSequence } from './eventIdSequence.js';
import { LOCATIONS } from '../locations.js';
import { PatrolEventManager } from './patrolEventManager.js';
import { getRandomInt } from '../../random.js';

const DELIVERY_AFFECTION_REWARD = 5;
const ACCOMPANIMENT_AFFECTION_REWARD = 20;

/**
 * メインゲーム中の継続イベントを管理するSystem。
 *
 * @public
 */
class EventSystem {
  #activeConversationEvent;
  #actorsProvider;
  #branchEventManager;
  #companionRequests;
  #conversationRequests;
  #createConversationScript;
  #eventIdSequence;
  #locations;
  #patrolEventManager;
  #randomInt;
  #rewardRequests;

  /**
   * EventSystemを生成する。
   *
   * @public
   * @param {Object} config - 生成設定。
   * @param {Character} config.character - 主人公。
   * @param {number} config.durationHours - 祭終了時刻。
   * @param {Function} [config.actorsProvider] - actor配列を返す関数。
   * @param {Object} [config.conversationRequests] - 会話開始request API。
   * @param {Object} [config.rewardRequests] - 報酬request API。
   * @param {Object} [config.companionRequests] - 同行者制御request API。
   * @param {EventIdSequence} [config.eventIdSequence] - event ID採番器。
   * @param {Array<Object>} [config.locations] - 場所定義配列。
   * @param {Function} [config.createConversationScript] - 会話script生成関数。
   * @param {Function} [config.randomInt] - 乱数生成関数。
   */
  constructor({
    character,
    durationHours,
    actorsProvider = () => [],
    conversationRequests = {},
    rewardRequests = {},
    companionRequests = {},
    eventIdSequence = new EventIdSequence(),
    locations = LOCATIONS,
    createConversationScript = createConversationSceneScript,
    randomInt = getRandomInt,
  }) {
    this.#activeConversationEvent = null;
    this.#actorsProvider = actorsProvider;
    this.#conversationRequests = conversationRequests;
    this.#rewardRequests = rewardRequests;
    this.#companionRequests = companionRequests;
    this.#eventIdSequence = eventIdSequence;
    this.#locations = locations;
    this.#createConversationScript = createConversationScript;
    this.#randomInt = randomInt;
    this.#patrolEventManager = new PatrolEventManager({
      character,
      eventIdSequence: this.#eventIdSequence,
      durationHours,
    });
    this.#branchEventManager = new BranchEventManager({
      character,
      eventIdSequence: this.#eventIdSequence,
    });
  }

  /**
   * actor会話入力をイベント会話または通常会話として開始する。
   *
   * @public
   * @param {Object} actor - 会話対象actor。
   * @param {Object} [options={}] - 会話判定オプション。
   * @param {string} [options.currentLocationId] - 主人公の現在地ID。
   * @returns {boolean} 会話開始できた場合はtrue。
   */
  requestActorConversation(actor, { currentLocationId = null } = {}) {
    if (!actor) {
      return false;
    }

    if (this.#activeConversationEvent) {
      const interaction = this.#activeConversationEvent.createActorInteraction(
        actor.id,
        currentLocationId,
      );
      if (interaction) {
        return this.#startEventConversation(
          this.#activeConversationEvent,
          interaction,
        );
      }

      if (this.isActorInteractionBlocked(actor.id, currentLocationId)) {
        return false;
      }

      return this.#startNormalConversation(actor);
    }

    return this.#startConversationWithEventCandidates(actor);
  }

  /**
   * ゲーム時刻を継続イベントへ通知する。
   *
   * @public
   * @param {number} currentHours - 現在ゲーム時刻。
   * @returns {void}
   */
  advanceTo(currentHours) {
    this.#patrolEventManager.advanceTo(currentHours);
    this.#branchEventManager.advanceTo(currentHours);
  }

  /**
   * 場所訪問を継続イベントへ通知する。
   *
   * @public
   * @param {Array<string>} locationIds - 訪問した場所ID配列。
   * @returns {void}
   */
  visitLocations(locationIds = []) {
    const uniqueLocationIds = Array.from(new Set(locationIds));
    uniqueLocationIds.forEach(locationId => {
      this.#patrolEventManager.visitLocation(locationId);
      this.#branchEventManager.visitLocation(locationId);
    });
  }

  /**
   * 実行中の分岐イベントへ選択肢を渡す。
   *
   * @public
   * @param {string} choiceId - 選択肢ID。
   * @returns {boolean} 選択が受理された場合はtrue。
   */
  chooseCurrentTask(choiceId) {
    return this.#branchEventManager.chooseCurrentTask(choiceId);
  }

  /**
   * 時間遡行に伴ってイベント状態を巻き戻す。
   *
   * @public
   * @param {number} currentHours - 巻き戻し後のゲーム時刻。
   * @returns {void}
   */
  rewindTo(currentHours) {
    this.#releaseActiveCompanion({ resetNextMoveTime: false });
    this.#activeConversationEvent = null;
    this.#patrolEventManager.rewindTo(currentHours);
    this.#branchEventManager.rewindTo(currentHours);
  }

  /**
   * 実行中同行イベントの同伴者actor IDを返す。
   *
   * @public
   * @returns {string|null} 同伴者actor ID。同行中でなければnull。
   */
  getActiveCompanionActorId() {
    return this.#activeConversationEvent instanceof AccompanimentEvent
      ? this.#activeConversationEvent.getCompanionActorId()
      : null;
  }

  /**
   * actorとの会話がイベント条件によって禁止されているか確認する。
   *
   * @public
   * @param {string} actorId - actor ID。
   * @param {string} currentLocationId - 主人公の現在地ID。
   * @returns {boolean} 会話が禁止されている場合はtrue。
   */
  isActorInteractionBlocked(actorId, currentLocationId) {
    return (
      this.#activeConversationEvent instanceof AccompanimentEvent
      && this.#activeConversationEvent.isActorInteractionBlocked(
        actorId,
        currentLocationId,
      )
    );
  }

  /**
   * イベント由来のsnapshot fragmentを生成する。
   *
   * @public
   * @returns {Object} snapshot fragment。
   */
  createSnapshotFragment() {
    return {
      companion: this.#activeConversationEvent instanceof AccompanimentEvent
        ? this.#activeConversationEvent.getCompanionSnapshot()
        : null,
      executingEvents: [
        this.#patrolEventManager.getExecutingEventSnapshot(),
        this.#branchEventManager.getExecutingEventSnapshot(),
        this.#activeConversationEvent?.getSnapshot() ?? null,
      ].filter(Boolean),
    };
  }

  #startConversationWithEventCandidates(actor) {
    const eventCandidates = this.#createEventCandidates(actor);
    const script = this.#createConversationScript(actor, {
      additionalScripts: eventCandidates.map(candidate => (
        candidate.interaction.conversationSceneScript
      )),
    });
    if (!hasConversationMessages(script)) {
      return false;
    }

    const selectedCandidate = eventCandidates.find(candidate => (
      candidate.scriptId === script.id
    ));
    if (selectedCandidate) {
      this.#eventIdSequence.next();
      return this.#startEventConversation(
        selectedCandidate.event,
        selectedCandidate.interaction,
        {
          activateOnComplete: true,
        },
      );
    }

    return this.#startNormalConversation(actor, script);
  }

  #createEventCandidates(actor) {
    return [
      createEventCandidate(
        this.#createDeliveryEventCandidate(actor),
        DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
      ),
      createEventCandidate(
        this.#createAccompanimentEventCandidate(actor),
        ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
      ),
    ].filter(Boolean);
  }

  #startNormalConversation(
    actor,
    script = this.#createConversationScript(actor),
  ) {
    if (!hasConversationMessages(script)) {
      return false;
    }

    return this.#startConversation({
      script,
      onComplete: conversationSceneResult => {
        this.#rewardRequests.applyConversationResult?.(
          actor.id,
          conversationSceneResult,
        );
      },
    });
  }

  #startEventConversation(
    event,
    interaction,
    { activateOnComplete = false } = {},
  ) {
    return this.#startConversation({
      script: interaction.conversationSceneScript,
      onComplete: conversationSceneResult => {
        event.completeInteraction(interaction.kind, conversationSceneResult);

        if (activateOnComplete && event.isExecuting()) {
          this.#activeConversationEvent = event;
          this.#controlActiveCompanionExternally();
          return;
        }

        this.#finishActiveConversationEvent(event);
      },
    });
  }

  #startConversation({ script, onComplete }) {
    return this.#conversationRequests.start?.({
      script,
      onComplete,
    }) === true;
  }

  #createDeliveryEventCandidate(sender) {
    const recipients = this.#getActors()
      .filter(actor => actor.id !== sender.id);
    if (recipients.length === 0) {
      return null;
    }

    const recipient = recipients[this.#randomInt(0, recipients.length - 1)];
    return new DeliveryEvent(this.#eventIdSequence.peek(), {
      sender,
      recipient,
    });
  }

  #createAccompanimentEventCandidate(companion) {
    const destinationLocations = this.#locations.filter(location => (
      location.id !== companion.locationId
    ));
    if (destinationLocations.length === 0) {
      return null;
    }

    const destination = destinationLocations[
      this.#randomInt(0, destinationLocations.length - 1)
    ];
    return new AccompanimentEvent(this.#eventIdSequence.peek(), {
      companion,
      destination,
    });
  }

  #finishActiveConversationEvent(event) {
    if (event !== this.#activeConversationEvent) {
      return;
    }

    if (event.isSucceeded()) {
      this.#applyEventReward(event);
      this.#releaseActiveCompanion();
      this.#activeConversationEvent = null;
    } else if (typeof event.isFailed === 'function' && event.isFailed()) {
      this.#releaseActiveCompanion();
      this.#activeConversationEvent = null;
    }
  }

  #applyEventReward(event) {
    if (event instanceof AccompanimentEvent) {
      this.#rewardRequests.applyAffection?.(
        event.getCompanionActorId(),
        ACCOMPANIMENT_AFFECTION_REWARD,
      );
      return;
    }

    event.getParticipantActorIds().forEach(actorId => {
      this.#rewardRequests.applyAffection?.(
        actorId,
        DELIVERY_AFFECTION_REWARD,
      );
    });
  }

  #controlActiveCompanionExternally() {
    const companionActorId = this.getActiveCompanionActorId();
    if (!companionActorId) {
      return;
    }

    this.#companionRequests.setActorMovementMode?.(
      companionActorId,
      ACTOR_MOVEMENT_MODES.EXTERNAL,
    );
  }

  #releaseActiveCompanion({ resetNextMoveTime = true } = {}) {
    const companionActorId = this.getActiveCompanionActorId();
    if (!companionActorId) {
      return;
    }

    this.#companionRequests.setActorMovementMode?.(
      companionActorId,
      ACTOR_MOVEMENT_MODES.AUTOMATIC,
    );
    if (resetNextMoveTime) {
      this.#companionRequests.resetActorNextMoveTime?.(companionActorId);
    }
  }

  #getActors() {
    const actors = this.#actorsProvider();
    return Array.isArray(actors) ? actors : [];
  }
}

function createEventCandidate(event, scriptId) {
  if (!event) {
    return null;
  }

  const interaction = event.createRequestInteraction();
  return {
    scriptId,
    event,
    interaction,
  };
}

function hasConversationMessages(script) {
  return Array.isArray(script?.messages) && script.messages.length > 0;
}

export {
  ACCOMPANIMENT_AFFECTION_REWARD,
  DELIVERY_AFFECTION_REWARD,
  EventSystem,
};
