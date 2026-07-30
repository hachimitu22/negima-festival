/** 連鎖型ハプニングの種類。 */
const HAPPENING_TYPES = Object.freeze({
  PERFORMANCE: 'performance',
  SALE: 'sale',
  COSPLAY: 'cosplay',
  CARGO: 'cargo',
  JOINT_PARADE: 'joint-parade',
  STALL_CHAOS: 'stall-chaos',
  LOST_CHILD_CROWD: 'lost-child-crowd',
});

/** 連鎖型ハプニングの段階。 */
const HAPPENING_PHASES = Object.freeze({
  PRELUDE: 'prelude',
  ACTIONABLE: 'actionable',
  FLOWING: 'flowing',
  LARGE: 'large',
  RESOLVED: 'resolved',
});

/** ループ開始時に配置する背景ハプニング件数。 */
const MIN_HAPPENING_COUNT = 1;

/** directorが維持するハプニング件数の上限。 */
const MAX_HAPPENING_COUNT = 2;

/** 背景ハプニングだけで使用できる最大件数。 */
const MAX_BACKGROUND_HAPPENING_COUNT = 1;

/** 近傍ハプニングを発生可能にする実移動距離。 */
const PROXIMITY_SPAWN_DISTANCE = 12;

/** 近傍ハプニング間に必要なゲーム内分数。 */
const PROXIMITY_SPAWN_INTERVAL_MINUTES = 8;

/** 近傍ハプニング候補の最短距離。 */
const PROXIMITY_SPAWN_MIN_DISTANCE = 4;

/** 近傍ハプニング候補の最長距離。 */
const PROXIMITY_SPAWN_MAX_DISTANCE = 7;

/** ハプニングの発生経路。 */
const HAPPENING_SOURCES = Object.freeze({
  BACKGROUND: 'background',
  PROXIMITY: 'proximity',
});

/** 同時に直接介入できるハプニング件数。 */
const MAX_ACTIONABLE_HAPPENING_COUNT = 1;

/** ハプニングを操作できる距離。 */
const HAPPENING_INTERACTION_RADIUS = 2;

/** エリア状態の初期値。 */
const INITIAL_AREA_STATE = Object.freeze({ excitement: 20, congestion: 10, trouble: 0 });

/** エリア状態の1分あたりの残留値減衰量。 */
const AREA_STATE_DECAY_PER_MINUTE = Object.freeze({ excitement: 1, congestion: 2, trouble: 3 });

/** ハプニング段階ごとの群衆点数。 */
const CROWD_COUNTS = Object.freeze({
  [HAPPENING_PHASES.PRELUDE]: 3,
  [HAPPENING_PHASES.ACTIONABLE]: 6,
  [HAPPENING_PHASES.FLOWING]: 8,
  [HAPPENING_PHASES.LARGE]: 12,
});

/** 通常ハプニングとして抽選する種類。 */
const SPAWNABLE_HAPPENING_TYPES = Object.freeze([
  HAPPENING_TYPES.PERFORMANCE,
  HAPPENING_TYPES.SALE,
  HAPPENING_TYPES.COSPLAY,
  HAPPENING_TYPES.CARGO,
]);

/** ハプニング種類ごとの表示と選択定義。 */
const HAPPENING_DEFINITIONS = Object.freeze({
  [HAPPENING_TYPES.PERFORMANCE]: Object.freeze({
    title: '即興ライブの準備',
    actionableTitle: '即興ライブの人だかり',
    choices: Object.freeze([
      Object.freeze({ id: 'cheer', label: '一緒に盛り上げる', timeCostMinutes: 2, magicPowerCost: 0, result: 'flow-high' }),
      Object.freeze({ id: 'clear-path', label: '通路を確保する', timeCostMinutes: 3, magicPowerCost: 0, result: 'orderly' }),
    ]),
  }),
  [HAPPENING_TYPES.SALE]: Object.freeze({
    title: '限定メニューの呼び込み',
    actionableTitle: '限定メニューへ人が殺到',
    choices: Object.freeze([
      Object.freeze({ id: 'organize-line', label: '列を整理する', timeCostMinutes: 3, magicPowerCost: 0, result: 'orderly' }),
      Object.freeze({ id: 'guide-stalls', label: '別の屋台も案内する', timeCostMinutes: 2, magicPowerCost: 0, result: 'flow-low' }),
    ]),
  }),
  [HAPPENING_TYPES.COSPLAY]: Object.freeze({
    title: 'コスプレ参加者の集合',
    actionableTitle: 'コスプレ集団が移動を相談中',
    choices: Object.freeze([
      Object.freeze({ id: 'safe-route', label: '安全な道を案内する', timeCostMinutes: 2, magicPowerCost: 0, result: 'flow-low' }),
      Object.freeze({ id: 'invite-crowd', label: '一緒に呼び込む', timeCostMinutes: 2, magicPowerCost: 0, result: 'flow-high' }),
    ]),
  }),
  [HAPPENING_TYPES.CARGO]: Object.freeze({
    title: '荷物を落とした生徒',
    actionableTitle: '散らばった荷物と人だかり',
    choices: Object.freeze([
      Object.freeze({ id: 'help-pickup', label: '一緒に拾う', timeCostMinutes: 3, magicPowerCost: 0, result: 'orderly' }),
      Object.freeze({ id: 'clear-route', label: '通路を空ける', timeCostMinutes: 2, magicPowerCost: 0, result: 'flow-low' }),
    ]),
  }),
});

