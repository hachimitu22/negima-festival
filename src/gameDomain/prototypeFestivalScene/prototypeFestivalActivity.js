/** プロトタイプで扱う予定行動の種類。 */
const PROTOTYPE_ACTIVITY_KINDS = Object.freeze({
  SCHEDULED_EVENT: 'scheduled-event',
  STALL: 'stall',
  TASK: 'task',
});

/** 主目的を選ぶ動機の種類。 */
const PROTOTYPE_GOAL_MOTIVATIONS = Object.freeze({
  CLASSMATE: 'classmate',
  FAMOUS: 'famous',
  TEACHER: 'teacher',
});

/** プロトタイプで扱う予定行動ID。 */
const PROTOTYPE_ACTIVITY_IDS = Object.freeze({
  OPENING_STAGE: 'opening-stage',
  WORLD_TREE_STAGE: 'world-tree-stage',
  SECRET_EXHIBIT: 'secret-exhibit',
  FOOD_STALL: 'food-stall',
  SOUVENIR_STALL: 'souvenir-stall',
});

/** 定時イベントの通常受付猶予分数。 */
const PROTOTYPE_ACTIVITY_GRACE_MINUTES = 5;

/** 定時イベントと営業時間付き出店の定義。 */
const PROTOTYPE_ACTIVITY_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE,
    kind: PROTOTYPE_ACTIVITY_KINDS.SCHEDULED_EVENT,
    title: 'クラスメイトの開幕ステージ',
    areaId: 'david-plaza',
    position: Object.freeze({ x: 24, y: 5 }),
    startMinutes: 20,
    endMinutes: 35,
    durationMinutes: 9,
    partialDurationMinutes: 4,
    stepMinutes: 3,
    isPrimaryGoal: true,
    motivationKind: PROTOTYPE_GOAL_MOTIVATIONS.CLASSMATE,
    motivationLabel: 'クラスメイトの出し物',
    landmarkId: 'david-plaza',
  }),
  Object.freeze({
    id: PROTOTYPE_ACTIVITY_IDS.WORLD_TREE_STAGE,
    kind: PROTOTYPE_ACTIVITY_KINDS.SCHEDULED_EVENT,
    title: '世界樹前の名物ステージ',
    areaId: 'world-tree-front',
    position: Object.freeze({ x: 24, y: 29 }),
    startMinutes: 30,
    endMinutes: 50,
    durationMinutes: 10,
    partialDurationMinutes: 5,
    stepMinutes: 5,
    isPrimaryGoal: true,
    motivationKind: PROTOTYPE_GOAL_MOTIVATIONS.FAMOUS,
    motivationLabel: '麻帆良祭の有名な催し',
    landmarkId: 'world-tree-front',
  }),
  Object.freeze({
    id: PROTOTYPE_ACTIVITY_IDS.SECRET_EXHIBIT,
    kind: PROTOTYPE_ACTIVITY_KINDS.SCHEDULED_EVENT,
    title: '秘密の展示',
    areaId: 'gym-front',
    position: Object.freeze({ x: 11, y: 20 }),
    startMinutes: 45,
    endMinutes: 60,
    durationMinutes: 10,
    partialDurationMinutes: 5,
    stepMinutes: 5,
    isPrimaryGoal: false,
  }),
  Object.freeze({
    id: PROTOTYPE_ACTIVITY_IDS.FOOD_STALL,
    kind: PROTOTYPE_ACTIVITY_KINDS.STALL,
    title: '屋台通りの軽食屋台',
    areaId: 'food-street',
    position: Object.freeze({ x: 7, y: 6 }),
    startMinutes: 0,
    endMinutes: 90,
    durationMinutes: 5,
    partialDurationMinutes: 5,
    stepMinutes: 2,
    isPrimaryGoal: false,
  }),
  Object.freeze({
    id: PROTOTYPE_ACTIVITY_IDS.SOUVENIR_STALL,
    kind: PROTOTYPE_ACTIVITY_KINDS.STALL,
    title: '世界樹前の記念品店',
    areaId: 'world-tree-front',
    position: Object.freeze({ x: 29, y: 29 }),
    startMinutes: 30,
    endMinutes: 120,
    durationMinutes: 5,
    partialDurationMinutes: 5,
    stepMinutes: 2,
    isPrimaryGoal: false,
  }),
]);

/** IDに対応する予定行動定義を返す。 */
function findPrototypeActivity(activityId) {
  return PROTOTYPE_ACTIVITY_DEFINITIONS.find((activity) => activity.id === activityId) ?? null;
}

/** 現在時刻における予定行動の受付状態を返す。 */
function getPrototypeActivityAvailability(activity, elapsedMinutes) {
  if (elapsedMinutes < activity.startMinutes) {
    return 'upcoming';
  }
  if (elapsedMinutes >= activity.endMinutes) {
    return 'closed';
  }
  if (
    activity.kind === PROTOTYPE_ACTIVITY_KINDS.SCHEDULED_EVENT
    && elapsedMinutes > activity.startMinutes + PROTOTYPE_ACTIVITY_GRACE_MINUTES
  ) {
    return 'partial';
  }
  return 'open';
}

/** 受付状態から予定行動を開始できるか判定する。 */
function canStartPrototypeActivity(availability) {
  return availability === 'open' || availability === 'partial';
}

export {
  PROTOTYPE_ACTIVITY_DEFINITIONS,
  PROTOTYPE_ACTIVITY_GRACE_MINUTES,
  PROTOTYPE_ACTIVITY_IDS,
  PROTOTYPE_ACTIVITY_KINDS,
  PROTOTYPE_GOAL_MOTIVATIONS,
  canStartPrototypeActivity,
  findPrototypeActivity,
  getPrototypeActivityAvailability,
};
