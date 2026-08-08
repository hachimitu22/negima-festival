/** 原作導入プロトタイプのシーンID。 */
const CANONICAL_SCENE_ID = 'canonical-festival-prototype';

/** 原作導入プロトタイプで受け付ける入力種別。 */
const CANONICAL_INPUT_TYPES = Object.freeze({
  MOVEMENT_SET: 'canonical.movement.set',
  STORY_ADVANCE: 'canonical.story.advance',
  CHOICE_SELECT: 'canonical.choice.select',
  INTERACT: 'canonical.interact',
  ROUTE_RESTART: 'canonical.route.restart',
  MAIN_EVENT_SET: 'canonical.mainEvent.set',
  MAIN_EVENT_CLEAR: 'canonical.mainEvent.clear',
  DESTINATION_SELECT: 'canonical.destination.select',
  LOCATION_ACTION_SELECT: 'canonical.locationAction.select',
  INTERRUPTION_SELECT: 'canonical.interruption.select',
  WAIT_UNTIL: 'canonical.waitUntil',
  CASSIOPEIA_REWIND: 'canonical.cassiopeia.rewind',
  TUTORIAL_SKIP: 'canonical.tutorial.skip',
  SAVE_GAME: 'canonical.save.game',
  LOAD_GAME: 'canonical.load.game',
});

/** Current prototype save-data schema version. */
const CANONICAL_SAVE_DATA_VERSION = 1;
/** Browser storage key for the currently selected prototype slot. */
const CANONICAL_SAVE_STORAGE_KEY = 'negima-festival-canonical-prototype-current';

/** Main event identifiers used by the canonical prototype. */
const CANONICAL_MAIN_EVENT_IDS = Object.freeze({
  CHAO_SEARCH: 'chao-search',
  NODOKA_DATE_PREPARE: 'nodoka-date-prepare',
  NODOKA_DATE: 'nodoka-date',
});

/** Canonical prototype event definitions. */
const CANONICAL_EVENT_DEFINITIONS = Object.freeze([
  Object.freeze({ id: 'haunted-house', label: '3-Aホラーハウス', type: 'episode' }),
  Object.freeze({ id: 'chao-search', label: 'チャオ探索', type: 'episode' }),
  Object.freeze({ id: 'nodoka-date-prepare', label: 'のどかデート準備', type: 'episode' }),
  Object.freeze({ id: 'nodoka-date', label: 'のどかとのデート', type: 'episode' }),
  Object.freeze({ id: 'mahora-budokai', label: 'まほら武道会', type: 'episode' }),
  Object.freeze({ id: 'classmate-attraction-tour', label: 'クラスメイト出し物巡り', type: 'episode' }),
  Object.freeze({ id: 'ayaka-attraction-tour', label: '小太郎・あやかとの出し物巡り', type: 'episode' }),
  Object.freeze({ id: 'yue-festival-tour', label: '夕映との麻帆良祭巡り', type: 'episode' }),
]);

/** クラスメイトの好感度の初期値。 */
const CLASSMATE_AFFECTION_INITIAL = 0;

/** クラスメイトの好感度の最大値。 */
const CLASSMATE_AFFECTION_MAX = 100;

/** のどかとのキスシーンへ進む好感度の閾値。 */
const NODOKA_AFFECTION_KISS_THRESHOLD = 60;

/** のどかデートのキスルートへ進む準備評価値の閾値。 */
const NODOKA_DATE_KISS_EVALUATION_THRESHOLD = 4;

/** のどかデートで選択できる服装と評価補正。 */
const DATE_OUTFITS = Object.freeze({
  SUIT: Object.freeze({ id: 'suit', label: '背広', modifier: 0 }),
  CASUAL: Object.freeze({ id: 'casual', label: 'カジュアルな服', modifier: 1 }),
  CHUNIBYO: Object.freeze({ id: 'chunibyo', label: '厨二病な服', modifier: -1 }),
});

/** のどかデート準備で得られる最大評価値。 */
const NODOKA_DATE_PREPARATION_SCORE_MAX = 5;

/** クラスメイトとの会話1回で増える好感度。 */
const CLASSMATE_AFFECTION_PER_CONVERSATION = 10;

/** 原作導入プロトタイプの進行段階ID。 */
const CANONICAL_PHASE_IDS = Object.freeze({
  PROLOGUE: 'prologue',
  OPENING: 'opening',
  MOVE_TO_3A: 'move-to-3a',
  SELECT_HAUNTED_DIFFICULTY: 'select-haunted-difficulty',
  HAUNTED_HOUSE: 'haunted-house',
  HAUNTED_HOUSE_PANIC_RUN: 'haunted-house-panic-run',
  HAUNTED_HOUSE_RESULT: 'haunted-house-result',
  MOVE_TO_HEALTH_ROOM: 'move-to-health-room',
  SLEEP: 'sleep',
  REWIND: 'rewind',
  MOVE_TO_CAFE: 'move-to-cafe',
  CAFE: 'cafe',
  FOLLOW_NODOKA: 'follow-nodoka',
  HIDE_FROM_NODOKA: 'hide-from-nodoka',
  TIME_TRAVEL_CONFIRMED: 'time-travel-confirmed',
  EVA_ESCAPE: 'eva-escape',
  FREE_EXPLORE: 'free-explore',
  INTERRUPTION: 'interruption',
  LOCATION_ACTIONS: 'location-actions',
  LOCATION_ACTION_RESULT: 'location-action-result',
  CLASSMATE_CONVERSATION: 'classmate-conversation',
  SEARCH_CHAO: 'search-chao',
  CHAO_ATTRACTION: 'chao-attraction',
  AIRSHIP_OVERVIEW: 'airship-overview',
  MEET_CHAO: 'meet-chao',
  REVIEW_SCHEDULE: 'review-schedule',
  PREPARE_DATE: 'prepare-date',
  PREPARE_DATE_OUTFIT: 'prepare-date-outfit',
  NODOKA_DATE_PREPARE_FINISH: 'date-finish',
  NODOKA_DATE: 'nodoka-date',
  NODOKA_DATE_NORMAL: 'nodoka-date-normal',
  // Keep the legacy name as an alias for the normal ending phase.
  NODOKA_DATE_END: 'nodoka-date-normal',
  NODOKA_DATE_KISS: 'nodoka-date-kiss',
  ESCAPE_PATROL_STUDENTS: 'escape-patrol-students',
  WORLD_TREE_MAGIC: 'world-tree-magic',
  RETURN_TO_THIRD_LOOP: 'return-to-third-loop',
  THIRD_LOOP_PATROL: 'third-loop-patrol',
  THIRD_LOOP_CAFE: 'third-loop-cafe',
  THIRD_LOOP_BOAT: 'third-loop-boat',
  THIRD_LOOP_DINNER: 'third-loop-dinner',
  TOURNAMENT_KOTARO: 'tournament-kotaro',
  TOURNAMENT_RECEPTION: 'tournament-reception',
  TOURNAMENT_VENUE: 'tournament-venue',
  TOURNAMENT_QUALIFIER: 'tournament-qualifier',
  TOURNAMENT_RESULT: 'tournament-result',
  DAY1_DEBRIEF: 'day1-debrief',
  REWIND_TO_FOURTH_LOOP: 'rewind-to-fourth-loop',
  FOURTH_LOOP_HAUNTED_RETURN: 'fourth-loop-haunted-return',
  CLASSMATE_ATTRACTION_TOUR: 'classmate-attraction-tour',
  KOTARO_AYAKA_ATTRACTION_TOUR: 'kotaro-ayaka-attraction-tour',
  YUE_FESTIVAL_TOUR: 'yue-festival-tour',
  FESTIVAL_ENDING: 'festival-ending',
  GAME_OVER: 'game-over',
  COMPLETE: 'complete',
});

/** Phase IDs that belong to the tutorial sequence. */
const CANONICAL_TUTORIAL_PHASE_IDS = Object.freeze([
  CANONICAL_PHASE_IDS.PROLOGUE,
  CANONICAL_PHASE_IDS.OPENING,
  CANONICAL_PHASE_IDS.MOVE_TO_3A,
  CANONICAL_PHASE_IDS.SELECT_HAUNTED_DIFFICULTY,
  CANONICAL_PHASE_IDS.HAUNTED_HOUSE,
  CANONICAL_PHASE_IDS.HAUNTED_HOUSE_PANIC_RUN,
  CANONICAL_PHASE_IDS.HAUNTED_HOUSE_RESULT,
  CANONICAL_PHASE_IDS.MOVE_TO_HEALTH_ROOM,
  CANONICAL_PHASE_IDS.SLEEP,
  CANONICAL_PHASE_IDS.REWIND,
  CANONICAL_PHASE_IDS.MOVE_TO_CAFE,
  CANONICAL_PHASE_IDS.CAFE,
  CANONICAL_PHASE_IDS.FOLLOW_NODOKA,
  CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA,
  CANONICAL_PHASE_IDS.TIME_TRAVEL_CONFIRMED,
  CANONICAL_PHASE_IDS.EVA_ESCAPE,
  CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
  CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT,
  CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION,
  CANONICAL_PHASE_IDS.SEARCH_CHAO,
  CANONICAL_PHASE_IDS.CHAO_ATTRACTION,
  CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW,
  CANONICAL_PHASE_IDS.MEET_CHAO,
  CANONICAL_PHASE_IDS.REVIEW_SCHEDULE,
]);

/** 学園マップの一辺の長さ。 */
const CANONICAL_SCHOOL_MAP_SIZE = 32;

/** お化け屋敷マップの一辺の長さ。 */
const CANONICAL_HAUNTED_MAP_SIZE = 12;

/** ネギの移動速度。 */
const CANONICAL_PLAYER_SPEED_CELLS_PER_SECOND = 4;

/** エヴァの追跡速度。 */
const CANONICAL_EVA_SPEED_CELLS_PER_SECOND = 3.6;

/** ネギの当たり判定半径。 */
const CANONICAL_PLAYER_RADIUS = 0.3;

/** 1回の衝突判定で進める最大距離。 */
const CANONICAL_MOVEMENT_STEP = 0.2;

/** 目的地到達と演出地点接近を成立させる距離。 */
const CANONICAL_COMPLETION_RADIUS = 0.8;

/** チャオ探索中に話す、調べる操作が届く距離。 */
const CHAO_SEARCH_INTERACT_DISTANCE = 2.5;

/** のどか尾行で近すぎる距離。 */
const NODOKA_TOO_CLOSE_DISTANCE = 3;

/** のどか尾行で遠すぎる距離。 */
const NODOKA_TOO_FAR_DISTANCE = 8;

/** のどか尾行で近すぎ失敗になる秒数。 */
const NODOKA_TOO_CLOSE_LIMIT_SECONDS = 1;

/** のどか尾行で遠すぎ失敗になる秒数。 */
const NODOKA_TOO_FAR_LIMIT_SECONDS = 2;

/** のどかが振り返るまでの予兆秒数。 */
const NODOKA_HIDE_WARNING_SECONDS = 3;

/** エヴァ追跡開始までの先行秒数。 */
const EVA_HEAD_START_SECONDS = 2;

/** エヴァに捕まる距離。 */
const EVA_CAPTURE_DISTANCE = 1;

/** 同行者がネギの経路上で遅れてついてくる距離。 */
const COMPANION_FOLLOW_DISTANCE = 1.4;

/** ネギの移動履歴へ座標を追加する最小距離。 */
const PLAYER_TRAIL_MIN_DISTANCE = 0.15;

/** ネギの移動履歴として保持する最大件数。 */
const PLAYER_TRAIL_MAX_LENGTH = 160;

/** 初回カシオペア起動の固定MP消費。 */
const CASSIOPEIA_MP_PER_FIVE_MINUTES = 1;
const INITIAL_CASSIOPEIA_REWIND_MINUTES = (20 * 60) - (9 * 60 + 55);
const INITIAL_CASSIOPEIA_MP_COST = Math.ceil(
  INITIAL_CASSIOPEIA_REWIND_MINUTES / 5,
) * CASSIOPEIA_MP_PER_FIVE_MINUTES;

/** カシオペアで戻れる最小時刻（1日目AM10:00）。 */
const CASSIOPEIA_MINUTE = 10 * 60;

/** Library Island dungeon final floor. */
const LIBRARY_DUNGEON_FINAL_FLOOR = 10;

/** Prototype Ver2 time limit in minutes from midnight. */
const PROTOTYPE_TIME_LIMIT_MINUTE = (23 * 60) + 30;

/** Minutes advanced by one Library Island exploration choice. */
const LIBRARY_DUNGEON_STEP_MINUTES = 5;

/** Maximum random MP cost for a Library Island trap or barrier. */
const LIBRARY_DUNGEON_MAX_EVENT_MP_COST = 5;

/** MPの最大値。 */
const MAGIC_POWER_MAX = 300;

/** ゲーム内時間5分あたりのMP回復量。 */
const MAGIC_POWER_RECOVERY_PER_FIVE_MINUTES = 2;

/** 原作導入プロトタイプの固定時刻。 */
const CANONICAL_TIMES = Object.freeze({
  FESTIVAL_START: Object.freeze({ festivalDay: 1, loopCount: 1, hour: 10, minute: 0, label: 'AM10:00' }),
  AFTER_HAUNTED: Object.freeze({ festivalDay: 1, loopCount: 1, hour: 11, minute: 0, label: 'AM11:00' }),
  OVERSLEPT: Object.freeze({ festivalDay: 1, loopCount: 1, hour: 20, minute: 0, label: 'PM8:00' }),
  REWOUND: Object.freeze({ festivalDay: 1, loopCount: 2, hour: 9, minute: 55, label: 'AM09:55' }),
  SECOND_OPENING: Object.freeze({ festivalDay: 1, loopCount: 2, hour: 10, minute: 0, label: 'AM10:00' }),
  CHAO_SEARCH: Object.freeze({ festivalDay: 1, loopCount: 2, hour: 10, minute: 10, label: 'AM10:10' }),
  SCHEDULE_REVIEW: Object.freeze({ festivalDay: 1, loopCount: 2, hour: 11, minute: 30, label: 'AM11:30' }),
  PARADE_END: Object.freeze({ festivalDay: 1, loopCount: 2, hour: 12, minute: 0, label: 'PM12:00' }),
  NODOKA_DATE: Object.freeze({ festivalDay: 1, loopCount: 2, hour: 16, minute: 0, label: 'PM4:00' }),
  NODOKA_DATE_START_END: Object.freeze({ festivalDay: 1, loopCount: 2, hour: 16, minute: 30, label: 'PM4:30' }),
  NODOKA_DATE_END: Object.freeze({ festivalDay: 1, loopCount: 2, hour: 17, minute: 30, label: 'PM5:30' }),
  NODOKA_DATE_EXTENDED_END: Object.freeze({ festivalDay: 1, loopCount: 2, hour: 20, minute: 0, label: 'PM8:00' }),
  THIRD_LOOP_AFTER_RETURN: Object.freeze({ festivalDay: 1, loopCount: 3, hour: 15, minute: 0, label: 'PM3:00' }),
  THIRD_LOOP_YUE: Object.freeze({ festivalDay: 1, loopCount: 3, hour: 16, minute: 0, label: 'PM4:00' }),
  THIRD_LOOP_DINNER: Object.freeze({ festivalDay: 1, loopCount: 3, hour: 17, minute: 0, label: 'PM5:00' }),
  THIRD_LOOP_TOURNAMENT_START: Object.freeze({ festivalDay: 1, loopCount: 3, hour: 17, minute: 30, label: 'PM5:30' }),
  THIRD_LOOP_TOURNAMENT_END: Object.freeze({ festivalDay: 1, loopCount: 3, hour: 19, minute: 0, label: 'PM7:00' }),
  THIRD_LOOP_DEBRIEF: Object.freeze({ festivalDay: 1, loopCount: 3, hour: 21, minute: 0, label: 'PM9:00' }),
  FOURTH_LOOP_ATTRACTIONS: Object.freeze({ festivalDay: 1, loopCount: 4, hour: 11, minute: 30, label: 'AM11:30' }),
  FOURTH_LOOP_HAUNTED_HELP_END: Object.freeze({ festivalDay: 1, loopCount: 4, hour: 12, minute: 0, label: 'PM12:00' }),
  FOURTH_LOOP_AYAKA_TOUR_END: Object.freeze({ festivalDay: 1, loopCount: 4, hour: 18, minute: 0, label: 'PM6:00' }),
  YUE_FESTIVAL_TOUR_START: Object.freeze({ festivalDay: 1, hour: 16, minute: 30, label: 'PM4:30' }),
  YUE_FESTIVAL_TOUR_END: Object.freeze({ festivalDay: 1, hour: 18, minute: 0, label: 'PM6:00' }),
});

/** 麻帆良祭終了後に表示する固定演出。 */
const FESTIVAL_ENDING_DIALOGUES = Object.freeze([
  Object.freeze({ speaker: '麻帆良祭放送', text: 'これをもちまして、3日間にわたる麻帆良祭を終了します。' }),
  Object.freeze({ speaker: 'ネギ', text: '祭りが終わりました。でも、何か大きな魔力を感じます……。' }),
  Object.freeze({ speaker: 'カモ', text: '兄貴、チャオの計画が動き始めたみたいですぜ！' }),
]);

/** 麻帆良祭中に放送される通知の定義。 */
const FESTIVAL_NOTIFICATION_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'mahora-budokai-delay',
    triggerMinute: 17 * 60,
    speaker: '麻帆良祭放送',
    text: 'まほら武道会の開始時刻が延期されています。開始時刻と終了時刻は現在不明です。',
  }),
]);

/** 原作導入プロトタイプの学園ランドマーク。 */
const SCHOOL_LANDMARKS = Object.freeze([
  Object.freeze({ id: 'entrance-gate', name: '入場門', position: Object.freeze({ x: 16, y: 3 }) }),
  Object.freeze({ id: 'class-3a', name: '3-A', position: Object.freeze({ x: 6, y: 7 }) }),
  Object.freeze({ id: 'health-room', name: '保健室', position: Object.freeze({ x: 25, y: 6 }) }),
  Object.freeze({ id: 'cafe', name: 'カフェ', position: Object.freeze({ x: 24, y: 24 }) }),
  Object.freeze({ id: 'past-negis', name: '過去ネギたち', position: Object.freeze({ x: 8, y: 24 }) }),
  Object.freeze({ id: 'cover', name: '物陰', position: Object.freeze({ x: 15, y: 23 }) }),
  Object.freeze({ id: 'escape', name: '逃走地点', position: Object.freeze({ x: 29, y: 12 }) }),
]);

/** 学園マップの通過不能矩形。 */
const SCHOOL_OBSTACLES = Object.freeze([
  Object.freeze({ id: 'north-building', type: 'building', x: 2, y: 1, width: 7, height: 3 }),
  Object.freeze({ id: 'west-class-wing', type: 'building', x: 2, y: 9, width: 6, height: 8 }),
  Object.freeze({ id: 'central-yard', type: 'fence', x: 11, y: 10, width: 3, height: 11 }),
  Object.freeze({ id: 'east-wing', type: 'building', x: 21, y: 9, width: 7, height: 5 }),
  Object.freeze({ id: 'south-stalls', type: 'stall', x: 3, y: 26, width: 10, height: 3 }),
  Object.freeze({ id: 'cafe-counter', type: 'stall', x: 21, y: 26, width: 6, height: 3 }),
  Object.freeze({ id: 'hide-cover', type: 'cover', x: 14, y: 21.5, width: 2, height: 3 }),
]);

/** お化け屋敷マップの通過不能矩形。 */
const HAUNTED_OBSTACLES = Object.freeze([
  Object.freeze({ id: 'north-wall', type: 'wall', x: 0, y: 0, width: 12, height: 1 }),
  Object.freeze({ id: 'west-wall', type: 'wall', x: 0, y: 0, width: 1, height: 12 }),
  Object.freeze({ id: 'east-wall', type: 'wall', x: 11, y: 0, width: 1, height: 12 }),
  Object.freeze({ id: 'south-wall-left', type: 'wall', x: 0, y: 11, width: 2, height: 1 }),
  Object.freeze({ id: 'south-wall-middle', type: 'wall', x: 3, y: 11, width: 6, height: 1 }),
  Object.freeze({ id: 'south-wall-right', type: 'wall', x: 10, y: 11, width: 2, height: 1 }),
  Object.freeze({ id: 'left-screen', type: 'wall', x: 4, y: 3, width: 1, height: 8 }),
  Object.freeze({ id: 'middle-screen', type: 'wall', x: 7, y: 1, width: 1, height: 8 }),
  Object.freeze({ id: 'right-dark-area', type: 'wall', x: 8, y: 1, width: 3, height: 8 }),
]);

/** お化け屋敷で順番に発生する演出地点。 */
const HAUNTED_SCARE_POINTS = Object.freeze([
  Object.freeze({ id: 'portrait', title: '肖像画が動く', position: Object.freeze({ x: 2.5, y: 7.5 }) }),
  Object.freeze({ id: 'voice', title: '暗闇から声がする', position: Object.freeze({ x: 5.5, y: 2 }) }),
  Object.freeze({ id: 'ghost', title: '白い影が横切る', position: Object.freeze({ x: 9.5, y: 10 }) }),
]);

/** 3-Aホラーハウスの難易度ID。 */
const HAUNTED_DIFFICULTY_IDS = Object.freeze({
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
});

/** ホラーハウスのパニックメーター最大値。 */
const HAUNTED_PANIC_MAX = 100;

/** ホラーハウスで停止中に1秒あたり減少するパニック量。 */
const HAUNTED_PANIC_RECOVERY_PER_SECOND = 8;

/** 3-Aホラーハウス難易度ごとの設定。 */
const HAUNTED_DIFFICULTIES = Object.freeze({
  [HAUNTED_DIFFICULTY_IDS.EASY]: Object.freeze({
    id: HAUNTED_DIFFICULTY_IDS.EASY,
    label: '簡単',
    viewRadius: 5,
    panicIncrease: 15,
    scareCount: 2,
    isRecommended: false,
  }),
  [HAUNTED_DIFFICULTY_IDS.NORMAL]: Object.freeze({
    id: HAUNTED_DIFFICULTY_IDS.NORMAL,
    label: '普通',
    viewRadius: 3.5,
    panicIncrease: 25,
    scareCount: 3,
    isRecommended: false,
  }),
  [HAUNTED_DIFFICULTY_IDS.HARD]: Object.freeze({
    id: HAUNTED_DIFFICULTY_IDS.HARD,
    label: '難しい',
    viewRadius: 2.5,
    panicIncrease: 40,
    scareCount: 3,
    isRecommended: true,
  }),
});

/** チャオ探索で体験するアトラクション。 */
const CHAO_ATTRACTIONS = Object.freeze([
  Object.freeze({
    id: 'roller-coaster',
    label: 'ジェットコースター',
    description: '学園を駆け抜ける乗り物からチャオの姿を探す。',
  }),
  Object.freeze({
    id: 'gun-shooting',
    label: 'ガンシューティング',
    description: '的を撃ちながらチャオの手掛かりを探す。',
  }),
]);

/** チャオ探索で必ず進む地点の順番。 */
const CHAO_SEARCH_ROUTE = Object.freeze([
  'roller-coaster',
  'gun-shooting',
  'airship',
]);

/** チャオ探索でチャオが出現し得る候補地点。 */
const CHAO_SEARCH_LOCATIONS = Object.freeze([
  Object.freeze({
    id: 'gun-shooting',
    label: 'ガンシューティング',
    kind: 'attraction',
    areaId: 'ground',
    position: Object.freeze({ x: 18, y: 7 }),
    clueTags: Object.freeze(['北東', 'アトラクション', '射的']),
    missText: '射的の賑わいはあるが、チャオの姿は見当たらない。',
  }),
  Object.freeze({
    id: 'roller-coaster',
    label: 'ジェットコースター',
    kind: 'attraction',
    areaId: 'ground',
    position: Object.freeze({ x: 29, y: 7 }),
    clueTags: Object.freeze(['東', 'アトラクション', '乗り物']),
    missText: '乗り場を見回したが、チャオは別の場所へ移動したようだ。',
  }),
  Object.freeze({
    id: 'airship',
    label: '飛行船乗り場',
    kind: 'airship',
    areaId: 'club-building',
    position: Object.freeze({ x: 26, y: 5 }),
    clueTags: Object.freeze(['北東', '空', '乗り物']),
    missText: '空から学園を見渡せるが、ここにチャオはいない。',
  }),
  Object.freeze({
    id: 'school-exhibit',
    label: '校舎側展示',
    kind: 'facility',
    areaId: 'hall',
    position: Object.freeze({ x: 10, y: 7 }),
    clueTags: Object.freeze(['北西', '校舎', '展示']),
    missText: '校舎側の展示を確認したが、チャオにつながる決定打はない。',
  }),
  Object.freeze({
    id: 'stall-street',
    label: '屋台通り',
    kind: 'facility',
    areaId: 'stall-street',
    position: Object.freeze({ x: 16, y: 27 }),
    clueTags: Object.freeze(['南', '屋台', '人混み']),
    missText: '屋台通りは人で溢れているが、チャオの姿はない。',
  }),
]);

/** デート前自由時間で調べられる地点。 */
const PREPARE_DATE_SPOTS = Object.freeze([
  Object.freeze({
    id: 'date-prep',
    label: 'デート準備',
    areaId: 'stall-street',
    position: Object.freeze({ x: 20, y: 13 }),
    completedKey: 'hasPrepared',
    scoreValue: 1,
    text: '屋台通りで、のどかとの待ち合わせに向けた準備を整えた。',
  }),
  Object.freeze({
    id: 'date-gift',
    label: 'のどかへの贈り物を選ぶ',
    areaId: 'stall-street',
    position: Object.freeze({ x: 20, y: 13 }),
    completedKey: 'hasGift',
    scoreValue: 1,
    text: '屋台を見て回り、のどかに渡す贈り物を選んだ。',
  }),
  Object.freeze({
    id: 'date-topic',
    label: 'デートの話題を考える',
    areaId: 'hall',
    position: Object.freeze({ x: 10, y: 14 }),
    completedKey: 'hasTopic',
    scoreValue: 1,
    text: 'ホールの賑わいを眺めながら、のどかと話す内容を考えた。',
  }),
]);

/** デート前自由時間で話しかけられる木乃香。 */
const PREPARE_DATE_KONOKA = Object.freeze({
  id: 'konoka',
  name: '木乃香',
  areaId: 'stall-street',
  position: Object.freeze({ x: 16, y: 27 }),
});

/** チャオ探索中に聞き込みできる人物。 */
const CHAO_HINT_ACTORS = Object.freeze([
  Object.freeze({ id: 'yuue', name: '夕映', position: Object.freeze({ x: 16, y: 6 }), areaId: 'entrance-gate', focus: 'facility' }),
  Object.freeze({ id: 'nodoka', name: 'のどか', position: Object.freeze({ x: 20, y: 22 }), areaId: 'dining-street', focus: 'direction' }),
  Object.freeze({ id: 'hakase', name: '葉加瀬', position: Object.freeze({ x: 9, y: 7 }), areaId: 'hall', focus: 'facility' }),
  Object.freeze({ id: 'chachamaru', name: '茶々丸', position: Object.freeze({ x: 27, y: 15 }), areaId: 'club-building', focus: 'direction' }),
  Object.freeze({ id: 'asuna', name: '明日菜', position: Object.freeze({ x: 15, y: 26 }), areaId: 'stall-street', focus: 'crowd' }),
]);

/** Third-loop patrol checkpoints used after returning to PM1:30. */
const THIRD_LOOP_PATROL_STEPS = Object.freeze([
  Object.freeze({
    id: 'start-patrol',
    label: '世界樹パトロール開始',
    position: Object.freeze({ x: 18, y: 18 }),
    text: '世界樹周辺の見回りを始めた。',
  }),
  Object.freeze({
    id: 'join-kotaro',
    label: '小太郎と合流',
    position: Object.freeze({ x: 10, y: 20 }),
    text: '見回りの途中で小太郎も合流した。',
  }),
  Object.freeze({
    id: 'finish-patrol',
    label: '世界樹見回り完了',
    position: Object.freeze({ x: 16, y: 18 }),
    text: '世界樹周辺の見回りを終え、あやかと別れた。',
  }),
]);

/** Classmate attraction actors visited in the fourth loop. */
const CLASSMATE_ATTRACTION_ACTORS = Object.freeze([
  Object.freeze({ id: 'ku-fei', name: '古菲', attractionName: '中国武術研究会', position: Object.freeze({ x: 9, y: 13 }), text: 'ネギ坊主、八極拳の型を見ていくアルか。祭りでも鍛錬は欠かさないアル。' }),
  Object.freeze({ id: 'asuna', name: '明日菜', attractionName: '美術部', position: Object.freeze({ x: 18, y: 7 }), text: 'ちょっと、あたしの絵が賞を取ったんだからちゃんと見ていきなさいよね。' }),
  Object.freeze({ id: 'yue', name: '夕映', attractionName: '哲学研究会', position: Object.freeze({ x: 10, y: 14 }), text: 'ここでは勉強会をしています。祭りの中でも知的好奇心は大事なのです。' }),
  Object.freeze({ id: 'haruna', name: 'ハルナ', attractionName: '即席似顔絵', position: Object.freeze({ x: 20, y: 13 }), text: 'ネギ先生、記念に一枚どう？ すぐ描いてあげるよ。' }),
  Object.freeze({ id: 'akira', name: 'アキラ', attractionName: 'たこ焼き屋', position: Object.freeze({ x: 20, y: 18 }), text: '焼きたてだよ。よかったら食べていって。' }),
  Object.freeze({ id: 'setsuna-attraction', name: '刹那', attractionName: '天文学部プラネタリウム', position: Object.freeze({ x: 15, y: 25 }), text: '天文学部のプラネタリウムです。短い時間ですが、星空を楽しんでください。' }),
  Object.freeze({ id: 'satsuki', name: '五月', attractionName: '料理研究会', position: Object.freeze({ x: 20, y: 25 }), text: '料理研究会の出し物です。たくさん食べていってください。' }),
  Object.freeze({ id: 'konoka-attraction', name: '木乃香', attractionName: '占い研究会', position: Object.freeze({ x: 16, y: 25 }), text: 'ネギ君、占いやっていかへん？ 今日の運勢を見たげるえ。' }),
]);

/** 通常会話と自由探索中のランダム配置に参加するのどか。 */
const NODOKA_SOCIAL_ACTOR = Object.freeze({
  id: 'nodoka',
  name: 'のどか',
  position: Object.freeze({ x: 20, y: 22 }),
  text: 'のどかは麻帆良祭の様子を楽しそうに見ている。',
});

/** Kotaro actor used for optional party recruitment during free exploration. */
const KOTARO_SOCIAL_ACTOR = Object.freeze({
  id: 'kotaro',
  name: '小太郎',
  text: '小太郎は麻帆良祭を楽しみながら、次の予定を考えている。',
});

/** 自由探索中に通常会話できるクラスメイト。 */
const CLASSMATE_SOCIAL_ACTORS = Object.freeze([
  ...CLASSMATE_ATTRACTION_ACTORS,
  NODOKA_SOCIAL_ACTOR,
  KOTARO_SOCIAL_ACTOR,
]);

/** Area and schedule metadata for fourth-loop classmate attractions. */
const CLASSMATE_ATTRACTION_SCHEDULE = Object.freeze({
  'ku-fei': Object.freeze({ areaId: 'ground', startMinute: 600, endMinute: 840 }),
  asuna: Object.freeze({ areaId: 'club-building', startMinute: 600, endMinute: 840 }),
  yue: Object.freeze({ areaId: 'hall', startMinute: 600, endMinute: 840 }),
  haruna: Object.freeze({ areaId: 'stall-street', startMinute: 600, endMinute: 840 }),
  akira: Object.freeze({ areaId: 'stall-street', startMinute: 600, endMinute: 840 }),
  'setsuna-attraction': Object.freeze({ areaId: 'club-building', startMinute: 600, endMinute: 840 }),
  satsuki: Object.freeze({ areaId: 'dining-street', startMinute: 600, endMinute: 840 }),
  'konoka-attraction': Object.freeze({ areaId: 'hall', startMinute: 600, endMinute: 840 }),
});

/** Timeline range used by Negi's schedule gantt chart. */
const NEGI_SCHEDULE_RANGE = Object.freeze({
  startMinute: 600,
  endMinute: 990,
  startTimeLabel: 'AM10:00',
  endTimeLabel: 'PM9:00',
});

/** Negi's schedule entries that are not part of the attraction tour. */
const NEGI_SCHEDULE_EVENTS = Object.freeze([
  Object.freeze({
    id: 'haunted-house-flyer',
    actorName: 'ネギ',
    eventName: '3-Aホラーハウスのチラシ配り',
    areaId: null,
    startMinute: 600,
    endMinute: 690,
    loopCount: null,
  }),
  Object.freeze({
    id: 'haunted-house-flyer-ayaka',
    actorName: 'あやか',
    eventName: 'あやかとクラスメイトの出し物巡り',
    areaId: 'hall',
    startMinute: null,
    endMinute: 1080,
    loopCount: null,
    branchOfId: 'haunted-house-help',
  }),
  Object.freeze({
    id: 'haunted-house-help',
    actorName: 'ネギ',
    eventName: '3-Aホラーハウス客引きの手伝い',
    areaId: 'hall',
    startMinute: 690,
    endMinute: 720,
    isAllDay: false,
    loopCount: null,
  }),
  Object.freeze({
    id: 'nodoka-date',
    actorName: 'のどか',
    eventName: 'のどかとのデート',
    areaId: 'dining-street',
    startMinute: 960,
    endMinute: 1050,
    loopCount: null,
  }),
  Object.freeze({
    id: 'yue-festival-tour',
    actorName: '夕映',
    eventName: '夕映と麻帆良祭を周る',
    areaId: 'dining-street',
    startMinute: 990,
    endMinute: 1080,
    loopCount: null,
  }),
  Object.freeze({
    id: 'world-tree-patrol-afternoon',
    actorName: 'ネギ',
    eventName: '世界樹パトロール',
    areaId: 'world-tree',
    startMinute: 900,
    endMinute: 960,
    loopCount: null,
  }),
  Object.freeze({
    id: 'tournament-qualifier',
    actorName: 'ネギ',
    eventName: '格闘大会予選',
    areaId: 'ground',
    startMinute: 1050,
    endMinute: 1140,
    loopCount: null,
  }),
  Object.freeze({
    id: 'world-tree-patrol-evening',
    actorName: 'ネギ',
    eventName: '世界樹パトロール',
    areaId: 'world-tree',
    startMinute: 1140,
    endMinute: 1260,
    loopCount: null,
  }),
]);

/** Fixed damage values used by the Mahora Budokai qualifier. */
const TOURNAMENT_HANDS = Object.freeze({
  ATTACK: 'attack',
  THROW: 'throw',
  DEFEND: 'defend',
});