/** ハプニング段階ごとのエリア状態寄与。 */
const PHASE_AREA_EFFECTS = Object.freeze({
  [HAPPENING_PHASES.PRELUDE]: Object.freeze({ excitement: 10, congestion: 5, trouble: 0 }),
  [HAPPENING_PHASES.ACTIONABLE]: Object.freeze({ excitement: 25, congestion: 20, trouble: 5 }),
  [HAPPENING_PHASES.FLOWING]: Object.freeze({ excitement: 20, congestion: 25, trouble: 10 }),
  [HAPPENING_PHASES.LARGE]: Object.freeze({ excitement: 40, congestion: 40, trouble: 20 }),
});

/** 特殊ハプニングの状態寄与。 */
const SPECIAL_HAPPENING_EFFECTS = Object.freeze({
  [HAPPENING_TYPES.JOINT_PARADE]: Object.freeze({ excitement: 60, congestion: 45, trouble: 10 }),
  [HAPPENING_TYPES.STALL_CHAOS]: Object.freeze({ excitement: 30, congestion: 55, trouble: 50 }),
  [HAPPENING_TYPES.LOST_CHILD_CROWD]: Object.freeze({ excitement: 5, congestion: 30, trouble: 45 }),
});

/** 固定イベントIDごとのエリア状態寄与。 */
const FIXED_EVENT_EFFECTS = Object.freeze({
  'opening-stage': Object.freeze({ excitement: 35, congestion: 20, trouble: 0 }),
  'lost-child': Object.freeze({ excitement: 0, congestion: 10, trouble: 25 }),
  'cosplay-parade': Object.freeze({ excitement: 30, congestion: 25, trouble: 0 }),
  'stall-trouble': Object.freeze({ excitement: 5, congestion: 25, trouble: 35 }),
  'secret-exhibit': Object.freeze({ excitement: 15, congestion: 5, trouble: 0 }),
});

/**
 * 数値を指定範囲へ収める。
 * @param {number} value - 対象値。
 * @param {number} minimum - 最小値。
 * @param {number} maximum - 最大値。
 * @returns {number} 制限済みの値。
 */
function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

/**
 * 2点間の距離を返す。
 * @param {Object} left - 1点目。
 * @param {Object} right - 2点目。
 * @returns {number} ユークリッド距離。
 */
