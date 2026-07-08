import { INPUT_TYPES, MAIN_GAME_LAYER_IDS, SCENE_IDS, TARGET_PREFIXES } from '../actions.js';
import {
  ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS,
} from './event/accompanimentConversationSceneScripts.js';
import { AccompanimentEvent } from './event/accompanimentEvent.js';
import { ACTOR_MOVEMENT_MODES } from './actor.js';
import { BranchEventManager } from './event/branchEventManager.js';
import { calculateAffectionChange } from './affection.js';
import { Character } from './character.js';
import { ConversationScene } from '../conversationScene/conversationScene.js';
import { createConversationSceneScript } from '../conversationScene/conversationSceneScripts.js';
import {
  DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS,
} from './event/deliveryConversationSceneScripts.js';
import { DeliveryEvent } from './event/deliveryEvent.js';
import { EventIdSequence } from './event/eventIdSequence.js';
import { LOCATION_IDS, LOCATIONS, findLocation } from './locations.js';
import { PatrolEventManager } from './event/patrolEventManager.js';
import { Student } from './student.js';
import { Teacher } from './teacher.js';
import { getRandomInt } from '../random.js';

const FESTIVAL_DURATION_HOURS = 72;
const TIME_TRAVEL_HOURS = 24;
const GAME_HOURS_PER_REAL_SECOND = 0.5;
const MAX_MAGIC_POWER = 100;
const CASSIOPEIA_MAGIC_POWER_COST = 30;
const MAGIC_POWER_RECOVERY_PER_GAME_HOUR = 5;
const TEACHER_IDS = {
  TAKAHATA: 'teacher-takahata',
  SHIZUNA: 'teacher-shizuna',
};
const DELIVERY_AFFECTION_REWARD = 5;
const ACCOMPANIMENT_AFFECTION_REWARD = 20;

/**
 * メインゲームシーン。3日間の麻帆良祭を管理するシーン（GameObject を継承）。
 * 
 * キャラクター移動、時間管理、イベント制御、UI状態を一元管理。
 * ユーザー入力やゲーム時間経過に応じてゲーム状態を更新し、スナップショットを作成する。
 * 
 * @public
 */
class MainGameScene {
  #gameTime;
  #loop;
  #character;
  #actors;
  #activeLayerId;
  #activeConversationEvent;
  #eventIdSequence;
  #branchEventManager;
  #patrolEventManager;