/** Damage dealt by each winning hand. */
const TOURNAMENT_HAND_DAMAGE = Object.freeze({
  [TOURNAMENT_HANDS.ATTACK]: 10,
  [TOURNAMENT_HANDS.THROW]: 5,
  [TOURNAMENT_HANDS.DEFEND]: 0,
});

/** Initial hit points for the Mahora Budokai qualifier. */
const TOURNAMENT_INITIAL_PLAYER_HP = 100;
const TOURNAMENT_INITIAL_OPPONENT_HP = 50;

/** Festival schedule entries shown separately from classmate attraction schedules. */
const FESTIVAL_STALL_SCHEDULE = Object.freeze([
  Object.freeze({ id: 'haunted-house', title: '3-Aホラーハウス', areaId: 'hall', startMinute: 600, endMinute: 960, isAllDay: true }),
  Object.freeze({ id: 'gun-shooting', title: 'ガンシューティング', areaId: 'ground', startMinute: 600, endMinute: 960, isAllDay: true }),
  Object.freeze({ id: 'roller-coaster', title: 'ジェットコースター', areaId: 'ground', startMinute: 600, endMinute: 960, isAllDay: true }),
]);

/** Initial excitement values for the festival stalls. */
const FESTIVAL_STALL_EXCITEMENT_INITIAL = Object.freeze({
  'haunted-house': 0,
  'gun-shooting': 30,
  'roller-coaster': 30,
});

/** Excitement value at which a festival stall broadcast is emitted. */
const FESTIVAL_STALL_EXCITEMENT_NOTIFICATION_THRESHOLD = 60;

/** Excitement value at which a stall can emit its next broadcast. */
const FESTIVAL_STALL_EXCITEMENT_NOTIFICATION_RESET = 40;

/** Timeline range used by the Mahora Festival gantt chart. */
const FESTIVAL_STALL_SCHEDULE_RANGE = Object.freeze({
  startMinute: 600,
  endMinute: 960,
  startTimeLabel: 'AM10:00',
  endTimeLabel: 'PM4:00',
});

/** Minutes advanced by one completed free-explore move or action. */
const FREE_EXPLORE_TIME_STEP_MINUTES = 5;

/** チラシ1回分のホラーハウス盛り上がり上昇量。 */
const HAUNTED_HOUSE_EXCITEMENT_PER_FLYER = 10;

/** ホラーハウス盛り上がりの上限。 */
const HAUNTED_HOUSE_EXCITEMENT_MAX = 100;

/** Excitement change applied to each attraction at every five-minute beat. */
const FESTIVAL_STALL_EXCITEMENT_RANDOM_STEP = 5;

/** Chance for each off-schedule classmate to move during free-explore travel beats. */
const CLASSMATE_RANDOM_MOVE_RATE = 0.05;

/** 飛行船から確認できる麻帆良祭全体地図。 */
const AIRSHIP_OVERVIEW_MAP = Object.freeze({
  title: '飛行船から見た麻帆良祭',
  areas: Object.freeze([
    Object.freeze({ id: 'class-area', name: '校舎エリア', summary: 'クラス展示とホラーハウスが集まる。' }),
    Object.freeze({ id: 'attraction-area', name: 'アトラクションエリア', summary: 'ガンシューティングやジェットコースターが並ぶ。' }),
    Object.freeze({ id: 'world-tree-area', name: '世界樹周辺', summary: 'パトロール対象の魔力スポットがある。' }),
    Object.freeze({ id: 'airship-route', name: '飛行船航路', summary: '麻帆良祭全体を空から見渡せる。' }),
  ]),
});

/** 進行段階ごとの表示名。 */
const PHASE_LABELS = Object.freeze({
  [CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR]: 'あやかとクラスメイトの出し物巡り',
  [CANONICAL_PHASE_IDS.PROLOGUE]: 'プロローグ',
  [CANONICAL_PHASE_IDS.OPENING]: '開演パレード',
  [CANONICAL_PHASE_IDS.MOVE_TO_3A]: '3-Aへ向かう',
  [CANONICAL_PHASE_IDS.SELECT_HAUNTED_DIFFICULTY]: 'ホラーハウス受付',
  [CANONICAL_PHASE_IDS.HAUNTED_HOUSE]: '3-Aお化け屋敷',
  [CANONICAL_PHASE_IDS.HAUNTED_HOUSE_PANIC_RUN]: 'パニック',
  [CANONICAL_PHASE_IDS.HAUNTED_HOUSE_RESULT]: 'ホラーハウス結果',
  [CANONICAL_PHASE_IDS.MOVE_TO_HEALTH_ROOM]: '保健室へ向かう',
  [CANONICAL_PHASE_IDS.SLEEP]: '仮眠',
  [CANONICAL_PHASE_IDS.REWIND]: 'カシオペア起動',
  [CANONICAL_PHASE_IDS.MOVE_TO_CAFE]: 'カフェへ向かう',
  [CANONICAL_PHASE_IDS.CAFE]: 'のどかとの遭遇',
  [CANONICAL_PHASE_IDS.FOLLOW_NODOKA]: 'のどかを尾行',
  [CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA]: 'のどかから隠れる',
  [CANONICAL_PHASE_IDS.TIME_TRAVEL_CONFIRMED]: 'タイムスリップ確信',
  [CANONICAL_PHASE_IDS.EVA_ESCAPE]: 'エヴァから逃走',
  [CANONICAL_PHASE_IDS.SEARCH_CHAO]: 'チャオ探索',
  [CANONICAL_PHASE_IDS.CHAO_ATTRACTION]: 'アトラクション',
  [CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW]: '飛行船からの眺め',
  [CANONICAL_PHASE_IDS.MEET_CHAO]: 'チャオとの遭遇',
  [CANONICAL_PHASE_IDS.REVIEW_SCHEDULE]: 'スケジュール見直し',
  [CANONICAL_PHASE_IDS.PREPARE_DATE]: 'デート準備',
  [CANONICAL_PHASE_IDS.PREPARE_DATE_OUTFIT]: '服装選択',
  [CANONICAL_PHASE_IDS.NODOKA_DATE_PREPARE_FINISH]: 'デート準備の終了',
  [CANONICAL_PHASE_IDS.NODOKA_DATE]: 'のどかとデート',
  [CANONICAL_PHASE_IDS.NODOKA_DATE_END]: 'のどかデートの結末',
  [CANONICAL_PHASE_IDS.NODOKA_DATE_KISS]: 'のどかとのキスシーン',
  [CANONICAL_PHASE_IDS.ESCAPE_PATROL_STUDENTS]: '魔法生徒から逃走',
  [CANONICAL_PHASE_IDS.WORLD_TREE_MAGIC]: '世界樹魔力溜まり事件',
  [CANONICAL_PHASE_IDS.RETURN_TO_THIRD_LOOP]: '世界樹パトロールへ進む',
  [CANONICAL_PHASE_IDS.THIRD_LOOP_PATROL]: '世界樹見回り',
  [CANONICAL_PHASE_IDS.THIRD_LOOP_CAFE]: '夕映とカフェへ',
  [CANONICAL_PHASE_IDS.THIRD_LOOP_BOAT]: '観光船',
  [CANONICAL_PHASE_IDS.THIRD_LOOP_DINNER]: '夕食',
  [CANONICAL_PHASE_IDS.TOURNAMENT_KOTARO]: '小太郎とまほら武道会会場へ',
  [CANONICAL_PHASE_IDS.TOURNAMENT_RECEPTION]: 'まほら武道会の受付',
  [CANONICAL_PHASE_IDS.TOURNAMENT_VENUE]: '武道会会場へ',
  [CANONICAL_PHASE_IDS.TOURNAMENT_QUALIFIER]: '武道会予選',
  [CANONICAL_PHASE_IDS.TOURNAMENT_RESULT]: 'まほら武道会予選結果',
  [CANONICAL_PHASE_IDS.DAY1_DEBRIEF]: '1日目反省会',
  [CANONICAL_PHASE_IDS.REWIND_TO_FOURTH_LOOP]: 'クラスメイトの出し物巡りへ進む',
  [CANONICAL_PHASE_IDS.FOURTH_LOOP_HAUNTED_RETURN]: '3-A再訪',
  [CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR]: 'クラスメイト出し物巡り',
      [CANONICAL_PHASE_IDS.YUE_FESTIVAL_TOUR]: '夕映と麻帆良祭を周る',
      [CANONICAL_PHASE_IDS.FESTIVAL_ENDING]: '麻帆良祭終了',
      [CANONICAL_PHASE_IDS.GAME_OVER]: 'ゲームオーバー',
      [CANONICAL_PHASE_IDS.COMPLETE]: '導入完了',
});

/** 進行段階ごとの会話。 */
const NODOKA_DATE_END_DIALOGUES = Object.freeze([
  Object.freeze({ speaker: '\u306e\u3069\u304b', text: '\u4eca\u65e5\u306f\u3068\u3066\u3082\u697d\u3057\u304b\u3063\u305f\u3067\u3059\u3002' }),
  Object.freeze({ speaker: '\u30ab\u30e2', text: '\u30c7\u30fc\u30c8\u306f\u3053\u3053\u307e\u3067\u3067\u3059\u3000\u5144\u8cb4\u3002' }),
]);

/** Dialogue shown during the separate Kotaro and Ayaka attraction tour. */
const KOTARO_AYAKA_ATTRACTION_DIALOGUES = Object.freeze([
  Object.freeze({ speaker: '小太郎', text: '客寄せを手伝ったら、あやかが来たで。みんなの出し物を見て回るんやな。' }),
  Object.freeze({ speaker: 'あやか', text: 'ネギ先生、小太郎さん。PM6:00まで、クラスメイトの出し物を一緒に見て回りましょう。' }),
]);

/** Dialogue shown during the unlocked Yue festival tour. */
const YUE_FESTIVAL_TOUR_DIALOGUES = Object.freeze([
  Object.freeze({ speaker: '夕映', text: 'キスルートを経験したネギ先生なら、今日の麻帆良祭をもう少し深く楽しめると思うです。' }),
  Object.freeze({ speaker: 'ネギ', text: '夕映さんと一緒に、まだ見ていない麻帆良祭の風景を探してみます。' }),
]);

const PHASE_DIALOGUES = Object.freeze({
  [CANONICAL_PHASE_IDS.PROLOGUE]: Object.freeze([
    Object.freeze({ speaker: 'ネギ', text: '麻帆良祭の前日です。魔法先生としてのお仕事も確認しておかないと。' }),
    Object.freeze({ speaker: 'チャオ', text: 'ネギ坊主、このカシオペアを預けるネ。きっと役に立つヨ。' }),
  ]),
  [CANONICAL_PHASE_IDS.OPENING]: Object.freeze([
    Object.freeze({ speaker: '夕映', text: 'いよいよ麻帆良祭の開幕です。三日三晩、学園中がお祭りになります。' }),
    Object.freeze({ speaker: 'のどか', text: 'ネギ先生、まずは3-Aのお化け屋敷へ行ってみませんか？' }),
  ]),
  [CANONICAL_PHASE_IDS.SLEEP]: Object.freeze([
    Object.freeze({ speaker: 'ネギ', text: '少しだけ休むつもりが、すっかり眠ってしまいました……。' }),
    Object.freeze({ speaker: '携帯電話', text: '20:06' }),
  ]),
  [CANONICAL_PHASE_IDS.REWIND]: Object.freeze([
    Object.freeze({ speaker: 'カモ', text: '兄貴、カシオペアが勝手に動き出しましたぜ！' }),
    Object.freeze({ speaker: '刹那', text: 'これは……私たちごと、麻帆良祭開始直前へ戻されたようです。' }),
  ]),
  [CANONICAL_PHASE_IDS.CAFE]: Object.freeze([
    Object.freeze({ speaker: 'のどか', text: 'あれ、ネギ先生？ さっきも別の場所で見かけたような……。' }),
    Object.freeze({ speaker: 'カモ', text: '兄貴、のどか姉さんの後を追って確認しましょうぜ。' }),
  ]),
  [CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA]: Object.freeze([
    Object.freeze({ speaker: 'のどか', text: '……今、向こうにネギ先生がいたような？' }),
    Object.freeze({ speaker: 'カモ', text: '兄貴、ここは物陰に隠れてやり過ごしましょうぜ。' }),
  ]),
  [CANONICAL_PHASE_IDS.TIME_TRAVEL_CONFIRMED]: Object.freeze([
    Object.freeze({ speaker: '刹那', text: 'あそこにいるのは、先ほどの私たちです。時間を戻ったと見て間違いありません。' }),
    Object.freeze({ speaker: 'エヴァ', text: '面白いものを持っているな、坊や。少し話を聞かせてもらおうか。' }),
  ]),
  [CANONICAL_PHASE_IDS.FESTIVAL_ENDING]: FESTIVAL_ENDING_DIALOGUES,
  [CANONICAL_PHASE_IDS.HAUNTED_HOUSE_PANIC_RUN]: Object.freeze([
    Object.freeze({ speaker: 'ネギ', text: 'うわあああっ！ もう無理ですー！' }),
    Object.freeze({ speaker: 'カモ', text: '兄貴がパニックで出口まで走り抜けちまいましたぜ。' }),
  ]),
  [CANONICAL_PHASE_IDS.HAUNTED_HOUSE_RESULT]: Object.freeze([
    Object.freeze({ speaker: 'カモ', text: '3-Aホラーハウスの体験はここまでですぜ。' }),
  ]),
  [CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW]: Object.freeze([
    Object.freeze({ speaker: 'カモ', text: '飛行船の窓から麻帆良祭の全容が見渡せますぜ。' }),
  ]),
  [CANONICAL_PHASE_IDS.MEET_CHAO]: Object.freeze([
    Object.freeze({ speaker: 'チャオ', text: 'カシオペアはタイムマシンネ。動力には魔力を使うヨ。' }),
    Object.freeze({ speaker: 'チャオ', text: '説明書を渡しておくネ。うまく使うといいヨ。' }),
  ]),
  [CANONICAL_PHASE_IDS.REVIEW_SCHEDULE]: Object.freeze([
    Object.freeze({ speaker: 'カモ', text: '木乃香姉さんに話しかければ、服装のコーディネートも手伝ってもらえそうですぜ。' }),
  ]),
  [CANONICAL_PHASE_IDS.NODOKA_DATE]: Object.freeze([
    Object.freeze({ speaker: 'のどか', text: 'ネギ先生と一緒に回れるなんて、夢みたいです。' }),
    Object.freeze({ speaker: 'カモ', text: '兄貴、世界樹周辺のパトロール中だった魔法生徒に見つかりましたぜ！' }),
  ]),
  [CANONICAL_PHASE_IDS.NODOKA_DATE_KISS]: Object.freeze([
    Object.freeze({ speaker: 'のどか', text: 'ネギ先生……今日は、もう少しだけ一緒にいてください。' }),
    Object.freeze({ speaker: 'カモ', text: '兄貴、これは大切な思い出になりそうですぜ。' }),
  ]),
  [CANONICAL_PHASE_IDS.WORLD_TREE_MAGIC]: Object.freeze([
    Object.freeze({ speaker: 'ネギ', text: '世界樹の魔力溜まりです……魔力の影響が強すぎます。' }),
    Object.freeze({ speaker: '明日菜', text: 'なんとか収まったわね。夜はマホラ・イリュージョンも見に行くんだから。' }),
    Object.freeze({ speaker: 'のどか', text: '今日はありがとうございました、ネギ先生。' }),
  ]),
  [CANONICAL_PHASE_IDS.RETURN_TO_THIRD_LOOP]: Object.freeze([
    Object.freeze({ speaker: 'カモ', text: '本来すべきだった予定をこなすため、カシオペアで過去へ戻りますぜ。' }),
    Object.freeze({ speaker: '刹那', text: 'PM3:00です。明日菜さん、木乃香お嬢様、私はここで解散します。' }),
  ]),
  [CANONICAL_PHASE_IDS.THIRD_LOOP_BOAT]: Object.freeze([
    Object.freeze({ speaker: '夕映', text: '観光船から見る麻帆良祭も悪くないです。地上とは違う情報が見えるのです。' }),
    Object.freeze({ speaker: 'ネギ', text: 'すごいです。学園全体が本当にお祭りなんですね。' }),
  ]),
  [CANONICAL_PHASE_IDS.THIRD_LOOP_DINNER]: Object.freeze([
    Object.freeze({ speaker: '夕映', text: '夕食にするです。小太郎も合流したようですね。' }),
    Object.freeze({ speaker: '小太郎', text: '武道会の予定が遅れとるらしいで。会場も変わったみたいや。' }),
  ]),
  [CANONICAL_PHASE_IDS.TOURNAMENT_KOTARO]: Object.freeze([
    Object.freeze({ speaker: '小太郎', text: 'まほら武道会の会場へ行くんやったら、俺も一緒に行くで。' }),
  ]),
  [CANONICAL_PHASE_IDS.TOURNAMENT_VENUE]: Object.freeze([
    Object.freeze({ speaker: '小太郎', text: '掲示板に会場変更のお知らせが出とるで。武道会は龍宮神社でやるみたいや。' }),
    Object.freeze({ speaker: 'ネギ', text: '受付はPM6:00から、予選はPM7:00からですね。龍宮神社へ向かいましょう。' }),
  ]),
  [CANONICAL_PHASE_IDS.TOURNAMENT_RECEPTION]: Object.freeze([
    Object.freeze({ speaker: '小太郎', text: '受付は済んだな。予選が始まるまで、しっかり準備しときや。' }),
  ]),
  [CANONICAL_PHASE_IDS.TOURNAMENT_QUALIFIER]: Object.freeze([
    Object.freeze({ speaker: 'カモ', text: '兄貴、麻帆良祭の武道会が全部まとめて大きな大会になってるみたいですぜ。' }),
    Object.freeze({ speaker: 'チャオ', text: '主催はワタシだヨ。まずは予選を突破してもらうネ。' }),
    Object.freeze({ speaker: 'ネギ', text: 'なんとか予選は通れました。でも、すごい大会になっていますね。' }),
  ]),
  [CANONICAL_PHASE_IDS.DAY1_DEBRIEF]: Object.freeze([
    Object.freeze({ speaker: '3-A', text: 'ネギ先生、今日はみんなの出し物に来てくれてありがとう！' }),
    Object.freeze({ speaker: 'カモ', text: '兄貴、まだ行ってない出し物まで感謝されてますぜ。これは別ループで回る必要がありそうですぜ。' }),
  ]),
  [CANONICAL_PHASE_IDS.REWIND_TO_FOURTH_LOOP]: Object.freeze([
    Object.freeze({ speaker: 'カモ', text: '次はネギ、オレっち、小太郎の三人で過去へ戻りますぜ。' }),
    Object.freeze({ speaker: '小太郎', text: 'カシオペアが起動したで。AM11:30から出し物巡りを始めるで。' }),
  ]),
  [CANONICAL_PHASE_IDS.FOURTH_LOOP_HAUNTED_RETURN]: Object.freeze([
    Object.freeze({ speaker: '小太郎', text: 'まずは3-Aのホラーハウスやな。客寄せも手伝うで。' }),
    Object.freeze({ speaker: 'あやか', text: 'ネギ先生、ここからは皆さんの出し物を順に案内いたしますわ。' }),
  ]),
});

/** 学園マップ上の主要座標。 */
const SCHOOL_POSITIONS = Object.freeze({
  START: Object.freeze({ x: 16, y: 4 }),
  CLASS_3A: Object.freeze({ x: 6, y: 7 }),
  AFTER_HAUNTED: Object.freeze({ x: 7, y: 7 }),
  HEALTH_ROOM: Object.freeze({ x: 25, y: 6 }),
  REWIND_START: Object.freeze({ x: 17, y: 4 }),
  CAFE: Object.freeze({ x: 24, y: 24 }),
  FOLLOW_START: Object.freeze({ x: 23, y: 21 }),
  NODOKA_START: Object.freeze({ x: 19, y: 21 }),
  HIDE_START: Object.freeze({ x: 11, y: 24 }),
  NODOKA_LOOK: Object.freeze({ x: 18, y: 20 }),
  EVA_START: Object.freeze({ x: 6, y: 24 }),
  EVA_PLAYER_START: Object.freeze({ x: 17, y: 24 }),
  ESCAPE_GOAL: Object.freeze({ x: 29, y: 12 }),
  CHASE_SETSUNA_WAIT: Object.freeze({ x: 17, y: 16 }),
  CHAO_AIRSHIP: Object.freeze({ x: 26, y: 5 }),
  THIRD_LOOP_START: Object.freeze({ x: 20, y: 20 }),
  YUE_MEET: Object.freeze({ x: 21, y: 22 }),
  BOAT_PIER: Object.freeze({ x: 28, y: 24 }),
  DINNER_SPOT: Object.freeze({ x: 23, y: 21 }),
  GROUND_TOURNAMENT: Object.freeze({ x: 18, y: 7 }),
  TOURNAMENT_NOTICE: Object.freeze({ x: 16, y: 28 }),
  RYUGU_SHRINE: Object.freeze({ x: 14, y: 30 }),
  LIBRARY_ISLAND: Object.freeze({ x: 30, y: 6 }),
});

/** のどか尾行の固定経路。 */
/** プロトタイプのエリア内で座標を持たない場所に割り当てる互換位置。 */
const PROTOTYPE_AREA_DEFAULT_POSITION = Object.freeze({ x: 0, y: 0 });

/** Place-selection destinations and their direct connections used after the tutorial. */
const FREE_EXPLORE_DESTINATIONS = Object.freeze([
  ['library', '図書室', '校舎1階', ['library-hallway'], '図書室の展示や資料を確認する。'],
  ['library-hallway', '図書室前廊下', '校舎1階', ['library', 'staff-room', 'hall'], '校舎内の各施設へつながる廊下。'],
  ['staff-room', '職員室', '校舎1階', ['library-hallway'], '教師たちが集まる職員室。'],
  ['hall', 'ホール', '校舎1階', ['library-hallway', 'girls-restroom', 'health-hallway', 'class-3a-hallway', 'other-class-hallway', 'gym-front'], '校舎内の人が行き交うホール。'],
  ['girls-restroom', '女子トイレ', '校舎1階', ['hall'], '校舎1階の女子トイレ。'],
  ['health-hallway', '保健室前廊下', '校舎1階', ['hall', 'health-room', 'other-class-hallway'], '保健室前の廊下。'],
  ['health-room', '保健室', '校舎1階', ['health-hallway'], '保健室。'],
  ['class-3a-hallway', '3-A前廊下', '校舎2階', ['hall', 'class-3a-classroom', 'other-class-hallway'], '3-A教室前の廊下。'],
  ['class-3a-classroom', '3-A教室', '校舎2階', ['class-3a-hallway'], '3-Aの教室。', { position: SCHOOL_POSITIONS.CLASS_3A }],
  ['other-class-hallway', '別クラス廊下', '校舎2階', ['hall', 'class-3a-hallway', 'health-hallway', 'rooftop'], '別クラスへ続く廊下。'],
  ['rooftop', '屋上', '校舎屋上', ['other-class-hallway'], '校舎の屋上。'],
  ['gym-arena', '体育館アリーナ', '体育館', ['gym-equipment', 'locker-room', 'gym-front'], '体育館アリーナ。'],
  ['gym-equipment', '体育用具室', '体育館', ['gym-arena'], '体育用具室。'],
  ['locker-room', '更衣室', '体育館', ['gym-arena'], '体育館の更衣室。'],
  ['gym-front', '体育館前広場', '屋外', ['hall', 'gym-arena', 'rest-area', 'ground'], '体育館前の広場。'],
  ['ground', 'グラウンド', '屋外', ['gym-front', 'dining-street'], '屋外の催しや大きな人の流れを確認する。', { position: CHAO_SEARCH_LOCATIONS.find((location) => location.id === 'gun-shooting').position }],
  ['dining-street', '食堂街', '屋外', ['ground', 'club-building', 'church-front'], '食べ物の出し物や休憩場所を回る。', { position: SCHOOL_POSITIONS.CAFE }],
  ['rest-area', '休憩所', '屋外', ['gym-front', 'church-front'], '祭りの合間に休める場所。'],
  ['church-front', '教会前', '屋外', ['dining-street', 'rest-area', 'david-square'], '教会前の広場。'],
  ['david-square', 'ダビデ広場', '屋外', ['club-building', 'church-front', 'underground-waterway-c'], 'ダビデ広場。'],
  ['club-building', 'クラブ棟', '屋外', ['dining-street', 'world-tree', 'david-square'], '文化部や空のアトラクションを確認する。', { position: CHAO_SEARCH_LOCATIONS.find((location) => location.id === 'airship').position }],
  ['world-tree', '世界樹', '祭り会場', ['club-building', 'world-tree-plaza', 'entrance-gate', 'stall-street', 'ryugu-shrine', 'library-island-route'], '世界樹周辺の人の流れと魔力スポットを確認する。', { position: SCHOOL_POSITIONS.THIRD_LOOP_START }],
  ['world-tree-plaza', '世界樹広場', '祭り会場', ['world-tree', 'stall-street', 'underground-waterway-b'], '世界樹広場。'],
  ['entrance-gate', '入場門', '祭り会場', ['world-tree', 'ryugu-shrine'], '麻帆良祭の入口。正午まではパレードで賑わっている。', { position: SCHOOL_POSITIONS.START }],
  ['stall-street', '屋台通り', '祭り会場', ['world-tree', 'world-tree-plaza', 'library-island-route'], '人混みの中で情報を探す。', { position: CHAO_SEARCH_LOCATIONS.find((location) => location.id === 'stall-street').position }],
  ['ryugu-shrine', '龍宮神社', '祭り会場', ['world-tree', 'entrance-gate', 'library-island-route', 'underground-waterway-a'], 'まほら武道会の変更後の会場。', { position: SCHOOL_POSITIONS.RYUGU_SHRINE }],
  ['library-island-route', '図書館島連絡路', '祭り会場', ['world-tree', 'library-island', 'stall-street', 'ryugu-shrine'], '図書館島へ向かう連絡路。'],
  ['library-island', '図書館島', '祭り会場', ['library-island-route'], '図書館島の地下へ続く入口。地下深くを探検できる。', { position: SCHOOL_POSITIONS.LIBRARY_ISLAND }],
  ['underground-waterway-a', '地下水路A', '地下水路', ['ryugu-shrine', 'underground-waterway-b', 'underground-waterway-c'], '地下水路の入口。'],
  ['underground-waterway-b', '地下水路B', '地下水路', ['world-tree-plaza', 'underground-waterway-a', 'underground-waterway-c'], '地下水路の分岐。'],
  ['underground-waterway-c', '地下水路C', '地下水路', ['david-square', 'underground-waterway-a', 'underground-waterway-c'], '地下水路の奥。'],
].map(([id, label, areaName, connectedAreaIds, description, options = {}]) => Object.freeze({
  id,
  label,
  areaName: label,
  category: areaName,
  connectedAreaIds: Object.freeze(connectedAreaIds),
  position: options.position ?? PROTOTYPE_AREA_DEFAULT_POSITION,
  routeAreas: Object.freeze([label]),
  description,
  ...(options.legacyStateId ? { legacyStateId: options.legacyStateId } : {}),
})));

/** Classmate random movement areas that have prototype social content. */
const CLASSMATE_FREE_EXPLORE_AREA_IDS = Object.freeze([
  'entrance-gate',
  'hall',
  'club-building',
  'stall-street',
  'dining-street',
  'ground',
  'ryugu-shrine',
  'world-tree',
  'library-island',
]);

/** Interruption choices shown when an action interruption happens. */
const FREE_EXPLORE_INTERRUPTION_CHOICES = Object.freeze([
  Object.freeze({ id: 'engage', label: '関わる', description: '元の行動を中断して巻き込みに対応する。' }),
  Object.freeze({ id: 'detour', label: '迂回する', description: '少し遠回りして元の目的を続ける。' }),
  Object.freeze({ id: 'ignore', label: '無視して進む', description: '足を止めずに元の目的を続ける。' }),
]);

/** Prototype action interruptions selected by random roll. */
const FREE_EXPLORE_ACTION_INTERRUPTION_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'lost-child',
    title: '迷子の相談',
    description: '行動を始めたところで、迷子の親を探してほしいと声をかけられる。',
    resultText: '近くの係員へつなぎ、元の行動へ戻る余裕を作った。',
  }),
  Object.freeze({
    id: 'stall-help',
    title: '屋台の応援要請',
    description: '隣の屋台が急に混み始め、短時間だけ手伝ってほしいと頼まれる。',
    resultText: '屋台を手伝い、会場全体の忙しさを体感した。',
  }),
]);

const NODOKA_WAYPOINTS = Object.freeze([
  Object.freeze({ x: 19, y: 21 }),
  Object.freeze({ x: 17, y: 21 }),
  Object.freeze({ x: 15, y: 23 }),
  Object.freeze({ x: 12, y: 24 }),
  Object.freeze({ x: 8, y: 24 }),
]);

/** のどかの移動速度。 */
const NODOKA_SPEED_CELLS_PER_SECOND = 1.8;

/** お化け屋敷マップ上の主要座標。 */
const HAUNTED_POSITIONS = Object.freeze({
  ENTRANCE: Object.freeze({ x: 2.5, y: 10.5 }),
  EXIT: Object.freeze({ x: 9.5, y: 10.5 }),
});

/** 数値を指定範囲へ収める。 */
function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

/** 座標を複製する。 */
function copyPosition(position) {
  return { x: position.x, y: position.y };
}

/** 2点間の距離を返す。 */
function getDistance(left, right) {
  return Math.hypot(right.x - left.x, right.y - left.y);
}

/** 入力方向を長さ1以下の移動方向へ変換する。 */
function normalizeDirection(input) {
  const x = Number(input.x) || 0;
  const y = Number(input.y) || 0;
  const length = Math.hypot(x, y);
  if (length <= 1 && length > 0) {
    return { x, y };
  }
  if (length === 0) {
    return { x: 0, y: 0 };
  }
  return { x: x / length, y: y / length };
}

/** 円形の移動体が矩形と接触するか判定する。 */
function circleIntersectsRectangle(position, radius, rectangle) {
  const closestX = clamp(position.x, rectangle.x, rectangle.x + rectangle.width);
  const closestY = clamp(position.y, rectangle.y, rectangle.y + rectangle.height);
  return Math.hypot(position.x - closestX, position.y - closestY) < radius;
}

/** 指定マップ上の座標へ配置できるか判定する。 */
function isPositionWalkable(position, map) {
  if (
    position.x < CANONICAL_PLAYER_RADIUS
    || position.y < CANONICAL_PLAYER_RADIUS
    || position.x > map.width - CANONICAL_PLAYER_RADIUS
    || position.y > map.height - CANONICAL_PLAYER_RADIUS
  ) {
    return false;
  }
  return !map.obstacles.some((obstacle) => (
    circleIntersectsRectangle(position, CANONICAL_PLAYER_RADIUS, obstacle)
  ));
}

/** 軸分離衝突判定で座標を移動する。 */
function movePosition(position, displacement, map) {
  const distance = Math.hypot(displacement.x, displacement.y);
  const stepCount = Math.max(1, Math.ceil(distance / CANONICAL_MOVEMENT_STEP));
  const step = { x: displacement.x / stepCount, y: displacement.y / stepCount };
  let current = copyPosition(position);
  for (let index = 0; index < stepCount; index += 1) {
    const nextX = { x: current.x + step.x, y: current.y };
    if (isPositionWalkable(nextX, map)) {
      current = nextX;
    }
    const nextY = { x: current.x, y: current.y + step.y };
    if (isPositionWalkable(nextY, map)) {
      current = nextY;
    }
  }
  return current;
}

/** 目標座標へ速度上限つきで近づける。 */
function moveToward(position, target, maxDistance) {
  const distance = getDistance(position, target);
  if (distance === 0 || distance <= maxDistance) {
    return copyPosition(target);
  }
  return {
    x: position.x + (target.x - position.x) / distance * maxDistance,
    y: position.y + (target.y - position.y) / distance * maxDistance,
  };
}

/** 線分と矩形が交差するかをサンプリングで判定する。 */
function lineIntersectsRectangle(from, to, rectangle) {
  const distance = getDistance(from, to);
  const sampleCount = Math.max(1, Math.ceil(distance / 0.1));
  for (let index = 0; index <= sampleCount; index += 1) {
    const ratio = index / sampleCount;
    const sample = {
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio,
    };
    if (
      sample.x >= rectangle.x
      && sample.x <= rectangle.x + rectangle.width
      && sample.y >= rectangle.y
      && sample.y <= rectangle.y + rectangle.height
    ) {
      return true;
    }
  }
  return false;
}

/** 2座標間の視線が遮蔽されているか判定する。 */
function isLineBlocked(from, to, obstacles) {
  return obstacles.some((obstacle) => lineIntersectsRectangle(from, to, obstacle));
}

/** 固定時刻をsnapshot用に複製する。 */
function copyTime(time) {
  return {
    festivalDay: time.festivalDay,
    loopCount: time.loopCount,
    hour: time.hour,
    minute: time.minute,
    label: time.label,
  };
}

/** 同じループ内で前進したゲーム内分数を返す。 */
function getForwardElapsedMinutes(previousTime, nextTime) {
  if (
    previousTime.festivalDay !== nextTime.festivalDay
    || previousTime.loopCount !== nextTime.loopCount
  ) {
    return 0;
  }
  const previousMinutes = previousTime.hour * 60 + previousTime.minute;
  const nextMinutes = nextTime.hour * 60 + nextTime.minute;
  return Math.max(0, nextMinutes - previousMinutes);
}

/** Return a numeric ordering value for a canonical prototype time. */
function getTimeOrderValue(time) {
  return (((time.festivalDay * 10) + time.loopCount) * 24 * 60) + (time.hour * 60) + time.minute;
}

/** Return whether the left time is earlier than the right time. */
function isTimeBefore(left, right) {
  return getTimeOrderValue(left) < getTimeOrderValue(right);
}

/** Return whether the left time is equal to or later than the right time. */
function isTimeAtOrAfter(left, right) {
  return getTimeOrderValue(left) >= getTimeOrderValue(right);
}

/** Return whether the target time is inside the inclusive time range. */
function isTimeBetweenInclusive(target, start, end) {
  return isTimeAtOrAfter(target, start) && !isTimeBefore(end, target);
}

/** Return whether a minute-of-day value is inside an inclusive range. */
function isMinuteBetweenInclusive(targetMinute, startMinute, endMinute) {
  return targetMinute >= startMinute && targetMinute <= endMinute;
}

