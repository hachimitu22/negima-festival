import { INPUT_TYPES, MAIN_GAME_LAYER_IDS, SCENE_IDS, TARGET_PREFIXES } from '../actions.js';
import { Character } from './character.js';
import { CharacterSystem } from './characterSystem.js';
import {
  DIALOGUE_REQUEST_ACCEPTANCE,
  DialogueSystem,
} from '../conversationScene/dialogueSystem.js';
import { EventSystem } from './event/eventSystem.js';
import { getDefaultGridMap } from './gridMap.js';
import { LOCATION_IDS, LOCATIONS } from './locations.js';
import { LocationSystem } from './locationSystem.js';
import { PlayerControlSystem } from './playerControlSystem.js';
import { RewardSystem } from './rewardSystem.js';
import { Student } from './student.js';
import { Teacher } from './teacher.js';

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
  #characterSystem;
  #dialogueSystem;
  #playerControlSystem;
  #eventSystem;
  #locationSystem;
  #rewardSystem;
  #gridMap;

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
    this.#gridMap = getDefaultGridMap();
    const character = new Character(LOCATION_IDS.GYM_FRONT_PARKING, {
      magicPower: {
        current: MAX_MAGIC_POWER,
        max: MAX_MAGIC_POWER,
        recoveryPerGameHour: MAGIC_POWER_RECOVERY_PER_GAME_HOUR,
      },
    });
    const actors = [
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
    this.#characterSystem = new CharacterSystem({
      playerCharacter: character,
      actors,
      gridMap: this.#gridMap,
    });
    this.#rewardSystem = new RewardSystem({
      character: this.#characterSystem.getPlayerCharacter(),
      actorsProvider: () => this.#characterSystem.getActors(),
    });
    this.#dialogueSystem = new DialogueSystem();
    this.#eventSystem = new EventSystem({
      character: this.#characterSystem.getPlayerCharacter(),
      durationHours: this.#gameTime.durationHours,
      actorsProvider: () => this.#characterSystem.getActors(),
      conversationRequests: {
        start: ({ script, onComplete }) => {
          const result = this.#dialogueSystem.requestStart({
            script,
            owner: {
              type: 'mainGameScene',
              id: SCENE_IDS.MAIN_GAME,
            },
            onComplete,
          });
          return result.acceptance === DIALOGUE_REQUEST_ACCEPTANCE.ACCEPTED;
        },
      },
      rewardRequests: {
        applyConversationResult: (actorId, conversationSceneResult) => (
          this.#rewardSystem.applyConversationResult(
            actorId,
            conversationSceneResult,
          )
        ),
        applyAffection: (actorId, amount) => (
          this.#rewardSystem.applyAffection(actorId, amount)
        ),
        addMahoPayPoints: points => (
          this.#rewardSystem.addMahoPayPoints(points)
        ),
      },
      companionRequests: {
        setActorMovementMode: (actorId, movementMode) => (
          this.#setActorMovementMode(actorId, movementMode)
        ),
        resetActorNextMoveTime: actorId => (
          this.#resetActorNextMoveTime(actorId)
        ),
      },
    });
    this.#locationSystem = new LocationSystem({
      visitSources: {
        characters: () => (
          this.#characterSystem.consumeVisitedPlayerLocationIds()
        ),
      },
      locationRequests: {
        visitLocations: locationIds => (
          this.#eventSystem.visitLocations(locationIds)
        ),
      },
    });
    this.#playerControlSystem = new PlayerControlSystem({
      characterRequests: {
        movePlayerToMapPosition: position => (
          this.#moveCharacterToMapPosition(position)
        ),
        movePlayerToLocation: locationId => (
          this.#moveCharacterToLocation(locationId)
        ),
      },
      branchRequests: {
        chooseCurrentTask: branchChoiceId => (
          this.#eventSystem.chooseCurrentTask(branchChoiceId)
        ),
      },
      cassiopeiaRequests: {
        requestUseCassiopeia: () => this.#requestUseCassiopeia(),
      },
    });
  }

  /**
   * ゲームエンジンから毎フレーム呼び出される。入力処理、ゲーム時間管理、アクター更新を実行。
   *
   * 会話中は会話入力だけを処理し、ゲーム時間とメインゲーム操作を停止する。
   * 
   * @public
   * @param {Object} options - 更新オプション
   * @param {Object} options.context - 更新コンテキスト
   * @returns {void}
   */
  update({
    context,
  }) {
    const inputs = context.inputs ?? [];
    this.#dialogueSystem.beginFrame();
    const wasConversationActive = this.#dialogueSystem.hasActiveSession();
    this.#dialogueSystem.processInput(inputs);
    if (wasConversationActive) {
      return;
    }

    this.#startConversationFromInputs(inputs);
    if (this.#isGameplaySimulationBlocked()) {
      return;
    }

    this.#playerControlSystem.update(inputs, {
      gameplayInputEnabled: true,
    });
    this.#updateGameState(context);
  }

  #updateGameState(frame) {
    const elapsedGameHours = this.#updateGameTime(frame);
    this.#eventSystem.advanceTo(this.#gameTime.currentHours);
    const context = {
      ...this.#createUpdateContext(frame),
      elapsedGameHours,
    };

    this.#characterSystem.update(context);
    this.#locationSystem.update({
      subjects: this.#characterSystem.getSpatialSubjects(),
      spatialVersions: {
        characters: this.#characterSystem.getSpatialStateVersion(),
      },
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
    const magicPower = this.#characterSystem.getPlayerCharacter().magicPower;
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
    this.#characterSystem.resetAllActorNextMoveTimes(
      this.#gameTime.currentHours,
    );
    return {
      currentHours: this.#gameTime.currentHours,
    };
  }

  #requestUseCassiopeia() {
    const result = this.#useCassiopeia();
    if (!result) {
      return false;
    }

    this.#rewind();
    return true;
  }

  /**
   * 場所IDを目的地として主人公の移動を開始する。
   * @private
   * @param {string} locationId - 目的地の場所ID。
   * @returns {boolean} 移動開始できた場合はtrue。
   */
  #moveCharacterToLocation(locationId) {
    return this.#characterSystem.movePlayerToLocation(locationId, {
      companionActorId: this.#eventSystem.getActiveCompanionActorId(),
    });
  }

  /**
   * マップ座標を目的地として主人公の移動を開始する。
   * @private
   * @param {Object} position - 目的地座標。
   * @returns {boolean} 移動開始できた場合はtrue。
   */
  #moveCharacterToMapPosition(position) {
    return this.#characterSystem.movePlayerToMapPosition(position, {
      companionActorId: this.#eventSystem.getActiveCompanionActorId(),
    });
  }

  #moveActorToLocation(actorId, locationId) {
    return this.#characterSystem.moveActorToLocation(actorId, locationId);
  }

  #resetActorNextMoveTime(actorId) {
    return this.#characterSystem.resetActorNextMoveTime(
      actorId,
      this.#gameTime.currentHours,
    );
  }

  #setActorMovementMode(actorId, movementMode) {
    return this.#characterSystem.setActorMovementMode(actorId, movementMode);
  }

  #findTalkableActor(actorId) {
    return this.#characterSystem.findTalkableActor(actorId);
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
      ...this.#characterSystem.createSnapshotFragment(),
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
      gridMap: this.#gridMap,
      gameTimeHours: this.#gameTime.currentHours,
      isFestivalEnded: this.#gameTime.isEnded,
    };
  }

  /**
   * ゲーム状態のスナップショットを作成する。ビューレンダラーがこれを描画。
   * 
   * @public
   * @returns {Object} メインゲームシーンのスナップショット
   */
  createSnapshot() {
    const statusSnapshot = this.#createStatusSnapshot();
    const eventSnapshot = this.#eventSystem.createSnapshotFragment();
    return {
      ...statusSnapshot,
      sceneId: SCENE_IDS.MAIN_GAME,
      activeLayerId: this.#createActiveLayerId(),
      conversation: this.#createActiveConversationSnapshot(),
      map: this.#gridMap.createSnapshot(),
      mapLocations: LOCATIONS,
      executingEvents: eventSnapshot.executingEvents,
    };
  }

  #createActiveLayerId() {
    return this.#dialogueSystem.hasActiveSession()
      ? MAIN_GAME_LAYER_IDS.CONVERSATION
      : MAIN_GAME_LAYER_IDS.MAP;
  }

  #isGameplaySimulationBlocked() {
    return this.#dialogueSystem.getFrameControlState()
      .gameplaySimulationBlocked;
  }

  #rewind() {
    this.#dialogueSystem.dispose();
    this.#eventSystem.rewindTo(this.#gameTime.currentHours);
  }

  /**
   * Starts an embedded conversation when the current input targets a talkable actor.
   * @private
   * @param {Array<Object>} inputs - Frame input events.
   * @returns {boolean} True when a conversation was started.
   */
  #startConversationFromInputs(inputs = []) {
    for (const input of inputs) {
      if (input.type !== INPUT_TYPES.TARGET_ACTIVATE) {
        continue;
      }

      const actorId = getTargetValue(input.targetId, TARGET_PREFIXES.ACTOR);
      if (actorId === null) {
        continue;
      }

      if (this.#startActorConversation(actorId)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Starts the correct embedded conversation for an actor.
   * @private
   * @param {string} actorId - Talk target actor ID.
   * @returns {boolean} True when a conversation was started.
   */
  #startActorConversation(actorId) {
    const actor = this.#findTalkableActor(actorId);
    if (!actor) {
      return false;
    }

    return this.#eventSystem.requestActorConversation(actor, {
      currentLocationId: this.#characterSystem.getPlayerLocationId(),
    });
  }

  /**
   * Creates a snapshot for the active embedded conversation.
   * @private
   * @returns {Object|null} Active conversation snapshot, or null when inactive.
   */
  #createActiveConversationSnapshot() {
    return this.#dialogueSystem.createSnapshotFragment();
  }

  #createStatusSnapshot() {
    const snapshot = this.#createGameStateSnapshot();
    const eventSnapshot = this.#eventSystem.createSnapshotFragment();
    const currentLocationId = snapshot.character.location.id;
    return {
      ...snapshot,
      companion: eventSnapshot.companion,
      actors: snapshot.actors.map(actor => ({
        ...actor,
        isTalkable: (
          actor.location?.id === currentLocationId
          && !this.#eventSystem.isActorInteractionBlocked(
            actor.id,
            currentLocationId,
          )
        ),
      })),
    };
  }

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
