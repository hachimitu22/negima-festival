import { calculateAffectionChange } from './affection.js';
import { Character } from './character.js';
import { LOCATION_IDS, findLocation } from './locations.js';
import { Student } from './student.js';
import { Teacher } from './teacher.js';

const FESTIVAL_DURATION_HOURS = 72;
const TIME_TRAVEL_HOURS = 24;
const GAME_HOURS_PER_REAL_SECOND = 1;
const MAX_MAGIC_POWER = 100;
const CASSIOPEIA_MAGIC_POWER_COST = 30;
const MAGIC_POWER_RECOVERY_PER_GAME_HOUR = 5;
const TEACHER_IDS = {
  TAKAHATA: 'teacher-takahata',
  SHIZUNA: 'teacher-shizuna',
};

class GameSystem {
  #gameTime;
  #loop;
  #character;
  #actors;

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
  }

  update(frame) {
    const elapsedGameHours = this.#updateGameTime(frame);
    const context = {
      ...this.#createUpdateContext(frame),
      elapsedGameHours,
    };

    this.#character.update(context);
    this.#actors.forEach(actor => {
      actor.update(context);
    });

    return {
      elapsedGameHours,
    };
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

  useCassiopeia() {
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

  moveCharacterToLocation(locationId) {
    const location = findLocation(locationId);
    if (!location) {
      return false;
    }

    this.#character.moveToLocation(location.id);
    return true;
  }

  applyStudentConversationResult(actorId, conversationResult) {
    const student = this.#actors.find(actor => (
      actor instanceof Student
      && actor.id === actorId
    ));
    if (!student) {
      return false;
    }

    const baseChange = student.getBaseAffectionChange(conversationResult);
    return this.applyStudentAffectionChange(actorId, baseChange);
  }

  applyStudentAffectionChange(actorId, baseChange) {
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

  getActors() {
    return [...this.#actors];
  }

  findTalkableActor(actorId) {
    const actor = this.#actors.find(candidate => (
      candidate.id === actorId
      && candidate.locationId === this.#character.locationId
    ));
    return actor ?? null;
  }

  createSnapshot() {
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
  GameSystem,
};