  /**
   * メインゲームシーンをインスタンス化する。
   * 
   * キャラクター、学生・教員アクター、イベント管理、ゲーム時間を初期化。
   * 
   * @public
   * 
   * @example
   * const scene = new MainGameScene();\n   * // ゲームエンジンに登録して start()
   */
  constructor() {
    this.#gameTime = {
      currentHours: 0,
      durationHours: FESTIVAL_DURATION_HOURS,
      hoursPerRealSecond: GAME_HOURS_PER_REAL_SECOND,
      isEnded: false,
    };
    this.#loop = {
      count: 1,
      timeTravelHours: TIME_TRAVEL_HOURS,
      cassiopeiaMagicPowerCost: CASSIOPEIA_MAGIC_POWER_COST,
    };
    this.#character = new Character(LOCATION_IDS.GYM_FRONT_PARKING, {
      magicPower: {
        current: MAX_MAGIC_POWER,
        max: MAX_MAGIC_POWER,
        recoveryPerGameHour: MAGIC_POWER_RECOVERY_PER_GAME_HOUR,
      },
    });
    this.#actors = [
      new Student('相坂さよ'                              ,  1, LOCATION_IDS.CLASSROOM_3A),
      new Student('明石裕奈'                              ,  2, LOCATION_IDS.GYM_ARENA),
      new Student('朝倉和美'                              ,  3, LOCATION_IDS.CLASSROOM_3A),
      new Student('綾瀬夕映'                              ,  4, LOCATION_IDS.LIBRARY_ROOM),
      new Student('和泉亜子'                              ,  5, LOCATION_IDS.HEALTH_ROOM),
      new Student('大河内アキラ'                          ,  6, LOCATION_IDS.SCHOOL_GROUND),
      new Student('柿崎美砂'                              ,  7, LOCATION_IDS.GYM_ARENA),
      new Student('神楽坂明日菜'                          ,  8, LOCATION_IDS.LIBRARY_ROOM_FRONT_CORRIDOR),
      new Student('春日美空'                              ,  9, LOCATION_IDS.CHURCH_FRONT),
      new Student('絡繰茶々丸'                            , 10, LOCATION_IDS.FOOD_STREET),
      new Student('釘宮円'                                , 11, LOCATION_IDS.GYM_ARENA),
      new Student('古菲'                                  , 12, LOCATION_IDS.CLUB_BUILDING),
      new Student('近衛木乃香'                            , 13, LOCATION_IDS.LIBRARY_ROOM),
      new Student('早乙女ハルナ'                          , 14, LOCATION_IDS.LIBRARY_ROOM),
      new Student('桜咲刹那'                              , 15, LOCATION_IDS.DAVID_PLAZA),
      new Student('佐々木まき絵'                          , 16, LOCATION_IDS.GYM_ARENA),
      new Student('椎名桜子'                              , 17, LOCATION_IDS.GYM_ARENA),
      new Student('龍宮真名'                              , 18, LOCATION_IDS.ROOF),
      new Student('超鈴音'                                , 19, LOCATION_IDS.GYM_ARENA),
      new Student('長瀬楓'                                , 20, LOCATION_IDS.CLUB_BUILDING),
      new Student('那波千鶴'                              , 21, LOCATION_IDS.DAVID_PLAZA),
      new Student('鳴滝風香'                              , 22, LOCATION_IDS.DAVID_PLAZA),
      new Student('鳴滝史伽'                              , 23, LOCATION_IDS.DAVID_PLAZA),
      new Student('葉加瀬聡美'                            , 24, LOCATION_IDS.CLUB_BUILDING),
      new Student('長谷川千雨'                            , 25, LOCATION_IDS.REST_AREA),
      new Student('エヴァンジェリン・A・K・マクダウェル'  , 26, LOCATION_IDS.FOOD_STREET),
      new Student('宮崎のどか'                            , 27, LOCATION_IDS.LIBRARY_ROOM),
      new Student('村上夏美'                              , 28, LOCATION_IDS.CLASSROOM_3A),
      new Student('雪広あやか'                            , 29, LOCATION_IDS.FOOD_STREET),
      new Student('四葉五月'                              , 30, LOCATION_IDS.FOOD_STREET),
      new Student('ザジ・レイニーデイ'                    , 31, LOCATION_IDS.ROOF),
      new Teacher(
        TEACHER_IDS.TAKAHATA,
        '高畑・T・タカミチ',
        LOCATION_IDS.STAFF_ROOM,
        {
          excludedLocationIds: [
            LOCATION_IDS.GIRLS_BATHROOM,
            LOCATION_IDS.GYM_CHANGING_ROOM,
          ],
        },
      ),
      new Teacher(
        TEACHER_IDS.SHIZUNA,
        '源しずな',
        LOCATION_IDS.STAFF_ROOM,
      ),
    ];
    this.#activeLayerId = MAIN_GAME_LAYER_IDS.MAP;
    this.#eventIdSequence = new EventIdSequence();
    this.#activeConversationEvent = null;
    this.#patrolEventManager = new PatrolEventManager({
      character: this.#character,
      eventIdSequence: this.#eventIdSequence,
      durationHours: this.#gameTime.durationHours,
    });
    this.#branchEventManager = new BranchEventManager({
      character: this.#character,
      eventIdSequence: this.#eventIdSequence,
    });
  }

  /**
   * ゲームエンジンから毎フレーム呼び出される。入力処理、ゲーム時間管理、アクター更新を実行。
   * 
   * 会話シーン遷移が必要な場合は新しいシーンを push する。
   * 
   * @public
   * @param {Object} options - 更新オプション
   * @param {Object} options.context - 更新コンテキスト
   * @param {Object} options.sceneControl - シーン制御オブジェクト
   * @returns {void}
   */
  update({
    context,
    sceneControl: { pushScene },
  }) {
    const inputs = context.inputs ?? [];
    const conversationScene = this.#createConversationSceneFromInputs(inputs);
    if (conversationScene) {
      pushScene(conversationScene);
      return;
    }

    this.#handleInputs(inputs);
    this.#updateGameState(context);
  }

  #updateGameState(frame) {
    const elapsedGameHours = this.#updateGameTime(frame);
    this.#patrolEventManager.advanceTo(this.#gameTime.currentHours);
    this.#branchEventManager.advanceTo(this.#gameTime.currentHours);
    const context = {
      ...this.#createUpdateContext(frame),
      elapsedGameHours,
    };

    this.#character.update(context);
    this.#actors.forEach(actor => {
      actor.update(context);
    });
  }

  #updateGameTime(frame) {
    if (this.#gameTime.isEnded) {
      return 0;
    }

    const deltaTimeMs = getFrameDeltaTimeMs(frame);
    const elapsedHours = (deltaTimeMs / 1000) * this.#gameTime.hoursPerRealSecond;
    const beforeHours = this.#gameTime.currentHours;
    this.#gameTime.currentHours = Math.min(
      this.#gameTime.currentHours + elapsedHours,
      this.#gameTime.durationHours,
    );
    this.#gameTime.isEnded = this.#gameTime.currentHours >= this.#gameTime.durationHours;
    return this.#gameTime.currentHours - beforeHours;
  }

  #useCassiopeia() {
    const magicPower = this.#character.magicPower;
    if (magicPower.current < this.#loop.cassiopeiaMagicPowerCost) {
      return false;
    }

    magicPower.current -= this.#loop.cassiopeiaMagicPowerCost;
    this.#gameTime.currentHours = Math.max(
      0,
      this.#gameTime.currentHours - this.#loop.timeTravelHours,
    );
    this.#gameTime.isEnded = false;
    this.#loop.count += 1;
    this.#actors.forEach(actor => {
      actor.resetNextMoveTime(this.#gameTime.currentHours);
    });
    return {
      currentHours: this.#gameTime.currentHours,
    };
  }

  #moveCharacterToLocation(locationId) {
    const location = findLocation(locationId);
    if (!location) {
      return false;
    }

    this.#character.moveToLocation(location.id);
    return true;
  }

  #moveActorToLocation(actorId, locationId) {
    const actor = this.#actors.find(candidate => candidate.id === actorId);
    const location = findLocation(locationId);
    if (!actor || !location) {
      return false;
    }

    actor.moveToLocation(location.id);
    return true;
  }

  #resetActorNextMoveTime(actorId) {
    const actor = this.#actors.find(candidate => candidate.id === actorId);
    if (!actor) {
      return false;
    }

    actor.resetNextMoveTime(this.#gameTime.currentHours);
    return true;
  }

  #setActorMovementMode(actorId, movementMode) {
    const actor = this.#actors.find(candidate => candidate.id === actorId);
    if (!actor) {
      return false;
    }

    return actor.setMovementMode(movementMode);
  }

  #applyStudentConversationSceneResult(actorId, conversationSceneResult) {
    const student = this.#actors.find(actor => (
      actor instanceof Student
      && actor.id === actorId
    ));
    if (!student) {
      return false;
    }

    const baseChange = student.getBaseConversationSceneAffectionChange(
      conversationSceneResult,
    );
    return this.#applyStudentAffectionChange(actorId, baseChange);
  }

  #applyStudentAffectionChange(actorId, baseChange) {
    const student = this.#actors.find(actor => (
      actor instanceof Student
      && actor.id === actorId
    ));
    if (!student) {
      return false;
    }

    const affectionChange = calculateAffectionChange({ baseChange });
    student.changeAffection(affectionChange);
    return true;
  }

  #findTalkableActor(actorId) {
    const actor = this.#actors.find(candidate => (
      candidate.id === actorId
      && candidate.locationId === this.#character.locationId
    ));
    return actor ?? null;
  }

  #createGameStateSnapshot() {
    return {
      gameTime: {
        currentHours: this.#gameTime.currentHours,
        durationHours: this.#gameTime.durationHours,
        isEnded: this.#gameTime.isEnded,
      },
      loop: {
        count: this.#loop.count,
        timeTravelHours: this.#loop.timeTravelHours,
        cassiopeiaMagicPowerCost: this.#loop.cassiopeiaMagicPowerCost,
      },
      character: this.#character.getSnapshot(),
      actors: this.#actors.map(actor => actor.getSnapshot()),
    };
  }

  #createUpdateContext(frame) {
    const deltaTimeMs = getFrameDeltaTimeMs(frame);
    const targetFrameTimeMs = frame.targetFrameTimeMs;
    return {
      deltaTimeMs,
      frameCount: getFrameCount(frame),
      targetFrameTimeMs,
      deltaFrames: deltaTimeMs / targetFrameTimeMs,
      gameTimeHours: this.#gameTime.currentHours,
      isFestivalEnded: this.#gameTime.isEnded,
    };
  }

  #handleInputs(inputs = []) {
    inputs.forEach(input => {
      this.#processInput(input);
    });
  }

  #processInput(input) {
    if (input.type === INPUT_TYPES.TARGET_ACTIVATE) {
      this.#handleTargetActivate(input.targetId);
    }
  }

  #handleTargetActivate(targetId) {
    const locationId = getTargetValue(targetId, TARGET_PREFIXES.LOCATION);
    if (locationId) {
      const didMove = this.#moveCharacterToLocation(locationId);
      const companionActorId = this.#getActiveCompanionActorId();
      if (didMove && companionActorId) {
        this.#moveActorToLocation(companionActorId, locationId);
      }
      if (didMove) {
        this.#patrolEventManager.visitCurrentLocation();
        this.#branchEventManager.visitCurrentLocation();
      }
      return;
    }

    const actorId = getTargetValue(targetId, TARGET_PREFIXES.ACTOR);
    if (actorId !== null) {
      return;
    }

    const branchChoiceId = getTargetValue(targetId, TARGET_PREFIXES.BRANCH_CHOICE);
    if (branchChoiceId !== null) {
      this.#branchEventManager.chooseCurrentTask(branchChoiceId);
      return;
    }

    if (targetId === TARGET_PREFIXES.CASSIOPEIA) {
      const result = this.#useCassiopeia();
      if (result) {
        this.#rewind();
      }
    }
  }

  /**
   * ゲーム状態のスナップショットを作成する。ビューレンダラーがこれを描画。
   * 
   * @public
   * @returns {Object} メインゲームシーンのスナップショット
   */
  createSnapshot() {
    const statusSnapshot = this.#createStatusSnapshot();
    return {
      ...statusSnapshot,
      sceneId: SCENE_IDS.MAIN_GAME,
      activeLayerId: this.#activeLayerId,
      mapLocations: LOCATIONS,
      executingEvents: [
        this.#patrolEventManager.getExecutingEventSnapshot(),
        this.#branchEventManager.getExecutingEventSnapshot(),
        this.#activeConversationEvent?.getSnapshot() ?? null,
      ]
        .filter(Boolean),
    };
  }

  #rewind() {
    this.#releaseActiveCompanion({ resetNextMoveTime: false });
    this.#activeConversationEvent = null;
    this.#patrolEventManager.rewindTo(this.#gameTime.currentHours);
    this.#branchEventManager.rewindTo(this.#gameTime.currentHours);
  }

  #createConversationSceneFromInputs(inputs = []) {
    for (const input of inputs) {
      if (input.type !== INPUT_TYPES.TARGET_ACTIVATE) {
        continue;
      }

      const actorId = getTargetValue(input.targetId, TARGET_PREFIXES.ACTOR);
      if (actorId === null) {
        continue;
      }

      const conversationScene = this.#createConversationScene(actorId);
      if (conversationScene) {
        return conversationScene;
      }
    }

    return null;
  }

  #createConversationScene(actorId) {
    const actor = this.#findTalkableActor(actorId);
    if (!actor) {
      return null;
    }

    if (this.#activeConversationEvent) {
      const currentLocationId = this.#character.locationId;
      const interaction = this.#activeConversationEvent.createActorInteraction(
        actor.id,
        currentLocationId,
      );
      if (interaction) {
        return this.#createEventConversationScene(
          this.#activeConversationEvent,
          interaction,
        );
      }

      if (this.#isActorInteractionBlocked(actor.id, currentLocationId)) {
        return null;
      }

      return this.#createNormalConversationScene(actor);
    }

    return this.#createConversationSceneWithEventCandidates(actor);
  }

  #createConversationSceneWithEventCandidates(actor) {
    const deliveryEvent = this.#createDeliveryEventCandidate(actor);
    const accompanimentEvent = this.#createAccompanimentEventCandidate(actor);
    const eventCandidates = [
      createEventCandidate(
        deliveryEvent,
        DELIVERY_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
      ),
      createEventCandidate(
        accompanimentEvent,
        ACCOMPANIMENT_CONVERSATION_SCENE_SCRIPT_IDS.REQUEST,
      ),
    ].filter(Boolean);
    const script = createConversationSceneScript(actor, {
      additionalScripts: eventCandidates.map(candidate => (
        candidate.interaction.conversationSceneScript
      )),
    });
    if (script.messages.length === 0) {
      return null;
    }

    const selectedCandidate = eventCandidates.find(candidate => (
      candidate.scriptId === script.id
    ));
    if (selectedCandidate) {
      this.#eventIdSequence.next();
      return this.#createEventConversationScene(
        selectedCandidate.event,
        selectedCandidate.interaction,
        {
          activateOnComplete: true,
        },
      );
    }

    return this.#createNormalConversationScene(actor, script);
  }

  #createNormalConversationScene(
    actor,
    script = createConversationSceneScript(actor),
  ) {
    if (script.messages.length === 0) {
      return null;
    }

    return new ConversationScene({
      script,
      statusSnapshot: this.#createStatusSnapshot(),
      onComplete: conversationSceneResult => {
        this.#applyStudentConversationSceneResult(
          actor.id,
          conversationSceneResult,
        );
      },
    });
  }

  #createEventConversationScene(
    event,
    interaction,
    { activateOnComplete = false } = {},
  ) {
    return new ConversationScene({
      script: interaction.conversationSceneScript,
      statusSnapshot: this.#createStatusSnapshot(),
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

  #createDeliveryEventCandidate(sender) {
    const recipients = this.#actors.filter(actor => actor.id !== sender.id);
    if (recipients.length === 0) {
      return null;
    }

    const recipient = recipients[getRandomInt(0, recipients.length - 1)];
    return new DeliveryEvent(this.#eventIdSequence.peek(), {
      sender,
      recipient,
    });
  }

  #createAccompanimentEventCandidate(companion) {
    const destinationLocations = LOCATIONS.filter(location => (
      location.id !== companion.locationId
    ));
    if (destinationLocations.length === 0) {
      return null;
    }

    const destination = destinationLocations[
      getRandomInt(0, destinationLocations.length - 1)
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
      this.#applyStudentAffectionChange(
        event.getCompanionActorId(),
        ACCOMPANIMENT_AFFECTION_REWARD,
      );
      return;
    }

    event.getParticipantActorIds().forEach(actorId => {
      this.#applyStudentAffectionChange(actorId, DELIVERY_AFFECTION_REWARD);
    });
  }

  #getActiveCompanionActorId() {
    return this.#activeConversationEvent instanceof AccompanimentEvent
      ? this.#activeConversationEvent.getCompanionActorId()
      : null;
  }

  #controlActiveCompanionExternally() {
    const companionActorId = this.#getActiveCompanionActorId();
    if (!companionActorId) {
      return;
    }

    this.#setActorMovementMode(
      companionActorId,
      ACTOR_MOVEMENT_MODES.EXTERNAL,
    );
  }

  #releaseActiveCompanion({ resetNextMoveTime = true } = {}) {
    const companionActorId = this.#getActiveCompanionActorId();
    if (!companionActorId) {
      return;
    }

    this.#setActorMovementMode(
      companionActorId,
      ACTOR_MOVEMENT_MODES.AUTOMATIC,
    );
    if (resetNextMoveTime) {
      this.#resetActorNextMoveTime(companionActorId);
    }
  }

  #isActorInteractionBlocked(actorId, currentLocationId) {
    return (
      this.#activeConversationEvent instanceof AccompanimentEvent
      && this.#activeConversationEvent.isActorInteractionBlocked(
        actorId,
        currentLocationId,
      )
    );
  }

  #createStatusSnapshot() {
    const snapshot = this.#createGameStateSnapshot();
    const currentLocationId = snapshot.character.location.id;
    return {
      ...snapshot,
      companion: this.#activeConversationEvent instanceof AccompanimentEvent
        ? this.#activeConversationEvent.getCompanionSnapshot()
        : null,
      actors: snapshot.actors.map(actor => ({
        ...actor,
        isTalkable: (
          actor.location?.id === currentLocationId
          && !this.#isActorInteractionBlocked(actor.id, currentLocationId)
        ),
      })),
    };
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

function getTargetValue(targetId, prefix) {
  const expectedPrefix = `${prefix}:`;
  if (typeof targetId !== 'string' || !targetId.startsWith(expectedPrefix)) {
    return null;
  }

  return targetId.slice(expectedPrefix.length);
}

function getFrameDeltaTimeMs(frame) {
  return typeof frame.deltaTimeMs === 'number' ? frame.deltaTimeMs : frame.deltaTime;
}

function getFrameCount(frame) {
  return typeof frame.frameCount === 'number' ? frame.frameCount : frame.count;
}

export {
  CASSIOPEIA_MAGIC_POWER_COST,
  FESTIVAL_DURATION_HOURS,
  MAGIC_POWER_RECOVERY_PER_GAME_HOUR,
  MAX_MAGIC_POWER,
  TIME_TRAVEL_HOURS,
  TEACHER_IDS,
  MainGameScene,
};