/** Build a display label for a canonical prototype time. */
function createTimeLabel(hour, minute) {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${period}${displayHour}:${String(minute).padStart(2, '0')}`;
}

/** Build a display label from minutes after midnight. */
function createTimeLabelFromMinute(totalMinutes) {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  return createTimeLabel(hour, minute);
}

/** Return minutes after midnight for a canonical prototype time. */
function getMinuteOfDay(time) {
  return (time.hour * 60) + time.minute;
}

/** Create a canonical time in the second loop of festival day one. */
function createSecondLoopTime(hour, minute) {
  return {
    festivalDay: 1,
    loopCount: 2,
    hour,
    minute,
    label: createTimeLabel(hour, minute),
  };
}

/** Create a time-of-day value while preserving the current festival loop. */
function createCurrentLoopTime(currentTime, hour, minute) {
  return {
    ...currentTime,
    hour,
    minute,
    label: createTimeLabel(hour, minute),
  };
}

/** Create a time-of-day value in the next festival loop. */
function createNextLoopTime(currentTime, hour, minute) {
  return {
    ...createCurrentLoopTime(currentTime, hour, minute),
    loopCount: currentTime.loopCount + 1,
  };
}

/** Clone the serializable canonical scene state for rewind history. */
function cloneCanonicalState(state) {
  return attachCanonicalEventAliases(JSON.parse(JSON.stringify(state)));
}

/** Attach compatibility accessors for code that is being migrated to event state. */
function attachCanonicalEventAliases(state) {
  const aliases = {
    hauntedDifficultyId: ['hauntedHouse', 'difficultyId'],
    hauntedPanic: ['hauntedHouse', 'panic'],
    hauntedResult: ['hauntedHouse', 'result'],
    hauntedRechallengeIds: ['hauntedHouse', 'rechallengeIds'],
    hauntedScareIndex: ['hauntedHouse', 'scareIndex'],
    activeScare: ['hauntedHouse', 'activeScare'],
    chaoSearch: ['chaoSearch'],
    prepareDate: ['nodokaDate'],
    thirdLoop: ['festivalProgress'],
  };
  for (const [alias, path] of Object.entries(aliases)) {
    Object.defineProperty(state, alias, {
      configurable: true,
      enumerable: false,
      get() {
        return path.length === 1
          ? state.events[path[0]]
          : state.events[path[0]][path[1]];
      },
      set(value) {
        if (path.length === 1) {
          state.events[path[0]] = value;
        } else {
          state.events[path[0]][path[1]] = value;
        }
      },
    });
  }
  return state;
}

/** Attach non-enumerable snapshot aliases while consumers migrate to events. */
function attachCanonicalSnapshotAliases(snapshot) {
  const aliases = {
    hauntedHouse: ['haunted-house'],
    chaoSearch: ['chao-search'],
    prepareDate: ['nodoka-date-prepare'],
    thirdLoop: ['classmate-attraction-tour'],
  };
  for (const [alias, eventId] of Object.entries(aliases)) {
    Object.defineProperty(snapshot, alias, {
      configurable: true,
      enumerable: false,
      get() {
        return snapshot.events[eventId].data;
      },
    });
  }
  return snapshot;
}

/** 原作導入プロトタイプのシーン状態を生成する。 */
function createInitialState() {
  return attachCanonicalEventAliases({
    phaseId: CANONICAL_PHASE_IDS.PROLOGUE,
    dialogueIndex: 0,
    gameTime: copyTime(CANONICAL_TIMES.FESTIVAL_START),
    phoneTimeLabel: null,
    magicPower: MAGIC_POWER_MAX,
    isFinalBattleRoute: false,
    gameOver: {
      reason: null,
    },
    saveStatus: {
      kind: null,
      text: null,
    },
    affection: Object.fromEntries(
      CLASSMATE_SOCIAL_ACTORS.map((actor) => [actor.id, CLASSMATE_AFFECTION_INITIAL]),
    ),
    cgFlags: {
      nodokaKiss: false,
    },
    persistentEvents: {
      hasDiscoveredHauntedHouseFlyerAyakaSchedule: false,
      hasExperiencedHauntedHouseFlyerAyakaEvent: false,
      hauntedHouseFlyerAyakaEventStartMinute: null,
      hasUnlockedYueFestivalTour: false,
      hasReachedLibraryDungeonFinalFloor: false,
      completedScheduleEventIds: [],
    },
    playerPosition: copyPosition(SCHOOL_POSITIONS.START),
    outfitId: DATE_OUTFITS.SUIT.id,
    playerTrail: [copyPosition(SCHOOL_POSITIONS.START)],
    movementInput: { x: 0, y: 0 },
    companionPositions: {
      kamo: copyPosition({ x: SCHOOL_POSITIONS.START.x - 0.7, y: SCHOOL_POSITIONS.START.y + 0.4 }),
      setsuna: null,
      kotaro: null,
      yue: null,
    },
    events: {
      hauntedHouse: {
        difficultyId: HAUNTED_DIFFICULTY_IDS.HARD,
        panic: 0,
        result: null,
        rechallengeIds: [],
        scareIndex: 0,
        activeScare: null,
      },
      chaoSearch: {
        currentAttractionId: null,
        completedAttractionIds: [],
        visitedLocationIds: [],
        heardHintActorIds: [],
        hints: [],
        targetLocationId: null,
        foundLocationId: null,
        interactionDialogue: null,
        isNodokaDateCompleted: false,
        hasMissedNodokaDate: false,
        returnAfterNodokaDatePhaseId: null,
        pendingSetsunaChoice: false,
        isSetsunaWaiting: false,
        hasCassiopeiaManual: false,
      },
      nodokaDate: {
        hasStarted: false,
        isLoopCompleted: false,
        hasPrepared: false,
        hasCoordinated: false,
        hasGift: false,
        hasTopic: false,
        preparationScore: 0,
        interactionDialogue: null,
      },
      festivalProgress: {
        patrolStepIndex: 0,
        completedPatrolStepIds: [],
        attractionDialogue: null,
        completedAttractionActorIds: [],
        currentAttractionAreaId: 'hall',
        isAyakaCompanion: false,
        hasHelpedHauntedHouse: false,
        tournamentNotificationShown: false,
        tournamentKotaroJoined: false,
        tournamentVenueConfirmed: false,
        tournamentRegistered: false,
        tournamentResult: null,
        tournamentBattle: null,
      },
    },
    festivalStallExcitement: { ...FESTIVAL_STALL_EXCITEMENT_INITIAL },
    festivalStallNotificationArmed: Object.fromEntries(
      Object.keys(FESTIVAL_STALL_EXCITEMENT_INITIAL).map((id) => [id, true]),
    ),
    mainEvent: {
      activeEventId: null,
      isManual: false,
    },
    freeExplore: {
      currentLocationId: 'entrance-gate',
      selectedActionId: null,
      interruption: null,
      actionResult: null,
      libraryDungeon: {
        isActive: false,
        currentFloor: 1,
        pendingBarrierCost: null,
        lastResult: null,
      },
    },
    classmateConversation: {
      actorId: null,
    },
    activeEvent: null,
    classmateLocations: { kotaro: 'ground' },
    festivalNotifications: {
      shownKeys: [],
      current: [],
    },
    nodokaPosition: copyPosition(SCHOOL_POSITIONS.NODOKA_START),
    nodokaWaypointIndex: 0,
    nodokaTooCloseSeconds: 0,
    nodokaTooFarSeconds: 0,
    hideElapsedSeconds: 0,
    hideResult: null,
    evaPosition: copyPosition(SCHOOL_POSITIONS.EVA_START),
    evaElapsedSeconds: 0,
    evaResult: null,
    isTutorialSkipped: false,
    isTutorialCompleted: false,
    retryCount: 0,
    log: ['麻帆良祭前日のプロローグが始まった。'],
  });
}

/** 移動履歴から終端より指定距離だけ後ろの座標を取得する。 */
function getTrailPositionBehind(trail, distance) {
  if (trail.length === 0) {
    return null;
  }
  let remaining = distance;
  for (let index = trail.length - 1; index > 0; index -= 1) {
    const current = trail[index];
    const previous = trail[index - 1];
    const segmentDistance = getDistance(current, previous);
    if (remaining <= segmentDistance) {
      const ratio = segmentDistance === 0 ? 0 : remaining / segmentDistance;
      return {
        x: current.x + (previous.x - current.x) * ratio,
        y: current.y + (previous.y - current.y) * ratio,
      };
    }
    remaining -= segmentDistance;
  }
  return copyPosition(trail[0]);
}

/** 原作導入プロトタイプの固定フローを管理するシーン。 */
class CanonicalFestivalPrototypeScene {
  #state;

  #random;

  #rewindHistory;

  #storage;

  #skipSimulationThisFrame;

  /**
   * シーンを初期状態で生成する。
   * @param {Object} [options] - テスト用の任意設定。
   * @param {Function} [options.random] - 0以上1未満を返す乱数関数。
   * @param {Object} [options.initialGameTime] - テスト用の初期ゲーム時刻。
   * @param {string} [options.initialPhaseId] - テスト用の初期フェーズ。
   * @param {boolean} [options.isFinalBattleRoute] - 最終決戦ルートとして開始するか。
   */
  constructor(options = {}) {
    this.#state = createInitialState();
    this.#random = typeof options.random === 'function' ? options.random : Math.random;
    if (options.initialGameTime) {
      this.#state.gameTime = copyTime(options.initialGameTime);
    }
    if (typeof options.initialPhaseId === 'string') {
      this.#state.phaseId = options.initialPhaseId;
    }
    // Apply optional affection fixtures used by focused domain tests.
    if (options.initialAffection && typeof options.initialAffection === 'object') {
      for (const [actorId, value] of Object.entries(options.initialAffection)) {
        if (actorId in this.#state.affection && Number.isFinite(value)) {
          this.#state.affection[actorId] = Math.max(0, Math.min(100, value));
        }
      }
    }
    this.#state.isFinalBattleRoute = options.isFinalBattleRoute === true;
    this.#rewindHistory = [];
    this.#storage = options.storage
      ?? (typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : null);
    this.#skipSimulationThisFrame = false;
    this.#recordRewindCheckpoint();
  }

  /** GameEngineから1フレーム分の入力と経過時間を受け取って更新する。 */
  update({ context }) {
    const inputs = context?.inputs ?? [];
    const deltaSeconds = Math.max(0, (context?.deltaTimeMs ?? 0) / 1000);
    this.#handleInputs(inputs);
    if (this.#skipSimulationThisFrame) {
      this.#skipSimulationThisFrame = false;
      return;
    }
    this.#updateMovement(deltaSeconds);
    this.#updateCompanions();
    this.#updatePhaseProgress(deltaSeconds);
    this.#enforceFestivalEndDeadline();
    this.#recordRewindCheckpoint();
  }

  /** Record the first state reached at each loop and minute for Cassiopeia. */
  #recordRewindCheckpoint() {
    const key = `${this.#state.gameTime.festivalDay}:${this.#state.gameTime.loopCount}:${getMinuteOfDay(this.#state.gameTime)}`;
    if (this.#rewindHistory.some((checkpoint) => checkpoint.key === key)) {
      return;
    }
    this.#rewindHistory.push({
      key,
      state: cloneCanonicalState(this.#state),
    });
  }

  /** rendererへ現在状態のsnapshotを返す。 */
  /** 入力種別ごとの処理を行う。 */
  #handleInputs(inputs) {
    for (const input of inputs) {
      if (input.type === CANONICAL_INPUT_TYPES.MOVEMENT_SET) {
        this.#handleMovementInput(input);
      } else if (input.type === CANONICAL_INPUT_TYPES.STORY_ADVANCE) {
        this.#advanceStory();
      } else if (input.type === CANONICAL_INPUT_TYPES.CHOICE_SELECT) {
        this.#handleChoiceInput(input);
      } else if (input.type === CANONICAL_INPUT_TYPES.INTERACT) {
        this.#handleInteractInput(input);
      } else if (input.type === CANONICAL_INPUT_TYPES.ROUTE_RESTART) {
        this.#restartRoute();
      } else if (input.type === CANONICAL_INPUT_TYPES.MAIN_EVENT_SET) {
        this.#setMainEvent(input.eventId, true);
      } else if (input.type === CANONICAL_INPUT_TYPES.MAIN_EVENT_CLEAR) {
        this.#clearMainEvent(true);
      } else if (input.type === CANONICAL_INPUT_TYPES.DESTINATION_SELECT) {
        this.#selectFreeExploreDestination(input.destinationId);
      } else if (input.type === CANONICAL_INPUT_TYPES.LOCATION_ACTION_SELECT) {
        this.#selectFreeExploreLocationAction(input.actionId);
      } else if (input.type === CANONICAL_INPUT_TYPES.INTERRUPTION_SELECT) {
        this.#selectFreeExploreInterruption(input.choiceId);
      } else if (input.type === CANONICAL_INPUT_TYPES.WAIT_UNTIL) {
        this.#waitUntil(input.targetMinute);
      } else if (input.type === CANONICAL_INPUT_TYPES.CASSIOPEIA_REWIND) {
        this.#rewindWithCassiopeia(input.targetMinute);
      } else if (input.type === CANONICAL_INPUT_TYPES.TUTORIAL_SKIP) {
        this.#skipTutorial();
      } else if (input.type === CANONICAL_INPUT_TYPES.SAVE_GAME) {
        this.#saveGame();
      } else if (input.type === CANONICAL_INPUT_TYPES.LOAD_GAME) {
        this.#loadGame();
      }
    }
  }

  /** 移動入力を現在段階で許可される場合だけ保持する。 */
  #handleMovementInput(input) {
    void input;
  }

  /** 選択入力を現在段階に対応する分岐へ反映する。 */
  #handleChoiceInput(input) {
    if (this.#isChaoSearchRouteActive()) {
      return;
    }
    this.#clearCurrentFestivalNotification();
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.SELECT_HAUNTED_DIFFICULTY) {
      this.#selectHauntedDifficulty(input.choiceId);
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.SEARCH_CHAO) {
      this.#handleChaoSearchChoice(input.choiceId);
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION) {
      this.#handleClassmateConversationChoice(input.choiceId);
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.PREPARE_DATE_OUTFIT) {
      this.#handleDateOutfitChoice(input.choiceId);
    } else {
      this.#handleNovelChoice(input.choiceId);
    }
  }

  /** interaction入力を現在段階に対応する対象へ反映する。 */
  #handleInteractInput(input) {
    if (this.#isChaoSearchRouteActive() || this.#state.phaseId === CANONICAL_PHASE_IDS.SEARCH_CHAO) {
      return;
    }
    this.#clearCurrentFestivalNotification();
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.PREPARE_DATE) {
      this.#interactInPrepareDate(input.targetId);
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR) {
      this.#interactInClassmateAttractionTour(input.targetId);
      return;
    }
  }

  /** Handle choice-driven progression for the novel-style canonical prototype. */
  #handleNovelChoice(choiceId) {
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.MOVE_TO_3A && choiceId === 'go-to-3a') {
      this.#placePlayer(SCHOOL_POSITIONS.CLASS_3A);
      this.#enterHauntedHouse();
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.HAUNTED_HOUSE) {
      this.#handleHauntedHouseChoice(choiceId);
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.MOVE_TO_HEALTH_ROOM && choiceId === 'go-to-health-room') {
      this.#placePlayer(SCHOOL_POSITIONS.HEALTH_ROOM);
      this.#enterSleep();
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.MOVE_TO_CAFE && choiceId === 'go-to-cafe') {
      this.#placePlayer(SCHOOL_POSITIONS.CAFE);
      this.#enterCafe();
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.FOLLOW_NODOKA) {
      this.#handleFollowNodokaChoice(choiceId);
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.EVA_ESCAPE) {
      this.#handleEvaEscapeChoice(choiceId);
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.ESCAPE_PATROL_STUDENTS && choiceId === 'escape-patrol') {
      this.#placePlayer(SCHOOL_POSITIONS.ESCAPE_GOAL);
      this.#completeNodokaDateEscape();
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.THIRD_LOOP_PATROL && choiceId === 'next-patrol') {
      this.#completeCurrentThirdLoopPatrolStep();
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.THIRD_LOOP_CAFE && choiceId === 'go-third-loop-cafe') {
      this.#placePlayer(SCHOOL_POSITIONS.CAFE);
      this.#enterThirdLoopBoat();
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.TOURNAMENT_QUALIFIER) {
      this.#handleTournamentBattleChoice(choiceId);
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.TOURNAMENT_RESULT) {
      if (choiceId === 'tournament-retry') {
        this.#startTournamentBattle();
      } else if (choiceId === 'tournament-give-up') {
        this.#finishTournament('loss');
      }
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.PREPARE_DATE) {
      this.#handlePrepareDateChoice(choiceId);
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR) {
      this.#handleClassmateAttractionChoice(choiceId);
    }
  }

  /** Handle a choice inside the haunted-house route. */
  #handleHauntedHouseChoice(choiceId) {
    if (choiceId === 'calm-down') {
      this.#state.hauntedPanic = clamp(
        this.#state.hauntedPanic - HAUNTED_PANIC_RECOVERY_PER_SECOND * 2,
        0,
        HAUNTED_PANIC_MAX,
      );
      this.#addLog('暗い教室の中で一度息を整えた。');
      return;
    }
    if (choiceId !== 'advance-haunted' && choiceId !== 'rush-haunted') {
      return;
    }
    if (choiceId === 'rush-haunted') {
      this.#state.hauntedPanic = clamp(this.#state.hauntedPanic + 10, 0, HAUNTED_PANIC_MAX);
    }
    const scarePoints = this.#getHauntedScarePoints();
    const nextScare = scarePoints[this.#state.hauntedScareIndex];
    if (nextScare) {
      this.#state.activeScare = nextScare;
      this.#placePlayer(nextScare.position);
      this.#addLog(`3-Aホラーハウスの演出「${nextScare.title}」が発生した。`);
      return;
    }
    this.#placePlayer(HAUNTED_POSITIONS.EXIT);
    this.#completeHauntedHouse(true);
  }

  /** Handle a choice inside the Nodoka following route. */
  #handleFollowNodokaChoice(choiceId) {
    if (choiceId === 'too-close-nodoka') {
      this.#retryFollowNodoka();
      return;
    }
    if (choiceId !== 'keep-distance-nodoka') {
      return;
    }
    this.#state.nodokaTooCloseSeconds = 0;
    this.#state.nodokaTooFarSeconds = 0;
    this.#state.nodokaWaypointIndex += 1;
    const waypoint = NODOKA_WAYPOINTS[Math.min(this.#state.nodokaWaypointIndex, NODOKA_WAYPOINTS.length - 1)];
    this.#state.nodokaPosition = copyPosition(waypoint);
    this.#placePlayer({
      x: Math.min(waypoint.x + 3, CANONICAL_SCHOOL_MAP_SIZE - 1),
      y: waypoint.y,
    });
    if (this.#state.nodokaWaypointIndex >= NODOKA_WAYPOINTS.length - 1) {
      this.#enterHideFromNodoka();
    }
  }

  /** Handle a choice inside the Eva escape route. */
  #handleEvaEscapeChoice(choiceId) {
    if (choiceId === 'eva-captured') {
      this.#state.evaElapsedSeconds = EVA_HEAD_START_SECONDS;
      this.#placePlayer(SCHOOL_POSITIONS.EVA_START);
      this.#completeEvaEscape('captured');
      return;
    }
    if (choiceId === 'eva-escape') {
      this.#placePlayer(SCHOOL_POSITIONS.ESCAPE_GOAL);
      this.#completeEvaEscape('escaped');
    }
  }

  /** Complete the current third-loop patrol step without coordinate movement. */
  #completeCurrentThirdLoopPatrolStep() {
    const step = THIRD_LOOP_PATROL_STEPS[this.#state.thirdLoop.patrolStepIndex];
    if (!step) {
      return;
    }
    this.#placePlayer(step.position);
    this.#state.thirdLoop.completedPatrolStepIds.push(step.id);
    this.#addLog(step.text);
    this.#state.thirdLoop.patrolStepIndex += 1;
    if (this.#state.thirdLoop.patrolStepIndex >= THIRD_LOOP_PATROL_STEPS.length) {
      this.#advanceGameTime(createCurrentLoopTime(this.#state.gameTime, 16, 0));
      this.#placePlayer(SCHOOL_POSITIONS.YUE_MEET);
      this.#setPhase(CANONICAL_PHASE_IDS.THIRD_LOOP_CAFE);
      this.#addLog('PM4:12、あやかと別れた後に夕映と出会った。');
    }
  }

  /** Start the Mahora Budokai qualifier with fresh hit points. */
  #startTournamentBattle() {
    this.#state.thirdLoop.tournamentBattle = {
      playerHp: TOURNAMENT_INITIAL_PLAYER_HP,
      opponentHp: TOURNAMENT_INITIAL_OPPONENT_HP,
      lastPlayerHand: null,
      lastOpponentHand: null,
    };
    this.#state.thirdLoop.tournamentResult = null;
    this.#setPhase(CANONICAL_PHASE_IDS.TOURNAMENT_QUALIFIER);
    this.#addLog('まほら武道会の予選が始まった。');
  }

  /** Resolve one rock-paper-scissors-style qualifier exchange. */
  #handleTournamentBattleChoice(choiceId) {
    const handByChoice = {
      'tournament-attack': TOURNAMENT_HANDS.ATTACK,
      'tournament-throw': TOURNAMENT_HANDS.THROW,
      'tournament-defend': TOURNAMENT_HANDS.DEFEND,
    };
    const playerHand = handByChoice[choiceId];
    const battle = this.#state.thirdLoop.tournamentBattle;
    if (!playerHand || !battle) {
      return;
    }
    const hands = Object.values(TOURNAMENT_HANDS);
    const opponentHand = hands[Math.floor(this.#random() * hands.length)];
    battle.lastPlayerHand = playerHand;
    battle.lastOpponentHand = opponentHand;
    if (playerHand !== opponentHand) {
      const playerWins = (
        playerHand === TOURNAMENT_HANDS.ATTACK && opponentHand === TOURNAMENT_HANDS.THROW
        || playerHand === TOURNAMENT_HANDS.THROW && opponentHand === TOURNAMENT_HANDS.DEFEND
        || playerHand === TOURNAMENT_HANDS.DEFEND && opponentHand === TOURNAMENT_HANDS.ATTACK
      );
      if (playerWins) {
        battle.opponentHp = Math.max(0, battle.opponentHp - TOURNAMENT_HAND_DAMAGE[playerHand]);
      } else {
        battle.playerHp = Math.max(0, battle.playerHp - TOURNAMENT_HAND_DAMAGE[opponentHand]);
      }
    }
    if (battle.opponentHp === 0) {
      this.#finishTournament('win');
    } else if (battle.playerHp === 0) {
      this.#state.thirdLoop.tournamentResult = 'loss';
      this.#setPhase(CANONICAL_PHASE_IDS.TOURNAMENT_RESULT);
      this.#addLog('まほら武道会の予選で敗北した。');
    }
  }

  /** End the qualifier and return to ordinary exploration at PM8:00. */
  #finishTournament(result) {
    this.#state.thirdLoop.tournamentResult = result;
    if (result === 'win') {
      this.#markScheduleEventCompleted('mahora-budokai-qualifier');
    }
    this.#state.thirdLoop.tournamentBattle = null;
    this.#advanceGameTime({
      ...this.#state.gameTime,
      hour: 20,
      minute: 0,
      label: 'PM8:00',
    });
    this.#resetFreeExploreState('ryugu-shrine');
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    this.#addLog(`まほら武道会の予選を終え、PM8:00の通常探索へ戻った。結果: ${result}`);
  }

  /** Handle preparation-time choices before Nodoka's date. */
  #handlePrepareDateChoice(choiceId) {
    if (choiceId === 'finish-date-prepare') {
      this.#setPhase(CANONICAL_PHASE_IDS.NODOKA_DATE_PREPARE_FINISH);
      return;
    }
    const spot = PREPARE_DATE_SPOTS.find((entry) => choiceId === `prepare-${entry.id}`);
    if (spot) {
      this.#interactInPrepareDate(spot.id);
      return;
    }
  }

  /** Handle outfit selection after asking Konoka for date advice. */
  #handleDateOutfitChoice(choiceId) {
    const outfitByChoice = {
      'choose-outfit-keep': null,
      'choose-outfit-casual': DATE_OUTFITS.CASUAL,
      'choose-outfit-chunibyo': DATE_OUTFITS.CHUNIBYO,
    };
    if (!Object.prototype.hasOwnProperty.call(outfitByChoice, choiceId)) {
      return;
    }
    const selectedOutfit = outfitByChoice[choiceId] ?? this.#getCurrentOutfit();
    this.#state.outfitId = selectedOutfit.id;
    this.#state.prepareDate.hasCoordinated = true;
    this.#increasePrepareDateScore(1);
    this.#state.prepareDate.interactionDialogue = {
      speaker: '木乃香',
      text: `${selectedOutfit.label}で行くことにした。のどかも喜んでくれるはずや。`,
      anchor: { type: 'actor', id: PREPARE_DATE_KONOKA.id },
    };
    this.#setPhase(CANONICAL_PHASE_IDS.PREPARE_DATE);
    this.#addLog(`デートの服装を${selectedOutfit.label}に決めた。`);
  }

  /** Handle classmate attraction choices. */
  #handleClassmateAttractionChoice(choiceId) {
    const areaId = choiceId.startsWith('go-attraction-area-')
      ? choiceId.slice('go-attraction-area-'.length)
      : null;
    if (areaId) {
      const destination = this.#getFreeExploreDestination(areaId);
      if (!destination) {
        return;
      }
      this.#state.thirdLoop.currentAttractionAreaId = areaId;
      this.#placePlayer(destination.position);
      this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
      this.#addLog(`出し物エリアへ移動: ${destination.label}`);
      return;
    }
    if (choiceId === 'wait-attraction-time') {
      this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
      this.#addLog('出し物の時間まで少し待った。');
      return;
    }
    const actor = CLASSMATE_ATTRACTION_ACTORS.find((entry) => choiceId === `visit-${entry.id}`);
    if (
      actor
      && this.#getClassmateAttractionArea(actor).id === this.#state.thirdLoop.currentAttractionAreaId
      && this.#isClassmateAttractionOpen(actor)
    ) {
      this.#interactInClassmateAttractionTour(actor.id);
    }
  }

  /** 会話または固定演出を次へ進める。 */
  #advanceStory() {
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.GAME_OVER) {
      return;
    }
    if (this.#state.activeScare) {
      this.#completeActiveScare();
      return;
    }
    if (this.#state.chaoSearch.interactionDialogue) {
      this.#state.chaoSearch.interactionDialogue = null;
      return;
    }
    if (this.#state.prepareDate.interactionDialogue) {
      this.#state.prepareDate.interactionDialogue = null;
      return;
    }
    if (this.#state.thirdLoop.attractionDialogue) {
      this.#state.thirdLoop.attractionDialogue = null;
      if (this.#isClassmateAttractionTourComplete()) {
        this.#setPhase(CANONICAL_PHASE_IDS.COMPLETE);
        this.#state.movementInput = { x: 0, y: 0 };
        this.#addLog('クラスメイトの出し物巡りを終えた。');
      }
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT) {
      this.#returnToFreeExplore();
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.CHAO_ATTRACTION) {
      this.#completeChaoAttraction();
      return;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_PREPARE_FINISH) {
      this.#finishNodokaDatePreparation();
      return;
    }
    const dialogues = this.#state.phaseId === CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR
        ? KOTARO_AYAKA_ATTRACTION_DIALOGUES
      : this.#state.phaseId === CANONICAL_PHASE_IDS.YUE_FESTIVAL_TOUR
        ? YUE_FESTIVAL_TOUR_DIALOGUES
      : this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_END
        ? NODOKA_DATE_END_DIALOGUES
        : PHASE_DIALOGUES[this.#state.phaseId] ?? [];
    if (dialogues.length === 0) {
      return;
    }
    if (this.#state.dialogueIndex < dialogues.length - 1) {
      this.#state.dialogueIndex += 1;
      return;
    }
    this.#advanceFromDialoguePhase();
  }

  /** 完了状態から最初へ戻す。 */
  /** Return whether the current state is a stable free-exploration save point. */
  #canUseSaveData() {
    return [CANONICAL_PHASE_IDS.FREE_EXPLORE, CANONICAL_PHASE_IDS.LOCATION_ACTIONS]
      .includes(this.#state.phaseId);
  }

  /** Return whether the active slot contains a compatible save payload. */
  #hasSavedGame() {
    if (!this.#storage?.getItem) {
      return false;
    }
    try {
      const raw = this.#storage.getItem(CANONICAL_SAVE_STORAGE_KEY);
      const payload = raw ? JSON.parse(raw) : null;
      return payload?.version === CANONICAL_SAVE_DATA_VERSION
        && payload?.state
        && Array.isArray(payload.rewindHistory);
    } catch {
      return false;
    }
  }

  /** Set a transient save/load result for the status block and log. */
  #setSaveStatus(kind, text) {
    this.#state.saveStatus = { kind, text };
    this.#addLog(text);
  }

  /** Save the current free-exploration state to the active browser slot. */
  #saveGame() {
    if (!this.#canUseSaveData()) {
      this.#setSaveStatus('error', '自由探索中のみセーブできます。');
      return;
    }
    if (!this.#storage?.setItem) {
      this.#setSaveStatus('error', 'セーブ機能を利用できません。');
      return;
    }
    const payload = {
      version: CANONICAL_SAVE_DATA_VERSION,
      state: cloneCanonicalState(this.#state),
      rewindHistory: this.#rewindHistory.map((checkpoint) => ({
        key: checkpoint.key,
        state: cloneCanonicalState(checkpoint.state),
      })),
    };
    try {
      this.#storage.setItem(CANONICAL_SAVE_STORAGE_KEY, JSON.stringify(payload));
      this.#setSaveStatus('success', 'セーブしました。');
    } catch {
      this.#setSaveStatus('error', 'セーブに失敗しました。');
    }
  }

  /** Load the active browser slot during free exploration. */
  #loadGame() {
    if (!this.#canUseSaveData()) {
      this.#setSaveStatus('error', '自由探索中のみロードできます。');
      return;
    }
    if (!this.#storage?.getItem) {
      this.#setSaveStatus('error', 'ロード機能を利用できません。');
      return;
    }
    let payload;
    try {
      const raw = this.#storage.getItem(CANONICAL_SAVE_STORAGE_KEY);
      payload = raw ? JSON.parse(raw) : null;
    } catch {
      payload = null;
    }
    if (!payload || payload.version !== CANONICAL_SAVE_DATA_VERSION || !payload.state || !Array.isArray(payload.rewindHistory)) {
      this.#setSaveStatus('error', 'ロードできるセーブデータがありません。');
      return;
    }
    const hasValidCheckpoint = payload.rewindHistory.every((checkpoint) => (
      checkpoint
      && typeof checkpoint.key === 'string'
      && checkpoint.state
      && checkpoint.state.gameTime
      && typeof checkpoint.state.phaseId === 'string'
    ));
    if (!payload.state.gameTime || typeof payload.state.phaseId !== 'string' || !hasValidCheckpoint) {
      this.#setSaveStatus('error', 'セーブデータが壊れています。');
      return;
    }
    try {
      this.#state = cloneCanonicalState(payload.state);
      this.#state.saveStatus = { kind: 'success', text: 'ロードしました。' };
      this.#rewindHistory = payload.rewindHistory.map((checkpoint) => ({
        key: checkpoint.key,
        state: cloneCanonicalState(checkpoint.state),
      }));
    } catch {
      this.#setSaveStatus('error', 'セーブデータが壊れています。');
      return;
    }
    this.#skipSimulationThisFrame = true;
    this.#addLog('ロードしました。');
  }

  #restartRoute() {
    if (![CANONICAL_PHASE_IDS.COMPLETE, CANONICAL_PHASE_IDS.GAME_OVER].includes(this.#state.phaseId)) {
      return;
    }
    this.#state = createInitialState();
  }

  /** Skip the tutorial and enter the post-Eva free-explore state. */
  #skipTutorial() {
    if (!this.#isTutorialPhase()) {
      return;
    }
    const skippedLog = 'チュートリアルをスキップした。';
    this.#state = createInitialState();
    this.#state.isTutorialSkipped = true;
    this.#state.isTutorialCompleted = true;
    this.#state.phoneTimeLabel = '20:06';
    this.#state.magicPower = MAGIC_POWER_MAX - INITIAL_CASSIOPEIA_MP_COST;
    this.#state.gameTime = copyTime(CANONICAL_TIMES.SECOND_OPENING);
    this.#state.chaoSearch.targetLocationId = CHAO_SEARCH_LOCATIONS[0].id;
    this.#state.chaoSearch.foundLocationId = CHAO_SEARCH_LOCATIONS[0].id;
    this.#state.chaoSearch.hasCassiopeiaManual = true;
    this.#state.chaoSearch.isSetsunaWaiting = false;
    this.#resetFreeExploreState('entrance-gate');
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    this.#recordRewindCheckpoint();
    this.#state.gameTime = {
      ...this.#state.gameTime,
      hour: 14,
      minute: 0,
      label: 'PM2:00',
    };
    this.#addLog(skippedLog);
  }

  /** Return whether the current phase is part of the tutorial. */
  #isTutorialPhase() {
    return !this.#state.isTutorialCompleted
      && CANONICAL_TUTORIAL_PHASE_IDS.includes(this.#state.phaseId);
  }

  /** 移動可能な段階でプレイヤーを動かす。 */
  #updateMovement(deltaSeconds) {
    void deltaSeconds;
  }

  /** 同行者をプレイヤーの移動履歴へ追従させる。 */
  #updateCompanions() {
    this.#state.companionPositions.kamo = {
      x: this.#state.playerPosition.x - 0.7,
      y: this.#state.playerPosition.y + 0.4,
    };
    if (this.#state.companionPositions.setsuna) {
      this.#state.companionPositions.setsuna = getTrailPositionBehind(
        this.#state.playerTrail,
        COMPANION_FOLLOW_DISTANCE,
      ) ?? copyPosition(this.#state.playerPosition);
    }
    if (this.#state.companionPositions.kotaro) {
      this.#state.companionPositions.kotaro = getTrailPositionBehind(
        this.#state.playerTrail,
        COMPANION_FOLLOW_DISTANCE,
      ) ?? copyPosition(this.#state.playerPosition);
    }
    if (this.#state.companionPositions.yue) {
      this.#state.companionPositions.yue = getTrailPositionBehind(
        this.#state.playerTrail,
        COMPANION_FOLLOW_DISTANCE,
      ) ?? copyPosition(this.#state.playerPosition);
    }
  }

  /** 現在のネギ座標を移動履歴へ追加する。 */
  #recordPlayerTrail() {
    const trail = this.#state.playerTrail;
    const lastPosition = trail[trail.length - 1];
    if (lastPosition && getDistance(lastPosition, this.#state.playerPosition) < PLAYER_TRAIL_MIN_DISTANCE) {
      return;
    }
    trail.push(copyPosition(this.#state.playerPosition));
    if (trail.length > PLAYER_TRAIL_MAX_LENGTH) {
      trail.splice(0, trail.length - PLAYER_TRAIL_MAX_LENGTH);
    }
  }

  /** ネギを指定座標へ置き、必要なら移動履歴をリセットする。 */
  #placePlayer(position, resetTrail = true) {
    this.#state.playerPosition = copyPosition(position);
    if (resetTrail) {
      this.#state.playerTrail = [copyPosition(position)];
    }
    this.#updateCompanions();
  }

  /** 現在段階の自動進行条件を判定する。 */
  #updatePhaseProgress(deltaSeconds) {
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA) {
      this.#updateHideFromNodoka(deltaSeconds);
    }
    this.#updateFestivalNotifications();
  }

  /** 麻帆良祭の放送通知を現在時刻に応じて発生させる。 */
  #updateFestivalNotifications() {
    const currentMinute = getMinuteOfDay(this.#state.gameTime);
    const notifications = [];
    for (const definition of FESTIVAL_NOTIFICATION_DEFINITIONS) {
      if (currentMinute < definition.triggerMinute) {
        continue;
      }
      const notificationKey = `${this.#state.gameTime.festivalDay}:${this.#state.gameTime.loopCount}:${definition.id}`;
      if (this.#state.festivalNotifications.shownKeys.includes(notificationKey)) {
        continue;
      }
      this.#state.festivalNotifications.shownKeys.push(notificationKey);
      notifications.push({
        id: definition.id,
        speaker: definition.speaker,
        text: definition.text,
      });
      if (definition.id === 'mahora-budokai-delay') {
        this.#resetTournamentProgressForCurrentLoop();
      }
    }

    for (const entry of FESTIVAL_STALL_SCHEDULE) {
      const excitement = this.#state.festivalStallExcitement[entry.id];
      if (excitement <= FESTIVAL_STALL_EXCITEMENT_NOTIFICATION_RESET) {
        this.#state.festivalStallNotificationArmed[entry.id] = true;
      }
      if (excitement < FESTIVAL_STALL_EXCITEMENT_NOTIFICATION_THRESHOLD
        || !this.#state.festivalStallNotificationArmed[entry.id]) {
        continue;
      }
      this.#state.festivalStallNotificationArmed[entry.id] = false;
      notifications.push({
        id: `festival-stall-excitement-${entry.id}`,
        speaker: '麻帆良祭放送',
        text: `${entry.title}の盛り上がりが60以上になった。`,
      });
    }

    if (notifications.length > 0) {
      this.#showFestivalNotifications(notifications);
    }
  }

  /** Show all notifications emitted by the same state update and retain them in the log. */
  #showFestivalNotifications(notifications) {
    this.#state.festivalNotifications.current = notifications.map((notification) => ({ ...notification }));
    for (const notification of notifications) {
      this.#addLog(`${notification.speaker}: ${notification.text}`);
    }
  }

  /** Clear the currently displayed festival notification while retaining its log entry. */
  #clearCurrentFestivalNotification() {
    this.#state.festivalNotifications.current = [];
  }

  /** 現在ループの武道会導線を通知直後の状態へ初期化する。 */
  #resetTournamentProgressForCurrentLoop() {
    this.#state.thirdLoop.tournamentNotificationShown = true;
    this.#state.thirdLoop.tournamentKotaroJoined = false;
    this.#state.thirdLoop.tournamentVenueConfirmed = false;
    this.#state.thirdLoop.tournamentRegistered = false;
    this.#state.thirdLoop.tournamentResult = null;
    this.#state.thirdLoop.tournamentBattle = null;
    this.#state.companionPositions.kotaro = null;
  }

  /** 現在のループで指定した麻帆良祭通知が表示済みか返す。 */
  #hasFestivalNotificationShown(notificationId) {
    const notificationKey = `${this.#state.gameTime.festivalDay}:${this.#state.gameTime.loopCount}:${notificationId}`;
    return this.#state.festivalNotifications.shownKeys.includes(notificationKey);
  }

  /** 目的地へ接近したら移動段階を完了する。 */
  #completeMovementIfNear(position, complete) {
    if (getDistance(this.#state.playerPosition, position) > CANONICAL_COMPLETION_RADIUS) {
      return;
    }
    this.#state.movementInput = { x: 0, y: 0 };
    complete();
  }

  /** 会話段階の最後から次の段階へ移る。 */
  #advanceFromDialoguePhase() {
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.PROLOGUE) {
      this.#setPhase(CANONICAL_PHASE_IDS.OPENING);
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.OPENING) {
      this.#setPhase(CANONICAL_PHASE_IDS.MOVE_TO_3A);
      this.#addLog('3-Aへ向かう目的が表示された。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.HAUNTED_HOUSE_PANIC_RUN) {
      this.#completeHauntedHouse(false);
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.HAUNTED_HOUSE_RESULT) {
      this.#leaveHauntedHouse();
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.SLEEP) {
      this.#advanceGameTime(CANONICAL_TIMES.OVERSLEPT);
      this.#state.phoneTimeLabel = '20:06';
      this.#setPhase(CANONICAL_PHASE_IDS.REWIND);
      this.#addLog('携帯電話が20:06を示した。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.REWIND) {
      this.#completeRewind();
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.CAFE) {
      this.#enterFollowNodoka();
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA) {
      this.#setPhase(CANONICAL_PHASE_IDS.TIME_TRAVEL_CONFIRMED);
      this.#addLog('物陰でやり過ごし、タイムスリップの確信へ進んだ。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.TIME_TRAVEL_CONFIRMED) {
      this.#enterEvaEscape();
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW) {
      if (this.#state.chaoSearch.targetLocationId === 'airship') {
        this.#setPhase(CANONICAL_PHASE_IDS.MEET_CHAO);
        this.#addLog("Chaoを発見した。");
        return;
        this.#state.isTutorialCompleted = true;
        if (getMinuteOfDay(this.#state.gameTime) < 14 * 60) {
          this.#advanceFreeExploreTime(14 * 60 - getMinuteOfDay(this.#state.gameTime));
        }
        this.#setMainEvent(CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE_PREPARE, false);
        this.#returnToFreeExplore();
        /*
        this.#addLog('繝√Ε繧ｪ繧呈ｫ九▽縺代√メ繝･繝ｼ繝医Μ繧｢繝ｫ繧堤ｵゆｺ・＠縺溘・);
        return;
        this.#addLog('飛行船内でチャオと出会った。');
        return;
        */
      }
      this.#returnToFreeExplore();
      this.#addLog('飛行船で得た全体地図を手掛かりに探索を続けた。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.MEET_CHAO) {
      this.#state.isTutorialCompleted = true;
      if (getMinuteOfDay(this.#state.gameTime) < 14 * 60) {
        this.#advanceFreeExploreTime(14 * 60 - getMinuteOfDay(this.#state.gameTime));
      }
      this.#setMainEvent(
        getMinuteOfDay(this.#state.gameTime) < getMinuteOfDay(CANONICAL_TIMES.NODOKA_DATE)
          ? CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE_PREPARE
          : CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE,
        false,
      );
      this.#returnToFreeExplore();
      this.#addLog("チャオ探索を終了し、チュートリアルを完了した。");
      return;
      this.#state.chaoSearch.hasCassiopeiaManual = true;
      if (getMinuteOfDay(this.#state.gameTime) < 14 * 60) {
        this.#advanceFreeExploreTime(14 * 60 - getMinuteOfDay(this.#state.gameTime));
      }
      if (getMinuteOfDay(this.#state.gameTime) < getMinuteOfDay(CANONICAL_TIMES.NODOKA_DATE)) {
        this.#setMainEvent(CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE_PREPARE, false);
      } else {
        this.#setMainEvent(CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE, false);
      }
      this.#setPhase(CANONICAL_PHASE_IDS.REVIEW_SCHEDULE);
      this.#addLog('カシオペアの説明書を受け取った。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.REVIEW_SCHEDULE) {
      this.#state.isTutorialCompleted = true;
      this.#returnToFreeExplore();
      this.#addLog('自由探索へ戻った。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.TOURNAMENT_KOTARO) {
      this.#state.thirdLoop.tournamentKotaroJoined = true;
      this.#state.companionPositions.kotaro = copyPosition(this.#state.playerPosition);
      this.#resetFreeExploreState('ground');
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
      this.#addLog('小太郎がパーティに加わり、まほら武道会会場へ向かえるようになった。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.TOURNAMENT_RECEPTION) {
      this.#state.thirdLoop.tournamentRegistered = true;
      this.#markScheduleEventCompleted('mahora-budokai-reception');
      this.#resetFreeExploreState('ryugu-shrine');
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
      this.#addLog('まほら武道会の受付を完了した。予選はPM7:00から始まる。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_PREPARE_FINISH) {
      this.#finishNodokaDatePreparation();
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE) {
      this.#enterEscapePatrolStudents();
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_KISS) {
      this.#state.cgFlags.nodokaKiss = true;
      this.#state.persistentEvents.hasUnlockedYueFestivalTour = true;
      this.#addLog('のどかとのキスシーンを見届け、CG取得フラグが立った。');
      this.#finishNodokaDate();
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_END) {
      this.#finishNodokaDate();
    } else {
      this.#advanceFromDialoguePhaseRemaining();
    }
  }

  /** のどかとのデート終了後の共通進行を実行する。 */
  #finishNodokaDate() {
    this.#state.chaoSearch.isNodokaDateCompleted = true;
    this.#markScheduleEventCompleted('nodoka-date');
    this.#state.chaoSearch.returnAfterNodokaDatePhaseId = null;
    this.#advanceGameTime(this.#getNodokaDateEndTime());
    this.#returnToFreeExplore();
    this.#clearMainEvent(false);
  }

  /** デート準備イベントを終了し、PM4:00の自由探索へ戻る。 */
  #finishNodokaDatePreparation() {
    this.#state.prepareDate.interactionDialogue = null;
    this.#state.prepareDate.hasStarted = false;
    this.#state.prepareDate.isLoopCompleted = true;
    this.#clearMainEvent(false);
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    this.#addLog('デート準備を終了し、のどかとのデートを受け付ける状態になった。');
  }

  /** 屋台通りで木乃香に話しかけ、デート準備の会話を開始する。 */
  #startNodokaDatePreparation() {
    const currentMinute = getMinuteOfDay(this.#state.gameTime);
    if (
      this.#state.prepareDate.hasStarted
      || this.#state.prepareDate.isLoopCompleted
      || this.#state.chaoSearch.hasMissedNodokaDate
      || currentMinute < 14 * 60
      || currentMinute >= 16 * 60
      || this.#state.freeExplore.currentLocationId !== PREPARE_DATE_KONOKA.areaId
    ) {
      return;
    }
    this.#state.prepareDate.hasStarted = true;
    this.#setMainEvent(CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE_PREPARE, false);
    this.#state.prepareDate.interactionDialogue = {
      speaker: '木乃香',
      text: 'ネギ君、のどかとのデートやろ？ どの服装で行くか決めよか。',
      anchor: { type: 'actor', id: PREPARE_DATE_KONOKA.id },
    };
    this.#setPhase(CANONICAL_PHASE_IDS.PREPARE_DATE_OUTFIT);
    this.#addLog('屋台通りで木乃香に話しかけ、のどかデート準備を開始した。');
  }

  /** Select the date ending after the patrol students are shaken off. */
  #completeNodokaDateEscape() {
    this.#placePlayer(SCHOOL_POSITIONS.ESCAPE_GOAL);
    if (
      this.#getClassmateAffection('nodoka') >= NODOKA_AFFECTION_KISS_THRESHOLD
      && this.#getNodokaDatePreparationEvaluation() >= NODOKA_DATE_KISS_EVALUATION_THRESHOLD
    ) {
      this.#setPhase(CANONICAL_PHASE_IDS.NODOKA_DATE_KISS);
      return;
    }
    this.#setPhase(CANONICAL_PHASE_IDS.NODOKA_DATE_NORMAL);
  }

  /** 会話に応じてのどかの好感度を増やす。 */
  #getClassmateAffection(actorId) {
    return this.#state.affection[actorId] ?? CLASSMATE_AFFECTION_INITIAL;
  }

  /** Calculate the preparation and outfit evaluation used by the date ending. */
  #getNodokaDatePreparationEvaluation() {
    return this.#state.prepareDate.preparationScore + this.#getCurrentOutfit().modifier;
  }

  /** Mark a schedule event as permanently completed across loops. */
  #markScheduleEventCompleted(eventId) {
    if (!this.#state.persistentEvents.completedScheduleEventIds.includes(eventId)) {
      this.#state.persistentEvents.completedScheduleEventIds.push(eventId);
    }
  }

  /** Return whether a schedule event has been completed in any loop. */
  #isScheduleEventCompleted(eventId) {
    return this.#state.persistentEvents.completedScheduleEventIds.includes(eventId);
  }

  /** Increase one classmate's affection after a conversation. */
  #increaseClassmateAffection(actorId) {
    if (!(actorId in this.#state.affection)) {
      return;
    }
    this.#state.affection[actorId] = Math.min(
      CLASSMATE_AFFECTION_MAX,
      this.#getClassmateAffection(actorId) + CLASSMATE_AFFECTION_PER_CONVERSATION,
    );
  }

  /** デート以外の会話段階を次へ進める。 */
  #advanceFromDialoguePhaseRemaining() {
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.WORLD_TREE_MAGIC) {
      this.#state.gameTime = {
        ...this.#state.gameTime,
        label: createTimeLabel(this.#state.gameTime.hour, this.#state.gameTime.minute),
      };
      this.#resetFreeExploreState('world-tree');
      this.#clearMainEvent(false);
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
      this.#addLog('世界樹の事件が収束し、同じループの自由探索へ戻った。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.RETURN_TO_THIRD_LOOP) {
      this.#state.gameTime = createNextLoopTime(this.#state.gameTime, 15, 0);
      this.#enterThirdLoopPatrol();
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.THIRD_LOOP_BOAT) {
      this.#advanceGameTime(createCurrentLoopTime(this.#state.gameTime, 17, 0));
      this.#setPhase(CANONICAL_PHASE_IDS.THIRD_LOOP_DINNER);
      this.#addLog('夕映と観光船を楽しみ、夕食の時間になった。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.THIRD_LOOP_DINNER) {
      this.#state.companionPositions.kotaro = null;
      this.#resetFreeExploreState('ground');
      this.#placePlayer(SCHOOL_POSITIONS.GROUND_TOURNAMENT);
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.TOURNAMENT_VENUE) {
      this.#resetFreeExploreState('ground');
      this.#placePlayer(SCHOOL_POSITIONS.GROUND_TOURNAMENT);
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
      this.#addLog('まほら武道会会場の確認を終え、自由探索へ戻った。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.TOURNAMENT_QUALIFIER) {
      this.#advanceGameTime(createCurrentLoopTime(this.#state.gameTime, 21, 0));
      this.#setPhase(CANONICAL_PHASE_IDS.DAY1_DEBRIEF);
      this.#addLog('武道会予選を突破し、3-Aの反省会へ向かった。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.DAY1_DEBRIEF) {
      this.#setPhase(CANONICAL_PHASE_IDS.REWIND_TO_FOURTH_LOOP);
      this.#addLog('未体験の出し物を別ループで回る方針にした。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.REWIND_TO_FOURTH_LOOP) {
      this.#state.gameTime = createNextLoopTime(this.#state.gameTime, 11, 30);
      this.#enterFourthLoopHauntedHouseActions();
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR) {
      this.#advanceGameTime({
        ...this.#state.gameTime,
        hour: 18,
        minute: 0,
        label: 'PM6:00',
      });
      this.#state.activeEvent = null;
      this.#markScheduleEventCompleted('haunted-house-help');
      this.#markScheduleEventCompleted('haunted-house-flyer-ayaka');
      this.#state.companionPositions.kotaro = null;
      this.#state.thirdLoop.isAyakaCompanion = false;
      this.#resetFreeExploreState('hall');
      this.#placePlayer(SCHOOL_POSITIONS.CLASS_3A);
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
      this.#addLog('あやかとクラスメイトの出し物巡りを終え、PM6:00に自由探索へ戻った。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.YUE_FESTIVAL_TOUR) {
      this.#advanceGameTime({
        ...this.#state.gameTime,
        hour: CANONICAL_TIMES.YUE_FESTIVAL_TOUR_END.hour,
        minute: CANONICAL_TIMES.YUE_FESTIVAL_TOUR_END.minute,
        label: CANONICAL_TIMES.YUE_FESTIVAL_TOUR_END.label,
      });
      this.#state.activeEvent = null;
      this.#markScheduleEventCompleted('yue-festival-tour');
      this.#state.companionPositions.yue = null;
      this.#resetFreeExploreState('dining-street');
      this.#placePlayer(SCHOOL_POSITIONS.CAFE);
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
      this.#addLog('夕映との麻帆良祭巡りを終え、PM6:00に自由探索へ戻った。');
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.FESTIVAL_ENDING) {
      this.#startGameOver();
    } else if (this.#state.phaseId === CANONICAL_PHASE_IDS.FOURTH_LOOP_HAUNTED_RETURN) {
      this.#state.thirdLoop.isAyakaCompanion = true;
      this.#enterClassmateAttractionTour();
      return;
    }
  }

  /** 進行段階を切り替える。 */
  #setPhase(phaseId) {
    this.#state.phaseId = phaseId;
    this.#state.dialogueIndex = 0;
  }

  /** 3-A到着後にお化け屋敷へ入る。 */
  #enterHauntedHouse() {
    this.#setPhase(CANONICAL_PHASE_IDS.SELECT_HAUNTED_DIFFICULTY);
    this.#state.movementInput = { x: 0, y: 0 };
    this.#addLog('3-Aホラーハウスのコース選択に入った。');
  }

  /** 選択された難易度でホラーハウスを開始する。 */
  #selectHauntedDifficulty(choiceId) {
    const difficulty = HAUNTED_DIFFICULTIES[choiceId];
    if (!difficulty) {
      return;
    }
    this.#state.hauntedDifficultyId = difficulty.id;
    this.#state.hauntedPanic = 0;
    this.#state.hauntedResult = null;
    this.#state.hauntedScareIndex = 0;
    this.#state.activeScare = null;
    this.#setPhase(CANONICAL_PHASE_IDS.HAUNTED_HOUSE);
    this.#placePlayer(HAUNTED_POSITIONS.ENTRANCE);
    this.#addLog(`3-Aホラーハウスの${difficulty.label}コースに入った。`);
  }

  /** お化け屋敷の演出と出口到達を判定する。 */
  #updateHauntedHouseProgress(deltaSeconds) {
    if (this.#state.activeScare) {
      return;
    }
    this.#recoverHauntedPanic(deltaSeconds);
    const scarePoints = this.#getHauntedScarePoints();
    const nextScare = scarePoints[this.#state.hauntedScareIndex];
    if (nextScare && getDistance(this.#state.playerPosition, nextScare.position) <= CANONICAL_COMPLETION_RADIUS) {
      this.#state.activeScare = nextScare;
      this.#state.movementInput = { x: 0, y: 0 };
      this.#addLog(`お化け屋敷の演出「${nextScare.title}」が発生した。`);
      return;
    }
    if (
      !nextScare
      && getDistance(this.#state.playerPosition, HAUNTED_POSITIONS.EXIT) <= CANONICAL_COMPLETION_RADIUS
    ) {
      this.#completeHauntedHouse(true);
    }
  }

  /** 停止中のホラーハウスパニックメーターを自然回復させる。 */
  #recoverHauntedPanic(deltaSeconds) {
    if (this.#state.movementInput.x !== 0 || this.#state.movementInput.y !== 0) {
      return;
    }
    this.#state.hauntedPanic = clamp(
      this.#state.hauntedPanic - HAUNTED_PANIC_RECOVERY_PER_SECOND * deltaSeconds,
      0,
      HAUNTED_PANIC_MAX,
    );
  }

  /** 発生中のお化け屋敷演出を完了する。 */
  #completeActiveScare() {
    const difficulty = HAUNTED_DIFFICULTIES[this.#state.hauntedDifficultyId];
    this.#state.hauntedPanic = clamp(
      this.#state.hauntedPanic + difficulty.panicIncrease,
      0,
      HAUNTED_PANIC_MAX,
    );
    this.#state.hauntedScareIndex += 1;
    this.#state.activeScare = null;
    if (this.#state.hauntedPanic >= HAUNTED_PANIC_MAX) {
      this.#state.movementInput = { x: 0, y: 0 };
      this.#setPhase(CANONICAL_PHASE_IDS.HAUNTED_HOUSE_PANIC_RUN);
      this.#addLog('パニックメーターが最大になった。');
    }
  }

  /** 現在難易度で使う演出地点を返す。 */
  #getHauntedScarePoints() {
    const difficulty = HAUNTED_DIFFICULTIES[this.#state.hauntedDifficultyId];
    return HAUNTED_SCARE_POINTS.slice(0, difficulty.scareCount);
  }

  /** ホラーハウス結果を確定する。 */
  #completeHauntedHouse(isCleared) {
    this.#state.hauntedResult = isCleared ? 'cleared' : 'uncleared';
    if (!isCleared && !this.#state.hauntedRechallengeIds.includes(this.#state.hauntedDifficultyId)) {
      this.#state.hauntedRechallengeIds.push(this.#state.hauntedDifficultyId);
    }
    this.#setPhase(CANONICAL_PHASE_IDS.HAUNTED_HOUSE_RESULT);
    this.#addLog(isCleared ? 'ホラーハウスをクリアした。' : 'ホラーハウスは未クリアとして記録された。');
  }

  /** ホラーハウスを出て保健室への移動に合流する。 */
  #leaveHauntedHouse() {
    this.#advanceGameTime(CANONICAL_TIMES.AFTER_HAUNTED);
    this.#placePlayer(SCHOOL_POSITIONS.AFTER_HAUNTED);
    this.#state.companionPositions.setsuna = { x: SCHOOL_POSITIONS.AFTER_HAUNTED.x - 1.1, y: SCHOOL_POSITIONS.AFTER_HAUNTED.y - 0.4 };
    this.#setPhase(CANONICAL_PHASE_IDS.MOVE_TO_HEALTH_ROOM);
    this.#addLog('お化け屋敷を出て、刹那が同行に加わった。');
  }

  /** 保健室到着後に仮眠段階へ入る。 */
  #enterSleep() {
    this.#state.gameTime = copyTime(CANONICAL_TIMES.AFTER_HAUNTED);
    this.#setPhase(CANONICAL_PHASE_IDS.SLEEP);
    this.#addLog('保健室に到着した。');
  }

  /** 初回カシオペア起動を完了する。 */
  #completeRewind() {
    const rewindPosition = copyPosition(this.#state.playerPosition);
    this.#state.gameTime = copyTime(CANONICAL_TIMES.REWOUND);
    this.#state.magicPower = MAGIC_POWER_MAX - INITIAL_CASSIOPEIA_MP_COST;
    this.#placePlayer(rewindPosition);
    this.#setPhase(CANONICAL_PHASE_IDS.MOVE_TO_CAFE);
    this.#addLog('カシオペアでAM09:55へ戻った。');
  }

  /** カフェ到着後に会話段階へ入る。 */
  #enterCafe() {
    this.#advanceGameTime(CANONICAL_TIMES.SECOND_OPENING);
    this.#setPhase(CANONICAL_PHASE_IDS.CAFE);
    this.#addLog('カフェでのどかと遭遇した。');
  }

  /** のどか尾行段階を開始する。 */
  #enterFollowNodoka() {
    this.#setPhase(CANONICAL_PHASE_IDS.FOLLOW_NODOKA);
    this.#placePlayer(SCHOOL_POSITIONS.FOLLOW_START);
    this.#state.nodokaPosition = copyPosition(SCHOOL_POSITIONS.NODOKA_START);
    this.#state.nodokaWaypointIndex = 0;
    this.#state.nodokaTooCloseSeconds = 0;
    this.#state.nodokaTooFarSeconds = 0;
    this.#addLog('のどかの尾行を開始した。');
  }

  /** のどかの移動と距離条件を更新する。 */
  #updateNodokaFollow(deltaSeconds) {
    const waypoint = NODOKA_WAYPOINTS[this.#state.nodokaWaypointIndex + 1];
    if (waypoint) {
      this.#state.nodokaPosition = moveToward(
        this.#state.nodokaPosition,
        waypoint,
        NODOKA_SPEED_CELLS_PER_SECOND * deltaSeconds,
      );
      if (getDistance(this.#state.nodokaPosition, waypoint) < 0.01) {
        this.#state.nodokaWaypointIndex += 1;
      }
    }
    const distance = getDistance(this.#state.playerPosition, this.#state.nodokaPosition);
    if (distance < NODOKA_TOO_CLOSE_DISTANCE) {
      this.#state.nodokaTooCloseSeconds += deltaSeconds;
      this.#state.nodokaTooFarSeconds = 0;
    } else if (distance > NODOKA_TOO_FAR_DISTANCE) {
      this.#state.nodokaTooFarSeconds += deltaSeconds;
      this.#state.nodokaTooCloseSeconds = 0;
    } else {
      this.#state.nodokaTooCloseSeconds = 0;
      this.#state.nodokaTooFarSeconds = 0;
    }
    if (
      this.#state.nodokaTooCloseSeconds >= NODOKA_TOO_CLOSE_LIMIT_SECONDS
      || this.#state.nodokaTooFarSeconds >= NODOKA_TOO_FAR_LIMIT_SECONDS
    ) {
      this.#retryFollowNodoka();
      return;
    }
    const isFinished = this.#state.nodokaWaypointIndex >= NODOKA_WAYPOINTS.length - 1;
    if (isFinished && distance >= NODOKA_TOO_CLOSE_DISTANCE && distance <= NODOKA_TOO_FAR_DISTANCE) {
      this.#enterHideFromNodoka();
    }
  }

  /** 尾行失敗時に尾行開始状態へ戻す。 */
  #retryFollowNodoka() {
    this.#state.retryCount += 1;
    this.#placePlayer(SCHOOL_POSITIONS.FOLLOW_START);
    this.#state.nodokaPosition = copyPosition(SCHOOL_POSITIONS.NODOKA_START);
    this.#state.nodokaWaypointIndex = 0;
    this.#state.nodokaTooCloseSeconds = 0;
    this.#state.nodokaTooFarSeconds = 0;
    this.#state.movementInput = { x: 0, y: 0 };
    this.#addLog('尾行に失敗し、開始位置から再試行する。');
  }

  /** のどかから隠れる段階を開始する。 */
  #enterHideFromNodoka() {
    const nodokaTurnPosition = copyPosition(this.#state.nodokaPosition);
    this.#setPhase(CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA);
    this.#placePlayer(SCHOOL_POSITIONS.HIDE_START);
    this.#state.nodokaPosition = nodokaTurnPosition;
    this.#state.hideElapsedSeconds = 0;
    this.#state.hideResult = null;
    this.#state.movementInput = { x: 0, y: 0 };
    this.#addLog('のどかが振り返りそうになった。');
  }

  /** のどかの視線判定を更新する。 */
  #updateHideFromNodoka(deltaSeconds) {
    this.#state.hideElapsedSeconds += deltaSeconds;
  }

  /** 隠れる失敗時に開始状態へ戻す。 */
  #retryHideFromNodoka() {
    this.#state.retryCount += 1;
    this.#placePlayer(SCHOOL_POSITIONS.HIDE_START);
    this.#state.hideElapsedSeconds = 0;
    this.#state.hideResult = 'found';
    this.#state.movementInput = { x: 0, y: 0 };
    this.#addLog('のどかに見つかり、隠れる場面を再試行する。');
  }

  /** エヴァ逃走段階を開始する。 */
  #enterEvaEscape() {
    this.#setPhase(CANONICAL_PHASE_IDS.EVA_ESCAPE);
    this.#placePlayer(SCHOOL_POSITIONS.EVA_PLAYER_START);
    this.#state.evaPosition = copyPosition(SCHOOL_POSITIONS.EVA_START);
    this.#state.evaElapsedSeconds = 0;
    this.#state.evaResult = null;
    this.#state.movementInput = { x: 0, y: 0 };
    this.#addLog('エヴァからの逃走を開始した。');
  }

  /** エヴァの追跡と捕捉条件を更新する。 */
  #updateEvaEscape(deltaSeconds) {
    this.#state.evaElapsedSeconds += deltaSeconds;
    if (this.#state.evaElapsedSeconds > EVA_HEAD_START_SECONDS) {
      const chaseSeconds = Math.min(deltaSeconds, this.#state.evaElapsedSeconds - EVA_HEAD_START_SECONDS);
      this.#state.evaPosition = moveToward(
        this.#state.evaPosition,
        this.#state.playerPosition,
        CANONICAL_EVA_SPEED_CELLS_PER_SECOND * chaseSeconds,
      );
    }
    if (getDistance(this.#state.evaPosition, this.#state.playerPosition) <= EVA_CAPTURE_DISTANCE) {
      this.#completeEvaEscape('captured');
      return;
    }
    if (getDistance(this.#state.playerPosition, SCHOOL_POSITIONS.ESCAPE_GOAL) <= CANONICAL_COMPLETION_RADIUS) {
      this.#state.movementInput = { x: 0, y: 0 };
      this.#completeEvaEscape('escaped');
    }
  }

  /** エヴァ追跡の結果を確定して導入完了へ進む。 */
  #completeEvaEscape(result) {
    this.#state.evaResult = result;
    this.#state.movementInput = { x: 0, y: 0 };
    this.#state.gameTime = copyTime(CANONICAL_TIMES.SECOND_OPENING);
    this.#enterChaoSearch();
    this.#recordRewindCheckpoint();
    this.#advanceGameTime(CANONICAL_TIMES.CHAO_SEARCH);
    if (result === 'captured') {
      this.#addLog('エヴァに捕まり、事情を話してチャオ探索へ進んだ。');
      return;
    }
    this.#addLog('エヴァを振り切り、チャオ探索へ進んだ。');
  }

  /** チャオ探索段階を開始し、今回のチャオ出現場所を決める。 */
  #enterChaoSearch() {
    this.#state.chaoSearch.targetLocationId = 'airship';
    this.#state.chaoSearch.foundLocationId = null;
    this.#state.chaoSearch.visitedLocationIds = [];
    this.#state.chaoSearch.heardHintActorIds = [];
    this.#state.chaoSearch.hints = [];
    this.#state.chaoSearch.currentAttractionId = null;
    this.#state.chaoSearch.interactionDialogue = null;
    this.#state.chaoSearch.returnAfterNodokaDatePhaseId = null;
    this.#state.chaoSearch.pendingSetsunaChoice = false;
    this.#state.chaoSearch.isSetsunaWaiting = false;
    this.#state.companionPositions.setsuna = null;
    this.#initializeClassmateRandomLocations();
    this.#resetFreeExploreState('entrance-gate');
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    this.#setMainEvent(CANONICAL_MAIN_EVENT_IDS.CHAO_SEARCH, false);
    this.#addLog('刹那と一度解散し、チャオの聞き込み探索を始めた。');
  }

  /** チャオ探索中の選択肢を処理する。 */
  /** Reset the free-explore state around the current location. */
  #resetFreeExploreState(currentLocationId) {
    this.#state.freeExplore.currentLocationId = currentLocationId;
    this.#state.freeExplore.selectedActionId = null;
    this.#state.freeExplore.interruption = null;
    this.#state.freeExplore.actionResult = null;
    this.#state.classmateConversation.actorId = null;
  }

  /** 同一ループ内のゲーム時間を前進させ、経過分のMPを回復する。 */
  /** Return whether the current route is the fixed final-battle route. */
  #isFinalBattleRoute() {
    return this.#state.isFinalBattleRoute === true;
  }

  /** Enter the festival-ending cutscene when the prototype route reaches day 1 PM11:30. */
  #enforceFestivalEndDeadline() {
    if (
      this.#isFinalBattleRoute()
      || this.#state.phaseId === CANONICAL_PHASE_IDS.COMPLETE
      || this.#state.phaseId === CANONICAL_PHASE_IDS.FESTIVAL_ENDING
      || this.#state.phaseId === CANONICAL_PHASE_IDS.GAME_OVER
      || this.#state.gameTime.festivalDay !== 1
      || getMinuteOfDay(this.#state.gameTime) < (23 * 60 + 30)
    ) {
      return;
    }
    this.#state.gameTime = {
      ...this.#state.gameTime,
      hour: 23,
      minute: 30,
      label: 'PM11:30',
    };
    this.#state.freeExplore.libraryDungeon.isActive = false;
    this.#state.freeExplore.libraryDungeon.pendingBarrierCost = null;
    this.#state.movementInput = { x: 0, y: 0 };
    this.#setPhase(CANONICAL_PHASE_IDS.FESTIVAL_ENDING);
    this.#addLog('1日目PM11:30になり、麻帆良祭が終了した。');
  }

  /** Finish the festival-ending cutscene and trigger Chao's plan. */
  #startGameOver() {
    this.#state.gameTime = {
      ...this.#state.gameTime,
      hour: 23,
      minute: 37,
      label: 'PM11:37',
    };
    this.#state.gameOver.reason = 'チャオの計画が発動し、企みが成功した。';
    this.#state.movementInput = { x: 0, y: 0 };
    this.#setPhase(CANONICAL_PHASE_IDS.GAME_OVER);
    this.#addLog('PM11:37、チャオの計画が発動しゲームオーバーになった。');
  }

  #advanceGameTime(nextTime) {
    const previousTime = this.#state.gameTime;
    const elapsedMinutes = getForwardElapsedMinutes(previousTime, nextTime);
    const recoverySteps = Math.floor(elapsedMinutes / 5);
    this.#state.gameTime = copyTime(nextTime);
    this.#state.magicPower = Math.min(
      MAGIC_POWER_MAX,
      this.#state.magicPower + recoverySteps * MAGIC_POWER_RECOVERY_PER_FIVE_MINUTES,
    );
  }

  /** Advance the second-loop free-explore clock by whole minutes. */
  #advanceFreeExploreTime(minutes) {
    const previousMinute = getMinuteOfDay(this.#state.gameTime);
    const steps = Math.floor(minutes / FREE_EXPLORE_TIME_STEP_MINUTES);
    for (let index = 0; index < steps; index += 1) {
      this.#updateRandomFestivalStallExcitement();
    }
    const totalMinutes = getMinuteOfDay(this.#state.gameTime) + minutes;
    this.#advanceGameTime({
      ...this.#state.gameTime,
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
      label: createTimeLabelFromMinute(totalMinutes),
    });
    if (
      previousMinute < getMinuteOfDay(CANONICAL_TIMES.NODOKA_DATE)
      && getMinuteOfDay(this.#state.gameTime) >= getMinuteOfDay(CANONICAL_TIMES.NODOKA_DATE)
      && this.#state.mainEvent.activeEventId === CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE_PREPARE
    ) {
      this.#setPhase(CANONICAL_PHASE_IDS.NODOKA_DATE_PREPARE_FINISH);
      return;
    }
    if (getMinuteOfDay(this.#state.gameTime) > getMinuteOfDay(CANONICAL_TIMES.NODOKA_DATE_START_END)
      && !this.#state.chaoSearch.isNodokaDateCompleted) {
      this.#state.chaoSearch.hasMissedNodokaDate = true;
      if (this.#state.mainEvent.activeEventId === CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE) {
        this.#clearMainEvent(false);
      }
    }
  }

  /** Apply one five-minute random excitement change to the non-player stalls. */
  #updateRandomFestivalStallExcitement() {
    for (const id of ['gun-shooting', 'roller-coaster']) {
      const direction = this.#random() < 0.5 ? -1 : 1;
      this.#state.festivalStallExcitement[id] = Math.max(
        0,
        Math.min(
          HAUNTED_HOUSE_EXCITEMENT_MAX,
          this.#state.festivalStallExcitement[id] + direction * FESTIVAL_STALL_EXCITEMENT_RANDOM_STEP,
        ),
      );
    }
  }

  /** Return whether Nodoka can be spoken to for the date now. */
  #canTalkToNodokaDate() {
    return !this.#state.chaoSearch.isNodokaDateCompleted
      && !this.#state.chaoSearch.hasMissedNodokaDate
      && isMinuteBetweenInclusive(
        getMinuteOfDay(this.#state.gameTime),
        getMinuteOfDay(CANONICAL_TIMES.NODOKA_DATE),
        getMinuteOfDay(CANONICAL_TIMES.NODOKA_DATE_START_END),
      );
  }

  /** Return the current Nodoka date schedule and deadline end time. */
  #getNodokaDateEndTime() {
    const sourceTime = this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_KISS
      ? CANONICAL_TIMES.NODOKA_DATE_EXTENDED_END
      : CANONICAL_TIMES.NODOKA_DATE_END;
    return createCurrentLoopTime(this.#state.gameTime, sourceTime.hour, sourceTime.minute);
  }

  /** Return whether the unlocked Yue festival tour is within its time window. */
  #isYueFestivalTourTime() {
    return this.#state.persistentEvents.hasUnlockedYueFestivalTour
      && getMinuteOfDay(this.#state.gameTime) >= 16 * 60 + 30
      && getMinuteOfDay(this.#state.gameTime) < 18 * 60;
  }

  /** Return whether the Yue festival tour can start at the current location. */
  #canStartYueFestivalTour() {
    return this.#state.phaseId === CANONICAL_PHASE_IDS.LOCATION_ACTIONS
      && this.#state.freeExplore.currentLocationId === 'dining-street'
      && this.#isYueFestivalTourTime();
  }

  /** Return whether the haunted-house help event can start now in any loop. */
  #isHauntedHouseHelpTime() {
    return isMinuteBetweenInclusive(getMinuteOfDay(this.#state.gameTime), 11 * 60 + 30, 12 * 60);
  }

  /** Return whether the actor's scheduled attraction is open at the current time. */
  #isClassmateAttractionOpen(actor) {
    const schedule = CLASSMATE_ATTRACTION_SCHEDULE[actor.id];
    if (!schedule) {
      return false;
    }
    const currentMinute = getMinuteOfDay(this.#state.gameTime);
    return schedule.startMinute <= currentMinute && currentMinute < schedule.endMinute;
  }

  /** Return whether a classmate is currently reserved by a story placement. */
  #isClassmateStoryPlacementLocked(actor) {
    return (
      (actor.id === 'setsuna-attraction' && this.#state.chaoSearch.isSetsunaWaiting)
      || (
        actor.id === KOTARO_SOCIAL_ACTOR.id
        && this.#hasFestivalNotificationShown('mahora-budokai-delay')
        && !this.#state.thirdLoop.tournamentKotaroJoined
      )
    );
  }

  /** Assign random free-explore areas for all classmate attraction actors. */
  #initializeClassmateRandomLocations() {
    for (const actor of CLASSMATE_SOCIAL_ACTORS) {
      this.#state.classmateLocations[actor.id] = this.#pickRandomClassmateArea(null);
    }
  }

  /** Pick a random free-explore area, optionally excluding one area. */
  #pickRandomClassmateArea(excludedAreaId) {
    const candidates = CLASSMATE_FREE_EXPLORE_AREA_IDS
      .filter((areaId) => areaId !== excludedAreaId)
      .map((areaId) => this.#getFreeExploreDestination(areaId))
      .filter(Boolean);
    const index = Math.min(
      candidates.length - 1,
      Math.max(0, Math.floor(this.#random() * candidates.length)),
    );
    return candidates[index]?.id ?? 'entrance-gate';
  }

  /** Roll movement for off-schedule classmates during free-explore travel beats. */
  #rollRandomClassmateMovement() {
    for (const actor of CLASSMATE_SOCIAL_ACTORS) {
      if (this.#isClassmateAttractionOpen(actor) || this.#isClassmateStoryPlacementLocked(actor)) {
        continue;
      }
      const currentAreaId = this.#getClassmateCurrentAreaId(actor);
      if (this.#random() < CLASSMATE_RANDOM_MOVE_RATE) {
        this.#state.classmateLocations[actor.id] = this.#pickRandomClassmateArea(currentAreaId);
      }
    }
  }

  /** Return the area where a classmate currently appears in free exploration. */
  #getClassmateCurrentAreaId(actor) {
    if (actor.id === NODOKA_SOCIAL_ACTOR.id && this.#canTalkToNodokaDate()) {
      return 'dining-street';
    }
    if (actor.id === 'yue' && this.#isYueFestivalTourTime()) {
      return 'dining-street';
    }
    if (this.#isClassmateAttractionOpen(actor)) {
      return this.#getClassmateAttractionArea(actor).id;
    }
    if (this.#isClassmateStoryPlacementLocked(actor)) {
      return null;
    }
    if (!this.#state.classmateLocations[actor.id]) {
      this.#state.classmateLocations[actor.id] = this.#pickRandomClassmateArea(null);
    }
    return this.#state.classmateLocations[actor.id];
  }

  /** Create the current location and activity status for every modeled classmate. */
  #createClassmateStatusSnapshot() {
    const statusEntries = [];
    const socialActorIds = new Set(CLASSMATE_SOCIAL_ACTORS.map((actor) => actor.id));
    for (const actor of CLASSMATE_SOCIAL_ACTORS) {
      const isDateWaiting = actor.id === NODOKA_SOCIAL_ACTOR.id && this.#canTalkToNodokaDate();
      const isYueTourWaiting = actor.id === 'yue' && this.#isYueFestivalTourTime();
      const isAttractionOpen = this.#isClassmateAttractionOpen(actor);
      const isConversation = this.#state.classmateConversation.actorId === actor.id;
      const isWaiting = this.#isClassmateStoryPlacementLocked(actor);
      const areaId = isDateWaiting
        ? 'dining-street'
        : isAttractionOpen
          ? this.#getClassmateAttractionArea(actor).id
          : this.#getClassmateCurrentAreaId(actor);
      const status = isConversation
        ? 'conversation'
        : isDateWaiting
          ? 'date-waiting'
          : isYueTourWaiting
            ? 'yue-festival-tour'
          : isWaiting
            ? 'waiting'
            : isAttractionOpen ? 'attraction-open' : 'free-explore';
      statusEntries.push(this.#createClassmateStatusEntry(actor, areaId, status));
    }
    for (const actor of CHAO_HINT_ACTORS) {
      if (socialActorIds.has(actor.id)) {
        continue;
      }
      statusEntries.push(this.#createClassmateStatusEntry(
        actor,
        actor.areaId,
        this.#state.mainEvent.activeEventId === CANONICAL_MAIN_EVENT_IDS.CHAO_SEARCH
          ? 'chao-hint'
          : 'fixed',
      ));
    }
    return statusEntries;
  }

  /** Create one renderer-facing classmate status entry. */
  #createClassmateStatusEntry(actor, areaId, status) {
    const area = this.#getFreeExploreDestination(areaId);
    const statusLabels = {
      'attraction-open': '出し物中',
      'chao-hint': '聞き込み可能',
      conversation: '会話中',
      'date-waiting': 'デート待ち',
      fixed: '固定配置',
      'free-explore': '自由行動',
      waiting: '待機中',
    };
    return {
      id: actor.id,
      name: actor.name,
      areaId: area?.id ?? areaId ?? null,
      areaName: status === 'waiting'
        ? '解散場所'
        : area?.areaName ?? area?.label ?? areaId ?? '所在不明',
      status,
      statusLabel: statusLabels[status] ?? status,
      affection: {
        current: this.#getClassmateAffection(actor.id),
        max: CLASSMATE_AFFECTION_MAX,
      },
    };
  }

  /** Select a free-explore destination and arrive immediately. */
  #selectFreeExploreDestination(destinationId) {
    if (![CANONICAL_PHASE_IDS.FREE_EXPLORE, CANONICAL_PHASE_IDS.LOCATION_ACTIONS].includes(this.#state.phaseId)) {
      return;
    }
    const destination = this.#getFreeExploreDestination(destinationId);
    if (!destination) {
      return;
    }
    this.#clearCurrentFestivalNotification();
    this.#moveToFreeExploreDestination(destinationId, true);
  }

  /** Move to a free-explore destination after validating the connection and route. */
  #moveToFreeExploreDestination(destinationId, allowUnconnectedDestination = false) {
    const destination = this.#getFreeExploreDestination(destinationId);
    const connectedDestinationIds = this.#getConnectedFreeExploreDestinations(
      this.#state.freeExplore.currentLocationId,
    ).map((entry) => entry.id);
    if (
      !destination
      || (!allowUnconnectedDestination
        && !connectedDestinationIds.includes(this.#getCanonicalFreeExploreAreaId(destination.id)))
      || (!allowUnconnectedDestination && !this.#isChaoSearchDestinationAllowed(destination.id))
    ) {
      return;
    }
    if (destination.id === this.#state.freeExplore.currentLocationId) {
      this.#state.freeExplore.selectedActionId = null;
      this.#state.freeExplore.actionResult = null;
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
      return;
    }
    this.#rollRandomClassmateMovement();
    this.#state.freeExplore.selectedActionId = null;
    this.#state.freeExplore.interruption = null;
    this.#state.freeExplore.actionResult = null;
    this.#arriveFreeExploreDestination(destination);
  }

  /** Select an action at the current free-explore location. */
  #selectFreeExploreLocationAction(actionId) {
    if (this.#state.phaseId !== CANONICAL_PHASE_IDS.LOCATION_ACTIONS) {
      return;
    }
    const action = this.#createFreeExploreLocationActions()
      .find((entry) => entry.id === actionId);
    if (!action || !this.#isTutorialLocationActionEnabled(action)) {
      return;
    }
    this.#clearCurrentFestivalNotification();
    this.#state.freeExplore.selectedActionId = action.id;
    this.#state.freeExplore.actionResult = null;
    if (action.kind === 'destination') {
      this.#moveToFreeExploreDestination(action.destinationId);
      return;
    }
    if (!this.#isTutorialPhase() && ![
      'wait-until',
      'cassiopeia-rewind',
      'library-dungeon-start',
      'library-dungeon-choice',
      'library-dungeon-wait',
      'library-dungeon-return',
    ].includes(action.kind) && this.#random() >= 0.75) {
      this.#startFreeExploreInterruption('action', FREE_EXPLORE_ACTION_INTERRUPTION_DEFINITIONS);
      return;
    }
    this.#completeFreeExploreLocationAction(action);
  }

  /** Return whether a location action is enabled during the tutorial. */
  #isTutorialLocationActionEnabled(action) {
    if (!this.#isTutorialPhase()) {
      return true;
    }
    if (!this.#state.chaoSearch.targetLocationId) {
      return true;
    }
    if (action.kind === 'wait-until') {
      return false;
    }
    if (this.#isChaoSearchRouteActive()) {
      const nextLocation = this.#getNextChaoSearchLocation();
      const nextTravelAreaId = this.#getNextFreeExploreRouteArea(
        this.#state.freeExplore.currentLocationId,
        nextLocation?.areaId,
      );
      return Boolean(nextLocation) && (
        (action.kind === 'destination' && action.destinationId === nextTravelAreaId)
        || (action.kind === 'chao-location' && action.locationId === nextLocation.id)
      );
    }
    return [
      'destination',
      'chao-location',
      'classmate-talk',
      'classmate-attraction',
    ].includes(action.kind) || action.id === 'look-around';
  }

  /** Select how to handle the current free-explore interruption. */
  #selectFreeExploreInterruption(choiceId) {
    if (this.#state.phaseId !== CANONICAL_PHASE_IDS.INTERRUPTION || !this.#state.freeExplore.interruption) {
      return;
    }
    const choice = FREE_EXPLORE_INTERRUPTION_CHOICES.find((entry) => entry.id === choiceId);
    if (!choice) {
      return;
    }
    this.#clearCurrentFestivalNotification();
    const interruption = this.#state.freeExplore.interruption;
    if (choice.id === 'engage') {
      this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
      this.#state.freeExplore.actionResult = {
        title: interruption.title,
        text: interruption.resultText,
      };
      this.#state.freeExplore.selectedActionId = null;
      this.#state.freeExplore.interruption = null;
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
      this.#addLog(`${interruption.title}に関わった。`);
      return;
    }
    this.#state.freeExplore.interruption = null;
    const action = this.#createFreeExploreLocationActions()
      .find((entry) => entry.id === this.#state.freeExplore.selectedActionId);
    if (action) {
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
      this.#completeFreeExploreLocationAction(action);
    }
  }

  /** Start an action interruption from the provided definition list. */
  #startFreeExploreInterruption(source, definitions) {
    const index = Math.min(
      definitions.length - 1,
      Math.max(0, Math.floor(this.#random() * definitions.length)),
    );
    const definition = definitions[index];
    this.#state.freeExplore.interruption = {
      source,
      id: definition.id,
      title: definition.title,
      description: definition.description,
      resultText: definition.resultText,
    };
    this.#state.movementInput = { x: 0, y: 0 };
    this.#setPhase(CANONICAL_PHASE_IDS.INTERRUPTION);
    this.#addLog(`${definition.title}に巻き込まれそうになった。`);
  }

  /** Move the player to the selected free-explore destination. */
  #arriveFreeExploreDestination(destination) {
    this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
    this.#state.freeExplore.currentLocationId = destination.legacyStateId ?? destination.id;
    this.#state.freeExplore.interruption = null;
    this.#placePlayer(destination.position);
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_PREPARE_FINISH) {
      this.#addLog(`${destination.label}に到着し、デート準備の終了時刻になった。`);
      return;
    }
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    this.#addLog(`${destination.label}に到着した。`);
  }

  /** Complete a selected free-explore location action. */
  #completeFreeExploreLocationAction(action) {
    if (action.kind === 'library-dungeon-start') {
      this.#startLibraryDungeon();
      return;
    }
    if (action.kind === 'library-dungeon-choice') {
      this.#exploreLibraryDungeon(action.directionIndex);
      return;
    }
    if (action.kind === 'library-dungeon-wait') {
      this.#waitInLibraryDungeon();
      return;
    }
    if (action.kind === 'library-dungeon-return') {
      this.#returnFromLibraryDungeon('図書館島の入口へ戻った。');
      return;
    }
    if (action.kind === 'chao-location') {
      const location = this.#getChaoSearchLocation(action.locationId);
      if (location) {
        this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
        this.#visitChaoSearchLocation(location);
      }
      return;
    }
    if (action.kind === 'classmate-attraction') {
      this.#visitClassmateAttractionFromFreeExplore(action.actorId);
      return;
    }
    if (action.kind === 'start-nodoka-date') {
      this.#startNodokaDateFromFreeExplore();
      return;
    }
    if (action.kind === 'start-yue-festival-tour') {
      this.#startYueFestivalTourFromFreeExplore();
      return;
    }
    if (action.kind === 'start-third-loop-patrol') {
      this.#startThirdLoopPatrolFromFreeExplore();
      return;
    }
    if (action.kind === 'haunted-house-help') {
      this.#helpHauntedHouseFromFreeExplore();
      return;
    }
    if (action.kind === 'haunted-house-flyer') {
      this.#handOutHauntedHouseFlyers();
      return;
    }
    if (action.kind === 'start-classmate-attraction-tour') {
      this.#enterClassmateAttractionTour();
      return;
    }
    if (action.kind === 'tournament-kotaro-talk') {
      this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
      this.#setPhase(CANONICAL_PHASE_IDS.TOURNAMENT_KOTARO);
      return;
    }
    if (action.kind === 'tournament-venue') {
      this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
      this.#placePlayer(SCHOOL_POSITIONS.GROUND_TOURNAMENT);
      this.#state.thirdLoop.tournamentVenueConfirmed = true;
      this.#state.thirdLoop.tournamentKotaroJoined = false;
      this.#state.companionPositions.kotaro = null;
      const venueNotice = 'まほら武道会の会場は龍宮神社へ変更された。受付はPM6:00から、予選はPM7:00から始まる。';
      this.#showFestivalNotifications([{
        id: 'mahora-budokai-venue-change',
        speaker: '麻帆良祭放送',
        text: venueNotice,
      }]);
      this.#setPhase(CANONICAL_PHASE_IDS.TOURNAMENT_VENUE);
      return;
    }
    if (action.kind === 'tournament-reception') {
      this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
      this.#setPhase(CANONICAL_PHASE_IDS.TOURNAMENT_RECEPTION);
      return;
    }
    if (action.kind === 'tournament-participate') {
      this.#startTournamentBattle();
      return;
    }
    if (action.kind === 'start-nodoka-date-prepare') {
      this.#startNodokaDatePreparation();
      return;
    }
    if (action.kind === 'prepare-date-target') {
      this.#interactInPrepareDate(action.targetId);
      return;
    }
    if (action.kind === 'wait-until') {
      this.#waitUntil(action.targetMinute);
      return;
    }
    if (action.kind === 'cassiopeia-rewind') {
      this.#rewindWithCassiopeia(action.targetMinute);
      return;
    }
    if (action.kind === 'classmate-talk') {
      this.#state.classmateConversation.actorId = action.actorId;
      this.#setPhase(CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION);
      return;
    }
    if (action.kind === 'classmate-talk-legacy') {
      this.#state.freeExplore.actionResult = {
        title: action.label,
        text: action.resultText,
      };
      this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
      this.#addLog(`${action.label}を行った。`);
      return;
    }
    if (action.id === 'visit-haunted-house') {
      this.#markScheduleEventCompleted('haunted-house');
    }
    this.#state.freeExplore.actionResult = {
      title: action.label,
      text: action.resultText,
    };
    this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    this.#addLog(`${action.label}を行った。`);
  }

  /** チャオ探索の固定ルートが進行中か判定する。 */
  #isChaoSearchRouteActive() {
    return Boolean(
      this.#state.chaoSearch.targetLocationId
      && !this.#state.chaoSearch.foundLocationId
      && [
        CANONICAL_PHASE_IDS.FREE_EXPLORE,
        CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
      ].includes(this.#state.phaseId),
    );
  }

  /** チャオ探索で次に向かう地点を返す。 */
  #getNextChaoSearchLocation() {
    const nextLocationId = CHAO_SEARCH_ROUTE.find((locationId) => (
      locationId === 'airship'
        ? !this.#state.chaoSearch.foundLocationId
        : !this.#state.chaoSearch.completedAttractionIds.includes(locationId)
    ));
    return nextLocationId ? this.#getChaoSearchLocation(nextLocationId) : null;
  }

  /** チャオ探索中に選択できる移動先か判定する。 */
  #isChaoSearchDestinationAllowed(destinationId) {
    if (!this.#isChaoSearchRouteActive()) {
      return true;
    }
    return this.#getNextChaoSearchLocation()?.areaId === destinationId;
  }

  /** Handle the choices shown while talking with a classmate. */
  #handleClassmateConversationChoice(choiceId) {
    const actor = CLASSMATE_SOCIAL_ACTORS.find(
      (entry) => entry.id === this.#state.classmateConversation.actorId,
    );
    if (!actor) {
      this.#returnToFreeExplore();
      return;
    }
    if (actor.id === KOTARO_SOCIAL_ACTOR.id && ['join-kotaro', 'decline-kotaro'].includes(choiceId)) {
      if (choiceId === 'join-kotaro') {
        this.#state.companionPositions.kotaro = copyPosition(this.#state.playerPosition);
        this.#state.classmateLocations.kotaro = null;
        this.#state.freeExplore.actionResult = {
          title: '小太郎がパーティに加わった',
          text: '小太郎と一緒に行動することになった。',
        };
      } else if (choiceId === 'decline-kotaro') {
        this.#state.freeExplore.actionResult = {
          title: '小太郎とは別行動にした',
          text: '小太郎はその場に残った。',
        };
      } else {
        return;
      }
      this.#state.classmateConversation.actorId = null;
      this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
      this.#addLog(choiceId === 'join-kotaro' ? '小太郎をパーティに加えた。' : '小太郎とは別行動にした。');
      return;
    }
    const hintActor = this.#getChaoHintActorForClassmate(actor);
    if (choiceId === `ask-chao-${actor.id}` && hintActor) {
      this.#state.freeExplore.actionResult = {
        title: `${actor.name}にチャオのことを聞く`,
        text: this.#recordChaoHint(hintActor),
      };
      this.#increaseClassmateAffection(actor.id);
    } else if (choiceId === `talk-classmate-${actor.id}`) {
      this.#state.freeExplore.actionResult = {
        title: `${actor.name}に話しかける`,
        text: `${actor.name}と普通に会話した。`,
      };
      this.#increaseClassmateAffection(actor.id);
    } else {
      return;
    }
    this.#state.classmateConversation.actorId = null;
    this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    this.#addLog(`${actor.name}との会話を終えた。`);
  }

  /** Return the fixed Chao hint definition for a classmate. */
  #getChaoHintActorForClassmate(actor) {
    if (this.#state.mainEvent.activeEventId !== CANONICAL_MAIN_EVENT_IDS.CHAO_SEARCH) {
      return null;
    }
    const existingHintActor = CHAO_HINT_ACTORS.find((entry) => entry.id === actor.id);
    return {
      id: actor.id,
      name: actor.name,
      focus: existingHintActor?.focus ?? 'facility',
    };
  }

  /** Record a Chao hint and return its text. */
  #recordChaoHint(actor) {
    const hint = this.#createChaoHint(actor, this.#getChaoSearchTargetLocation());
    if (!this.#state.chaoSearch.heardHintActorIds.includes(actor.id)) {
      this.#state.chaoSearch.heardHintActorIds.push(actor.id);
      this.#state.chaoSearch.hints.push({ actorId: actor.id, actorName: actor.name, text: hint });
    }
    return hint;
  }

  /** Complete a haunted-house customer visit or start its timed help event. */
  #helpHauntedHouseFromFreeExplore() {
    if (this.#state.freeExplore.currentLocationId !== 'hall') {
      return;
    }
    if (this.#isHauntedHouseHelpTime()) {
      this.#state.thirdLoop.hasHelpedHauntedHouse = true;
      this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
      if (this.#state.companionPositions.kotaro) {
        this.#startHauntedHouseFlyerAyakaEvent();
        return;
      }
      this.#markScheduleEventCompleted('haunted-house-help');
      this.#state.persistentEvents.hasDiscoveredHauntedHouseFlyerAyakaSchedule = true;
      this.#advanceGameTime({
        ...this.#state.gameTime,
        hour: 12,
        minute: 0,
        label: 'PM12:00',
      });
      this.#state.freeExplore.actionResult = null;
      this.#state.activeEvent = null;
      this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
      this.#addLog('3-Aホラーハウスの客引きを手伝い、PM12:00に終了した。');
      return;
    }
    this.#state.freeExplore.actionResult = {
      title: '3-Aホラーハウスの客引きを手伝う',
      text: 'ホラーハウスの客引きを手伝った。',
    };
    this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    this.#addLog('3-Aホラーハウスの客引きを手伝った。');
  }

  /** チラシを配ってホラーハウスを盛り上げる。 */
  #handOutHauntedHouseFlyers() {
    if (!this.#isHauntedHouseFlyerTime()) {
      return;
    }
    this.#markScheduleEventCompleted('haunted-house-flyer');
    this.#state.festivalStallExcitement['haunted-house'] = Math.min(
      HAUNTED_HOUSE_EXCITEMENT_MAX,
      this.#state.festivalStallExcitement['haunted-house'] + HAUNTED_HOUSE_EXCITEMENT_PER_FLYER,
    );
    this.#state.freeExplore.actionResult = {
      title: '3-Aホラーハウスのチラシを配る',
      text: `チラシを配り、ホラーハウスが盛り上がった。盛り上がり: ${this.#state.festivalStallExcitement['haunted-house']}/${HAUNTED_HOUSE_EXCITEMENT_MAX}`,
    };
    this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    this.#addLog('3-Aホラーハウスのチラシを配った。');
  }

  /** Start the Ayaka attraction tour branch from the haunted-house helping event. */
  #startHauntedHouseFlyerAyakaEvent() {
    this.#state.persistentEvents.hasDiscoveredHauntedHouseFlyerAyakaSchedule = true;
    this.#state.persistentEvents.hasExperiencedHauntedHouseFlyerAyakaEvent = true;
    this.#state.persistentEvents.hauntedHouseFlyerAyakaEventStartMinute = getMinuteOfDay(this.#state.gameTime);
    this.#state.activeEvent = {
      id: 'kotaro-ayaka-attraction-tour',
      title: 'あやかとクラスメイトの出し物巡り',
      status: '進行中',
      startTimeLabel: this.#state.gameTime.label,
      endTimeLabel: CANONICAL_TIMES.FOURTH_LOOP_AYAKA_TOUR_END.label,
      companionIds: ['kotaro', 'ayaka'],
    };
    this.#state.freeExplore.actionResult = null;
    this.#setPhase(CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR);
    this.#addLog('客引きから、あやかとの出し物巡りへ進んだ。');
  }

  /** Return from a free-explore result screen to the current location action list. */
  #returnToFreeExplore() {
    if (this.#state.phaseId !== CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR) {
      this.#state.activeEvent = null;
    }
    this.#state.freeExplore.selectedActionId = null;
    this.#state.freeExplore.interruption = null;
    this.#state.freeExplore.actionResult = null;
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
  }

  /** Return a free-explore destination by id. */
  #getFreeExploreDestination(destinationId) {
    return FREE_EXPLORE_DESTINATIONS.find((entry) => entry.id === destinationId) ?? null;
  }

  /** Return the canonical area ID used for connection checks. */
  #getCanonicalFreeExploreAreaId(areaId) {
    const destination = this.#getFreeExploreDestination(areaId);
    return destination?.isLegacyAlias ? destination.canonicalId : areaId;
  }

  /** Return direct destinations connected to the current area. */
  #getConnectedFreeExploreDestinations(currentAreaId) {
    const canonicalAreaId = this.#getCanonicalFreeExploreAreaId(currentAreaId);
    const current = this.#getFreeExploreDestination(canonicalAreaId);
    if (!current) {
      return [];
    }
    return FREE_EXPLORE_DESTINATIONS.filter((destination) => (
      !destination.isLegacyAlias
      && destination.id !== canonicalAreaId
      && current.connectedAreaIds.includes(destination.id)
    ));
  }

  /** Return the first connected area on the shortest route to the target. */
  #getNextFreeExploreRouteArea(currentAreaId, targetAreaId) {
    const startId = this.#getCanonicalFreeExploreAreaId(currentAreaId);
    const targetId = this.#getCanonicalFreeExploreAreaId(targetAreaId);
    if (startId === targetId) {
      return targetId;
    }
    const queue = [{ id: startId, firstStep: null }];
    const visited = new Set([startId]);
    while (queue.length > 0) {
      const current = queue.shift();
      const destination = this.#getFreeExploreDestination(current.id);
      for (const nextId of destination?.connectedAreaIds ?? []) {
        if (visited.has(nextId)) {
          continue;
        }
        const firstStep = current.firstStep ?? nextId;
        if (nextId === targetId) {
          return firstStep;
        }
        visited.add(nextId);
        queue.push({ id: nextId, firstStep });
      }
    }
    return null;
  }

  /** Create the actions available at the current free-explore location. */
  #createFreeExploreLocationActions() {
    const currentLocationId = this.#state.freeExplore.currentLocationId;
    const actions = [
      {
        id: 'look-around',
        label: '周辺を調べる',
        kind: 'generic',
        resultText: '周囲の出し物、人の流れ、別の場所へ波及しそうな賑わいを確認した。',
      },
    ];
    if (this.#state.freeExplore.libraryDungeon.isActive) {
      return this.#createLibraryDungeonActions();
    }
    if (false && this.#isChaoSearchRouteActive()) {
      const nextLocation = this.#getNextChaoSearchLocation();
      if (!nextLocation) {
        return [];
      }
      if (nextLocation.areaId !== currentLocationId) {
        const destination = this.#getFreeExploreDestination(nextLocation.areaId);
        return [{
          id: `move-to-${nextLocation.areaId}`,
          /*
          label: '次のエリアへ移動する',
          */
          label: destination?.label ?? nextLocation.areaId,
          kind: 'destination',
          destinationId: nextLocation.areaId,
          resultText: '',
        }];
        /*
        return [{
          id: `move-to-${nextLocation.areaId}`,
          label: `${destination?.label ?? nextLocation.areaId}へ移動する`,
          `,
          label: '次のエリアへ移動する',
          ',
          kind: 'destination',
          destinationId: nextLocation.areaId,
          resultText: '',
        }];
        */
      }
      return [{
        id: `investigate-${nextLocation.id}`,
        /*
        label: '次の目的地を調べる',
        */
        label: nextLocation.label,
        kind: 'chao-location',
        locationId: nextLocation.id,
        resultText: '',
      }];
      /*
      return [{
        id: `investigate-${nextLocation.id}`,
        label: `${nextLocation.label}を確認する`,
        `,
        label: '次の目的地を調べる',
        ',
        kind: 'chao-location',
        locationId: nextLocation.id,
        resultText: '',
      }];
      */
    }
    if (currentLocationId === 'library-island') {
      actions.unshift({
        id: 'start-library-dungeon',
        label: '探検する',
        kind: 'library-dungeon-start',
        resultText: '図書館島の地下へ入った。',
      });
    }
    if (this.#isHauntedHouseFlyerTime()) {
      actions.unshift({
        id: 'hand-out-haunted-house-flyers',
        label: '3-Aホラーハウスのチラシを配る',
        kind: 'haunted-house-flyer',
        resultText: '',
      });
    }
    if (
      currentLocationId === 'entrance-gate'
      && getMinuteOfDay(this.#state.gameTime) < getMinuteOfDay(CANONICAL_TIMES.PARADE_END)
    ) {
      actions.unshift({
        id: 'watch-parade',
        label: 'パレードを見る',
        kind: 'generic',
        resultText: '入場門から続くパレードを眺め、麻帆良祭の熱気を感じた。',
      });
    }
    if (!this.#state.chaoSearch.foundLocationId) {
      for (const location of CHAO_SEARCH_LOCATIONS.filter((entry) => entry.areaId === currentLocationId)) {
        actions.unshift({
          id: `investigate-${location.id}`,
          label: `${location.label}でチャオの手がかりを調べる`,
          kind: 'chao-location',
          locationId: location.id,
          resultText: '',
        });
      }
    }
    if (currentLocationId === 'hall') {
      actions.push({
        id: 'visit-haunted-house',
        label: '3-Aホラーハウスを客として利用する',
        kind: 'generic',
        resultText: '3-Aホラーハウスを客として体験し、教室いっぱいの賑わいを楽しんだ。',
      });
      actions.push({
        id: 'help-haunted-house',
        label: '3-Aホラーハウスの客引きを手伝う',
        kind: 'haunted-house-help',
        resultText: '',
      });
      if (
        this.#state.thirdLoop.hasHelpedHauntedHouse
        && getMinuteOfDay(this.#state.gameTime) >= 720
        && !this.#isClassmateAttractionTourComplete()
      ) {
        actions.push({
          id: 'start-classmate-attraction-tour',
          label: 'クラスメイトの出し物巡りを始める',
          kind: 'start-classmate-attraction-tour',
          resultText: '',
        });
      }
    }
    for (const actor of CLASSMATE_SOCIAL_ACTORS) {
      if (actor.id === 'yue' && this.#canStartYueFestivalTour()) {
        continue;
      }
      const classmateAreaId = this.#getClassmateCurrentAreaId(actor);
      const isAttractionOpen = this.#isClassmateAttractionOpen(actor);
      if (
        isAttractionOpen
        && this.#getClassmateAttractionArea(actor).id === currentLocationId
        && !this.#state.thirdLoop.completedAttractionActorIds.includes(actor.id)
      ) {
        actions.push({
          id: `visit-classmate-attraction-${actor.id}`,
          label: `${actor.name} / ${actor.attractionName}`,
          kind: 'classmate-attraction',
          actorId: actor.id,
          resultText: '',
        });
      } else if (
        !isAttractionOpen
        && classmateAreaId === currentLocationId
        && !(actor.id === NODOKA_SOCIAL_ACTOR.id && this.#canTalkToNodokaDate())
      ) {
        actions.push({
          id: `talk-classmate-${actor.id}`,
          label: `${actor.name}に話しかける`,
          kind: 'classmate-talk',
          actorId: actor.id,
          resultText: `${actor.name}は麻帆良祭を見て回っている。まだ出し物の時間ではない。`,
        });
      }
    }
    if (currentLocationId === 'dining-street' && this.#canTalkToNodokaDate()) {
      actions.push({
        id: 'talk-nodoka-date',
        label: 'のどかに話しかける',
        kind: 'start-nodoka-date',
        resultText: '',
      });
    }
    if (this.#canStartYueFestivalTour()) {
      actions.push({
        id: 'talk-yue-festival-tour',
        label: '夕映に話しかける',
        kind: 'start-yue-festival-tour',
        resultText: '',
      });
    }
    if (
      currentLocationId === 'world-tree'
      && this.#state.thirdLoop.patrolStepIndex === 0
      && this.#state.thirdLoop.completedPatrolStepIds.length === 0
    ) {
      actions.push({
        id: 'start-world-tree-patrol',
        label: '世界樹の見回りを始める',
        kind: 'start-third-loop-patrol',
        resultText: '世界樹周辺の見回りを始める。',
      });
    }
    if (
      false
      && !this.#state.companionPositions.kotaro
      && !this.#hasFestivalNotificationShown('mahora-budokai-delay')
      && this.#state.phaseId === CANONICAL_PHASE_IDS.LOCATION_ACTIONS
    ) {
      actions.push({
        id: 'talk-kotaro',
        label: '小太郎に話しかける',
        kind: 'classmate-talk',
        actorId: 'kotaro',
        resultText: '',
      });
    }
    if (
      this.#hasFestivalNotificationShown('mahora-budokai-delay')
      && currentLocationId === 'ground'
      && !this.#state.thirdLoop.tournamentKotaroJoined
      && getMinuteOfDay(this.#state.gameTime) < 1080
    ) {
      actions.push({
        id: 'talk-kotaro-tournament',
        label: '小太郎に話しかける',
        kind: 'tournament-kotaro-talk',
        resultText: '',
      });
    }
    if (
      this.#hasFestivalNotificationShown('mahora-budokai-delay')
      && this.#state.thirdLoop.tournamentKotaroJoined
      && currentLocationId === 'ground'
      && !this.#state.thirdLoop.tournamentVenueConfirmed
      && getMinuteOfDay(this.#state.gameTime) < 1080
    ) {
      actions.push({
        id: 'go-mahora-budokai-venue',
        label: 'まほら武道会会場へ行く',
        kind: 'tournament-venue',
        resultText: '',
      });
    }
    if (
      this.#state.thirdLoop.tournamentVenueConfirmed
      && currentLocationId === 'ryugu-shrine'
      && !this.#state.thirdLoop.tournamentRegistered
      && getMinuteOfDay(this.#state.gameTime) >= 1080
      && getMinuteOfDay(this.#state.gameTime) < 1140
    ) {
      actions.push({
        id: 'register-mahora-budokai',
        label: 'まほら武道会の受付をする',
        kind: 'tournament-reception',
        resultText: '',
      });
    }
    if (
      this.#state.thirdLoop.tournamentVenueConfirmed
      && this.#state.thirdLoop.tournamentRegistered
      && currentLocationId === 'ryugu-shrine'
      && getMinuteOfDay(this.#state.gameTime) >= 1140
      && getMinuteOfDay(this.#state.gameTime) < 1170
    ) {
      actions.push({
        id: 'participate-mahora-budokai',
        label: 'まほら武道会の予選に参加する',
        kind: 'tournament-participate',
        resultText: '',
      });
    }
    if (
      !this.#state.prepareDate.hasStarted
      && !this.#state.prepareDate.isLoopCompleted
      && currentLocationId === PREPARE_DATE_KONOKA.areaId
      && getMinuteOfDay(this.#state.gameTime) >= 14 * 60
      && getMinuteOfDay(this.#state.gameTime) < 16 * 60
      && !this.#state.chaoSearch.hasMissedNodokaDate
      && !this.#state.chaoSearch.isNodokaDateCompleted
    ) {
      actions.push({
        id: 'start-nodoka-date-prepare',
        label: '木乃香に話しかける',
        kind: 'start-nodoka-date-prepare',
        targetId: PREPARE_DATE_KONOKA.id,
        resultText: '',
      });
    }
    actions.push(...this.#createWaitActions());
    actions.push(...this.#createCassiopeiaActions());
    for (const destination of this.#getConnectedFreeExploreDestinations(currentLocationId)) {
      actions.push({
        id: `move-to-${destination.id}`,
        label: `${destination.label}へ移動する`,
        kind: 'destination',
        destinationId: destination.id,
        resultText: '',
      });
    }
    return actions;
  }

  /** Create the choices available while exploring Library Island. */
  #createLibraryDungeonActions() {
    const dungeon = this.#state.freeExplore.libraryDungeon;
    if (dungeon.pendingBarrierCost !== null) {
      return [
        {
          id: 'library-dungeon-wait',
          label: '待機する',
          kind: 'library-dungeon-wait',
          resultText: '結界を解除できるまで待機する。',
        },
        {
          id: 'library-dungeon-return',
          label: '帰還する',
          kind: 'library-dungeon-return',
          resultText: '図書館島の入口へ戻る。',
        },
      ];
    }
    return [
      ...['左', '中央', '右'].map((label, index) => ({
        id: `library-dungeon-choice-${index}`,
        label,
        kind: 'library-dungeon-choice',
        directionIndex: index,
        resultText: '',
      })),
      {
        id: 'library-dungeon-return',
        label: '帰還する',
        kind: 'library-dungeon-return',
        resultText: '図書館島の入口へ戻る。',
      },
    ];
  }

  /** Start Library Island exploration from its area. */
  #startLibraryDungeon() {
    this.#state.freeExplore.libraryDungeon = {
      isActive: true,
      currentFloor: 1,
      pendingBarrierCost: null,
      lastResult: '地下1階に入った。',
    };
    this.#state.freeExplore.actionResult = {
      title: '図書館島を探検する',
      text: '地下1階から探検を始めた。',
    };
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    this.#addLog('図書館島の地下1階から探検を始めた。');
  }

  /** Resolve one left, center, or right Library Island choice. */
  #exploreLibraryDungeon(directionIndex) {
    const dungeon = this.#state.freeExplore.libraryDungeon;
    if (!dungeon.isActive || dungeon.pendingBarrierCost !== null) {
      return;
    }
    this.#advanceFreeExploreTime(LIBRARY_DUNGEON_STEP_MINUTES);
    const eventRoll = this.#random();
    let resultText = `${['左', '中央', '右'][directionIndex]}の道を進んだ。`;
    if (eventRoll < 0.3) {
      const cost = this.#getLibraryDungeonEventCost();
      this.#state.magicPower = Math.max(0, this.#state.magicPower - cost);
      resultText += `トラップにかかり、MPを${cost}消費した。`;
    } else if (eventRoll < 0.5) {
      const cost = this.#getLibraryDungeonEventCost();
      if (this.#state.magicPower < cost) {
        dungeon.pendingBarrierCost = cost;
        resultText += `次の階段を結界が塞いでいる。解除には${cost}MP必要だ。`;
        dungeon.lastResult = resultText;
        this.#state.freeExplore.actionResult = {
          title: `地下${dungeon.currentFloor}階`,
          text: resultText,
        };
        this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
        this.#addLog(resultText);
        return;
      }
      this.#state.magicPower -= cost;
      resultText += `結界を${cost}MPで解除した。`;
    } else {
      resultText += '何事もなく階段を見つけた。';
    }
    dungeon.currentFloor += 1;
    dungeon.lastResult = resultText;
    this.#finishLibraryDungeonStep(resultText);
  }

  /** Return a random MP cost for a Library Island event. */
  #getLibraryDungeonEventCost() {
    return 1 + Math.floor(this.#random() * LIBRARY_DUNGEON_MAX_EVENT_MP_COST);
  }

  /** Wait for MP recovery while a Library Island barrier is pending. */
  #waitInLibraryDungeon() {
    const dungeon = this.#state.freeExplore.libraryDungeon;
    if (!dungeon.isActive || dungeon.pendingBarrierCost === null) {
      return;
    }
    this.#advanceFreeExploreTime(LIBRARY_DUNGEON_STEP_MINUTES);
    dungeon.lastResult = '結界を解除できるまで待機した。';
    if (this.#state.magicPower >= dungeon.pendingBarrierCost) {
      const cost = dungeon.pendingBarrierCost;
      dungeon.pendingBarrierCost = null;
      this.#state.magicPower -= cost;
      dungeon.currentFloor += 1;
      this.#finishLibraryDungeonStep(`結界を${cost}MPで解除し、次の階へ進んだ。`);
      return;
    }
    this.#state.freeExplore.actionResult = {
      title: `地下${dungeon.currentFloor}階`,
      text: `MPが足りない。あと${dungeon.pendingBarrierCost - this.#state.magicPower}MP必要だ。`,
    };
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
  }

  /** Finish one Library Island step or force a return when its limit is reached. */
  #finishLibraryDungeonStep(resultText) {
    const dungeon = this.#state.freeExplore.libraryDungeon;
    if (this.#state.magicPower <= 0) {
      this.#returnFromLibraryDungeon('MPが0になったため、図書館島から帰還した。');
      return;
    }
    if (dungeon.currentFloor >= LIBRARY_DUNGEON_FINAL_FLOOR) {
      this.#state.persistentEvents.hasReachedLibraryDungeonFinalFloor = true;
      resultText += '地下10階に到達した。';
      this.#returnFromLibraryDungeon(resultText);
      return;
    }
    this.#state.freeExplore.actionResult = {
      title: `地下${dungeon.currentFloor}階`,
      text: resultText,
    };
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    this.#addLog(resultText);
  }

  /** Leave Library Island dungeon exploration and return to its area. */
  #returnFromLibraryDungeon(resultText) {
    this.#state.freeExplore.libraryDungeon = {
      isActive: false,
      currentFloor: 1,
      pendingBarrierCost: null,
      lastResult: resultText,
    };
    this.#state.freeExplore.actionResult = {
      title: '図書館島から帰還',
      text: resultText,
    };
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    this.#addLog(resultText);
  }

  /** チラシ配りを選択できる時刻か返す。 */
  #isHauntedHouseFlyerTime() {
    const minute = getMinuteOfDay(this.#state.gameTime);
    return minute >= 600 && minute < 690;
  }

  /** Mark a classmate attraction as visited from free exploration. */
  #visitClassmateAttractionFromFreeExplore(actorId) {
    const actor = CLASSMATE_ATTRACTION_ACTORS.find((entry) => entry.id === actorId);
    if (
      !actor
      || this.#getClassmateAttractionArea(actor).id !== this.#state.freeExplore.currentLocationId
      || !this.#isClassmateAttractionOpen(actor)
    ) {
      return;
    }
    if (!this.#state.thirdLoop.completedAttractionActorIds.includes(actor.id)) {
      this.#state.thirdLoop.completedAttractionActorIds.push(actor.id);
    }
    this.#markScheduleEventCompleted(actor.id);
    this.#state.freeExplore.actionResult = {
      title: `${actor.name} / ${actor.attractionName}`,
      text: actor.text,
    };
    this.#increaseClassmateAffection(actor.id);
    this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT);
    this.#addLog(`${actor.name}の${actor.attractionName}を訪問した。`);
  }

  /** Start Nodoka date from the place-selection free-explore action. */
  #startNodokaDateFromFreeExplore() {
    if (this.#state.freeExplore.currentLocationId !== 'dining-street' || !this.#canTalkToNodokaDate()) {
      return;
    }
    this.#state.chaoSearch.returnAfterNodokaDatePhaseId = null;
    this.#startNodokaDate();
  }

  /** Create wait actions in five-minute increments through the current day. */
  #createWaitActions() {
    const currentMinute = getMinuteOfDay(this.#state.gameTime);
    const actions = [];
    for (let targetMinute = currentMinute + FREE_EXPLORE_TIME_STEP_MINUTES; targetMinute <= PROTOTYPE_TIME_LIMIT_MINUTE; targetMinute += FREE_EXPLORE_TIME_STEP_MINUTES) {
      actions.push({
        id: `wait-until-${targetMinute}`,
        label: `${createTimeLabelFromMinute(targetMinute)}まで待つ`,
        kind: 'wait-until',
        targetMinute,
        resultText: '',
      });
    }
    return actions;
  }

  /** Create Cassiopeia rewind actions in five-minute increments. */
  #createCassiopeiaActions() {
    if (!this.#state.chaoSearch.hasCassiopeiaManual) {
      return [];
    }
    const currentMinute = getMinuteOfDay(this.#state.gameTime);
    const firstMinute = Math.max(CASSIOPEIA_MINUTE, currentMinute - 24 * 60);
    const actions = [];
    for (let targetMinute = currentMinute - FREE_EXPLORE_TIME_STEP_MINUTES; targetMinute >= firstMinute; targetMinute -= FREE_EXPLORE_TIME_STEP_MINUTES) {
      if (!this.#findRewindCheckpoint(targetMinute)) {
        continue;
      }
      actions.push({
        id: `cassiopeia-rewind-${targetMinute}`,
        label: `${createTimeLabelFromMinute(targetMinute)}へ巻き戻す`,
        kind: 'cassiopeia-rewind',
        targetMinute,
        resultText: '',
      });
    }
    return actions;
  }

  /** Wait until a selected time in the current loop. */
  #waitUntil(targetMinute) {
    if (
      this.#state.phaseId !== CANONICAL_PHASE_IDS.LOCATION_ACTIONS
      || this.#isTutorialPhase()
      || this.#isChaoSearchRouteActive()
    ) {
      return;
    }
    const currentMinute = getMinuteOfDay(this.#state.gameTime);
    const nextMinute = Number(targetMinute);
    if (!Number.isInteger(nextMinute) || nextMinute <= currentMinute || nextMinute > PROTOTYPE_TIME_LIMIT_MINUTE || (nextMinute - currentMinute) % FREE_EXPLORE_TIME_STEP_MINUTES !== 0) {
      return;
    }
    this.#clearCurrentFestivalNotification();
    this.#advanceFreeExploreTime(nextMinute - currentMinute);
    this.#state.freeExplore.actionResult = null;
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_PREPARE_FINISH) {
      this.#addLog(`${this.#state.gameTime.label}になり、デート準備の受付を終了した。`);
      return;
    }
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    this.#addLog(`${this.#state.gameTime.label}まで待機した。`);
  }

  /** Rewind the current loop with Cassiopeia and restore the target-time state. */
  #rewindWithCassiopeia(targetMinute) {
    if (
      this.#state.phaseId !== CANONICAL_PHASE_IDS.LOCATION_ACTIONS
      || this.#isChaoSearchRouteActive()
      || !this.#state.chaoSearch.hasCassiopeiaManual
    ) {
      return;
    }
    const currentMinute = getMinuteOfDay(this.#state.gameTime);
    const rewindMinute = Number(targetMinute);
    const elapsedMinutes = currentMinute - rewindMinute;
    if (!Number.isInteger(rewindMinute) || elapsedMinutes < FREE_EXPLORE_TIME_STEP_MINUTES || elapsedMinutes > 24 * 60 || rewindMinute < CASSIOPEIA_MINUTE || rewindMinute % FREE_EXPLORE_TIME_STEP_MINUTES !== 0) {
      return;
    }
    const requiredMp = Math.ceil(elapsedMinutes / 5) * CASSIOPEIA_MP_PER_FIVE_MINUTES;
    if (this.#state.magicPower < requiredMp) {
      this.#addLog(`魔力が${requiredMp}MP必要なため、カシオペアを使えない。`);
      return;
    }
    const currentLocationId = this.#state.freeExplore.currentLocationId;
    const currentPlayerPosition = copyPosition(this.#state.playerPosition);
    const currentMagicPower = this.#state.magicPower;
    const checkpoint = this.#findRewindCheckpoint(rewindMinute);
    if (!checkpoint) {
      return;
    }
    const persistentState = {
      foundLocationId: this.#state.chaoSearch.foundLocationId,
      affection: { ...this.#state.affection },
      cgFlags: { ...this.#state.cgFlags },
      persistentEvents: { ...this.#state.persistentEvents },
      hasCassiopeiaManual: this.#state.chaoSearch.hasCassiopeiaManual,
    };
    this.#state = cloneCanonicalState(checkpoint.state);
    this.#state.magicPower = currentMagicPower - requiredMp;
    this.#state.playerPosition = currentPlayerPosition;
    this.#state.chaoSearch.foundLocationId = persistentState.foundLocationId;
    this.#state.affection = persistentState.affection;
    this.#state.cgFlags = persistentState.cgFlags;
    this.#state.persistentEvents = persistentState.persistentEvents;
    this.#state.chaoSearch.hasCassiopeiaManual = persistentState.hasCassiopeiaManual
      || Boolean(persistentState.foundLocationId);
    this.#state.prepareDate.isLoopCompleted = false;
    this.#state.gameTime = {
      ...this.#state.gameTime,
      loopCount: this.#state.gameTime.loopCount + 1,
      hour: Math.floor(rewindMinute / 60),
      minute: rewindMinute % 60,
      label: createTimeLabelFromMinute(rewindMinute),
    };
    this.#resetFreeExploreState(currentLocationId);
    this.#state.mainEvent.activeEventId = this.#state.chaoSearch.foundLocationId
      ? null
      : CANONICAL_MAIN_EVENT_IDS.CHAO_SEARCH;
    this.#state.mainEvent.isManual = false;
    this.#resetFreeExploreState(currentLocationId);
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    this.#addLog(`カシオペアで${elapsedMinutes}分巻き戻った。${requiredMp}MPを消費した。`);
  }

  /** Find the first checkpoint at the requested time, or the latest earlier one. */
  #findRewindCheckpoint(targetMinute) {
    const currentLoop = this.#state.gameTime.loopCount;
    const sameLoopCheckpoints = this.#rewindHistory
      .filter((checkpoint) => {
        const time = checkpoint.state.gameTime;
        return time.festivalDay === this.#state.gameTime.festivalDay
          && time.loopCount === currentLoop
          && getMinuteOfDay(time) <= targetMinute;
      });
    const exact = sameLoopCheckpoints.find(
      (checkpoint) => getMinuteOfDay(checkpoint.state.gameTime) === targetMinute,
    );
    return exact ?? sameLoopCheckpoints.at(-1) ?? null;
  }

  #handleChaoSearchChoice(choiceId) {
    if (!this.#state.chaoSearch.pendingSetsunaChoice) {
      return;
    }
    if (choiceId === 'setsuna-join') {
      this.#state.chaoSearch.isSetsunaWaiting = false;
      this.#state.chaoSearch.pendingSetsunaChoice = false;
      this.#state.companionPositions.setsuna = {
        x: this.#state.playerPosition.x - 1,
        y: this.#state.playerPosition.y + 0.2,
      };
      this.#state.chaoSearch.interactionDialogue = {
        speaker: '刹那',
        text: '承知しました。チャオさんの行き先を一緒に探しましょう。',
        anchor: { type: 'companion', id: 'setsuna' },
      };
      this.#addLog('刹那がチャオ探索に再同行した。');
      return;
    }
    if (choiceId === 'setsuna-wait') {
      this.#state.chaoSearch.pendingSetsunaChoice = false;
      this.#state.chaoSearch.interactionDialogue = {
        speaker: '刹那',
        text: '分かりました。私はここで待機しています。',
        anchor: { type: 'actor', id: 'setsuna' },
      };
      this.#addLog('刹那は解散場所で待機することになった。');
    }
  }

  /** チャオ探索中に近くの人物または候補地点へinteractionする。 */
  #interactInChaoSearch(targetId = null) {
    const target = this.#findChaoSearchInteractionTarget(targetId);
    if (!target) {
      this.#state.chaoSearch.interactionDialogue = {
        speaker: 'カモ',
        text: '兄貴、この辺には聞けそうな相手も調べられそうな場所もありませんぜ。',
        anchor: { type: 'player', id: null },
      };
      return;
    }
    if (target.type === 'setsuna') {
      this.#state.chaoSearch.pendingSetsunaChoice = true;
      this.#state.chaoSearch.interactionDialogue = {
        speaker: '刹那',
        text: '私はここで待機しています。必要でしたら同行します。',
        anchor: { type: 'actor', id: 'setsuna' },
      };
      return;
    }
    if (target.type === 'hint-actor') {
      this.#receiveChaoHint(target.actor);
      return;
    }
    this.#visitChaoSearchLocation(target.location);
  }

  /** 現在のチャオ探索アトラクションを完了する。 */
  #completeChaoAttraction() {
    const attraction = this.#getCurrentChaoAttraction();
    if (!attraction) {
      return;
    }
    if (!this.#state.chaoSearch.completedAttractionIds.includes(attraction.id)) {
      this.#state.chaoSearch.completedAttractionIds.push(attraction.id);
    }
    this.#markScheduleEventCompleted(attraction.id);
    this.#state.chaoSearch.currentAttractionId = null;
    this.#returnToFreeExplore();
    this.#addLog(`${attraction.label}を確認し、チャオ探索を続けた。`);
  }

  /** 現在処理中のチャオ探索アトラクションを返す。 */
  #getCurrentChaoAttraction() {
    return CHAO_ATTRACTIONS.find((entry) => entry.id === this.#state.chaoSearch.currentAttractionId) ?? null;
  }

  /** チャオ探索中にinteractionできる最寄り対象を返す。 */
  #findChaoSearchInteractionTarget(targetId) {
    const nextLocation = this.#getNextChaoSearchLocation();
    const targets = [
      ...this.#createChaoSearchActorTargets(),
      ...(nextLocation ? [{
        type: 'location',
        id: nextLocation.id,
        position: nextLocation.position,
        location: nextLocation,
      }] : []),
    ];
    if (targetId) {
      return targets.find((target) => target.id === targetId) ?? null;
    }
    const candidates = targets
      .map((target) => ({
        ...target,
        distance: getDistance(this.#state.playerPosition, target.position),
      }))
      .filter((target) => target.distance <= CHAO_SEARCH_INTERACT_DISTANCE);
    return candidates.sort((left, right) => {
      const priority = { setsuna: 0, 'hint-actor': 1, location: 2 };
      return priority[left.type] - priority[right.type] || left.distance - right.distance;
    })[0] ?? null;
  }

  /** チャオ探索中の人物interaction候補を生成する。 */
  #createChaoSearchActorTargets() {
    if (this.#isChaoSearchRouteActive()) {
      return [];
    }
    const targets = CHAO_HINT_ACTORS.map((actor) => ({
      type: 'hint-actor',
      id: actor.id,
      position: actor.position,
      actor,
    }));
    if (this.#state.chaoSearch.isSetsunaWaiting) {
      targets.unshift({
        type: 'setsuna',
        id: 'setsuna',
        position: SCHOOL_POSITIONS.CHASE_SETSUNA_WAIT,
      });
    }
    return targets;
  }

  /** 聞き込み人物から曖昧なチャオ探索ヒントを受け取る。 */
  #receiveChaoHint(actor) {
    const targetLocation = this.#getChaoSearchTargetLocation();
    const hint = this.#createChaoHint(actor, targetLocation);
    if (!this.#state.chaoSearch.heardHintActorIds.includes(actor.id)) {
      this.#state.chaoSearch.heardHintActorIds.push(actor.id);
      this.#state.chaoSearch.hints.push({ actorId: actor.id, actorName: actor.name, text: hint });
    }
    this.#state.chaoSearch.interactionDialogue = {
      speaker: actor.name,
      text: hint,
      anchor: { type: 'actor', id: actor.id },
    };
    this.#addLog(`${actor.name}からチャオの曖昧な手掛かりを聞いた。`);
  }

  /** 対象人物の観点から曖昧なヒント文を生成する。 */
  #createChaoHint(actor, location) {
    const [direction, facility, feature] = location.clueTags;
    if (actor.focus === 'direction') {
      return `チャオさんですか……${direction}の方へ向かったような気がします。`;
    }
    if (actor.focus === 'crowd') {
      return `人混みの流れを見ると、${feature}の辺りが少し騒がしかったわよ。`;
    }
    return `確かではないですが、${facility}に関係する場所で見かけた人がいるようです。`;
  }

  /** チャオ探索の候補地点を調べる。 */
  #visitChaoSearchLocation(location) {
    if (this.#isChaoSearchRouteActive() && location.id !== this.#getNextChaoSearchLocation()?.id) {
      return;
    }
    if (!this.#state.chaoSearch.visitedLocationIds.includes(location.id)) {
      this.#state.chaoSearch.visitedLocationIds.push(location.id);
    }
    if (location.id === this.#state.chaoSearch.targetLocationId) {
      this.#state.chaoSearch.foundLocationId = location.id;
      this.#state.movementInput = { x: 0, y: 0 };
      if (location.id === 'airship') {
        this.#setPhase(CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW);
        this.#addLog('飛行船でチャオの手掛かりを掴んだ。');
        return;
      }
      this.#setPhase(CANONICAL_PHASE_IDS.MEET_CHAO);
      this.#addLog(`${location.label}でチャオと出会った。`);
      return;
    }
    if (location.id === 'airship') {
      this.#state.movementInput = { x: 0, y: 0 };
      this.#setPhase(CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW);
      this.#addLog('飛行船から麻帆良祭全体を確認した。');
      return;
    }
    const attraction = CHAO_ATTRACTIONS.find((entry) => entry.id === location.id);
    if (attraction && !this.#state.chaoSearch.completedAttractionIds.includes(attraction.id)) {
      this.#state.chaoSearch.currentAttractionId = attraction.id;
      this.#state.movementInput = { x: 0, y: 0 };
      this.#setPhase(CANONICAL_PHASE_IDS.CHAO_ATTRACTION);
      this.#addLog(`${attraction.label}を確認することにした。`);
      return;
    }
    this.#state.chaoSearch.interactionDialogue = {
      speaker: location.label,
      text: location.missText,
      anchor: { type: 'location', id: location.id },
    };
    this.#addLog(`${location.label}を調べたがチャオはいなかった。`);
  }

  /** 今回のチャオ出現地点を返す。 */
  #getChaoSearchTargetLocation() {
    return CHAO_SEARCH_LOCATIONS.find((location) => location.id === this.#state.chaoSearch.targetLocationId)
      ?? CHAO_SEARCH_LOCATIONS[0];
  }

  /** 指定IDのチャオ探索候補地点を返す。 */
  #getChaoSearchLocation(locationId) {
    return CHAO_SEARCH_LOCATIONS.find((location) => location.id === locationId) ?? null;
  }

  /** デート前自由時間中に近くの人物または地点へinteractionする。 */
  #interactInPrepareDate(targetId = null) {
    const target = this.#findPrepareDateInteractionTarget(targetId);
    if (!target) {
      this.#state.prepareDate.interactionDialogue = {
        speaker: 'カモ',
        text: '兄貴、この辺には今すぐ準備できそうなものはありませんぜ。',
        anchor: { type: 'player', id: null },
      };
      return;
    }
    if (target.type === 'konoka') {
      this.#state.prepareDate.interactionDialogue = {
        speaker: '木乃香',
        text: 'ネギ君、のどかとのデートやろ？ どの服装で行くか決めよか。',
        anchor: { type: 'actor', id: PREPARE_DATE_KONOKA.id },
      };
      this.#setPhase(CANONICAL_PHASE_IDS.PREPARE_DATE_OUTFIT);
      this.#addLog('木乃香とデートの服装を相談した。');
      return;
    }
    this.#state.prepareDate[target.spot.completedKey] = true;
    this.#increasePrepareDateScore(target.spot.scoreValue ?? 0);
    this.#state.prepareDate.interactionDialogue = {
      speaker: target.spot.label,
      text: target.spot.text,
      anchor: { type: 'location', id: target.spot.id },
    };
    this.#addLog(`${target.spot.label}を行った。`);
  }

  /** Increase the preparation score without exceeding its maximum. */
  #increasePrepareDateScore(value) {
    this.#state.prepareDate.preparationScore = Math.min(
      NODOKA_DATE_PREPARATION_SCORE_MAX,
      this.#state.prepareDate.preparationScore + value,
    );
  }

  /** Return the current outfit definition, falling back to the initial suit. */
  #getCurrentOutfit() {
    return Object.values(DATE_OUTFITS).find((outfit) => outfit.id === this.#state.outfitId)
      ?? DATE_OUTFITS.SUIT;
  }

  /** Return the outfit snapshot used by the status block and date evaluation. */
  #createOutfitSnapshot() {
    const outfit = this.#getCurrentOutfit();
    return { id: outfit.id, label: outfit.label };
  }

  /** デート前自由時間中にinteractionできる最寄り対象を返す。 */
  #findPrepareDateInteractionTarget(targetId) {
    const targets = [
      {
        type: 'konoka',
        id: PREPARE_DATE_KONOKA.id,
        position: PREPARE_DATE_KONOKA.position,
      },
      ...PREPARE_DATE_SPOTS.map((spot) => ({
        type: 'spot',
        id: spot.id,
        position: spot.position,
        spot,
      })),
    ];
    if (targetId) {
      return targets.find((target) => target.id === targetId) ?? null;
    }
    const candidates = targets
      .map((target) => ({
        ...target,
        distance: getDistance(this.#state.playerPosition, target.position),
      }))
      .filter((target) => target.distance <= CHAO_SEARCH_INTERACT_DISTANCE);
    return candidates.sort((left, right) => {
      const priority = { konoka: 0, spot: 1 };
      return priority[left.type] - priority[right.type] || left.distance - right.distance;
    })[0] ?? null;
  }

  /** のどかとのデートを開始する。 */
  #startNodokaDate() {
    this.#state.movementInput = { x: 0, y: 0 };
    this.#state.prepareDate.interactionDialogue = null;
    if (getMinuteOfDay(this.#state.gameTime) < getMinuteOfDay(CANONICAL_TIMES.NODOKA_DATE)) {
      this.#advanceGameTime(createCurrentLoopTime(this.#state.gameTime, 16, 0));
    }
    this.#setPhase(CANONICAL_PHASE_IDS.NODOKA_DATE);
    this.#addLog('PM4:00になり、のどかとのデートを開始した。');
  }

  /** Start the unlocked Yue festival tour from the dining street. */
  #startYueFestivalTourFromFreeExplore() {
    if (!this.#canStartYueFestivalTour()) {
      return;
    }
    this.#state.movementInput = { x: 0, y: 0 };
    this.#state.companionPositions.yue = copyPosition(this.#state.playerPosition);
    this.#state.activeEvent = {
      id: 'yue-festival-tour',
      title: '夕映と麻帆良祭を周る',
      status: '進行中',
      startTimeLabel: CANONICAL_TIMES.YUE_FESTIVAL_TOUR_START.label,
      endTimeLabel: CANONICAL_TIMES.YUE_FESTIVAL_TOUR_END.label,
      companionIds: ['yue'],
    };
    this.#setPhase(CANONICAL_PHASE_IDS.YUE_FESTIVAL_TOUR);
    this.#addLog('夕映と麻帆良祭を周るイベントを開始した。');
  }

  /** 魔法生徒からの逃走段階を開始する。 */
  #enterEscapePatrolStudents() {
    this.#setPhase(CANONICAL_PHASE_IDS.ESCAPE_PATROL_STUDENTS);
    this.#placePlayer({ x: 20, y: 20 });
    this.#state.movementInput = { x: 0, y: 0 };
    this.#addLog('魔法生徒からの逃走を開始した。');
  }

  /** 魔法生徒から逃げ切って世界樹事件へ進む。 */
  #enterWorldTreeMagic() {
    this.#state.movementInput = { x: 0, y: 0 };
    this.#setPhase(CANONICAL_PHASE_IDS.WORLD_TREE_MAGIC);
    this.#addLog('魔法生徒を振り切った。');
  }

  /** エヴァに捕まった時に逃走開始状態へ戻す。 */
  /** Start the third-loop world-tree patrol phase. */
  #enterThirdLoopPatrol() {
    this.#state.thirdLoop.patrolStepIndex = 0;
    this.#state.thirdLoop.completedPatrolStepIds = [];
    this.#state.thirdLoop.isAyakaCompanion = false;
    this.#state.companionPositions.setsuna = null;
    this.#resetFreeExploreState('world-tree');
    this.#placePlayer(SCHOOL_POSITIONS.THIRD_LOOP_START);
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    this.#addLog('PM3:00へ進み、世界樹周辺の見回り準備を始めた。');
  }

  /** Start the fourth-loop free-explore actions at the 3-A haunted house. */
  #enterFourthLoopHauntedHouseActions() {
    this.#state.thirdLoop.isAyakaCompanion = false;
    this.#state.thirdLoop.hasHelpedHauntedHouse = false;
    this.#state.classmateLocations.kotaro = 'ground';
    this.#state.companionPositions.kotaro = null;
    this.#resetFreeExploreState('hall');
    this.#placePlayer(SCHOOL_POSITIONS.CLASS_3A);
    this.#setPhase(CANONICAL_PHASE_IDS.LOCATION_ACTIONS);
    this.#addLog('AM11:30へ進み、3-Aホラーハウスの行動を選べる。');
  }

  /** Start the third-loop patrol from the world-tree location action. */
  #startThirdLoopPatrolFromFreeExplore() {
    if (this.#state.freeExplore.currentLocationId !== 'world-tree') {
      return;
    }
    this.#state.movementInput = { x: 0, y: 0 };
    this.#setPhase(CANONICAL_PHASE_IDS.THIRD_LOOP_PATROL);
    this.#addLog('世界樹周辺の見回りを開始した。');
  }

  /** Update third-loop patrol checkpoint progress. */
  #updateThirdLoopPatrolProgress() {
    const step = THIRD_LOOP_PATROL_STEPS[this.#state.thirdLoop.patrolStepIndex];
    if (!step || getDistance(this.#state.playerPosition, step.position) > CANONICAL_COMPLETION_RADIUS) {
      return;
    }
    this.#state.movementInput = { x: 0, y: 0 };
    this.#state.thirdLoop.completedPatrolStepIds.push(step.id);
    this.#addLog(step.text);
    this.#state.thirdLoop.patrolStepIndex += 1;
    if (this.#state.thirdLoop.patrolStepIndex >= THIRD_LOOP_PATROL_STEPS.length) {
      this.#advanceGameTime(createCurrentLoopTime(this.#state.gameTime, 16, 0));
      this.#placePlayer(SCHOOL_POSITIONS.YUE_MEET);
      this.#setPhase(CANONICAL_PHASE_IDS.THIRD_LOOP_CAFE);
      this.#addLog('PM4:12、あやかと別れた後に夕映と出会った。');
    }
  }

  /** Move from Yue cafe travel into the sightseeing boat story. */
  #enterThirdLoopBoat() {
    this.#placePlayer(SCHOOL_POSITIONS.BOAT_PIER);
    this.#setPhase(CANONICAL_PHASE_IDS.THIRD_LOOP_BOAT);
    this.#addLog('夕映とカフェへ行き、小太郎が走り去った後に観光船へ向かった。');
  }

  /** Start the fourth-loop classmate attraction tour. */
  #enterClassmateAttractionTour() {
    this.#state.thirdLoop.attractionDialogue = null;
    this.#state.thirdLoop.currentAttractionAreaId = 'hall';
    this.#placePlayer(SCHOOL_POSITIONS.CLASS_3A);
    this.#setPhase(CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR);
    this.#addLog('クラスメイトの出し物巡りを始めた。');
  }

  /** Handle talking with classmate attraction actors. */
  #interactInClassmateAttractionTour(targetId = null) {
    const target = this.#findClassmateAttractionInteractionTarget(targetId);
    if (!target) {
      this.#state.thirdLoop.attractionDialogue = {
        speaker: 'カモ',
        text: '兄貴、この近くにはまだ話しかけられるクラスメイトはいなさそうですぜ。',
        anchor: { type: 'player', id: null },
      };
      return;
    }
    if (!this.#state.thirdLoop.completedAttractionActorIds.includes(target.id)) {
      this.#state.thirdLoop.completedAttractionActorIds.push(target.id);
    }
    this.#markScheduleEventCompleted(target.id);
    this.#advanceFreeExploreTime(FREE_EXPLORE_TIME_STEP_MINUTES);
    this.#state.thirdLoop.attractionDialogue = {
      speaker: target.name,
      text: target.text,
      anchor: { type: 'actor', id: target.id },
    };
    this.#increaseClassmateAffection(target.id);
    this.#addLog(`${target.name}の${target.attractionName}を訪問した。`);
  }

  /** Return the nearest classmate attraction actor that can be talked to. */
  #findClassmateAttractionInteractionTarget(targetId) {
    const currentAreaId = this.#state.thirdLoop.currentAttractionAreaId;
    if (targetId) {
      return CLASSMATE_ATTRACTION_ACTORS
        .find((actor) => (
          actor.id === targetId
          && this.#getClassmateAttractionArea(actor).id === currentAreaId
          && this.#isClassmateAttractionOpen(actor)
        )) ?? null;
    }
    const candidates = CLASSMATE_ATTRACTION_ACTORS
      .filter((actor) => this.#getClassmateAttractionArea(actor).id === currentAreaId)
      .filter((actor) => this.#isClassmateAttractionOpen(actor))
      .filter((actor) => !this.#state.thirdLoop.completedAttractionActorIds.includes(actor.id));
    return candidates[0] ?? null;
  }

  /** Return the free-explore area assigned to a classmate attraction. */
  #getClassmateAttractionArea(actor) {
    const schedule = CLASSMATE_ATTRACTION_SCHEDULE[actor.id];
    return this.#getFreeExploreDestination(schedule?.areaId) ?? this.#getFreeExploreDestination('hall');
  }

  /** Return whether every classmate attraction actor has been visited. */
  #isClassmateAttractionTourComplete() {
    return CLASSMATE_ATTRACTION_ACTORS.every((actor) => this.#state.thirdLoop.completedAttractionActorIds.includes(actor.id));
  }

  /** Reset Eva escape state after a captured route restart. */
  #retryEvaEscape() {
    this.#state.retryCount += 1;
    this.#state.playerPosition = copyPosition(SCHOOL_POSITIONS.EVA_PLAYER_START);
    this.#state.evaPosition = copyPosition(SCHOOL_POSITIONS.EVA_START);
    this.#state.evaElapsedSeconds = 0;
    this.#state.movementInput = { x: 0, y: 0 };
    this.#addLog('エヴァに捕まり、逃走開始位置から再試行する。');
  }

  /** 操作種別を返す。 */
  /** Return the display label for the current phase. */
  #getPhaseLabel() {
    const freeExploreLabels = {
      'nodoka-date-end': '\u306e\u3069\u304b\u30c7\u30fc\u30c8\u306e\u7d50\u672b',
      'nodoka-date-normal': '\u306e\u3069\u304b\u30c7\u30fc\u30c8\u306e\u7d50\u672b',
      [CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION]: 'クラスメイトとの会話',
      [CANONICAL_PHASE_IDS.FREE_EXPLORE]: '自由探索',
      [CANONICAL_PHASE_IDS.INTERRUPTION]: '巻き込み',
      [CANONICAL_PHASE_IDS.LOCATION_ACTIONS]: '現地行動',
      [CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT]: '行動結果',
    };
    return freeExploreLabels[this.#state.phaseId] ?? PHASE_LABELS[this.#state.phaseId];
  }

  #getPhaseInputKind() {
    if ([CANONICAL_PHASE_IDS.COMPLETE, CANONICAL_PHASE_IDS.GAME_OVER].includes(this.#state.phaseId)) {
      return 'restart';
    }
    if (this.#state.activeScare) {
      return 'story';
    }
    if (this.#state.chaoSearch.interactionDialogue) {
      return 'story';
    }
    if (this.#state.prepareDate.interactionDialogue) {
      return 'story';
    }
    if (this.#state.thirdLoop.attractionDialogue) {
      return 'story';
    }
    if ([
      CANONICAL_PHASE_IDS.FREE_EXPLORE,
      CANONICAL_PHASE_IDS.INTERRUPTION,
      CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
      CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION,
    ].includes(this.#state.phaseId)) {
      return 'choice';
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT) {
      return 'story';
    }
    if (this.#createChoiceSnapshots().length > 0) {
      return 'choice';
    }
    if (
      this.#state.phaseId === CANONICAL_PHASE_IDS.SELECT_HAUNTED_DIFFICULTY
      || (this.#state.phaseId === CANONICAL_PHASE_IDS.SEARCH_CHAO && this.#state.chaoSearch.pendingSetsunaChoice)
    ) {
      return 'choice';
    }
    if (this.#state.chaoSearch.interactionDialogue) {
      return 'story';
    }
    if (this.#state.prepareDate.interactionDialogue) {
      return 'story';
    }
    if (this.#state.thirdLoop.attractionDialogue) {
      return 'story';
    }
    if (
      this.#state.activeScare
      || this.#state.phaseId === CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR
      || this.#state.phaseId === CANONICAL_PHASE_IDS.YUE_FESTIVAL_TOUR
      || this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_PREPARE_FINISH
      || this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_END
      || (PHASE_DIALOGUES[this.#state.phaseId] ?? []).length > 0
    ) {
      return 'story';
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.CHAO_ATTRACTION) {
      return 'story';
    }
    return 'none';
  }

  /** 現在段階が移動入力を受け付けるか判定する。 */
  #isMovementPhase() {
    return false;
  }

  /** 現在段階に対応するマップ定義を返す。 */
  /** 会話snapshotを生成する。 */
  #createDialogueSnapshot() {
    if (this.#state.activeScare) {
      return {
        speaker: 'お化け屋敷',
        text: this.#state.activeScare.title,
        index: 0,
        total: 1,
        anchor: { type: 'system', id: null },
      };
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.CHAO_ATTRACTION) {
      const attraction = this.#getCurrentChaoAttraction();
      if (!attraction) {
        return null;
      }
      return {
        speaker: attraction.label,
        text: `${attraction.description} チャオは見つからなかった。`,
        index: 0,
        total: 1,
        anchor: { type: 'system', id: null },
      };
    }
    if (this.#state.chaoSearch.interactionDialogue) {
      return {
        ...this.#state.chaoSearch.interactionDialogue,
        index: 0,
        total: 1,
      };
    }
    if (this.#state.prepareDate.interactionDialogue) {
      return {
        ...this.#state.prepareDate.interactionDialogue,
        index: 0,
        total: 1,
      };
    }
    if (this.#state.thirdLoop.attractionDialogue) {
      return {
        ...this.#state.thirdLoop.attractionDialogue,
        index: 0,
        total: 1,
      };
    }
    const dialogues = this.#state.phaseId === CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR
        ? KOTARO_AYAKA_ATTRACTION_DIALOGUES
      : this.#state.phaseId === CANONICAL_PHASE_IDS.YUE_FESTIVAL_TOUR
        ? YUE_FESTIVAL_TOUR_DIALOGUES
      : this.#state.phaseId === CANONICAL_PHASE_IDS.NODOKA_DATE_END
        ? NODOKA_DATE_END_DIALOGUES
        : PHASE_DIALOGUES[this.#state.phaseId] ?? [];
    const current = dialogues[this.#state.dialogueIndex];
    if (!current) {
      return null;
    }
    return {
      speaker: current.speaker,
      text: current.text,
      index: this.#state.dialogueIndex,
      total: dialogues.length,
      anchor: this.#createDialogueAnchor(current.speaker),
    };
  }

  /** 麻帆良祭放送通知のsnapshotを生成する。 */
  #createFestivalNotificationSnapshot() {
    return this.#state.festivalNotifications.current.map((notification) => ({ ...notification }));
  }

  /** 話者に対応する吹き出し表示位置を返す。 */
  #createDialogueAnchor(speaker) {
    if (speaker === '小太郎') {
      return { type: 'actor', id: 'kotaro-fourth-loop' };
    }
    if (speaker === 'あやか') {
      return { type: 'actor', id: 'ayaka-fourth-loop' };
    }
    if (speaker === 'カモ' || speaker === 'ネギ') {
      return { type: 'player', id: null };
    }
    if (speaker === 'のどか') {
      return { type: 'actor', id: 'nodoka' };
    }
    if (speaker === 'エヴァ') {
      return { type: 'actor', id: 'eva' };
    }
    if (speaker === 'チャオ') {
      return { type: 'actor', id: 'chao' };
    }
    if (speaker === '刹那') {
      return { type: 'companion', id: 'setsuna' };
    }
    if (speaker === '夕映' && this.#state.phaseId === CANONICAL_PHASE_IDS.YUE_FESTIVAL_TOUR) {
      return { type: 'companion', id: 'yue' };
    }
    if (speaker === '木乃香') {
      return { type: 'actor', id: PREPARE_DATE_KONOKA.id };
    }
    const matchingActor = this.#createActorSnapshots().find((actor) => actor.name === speaker);
    if (matchingActor) {
      return { type: 'actor', id: matchingActor.id };
    }
    return { type: 'system', id: null };
  }

  /** 同行者snapshotを生成する。 */
  #createCompanionSnapshots() {
    const companions = [
      {
        id: 'kamo',
        name: 'カモ',
        position: copyPosition(this.#state.companionPositions.kamo),
        isActive: true,
        displayOnMap: false,
      },
    ];
    if (this.#state.companionPositions.setsuna) {
      companions.push({
        id: 'setsuna',
        name: '刹那',
        position: copyPosition(this.#state.companionPositions.setsuna),
        isActive: true,
        displayOnMap: true,
      });
    }
    if (this.#state.companionPositions.kotaro) {
      companions.push({
        id: 'kotaro',
        name: '小太郎',
        position: copyPosition(this.#state.companionPositions.kotaro),
        isActive: true,
        displayOnMap: true,
      });
    }
    if (this.#state.companionPositions.yue) {
      companions.push({
        id: 'yue',
        name: '夕映',
        position: copyPosition(this.#state.companionPositions.yue),
        isActive: true,
        displayOnMap: true,
      });
    }
    return companions;
  }

  /** 現在目的のsnapshotを生成する。 */
  #createObjectiveSnapshot() {
    const mainEventObjective = this.#createMainEventObjective();
    if (mainEventObjective) {
      return {
        title: mainEventObjective.title,
        position: mainEventObjective.position,
        completionRadius: CANONICAL_COMPLETION_RADIUS,
      };
    }
    if ([
      CANONICAL_PHASE_IDS.FREE_EXPLORE,
      CANONICAL_PHASE_IDS.INTERRUPTION,
      CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
      CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION,
      CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT,
    ].includes(this.#state.phaseId)) {
      return {
        title: '行き先と行動を選ぶ',
        position: null,
        completionRadius: CANONICAL_COMPLETION_RADIUS,
      };
    }
    const objectives = {
      [CANONICAL_PHASE_IDS.PROLOGUE]: { title: 'プロローグを読む', position: null },
      [CANONICAL_PHASE_IDS.OPENING]: { title: '麻帆良祭の説明を聞く', position: null },
      [CANONICAL_PHASE_IDS.MOVE_TO_3A]: { title: '3-Aへ向かう', position: SCHOOL_POSITIONS.CLASS_3A },
      [CANONICAL_PHASE_IDS.SELECT_HAUNTED_DIFFICULTY]: { title: 'ホラーハウスのコースを選ぶ', position: null },
      [CANONICAL_PHASE_IDS.HAUNTED_HOUSE]: {
        title: this.#state.activeScare
          ? '演出を確認する'
          : this.#state.hauntedScareIndex < this.#getHauntedScarePoints().length
            ? `${this.#getHauntedScarePoints()[this.#state.hauntedScareIndex].title}の地点へ進む`
            : '出口へ向かう',
        position: this.#state.hauntedScareIndex < this.#getHauntedScarePoints().length
          ? this.#getHauntedScarePoints()[this.#state.hauntedScareIndex].position
          : HAUNTED_POSITIONS.EXIT,
      },
      [CANONICAL_PHASE_IDS.HAUNTED_HOUSE_PANIC_RUN]: { title: '出口まで走り抜ける', position: HAUNTED_POSITIONS.EXIT },
      [CANONICAL_PHASE_IDS.HAUNTED_HOUSE_RESULT]: { title: 'ホラーハウスの結果を見る', position: null },
      [CANONICAL_PHASE_IDS.MOVE_TO_HEALTH_ROOM]: { title: '保健室へ向かう', position: SCHOOL_POSITIONS.HEALTH_ROOM },
      [CANONICAL_PHASE_IDS.SLEEP]: { title: '仮眠する', position: null },
      [CANONICAL_PHASE_IDS.REWIND]: { title: 'カシオペアの起動を見る', position: null },
      [CANONICAL_PHASE_IDS.MOVE_TO_CAFE]: { title: 'カフェへ向かう', position: SCHOOL_POSITIONS.CAFE },
      [CANONICAL_PHASE_IDS.CAFE]: { title: 'のどかと話す', position: null },
      [CANONICAL_PHASE_IDS.FOLLOW_NODOKA]: { title: 'のどかを尾行する', position: copyPosition(this.#state.nodokaPosition) },
      [CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA]: { title: '物陰に隠れる', position: SCHOOL_LANDMARKS.find((entry) => entry.id === 'cover').position },
      [CANONICAL_PHASE_IDS.TIME_TRAVEL_CONFIRMED]: { title: '状況を確認する', position: null },
      [CANONICAL_PHASE_IDS.EVA_ESCAPE]: { title: '逃走地点へ向かう', position: SCHOOL_POSITIONS.ESCAPE_GOAL },
      [CANONICAL_PHASE_IDS.SEARCH_CHAO]: { title: 'チャオの行き先を探す', position: null },
      [CANONICAL_PHASE_IDS.CHAO_ATTRACTION]: { title: `${this.#getCurrentChaoAttraction()?.label ?? '探索先'}を体験する`, position: null },
      [CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW]: { title: '飛行船から麻帆良祭を見る', position: null },
      [CANONICAL_PHASE_IDS.MEET_CHAO]: { title: 'チャオから説明を聞く', position: null },
      [CANONICAL_PHASE_IDS.REVIEW_SCHEDULE]: { title: 'スケジュールを見直す', position: null },
      [CANONICAL_PHASE_IDS.PREPARE_DATE]: this.#createPrepareDateObjective(),
      [CANONICAL_PHASE_IDS.NODOKA_DATE_PREPARE_FINISH]: { title: 'デート準備を終える', position: null },
      [CANONICAL_PHASE_IDS.NODOKA_DATE]: { title: 'のどかとデートする', position: null },
      [CANONICAL_PHASE_IDS.NODOKA_DATE_END]: { title: 'のどかとのデートを終える', position: null },
      [CANONICAL_PHASE_IDS.NODOKA_DATE_KISS]: { title: 'のどかとのキスシーンを見る', position: null },
      [CANONICAL_PHASE_IDS.ESCAPE_PATROL_STUDENTS]: { title: '魔法生徒から逃げる', position: SCHOOL_POSITIONS.ESCAPE_GOAL },
      [CANONICAL_PHASE_IDS.WORLD_TREE_MAGIC]: { title: '世界樹の魔力溜まり事件を見る', position: null },
      [CANONICAL_PHASE_IDS.RETURN_TO_THIRD_LOOP]: { title: '世界樹パトロールへ進む', position: null },
      [CANONICAL_PHASE_IDS.THIRD_LOOP_PATROL]: this.#createThirdLoopPatrolObjective(),
      [CANONICAL_PHASE_IDS.THIRD_LOOP_CAFE]: { title: '夕映とカフェへ向かう', position: SCHOOL_POSITIONS.CAFE },
      [CANONICAL_PHASE_IDS.THIRD_LOOP_BOAT]: { title: '観光船で麻帆良祭を見る', position: null },
      [CANONICAL_PHASE_IDS.THIRD_LOOP_DINNER]: { title: '夕食と武道会情報を確認する', position: null },
      [CANONICAL_PHASE_IDS.TOURNAMENT_KOTARO]: { title: '小太郎とまほら武道会会場へ向かう', position: SCHOOL_POSITIONS.GROUND_TOURNAMENT },
      [CANONICAL_PHASE_IDS.TOURNAMENT_RECEPTION]: { title: 'まほら武道会の受付をする', position: SCHOOL_POSITIONS.RYUGU_SHRINE },
      [CANONICAL_PHASE_IDS.TOURNAMENT_VENUE]: this.#createTournamentVenueObjective(),
      [CANONICAL_PHASE_IDS.TOURNAMENT_QUALIFIER]: { title: 'まほら武道会の予選を突破する', position: null },
      [CANONICAL_PHASE_IDS.TOURNAMENT_RESULT]: { title: 'まほら武道会予選の結果を選ぶ', position: null },
      [CANONICAL_PHASE_IDS.DAY1_DEBRIEF]: { title: '3-A反省会に参加する', position: null },
      [CANONICAL_PHASE_IDS.REWIND_TO_FOURTH_LOOP]: { title: '出し物巡りへ進む', position: null },
      [CANONICAL_PHASE_IDS.FOURTH_LOOP_HAUNTED_RETURN]: { title: '3-Aの客寄せを手伝う', position: null },
      [CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR]: this.#createClassmateAttractionTourObjective(),
      [CANONICAL_PHASE_IDS.YUE_FESTIVAL_TOUR]: { title: '夕映と麻帆良祭を周る', position: SCHOOL_POSITIONS.CAFE },
      [CANONICAL_PHASE_IDS.FESTIVAL_ENDING]: { title: '麻帆良祭の終了を見届ける', position: null },
      [CANONICAL_PHASE_IDS.GAME_OVER]: { title: 'ゲームオーバー', position: null },
      [CANONICAL_PHASE_IDS.COMPLETE]: { title: '原作導入プロトタイプ完了', position: null },
    };
    const objective = objectives[this.#state.phaseId] ?? { title: '自由探索', position: null };
    return {
      title: objective.title,
      position: objective.position ? copyPosition(objective.position) : null,
      completionRadius: CANONICAL_COMPLETION_RADIUS,
    };
  }

  /** Create the current objective for third-loop patrol. */
  #createThirdLoopPatrolObjective() {
    const step = THIRD_LOOP_PATROL_STEPS[this.#state.thirdLoop.patrolStepIndex] ?? THIRD_LOOP_PATROL_STEPS.at(-1);
    return { title: step.label, position: step.position };
  }

  /** Create the current objective for tournament venue movement. */
  #createTournamentVenueObjective() {
    return { title: '武道会会場の案内を確認する', position: SCHOOL_POSITIONS.GROUND_TOURNAMENT };
  }

  /** Create the current objective for classmate attraction tour. */
  #createClassmateAttractionTourObjective() {
    const actor = CLASSMATE_ATTRACTION_ACTORS
      .find((entry) => !this.#state.thirdLoop.completedAttractionActorIds.includes(entry.id));
    if (!actor) {
      return { title: '出し物巡りを完了する', position: null };
    }
    const area = this.#getClassmateAttractionArea(actor);
    return { title: `${area.label}で${actor.name}の${actor.attractionName}を見る`, position: area.position };
  }

  /** Create actor snapshots for the current phase. */
  #createActorSnapshots() {
    const actors = [];
    if (
      this.#state.phaseId === CANONICAL_PHASE_IDS.PREPARE_DATE
      || (
        this.#state.phaseId === CANONICAL_PHASE_IDS.LOCATION_ACTIONS
        && (
          this.#state.prepareDate.hasStarted
          || (
            this.#state.freeExplore.currentLocationId === PREPARE_DATE_KONOKA.areaId
            && !this.#state.prepareDate.hasStarted
            && getMinuteOfDay(this.#state.gameTime) >= 14 * 60
            && getMinuteOfDay(this.#state.gameTime) < 16 * 60
          )
        )
      )
    ) {
      actors.push({
        id: PREPARE_DATE_KONOKA.id,
        name: PREPARE_DATE_KONOKA.name,
        position: copyPosition(PREPARE_DATE_KONOKA.position),
        state: this.#state.prepareDate.hasCoordinated ? 'coordinated' : 'prepare-date',
      });
    }
    if (false && this.#state.phaseId === CANONICAL_PHASE_IDS.SEARCH_CHAO) {
      for (const actor of CHAO_HINT_ACTORS) {
        actors.push({ id: actor.id, name: actor.name, position: copyPosition(actor.position), state: 'chao-hint' });
      }
      if (this.#state.chaoSearch.isSetsunaWaiting) {
        actors.push({ id: 'setsuna', name: '刹那', position: copyPosition(SCHOOL_POSITIONS.CHASE_SETSUNA_WAIT), state: 'waiting' });
      }
    }
    if (
      [CANONICAL_PHASE_IDS.LOCATION_ACTIONS, CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT].includes(this.#state.phaseId)
      && this.#state.freeExplore.currentLocationId === 'ground'
      && this.#hasFestivalNotificationShown('mahora-budokai-delay')
      && !this.#state.thirdLoop.tournamentKotaroJoined
    ) {
      actors.push({ id: 'kotaro-tournament', name: '小太郎', position: copyPosition(SCHOOL_POSITIONS.GROUND_TOURNAMENT), state: 'tournament-info' });
    }
    if ([CANONICAL_PHASE_IDS.CAFE, CANONICAL_PHASE_IDS.FOLLOW_NODOKA, CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA].includes(this.#state.phaseId)) {
      actors.push({ id: 'nodoka', name: 'のどか', position: copyPosition(this.#state.nodokaPosition), state: this.#state.phaseId });
    }
    if ([CANONICAL_PHASE_IDS.FOLLOW_NODOKA, CANONICAL_PHASE_IDS.HIDE_FROM_NODOKA, CANONICAL_PHASE_IDS.TIME_TRAVEL_CONFIRMED].includes(this.#state.phaseId)) {
      actors.push({ id: 'past-negi', name: '過去ネギたち', position: copyPosition(SCHOOL_POSITIONS.EVA_START), state: 'past-loop' });
    }
    if ([CANONICAL_PHASE_IDS.TIME_TRAVEL_CONFIRMED, CANONICAL_PHASE_IDS.EVA_ESCAPE].includes(this.#state.phaseId)) {
      actors.push({ id: 'eva', name: 'エヴァ', position: copyPosition(this.#state.evaPosition), state: 'chasing' });
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.MEET_CHAO) {
      const foundLocation = this.#getChaoSearchLocation(this.#state.chaoSearch.foundLocationId);
      actors.push({
        id: 'chao',
        name: 'チャオ',
        position: copyPosition(foundLocation?.position ?? SCHOOL_POSITIONS.CHAO_AIRSHIP),
        state: 'found',
      });
    }
    if ([
      CANONICAL_PHASE_IDS.FREE_EXPLORE,
      CANONICAL_PHASE_IDS.INTERRUPTION,
      CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
      CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION,
      CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT,
    ].includes(this.#state.phaseId)) {
      const currentLocation = this.#getFreeExploreDestination(this.#state.freeExplore.currentLocationId);
      if (this.#state.freeExplore.currentLocationId === 'dining-street' && this.#canTalkToNodokaDate()) {
        actors.push({ id: 'nodoka-date', name: 'のどか', position: copyPosition(SCHOOL_POSITIONS.CAFE), state: 'date-waiting' });
      }
      if (this.#canStartYueFestivalTour()) {
        actors.push({ id: 'yue-festival-tour', name: '夕映', position: copyPosition(SCHOOL_POSITIONS.CAFE), state: 'yue-festival-tour' });
      }
      for (const actor of CLASSMATE_SOCIAL_ACTORS) {
        if (actor.id === NODOKA_SOCIAL_ACTOR.id && this.#canTalkToNodokaDate()) {
          continue;
        }
        if (actor.id === 'yue' && this.#canStartYueFestivalTour()) {
          continue;
        }
        if (actor.id === KOTARO_SOCIAL_ACTOR.id && this.#hasFestivalNotificationShown('mahora-budokai-delay')) {
          continue;
        }
        const areaId = this.#getClassmateCurrentAreaId(actor);
        if (!currentLocation || areaId !== currentLocation.id) {
          continue;
        }
        const actorIndex = CLASSMATE_SOCIAL_ACTORS.findIndex((entry) => entry.id === actor.id);
        actors.push({
          id: actor.id,
          name: actor.name,
          position: copyPosition({
            x: currentLocation.position.x + ((actorIndex % 3) - 1) * 0.7,
            y: currentLocation.position.y + 1 + Math.floor(actorIndex / 3) * 0.45,
          }),
          state: this.#isClassmateAttractionOpen(actor) ? 'attraction-open' : 'free-explore',
        });
      }
      if (
        false
        && !this.#state.companionPositions.kotaro
        && !this.#hasFestivalNotificationShown('mahora-budokai-delay')
      ) {
        actors.push({
          id: KOTARO_SOCIAL_ACTOR.id,
          name: KOTARO_SOCIAL_ACTOR.name,
          position: copyPosition({
            x: currentLocation.position.x + 1.2,
            y: currentLocation.position.y + 0.6,
          }),
          state: 'free-explore',
        });
      }
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.THIRD_LOOP_PATROL) {
      if (this.#state.thirdLoop.completedPatrolStepIds.includes('join-kotaro')) {
        actors.push({ id: 'kotaro-third-loop', name: '小太郎', position: copyPosition(THIRD_LOOP_PATROL_STEPS[1].position), state: 'patrol' });
      }
    }
    if ([CANONICAL_PHASE_IDS.THIRD_LOOP_CAFE, CANONICAL_PHASE_IDS.THIRD_LOOP_BOAT, CANONICAL_PHASE_IDS.THIRD_LOOP_DINNER].includes(this.#state.phaseId)) {
      actors.push({ id: 'yue-third-loop', name: '夕映', position: copyPosition(SCHOOL_POSITIONS.YUE_MEET), state: 'third-loop' });
      actors.push({ id: 'kotaro-third-loop', name: '小太郎', position: copyPosition(SCHOOL_POSITIONS.DINNER_SPOT), state: 'third-loop' });
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.TOURNAMENT_QUALIFIER) {
      actors.push({ id: 'chao-tournament', name: 'チャオ', position: copyPosition(SCHOOL_POSITIONS.RYUGU_SHRINE), state: 'tournament' });
    }
    if ([
      CANONICAL_PHASE_IDS.FOURTH_LOOP_HAUNTED_RETURN,
      CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR,
      CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR,
    ].includes(this.#state.phaseId)) {
      actors.push({ id: 'kotaro-fourth-loop', name: '小太郎', position: copyPosition({ x: SCHOOL_POSITIONS.CLASS_3A.x + 1, y: SCHOOL_POSITIONS.CLASS_3A.y }), state: 'fourth-loop' });
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR) {
      if (this.#state.thirdLoop.isAyakaCompanion || this.#state.phaseId === CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR) {
        actors.push({ id: 'ayaka-fourth-loop', name: 'あやか', position: copyPosition(SCHOOL_POSITIONS.CLASS_3A), state: 'companion' });
      }
      for (const actor of CLASSMATE_ATTRACTION_ACTORS) {
        const area = this.#getClassmateAttractionArea(actor);
        actors.push({
          id: actor.id,
          name: actor.name,
          position: copyPosition(area.position),
          state: this.#state.thirdLoop.completedAttractionActorIds.includes(actor.id)
            ? 'completed-attraction'
            : this.#isClassmateAttractionOpen(actor) ? 'classmate-attraction' : 'waiting-schedule',
        });
      }
    }
    return actors;
  }

  /** 尾行状態snapshotを生成する。 */
  #createTrackingSnapshot() {
    if (this.#state.phaseId !== CANONICAL_PHASE_IDS.FOLLOW_NODOKA) {
      return null;
    }
    const distance = getDistance(this.#state.playerPosition, this.#state.nodokaPosition);
    return {
      distance,
      minDistance: NODOKA_TOO_CLOSE_DISTANCE,
      maxDistance: NODOKA_TOO_FAR_DISTANCE,
      tooCloseSeconds: this.#state.nodokaTooCloseSeconds,
      tooFarSeconds: this.#state.nodokaTooFarSeconds,
      alertState: distance < NODOKA_TOO_CLOSE_DISTANCE
        ? 'too-close'
        : distance > NODOKA_TOO_FAR_DISTANCE ? 'too-far' : 'safe',
    };
  }

  /** 視線状態snapshotを生成する。 */
  #createVisibilitySnapshot() {
    return null;
  }

  /** ホラーハウス状態snapshotを生成する。 */
  #createHauntedHouseSnapshot() {
    const difficulty = HAUNTED_DIFFICULTIES[this.#state.hauntedDifficultyId];
    return {
      difficulty: {
        id: difficulty.id,
        label: difficulty.label,
        viewRadius: difficulty.viewRadius,
        panicIncrease: difficulty.panicIncrease,
        scareCount: difficulty.scareCount,
        isRecommended: difficulty.isRecommended,
      },
      panic: {
        current: this.#state.hauntedPanic,
        max: HAUNTED_PANIC_MAX,
        recoveryPerSecond: HAUNTED_PANIC_RECOVERY_PER_SECOND,
      },
      excitement: {
        current: this.#state.festivalStallExcitement['haunted-house'],
        max: HAUNTED_HOUSE_EXCITEMENT_MAX,
        increasePerFlyer: HAUNTED_HOUSE_EXCITEMENT_PER_FLYER,
      },
      result: this.#state.hauntedResult,
      rechallengeIds: [...this.#state.hauntedRechallengeIds],
      canRechallenge: this.#state.hauntedRechallengeIds.length > 0,
    };
  }

  /** 現在段階で選択できる選択肢snapshotを生成する。 */
  #createChoiceSnapshots() {
    if (this.#state.activeScare) {
      return [];
    }
    const simpleChoices = {
      [CANONICAL_PHASE_IDS.MOVE_TO_3A]: [
        { id: 'go-to-3a', label: '3-Aへ向かう', description: '教室棟へ移動する。', isRecommended: true },
      ],
      [CANONICAL_PHASE_IDS.MOVE_TO_HEALTH_ROOM]: [
        { id: 'go-to-health-room', label: '保健室へ向かう', description: '刹那と一緒に保健室へ移動する。', isRecommended: true },
      ],
      [CANONICAL_PHASE_IDS.MOVE_TO_CAFE]: [
        { id: 'go-to-cafe', label: 'カフェへ向かう', description: 'のどかがいるカフェへ移動する。', isRecommended: true },
      ],
      [CANONICAL_PHASE_IDS.ESCAPE_PATROL_STUDENTS]: [
        { id: 'escape-patrol', label: '振り切る', description: '魔法生徒たちから逃げ切る。', isRecommended: true },
      ],
      [CANONICAL_PHASE_IDS.THIRD_LOOP_CAFE]: [
        { id: 'go-third-loop-cafe', label: '夕映とカフェへ向かう', description: '夕映と合流してカフェへ行く。', isRecommended: true },
      ],
    };
    if (simpleChoices[this.#state.phaseId]) {
      return simpleChoices[this.#state.phaseId].map((choice) => ({ ...choice }));
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.HAUNTED_HOUSE) {
      return [
        { id: 'advance-haunted', label: '慎重に進む', description: '暗い教室を一本道に沿って進む。', isRecommended: true },
        { id: 'calm-down', label: '立ち止まって落ち着く', description: 'パニックメーターを少し下げる。', isRecommended: false },
        { id: 'rush-haunted', label: '急いで進む', description: '早く進むがパニックが上がりやすい。', isRecommended: false },
      ];
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.FOLLOW_NODOKA) {
      return [
        { id: 'keep-distance-nodoka', label: '距離を保って追う', description: 'のどかに気づかれない距離を維持する。', isRecommended: true },
        { id: 'too-close-nodoka', label: '近づきすぎる', description: '尾行に失敗し、開始位置からやり直す。', isRecommended: false },
      ];
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.EVA_ESCAPE) {
      return [
        { id: 'eva-escape', label: '人混みに紛れて逃げる', description: 'エヴァを振り切って探索へ進む。', isRecommended: true },
        { id: 'eva-captured', label: '捕まる', description: '捕まっても話を聞いたあと探索へ進む。', isRecommended: false },
      ];
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.THIRD_LOOP_PATROL) {
      const step = THIRD_LOOP_PATROL_STEPS[this.#state.thirdLoop.patrolStepIndex];
      return step
        ? [{ id: 'next-patrol', label: step.label, description: step.text, isRecommended: true }]
        : [];
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.TOURNAMENT_QUALIFIER) {
      return [
        { id: 'tournament-attack', label: '攻撃', description: '投げに勝ち、勝利時に10ダメージを与える。', isRecommended: true },
        { id: 'tournament-throw', label: '投げ', description: '防御に勝ち、勝利時に5ダメージを与える。', isRecommended: false },
        { id: 'tournament-defend', label: '防御', description: '攻撃に勝ち、勝利時のダメージは0。', isRecommended: false },
      ];
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.TOURNAMENT_RESULT) {
      return [
        { id: 'tournament-retry', label: '予選に再挑戦する', description: 'HPを初期値に戻して予選をやり直す。', isRecommended: true },
        { id: 'tournament-give-up', label: '予選を諦める', description: '予選を終了し、PM8:00まで進める。', isRecommended: false },
      ];
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.PREPARE_DATE_OUTFIT) {
      return [
        { id: 'choose-outfit-keep', label: '変更なし', description: `${this.#getCurrentOutfit().label}のまま行く。`, isRecommended: true },
        { id: 'choose-outfit-casual', label: 'カジュアルな服', description: 'のどかとのデートで高評価を得やすい服装にする。', isRecommended: false },
        { id: 'choose-outfit-chunibyo', label: '厨二病な服', description: '個性的な服装にする。', isRecommended: false },
      ];
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.PREPARE_DATE) {
      const choices = [];
      for (const spot of PREPARE_DATE_SPOTS) {
        if (!this.#state.prepareDate[spot.completedKey]) {
          choices.push({ id: `prepare-${spot.id}`, label: spot.label, description: spot.text, isRecommended: choices.length === 0 });
        }
      }
      choices.push({ id: 'finish-date-prepare', label: '準備を終了する', description: 'のどかデート準備を終える。', isRecommended: choices.length === 0 });
      return choices;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR) {
      const unfinishedActors = CLASSMATE_ATTRACTION_ACTORS
        .filter((actor) => !this.#state.thirdLoop.completedAttractionActorIds.includes(actor.id));
      const currentAreaId = this.#state.thirdLoop.currentAttractionAreaId;
      const currentAreaChoices = unfinishedActors
        .filter((actor) => this.#getClassmateAttractionArea(actor).id === currentAreaId)
        .filter((actor) => this.#isClassmateAttractionOpen(actor))
        .map((actor, index) => ({
          id: `visit-${actor.id}`,
          label: `${actor.name} / ${actor.attractionName}`,
          description: actor.text,
          isRecommended: index === 0,
        }));
      const destinationChoices = [];
      const destinationAreaIds = new Set();
      for (const actor of unfinishedActors) {
        const area = this.#getClassmateAttractionArea(actor);
        if (area.id === currentAreaId || destinationAreaIds.has(area.id)) {
          continue;
        }
        destinationAreaIds.add(area.id);
        destinationChoices.push({
          id: `go-attraction-area-${area.id}`,
          label: `${area.label}へ向かう`,
          description: `${area.areaName}の出し物を見に行く。`,
          isRecommended: currentAreaChoices.length === 0 && destinationChoices.length === 0,
        });
      }
      const waitChoices = currentAreaChoices.length === 0
        ? [{
          id: 'wait-attraction-time',
          label: '時間まで待つ',
          description: '時間を進めて一度待つ。',
          isRecommended: destinationChoices.length === 0,
        }]
        : [];
      return [...currentAreaChoices, ...destinationChoices, ...waitChoices];
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION) {
      const actor = CLASSMATE_SOCIAL_ACTORS.find(
        (entry) => entry.id === this.#state.classmateConversation.actorId,
      );
      if (!actor) {
        return [];
      }
      if (false) {
        return [
          {
            id: 'join-kotaro',
            label: '小太郎をパーティに加える',
            description: '小太郎と一緒に行動する。',
            isRecommended: true,
          },
          {
            id: 'decline-kotaro',
            label: '今回は加えない',
            description: '小太郎とは別行動する。',
            isRecommended: false,
          },
        ];
      }
      const choices = [{
        id: `talk-classmate-${actor.id}`,
        label: `${actor.name}と普通に話す`,
        description: 'クラスメイトとの会話を続ける。',
        isRecommended: true,
      }];
      if (this.#getChaoHintActorForClassmate(actor)) {
        choices.push({
          id: `ask-chao-${actor.id}`,
          label: 'チャオのことを聞く',
          description: 'チャオについて知っていることを聞く。',
          isRecommended: false,
        });
      }
      if (actor.id === KOTARO_SOCIAL_ACTOR.id) {
        choices.push(
          {
            id: 'join-kotaro',
            label: '小太郎をパーティに加える',
            description: '小太郎と一緒に行動する。',
            isRecommended: false,
          },
          {
            id: 'decline-kotaro',
            label: '今回は加入しない',
            description: '小太郎とは別行動にする。',
            isRecommended: false,
          },
        );
      }
      return choices;
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.SELECT_HAUNTED_DIFFICULTY) {
      return Object.values(HAUNTED_DIFFICULTIES).map((difficulty) => ({
        id: difficulty.id,
        label: difficulty.label,
        description: `視界${difficulty.viewRadius} / パニック+${difficulty.panicIncrease}`,
        isRecommended: difficulty.isRecommended,
      }));
    }
    if (this.#state.phaseId === CANONICAL_PHASE_IDS.SEARCH_CHAO) {
      if (this.#state.chaoSearch.pendingSetsunaChoice) {
        return [
          {
            id: 'setsuna-join',
            label: '一緒に探す',
            description: '刹那をチャオ探索へ連れて行く。',
            isRecommended: true,
          },
          {
            id: 'setsuna-wait',
            label: 'ここで待つ',
            description: '刹那は解散場所で待機する。',
            isRecommended: false,
          },
        ];
      }
      return [];
    }
    return [];
  }

  /** Create renderer-facing state for place-selection free exploration. */
  #createFreeExploreSnapshot() {
    const currentLocation = this.#getFreeExploreDestination(this.#state.freeExplore.currentLocationId) ?? {
      id: 'entrance-gate',
      label: '入場門',
      areaName: '入場門',
      position: SCHOOL_POSITIONS.START,
      routeAreas: [],
      description: '麻帆良祭の入口。',
    };
    return {
      currentLocation: {
        id: currentLocation.id,
        label: currentLocation.label,
        areaName: currentLocation.areaName,
      },
      destinations: this.#state.phaseId === CANONICAL_PHASE_IDS.FREE_EXPLORE
        ? this.#getConnectedFreeExploreDestinations(currentLocation.id).map((destination) => ({
          id: destination.id,
          label: destination.label,
          areaName: destination.areaName,
          description: destination.description,
          isCurrent: destination.id === currentLocation.id,
        }))
        : [],
      interruption: this.#state.freeExplore.interruption
        ? {
          id: this.#state.freeExplore.interruption.id,
          source: this.#state.freeExplore.interruption.source,
          title: this.#state.freeExplore.interruption.title,
          description: this.#state.freeExplore.interruption.description,
          choices: FREE_EXPLORE_INTERRUPTION_CHOICES.map((choice) => ({ ...choice })),
        }
        : null,
      locationActions: [CANONICAL_PHASE_IDS.FREE_EXPLORE, CANONICAL_PHASE_IDS.LOCATION_ACTIONS].includes(this.#state.phaseId)
        ? this.#createFreeExploreLocationActions().map((action) => ({
          id: action.id,
          label: action.label,
          kind: action.kind,
          destinationId: action.destinationId ?? null,
          targetMinute: action.targetMinute ?? null,
          isEnabled: this.#isTutorialLocationActionEnabled(action),
        }))
        : [],
      actionResult: this.#state.freeExplore.actionResult
        ? { ...this.#state.freeExplore.actionResult }
        : null,
      libraryDungeon: {
        isActive: this.#state.freeExplore.libraryDungeon.isActive,
        currentFloor: this.#state.freeExplore.libraryDungeon.currentFloor,
        pendingBarrierCost: this.#state.freeExplore.libraryDungeon.pendingBarrierCost,
        lastResult: this.#state.freeExplore.libraryDungeon.lastResult,
        hasReachedFinalFloor: this.#state.persistentEvents.hasReachedLibraryDungeonFinalFloor,
      },
    };
  }

  #createChaoSearchSnapshot() {
    const currentAttraction = this.#getCurrentChaoAttraction();
    const availableInteraction = this.#state.phaseId === CANONICAL_PHASE_IDS.SEARCH_CHAO
      ? this.#findChaoSearchInteractionTarget(null)
      : null;
    return {
      attractions: CHAO_ATTRACTIONS.map((attraction) => ({
        id: attraction.id,
        label: attraction.label,
        description: attraction.description,
        isCompleted: this.#state.chaoSearch.completedAttractionIds.includes(attraction.id),
        isCurrent: currentAttraction?.id === attraction.id,
      })),
      currentAttractionId: currentAttraction?.id ?? null,
      completedAttractionIds: [...this.#state.chaoSearch.completedAttractionIds],
      locations: CHAO_SEARCH_LOCATIONS.map((location) => ({
        id: location.id,
        label: location.label,
        kind: location.kind,
        areaId: location.areaId,
        position: copyPosition(location.position),
        isVisited: this.#state.chaoSearch.visitedLocationIds.includes(location.id),
        isFound: this.#state.chaoSearch.foundLocationId === location.id,
      })),
      visitedLocationIds: [...this.#state.chaoSearch.visitedLocationIds],
      hints: this.#state.chaoSearch.hints.map((hint) => ({ ...hint })),
      heardHintActorIds: [...this.#state.chaoSearch.heardHintActorIds],
      isSetsunaWithParty: Boolean(this.#state.companionPositions.setsuna),
      isSetsunaWaiting: this.#state.chaoSearch.isSetsunaWaiting,
      isChaoFound: Boolean(this.#state.chaoSearch.foundLocationId),
      canStartNodokaDate: this.#canTalkToNodokaDate(),
      isNodokaDateCompleted: this.#state.chaoSearch.isNodokaDateCompleted,
      hasMissedNodokaDate: this.#state.chaoSearch.hasMissedNodokaDate,
      availableInteraction: availableInteraction
        ? {
          id: availableInteraction.id,
          type: availableInteraction.type,
          label: availableInteraction.actor?.name ?? availableInteraction.location?.label ?? '刹那',
        }
        : null,
      nextDestination: this.#state.phaseId === CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW
        || this.#state.phaseId === CANONICAL_PHASE_IDS.MEET_CHAO
        ? 'airship'
        : this.#getNextChaoSearchLocation()?.id ?? currentAttraction?.id ?? null,
      airshipOverview: this.#state.phaseId === CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW
        ? {
          title: AIRSHIP_OVERVIEW_MAP.title,
          areas: AIRSHIP_OVERVIEW_MAP.areas.map((area) => ({ ...area })),
        }
        : null,
      hasCassiopeiaManual: this.#state.chaoSearch.hasCassiopeiaManual,
    };
  }

  /** デート前自由時間の目的snapshotを生成する。 */
  #createPrepareDateObjective() {
    if (!this.#state.prepareDate.hasStarted) {
      return { title: '屋台通りで木乃香に話しかける', position: PREPARE_DATE_KONOKA.position };
    }
    if (!this.#state.prepareDate.hasCoordinated) {
      return { title: '木乃香に服装の相談をする', position: PREPARE_DATE_KONOKA.position };
    }
    const nextSpot = PREPARE_DATE_SPOTS.find((spot) => !this.#state.prepareDate[spot.completedKey]);
    if (nextSpot) {
      return { title: nextSpot.label, position: nextSpot.position };
    }
    return { title: 'PM4:00まで自由に過ごす', position: null };
  }

  /** デート前自由時間状態snapshotを生成する。 */
  #createPrepareDateSnapshot() {
    const availableInteraction = this.#state.phaseId === CANONICAL_PHASE_IDS.PREPARE_DATE
      ? this.#findPrepareDateInteractionTarget(null)
      : null;
    const canStartDate = [
      CANONICAL_PHASE_IDS.PREPARE_DATE,
      CANONICAL_PHASE_IDS.PREPARE_DATE_OUTFIT,
    ].includes(this.#state.phaseId)
      || this.#state.prepareDate.hasStarted;
    return {
      hasPrepared: this.#state.prepareDate.hasPrepared,
      isLoopCompleted: this.#state.prepareDate.isLoopCompleted,
      hasCoordinated: this.#state.prepareDate.hasCoordinated,
      hasGift: this.#state.prepareDate.hasGift,
      hasTopic: this.#state.prepareDate.hasTopic,
      outfit: this.#createOutfitSnapshot(),
      preparationScore: this.#state.prepareDate.preparationScore,
      preparationScoreMax: NODOKA_DATE_PREPARATION_SCORE_MAX,
      canStartDate,
      spots: PREPARE_DATE_SPOTS.map((spot) => ({
        id: spot.id,
        label: spot.label,
        position: copyPosition(spot.position),
        isCompleted: Boolean(this.#state.prepareDate[spot.completedKey]),
      })),
      availableInteraction: availableInteraction
        ? {
          id: availableInteraction.id,
          type: availableInteraction.type,
          label: availableInteraction.type === 'konoka'
            ? PREPARE_DATE_KONOKA.name
            : availableInteraction.spot.label,
        }
        : null,
    };
  }

  /** Create renderer-facing state for the third-loop and fourth-loop additions. */
  #createThirdLoopSnapshot() {
    const availableAttraction = this.#state.phaseId === CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR
      ? this.#findClassmateAttractionInteractionTarget(null)
      : null;
    return {
      patrolStepIndex: this.#state.thirdLoop.patrolStepIndex,
      completedPatrolStepIds: [...this.#state.thirdLoop.completedPatrolStepIds],
      patrolSteps: THIRD_LOOP_PATROL_STEPS.map((step, index) => ({
        id: step.id,
        label: step.label,
        position: copyPosition(step.position),
        isCompleted: this.#state.thirdLoop.completedPatrolStepIds.includes(step.id),
        isCurrent: index === this.#state.thirdLoop.patrolStepIndex,
      })),
      attractions: CLASSMATE_ATTRACTION_ACTORS.map((actor) => ({
        id: actor.id,
        name: actor.name,
        attractionName: actor.attractionName,
        areaId: this.#getClassmateAttractionArea(actor).id,
        areaName: this.#getClassmateAttractionArea(actor).areaName,
        position: copyPosition(actor.position),
        isCompleted: this.#state.thirdLoop.completedAttractionActorIds.includes(actor.id),
        isInScheduleTime: this.#isClassmateAttractionOpen(actor),
        isAvailableInCurrentArea: this.#getClassmateAttractionArea(actor).id === this.#state.thirdLoop.currentAttractionAreaId
          && this.#isClassmateAttractionOpen(actor),
      })),
      currentAttractionAreaId: this.#state.thirdLoop.currentAttractionAreaId,
      completedAttractionActorIds: [...this.#state.thirdLoop.completedAttractionActorIds],
      isAyakaCompanion: this.#state.thirdLoop.isAyakaCompanion,
      hasHelpedHauntedHouse: this.#state.thirdLoop.hasHelpedHauntedHouse,
      tournamentNotificationShown: this.#state.thirdLoop.tournamentNotificationShown,
      tournamentKotaroJoined: this.#state.thirdLoop.tournamentKotaroJoined,
      tournamentVenueConfirmed: this.#state.thirdLoop.tournamentVenueConfirmed,
      tournamentRegistered: this.#state.thirdLoop.tournamentRegistered,
      tournamentResult: this.#state.thirdLoop.tournamentResult,
      tournamentBattle: this.#state.thirdLoop.tournamentBattle
        ? { ...this.#state.thirdLoop.tournamentBattle }
        : null,
      availableInteraction: availableAttraction
        ? {
          id: availableAttraction.id,
          label: `${availableAttraction.name} / ${availableAttraction.attractionName}`,
        }
        : null,
      isAttractionTourComplete: this.#isClassmateAttractionTourComplete(),
    };
  }

  /** Create the dynamic Mahora Budokai schedule entries. */
  #createTournamentScheduleEntries() {
    if (!this.#hasFestivalNotificationShown('mahora-budokai-delay')) {
      const startMinute = 1050;
      const endMinute = 1140;
      const currentMinute = getMinuteOfDay(this.#state.gameTime);
      return [{
        id: 'mahora-budokai-qualifier',
        actorName: 'ネギ',
        attractionName: 'まほら武道会 予選',
        areaId: 'ground',
        areaName: this.#getFreeExploreDestination('ground')?.label ?? 'グラウンド',
        startMinute,
        endMinute,
        startTimeLabel: createTimeLabelFromMinute(startMinute),
        endTimeLabel: createTimeLabelFromMinute(endMinute),
        isAllDay: false,
        isCompleted: this.#isScheduleEventCompleted('mahora-budokai-qualifier'),
        isTimeUnknown: false,
        isInScheduleTime: currentMinute >= startMinute
          && currentMinute < endMinute,
        currentAreaId: currentMinute >= startMinute
          && currentMinute < endMinute
          ? 'ground'
          : null,
        isAvailableInCurrentArea: false,
      }];
    }
    if (!this.#state.thirdLoop.tournamentVenueConfirmed) {
      return [{
        id: 'mahora-budokai',
        actorName: 'ネギ',
        attractionName: 'まほら武道会',
        areaId: null,
        areaName: '不明',
        startMinute: null,
        endMinute: null,
        startTimeLabel: '不明',
        endTimeLabel: '不明',
        isAllDay: false,
        isCompleted: false,
        isTimeUnknown: true,
        isInScheduleTime: false,
        currentAreaId: null,
        isAvailableInCurrentArea: false,
      }];
    }
    const entries = [
      { id: 'mahora-budokai-reception', title: 'まほら武道会 受付', startMinute: 1080, endMinute: 1140 },
      { id: 'mahora-budokai-qualifier', title: 'まほら武道会 予選', startMinute: 1140, endMinute: 1170 },
    ];
    const currentMinute = getMinuteOfDay(this.#state.gameTime);
    return entries.map((entry) => ({
      id: entry.id,
      actorName: 'ネギ',
      attractionName: entry.title,
      areaId: 'ryugu-shrine',
      areaName: this.#getFreeExploreDestination('ryugu-shrine')?.label ?? '龍宮神社',
      startMinute: entry.startMinute,
      endMinute: entry.endMinute,
      startTimeLabel: createTimeLabelFromMinute(entry.startMinute),
      endTimeLabel: createTimeLabelFromMinute(entry.endMinute),
      isAllDay: false,
      isCompleted: this.#isScheduleEventCompleted(entry.id),
      isTimeUnknown: false,
      isInScheduleTime: currentMinute >= entry.startMinute
        && currentMinute < entry.endMinute,
      currentAreaId: currentMinute >= entry.startMinute && currentMinute < entry.endMinute ? 'ryugu-shrine' : null,
      isAvailableInCurrentArea: this.#state.freeExplore.currentLocationId === 'ryugu-shrine'
        && currentMinute >= entry.startMinute
        && currentMinute < entry.endMinute,
    }));
  }

  /** Create renderer-facing schedule data. */
  #createScheduleSnapshot() {
    const attractionEntries = CLASSMATE_ATTRACTION_ACTORS
      .map((actor) => {
        const schedule = CLASSMATE_ATTRACTION_SCHEDULE[actor.id];
        const area = this.#getClassmateAttractionArea(actor);
        return {
          id: actor.id,
          actorName: actor.name,
          attractionName: actor.attractionName,
          areaId: area.id,
          areaName: area.areaName,
          startMinute: schedule.startMinute,
          endMinute: schedule.endMinute,
          startTimeLabel: createTimeLabelFromMinute(schedule.startMinute),
          endTimeLabel: createTimeLabelFromMinute(schedule.endMinute),
          isCompleted: this.#isScheduleEventCompleted(actor.id),
          isInScheduleTime: this.#isClassmateAttractionOpen(actor),
          currentAreaId: this.#getClassmateCurrentAreaId(actor),
          isAvailableInCurrentArea: area.id === this.#state.thirdLoop.currentAttractionAreaId
            && this.#isClassmateAttractionOpen(actor),
        };
      });
    const negiEventEntries = NEGI_SCHEDULE_EVENTS
      .filter((entry) => entry.id !== 'yue-festival-tour' || this.#state.persistentEvents.hasUnlockedYueFestivalTour)
      .filter((entry) => entry.id !== 'haunted-house-flyer-ayaka' || (
        this.#state.persistentEvents.hasDiscoveredHauntedHouseFlyerAyakaSchedule
        || this.#state.persistentEvents.hasExperiencedHauntedHouseFlyerAyakaEvent
      ))
      .map((entry) => {
      const area = this.#getFreeExploreDestination(entry.areaId);
      const isNodokaDate = entry.id === 'nodoka-date';
      const isYueFestivalTour = entry.id === 'yue-festival-tour';
      const isAyakaBranchEntry = entry.id === 'haunted-house-flyer-ayaka';
      const isAyakaConditionMet = this.#state.persistentEvents.hasExperiencedHauntedHouseFlyerAyakaEvent;
      const isAyakaNameHidden = isAyakaBranchEntry && !isAyakaConditionMet;
      const startMinute = entry.branchOfId
        ? this.#state.persistentEvents.hauntedHouseFlyerAyakaEventStartMinute
          ?? (isAyakaBranchEntry ? 11 * 60 + 30 : entry.startMinute)
        : entry.startMinute;
      const endMinute = isNodokaDate
        ? getMinuteOfDay(this.#getNodokaDateEndTime())
        : entry.endMinute;
      const isInScheduleTime = isNodokaDate
        ? isMinuteBetweenInclusive(getMinuteOfDay(this.#state.gameTime), startMinute, endMinute)
        : isYueFestivalTour
          ? this.#isYueFestivalTourTime()
        : (entry.loopCount === null || this.#state.gameTime.loopCount === entry.loopCount)
          && isTimeBetweenInclusive(
            this.#state.gameTime,
            { ...this.#state.gameTime, hour: Math.floor(startMinute / 60), minute: startMinute % 60 },
            { ...this.#state.gameTime, hour: Math.floor(endMinute / 60), minute: endMinute % 60 },
          );
      return {
        id: entry.id,
        actorName: isAyakaNameHidden ? '???' : entry.actorName,
        attractionName: isAyakaNameHidden ? '???' : entry.eventName,
        areaId: entry.areaId,
        areaName: entry.areaId ? area?.label ?? entry.areaId : '場所指定なし',
        startMinute,
        endMinute,
        startTimeLabel: createTimeLabelFromMinute(startMinute),
        endTimeLabel: createTimeLabelFromMinute(endMinute),
        isAllDay: Boolean(entry.isAllDay),
        branchOfId: entry.branchOfId ?? null,
        isNameHidden: isAyakaNameHidden,
        conditionText: isAyakaNameHidden ? '小太郎がパーティに同行している' : null,
        isCompleted: this.#isScheduleEventCompleted(entry.id),
        isInScheduleTime,
        currentAreaId: isInScheduleTime ? entry.areaId : null,
        isAvailableInCurrentArea: entry.branchOfId
          ? false
          : entry.id === 'haunted-house-flyer'
          ? isInScheduleTime
          : isYueFestivalTour
          ? this.#canStartYueFestivalTour()
          : isNodokaDate
          ? isInScheduleTime
            && !this.#state.chaoSearch.hasMissedNodokaDate
            && !this.#state.chaoSearch.isNodokaDateCompleted
            && this.#state.freeExplore.currentLocationId === entry.areaId
          : isInScheduleTime && this.#state.freeExplore.currentLocationId === entry.areaId,
      };
    });
    return {
      negi: {
        range: { ...NEGI_SCHEDULE_RANGE },
        entries: [...attractionEntries, ...negiEventEntries.filter((entry) => entry.id !== 'tournament-qualifier'), ...this.#createTournamentScheduleEntries()]
          .sort((left, right) => left.startMinute - right.startMinute),
      },
      festival: {
        range: { ...FESTIVAL_STALL_SCHEDULE_RANGE },
        entries: FESTIVAL_STALL_SCHEDULE
          .map((entry) => {
            const area = this.#getFreeExploreDestination(entry.areaId);
            return {
              id: entry.id,
              title: entry.title,
              areaId: entry.areaId,
              areaName: area?.label ?? entry.areaId,
              startMinute: entry.startMinute,
              endMinute: entry.endMinute,
              startTimeLabel: createTimeLabelFromMinute(entry.startMinute),
              endTimeLabel: createTimeLabelFromMinute(entry.endMinute),
              isAllDay: entry.isAllDay,
              isCompleted: this.#isScheduleEventCompleted(entry.id),
              excitement: {
                current: this.#state.festivalStallExcitement[entry.id],
                max: HAUNTED_HOUSE_EXCITEMENT_MAX,
              },
              isAvailableInCurrentArea: entry.areaId === this.#state.freeExplore.currentLocationId,
            };
          })
          .sort((left, right) => left.startMinute - right.startMinute),
      },
    };
  }

  /** Set the current main event if the event is active. */
  #setMainEvent(eventId, isManual) {
    if (!this.#createActiveMainEventIds().includes(eventId)) {
      return false;
    }
    this.#state.mainEvent.activeEventId = eventId;
    this.#state.mainEvent.isManual = Boolean(isManual);
    return true;
  }

  /** Clear the current main event. */
  #clearMainEvent(isManual) {
    this.#state.mainEvent.activeEventId = null;
    this.#state.mainEvent.isManual = Boolean(isManual);
    return true;
  }

  /** Return active main event identifiers. */
  #createActiveMainEventIds() {
    const eventIds = [];
    const isChaoSearchActive = Boolean(this.#state.chaoSearch.targetLocationId)
      && !this.#state.chaoSearch.foundLocationId;
    if (isChaoSearchActive) {
      eventIds.push(CANONICAL_MAIN_EVENT_IDS.CHAO_SEARCH);
    }
    if (
      this.#state.prepareDate.hasStarted
      && getMinuteOfDay(this.#state.gameTime) < getMinuteOfDay(CANONICAL_TIMES.NODOKA_DATE)
      && !this.#state.chaoSearch.isNodokaDateCompleted
      && !this.#state.chaoSearch.hasMissedNodokaDate
    ) {
      eventIds.push(CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE_PREPARE);
    }
    if (
      this.#canTalkToNodokaDate()
      && !this.#state.chaoSearch.isNodokaDateCompleted
    ) {
      eventIds.push(CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE);
    }
    return eventIds;
  }

  /** Create a snapshot for selectable main events. */
  #createMainEventSnapshot() {
    const activeEventIds = this.#createActiveMainEventIds();
    const activeEventId = activeEventIds.includes(this.#state.mainEvent.activeEventId)
      ? this.#state.mainEvent.activeEventId
      : null;
    return {
      activeEventId,
      isManual: this.#state.mainEvent.isManual,
      events: activeEventIds.map((eventId) => {
        const definition = this.#getMainEventDefinition(eventId);
        return {
          ...definition,
          isActive: eventId === activeEventId,
          position: definition.position ? copyPosition(definition.position) : null,
        };
      }),
    };
  }

  /** Create tutorial controls and state for the renderer. */
  #createTutorialSnapshot() {
    return {
      canSkip: this.#isTutorialPhase(),
      isSkipped: this.#state.isTutorialSkipped,
      isCompleted: this.#state.isTutorialCompleted,
    };
  }

  /** Return renderer-facing data for a main event. */
  #getMainEventDefinition(eventId) {
    const definitions = {
      [CANONICAL_MAIN_EVENT_IDS.CHAO_SEARCH]: {
        id: CANONICAL_MAIN_EVENT_IDS.CHAO_SEARCH,
        title: 'チャオ探索',
        description: 'チャオの行き先を探す。',
        position: null,
      },
      [CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE_PREPARE]: {
        id: CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE_PREPARE,
        title: 'のどかデート準備',
        description: 'PM4:00までデートの準備をする。',
        position: this.#createPrepareDateObjective().position,
      },
      [CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE]: {
        id: CANONICAL_MAIN_EVENT_IDS.NODOKA_DATE,
        title: 'のどかデート',
        description: 'のどかとのデートへ向かう。',
        position: SCHOOL_POSITIONS.CAFE,
      },
    };
    return definitions[eventId] ?? {
      id: eventId,
      title: eventId,
      description: '',
      position: null,
    };
  }

  /** Return the objective represented by the selected main event. */
  #createMainEventObjective() {
    if (!this.#createActiveMainEventIds().includes(this.#state.mainEvent.activeEventId)) {
      return null;
    }
    const definition = this.#getMainEventDefinition(this.#state.mainEvent.activeEventId);
    return {
      title: definition.title,
      position: definition.position ? copyPosition(definition.position) : null,
    };
  }

  /** 行動ログへ1行を追加する。 */
  /** Return the renderer-facing snapshot for the current scene state. */
  #createActiveEventSnapshot() {
    return this.#state.activeEvent
      ? { ...this.#state.activeEvent, companionIds: [...this.#state.activeEvent.companionIds] }
      : null;
  }

  /** Create the event-oriented snapshot used by the renderer and tools. */
  #createEventSnapshots() {
    const eventPhaseIds = {
      'haunted-house': [
        CANONICAL_PHASE_IDS.SELECT_HAUNTED_DIFFICULTY,
        CANONICAL_PHASE_IDS.HAUNTED_HOUSE,
        CANONICAL_PHASE_IDS.HAUNTED_HOUSE_PANIC_RUN,
        CANONICAL_PHASE_IDS.HAUNTED_HOUSE_RESULT,
      ],
      'chao-search': [
        CANONICAL_PHASE_IDS.SEARCH_CHAO,
        CANONICAL_PHASE_IDS.CHAO_ATTRACTION,
        CANONICAL_PHASE_IDS.AIRSHIP_OVERVIEW,
        CANONICAL_PHASE_IDS.MEET_CHAO,
      ],
      'nodoka-date-prepare': [
        CANONICAL_PHASE_IDS.PREPARE_DATE,
        CANONICAL_PHASE_IDS.PREPARE_DATE_OUTFIT,
        CANONICAL_PHASE_IDS.NODOKA_DATE_PREPARE_FINISH,
      ],
      'nodoka-date': [
        CANONICAL_PHASE_IDS.NODOKA_DATE,
        CANONICAL_PHASE_IDS.NODOKA_DATE_NORMAL,
        CANONICAL_PHASE_IDS.NODOKA_DATE_KISS,
      ],
      'mahora-budokai': [
        CANONICAL_PHASE_IDS.THIRD_LOOP_DINNER,
        CANONICAL_PHASE_IDS.TOURNAMENT_KOTARO,
        CANONICAL_PHASE_IDS.TOURNAMENT_RECEPTION,
        CANONICAL_PHASE_IDS.TOURNAMENT_VENUE,
        CANONICAL_PHASE_IDS.TOURNAMENT_QUALIFIER,
        CANONICAL_PHASE_IDS.TOURNAMENT_RESULT,
      ],
      'classmate-attraction-tour': [CANONICAL_PHASE_IDS.CLASSMATE_ATTRACTION_TOUR],
      'ayaka-attraction-tour': [CANONICAL_PHASE_IDS.KOTARO_AYAKA_ATTRACTION_TOUR],
      'yue-festival-tour': [CANONICAL_PHASE_IDS.YUE_FESTIVAL_TOUR],
    };
    const phaseIsEvent = (phaseIds) => phaseIds.includes(this.#state.phaseId);
    const state = {
      hauntedHouse: this.#createHauntedHouseSnapshot(),
      chaoSearch: this.#createChaoSearchSnapshot(),
      nodokaDate: this.#createPrepareDateSnapshot(),
      mahoraBudokai: this.#createThirdLoopSnapshot(),
      classmateAttractionTour: this.#createThirdLoopSnapshot(),
      ayakaAttractionTour: this.#createThirdLoopSnapshot(),
      yueFestivalTour: this.#createThirdLoopSnapshot(),
    };
    return Object.fromEntries(CANONICAL_EVENT_DEFINITIONS.map((definition) => [
      definition.id,
      {
        ...definition,
        isActive: phaseIsEvent(eventPhaseIds[definition.id]),
        data: state[{
          'haunted-house': 'hauntedHouse',
          'chao-search': 'chaoSearch',
          'nodoka-date-prepare': 'nodokaDate',
          'nodoka-date': 'nodokaDate',
          'mahora-budokai': 'mahoraBudokai',
          'classmate-attraction-tour': 'classmateAttractionTour',
          'ayaka-attraction-tour': 'ayakaAttractionTour',
          'yue-festival-tour': 'yueFestivalTour',
        }[definition.id]],
      },
    ]));
  }

  /** Return the renderer-facing snapshot for the current scene state. */
  createSnapshot() {
    const map = this._getCurrentMap();
    const dialogue = this.#createDialogueSnapshot();
    return attachCanonicalSnapshotAliases({
      sceneId: CANONICAL_SCENE_ID,
      phase: {
        id: this.#state.phaseId,
        label: this.#getPhaseLabel(),
        inputKind: this.#getPhaseInputKind(),
      },
      gameTime: copyTime(this.#state.gameTime),
      phoneTime: this.#state.phoneTimeLabel,
      player: {
        position: copyPosition(this.#state.playerPosition),
        speed: CANONICAL_PLAYER_SPEED_CELLS_PER_SECOND,
        outfit: this.#createOutfitSnapshot(),
        magicPower: {
          current: this.#state.magicPower,
          max: MAGIC_POWER_MAX,
        },
      },
      affection: Object.fromEntries(
        CLASSMATE_SOCIAL_ACTORS.map((actor) => [
          actor.id,
          {
            current: this.#getClassmateAffection(actor.id),
            max: CLASSMATE_AFFECTION_MAX,
            ...(actor.id === NODOKA_SOCIAL_ACTOR.id
              ? { kissThreshold: NODOKA_AFFECTION_KISS_THRESHOLD }
              : {}),
          },
        ]),
      ),
      cgFlags: {
        nodokaKiss: this.#state.cgFlags.nodokaKiss,
      },
      companions: this.#createCompanionSnapshots(),
      objective: this.#createObjectiveSnapshot(),
      map,
      actors: this.#createActorSnapshots(),
      tracking: this.#createTrackingSnapshot(),
      visibility: this.#createVisibilitySnapshot(),
      choices: this.#createChoiceSnapshots(),
      freeExplore: this.#createFreeExploreSnapshot(),
      mainEvent: this.#createMainEventSnapshot(),
      schedule: this.#createScheduleSnapshot(),
      activeEvent: this.#createActiveEventSnapshot(),
      events: this.#createEventSnapshots(),
      classmateStatus: this.#createClassmateStatusSnapshot(),
      tutorial: this.#createTutorialSnapshot(),
      dialogue,
      festivalNotification: this.#createFestivalNotificationSnapshot(),
      gameOver: {
        isActive: this.#state.phaseId === CANONICAL_PHASE_IDS.GAME_OVER,
        reason: this.#state.gameOver.reason,
      },
      saveData: {
        canSave: this.#canUseSaveData(),
        canLoad: this.#canUseSaveData() && this.#hasSavedGame(),
        status: this.#state.saveStatus ? { ...this.#state.saveStatus } : null,
      },
      routeComplete: this.#state.phaseId === CANONICAL_PHASE_IDS.COMPLETE,
      log: [...this.#state.log],
    });
  }

  /** Return the active map snapshot for the renderer. */
  _getCurrentMap() {
    const isHaunted = [
      CANONICAL_PHASE_IDS.HAUNTED_HOUSE,
      CANONICAL_PHASE_IDS.HAUNTED_HOUSE_PANIC_RUN,
      CANONICAL_PHASE_IDS.HAUNTED_HOUSE_RESULT,
    ].includes(this.#state.phaseId);
    const freeExploreLocation = [
      CANONICAL_PHASE_IDS.FREE_EXPLORE,
      CANONICAL_PHASE_IDS.INTERRUPTION,
      CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
      CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION,
      CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT,
    ].includes(this.#state.phaseId)
      ? this.#getFreeExploreDestination(this.#state.freeExplore.currentLocationId)
      : null;
    const scarePoints = this.#getHauntedScarePoints();
    const landmarks = isHaunted ? [] : [
      ...SCHOOL_LANDMARKS,
      ...([
        CANONICAL_PHASE_IDS.FREE_EXPLORE,
        CANONICAL_PHASE_IDS.INTERRUPTION,
        CANONICAL_PHASE_IDS.LOCATION_ACTIONS,
        CANONICAL_PHASE_IDS.LOCATION_ACTION_RESULT,
        CANONICAL_PHASE_IDS.CLASSMATE_CONVERSATION,
        CANONICAL_PHASE_IDS.SEARCH_CHAO,
      ].includes(this.#state.phaseId)
        ? CHAO_SEARCH_LOCATIONS.map((location) => ({
          id: location.id,
          name: location.label,
          position: location.position,
        }))
        : []),
      ...(this.#state.phaseId === CANONICAL_PHASE_IDS.PREPARE_DATE
        ? PREPARE_DATE_SPOTS.map((spot) => ({
          id: spot.id,
          name: spot.label,
          position: spot.position,
        }))
        : []),
    ];
    return {
      id: isHaunted ? 'haunted-house' : 'school',
      name: isHaunted ? '3-Aお化け屋敷' : freeExploreLocation?.label ?? '麻帆良学園',
      width: isHaunted ? CANONICAL_HAUNTED_MAP_SIZE : CANONICAL_SCHOOL_MAP_SIZE,
      height: isHaunted ? CANONICAL_HAUNTED_MAP_SIZE : CANONICAL_SCHOOL_MAP_SIZE,
      obstacles: isHaunted ? HAUNTED_OBSTACLES : SCHOOL_OBSTACLES,
      landmarks,
      hauntedScares: isHaunted ? scarePoints.map((point, index) => ({
        id: point.id,
        title: point.title,
        position: copyPosition(point.position),
        status: index < this.#state.hauntedScareIndex
          ? 'completed'
          : index === this.#state.hauntedScareIndex ? 'current' : 'locked',
      })) : [],
    };
  }

  #addLog(message) {
    this.#state.log.push(message);
    if (this.#state.log.length > 6) {
      this.#state.log.shift();
    }
  }
}

export {
  CANONICAL_COMPLETION_RADIUS,
  CANONICAL_EVA_SPEED_CELLS_PER_SECOND,
  CANONICAL_INPUT_TYPES,
  CANONICAL_EVENT_DEFINITIONS,
  CANONICAL_MAIN_EVENT_IDS,
  CANONICAL_PHASE_IDS,
  CANONICAL_PLAYER_SPEED_CELLS_PER_SECOND,
  CANONICAL_SCENE_ID,
  CANONICAL_SCHOOL_MAP_SIZE,
  EVA_CAPTURE_DISTANCE,
  EVA_HEAD_START_SECONDS,
  HAUNTED_SCARE_POINTS,
  HAUNTED_PANIC_RECOVERY_PER_SECOND,
  INITIAL_CASSIOPEIA_MP_COST,
  LIBRARY_DUNGEON_FINAL_FLOOR,
  LIBRARY_DUNGEON_MAX_EVENT_MP_COST,
  LIBRARY_DUNGEON_STEP_MINUTES,
  NODOKA_HIDE_WARNING_SECONDS,
  NODOKA_TOO_CLOSE_DISTANCE,
  NODOKA_TOO_CLOSE_LIMIT_SECONDS,
  NODOKA_TOO_FAR_DISTANCE,
  NODOKA_TOO_FAR_LIMIT_SECONDS,
  SCHOOL_POSITIONS,
  CanonicalFestivalPrototypeScene,
};