function getDistance(left, right) {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

/**
 * 座標を複製する。
 * @param {Object} position - 複製元座標。
 * @returns {Object} 複製した座標。
 */
function copyPosition(position) {
  return { x: position.x, y: position.y };
}

/**
 * 乱数から配列要素を選ぶ。
 * @param {Array<*>} values - 選択候補。
 * @param {number} randomValue - 乱数値。
 * @returns {*} 選択した要素。
 */
function pickRandom(values, randomValue) {
  const index = Math.floor(clamp(randomValue, 0, 0.999999) * values.length);
  return values[index];
}

/**
 * エリア状態値を生成する。
 * @returns {Object} 変更可能なエリア状態値。
 */
function createEmptyState() {
  return { excitement: 0, congestion: 0, trouble: 0 };
}

/**
 * エリア矩形の中心座標を返す。
 * @param {Object} area - エリア定義。
 * @returns {Object} 中心座標。
 */
function getAreaCenter(area) {
  return {
    x: area.area.x + area.area.width / 2,
    y: area.area.y + area.area.height / 2,
  };
}

/**
 * 麻帆良祭の連鎖型ハプニングを進行させる。
 */
class FestivalHappeningDirector {
  #random;
  #areas;
  #happenings;
  #residualStates;
  #eventFeed;
  #elapsedMinutes;
  #idSequence;
  #fixedEvents;
  #sites;
  #distanceSinceProximitySpawn;
  #lastProximitySpawnMinutes;

  /**
   * directorを生成する。
   * @param {Object} options - 生成引数。
   * @param {Function} options.random - 0以上1未満の乱数関数。
   * @param {Array<Object>} options.areas - ID、名称、矩形を持つエリア一覧。
   * @param {Array<Object>} [options.sites] - 通行可能なハプニング候補地点。
   */
  constructor({ random = Math.random, areas, sites = [] }) {
    this.#random = random;
    this.#areas = areas.map((area) => ({ ...area, area: { ...area.area } }));
    this.#happenings = [];
    this.#residualStates = new Map();
    this.#eventFeed = [];
    this.#elapsedMinutes = 0;
    this.#idSequence = 1;
    this.#fixedEvents = [];
    this.#sites = sites.length > 0
      ? sites.map((site) => ({ ...site, position: copyPosition(site.position) }))
      : this.#areas.map((area, index) => ({
          id: `fallback-${index}`,
          areaId: area.id,
          position: getAreaCenter(area),
        }));
    this.#distanceSinceProximitySpawn = 0;
    this.#lastProximitySpawnMinutes = 0;
    this.resetLoop();
  }

  /**
   * ハプニングとエリア状態を初期化して開始時の出来事を抽選する。
   * @returns {void}
   */
  resetLoop() {
    this.#happenings = [];
    this.#residualStates = new Map();
    for (const area of this.#areas) {
      this.#residualStates.set(area.id, createEmptyState());
    }
    this.#eventFeed = [];
    this.#elapsedMinutes = 0;
    this.#idSequence = 1;
    this.#fixedEvents = [];
    this.#distanceSinceProximitySpawn = 0;
    this.#lastProximitySpawnMinutes = 0;
    while (this.#happenings.length < MIN_HAPPENING_COUNT) {
      this.#spawnRandomHappening();
    }
  }

  /**
   * 経過時間に合わせて全ハプニングを進行する。
   * @param {Object} options - 更新引数。
   * @param {number} options.elapsedMinutes - AM10:00からの現在分数。
   * @param {number} options.deltaMinutes - 前回更新からの経過分数。
   * @param {Array<Object>} options.fixedEvents - 発生中の固定イベント一覧。
   * @param {Object|null} [options.playerPosition] - プレイヤー座標。
   * @param {number} [options.playerDistanceTraveled] - 今回の更新で移動した距離。
   * @param {Function} [options.hasLineOfSight] - 2座標間の視線判定。
   * @returns {void}
   */
  update({
    elapsedMinutes,
    deltaMinutes,
    fixedEvents = [],
    playerPosition = null,
    playerDistanceTraveled = 0,
    hasLineOfSight = () => true,
  }) {
    this.#elapsedMinutes = elapsedMinutes;
    this.#fixedEvents = fixedEvents.map((event) => ({ ...event }));
    this.#distanceSinceProximitySpawn += Math.max(0, playerDistanceTraveled);
    if (playerPosition) {
      this.#discoverVisibleHappenings(playerPosition, hasLineOfSight);
      this.#spawnProximityHappeningWhenReady(playerPosition, hasLineOfSight);
    }
    this.#decayResidualStates(deltaMinutes);
    this.#advanceHappenings();
    this.#mergeRelatedHappenings();
    this.#mergeFixedStallTrouble();
    this.#spawnLostChildCrowdWhenReady();
    this.#removeResolvedHappenings();
  }

  /**
   * 現在地のハプニングへ選択介入する。
   * @param {Object} options - 選択引数。
   * @param {string} options.happeningId - ハプニングID。
   * @param {string} options.choiceId - 選択肢ID。
   * @param {Object} options.playerPosition - プレイヤー座標。
   * @param {number} options.magicPower - 現在MP。
   * @returns {Object} 受理結果と消費値。
   */
  choose({ happeningId, choiceId, playerPosition, magicPower }) {
    const actionableIds = new Set(this.#getActionableHappenings().map((entry) => entry.id));
    const happening = this.#happenings.find((entry) => entry.id === happeningId);
    if (
      !happening
      || !actionableIds.has(happening.id)
      || getDistance(playerPosition, happening.position) > HAPPENING_INTERACTION_RADIUS
    ) {
      return { accepted: false, timeCostMinutes: 0, magicPowerCost: 0, logEntries: [] };
    }
    const definition = HAPPENING_DEFINITIONS[happening.type];
    const choice = definition?.choices.find((entry) => entry.id === choiceId);
    if (!choice || magicPower < choice.magicPowerCost) {
      return { accepted: false, timeCostMinutes: 0, magicPowerCost: 0, logEntries: [] };
    }
    this.#applyChoiceResult(happening, choice.result);
    const message = `${this.#getHappeningTitle(happening)}: ${choice.label}。`;
    this.#addFeed(message);
    return {
      accepted: true,
      timeCostMinutes: choice.timeCostMinutes,
      magicPowerCost: choice.magicPowerCost,
      logEntries: [message],
    };
  }

  /**
   * renderer向けsnapshotを生成する。
   * @param {Object} options - snapshot引数。
   * @param {Object} options.playerPosition - プレイヤー座標。
   * @returns {Object} ハプニング関連snapshot。
   */
  createSnapshot({ playerPosition }) {
    const actionableIds = new Set(this.#getActionableHappenings().map((entry) => entry.id));
    const happenings = this.#happenings.map((happening) => this.#createHappeningSnapshot(happening));
    return {
      happenings,
      nearbyHappenings: this.#happenings
        .filter((happening) => (
          actionableIds.has(happening.id)
          && getDistance(playerPosition, happening.position) <= HAPPENING_INTERACTION_RADIUS
        ))
        .map((happening) => this.#createNearbySnapshot(happening)),
      areaStates: this.#createAreaStateSnapshots(),
      crowdPoints: this.#createCrowdPointSnapshots(),
      flows: this.#createFlowSnapshots(),
      eventFeed: [...this.#eventFeed],
    };
  }

  /**
   * 乱数で通常ハプニングを1件生成する。
   * @private
   * @returns {Object} 生成したハプニング。
   */
  #spawnRandomHappening() {
    const occupiedSiteIds = new Set(this.#happenings.map((entry) => entry.siteId).filter(Boolean));
    const availableSites = this.#sites.filter((site) => !occupiedSiteIds.has(site.id));
    const site = pickRandom(availableSites.length > 0 ? availableSites : this.#sites, this.#random());
    const happening = this.#createHappeningAtSite(site, HAPPENING_SOURCES.BACKGROUND);
    this.#happenings.push(happening);
    return happening;
  }

  /** 条件成立時にプレイヤー近傍の死角へハプニングを生成する。 */
  #spawnProximityHappeningWhenReady(playerPosition, hasLineOfSight) {
    const hasActiveProximity = this.#happenings.some((entry) => (
      entry.source === HAPPENING_SOURCES.PROXIMITY
    ));
    if (
      hasActiveProximity
      || this.#happenings.length >= MAX_HAPPENING_COUNT
      || this.#distanceSinceProximitySpawn < PROXIMITY_SPAWN_DISTANCE
      || this.#elapsedMinutes - this.#lastProximitySpawnMinutes < PROXIMITY_SPAWN_INTERVAL_MINUTES
    ) {
      return;
    }
    const occupiedSiteIds = new Set(this.#happenings.map((entry) => entry.siteId).filter(Boolean));
    const candidates = this.#sites.filter((site) => {
      const distance = getDistance(playerPosition, site.position);
      return !occupiedSiteIds.has(site.id)
        && distance >= PROXIMITY_SPAWN_MIN_DISTANCE
        && distance <= PROXIMITY_SPAWN_MAX_DISTANCE
        && !hasLineOfSight(playerPosition, site.position);
    });
    if (candidates.length === 0) {
      return;
    }
    const site = pickRandom(candidates, this.#random());
    const happening = this.#createHappeningAtSite(site, HAPPENING_SOURCES.PROXIMITY);
    this.#happenings.push(happening);
    this.#distanceSinceProximitySpawn = 0;
    this.#lastProximitySpawnMinutes = this.#elapsedMinutes;
    this.#addFeed('近くで急に歓声が上がった。');
  }

  /** 視線が通ったハプニングを発見済みにする。 */
  #discoverVisibleHappenings(playerPosition, hasLineOfSight) {
    for (const happening of this.#happenings) {
      if (!happening.isDiscovered && hasLineOfSight(playerPosition, happening.position)) {
        happening.isDiscovered = true;
      }
    }
  }

  /** 候補地点へ新しいハプニング状態を生成する。 */
  #createHappeningAtSite(site, source) {
    const type = pickRandom(SPAWNABLE_HAPPENING_TYPES, this.#random());
    const position = copyPosition(site.position);
    const happening = {
      id: `happening-${this.#idSequence}`,
      type,
      phase: HAPPENING_PHASES.PRELUDE,
      areaId: site.areaId,
      position,
      originPosition: copyPosition(position),
      destinationAreaId: null,
      destinationPosition: null,
      phaseStartedMinutes: this.#elapsedMinutes,
      actionableSince: null,
      variant: null,
      source,
      siteId: site.id,
      isDiscovered: false,
    };
    this.#idSequence += 1;
    return happening;
  }

  /**
   * 経過時間によりハプニング段階を進める。
   * @private
   * @returns {void}
   */
  #advanceHappenings() {
    for (const happening of this.#happenings) {
      let advanced = true;
      let transitionCount = 0;
      while (advanced && transitionCount < 4) {
        advanced = this.#advanceOnePhaseWhenReady(happening);
        transitionCount += 1;
      }
    }
  }

  /**
   * 期限へ達したハプニングを1段階進める。
   * @private
   * @param {Object} happening - 対象ハプニング。
   * @returns {boolean} 段階を進めた場合はtrue。
   */
  #advanceOnePhaseWhenReady(happening) {
    const elapsed = this.#elapsedMinutes - happening.phaseStartedMinutes;
    if (happening.phase === HAPPENING_PHASES.PRELUDE && elapsed >= 2) {
      happening.phase = HAPPENING_PHASES.ACTIONABLE;
      happening.phaseStartedMinutes += 2;
      happening.actionableSince = happening.phaseStartedMinutes;
      this.#addFeed(`${this.#getArea(happening.areaId).name}の「${this.#getHappeningTitle(happening)}」が大きくなった。`);
      return true;
    }
    if (happening.phase === HAPPENING_PHASES.ACTIONABLE && elapsed >= 5) {
      this.#applyIgnoredResult(happening);
      return true;
    }
    if (happening.phase === HAPPENING_PHASES.FLOWING && elapsed >= 6) {
      happening.phase = HAPPENING_PHASES.LARGE;
      happening.phaseStartedMinutes += 6;
      happening.areaId = happening.destinationAreaId;
      happening.position = copyPosition(happening.destinationPosition);
      this.#addFeed(`人の流れが${this.#getArea(happening.areaId).name}へ到着した。`);
      return true;
    }
    if (happening.phase === HAPPENING_PHASES.LARGE && elapsed >= 8) {
      this.#resolveHappening(happening);
      return true;
    }
    return false;
  }

  /**
   * 放置されたハプニングを種類に応じて成長させる。
   * @private
   * @param {Object} happening - 対象ハプニング。
   * @returns {void}
   */
  #applyIgnoredResult(happening) {
    if (happening.type === HAPPENING_TYPES.CARGO) {
      happening.phase = HAPPENING_PHASES.LARGE;
      happening.phaseStartedMinutes += 5;
      happening.variant = 'crowd';
      this.#addFeed('散らばった荷物の周りに人だかりができた。');
      return;
    }
    if (happening.type === HAPPENING_TYPES.SALE) {
      happening.phase = HAPPENING_PHASES.LARGE;
      happening.phaseStartedMinutes += 5;
      happening.variant = 'rush';
      this.#addFeed('限定メニューの列が通路まで広がった。');
      return;
    }
    const preferHighState = happening.type !== HAPPENING_TYPES.COSPLAY || this.#random() < 0.8;
    this.#startFlow(happening, preferHighState);
    this.#addFeed(`${this.#getHappeningTitle(happening)}が別の場所へ動き始めた。`);
  }

  /**
   * 選択結果をハプニング状態へ適用する。
   * @private
   * @param {Object} happening - 対象ハプニング。
   * @param {string} result - 選択結果ID。
   * @returns {void}
   */
  #applyChoiceResult(happening, result) {
    if (result === 'orderly') {
      happening.phase = HAPPENING_PHASES.LARGE;
      happening.phaseStartedMinutes = this.#elapsedMinutes;
      happening.variant = 'orderly';
      this.#changeResidualState(happening.areaId, { excitement: 10, congestion: -20, trouble: -15 });
      return;
    }
    this.#startFlow(happening, result === 'flow-high');
  }

  /**
   * ハプニングを隣接エリアへの波及段階へ移す。
   * @private
   * @param {Object} happening - 対象ハプニング。
   * @param {boolean} preferHighState - 盛り上がりが高い方を選ぶ場合はtrue。
   * @returns {void}
   */
  #startFlow(happening, preferHighState) {
    const destination = this.#selectAdjacentArea(happening.areaId, preferHighState);
    happening.phase = HAPPENING_PHASES.FLOWING;
    happening.phaseStartedMinutes = this.#elapsedMinutes;
    happening.originPosition = copyPosition(happening.position);
    happening.destinationAreaId = destination.id;
    happening.destinationPosition = this.#getDestinationPosition(destination);
    happening.variant = preferHighState ? 'lively-route' : 'safe-route';
  }

  /** 移動先エリアにある未使用の通行可能候補地点を返す。 */
  #getDestinationPosition(destination) {
    const occupiedSiteIds = new Set(this.#happenings.map((entry) => entry.siteId).filter(Boolean));
    const site = this.#sites.find((entry) => (
      entry.areaId === destination.id && !occupiedSiteIds.has(entry.id)
    )) ?? this.#sites.find((entry) => entry.areaId === destination.id);
    return site ? copyPosition(site.position) : getAreaCenter(destination);
  }

  /**
   * 隣接候補から状態の高低に合うエリアを選ぶ。
   * @private
   * @param {string} areaId - 移動元エリアID。
   * @param {boolean} preferHighState - 盛り上がりが高い方を選ぶ場合はtrue。
   * @returns {Object} 移動先エリア。
   */
  #selectAdjacentArea(areaId, preferHighState) {
    const origin = this.#getArea(areaId);
    const originCenter = getAreaCenter(origin);
    const candidates = [...this.#areas]
      .filter((area) => area.id !== areaId)
      .sort((left, right) => getDistance(originCenter, getAreaCenter(left)) - getDistance(originCenter, getAreaCenter(right)))
      .slice(0, 2);
    const states = new Map(this.#createAreaStateSnapshots().map((state) => [state.id, state]));
    candidates.sort((left, right) => {
      const leftState = states.get(left.id);
      const rightState = states.get(right.id);
      const leftScore = preferHighState ? leftState.excitement : leftState.congestion;
      const rightScore = preferHighState ? rightState.excitement : rightState.congestion;
      return preferHighState ? rightScore - leftScore : leftScore - rightScore;
    });
    return candidates[0];
  }

  /**
   * 関連するライブとコスプレを合同パレードへ合流する。
   * @private
   * @returns {void}
   */
  #mergeRelatedHappenings() {
    const performance = this.#happenings.find((entry) => (
      entry.type === HAPPENING_TYPES.PERFORMANCE
      && entry.phase !== HAPPENING_PHASES.PRELUDE
      && entry.phase !== HAPPENING_PHASES.RESOLVED
    ));
    const cosplay = this.#happenings.find((entry) => (
      entry.type === HAPPENING_TYPES.COSPLAY
      && entry.phase !== HAPPENING_PHASES.PRELUDE
      && entry.phase !== HAPPENING_PHASES.RESOLVED
      && entry.areaId === performance?.areaId
    ));
    if (!performance || !cosplay) {
      return;
    }
    performance.phase = HAPPENING_PHASES.RESOLVED;
    cosplay.phase = HAPPENING_PHASES.RESOLVED;
    this.#spawnSpecialHappening(HAPPENING_TYPES.JOINT_PARADE, performance.areaId, performance.position);
    this.#addFeed(`${this.#getArea(performance.areaId).name}で即興ライブとコスプレ集団が合同パレードになった。`);
  }

  /**
   * 限定メニュー混雑と固定屋台トラブルを合流する。
   * @private
   * @returns {void}
   */
  #mergeFixedStallTrouble() {
    const stall = this.#fixedEvents.find((event) => event.id === 'stall-trouble' && event.status === 'active');
    const sale = this.#happenings.find((entry) => (
      entry.type === HAPPENING_TYPES.SALE
      && entry.phase === HAPPENING_PHASES.LARGE
      && entry.areaId === stall?.areaId
    ));
    if (!stall || !sale || sale.variant === 'stall-chaos') {
      return;
    }
    sale.type = HAPPENING_TYPES.STALL_CHAOS;
    sale.variant = 'stall-chaos';
    sale.phaseStartedMinutes = this.#elapsedMinutes;
    this.#addFeed(`${this.#getArea(sale.areaId).name}の混雑と屋台トラブルが合流した。`);
  }

  /**
   * 高混雑エリアへ人流が入る場合に迷子騒ぎを生成する。
   * @private
   * @returns {void}
   */
  #spawnLostChildCrowdWhenReady() {
    if (this.#happenings.some((entry) => entry.type === HAPPENING_TYPES.LOST_CHILD_CROWD)) {
      return;
    }
    const states = new Map(this.#createAreaStateSnapshots().map((state) => [state.id, state]));
    const flow = this.#happenings.find((entry) => (
      entry.phase === HAPPENING_PHASES.FLOWING
      && states.get(entry.destinationAreaId).congestion >= 70
    ));
    if (!flow || this.#happenings.length >= MAX_HAPPENING_COUNT) {
      return;
    }
    this.#spawnSpecialHappening(
      HAPPENING_TYPES.LOST_CHILD_CROWD,
      flow.destinationAreaId,
      flow.destinationPosition,
    );
    this.#addFeed(`${this.#getArea(flow.destinationAreaId).name}の混雑から迷子騒ぎが起きた。`);
  }

  /**
   * 特殊ハプニングを大規模段階で生成する。
   * @private
   * @param {string} type - 特殊ハプニング種類。
   * @param {string} areaId - 発生エリアID。
   * @param {Object} position - 発生座標。
   * @returns {Object} 生成したハプニング。
   */
  #spawnSpecialHappening(type, areaId, position) {
    const happening = {
      id: `happening-${this.#idSequence}`,
      type,
      phase: HAPPENING_PHASES.LARGE,
      areaId,
      position: copyPosition(position),
      originPosition: copyPosition(position),
      destinationAreaId: null,
      destinationPosition: null,
      phaseStartedMinutes: this.#elapsedMinutes,
      actionableSince: null,
      variant: type,
      source: HAPPENING_SOURCES.BACKGROUND,
      siteId: null,
      isDiscovered: false,
    };
    this.#idSequence += 1;
    this.#happenings.push(happening);
    return happening;
  }

  /**
   * ハプニングを解決し、現在の影響の一部を残留状態へ移す。
   * @private
   * @param {Object} happening - 解決対象。
   * @returns {void}
   */
  #resolveHappening(happening) {
    const effect = this.#getHappeningEffect(happening);
    this.#changeResidualState(happening.areaId, {
      excitement: effect.excitement * 0.25,
      congestion: effect.congestion * 0.25,
      trouble: effect.trouble * 0.25,
    });
    happening.phase = HAPPENING_PHASES.RESOLVED;
    this.#addFeed(`${this.#getArea(happening.areaId).name}の「${this.#getHappeningTitle(happening)}」が収まった。`);
  }

  /**
   * 解決済みハプニングを一覧から除く。
   * @private
   * @returns {void}
   */
  #removeResolvedHappenings() {
    this.#happenings = this.#happenings.filter((entry) => entry.phase !== HAPPENING_PHASES.RESOLVED);
  }

  /**
   * 介入段階へ入った順に最大2件を返す。
   * @private
   * @returns {Array<Object>} 介入可能なハプニング一覧。
   */
  #getActionableHappenings() {
    return this.#happenings
      .filter((entry) => entry.phase === HAPPENING_PHASES.ACTIONABLE)
      .sort((left, right) => left.actionableSince - right.actionableSince || left.id.localeCompare(right.id))
      .slice(0, MAX_ACTIONABLE_HAPPENING_COUNT);
  }

  /**
   * 全エリアの数値状態snapshotを生成する。
   * @private
   * @returns {Array<Object>} エリア状態一覧。
   */
  #createAreaStateSnapshots() {
    const snapshots = this.#areas.map((area) => ({ id: area.id, name: area.name, ...INITIAL_AREA_STATE }));
    const byId = new Map(snapshots.map((state) => [state.id, state]));
    for (const area of this.#areas) {
      const state = byId.get(area.id);
      const residual = this.#residualStates.get(area.id);
      this.#addStateValues(state, residual);
    }
    for (const happening of this.#happenings) {
      this.#addStateValues(byId.get(happening.areaId), this.#getHappeningEffect(happening));
      if (happening.phase === HAPPENING_PHASES.FLOWING) {
        this.#addStateValues(byId.get(happening.destinationAreaId), { excitement: 10, congestion: 15, trouble: 5 });
      }
    }
    for (const event of this.#fixedEvents) {
      if (event.status === 'active' && FIXED_EVENT_EFFECTS[event.id] && byId.has(event.areaId)) {
        this.#addStateValues(byId.get(event.areaId), FIXED_EVENT_EFFECTS[event.id]);
      }
    }
    for (const state of snapshots) {
      state.excitement = Math.round(clamp(state.excitement, 0, 100));
      state.congestion = Math.round(clamp(state.congestion, 0, 100));
      state.trouble = Math.round(clamp(state.trouble, 0, 100));
    }
    return snapshots;
  }

  /**
   * 状態値へ別の状態値を加算する。
   * @private
   * @param {Object} target - 加算先。
   * @param {Object} effect - 加算値。
   * @returns {void}
   */
  #addStateValues(target, effect) {
    target.excitement += effect.excitement;
    target.congestion += effect.congestion;
    target.trouble += effect.trouble;
  }

  /**
   * エリア残留状態を変更する。
   * @private
   * @param {string} areaId - エリアID。
   * @param {Object} change - 変更量。
   * @returns {void}
   */
  #changeResidualState(areaId, change) {
    const state = this.#residualStates.get(areaId);
    state.excitement = Math.max(0, state.excitement + change.excitement);
    state.congestion = Math.max(0, state.congestion + change.congestion);
    state.trouble = Math.max(0, state.trouble + change.trouble);
  }

  /**
   * 時間経過で全エリアの残留状態を減衰する。
   * @private
   * @param {number} deltaMinutes - 経過分数。
   * @returns {void}
   */
  #decayResidualStates(deltaMinutes) {
    for (const state of this.#residualStates.values()) {
      state.excitement = Math.max(0, state.excitement - AREA_STATE_DECAY_PER_MINUTE.excitement * deltaMinutes);
      state.congestion = Math.max(0, state.congestion - AREA_STATE_DECAY_PER_MINUTE.congestion * deltaMinutes);
      state.trouble = Math.max(0, state.trouble - AREA_STATE_DECAY_PER_MINUTE.trouble * deltaMinutes);
    }
  }

  /**
   * ハプニングの状態寄与を返す。
   * @private
   * @param {Object} happening - 対象ハプニング。
   * @returns {Object} エリア状態寄与。
   */
  #getHappeningEffect(happening) {
    if (SPECIAL_HAPPENING_EFFECTS[happening.type]) {
      return SPECIAL_HAPPENING_EFFECTS[happening.type];
    }
    const base = PHASE_AREA_EFFECTS[happening.phase] ?? createEmptyState();
    if (happening.variant === 'orderly') {
      return { excitement: base.excitement, congestion: base.congestion * 0.4, trouble: 0 };
    }
    if (happening.variant === 'rush' || happening.variant === 'crowd') {
      return { excitement: base.excitement, congestion: base.congestion + 20, trouble: base.trouble + 15 };
    }
    return base;
  }

  /**
   * ハプニング一覧用snapshotを生成する。
   * @private
   * @param {Object} happening - 対象ハプニング。
   * @returns {Object} ハプニングsnapshot。
   */
  #createHappeningSnapshot(happening) {
    return {
      id: happening.id,
      type: happening.type,
      phase: happening.phase,
      title: this.#getHappeningTitle(happening),
      areaId: happening.areaId,
      areaName: this.#getArea(happening.areaId).name,
      position: copyPosition(happening.position),
      destinationAreaId: happening.destinationAreaId,
      source: happening.source,
      isDiscovered: happening.isDiscovered,
    };
  }

  /**
   * 現地選択用snapshotを生成する。
   * @private
   * @param {Object} happening - 対象ハプニング。
   * @returns {Object} 選択肢を含むsnapshot。
   */
  #createNearbySnapshot(happening) {
    const definition = HAPPENING_DEFINITIONS[happening.type];
    return {
      id: happening.id,
      title: this.#getHappeningTitle(happening),
      description: `${this.#getArea(happening.areaId).name}で人が集まり始めている。`,
      choices: definition.choices.map((choice) => ({
        id: choice.id,
        label: choice.label,
        detail: `${choice.timeCostMinutes}分${choice.magicPowerCost > 0 ? ` / MP ${choice.magicPowerCost}` : ''}`,
        enabled: true,
      })),
    };
  }

  /**
   * 全ハプニングの群衆点を生成する。
   * @private
   * @returns {Array<Object>} 群衆点一覧。
   */
  #createCrowdPointSnapshots() {
    const points = [];
    for (const happening of this.#happenings) {
      const count = CROWD_COUNTS[happening.phase] ?? 0;
      const flowProgress = this.#getFlowProgress(happening);
      const center = happening.phase === HAPPENING_PHASES.FLOWING
        ? {
            x: happening.originPosition.x + (happening.destinationPosition.x - happening.originPosition.x) * flowProgress,
            y: happening.originPosition.y + (happening.destinationPosition.y - happening.originPosition.y) * flowProgress,
          }
        : happening.position;
      for (let index = 0; index < count; index += 1) {
        const angle = index * 2.399963;
        const radius = 0.45 + index % 4 * 0.35;
        points.push({
          id: `${happening.id}:crowd:${index}`,
          happeningId: happening.id,
          position: {
            x: center.x + Math.cos(angle) * radius,
            y: center.y + Math.sin(angle) * radius,
          },
          intensity: count,
        });
      }
    }
    return points;
  }

  /**
   * 波及中ハプニングの線snapshotを生成する。
   * @private
   * @returns {Array<Object>} 波及線一覧。
   */
  #createFlowSnapshots() {
    return this.#happenings
      .filter((happening) => happening.phase === HAPPENING_PHASES.FLOWING)
      .map((happening) => ({
        id: `${happening.id}:flow`,
        happeningId: happening.id,
        from: copyPosition(happening.originPosition),
        to: copyPosition(happening.destinationPosition),
        progress: this.#getFlowProgress(happening),
      }));
  }

  /**
   * 波及段階の進行率を返す。
   * @private
   * @param {Object} happening - 対象ハプニング。
   * @returns {number} 0から1の進行率。
   */
  #getFlowProgress(happening) {
    if (happening.phase !== HAPPENING_PHASES.FLOWING) {
      return 0;
    }
    return clamp((this.#elapsedMinutes - happening.phaseStartedMinutes) / 6, 0, 1);
  }

  /**
   * ハプニングの現在表示名を返す。
   * @private
   * @param {Object} happening - 対象ハプニング。
   * @returns {string} 表示名。
   */
  #getHappeningTitle(happening) {
    const specialTitles = {
      [HAPPENING_TYPES.JOINT_PARADE]: '即興ライブと合同パレード',
      [HAPPENING_TYPES.STALL_CHAOS]: '屋台前の大騒動',
      [HAPPENING_TYPES.LOST_CHILD_CROWD]: '混雑から起きた迷子騒ぎ',
    };
    if (specialTitles[happening.type]) {
      return specialTitles[happening.type];
    }
    const definition = HAPPENING_DEFINITIONS[happening.type];
    return happening.phase === HAPPENING_PHASES.PRELUDE
      ? definition.title
      : definition.actionableTitle;
  }

  /**
   * IDに一致するエリアを返す。
   * @private
   * @param {string} areaId - エリアID。
   * @returns {Object} エリア定義。
   */
  #getArea(areaId) {
    return this.#areas.find((area) => area.id === areaId);
  }

  /**
   * 状態変化フィードへメッセージを追加する。
   * @private
   * @param {string} message - 追加メッセージ。
   * @returns {void}
   */
  #addFeed(message) {
    this.#eventFeed.push(message);
    if (this.#eventFeed.length > 8) {
      this.#eventFeed.shift();
    }
  }
}

export {
  AREA_STATE_DECAY_PER_MINUTE,
  FestivalHappeningDirector,
  HAPPENING_INTERACTION_RADIUS,
  HAPPENING_PHASES,
  HAPPENING_SOURCES,
  HAPPENING_TYPES,
  INITIAL_AREA_STATE,
  MAX_ACTIONABLE_HAPPENING_COUNT,
  MAX_BACKGROUND_HAPPENING_COUNT,
  MAX_HAPPENING_COUNT,
  MIN_HAPPENING_COUNT,
  PROXIMITY_SPAWN_DISTANCE,
  PROXIMITY_SPAWN_INTERVAL_MINUTES,
  PROXIMITY_SPAWN_MAX_DISTANCE,
  PROXIMITY_SPAWN_MIN_DISTANCE,
};
