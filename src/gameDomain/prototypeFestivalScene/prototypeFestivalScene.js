import { FestivalHappeningDirector } from './festivalHappeningDirector.js';
import {
  PROTOTYPE_ACTIVITY_DEFINITIONS,
  PROTOTYPE_ACTIVITY_KINDS,
  PROTOTYPE_GOAL_MOTIVATIONS,
  canStartPrototypeActivity,
  findPrototypeActivity,
  getPrototypeActivityAvailability,
} from './prototypeFestivalActivity.js';
import {
  PROTOTYPE_DISCOVERY_TYPES,
  createPrototypeDiscoveries,
} from './prototypeFestivalDiscovery.js';
import {
  PROTOTYPE_HAPPENING_SITES,
  PROTOTYPE_LANDMARKS,
  PROTOTYPE_MAP_SIZE,
  PROTOTYPE_OBSTACLES,
  createPrototypeViewport,
  getPrototypeMovementSpeed,
  getPrototypeObstaclesInViewport,
  hasPrototypeLineOfSight,
  isPositionInPrototypeViewport,
  movePrototypePosition,
} from './prototypeFestivalMap.js';

/** プロトタイプシーンを識別するID。 */
const PROTOTYPE_SCENE_ID = 'festival-prototype';

/** プロトタイプで受け付ける入力種別。 */
const PROTOTYPE_INPUT_TYPES = Object.freeze({
  PAUSE_TOGGLE: 'prototype.pause.toggle',
  PAUSE_TAB: 'prototype.pause.tab',
  MOVEMENT_SET: 'prototype.movement.set',
  EVENT_INTERACT: 'prototype.event.interact',
  EVENT_ACTION: 'prototype.event.action',
  TASK_INTERACT: 'prototype.task.interact',
  TASK_TRACK: 'prototype.task.track',
  PLAN_SELECT: 'prototype.plan.select',
  PLAN_CLEAR: 'prototype.plan.clear',
  ACTIVITY_START: 'prototype.activity.start',
  ACTIVITY_ADVANCE: 'prototype.activity.advance',
  ACTIVITY_RESUME: 'prototype.activity.resume',
  ACTIVITY_LEAVE: 'prototype.activity.leave',
  INTERRUPTION_CHOOSE: 'prototype.interruption.choose',
  DISCOVERY_INTERACT: 'prototype.discovery.interact',
  HAPPENING_CHOICE: 'prototype.happening.choice',
  REWIND: 'prototype.rewind',
});

/** 屋台トラブル対応で選択できる行動ID。 */
const PROTOTYPE_EVENT_ACTION_IDS = Object.freeze({
  MAGIC_SUPPORT: 'magic-support',
  CALL_FOR_HELP: 'call-for-help',
  CLEAR_CROWD: 'clear-crowd',
  LEAVE: 'leave',
});

/** ポーズ画面で表示できるタブID。 */
const PROTOTYPE_PAUSE_TABS = Object.freeze({
  SCHEDULE: 'schedule',
  TASKS: 'tasks',
});

/** 主目的選択を開く理由。 */
const GOAL_SELECTION_REASONS = Object.freeze({
  INITIAL: 'initial',
  COMPLETED: 'completed',
  MISSED: 'missed',
  CLEARED: 'cleared',
});

/** プロトタイプで使用するエリアID。 */
const PROTOTYPE_AREA_IDS = Object.freeze({
  FOOD_STREET: 'food-street',
  DAVID_PLAZA: 'david-plaza',
  GYM_FRONT: 'gym-front',
  WORLD_TREE_FRONT: 'world-tree-front',
});

/** プロトタイプの場所を分割する座標。 */
const PROTOTYPE_AREA_SPLIT = PROTOTYPE_MAP_SIZE / 2;

/** ネギの実時間1秒あたりの移動マス数。 */
const PLAYER_MOVEMENT_SPEED_CELLS_PER_SECOND = 4;

/** イベントを選択可能にする距離。 */
const EVENT_INTERACTION_RADIUS = 2;

/** 発見地点で回復するMP。 */
const DISCOVERY_MAGIC_POWER_REWARD = 10;

/** 発見地点で獲得するMahoPay。 */
const DISCOVERY_MAHOPAY_REWARD = 50;

/** rendererへ公開するカモ君通知の優先度。 */
const KAMO_NOTICE_PRIORITIES = Object.freeze({
  TASK: 1,
  RUMOR: 2,
  NEARBY: 3,
  URGENT: 4,
});

/** 巻き込み終了後に次の巻き込みを抑止するゲーム内分数。 */
const INTERRUPTION_COOLDOWN_MINUTES = 3;

/** 中程度の巻き込みを判定する距離。 */
const INTERRUPTION_RADIUS = 2;

/** 重大な人流巻き込みを判定する距離。 */
const MAJOR_INTERRUPTION_RADIUS = 2.5;

/** 巻き込みの強度。 */
const INTERRUPTION_SEVERITIES = Object.freeze({
  MEDIUM: 'medium',
  MAJOR: 'major',
});

/** 重大な足場崩落が起こる時間と場所。 */
const SCAFFOLD_INCIDENT = Object.freeze({
  id: 'scaffold-collapse',
  title: '足場崩落',
  startMinutes: 30,
  endMinutes: 50,
  position: Object.freeze({ x: 20, y: 12 }),
});

/** ネギの初期座標。 */
const INITIAL_PLAYER_POSITION = Object.freeze({ x: 24, y: 8 });

/** プロトタイプに登場する4場所の矩形領域。 */
const PROTOTYPE_AREAS = Object.freeze([
  Object.freeze({
    id: PROTOTYPE_AREA_IDS.FOOD_STREET,
    name: '屋台通り',
    area: Object.freeze({ x: 0, y: 0, width: 16, height: 16 }),
  }),
  Object.freeze({
    id: PROTOTYPE_AREA_IDS.DAVID_PLAZA,
    name: 'デイビット広場',
    area: Object.freeze({ x: 16, y: 0, width: 16, height: 16 }),
  }),
  Object.freeze({
    id: PROTOTYPE_AREA_IDS.GYM_FRONT,
    name: '体育館前',
    area: Object.freeze({ x: 0, y: 16, width: 16, height: 16 }),
  }),
  Object.freeze({
    id: PROTOTYPE_AREA_IDS.WORLD_TREE_FRONT,
    name: '世界樹前',
    area: Object.freeze({ x: 16, y: 16, width: 16, height: 16 }),
  }),
]);

/** 固定イベントと目的人物のマップ座標。 */
const EVENT_POSITIONS = Object.freeze({
  OPENING_STAGE: Object.freeze({ x: 24, y: 5 }),
  WORLD_TREE_STAGE: Object.freeze({ x: 24, y: 29 }),
  LOST_CHILD: Object.freeze({ x: 6, y: 6 }),
  LOST_CHILD_PARENT: Object.freeze({ x: 22, y: 8 }),
  STALL_TROUBLE: Object.freeze({ x: 10, y: 8 }),
  SPREAD_STALL_TROUBLE: Object.freeze({ x: 20, y: 12 }),
  SECRET_EXHIBIT: Object.freeze({ x: 11, y: 20 }),
});

/** ランダム突発イベントの場所別発生座標。 */
const COSPLAY_POSITIONS = Object.freeze({
  [PROTOTYPE_AREA_IDS.DAVID_PLAZA]: Object.freeze({ x: 28, y: 12 }),
  [PROTOTYPE_AREA_IDS.GYM_FRONT]: Object.freeze({ x: 10, y: 24 }),
});

/** プロトタイプで使用するイベントID。 */
const PROTOTYPE_EVENT_IDS = Object.freeze({
  OPENING_STAGE: 'opening-stage',
  WORLD_TREE_STAGE: 'world-tree-stage',
  LOST_CHILD: 'lost-child',
  COSPLAY_PARADE: 'cosplay-parade',
  STALL_TROUBLE: 'stall-trouble',
  SECRET_EXHIBIT: 'secret-exhibit',
});

/** イベントの共通状態。 */
const EVENT_STATUSES = Object.freeze({
  WAITING: 'waiting',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  MISSED: 'missed',
});

/** プロトタイプで扱う教師仕事ID。 */
const PROTOTYPE_TASK_IDS = Object.freeze({
  PATROL: 'teacher-patrol',
  DELIVERY: 'supply-delivery',
  WORLD_TREE_CHECK: 'world-tree-check',
});

/** 教師仕事の進行状態。 */
const TASK_STATUSES = Object.freeze({
  ACTIVE: 'active',
  COMPLETED: 'completed',
});

/** 教師仕事一式の共通期限を支給からの分数で表した値。 */
const TEACHER_TASK_SOFT_DEADLINE_MINUTES = 40;

/** 教師仕事一式を完了してから次回支給までの分数。 */
const TEACHER_TASK_REFRESH_DELAY_MINUTES = 5;

/** 教師仕事の基本報酬。 */
const TEACHER_TASK_REWARDS = Object.freeze({
  [PROTOTYPE_TASK_IDS.PATROL]: 300,
  [PROTOTYPE_TASK_IDS.DELIVERY]: 200,
  [PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK]: 200,
});

/** 教師仕事を巡回させる3種類の固定配置。 */
const TEACHER_TASK_PATTERNS = Object.freeze([
  Object.freeze({
    patrol: Object.freeze([
      Object.freeze({ id: 'patrol-food-1', label: '屋台通り南口', position: Object.freeze({ x: 6, y: 12 }) }),
      Object.freeze({ id: 'patrol-gym-1', label: '体育館正面', position: Object.freeze({ x: 6, y: 24 }) }),
      Object.freeze({ id: 'patrol-tree-1', label: '世界樹前広場', position: Object.freeze({ x: 20, y: 24 }) }),
    ]),
    delivery: Object.freeze({
      pickup: Object.freeze({ id: 'delivery-pickup-1', label: '本部で物資を受け取る', position: Object.freeze({ x: 22, y: 5 }) }),
      destination: Object.freeze({ id: 'delivery-destination-1', label: '屋台通りへ物資を届ける', position: Object.freeze({ x: 12, y: 8 }) }),
    }),
    worldTreeChecks: Object.freeze([
      Object.freeze({ id: 'world-tree-1', label: '魔力スポット北西', position: Object.freeze({ x: 22, y: 20 }) }),
      Object.freeze({ id: 'world-tree-2', label: '魔力スポット北東', position: Object.freeze({ x: 28, y: 18 }) }),
    ]),
  }),
  Object.freeze({
    patrol: Object.freeze([
      Object.freeze({ id: 'patrol-plaza-2', label: 'デイビット広場東口', position: Object.freeze({ x: 28, y: 12 }) }),
      Object.freeze({ id: 'patrol-food-2', label: '屋台通り北口', position: Object.freeze({ x: 5, y: 5 }) }),
      Object.freeze({ id: 'patrol-gym-2', label: '体育館南口', position: Object.freeze({ x: 12, y: 28 }) }),
    ]),
    delivery: Object.freeze({
      pickup: Object.freeze({ id: 'delivery-pickup-2', label: '体育館で備品を受け取る', position: Object.freeze({ x: 11, y: 20 }) }),
      destination: Object.freeze({ id: 'delivery-destination-2', label: '世界樹前へ備品を届ける', position: Object.freeze({ x: 24, y: 28 }) }),
    }),
    worldTreeChecks: Object.freeze([
      Object.freeze({ id: 'world-tree-3', label: '魔力スポット東', position: Object.freeze({ x: 29, y: 23 }) }),
      Object.freeze({ id: 'world-tree-4', label: '魔力スポット南西', position: Object.freeze({ x: 21, y: 28 }) }),
    ]),
  }),
  Object.freeze({
    patrol: Object.freeze([
      Object.freeze({ id: 'patrol-tree-3', label: '世界樹前西口', position: Object.freeze({ x: 20, y: 22 }) }),
      Object.freeze({ id: 'patrol-plaza-3', label: 'デイビット広場北口', position: Object.freeze({ x: 18, y: 4 }) }),
      Object.freeze({ id: 'patrol-food-3', label: '屋台通り東口', position: Object.freeze({ x: 10, y: 14 }) }),
    ]),
    delivery: Object.freeze({
      pickup: Object.freeze({ id: 'delivery-pickup-3', label: '屋台通りで荷物を受け取る', position: Object.freeze({ x: 4, y: 8 }) }),
      destination: Object.freeze({ id: 'delivery-destination-3', label: '体育館へ荷物を届ける', position: Object.freeze({ x: 14, y: 20 }) }),
    }),
    worldTreeChecks: Object.freeze([
      Object.freeze({ id: 'world-tree-5', label: '魔力スポット南', position: Object.freeze({ x: 26, y: 29 }) }),
      Object.freeze({ id: 'world-tree-6', label: '魔力スポット南東', position: Object.freeze({ x: 30, y: 27 }) }),
    ]),
  }),
]);

/** 屋台トラブルの成長段階。 */
const STALL_TROUBLE_PHASES = Object.freeze({
  SMALL: 'small',
  GROWN: 'grown',
  SPREAD: 'spread',
  MERGED: 'merged',
  RESOLVED: 'resolved',
});

/** 実時間1秒あたりに進むゲーム内分数。 */
const GAME_MINUTES_PER_REAL_SECOND = 0.5;

/** プロトタイプの終了時刻を開始からの分数で表した値。 */
const FESTIVAL_DURATION_MINUTES = 120;

/** 主人公の最大MPと開始MP。 */
const MAX_MAGIC_POWER = 100;

/** カシオペアがゲーム内1時間の遡行に消費するMP。 */
const CASSIOPEIA_MP_PER_GAME_HOUR = 10;

/** 魔法で屋台を支える行動が消費するMP。 */
const STALL_MAGIC_POWER_COST = 15;

/** 魔法で屋台を支える行動が消費するゲーム内分数。 */
const STALL_MAGIC_TIME_COST = 2;

/** 周囲へ協力を頼む行動が消費するゲーム内分数。 */
const STALL_HELP_TIME_COST = 5;

/** 人混みを整理する行動が消費するゲーム内分数。 */
const STALL_CROWD_TIME_COST = 3;

/** ランダム突発イベントの開始候補時刻。 */
const COSPLAY_START_CANDIDATES = Object.freeze([25, 35, 50]);

/** ランダム突発イベントの発生候補エリア。 */
const COSPLAY_AREA_CANDIDATES = Object.freeze([
  PROTOTYPE_AREA_IDS.DAVID_PLAZA,
  PROTOTYPE_AREA_IDS.GYM_FRONT,
]);

/** ランダム突発イベントの継続分数。 */
const COSPLAY_DURATION_MINUTES = 20;

/** 判明済みとして開始するイベントID。 */
const INITIAL_KNOWN_EVENT_IDS = Object.freeze([
  PROTOTYPE_EVENT_IDS.OPENING_STAGE,
  PROTOTYPE_EVENT_IDS.WORLD_TREE_STAGE,
]);

/**
 * 指定IDのエリア定義を返す。
 * @param {string} areaId - 検索するエリアID。
 * @returns {Object|null} エリア定義。存在しない場合はnull。
 */
function findArea(areaId) {
  for (const area of PROTOTYPE_AREAS) {
    if (area.id === areaId) {
      return area;
    }
  }
  return null;
}

/**
 * マップ座標が属する4象限の場所を返す。
 * @param {Object} position - マップ上の連続座標。
 * @returns {Object} 座標が属する場所。
 */
function findAreaByPosition(position) {
  const isRight = position.x >= PROTOTYPE_AREA_SPLIT;
  const isBottom = position.y >= PROTOTYPE_AREA_SPLIT;
  if (isRight && isBottom) {
    return findArea(PROTOTYPE_AREA_IDS.WORLD_TREE_FRONT);
  }
  if (isRight) {
    return findArea(PROTOTYPE_AREA_IDS.DAVID_PLAZA);
  }
  if (isBottom) {
    return findArea(PROTOTYPE_AREA_IDS.GYM_FRONT);
  }
  return findArea(PROTOTYPE_AREA_IDS.FOOD_STREET);
}

/**
 * 数値を指定範囲へ制限する。
 * @param {number} value - 制限する値。
 * @param {number} minimum - 最小値。
 * @param {number} maximum - 最大値。
 * @returns {number} 範囲内へ制限した値。
 */
function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

/**
 * 2つの座標間の距離を返す。
 * @param {Object} left - 一方の座標。
 * @param {Object} right - もう一方の座標。
 * @returns {number} ユークリッド距離。
 */
function getDistance(left, right) {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

/**
 * 座標を外部変更できない新しいオブジェクトとして複製する。
 * @param {Object} position - 複製元座標。
 * @returns {Object} 複製した座標。
 */
function copyPosition(position) {
  return { x: position.x, y: position.y };
}

/**
 * 0以上1未満の値から配列要素を選ぶ。
 * @param {Array<*>} values - 選択候補。
 * @param {number} randomValue - 0以上1未満の値。
 * @returns {*} 選択された値。
 */
function pickRandomValue(values, randomValue) {
  const normalizedValue = Math.max(0, Math.min(0.999999, randomValue));
  return values[Math.floor(normalizedValue * values.length)];
}

/**
 * 開始からの分数を時刻表示へ変換する。
 * @param {number} elapsedMinutes - AM10:00からの経過分数。
 * @returns {string} AM表記の時刻。
 */
function formatGameTime(elapsedMinutes) {
  const totalMinutes = 10 * 60 + Math.floor(elapsedMinutes);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `AM${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * スケジュール項目を開始時刻順に比較する。
 * @param {Object} left - 左側の項目。
 * @param {Object} right - 右側の項目。
 * @returns {number} 比較結果。
 */
function compareScheduleEntries(left, right) {
  return left.startMinutes - right.startMinutes;
}

/**
 * プロトタイプ用のイベント状態を生成する。
 * @param {Function} random - 0以上1未満を返す乱数関数。
 * @returns {Object} 新しいループのイベント状態。
 */
function createLoopEvents(random) {
  const cosplayStartMinutes = pickRandomValue(
    COSPLAY_START_CANDIDATES,
    random(),
  );
  const cosplayAreaId = pickRandomValue(COSPLAY_AREA_CANDIDATES, random());
  return {
    [PROTOTYPE_EVENT_IDS.OPENING_STAGE]: {
      status: EVENT_STATUSES.WAITING,
      startMinutes: 20,
      endMinutes: 35,
      areaId: PROTOTYPE_AREA_IDS.DAVID_PLAZA,
      position: copyPosition(EVENT_POSITIONS.OPENING_STAGE),
    },
    [PROTOTYPE_EVENT_IDS.WORLD_TREE_STAGE]: {
      status: EVENT_STATUSES.WAITING,
      startMinutes: 30,
      endMinutes: 50,
      areaId: PROTOTYPE_AREA_IDS.WORLD_TREE_FRONT,
      position: copyPosition(EVENT_POSITIONS.WORLD_TREE_STAGE),
    },
    [PROTOTYPE_EVENT_IDS.LOST_CHILD]: {
      status: EVENT_STATUSES.WAITING,
      startMinutes: 15,
      endMinutes: 45,
      areaId: PROTOTYPE_AREA_IDS.FOOD_STREET,
      position: copyPosition(EVENT_POSITIONS.LOST_CHILD),
      parentAreaId: PROTOTYPE_AREA_IDS.DAVID_PLAZA,
      parentPosition: copyPosition(EVENT_POSITIONS.LOST_CHILD_PARENT),
      step: 'find-child',
    },
    [PROTOTYPE_EVENT_IDS.COSPLAY_PARADE]: {
      status: EVENT_STATUSES.WAITING,
      startMinutes: cosplayStartMinutes,
      endMinutes: cosplayStartMinutes + COSPLAY_DURATION_MINUTES,
      areaId: cosplayAreaId,
      position: copyPosition(COSPLAY_POSITIONS[cosplayAreaId]),
    },
    [PROTOTYPE_EVENT_IDS.STALL_TROUBLE]: {
      status: EVENT_STATUSES.WAITING,
      startMinutes: 10,
      endMinutes: FESTIVAL_DURATION_MINUTES,
      areaId: PROTOTYPE_AREA_IDS.FOOD_STREET,
      position: copyPosition(EVENT_POSITIONS.STALL_TROUBLE),
      phase: STALL_TROUBLE_PHASES.SMALL,
      responseProgress: 0,
    },
    [PROTOTYPE_EVENT_IDS.SECRET_EXHIBIT]: {
      status: EVENT_STATUSES.WAITING,
      startMinutes: 45,
      endMinutes: 60,
      areaId: PROTOTYPE_AREA_IDS.GYM_FRONT,
      position: copyPosition(EVENT_POSITIONS.SECRET_EXHIBIT),
    },
  };
}

/**
 * 固定配置から新しい教師仕事一式を生成する。
 * @param {number} patternIndex - 使用する固定配置の添字。
 * @param {number} batchNumber - 表示用の仕事一式番号。
 * @param {number} startMinutes - 支給時刻の経過分数。
 * @returns {Object} 進行状態を持つ教師仕事一式。
 */
function createTeacherTaskBatch(patternIndex, batchNumber, startMinutes) {
  const pattern = TEACHER_TASK_PATTERNS[patternIndex];
  return {
    patternIndex,
    batchNumber,
    startMinutes,
    deadlineMinutes: startMinutes + TEACHER_TASK_SOFT_DEADLINE_MINUTES,
    tasks: {
      [PROTOTYPE_TASK_IDS.PATROL]: {
        id: PROTOTYPE_TASK_IDS.PATROL,
        status: TASK_STATUSES.ACTIVE,
        rewardPoints: 0,
        checkpoints: pattern.patrol.map((point) => ({
          ...point,
          position: copyPosition(point.position),
          isCompleted: false,
        })),
      },
      [PROTOTYPE_TASK_IDS.DELIVERY]: {
        id: PROTOTYPE_TASK_IDS.DELIVERY,
        status: TASK_STATUSES.ACTIVE,
        rewardPoints: 0,
        step: 'pickup',
        pickup: { ...pattern.delivery.pickup, position: copyPosition(pattern.delivery.pickup.position) },
        destination: { ...pattern.delivery.destination, position: copyPosition(pattern.delivery.destination.position) },
      },
      [PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK]: {
        id: PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK,
        status: TASK_STATUSES.ACTIVE,
        rewardPoints: 0,
        spots: pattern.worldTreeChecks.map((point) => ({
          ...point,
          position: copyPosition(point.position),
          isCompleted: false,
        })),
      },
    },
  };
}

/**
 * 麻帆良祭の予定行動、巻き込み、時間巻き戻しを検証する専用シーン。
 */
class PrototypeFestivalScene {
  #random;
  #elapsedMinutes;
  #loopCount;
  #magicPower;
  #mahoPayPoints;
  #currentAreaId;
  #playerPosition;
  #movementInput;
  #isPaused;
  #pauseTabId;
  #events;
  #knownEventIds;
  #achievements;
  #log;
  #activeEventSession;
  #taskBatch;
  #nextTaskBatchStartMinutes;
  #nextTaskPatternIndex;
  #nextTaskBatchNumber;
  #happeningDirector;
  #pendingMovementDistance;
  #discoveries;
  #revealedHappeningIds;
  #trackedTaskId;
  #isTaskTrackingManual;
  #kamoNotice;
  #kamoNoticeSequence;
  #emittedKamoNoticeKeys;
  #plannedActionId;
  #activitySession;
  #interruption;
  #interruptionCooldownUntil;
  #handledInterruptionIds;
  #isScaffoldIncidentHandled;
  #enableInterruptions;
  #enableGoalSelection;
  #goalSelectionReason;

  /**
   * シーンを生成する。
   * @param {Object} [options] - 生成オプション。
   * @param {Function} [options.random] - 0以上1未満を返す乱数関数。
   * @param {boolean} [options.enableInterruptions] - 巻き込み判定を有効にするか。
   * @param {boolean} [options.enableGoalSelection] - 主目的選択を有効にするか。
   */
  constructor({ random = Math.random, enableInterruptions = true, enableGoalSelection = true } = {}) {
    this.#random = random;
    this.#elapsedMinutes = 0;
    this.#loopCount = 1;
    this.#magicPower = MAX_MAGIC_POWER;
    this.#mahoPayPoints = 0;
    this.#currentAreaId = PROTOTYPE_AREA_IDS.DAVID_PLAZA;
    this.#playerPosition = copyPosition(INITIAL_PLAYER_POSITION);
    this.#movementInput = { x: 0, y: 0 };
    this.#isPaused = false;
    this.#pauseTabId = PROTOTYPE_PAUSE_TABS.SCHEDULE;
    this.#events = createLoopEvents(this.#random);
    this.#knownEventIds = new Set(INITIAL_KNOWN_EVENT_IDS);
    this.#achievements = new Set();
    this.#log = ['麻帆良祭1日目が始まった。'];
    this.#activeEventSession = null;
    this.#taskBatch = createTeacherTaskBatch(0, 1, 0);
    this.#nextTaskBatchStartMinutes = null;
    this.#nextTaskPatternIndex = 1;
    this.#nextTaskBatchNumber = 2;
    this.#happeningDirector = new FestivalHappeningDirector({
      random: this.#random,
      areas: PROTOTYPE_AREAS,
      sites: PROTOTYPE_HAPPENING_SITES,
    });
    this.#pendingMovementDistance = 0;
    this.#discoveries = createPrototypeDiscoveries(this.#loopCount);
    this.#revealedHappeningIds = new Set();
    this.#trackedTaskId = null;
    this.#isTaskTrackingManual = false;
    this.#kamoNotice = null;
    this.#kamoNoticeSequence = 0;
    this.#emittedKamoNoticeKeys = new Set();
    this.#plannedActionId = null;
    this.#activitySession = null;
    this.#interruption = null;
    this.#interruptionCooldownUntil = 0;
    this.#handledInterruptionIds = new Set();
    this.#isScaffoldIncidentHandled = false;
    this.#enableInterruptions = enableInterruptions;
    this.#enableGoalSelection = enableGoalSelection;
    this.#goalSelectionReason = enableGoalSelection ? GOAL_SELECTION_REASONS.INITIAL : null;
    this.#updateEventStates();
    this.#syncHappeningDirector(0);
    this.#ensureTrackedTask();
    if (!this.#enableGoalSelection) {
      this.#plannedActionId = this.#trackedTaskId ? `task:${this.#trackedTaskId}` : null;
      this.#notifyTrackedTask('まずは');
    }
  }

  /**
   * 入力とフレーム時間からゲーム状態を更新する。
   * @param {Object} options - 更新引数。
   * @param {Object} options.context - GameEngineの更新context。
   * @returns {void}
   */
  update({ context }) {
    const inputs = context.inputs ?? [];
    for (const input of inputs) {
      this.#processInput(input);
    }

    if (
      this.#isPaused
      || this.#goalSelectionReason
      || this.#elapsedMinutes >= FESTIVAL_DURATION_MINUTES
      || this.#interruption
      || this.#activitySession
    ) {
      return;
    }

    if (!this.#activeEventSession) {
      this.#advancePlayerMovement(context.deltaTimeMs ?? 0);
    }
    const elapsedGameMinutes = (
      (context.deltaTimeMs ?? 0) / 1000 * GAME_MINUTES_PER_REAL_SECOND
    );
    this.#advanceTime(elapsedGameMinutes);
    this.#ensureTrackedTask({ notify: true });
    this.#detectInterruption();
    this.#refreshKamoNotice();
  }

  /**
   * renderer向けの読み取り専用snapshotを生成する。
   * @returns {Object} 現在のプロトタイプ状態。
   */
  createSnapshot() {
    const area = findArea(this.#currentAreaId);
    const happeningSnapshot = this.#happeningDirector.createSnapshot({
      playerPosition: this.#playerPosition,
    });
    const mapSnapshot = this.#createMapSnapshot(happeningSnapshot);
    const visibleEventIds = new Set(mapSnapshot.local.events.map((entry) => entry.id));
    const visibleFeed = happeningSnapshot.eventFeed.filter((message) => (
      message === '近くで急に歓声が上がった。'
      || mapSnapshot.local.happenings.some((happening) => (
        message.includes(happening.title) || message.includes(happening.areaName)
      ))
    ));
    return {
      sceneId: PROTOTYPE_SCENE_ID,
      isPaused: this.#isPaused,
      pauseTabId: this.#pauseTabId,
      gameTime: {
        elapsedMinutes: this.#elapsedMinutes,
        label: formatGameTime(this.#elapsedMinutes),
        isEnded: this.#elapsedMinutes >= FESTIVAL_DURATION_MINUTES,
      },
      loop: { count: this.#loopCount },
      player: {
        areaId: area.id,
        areaName: area.name,
        position: copyPosition(this.#playerPosition),
        magicPower: { current: this.#magicPower, max: MAX_MAGIC_POWER },
        mahoPayPoints: this.#mahoPayPoints,
      },
      companion: this.#createCompanionSnapshot(),
      map: mapSnapshot,
      areas: this.#createAreaSnapshots(),
      currentEvents: this.#createCurrentEventSnapshots(),
      quickEvents: this.#createQuickEventSnapshots().filter((entry) => visibleEventIds.has(entry.id)),
      schedule: this.#createScheduleSnapshots(),
      tasks: this.#createTaskSnapshots(),
      taskBatch: this.#createTaskBatchSnapshot(),
      taskNavigation: this.#createTaskNavigationSnapshot(),
      goalSelection: this.#createGoalSelectionSnapshot(),
      plannedAction: this.#createPlannedActionSnapshot(),
      availableActivities: this.#createAvailableActivitySnapshots(),
      nearbyActivities: this.#createNearbyActivitySnapshots(),
      activitySession: this.#createActivitySessionSnapshot(),
      interruption: this.#createInterruptionSnapshot(),
      environmentalCue: this.#createEnvironmentalCueSnapshot(happeningSnapshot),
      nearbyTasks: this.#createNearbyTaskSnapshots(),
      nearbyDiscoveries: this.#createNearbyDiscoverySnapshots(),
      happenings: mapSnapshot.local.happenings,
      nearbyHappenings: [],
      areaStates: mapSnapshot.local.areaStates,
      crowdPoints: mapSnapshot.local.crowdPoints,
      flows: mapSnapshot.local.flows,
      eventFeed: visibleFeed,
      areaLeads: [],
      eventInteraction: this.#createEventInteractionSnapshot(),
      kamoAdvice: this.#createKamoAdvice(),
      kamoNotice: this.#kamoNotice ? { ...this.#kamoNotice } : null,
      log: [...this.#log],
      rewindCost: this.#calculateRewindCost(),
      canRewind: this.#elapsedMinutes > 0 && this.#magicPower >= this.#calculateRewindCost(),
      achievements: [...this.#achievements],
      randomEvent: {
        startMinutes: this.#events[PROTOTYPE_EVENT_IDS.COSPLAY_PARADE].startMinutes,
        areaId: this.#events[PROTOTYPE_EVENT_IDS.COSPLAY_PARADE].areaId,
      },
    };
  }

  /**
   * 1件の入力を状態変更へ変換する。
   * @private
   * @param {Object} input - 入力イベント。
   * @returns {void}
   */
  #processInput(input) {
    if (input.type === PROTOTYPE_INPUT_TYPES.PLAN_SELECT) {
      this.#selectPlannedAction(input.actionId);
      return;
    }
    if (this.#goalSelectionReason) {
      return;
    }

    if (input.type === PROTOTYPE_INPUT_TYPES.MOVEMENT_SET) {
      this.#setMovementInput(input);
      return;
    }

    if (input.type === PROTOTYPE_INPUT_TYPES.PAUSE_TOGGLE) {
      this.#isPaused = !this.#isPaused;
      if (this.#isPaused) {
        this.#pauseTabId = PROTOTYPE_PAUSE_TABS.SCHEDULE;
      }
      return;
    }

    if (input.type === PROTOTYPE_INPUT_TYPES.PAUSE_TAB && this.#isPaused) {
      if (Object.values(PROTOTYPE_PAUSE_TABS).includes(input.tabId)) {
        this.#pauseTabId = input.tabId;
      }
      return;
    }

    if (input.type === PROTOTYPE_INPUT_TYPES.REWIND) {
      this.#rewind();
      return;
    }

    if (input.type === PROTOTYPE_INPUT_TYPES.PLAN_CLEAR) {
      this.#plannedActionId = null;
      this.#goalSelectionReason = this.#enableGoalSelection
        ? GOAL_SELECTION_REASONS.CLEARED
        : null;
      return;
    }

    if (this.#isPaused || this.#elapsedMinutes >= FESTIVAL_DURATION_MINUTES) {
      return;
    }

    if (input.type === PROTOTYPE_INPUT_TYPES.INTERRUPTION_CHOOSE) {
      this.#chooseInterruption(input.choiceId);
      return;
    }
    if (this.#interruption) {
      return;
    }
    if (input.type === PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE) {
      this.#advanceActivitySession();
      return;
    }
    if (input.type === PROTOTYPE_INPUT_TYPES.ACTIVITY_RESUME) {
      this.#resumeActivitySession();
      return;
    }
    if (input.type === PROTOTYPE_INPUT_TYPES.ACTIVITY_LEAVE) {
      this.#leaveActivitySession();
      return;
    }
    if (this.#activitySession) {
      return;
    }
    if (input.type === PROTOTYPE_INPUT_TYPES.ACTIVITY_START) {
      this.#startActivity(input.activityId);
      return;
    }

    if (input.type === PROTOTYPE_INPUT_TYPES.EVENT_ACTION) {
      this.#performEventAction(input.actionId);
    } else if (this.#activeEventSession) {
      return;
    } else if (input.type === PROTOTYPE_INPUT_TYPES.TASK_TRACK) {
      this.#trackTask(input.taskId);
    } else if (input.type === PROTOTYPE_INPUT_TYPES.DISCOVERY_INTERACT) {
      this.#interactWithDiscovery(input.discoveryId);
    } else if (input.type === PROTOTYPE_INPUT_TYPES.HAPPENING_CHOICE) {
      this.#chooseHappening(input.happeningId, input.choiceId);
    } else if (input.type === PROTOTYPE_INPUT_TYPES.TASK_INTERACT) {
      this.#interactWithTask(input.taskId, input.stepId);
    } else if (input.type === PROTOTYPE_INPUT_TYPES.EVENT_INTERACT) {
      this.#interactWithEvent(input.eventId);
    }
  }

  /**
   * ゲーム内時間を進めてイベント状態を更新する。
   * @private
   * @param {number} minutes - 経過させるゲーム内分数。
   * @returns {void}
   */
  #advanceTime(minutes) {
    if (minutes <= 0) {
      return;
    }
    this.#elapsedMinutes = Math.min(
      FESTIVAL_DURATION_MINUTES,
      this.#elapsedMinutes + minutes,
    );
    this.#updateEventStates();
    this.#issueNextTaskBatchWhenReady();
    this.#syncHappeningDirector(minutes);
  }

  /**
   * WASDから受け取った移動方向を保持する。
   * @private
   * @param {Object} input - 移動方向入力。
   * @returns {void}
   */
  #setMovementInput(input) {
    this.#movementInput = {
      x: clamp(Number(input.x) || 0, -1, 1),
      y: clamp(Number(input.y) || 0, -1, 1),
    };
  }

  /**
   * 実時間差と入力方向からネギの連続座標を進める。
   * @private
   * @param {number} deltaTimeMs - 前フレームからの実時間ミリ秒。
   * @returns {void}
   */
  #advancePlayerMovement(deltaTimeMs) {
    const length = Math.hypot(this.#movementInput.x, this.#movementInput.y);
    if (length === 0 || deltaTimeMs <= 0) {
      return;
    }
    const previousPosition = copyPosition(this.#playerPosition);
    const movementSpeed = this.#getCurrentMovementSpeed();
    const distance = movementSpeed * deltaTimeMs / 1000;
    this.#playerPosition = movePrototypePosition(this.#playerPosition, {
      x: this.#movementInput.x / length * distance,
      y: this.#movementInput.y / length * distance,
    });
    this.#pendingMovementDistance += getDistance(previousPosition, this.#playerPosition);
    const area = findAreaByPosition(this.#playerPosition);
    if (area.id !== this.#currentAreaId) {
      this.#currentAreaId = area.id;
      this.#addLog(`${area.name}へ入った。`);
    }
    this.#moveLostChildCompanion(this.#currentAreaId, this.#playerPosition);
    this.#updatePatrolProgress();
  }

  /**
   * 現在地の連鎖型ハプニングへ介入する。
   * @private
   * @param {string} happeningId - ハプニングID。
   * @param {string} choiceId - 選択肢ID。
   * @returns {boolean} 選択を受理した場合はtrue。
   */
  #chooseHappening(happeningId, choiceId) {
    const result = this.#happeningDirector.choose({
      happeningId,
      choiceId,
      playerPosition: this.#playerPosition,
      magicPower: this.#magicPower,
    });
    if (!result.accepted) {
      return false;
    }
    this.#magicPower -= result.magicPowerCost;
    for (const message of result.logEntries) {
      this.#addLog(message);
    }
    this.#advanceTime(result.timeCostMinutes);
    return true;
  }

  /**
   * directorへ現在時刻と固定イベント状態を同期する。
   * @private
   * @param {number} deltaMinutes - 前回同期からの経過分数。
   * @returns {void}
   */
  #syncHappeningDirector(deltaMinutes) {
    this.#happeningDirector.update({
      elapsedMinutes: this.#elapsedMinutes,
      deltaMinutes,
      fixedEvents: Object.values(PROTOTYPE_EVENT_IDS).map((eventId) => ({
        id: eventId,
        status: this.#events[eventId].status,
        areaId: this.#events[eventId].areaId,
        phase: this.#events[eventId].phase ?? null,
      })),
      playerPosition: this.#playerPosition,
      playerDistanceTraveled: this.#pendingMovementDistance,
      hasLineOfSight: (from, to) => (
        isPositionInPrototypeViewport(to, createPrototypeViewport(from))
        && hasPrototypeLineOfSight(from, to)
      ),
    });
    this.#pendingMovementDistance = 0;
  }

  /** 現在地の混雑を反映した移動速度を返す。 */
  #getCurrentMovementSpeed() {
    const snapshot = this.#happeningDirector.createSnapshot({
      playerPosition: this.#playerPosition,
    });
    return getPrototypeMovementSpeed({
      baseSpeed: PLAYER_MOVEMENT_SPEED_CELLS_PER_SECOND,
      playerPosition: this.#playerPosition,
      currentAreaId: this.#currentAreaId,
      areaStates: snapshot.areaStates,
      happenings: snapshot.happenings,
    });
  }

  /**
   * 接近した見回り地点を自動完了する。
   * @private
   * @returns {void}
   */
  #updatePatrolProgress() {
    const patrol = this.#taskBatch?.tasks[PROTOTYPE_TASK_IDS.PATROL];
    if (!patrol || patrol.status !== TASK_STATUSES.ACTIVE) {
      return;
    }
    for (const checkpoint of patrol.checkpoints) {
      if (
        !checkpoint.isCompleted
        && this.#isPositionNearby(checkpoint.position)
        && this.#isPositionVisible(checkpoint.position)
      ) {
        checkpoint.isCompleted = true;
        this.#addLog(`見回り: ${checkpoint.label}を確認した。`);
      }
    }
    if (patrol.checkpoints.every((checkpoint) => checkpoint.isCompleted)) {
      this.#completeTeacherTask(patrol);
    }
  }

  /**
   * 現在地で操作対象の教師仕事を進める。
   * @private
   * @param {string} taskId - 教師仕事ID。
   * @param {string} stepId - 操作対象地点ID。
   * @returns {boolean} 仕事を進めた場合はtrue。
   */
  #interactWithTask(taskId, stepId) {
    const task = this.#taskBatch?.tasks[taskId];
    if (!task || task.status !== TASK_STATUSES.ACTIVE) {
      return false;
    }
    if (taskId === PROTOTYPE_TASK_IDS.DELIVERY) {
      const point = task.step === 'pickup' ? task.pickup : task.destination;
      if (point.id !== stepId || !this.#isPositionNearby(point.position)) {
        return false;
      }
      if (task.step === 'pickup') {
        task.step = 'destination';
        this.#addLog('配達用の物資を受け取った。');
      } else {
        this.#addLog('指定先へ物資を届けた。');
        this.#completeTeacherTask(task);
      }
      return true;
    }
    if (taskId !== PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK) {
      return false;
    }
    const spot = task.spots.find((entry) => entry.id === stepId);
    if (!spot || spot.isCompleted || !this.#isPositionNearby(spot.position)) {
      return false;
    }
    spot.isCompleted = true;
    this.#addLog(`世界樹確認: ${spot.label}を確認した。`);
    if (task.spots.every((entry) => entry.isCompleted)) {
      this.#completeTeacherTask(task);
    }
    return true;
  }

  /** 通常画面で追跡する教師仕事を手動選択する。 */
  #trackTask(taskId) {
    const task = this.#taskBatch?.tasks[taskId];
    if (!task || task.status !== TASK_STATUSES.ACTIVE) {
      return false;
    }
    const hasChanged = this.#trackedTaskId !== taskId;
    this.#trackedTaskId = taskId;
    this.#plannedActionId = `task:${taskId}`;
    this.#goalSelectionReason = null;
    this.#isTaskTrackingManual = true;
    if (hasChanged) {
      this.#emitKamoNotice(
        `task:${this.#loopCount}:${this.#taskBatch.batchNumber}:${taskId}`,
        'task',
        KAMO_NOTICE_PRIORITIES.TASK,
        `兄貴、「${this.#getTaskTitle(taskId)}」を追いましょうぜ。`,
      );
    }
    return true;
  }

  /** 現在地に最も近い未完了仕事を必要に応じて追跡する。 */
  #ensureTrackedTask({ notify = false } = {}) {
    const trackedTask = this.#taskBatch?.tasks[this.#trackedTaskId];
    if (trackedTask?.status === TASK_STATUSES.ACTIVE) {
      return;
    }
    const previousTaskId = this.#trackedTaskId;
    const wasFollowingPreviousTask = this.#plannedActionId === `task:${previousTaskId}`;
    this.#isTaskTrackingManual = false;
    this.#trackedTaskId = this.#findNearestActiveTaskId();
    if (wasFollowingPreviousTask) {
      this.#plannedActionId = this.#trackedTaskId ? `task:${this.#trackedTaskId}` : null;
    }
    if (notify && this.#trackedTaskId && this.#trackedTaskId !== previousTaskId) {
      this.#notifyTrackedTask('次は');
    }
  }

  /** 現在追跡している仕事をカモ君通知へ変換する。 */
  #notifyTrackedTask(prefix) {
    if (!this.#trackedTaskId || !this.#taskBatch) {
      return;
    }
    this.#emitKamoNotice(
      `task:${this.#loopCount}:${this.#taskBatch.batchNumber}:${this.#trackedTaskId}`,
      'task',
      KAMO_NOTICE_PRIORITIES.TASK,
      `${prefix}「${this.#getTaskTitle(this.#trackedTaskId)}」へ向かいましょうぜ。`,
    );
  }

  /** 現在地から目的地点まで最短の進行中仕事IDを返す。 */
  #findNearestActiveTaskId() {
    if (!this.#taskBatch) {
      return null;
    }
    let nearestTaskId = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const task of Object.values(this.#taskBatch.tasks)) {
      if (task.status !== TASK_STATUSES.ACTIVE) {
        continue;
      }
      const target = this.#findNearestTaskTarget(task.id);
      const distance = target ? getDistance(this.#playerPosition, target.position) : Number.POSITIVE_INFINITY;
      if (distance < nearestDistance) {
        nearestTaskId = task.id;
        nearestDistance = distance;
      }
    }
    return nearestTaskId;
  }

  /** 指定仕事に残っている目的地点のうち現在地に最も近い地点を返す。 */
  #findNearestTaskTarget(taskId) {
    const task = this.#taskBatch?.tasks[taskId];
    if (!task || task.status !== TASK_STATUSES.ACTIVE) {
      return null;
    }
    let points = [];
    if (taskId === PROTOTYPE_TASK_IDS.PATROL) {
      points = task.checkpoints.filter((point) => !point.isCompleted);
    } else if (taskId === PROTOTYPE_TASK_IDS.DELIVERY) {
      points = [task.step === 'pickup' ? task.pickup : task.destination];
    } else if (taskId === PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK) {
      points = task.spots.filter((point) => !point.isCompleted);
    }
    return points.reduce((nearest, point) => (
      !nearest
      || getDistance(this.#playerPosition, point.position) < getDistance(this.#playerPosition, nearest.position)
        ? point
        : nearest
    ), null);
  }

  /** クラスメイトの出し物、有名な催し、教師仕事を主目的へ設定する。 */
  #selectPlannedAction(actionId) {
    const activity = findPrototypeActivity(actionId);
    if (activity?.isPrimaryGoal) {
      this.#plannedActionId = activity.id;
      this.#goalSelectionReason = null;
      this.#emitKamoNotice(
        `plan:${this.#loopCount}:${activity.id}`,
        'task',
        KAMO_NOTICE_PRIORITIES.TASK,
        `兄貴、次は「${activity.title}」へ向かいましょうぜ。`,
      );
      return true;
    }
    if (!String(actionId).startsWith('task:')) {
      return false;
    }
    const taskId = String(actionId).slice(5);
    return this.#trackTask(taskId);
  }

  /** 現在の予定行動と目的地案内を生成する。 */
  #createPlannedActionSnapshot() {
    if (!this.#plannedActionId) {
      return null;
    }
    const activity = findPrototypeActivity(this.#plannedActionId);
    if (activity) {
      const availability = getPrototypeActivityAvailability(activity, this.#elapsedMinutes);
      return this.#createActivityNavigationSnapshot(activity, availability);
    }
    const taskId = this.#plannedActionId.startsWith('task:')
      ? this.#plannedActionId.slice(5)
      : null;
    const target = this.#findNearestTaskTarget(taskId);
    if (!target) {
      return null;
    }
    return this.#createNavigationSnapshot({
      id: this.#plannedActionId,
      kind: PROTOTYPE_ACTIVITY_KINDS.TASK,
      title: this.#getTaskTitle(taskId),
      targetLabel: target.label,
      position: target.position,
      availability: 'open',
      isPrimaryGoal: true,
      motivationKind: PROTOTYPE_GOAL_MOTIVATIONS.TEACHER,
      motivationLabel: '教師として行うべきこと',
      landmarkId: findAreaByPosition(target.position).id,
    });
  }

  /** 定義済み予定行動の目的地案内を生成する。 */
  #createActivityNavigationSnapshot(activity, availability) {
    return this.#createNavigationSnapshot({
      id: activity.id,
      kind: activity.kind,
      title: activity.title,
      targetLabel: findArea(activity.areaId).name,
      position: activity.position,
      availability,
      isPrimaryGoal: activity.isPrimaryGoal,
      motivationKind: activity.motivationKind ?? null,
      motivationLabel: activity.motivationLabel ?? null,
      landmarkId: activity.landmarkId ?? activity.areaId,
    });
  }

  /** 予定行動の共通ナビゲーション情報を生成する。 */
  #createNavigationSnapshot({
    id,
    kind,
    title,
    targetLabel,
    position,
    availability,
    isPrimaryGoal = false,
    motivationKind = null,
    motivationLabel = null,
    landmarkId = null,
  }) {
    const delta = {
      x: position.x - this.#playerPosition.x,
      y: position.y - this.#playerPosition.y,
    };
    const distance = Math.hypot(delta.x, delta.y);
    const length = distance || 1;
    const viewport = createPrototypeViewport(this.#playerPosition);
    const area = findAreaByPosition(position);
    return {
      id,
      kind,
      title,
      targetLabel,
      areaId: area.id,
      areaName: area.name,
      position: copyPosition(position),
      direction: { x: delta.x / length, y: delta.y / length },
      distance,
      availability,
      isPrimaryGoal,
      motivationKind,
      motivationLabel,
      landmarkId,
      isTargetVisible: isPositionInPrototypeViewport(position, viewport)
        && this.#isPositionVisible(position),
    };
  }

  /** 現在判明している定時イベント、出店、教師仕事を一覧化する。 */
  #createAvailableActivitySnapshots() {
    const activities = PROTOTYPE_ACTIVITY_DEFINITIONS
      .filter((activity) => (
        activity.kind === PROTOTYPE_ACTIVITY_KINDS.STALL
        || this.#knownEventIds.has(activity.id)
      ))
      .map((activity) => {
      const availability = getPrototypeActivityAvailability(activity, this.#elapsedMinutes);
      return {
        id: activity.id,
        kind: activity.kind,
        title: activity.title,
        areaId: activity.areaId,
        areaName: findArea(activity.areaId).name,
        startTimeLabel: formatGameTime(activity.startMinutes),
        endTimeLabel: formatGameTime(activity.endMinutes),
        availability,
        isPlanned: this.#plannedActionId === activity.id,
        isPrimaryGoal: activity.isPrimaryGoal,
        motivationKind: activity.motivationKind ?? null,
        motivationLabel: activity.motivationLabel ?? null,
        landmarkId: activity.landmarkId ?? activity.areaId,
      };
      });
    for (const task of this.#createTaskSnapshots().filter((entry) => entry.status === TASK_STATUSES.ACTIVE)) {
      const target = this.#findNearestTaskTarget(task.id);
      const targetAreaId = target ? findAreaByPosition(target.position).id : null;
      activities.push({
        id: `task:${task.id}`,
        kind: PROTOTYPE_ACTIVITY_KINDS.TASK,
        title: task.title,
        areaId: targetAreaId,
        areaName: task.areaName,
        startTimeLabel: null,
        endTimeLabel: task.deadlineTimeLabel,
        availability: 'open',
        isPlanned: this.#plannedActionId === `task:${task.id}`,
        isPrimaryGoal: true,
        motivationKind: PROTOTYPE_GOAL_MOTIVATIONS.TEACHER,
        motivationLabel: '教師として行うべきこと',
        landmarkId: targetAreaId,
      });
    }
    return activities;
  }

  /** 主目的未選択時の選択理由と選択可能候補を返す。 */
  #createGoalSelectionSnapshot() {
    if (!this.#goalSelectionReason || this.#elapsedMinutes >= FESTIVAL_DURATION_MINUTES) {
      return null;
    }
    return {
      reason: this.#goalSelectionReason,
      title: '次に向かう目的を選ぶ',
      candidates: this.#createAvailableActivitySnapshots().filter((activity) => (
        activity.isPrimaryGoal && activity.availability !== 'closed'
      )),
    };
  }

  /** 現在地で開始できる定時イベントまたは出店を返す。 */
  #createNearbyActivitySnapshots() {
    return PROTOTYPE_ACTIVITY_DEFINITIONS
      .map((activity) => ({
        activity,
        availability: getPrototypeActivityAvailability(activity, this.#elapsedMinutes),
      }))
      .filter(({ activity, availability }) => (
        canStartPrototypeActivity(availability)
        && this.#isPositionNearby(activity.position)
        && this.#isPositionVisible(activity.position)
      ))
      .map(({ activity, availability }) => ({
        id: activity.id,
        title: activity.title,
        availability,
        actionLabel: availability === 'partial' ? '途中参加する' : '開始する',
      }));
  }

  /** 現在地の定時イベントまたは出店利用を開始する。 */
  #startActivity(activityId) {
    const activity = findPrototypeActivity(activityId);
    if (!activity || !this.#isPositionNearby(activity.position)) {
      return false;
    }
    const availability = getPrototypeActivityAvailability(activity, this.#elapsedMinutes);
    if (!canStartPrototypeActivity(availability)) {
      return false;
    }
    const isPartial = availability === 'partial';
    this.#activitySession = {
      activityId: activity.id,
      isPrimaryGoal: this.#plannedActionId === activity.id,
      progressMinutes: 0,
      requiredMinutes: isPartial ? activity.partialDurationMinutes : activity.durationMinutes,
      isPartial,
      isInterrupted: false,
      isAwaitingResume: false,
      isShortened: false,
    };
    this.#movementInput = { x: 0, y: 0 };
    this.#addLog(`${activity.title}を開始した。`);
    return true;
  }

  /** 実行中の予定行動を定義された1段階だけ進める。 */
  #advanceActivitySession() {
    const session = this.#activitySession;
    if (!session || session.isInterrupted || session.isAwaitingResume) {
      return false;
    }
    const activity = findPrototypeActivity(session.activityId);
    const remaining = session.requiredMinutes - session.progressMinutes;
    const stepMinutes = session.isShortened ? remaining : Math.min(activity.stepMinutes, remaining);
    for (let minute = 0; minute < stepMinutes; minute += 1) {
      this.#advanceTime(1);
      session.progressMinutes += 1;
      if (this.#detectInterruption()) {
        session.isInterrupted = true;
        return true;
      }
      if (
        activity.kind === PROTOTYPE_ACTIVITY_KINDS.SCHEDULED_EVENT
        && this.#elapsedMinutes >= activity.endMinutes
        && session.progressMinutes < session.requiredMinutes
      ) {
        session.isShortened = true;
        break;
      }
    }
    if (session.progressMinutes >= session.requiredMinutes || session.isShortened) {
      this.#completeActivitySession(activity);
    }
    return true;
  }

  /** 完了した予定行動をイベント状態とログへ反映する。 */
  #completeActivitySession(activity) {
    if (activity.kind === PROTOTYPE_ACTIVITY_KINDS.SCHEDULED_EVENT) {
      this.#events[activity.id].status = EVENT_STATUSES.COMPLETED;
      this.#knownEventIds.add(activity.id);
      this.#achievements.add(`completed:${activity.id}`);
    }
    this.#addLog(`${activity.title}を終えた。`);
    const completedPrimaryGoal = this.#activitySession.isPrimaryGoal;
    this.#activitySession = null;
    if (completedPrimaryGoal && this.#enableGoalSelection) {
      this.#plannedActionId = null;
      this.#goalSelectionReason = GOAL_SELECTION_REASONS.COMPLETED;
    }
  }

  /** 割込後に中断していた予定行動を再開する。 */
  #resumeActivitySession() {
    if (!this.#activitySession?.isAwaitingResume) {
      return false;
    }
    this.#activitySession.isInterrupted = false;
    this.#activitySession.isAwaitingResume = false;
    this.#addLog(`${findPrototypeActivity(this.#activitySession.activityId).title}へ戻った。`);
    return true;
  }

  /** 中断中または実行中の予定行動から離脱する。 */
  #leaveActivitySession() {
    if (!this.#activitySession) {
      return false;
    }
    this.#addLog(`${findPrototypeActivity(this.#activitySession.activityId).title}から離れた。`);
    this.#activitySession = null;
    return true;
  }

  /** 実行中または中断中の予定行動セッションをrenderer向けに返す。 */
  #createActivitySessionSnapshot() {
    if (!this.#activitySession) {
      return null;
    }
    const activity = findPrototypeActivity(this.#activitySession.activityId);
    return {
      ...this.#activitySession,
      title: activity.title,
      remainingMinutes: Math.max(
        0,
        this.#activitySession.requiredMinutes - this.#activitySession.progressMinutes,
      ),
    };
  }

  /** 現在の世界状態とネギの位置から巻き込み開始を判定する。 */
  #detectInterruption() {
    if (
      !this.#enableInterruptions
      || this.#interruption
      || !this.#plannedActionId
      || this.#elapsedMinutes < this.#interruptionCooldownUntil
    ) {
      return false;
    }
    if (
      !this.#isScaffoldIncidentHandled
      && this.#elapsedMinutes >= SCAFFOLD_INCIDENT.startMinutes
      && this.#elapsedMinutes < SCAFFOLD_INCIDENT.endMinutes
      && getDistance(this.#playerPosition, SCAFFOLD_INCIDENT.position) <= MAJOR_INTERRUPTION_RADIUS
    ) {
      return this.#startInterruption({
        id: SCAFFOLD_INCIDENT.id,
        title: SCAFFOLD_INCIDENT.title,
        severity: INTERRUPTION_SEVERITIES.MAJOR,
        happeningId: null,
      });
    }

    const snapshot = this.#happeningDirector.createSnapshot({
      playerPosition: this.#playerPosition,
    });
    const flow = snapshot.flows.find((entry) => {
      const center = {
        x: entry.from.x + (entry.to.x - entry.from.x) * entry.progress,
        y: entry.from.y + (entry.to.y - entry.from.y) * entry.progress,
      };
      return !this.#handledInterruptionIds.has(entry.happeningId)
        && getDistance(this.#playerPosition, center) <= MAJOR_INTERRUPTION_RADIUS;
    });
    if (flow) {
      const happening = snapshot.happenings.find((entry) => entry.id === flow.happeningId);
      return this.#startInterruption({
        id: `flow:${flow.happeningId}`,
        title: happening?.title ?? '押し寄せる人の流れ',
        severity: INTERRUPTION_SEVERITIES.MAJOR,
        happeningId: flow.happeningId,
      });
    }

    const nearby = snapshot.nearbyHappenings.find((entry) => (
      !this.#handledInterruptionIds.has(entry.id)
    ));
    if (nearby) {
      return this.#startInterruption({
        id: `nearby:${nearby.id}`,
        title: nearby.title,
        severity: INTERRUPTION_SEVERITIES.MEDIUM,
        happeningId: nearby.id,
      });
    }
    return false;
  }

  /** 現在行動を退避して巻き込み判断状態を開始する。 */
  #startInterruption({ id, title, severity, happeningId }) {
    this.#movementInput = { x: 0, y: 0 };
    if (this.#activitySession) {
      this.#activitySession.isInterrupted = true;
    }
    this.#interruption = {
      id,
      title,
      severity,
      happeningId,
    };
    this.#emitKamoNotice(
      `interruption:${this.#loopCount}:${id}`,
      severity === INTERRUPTION_SEVERITIES.MAJOR ? 'urgent' : 'nearby',
      severity === INTERRUPTION_SEVERITIES.MAJOR
        ? KAMO_NOTICE_PRIORITIES.URGENT
        : KAMO_NOTICE_PRIORITIES.NEARBY,
      severity === INTERRUPTION_SEVERITIES.MAJOR
        ? `兄貴、危ない！ 「${title}」に巻き込まれますぜ！`
        : `兄貴、「${title}」が進路まで広がってきましたぜ。`,
    );
    this.#addLog(`${title}に巻き込まれた。`);
    return true;
  }

  /** 巻き込みへの選択を適用し、元の予定行動へ戻れる状態にする。 */
  #chooseInterruption(choiceId) {
    if (!this.#interruption) {
      return false;
    }
    const interruption = this.#interruption;
    let timeCostMinutes = 0;
    let magicPowerCost = 0;
    if (interruption.severity === INTERRUPTION_SEVERITIES.MEDIUM) {
      if (choiceId === 'intervene') {
        timeCostMinutes = 3;
      } else if (choiceId === 'detour') {
        timeCostMinutes = 2;
      } else {
        return false;
      }
    } else if (choiceId === 'rescue') {
      timeCostMinutes = 3;
    } else if (choiceId === 'magic') {
      if (this.#magicPower < 10) {
        return false;
      }
      timeCostMinutes = 1;
      magicPowerCost = 10;
    } else if (choiceId === 'retreat') {
      timeCostMinutes = 2;
    } else {
      return false;
    }

    this.#interruption = null;
    this.#magicPower -= magicPowerCost;
    this.#handledInterruptionIds.add(interruption.happeningId ?? interruption.id);
    if (interruption.id === SCAFFOLD_INCIDENT.id) {
      this.#isScaffoldIncidentHandled = true;
    }
    this.#advanceTime(timeCostMinutes);
    this.#interruptionCooldownUntil = this.#elapsedMinutes + INTERRUPTION_COOLDOWN_MINUTES;
    this.#addLog(`${interruption.title}へ対応した。${timeCostMinutes}分経過。`);
    if (this.#activitySession) {
      const activity = findPrototypeActivity(this.#activitySession.activityId);
      this.#activitySession.isAwaitingResume = true;
      if (
        activity.kind === PROTOTYPE_ACTIVITY_KINDS.SCHEDULED_EVENT
        && this.#elapsedMinutes >= activity.endMinutes
      ) {
        this.#activitySession.isShortened = true;
      }
    }
    return true;
  }

  /** 巻き込み判断画面へ必要な選択肢を生成する。 */
  #createInterruptionSnapshot() {
    if (!this.#interruption) {
      return null;
    }
    const isMajor = this.#interruption.severity === INTERRUPTION_SEVERITIES.MAJOR;
    return {
      ...this.#interruption,
      description: isMajor
        ? '避けきれない騒ぎが現在の行動を中断した。'
        : '対応するか、時間を使って迂回する必要がある。',
      choices: isMajor
        ? [
            { id: 'rescue', label: '周囲を助ける', detail: '3分' },
            { id: 'magic', label: '魔法で切り抜ける', detail: '1分 / MP 10', enabled: this.#magicPower >= 10 },
            { id: 'retreat', label: '安全な場所へ退避する', detail: '2分' },
          ]
        : [
            { id: 'intervene', label: '騒ぎへ対応する', detail: '3分' },
            { id: 'detour', label: '迂回する', detail: '2分' },
          ],
    };
  }

  /** 周囲へ接近中の出来事を操作を要求しない環境情報として返す。 */
  #createEnvironmentalCueSnapshot(happeningSnapshot) {
    const candidates = happeningSnapshot.happenings
      .map((happening) => ({
        happening,
        distance: getDistance(this.#playerPosition, happening.position),
      }))
      .filter((entry) => entry.distance <= 7)
      .sort((left, right) => left.distance - right.distance);
    const candidate = candidates[0];
    if (!candidate) {
      return null;
    }
    const delta = {
      x: candidate.happening.position.x - this.#playerPosition.x,
      y: candidate.happening.position.y - this.#playerPosition.y,
    };
    const length = Math.hypot(delta.x, delta.y) || 1;
    return {
      type: candidate.happening.phase === 'prelude' ? 'ambient' : 'approaching',
      message: candidate.happening.phase === 'prelude'
        ? '近くから歓声と人のざわめきが聞こえる。'
        : '人の流れがこちらへ近づいている。',
      direction: { x: delta.x / length, y: delta.y / length },
    };
  }

  /** 追跡中仕事の移動案内snapshotを生成する。 */
  #createTaskNavigationSnapshot() {
    const plannedAction = this.#createPlannedActionSnapshot();
    if (!plannedAction) {
      return null;
    }
    return {
      ...plannedAction,
      taskId: plannedAction.kind === PROTOTYPE_ACTIVITY_KINDS.TASK
        ? plannedAction.id.slice(5)
        : null,
      isManual: this.#isTaskTrackingManual,
    };
  }

  /** 接近中の発見地点を調べて情報または報酬を得る。 */
  #interactWithDiscovery(discoveryId) {
    const discovery = this.#discoveries.find((entry) => entry.id === discoveryId);
    if (
      !discovery
      || discovery.isDiscovered
      || !this.#isPositionNearby(discovery.position)
      || !this.#isPositionVisible(discovery.position)
    ) {
      return false;
    }
    discovery.isDiscovered = true;
    if (discovery.type === PROTOTYPE_DISCOVERY_TYPES.SCHEDULE) {
      return this.#discoverScheduleInformation();
    }
    if (discovery.type === PROTOTYPE_DISCOVERY_TYPES.HAPPENING) {
      return this.#discoverHappeningInformation();
    }
    if (discovery.type === PROTOTYPE_DISCOVERY_TYPES.MAGIC_POWER) {
      const recovered = Math.min(DISCOVERY_MAGIC_POWER_REWARD, MAX_MAGIC_POWER - this.#magicPower);
      this.#magicPower += recovered;
      this.#addLog(`休憩できる場所を見つけた。MPが${recovered}回復した。`);
      return true;
    }
    this.#awardDiscoveryMahoPay();
    return true;
  }

  /** 未判明の定時イベントを1件スケジュールへ追加する。 */
  #discoverScheduleInformation() {
    const eventId = Object.values(PROTOTYPE_EVENT_IDS).find((candidateId) => (
      !this.#knownEventIds.has(candidateId)
    ));
    if (!eventId) {
      this.#awardDiscoveryMahoPay();
      return true;
    }
    this.#knownEventIds.add(eventId);
    const event = this.#events[eventId];
    this.#addLog(`${this.#getEventTitle(eventId)}の情報を得た。${formatGameTime(event.startMinutes)}・${findArea(event.areaId).name}`);
    return true;
  }

  /** 現在地以外で進行するハプニングの詳細情報を1件得る。 */
  #discoverHappeningInformation() {
    const happeningSnapshot = this.#happeningDirector.createSnapshot({
      playerPosition: this.#playerPosition,
    });
    const happening = happeningSnapshot.happenings.find((entry) => (
      entry.areaId !== this.#currentAreaId && !this.#revealedHappeningIds.has(entry.id)
    ));
    if (!happening) {
      this.#awardDiscoveryMahoPay();
      return true;
    }
    this.#revealedHappeningIds.add(happening.id);
    this.#addLog(`${findArea(happening.areaId).name}で「${happening.title}」が起きていると聞いた。`);
    this.#emitKamoNotice(
      `rumor-detail:${this.#loopCount}:${happening.id}`,
      'rumor',
      KAMO_NOTICE_PRIORITIES.RUMOR,
      `兄貴、${findArea(happening.areaId).name}で「${happening.title}」が起きているそうですぜ。`,
    );
    return true;
  }

  /** 発見報酬としてMahoPayを加算する。 */
  #awardDiscoveryMahoPay() {
    this.#mahoPayPoints += DISCOVERY_MAHOPAY_REWARD;
    this.#addLog(`MahoPayを${DISCOVERY_MAHOPAY_REWARD}ポイント見つけた。`);
  }

  /**
   * 教師仕事を完了し、完了時刻に応じたMahoPayを付与する。
   * @private
   * @param {Object} task - 完了する教師仕事。
   * @returns {void}
   */
  #completeTeacherTask(task) {
    const completedPrimaryGoal = this.#plannedActionId === `task:${task.id}`;
    const isLate = this.#elapsedMinutes > this.#taskBatch.deadlineMinutes;
    const baseReward = TEACHER_TASK_REWARDS[task.id];
    task.status = TASK_STATUSES.COMPLETED;
    task.rewardPoints = isLate ? Math.floor(baseReward / 2) : baseReward;
    this.#mahoPayPoints += task.rewardPoints;
    this.#addLog(`${this.#getTaskTitle(task.id)}を完了した。+${task.rewardPoints} MahoPay`);
    if (completedPrimaryGoal && this.#enableGoalSelection) {
      this.#plannedActionId = null;
      this.#goalSelectionReason = GOAL_SELECTION_REASONS.COMPLETED;
    }
    this.#finishTaskBatchWhenReady();
  }

  /**
   * 全仕事完了時に次回支給時刻と配置を予約する。
   * @private
   * @returns {void}
   */
  #finishTaskBatchWhenReady() {
    if (!Object.values(this.#taskBatch.tasks).every((task) => task.status === TASK_STATUSES.COMPLETED)) {
      return;
    }
    this.#nextTaskBatchStartMinutes = this.#elapsedMinutes + TEACHER_TASK_REFRESH_DELAY_MINUTES;
    this.#nextTaskPatternIndex = (this.#taskBatch.patternIndex + 1) % TEACHER_TASK_PATTERNS.length;
    this.#nextTaskBatchNumber = this.#taskBatch.batchNumber + 1;
    this.#taskBatch = null;
    this.#addLog(`教師仕事をすべて完了した。次の支給は${formatGameTime(this.#nextTaskBatchStartMinutes)}。`);
  }

  /**
   * 予約時刻へ到達した場合に次の教師仕事一式を支給する。
   * @private
   * @returns {void}
   */
  #issueNextTaskBatchWhenReady() {
    if (
      this.#taskBatch
      || this.#nextTaskBatchStartMinutes === null
      || this.#elapsedMinutes < this.#nextTaskBatchStartMinutes
      || this.#elapsedMinutes >= FESTIVAL_DURATION_MINUTES
      || this.#nextTaskBatchStartMinutes >= FESTIVAL_DURATION_MINUTES
    ) {
      return;
    }
    const startMinutes = this.#nextTaskBatchStartMinutes;
    this.#taskBatch = createTeacherTaskBatch(
      this.#nextTaskPatternIndex,
      this.#nextTaskBatchNumber,
      startMinutes,
    );
    this.#nextTaskBatchStartMinutes = null;
    this.#addLog(`教師仕事 第${this.#taskBatch.batchNumber}便が支給された。`);
    this.#updatePatrolProgress();
  }

  /**
   * 現在地で対象イベントを進める。
   * @private
   * @param {string} eventId - 操作対象イベントID。
   * @returns {boolean} イベントを進めた場合はtrue。
   */
  #interactWithEvent(eventId) {
    const event = this.#events[eventId];
    if (
      !event
      || event.status !== EVENT_STATUSES.ACTIVE
      || !this.#isPositionNearby(event.position)
    ) {
      return false;
    }

    const plannedActivity = findPrototypeActivity(eventId);
    if (plannedActivity?.kind === PROTOTYPE_ACTIVITY_KINDS.SCHEDULED_EVENT) {
      return this.#startActivity(eventId);
    }

    if (eventId === PROTOTYPE_EVENT_IDS.STALL_TROUBLE) {
      this.#activeEventSession = { eventId };
      this.#addLog('屋台トラブルへの対応を開始した。');
      return true;
    }

    if (eventId === PROTOTYPE_EVENT_IDS.LOST_CHILD && event.step === 'find-child') {
      event.step = 'find-parent';
      event.areaId = this.#currentAreaId;
      event.position = copyPosition(this.#playerPosition);
      this.#addLog('迷子を保護した。一緒に親を探す。');
      return true;
    }

    if (
      eventId === PROTOTYPE_EVENT_IDS.LOST_CHILD
      && event.step === 'find-parent'
      && !this.#isPositionNearby(event.parentPosition)
    ) {
      return false;
    }

    event.status = EVENT_STATUSES.COMPLETED;
    this.#knownEventIds.add(eventId);
    this.#achievements.add(`completed:${eventId}`);
    this.#addLog(`${this.#getEventTitle(eventId)}を完了した。`);
    this.#syncHappeningDirector(0);
    return true;
  }

  /**
   * 対応中イベントの行動を実行する。
   * @private
   * @param {string} actionId - 実行する行動ID。
   * @returns {boolean} 行動を実行した場合はtrue。
   */
  #performEventAction(actionId) {
    if (this.#activeEventSession?.eventId !== PROTOTYPE_EVENT_IDS.STALL_TROUBLE) {
      return false;
    }
    if (actionId === PROTOTYPE_EVENT_ACTION_IDS.LEAVE) {
      this.#activeEventSession = null;
      this.#addLog('屋台トラブルへの対応を中断した。');
      return true;
    }

    const stall = this.#events[PROTOTYPE_EVENT_IDS.STALL_TROUBLE];
    if (actionId === PROTOTYPE_EVENT_ACTION_IDS.MAGIC_SUPPORT) {
      if (this.#magicPower < STALL_MAGIC_POWER_COST) {
        return false;
      }
      this.#magicPower -= STALL_MAGIC_POWER_COST;
      stall.responseProgress += 3;
      this.#addLog('魔法で屋台を支えた。');
      this.#advanceTime(STALL_MAGIC_TIME_COST);
    } else if (actionId === PROTOTYPE_EVENT_ACTION_IDS.CALL_FOR_HELP) {
      stall.responseProgress += stall.phase === STALL_TROUBLE_PHASES.MERGED ? 1 : 2;
      this.#addLog('周囲の人へ協力を頼んだ。');
      this.#advanceTime(STALL_HELP_TIME_COST);
    } else if (actionId === PROTOTYPE_EVENT_ACTION_IDS.CLEAR_CROWD) {
      stall.responseProgress += 1;
      this.#addLog('安全な場所へ人混みを誘導した。');
      this.#advanceTime(STALL_CROWD_TIME_COST);
    } else {
      return false;
    }

    if (this.#activeEventSession) {
      this.#completeStallTroubleWhenReady();
    }
    return true;
  }

  /**
   * 必要進捗へ到達した屋台トラブルを完了する。
   * @private
   * @returns {boolean} 完了した場合はtrue。
   */
  #completeStallTroubleWhenReady() {
    const stall = this.#events[PROTOTYPE_EVENT_IDS.STALL_TROUBLE];
    if (stall.responseProgress < this.#getStallRequiredProgress()) {
      return false;
    }
    stall.status = EVENT_STATUSES.COMPLETED;
    stall.phase = STALL_TROUBLE_PHASES.RESOLVED;
    this.#activeEventSession = null;
    this.#knownEventIds.add(PROTOTYPE_EVENT_IDS.STALL_TROUBLE);
    this.#achievements.add(`completed:${PROTOTYPE_EVENT_IDS.STALL_TROUBLE}`);
    this.#addLog('屋台トラブルを解決した。');
    return true;
  }

  /**
   * 屋台トラブルの成長段階から必要対応進捗を返す。
   * @private
   * @returns {number} 解決に必要な対応進捗。
   */
  #getStallRequiredProgress() {
    const phase = this.#events[PROTOTYPE_EVENT_IDS.STALL_TROUBLE].phase;
    if (phase === STALL_TROUBLE_PHASES.MERGED) {
      return 6;
    }
    if (phase === STALL_TROUBLE_PHASES.GROWN || phase === STALL_TROUBLE_PHASES.SPREAD) {
      return 5;
    }
    return 4;
  }

  /**
   * 現在時刻に合わせて全イベントの状態を更新する。
   * @private
   * @returns {void}
   */
  #updateEventStates() {
    for (const eventId of Object.values(PROTOTYPE_EVENT_IDS)) {
      const event = this.#events[eventId];
      if (event.status === EVENT_STATUSES.WAITING && this.#elapsedMinutes >= event.startMinutes) {
        event.status = EVENT_STATUSES.ACTIVE;
        if (eventId === PROTOTYPE_EVENT_IDS.COSPLAY_PARADE) {
          this.#addLog(`${findArea(event.areaId).name}でコスプレパレードが始まった。`);
        }
      }
      const isParticipating = this.#activitySession?.activityId === eventId;
      if (
        event.status === EVENT_STATUSES.ACTIVE
        && this.#elapsedMinutes >= event.endMinutes
        && !isParticipating
      ) {
        event.status = EVENT_STATUSES.MISSED;
        if (this.#plannedActionId === eventId) {
          this.#plannedActionId = null;
          this.#goalSelectionReason = this.#enableGoalSelection
            ? GOAL_SELECTION_REASONS.MISSED
            : null;
        }
        if (eventId === PROTOTYPE_EVENT_IDS.SECRET_EXHIBIT) {
          this.#knownEventIds.add(eventId);
          this.#addLog('体育館前の秘密の展示を見逃した。次は時刻に間に合える。');
        }
      }
    }
    this.#updateStallTrouble();
  }

  /**
   * 屋台トラブルの成長、波及、合流を更新する。
   * @private
   * @returns {void}
   */
  #updateStallTrouble() {
    const stall = this.#events[PROTOTYPE_EVENT_IDS.STALL_TROUBLE];
    if (stall.status !== EVENT_STATUSES.ACTIVE) {
      return;
    }
    if (
      this.#elapsedMinutes >= 40
      && stall.phase !== STALL_TROUBLE_PHASES.SPREAD
      && stall.phase !== STALL_TROUBLE_PHASES.MERGED
    ) {
      stall.phase = STALL_TROUBLE_PHASES.SPREAD;
      stall.areaId = PROTOTYPE_AREA_IDS.DAVID_PLAZA;
      stall.position = copyPosition(EVENT_POSITIONS.SPREAD_STALL_TROUBLE);
      this.#achievements.add('stall-trouble-spread');
      if (this.#activeEventSession?.eventId === PROTOTYPE_EVENT_IDS.STALL_TROUBLE) {
        this.#activeEventSession = null;
        this.#addLog('対応が追いつかず、騒ぎがデイビット広場へ広がった。');
      }
    } else if (this.#elapsedMinutes >= 25 && stall.phase === STALL_TROUBLE_PHASES.SMALL) {
      stall.phase = STALL_TROUBLE_PHASES.GROWN;
    }

    const cosplay = this.#events[PROTOTYPE_EVENT_IDS.COSPLAY_PARADE];
    if (
      stall.phase === STALL_TROUBLE_PHASES.SPREAD
      && cosplay.status === EVENT_STATUSES.ACTIVE
      && cosplay.areaId === PROTOTYPE_AREA_IDS.DAVID_PLAZA
    ) {
      stall.phase = STALL_TROUBLE_PHASES.MERGED;
      this.#achievements.add('festival-events-merged');
      this.#addLog('屋台トラブルとコスプレパレードが合流し、大騒ぎになった。');
    }
  }

  /**
   * 経過時間に応じたMPを消費してループを開始時刻へ戻す。
   * @private
   * @returns {boolean} 巻き戻しに成功した場合はtrue。
   */
  #rewind() {
    const cost = this.#calculateRewindCost();
    if (this.#elapsedMinutes <= 0 || this.#magicPower < cost) {
      return false;
    }
    this.#magicPower -= cost;
    this.#elapsedMinutes = 0;
    this.#loopCount += 1;
    this.#currentAreaId = PROTOTYPE_AREA_IDS.DAVID_PLAZA;
    this.#playerPosition = copyPosition(INITIAL_PLAYER_POSITION);
    this.#movementInput = { x: 0, y: 0 };
    this.#pendingMovementDistance = 0;
    this.#isPaused = false;
    this.#pauseTabId = PROTOTYPE_PAUSE_TABS.SCHEDULE;
    this.#events = createLoopEvents(this.#random);
    this.#activeEventSession = null;
    this.#taskBatch = createTeacherTaskBatch(0, 1, 0);
    this.#nextTaskBatchStartMinutes = null;
    this.#nextTaskPatternIndex = 1;
    this.#nextTaskBatchNumber = 2;
    this.#happeningDirector.resetLoop();
    this.#discoveries = createPrototypeDiscoveries(this.#loopCount);
    this.#revealedHappeningIds = new Set();
    this.#trackedTaskId = null;
    this.#isTaskTrackingManual = false;
    this.#kamoNotice = null;
    this.#emittedKamoNoticeKeys = new Set();
    this.#plannedActionId = null;
    this.#activitySession = null;
    this.#interruption = null;
    this.#interruptionCooldownUntil = 0;
    this.#handledInterruptionIds = new Set();
    this.#isScaffoldIncidentHandled = false;
    this.#goalSelectionReason = this.#enableGoalSelection
      ? GOAL_SELECTION_REASONS.INITIAL
      : null;
    this.#achievements.add('used-cassiopeia');
    this.#log = [`カシオペアでAM10:00へ戻った。消費MP: ${cost}`];
    this.#updateEventStates();
    this.#syncHappeningDirector(0);
    this.#ensureTrackedTask();
    if (!this.#enableGoalSelection) {
      this.#plannedActionId = this.#trackedTaskId ? `task:${this.#trackedTaskId}` : null;
      this.#notifyTrackedTask('まずは');
    }
    return true;
  }

  /**
   * 現時刻からAM10:00へ戻るためのMPを計算する。
   * @private
   * @returns {number} 必要MP。開始時刻では0。
   */
  #calculateRewindCost() {
    if (this.#elapsedMinutes <= 0) {
      return 0;
    }
    return Math.max(
      1,
      Math.ceil(this.#elapsedMinutes / 60 * CASSIOPEIA_MP_PER_GAME_HOUR),
    );
  }

  /**
   * 地図表示用のエリアsnapshotを生成する。
   * @private
   * @returns {Array<Object>} エリアsnapshot一覧。
   */
  #createAreaSnapshots() {
    const snapshots = [];
    for (const area of PROTOTYPE_AREAS) {
      snapshots.push({
        id: area.id,
        name: area.name,
        isCurrent: area.id === this.#currentAreaId,
        area: { ...area.area },
      });
    }
    return snapshots;
  }

  /**
   * 同行中の迷子をプレイヤーの移動先へ追従させる。
   * @private
   * @param {string} areaId - プレイヤーの移動先エリアID。
   * @param {Object} position - プレイヤーの移動先座標。
   * @returns {void}
   */
  #moveLostChildCompanion(areaId, position) {
    const lostChild = this.#events[PROTOTYPE_EVENT_IDS.LOST_CHILD];
    if (
      lostChild.status === EVENT_STATUSES.ACTIVE
      && lostChild.step === 'find-parent'
    ) {
      lostChild.areaId = areaId;
      lostChild.position = copyPosition(position);
    }
  }

  /**
   * イベントにより同行している人物のsnapshotを生成する。
   * @private
   * @returns {Object|null} 同行者情報。同行者がいない場合はnull。
   */
  #createCompanionSnapshot() {
    const lostChild = this.#events[PROTOTYPE_EVENT_IDS.LOST_CHILD];
    if (
      lostChild.status !== EVENT_STATUSES.ACTIVE
      || lostChild.step !== 'find-parent'
    ) {
      return null;
    }
    return {
      id: PROTOTYPE_EVENT_IDS.LOST_CHILD,
      name: '迷子',
      areaId: lostChild.areaId,
      areaName: findArea(lostChild.areaId).name,
      position: copyPosition(lostChild.position),
    };
  }

  /**
   * マップ寸法、場所矩形、発生中イベントをsnapshotへまとめる。
   * @private
   * @returns {Object} マップ描画用snapshot。
   */
  #createMapSnapshot(happeningSnapshot) {
    const viewport = createPrototypeViewport(this.#playerPosition);
    const events = this.#createMapEventSnapshots();
    const tasks = this.#createMapTaskSnapshots();
    const discoveries = this.#createMapDiscoverySnapshots();
    const activities = this.#createMapActivitySnapshots();
    const plannedAction = this.#createPlannedActionSnapshot();
    const landmarks = PROTOTYPE_LANDMARKS.map((landmark) => ({
      ...landmark,
      position: copyPosition(landmark.position),
      isGoalLandmark: landmark.id === plannedAction?.landmarkId,
    }));
    const isVisible = (position) => (
      isPositionInPrototypeViewport(position, viewport)
      && hasPrototypeLineOfSight(this.#playerPosition, position)
    );
    return {
      width: PROTOTYPE_MAP_SIZE,
      height: PROTOTYPE_MAP_SIZE,
      areas: this.#createAreaSnapshots(),
      events,
      tasks,
      local: {
        viewport,
        obstacles: getPrototypeObstaclesInViewport(viewport),
        events: events.filter((entry) => isVisible(entry.position)),
        tasks: tasks.filter((entry) => isVisible(entry.position)),
        activities: activities.filter((entry) => isVisible(entry.position)),
        discoveries: discoveries.filter((entry) => isVisible(entry.position)),
        landmarks: landmarks.filter((entry) => isVisible(entry.position)),
        happenings: happeningSnapshot.happenings.filter((entry) => isVisible(entry.position)),
        crowdPoints: happeningSnapshot.crowdPoints.filter((entry) => isVisible(entry.position)),
        flows: happeningSnapshot.flows.filter((entry) => (
          isVisible(entry.from) || isVisible(entry.to)
        )),
        areaStates: happeningSnapshot.areaStates.filter((entry) => entry.id === this.#currentAreaId),
      },
      overview: {
        width: PROTOTYPE_MAP_SIZE,
        height: PROTOTYPE_MAP_SIZE,
        obstacles: PROTOTYPE_OBSTACLES.map((obstacle) => ({ ...obstacle })),
        areas: this.#createAreaSnapshots(),
        landmarks,
        playerPosition: copyPosition(this.#playerPosition),
        targetAreaId: plannedAction?.areaId ?? null,
      },
    };
  }

  /**
   * マップへ表示する発生中イベントのsnapshotを生成する。
   * @private
   * @returns {Array<Object>} イベントマーカー一覧。
   */
  #createMapEventSnapshots() {
    const snapshots = [];
    for (const eventId of Object.values(PROTOTYPE_EVENT_IDS)) {
      const event = this.#events[eventId];
      const activity = findPrototypeActivity(eventId);
      if (
        event.status !== EVENT_STATUSES.ACTIVE
        || activity?.kind === PROTOTYPE_ACTIVITY_KINDS.SCHEDULED_EVENT
      ) {
        continue;
      }
      snapshots.push({
        id: eventId,
        title: this.#getEventTitle(eventId),
        position: copyPosition(event.position),
        isNearby: this.#isPositionNearby(event.position),
      });
      if (
        eventId === PROTOTYPE_EVENT_IDS.LOST_CHILD
        && event.step === 'find-parent'
      ) {
        snapshots.push({
          id: 'lost-child-parent',
          title: '迷子の親',
          position: copyPosition(event.parentPosition),
          isNearby: this.#isPositionNearby(event.parentPosition),
        });
      }
    }
    return snapshots;
  }

  /** マップへ表示する既知の定時イベントと出店を生成する。 */
  #createMapActivitySnapshots() {
    return PROTOTYPE_ACTIVITY_DEFINITIONS
      .filter((activity) => (
        activity.kind === PROTOTYPE_ACTIVITY_KINDS.STALL
        || this.#knownEventIds.has(activity.id)
      ))
      .map((activity) => ({
        id: activity.id,
        kind: activity.kind,
        title: activity.title,
        position: copyPosition(activity.position),
        availability: getPrototypeActivityAvailability(activity, this.#elapsedMinutes),
        isNearby: this.#isPositionNearby(activity.position),
        isPlanned: this.#plannedActionId === activity.id,
      }));
  }

  /**
   * マップへ表示する未完了の教師仕事地点を生成する。
   * @private
   * @returns {Array<Object>} 教師仕事マーカー一覧。
   */
  #createMapTaskSnapshots() {
    if (!this.#taskBatch) {
      return [];
    }
    const snapshots = [];
    const patrol = this.#taskBatch.tasks[PROTOTYPE_TASK_IDS.PATROL];
    for (const checkpoint of patrol.checkpoints) {
      if (!checkpoint.isCompleted) {
        snapshots.push(this.#createTaskPointSnapshot(patrol.id, checkpoint, false));
      }
    }
    const delivery = this.#taskBatch.tasks[PROTOTYPE_TASK_IDS.DELIVERY];
    if (delivery.status === TASK_STATUSES.ACTIVE) {
      const point = delivery.step === 'pickup' ? delivery.pickup : delivery.destination;
      snapshots.push(this.#createTaskPointSnapshot(delivery.id, point, true));
    }
    const worldTreeCheck = this.#taskBatch.tasks[PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK];
    for (const spot of worldTreeCheck.spots) {
      if (!spot.isCompleted) {
        snapshots.push(this.#createTaskPointSnapshot(worldTreeCheck.id, spot, true));
      }
    }
    return snapshots;
  }

  /**
   * 1地点をマップ描画用の教師仕事snapshotへ変換する。
   * @private
   * @param {string} taskId - 教師仕事ID。
   * @param {Object} point - 対象地点。
   * @param {boolean} requiresInteraction - ボタン操作が必要か。
   * @returns {Object} 地図用教師仕事地点。
   */
  #createTaskPointSnapshot(taskId, point, requiresInteraction) {
    return {
      taskId,
      stepId: point.id,
      title: point.label,
      position: copyPosition(point.position),
      isNearby: this.#isPositionNearby(point.position),
      requiresInteraction,
      isTracked: taskId === this.#trackedTaskId,
    };
  }

  /** マップへ表示する未利用発見地点を生成する。 */
  #createMapDiscoverySnapshots() {
    return this.#discoveries
      .filter((discovery) => !discovery.isDiscovered)
      .map((discovery) => ({
        id: discovery.id,
        title: discovery.cueLabel,
        cueKind: discovery.cueKind,
        cueLabel: discovery.cueLabel,
        position: copyPosition(discovery.position),
        isNearby: this.#isPositionNearby(discovery.position),
      }));
  }

  /** 現在地で調べられる発見地点を生成する。 */
  #createNearbyDiscoverySnapshots() {
    return this.#discoveries
      .filter((discovery) => (
        !discovery.isDiscovered
        && this.#isPositionNearby(discovery.position)
        && this.#isPositionVisible(discovery.position)
      ))
      .map((discovery) => ({
        id: discovery.id,
        title: discovery.cueLabel,
        cueKind: discovery.cueKind,
        description: discovery.cueLabel,
        actionLabel: '調べる',
      }));
  }

  /**
   * ネギが指定座標からイベント選択距離内にいるか判定する。
   * @private
   * @param {Object} position - 判定対象座標。
   * @returns {boolean} 半径2マス以内の場合はtrue。
   */
  #isPositionNearby(position) {
    return getDistance(this.#playerPosition, position) <= EVENT_INTERACTION_RADIUS;
  }

  /** 指定座標まで障害物に遮られず見通せるか判定する。 */
  #isPositionVisible(position) {
    return hasPrototypeLineOfSight(this.#playerPosition, position);
  }

  /**
   * 対応中イベントの操作用snapshotを生成する。
   * @private
   * @returns {Object|null} 対応中イベント。対応していない場合はnull。
   */
  #createEventInteractionSnapshot() {
    if (this.#activeEventSession?.eventId !== PROTOTYPE_EVENT_IDS.STALL_TROUBLE) {
      return null;
    }
    const stall = this.#events[PROTOTYPE_EVENT_IDS.STALL_TROUBLE];
    return {
      eventId: PROTOTYPE_EVENT_IDS.STALL_TROUBLE,
      title: '屋台トラブル対応',
      situation: this.#getEventDescription(PROTOTYPE_EVENT_IDS.STALL_TROUBLE),
      progress: stall.responseProgress,
      requiredProgress: this.#getStallRequiredProgress(),
      actions: [
        {
          id: PROTOTYPE_EVENT_ACTION_IDS.MAGIC_SUPPORT,
          label: '魔法で屋台を支える',
          detail: `MP ${STALL_MAGIC_POWER_COST} / ${STALL_MAGIC_TIME_COST}分 / 進捗 +3`,
          enabled: this.#magicPower >= STALL_MAGIC_POWER_COST,
        },
        {
          id: PROTOTYPE_EVENT_ACTION_IDS.CALL_FOR_HELP,
          label: '周囲へ協力を頼む',
          detail: `${STALL_HELP_TIME_COST}分 / 進捗 +${stall.phase === STALL_TROUBLE_PHASES.MERGED ? 1 : 2}`,
          enabled: true,
        },
        {
          id: PROTOTYPE_EVENT_ACTION_IDS.CLEAR_CROWD,
          label: '人混みを整理する',
          detail: `${STALL_CROWD_TIME_COST}分 / 進捗 +1`,
          enabled: true,
        },
        {
          id: PROTOTYPE_EVENT_ACTION_IDS.LEAVE,
          label: '対応を中断する',
          detail: '進捗を維持して通常行動へ戻る',
          enabled: true,
        },
      ],
    };
  }

  /**
   * 現在地で操作できるイベントsnapshotを生成する。
   * @private
   * @returns {Array<Object>} 現在地イベント一覧。
   */
  #createCurrentEventSnapshots() {
    const snapshots = [];
    for (const eventId of Object.values(PROTOTYPE_EVENT_IDS)) {
      const event = this.#events[eventId];
      const activity = findPrototypeActivity(eventId);
      if (
        activity?.kind === PROTOTYPE_ACTIVITY_KINDS.SCHEDULED_EVENT
        ||
        event.status !== EVENT_STATUSES.ACTIVE
        || !this.#isPositionNearby(event.position)
        || !this.#isPositionVisible(event.position)
      ) {
        continue;
      }
      snapshots.push({
        id: eventId,
        title: this.#getEventTitle(eventId),
        description: this.#getEventDescription(eventId),
        actionLabel: this.#getEventActionLabel(eventId),
        canInteract: !(
          eventId === PROTOTYPE_EVENT_IDS.LOST_CHILD
          && event.step === 'find-parent'
          && !this.#isPositionNearby(event.parentPosition)
        ),
        status: event.status,
      });
    }
    return snapshots;
  }

  /**
   * 全エリアで進行中の速報snapshotを生成する。
   * @private
   * @returns {Array<Object>} イベント速報一覧。
   */
  #createQuickEventSnapshots() {
    const snapshots = [];
    for (const eventId of Object.values(PROTOTYPE_EVENT_IDS)) {
      const event = this.#events[eventId];
      if (event.status !== EVENT_STATUSES.ACTIVE) {
        continue;
      }
      snapshots.push({
        id: eventId,
        title: this.#getEventTitle(eventId),
        areaName: findArea(
          eventId === PROTOTYPE_EVENT_IDS.LOST_CHILD
            ? event.parentAreaId
            : event.areaId,
        ).name,
        endTimeLabel: formatGameTime(event.endMinutes),
      });
    }
    return snapshots;
  }

  /**
   * 判明済みイベントのスケジュールsnapshotを生成する。
   * @private
   * @returns {Array<Object>} 開始時刻順のスケジュール。
   */
  #createScheduleSnapshots() {
    const snapshots = [];
    for (const eventId of this.#knownEventIds) {
      const event = this.#events[eventId];
      snapshots.push({
        id: eventId,
        title: this.#getEventTitle(eventId),
        startMinutes: event.startMinutes,
        startTimeLabel: formatGameTime(event.startMinutes),
        endTimeLabel: formatGameTime(event.endMinutes),
        areaName: findArea(event.areaId).name,
        status: event.status,
      });
    }
    snapshots.sort(compareScheduleEntries);
    return snapshots;
  }

  /**
   * タスク一覧のsnapshotを生成する。
   * @private
   * @returns {Array<Object>} 未完了タスク一覧。
   */
  #createTaskSnapshots() {
    if (!this.#taskBatch) {
      return [];
    }
    const deadlineTimeLabel = formatGameTime(this.#taskBatch.deadlineMinutes);
    const patrol = this.#taskBatch.tasks[PROTOTYPE_TASK_IDS.PATROL];
    const completedPatrolPoints = patrol.checkpoints.filter((point) => point.isCompleted).length;
    const delivery = this.#taskBatch.tasks[PROTOTYPE_TASK_IDS.DELIVERY];
    const completedDeliverySteps = delivery.status === TASK_STATUSES.COMPLETED
      ? 2
      : delivery.step === 'destination' ? 1 : 0;
    const worldTreeCheck = this.#taskBatch.tasks[PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK];
    const completedWorldTreeSpots = worldTreeCheck.spots.filter((spot) => spot.isCompleted).length;
    return [
      this.#createTaskSnapshot(patrol, `${completedPatrolPoints} / ${patrol.checkpoints.length}`, '会場各地', deadlineTimeLabel),
      this.#createTaskSnapshot(delivery, `${completedDeliverySteps} / 2`, this.#getDeliveryAreaName(delivery), deadlineTimeLabel),
      this.#createTaskSnapshot(worldTreeCheck, `${completedWorldTreeSpots} / ${worldTreeCheck.spots.length}`, '世界樹前', deadlineTimeLabel),
    ];
  }

  /**
   * 1件の教師仕事を一覧表示用snapshotへ変換する。
   * @private
   * @param {Object} task - 教師仕事状態。
   * @param {string} progressLabel - 進捗表示。
   * @param {string} areaName - 現在の目的エリア名。
   * @param {string} deadlineTimeLabel - 共通期限表示。
   * @returns {Object} 教師仕事一覧項目。
   */
  #createTaskSnapshot(task, progressLabel, areaName, deadlineTimeLabel) {
    const isLate = task.status === TASK_STATUSES.ACTIVE
      && this.#elapsedMinutes > this.#taskBatch.deadlineMinutes;
    return {
      id: task.id,
      title: this.#getTaskTitle(task.id),
      areaName,
      status: task.status,
      progressLabel,
      deadlineTimeLabel,
      isLate,
      isTracked: task.id === this.#trackedTaskId,
      rewardPoints: task.status === TASK_STATUSES.COMPLETED
        ? task.rewardPoints
        : isLate
          ? Math.floor(TEACHER_TASK_REWARDS[task.id] / 2)
          : TEACHER_TASK_REWARDS[task.id],
    };
  }

  /**
   * 教師仕事一式の期限または次回支給状態を生成する。
   * @private
   * @returns {Object} 仕事一式snapshot。
   */
  #createTaskBatchSnapshot() {
    if (this.#taskBatch) {
      return {
        status: 'active',
        batchNumber: this.#taskBatch.batchNumber,
        deadlineTimeLabel: formatGameTime(this.#taskBatch.deadlineMinutes),
        nextBatchTimeLabel: null,
      };
    }
    const canIssueNext = this.#nextTaskBatchStartMinutes !== null
      && this.#nextTaskBatchStartMinutes < FESTIVAL_DURATION_MINUTES;
    return {
      status: canIssueNext ? 'waiting' : 'ended',
      batchNumber: null,
      deadlineTimeLabel: null,
      nextBatchTimeLabel: canIssueNext
        ? formatGameTime(this.#nextTaskBatchStartMinutes)
        : null,
    };
  }

  /**
   * 現在地でボタン操作できる教師仕事を生成する。
   * @private
   * @returns {Array<Object>} 操作可能な教師仕事一覧。
   */
  #createNearbyTaskSnapshots() {
    return this.#createMapTaskSnapshots()
      .filter((point) => (
        point.requiresInteraction
        && point.isNearby
        && this.#isPositionVisible(point.position)
      ))
      .map((point) => ({
        taskId: point.taskId,
        stepId: point.stepId,
        title: this.#getTaskTitle(point.taskId),
        description: point.title,
        actionLabel: point.taskId === PROTOTYPE_TASK_IDS.DELIVERY
          ? '配達を進める'
          : '周辺を確認する',
      }));
  }

  /**
   * 配達の現在段階に対応するエリア名を返す。
   * @private
   * @param {Object} delivery - 配達仕事状態。
   * @returns {string} 現在の目的エリア名。
   */
  #getDeliveryAreaName(delivery) {
    const point = delivery.step === 'pickup' ? delivery.pickup : delivery.destination;
    return findAreaByPosition(point.position).name;
  }

  /** 状況変化から最優先のカモ君通知を1件生成する。 */
  #refreshKamoNotice() {
    const candidates = [];
    for (const eventId of Object.values(PROTOTYPE_EVENT_IDS)) {
      const event = this.#events[eventId];
      const remainingMinutes = event.endMinutes - this.#elapsedMinutes;
      const key = `urgent:${this.#loopCount}:${eventId}`;
      if (
        event.status === EVENT_STATUSES.ACTIVE
        && remainingMinutes > 0
        && remainingMinutes <= 10
        && !this.#emittedKamoNoticeKeys.has(key)
      ) {
        candidates.push({
          key,
          type: 'urgent',
          priority: KAMO_NOTICE_PRIORITIES.URGENT,
          message: `兄貴、${this.#getEventTitle(eventId)}はあと${Math.ceil(remainingMinutes)}分ですぜ。`,
        });
      }
    }

    const happeningSnapshot = this.#happeningDirector.createSnapshot({
      playerPosition: this.#playerPosition,
    });
    for (const happening of happeningSnapshot.happenings) {
      const key = `nearby:${this.#loopCount}:${happening.id}`;
      if (
        getDistance(this.#playerPosition, happening.position) <= 7
        && !this.#emittedKamoNoticeKeys.has(key)
      ) {
        candidates.push({
          key,
          type: 'nearby',
          priority: KAMO_NOTICE_PRIORITIES.NEARBY,
          message: happening.isDiscovered
            ? `兄貴、この近くで「${happening.title}」が起きていますぜ。`
            : '兄貴、近くで急に歓声が上がりましたぜ。',
        });
      }
    }

    candidates.sort((left, right) => right.priority - left.priority);
    const candidate = candidates[0];
    if (!candidate) {
      return;
    }
    this.#emitKamoNotice(candidate.key, candidate.type, candidate.priority, candidate.message);
  }

  /** 一意な通知キーを構造化されたカモ君通知へ変換する。 */
  #emitKamoNotice(key, type, priority, message) {
    if (this.#emittedKamoNoticeKeys.has(key)) {
      return false;
    }
    this.#emittedKamoNoticeKeys.add(key);
    this.#kamoNoticeSequence += 1;
    this.#kamoNotice = {
      id: `${this.#loopCount}-${this.#kamoNoticeSequence}`,
      type,
      priority,
      message,
    };
    return true;
  }

  /**
   * 現在の状況で最も優先度が高いカモ君の助言を生成する。
   * @private
   * @returns {string} 助言本文。
   */
  #createKamoAdvice() {
    if (this.#elapsedMinutes >= FESTIVAL_DURATION_MINUTES) {
      return '兄貴、正午ですぜ。カシオペアで戻って別の回り方を試しましょう。';
    }
    const happeningSnapshot = this.#happeningDirector.createSnapshot({
      playerPosition: this.#playerPosition,
    });
    const unseenProximity = happeningSnapshot.happenings.find((happening) => (
      happening.source === 'proximity'
      && !happening.isDiscovered
      && getDistance(this.#playerPosition, happening.position) <= 7
    ));
    if (unseenProximity) {
      return '兄貴、近くで急に歓声が上がりましたぜ。曲がり角の先を見てみましょう。';
    }
    const visibleNearby = happeningSnapshot.nearbyHappenings.find((happening) => (
      this.#isPositionVisible(
        happeningSnapshot.happenings.find((entry) => entry.id === happening.id).position,
      )
    ));
    if (visibleNearby) {
      return `兄貴、この近くの「${visibleNearby.title}」が進路へ広がりそうですぜ。`;
    }
    const approachingFlow = happeningSnapshot.flows.find((flow) => (
      getDistance(this.#playerPosition, flow.to) <= EVENT_INTERACTION_RADIUS * 3
      && this.#isPositionVisible(flow.to)
    ));
    if (approachingFlow) {
      return '兄貴、こっちへ大勢の人が流れてきていますぜ。';
    }
    let urgentEvent = null;
    for (const eventId of Object.values(PROTOTYPE_EVENT_IDS)) {
      const event = this.#events[eventId];
      const remainingMinutes = event.endMinutes - this.#elapsedMinutes;
      if (event.status === EVENT_STATUSES.ACTIVE && remainingMinutes <= 10) {
        urgentEvent = { eventId, remainingMinutes, event };
        break;
      }
    }
    if (urgentEvent) {
      return `兄貴、${this.#getEventTitle(urgentEvent.eventId)}はあと${Math.ceil(urgentEvent.remainingMinutes)}分ですぜ。`;
    }
    const stall = this.#events[PROTOTYPE_EVENT_IDS.STALL_TROUBLE];
    if (stall.phase === STALL_TROUBLE_PHASES.MERGED && this.#isPositionVisible(stall.position)) {
      return 'デイビット広場で二つの騒ぎが合流していますぜ。';
    }
    if (stall.phase === STALL_TROUBLE_PHASES.SPREAD && this.#isPositionVisible(stall.position)) {
      return '屋台の騒ぎがデイビット広場まで広がりましたぜ。';
    }
    if (this.#knownEventIds.has(PROTOTYPE_EVENT_IDS.SECRET_EXHIBIT) && this.#elapsedMinutes < 45) {
      return 'AM10:45に体育館前で秘密の展示がありますぜ。';
    }
    const currentEvents = this.#createCurrentEventSnapshots();
    if (currentEvents.length > 0) {
      return `この近くで「${currentEvents[0].title}」が起きていますぜ。`;
    }
    const nearbyTasks = this.#createNearbyTaskSnapshots();
    if (nearbyTasks.length > 0) {
      return `兄貴、ここで「${nearbyTasks[0].description}」を進められますぜ。`;
    }
    return 'スケジュールと周囲の騒ぎを見比べて、次の行き先を決めましょうぜ。';
  }

  /**
   * イベントIDに対応する表示名を返す。
   * @private
   * @param {string} eventId - イベントID。
   * @returns {string} イベント表示名。
   */
  #getEventTitle(eventId) {
    const titles = {
      [PROTOTYPE_EVENT_IDS.OPENING_STAGE]: 'クラスメイトの開幕ステージ',
      [PROTOTYPE_EVENT_IDS.WORLD_TREE_STAGE]: '世界樹前の名物ステージ',
      [PROTOTYPE_EVENT_IDS.LOST_CHILD]: '迷子の親探し',
      [PROTOTYPE_EVENT_IDS.COSPLAY_PARADE]: 'コスプレパレード',
      [PROTOTYPE_EVENT_IDS.STALL_TROUBLE]: '屋台トラブル',
      [PROTOTYPE_EVENT_IDS.SECRET_EXHIBIT]: '秘密の展示',
    };
    return titles[eventId];
  }

  /**
   * イベントの現在状態を短い説明へ変換する。
   * @private
   * @param {string} eventId - イベントID。
   * @returns {string} 状態説明。
   */
  #getEventDescription(eventId) {
    if (eventId === PROTOTYPE_EVENT_IDS.LOST_CHILD) {
      const event = this.#events[eventId];
      if (event.step === 'find-child') {
        return '泣いている迷子を保護する。';
      }
      return this.#isPositionNearby(event.parentPosition)
        ? 'この近くにいる親を一緒に探す。'
        : `迷子と一緒に移動中。親は${findArea(event.parentAreaId).name}にいる。`;
    }
    if (eventId === PROTOTYPE_EVENT_IDS.STALL_TROUBLE) {
      const phaseLabels = {
        [STALL_TROUBLE_PHASES.SMALL]: '屋台で小さなトラブルが起きている。',
        [STALL_TROUBLE_PHASES.GROWN]: '人だかりが増えて騒ぎが大きくなった。',
        [STALL_TROUBLE_PHASES.SPREAD]: '騒ぎが別のエリアへ広がった。',
        [STALL_TROUBLE_PHASES.MERGED]: 'コスプレパレードと合流して大騒ぎになった。',
      };
      return phaseLabels[this.#events[eventId].phase];
    }
    const descriptions = {
      [PROTOTYPE_EVENT_IDS.OPENING_STAGE]: '麻帆良祭の開幕ステージを見る。',
      [PROTOTYPE_EVENT_IDS.WORLD_TREE_STAGE]: '世界樹前で行われる名物ステージを見る。',
      [PROTOTYPE_EVENT_IDS.COSPLAY_PARADE]: '突発のパレードへ参加する。',
      [PROTOTYPE_EVENT_IDS.SECRET_EXHIBIT]: '短時間だけ公開される展示を見る。',
    };
    return descriptions[eventId];
  }

  /**
   * イベント操作ボタンの表示名を返す。
   * @private
   * @param {string} eventId - イベントID。
   * @returns {string} 操作表示名。
   */
  #getEventActionLabel(eventId) {
    const labels = {
      [PROTOTYPE_EVENT_IDS.OPENING_STAGE]: '見る',
      [PROTOTYPE_EVENT_IDS.WORLD_TREE_STAGE]: '見る',
      [PROTOTYPE_EVENT_IDS.LOST_CHILD]: '手伝う',
      [PROTOTYPE_EVENT_IDS.COSPLAY_PARADE]: '参加する',
      [PROTOTYPE_EVENT_IDS.STALL_TROUBLE]: '対応する',
      [PROTOTYPE_EVENT_IDS.SECRET_EXHIBIT]: '見学する',
    };
    return labels[eventId];
  }

  /**
   * 教師仕事IDに対応する表示名を返す。
   * @private
   * @param {string} taskId - 教師仕事ID。
   * @returns {string} 教師仕事表示名。
   */
  #getTaskTitle(taskId) {
    const titles = {
      [PROTOTYPE_TASK_IDS.PATROL]: '教師の見回り',
      [PROTOTYPE_TASK_IDS.DELIVERY]: '物資配達',
      [PROTOTYPE_TASK_IDS.WORLD_TREE_CHECK]: '世界樹周辺の確認',
    };
    return titles[taskId];
  }

  /**
   * 行動ログへ1行を追加し、表示件数を制限する。
   * @private
   * @param {string} message - 追加するメッセージ。
   * @returns {void}
   */
  #addLog(message) {
    this.#log.push(message);
    if (this.#log.length > 5) {
      this.#log.shift();
    }
  }
}

export {
  CASSIOPEIA_MP_PER_GAME_HOUR,
  EVENT_INTERACTION_RADIUS,
  EVENT_STATUSES,
  FESTIVAL_DURATION_MINUTES,
  GAME_MINUTES_PER_REAL_SECOND,
  MAX_MAGIC_POWER,
  PLAYER_MOVEMENT_SPEED_CELLS_PER_SECOND,
  PROTOTYPE_AREA_IDS,
  PROTOTYPE_EVENT_ACTION_IDS,
  PROTOTYPE_EVENT_IDS,
  PROTOTYPE_INPUT_TYPES,
  PROTOTYPE_PAUSE_TABS,
  PROTOTYPE_MAP_SIZE,
  PROTOTYPE_SCENE_ID,
  PROTOTYPE_TASK_IDS,
  STALL_TROUBLE_PHASES,
  TASK_STATUSES,
  TEACHER_TASK_PATTERNS,
  TEACHER_TASK_REFRESH_DELAY_MINUTES,
  TEACHER_TASK_SOFT_DEADLINE_MINUTES,
  PrototypeFestivalScene,
};
