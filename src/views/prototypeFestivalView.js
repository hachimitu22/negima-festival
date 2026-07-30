import {
  PROTOTYPE_INPUT_TYPES,
  PROTOTYPE_PAUSE_TABS,
} from '../gameDomain/prototypeFestivalScene/prototypeFestivalScene.js';

/** クリック操作を識別するdata属性名。 */
const ACTION_ATTRIBUTE = 'data-prototype-action';

/** カモ君の吹き出しを表示する実時間ミリ秒。 */
const KAMO_NOTICE_DURATION_MS = 6000;

/** 画面内で保持するカモ君通知の最大件数。 */
const KAMO_NOTICE_QUEUE_LIMIT = 3;

/** WASDキーと移動方向の対応。 */
const MOVEMENT_KEY_DIRECTIONS = Object.freeze({
  KeyW: Object.freeze({ x: 0, y: -1 }),
  KeyA: Object.freeze({ x: -1, y: 0 }),
  KeyS: Object.freeze({ x: 0, y: 1 }),
  KeyD: Object.freeze({ x: 1, y: 0 }),
});

/**
 * HTMLへ埋め込む文字列をエスケープする。
 * @param {*} value - HTMLへ埋め込む値。
 * @returns {string} エスケープ済み文字列。
 */
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * プロトタイプ専用の暫定DOM renderer。
 */
class PrototypeFestivalView {
  #rootElement;
  #enqueueInput;
  #snapshot;
  #handleClick;
  #handleKeyDown;
  #handleKeyUp;
  #handleBlur;
  #pressedMovementKeys;
  #renderKeys;
  #kamoNoticeQueue;
  #activeKamoNotice;
  #latestKamoNotice;
  #seenKamoNoticeIds;
  #kamoNoticeShownAt;
  #isKamoNoticeCollapsed;

  /**
   * rendererを生成する。
   * @param {HTMLElement} rootElement - 描画先要素。
   */
  constructor(rootElement) {
    this.#rootElement = rootElement;
    this.#enqueueInput = null;
    this.#snapshot = null;
    this.#handleClick = this.#onClick.bind(this);
    this.#handleKeyDown = this.#onKeyDown.bind(this);
    this.#handleKeyUp = this.#onKeyUp.bind(this);
    this.#handleBlur = this.#onBlur.bind(this);
    this.#pressedMovementKeys = new Set();
    this.#renderKeys = Object.create(null);
    this.#kamoNoticeQueue = [];
    this.#activeKamoNotice = null;
    this.#latestKamoNotice = null;
    this.#seenKamoNoticeIds = new Set();
    this.#kamoNoticeShownAt = 0;
    this.#isKamoNoticeCollapsed = false;
  }

  /**
   * GameEngineから入力登録関数を受け取る。
   * @param {Object} context - renderer設定。
   * @param {Function} context.enqueueInput - 入力をGameEngineへ登録する関数。
   * @returns {void}
   */
  configure({ enqueueInput }) {
    this.#enqueueInput = enqueueInput;
  }

  /**
   * 初回snapshotを描画して入力監視を開始する。
   * @param {Object} snapshot - 初回ゲーム状態。
   * @returns {void}
   */
  init(snapshot) {
    this.#snapshot = snapshot;
    this.#renderKeys = Object.create(null);
    this.#kamoNoticeQueue = [];
    this.#activeKamoNotice = null;
    this.#latestKamoNotice = null;
    this.#seenKamoNoticeIds = new Set();
    this.#kamoNoticeShownAt = 0;
    this.#isKamoNoticeCollapsed = false;
    this.#mountDom();
    this.#rootElement.addEventListener('click', this.#handleClick);
    window.addEventListener('keydown', this.#handleKeyDown);
    window.addEventListener('keyup', this.#handleKeyUp);
    window.addEventListener('blur', this.#handleBlur);
    this.#renderSnapshot();
  }

  /**
   * 最新snapshotで表示を更新する。
   * @param {Object} snapshot - 最新ゲーム状態。
   * @returns {void}
   */
  render(snapshot) {
    this.#snapshot = snapshot;
    this.#renderSnapshot();
  }

  /**
   * 入力監視とDOMを破棄する。
   * @returns {void}
   */
  destroy() {
    this.#rootElement.removeEventListener('click', this.#handleClick);
    window.removeEventListener('keydown', this.#handleKeyDown);
    window.removeEventListener('keyup', this.#handleKeyUp);
    window.removeEventListener('blur', this.#handleBlur);
    this.#rootElement.replaceChildren();
    this.#snapshot = null;
    this.#enqueueInput = null;
    this.#pressedMovementKeys.clear();
    this.#renderKeys = Object.create(null);
    this.#kamoNoticeQueue = [];
    this.#activeKamoNotice = null;
    this.#latestKamoNotice = null;
    this.#seenKamoNoticeIds.clear();
  }

  /**
   * 変更された表示領域だけを最新snapshotへ同期する。
   * @private
   * @returns {void}
   */
  #renderSnapshot() {
    const snapshot = this.#snapshot;
    this.#getElement('time').textContent = snapshot.gameTime.label;
    this.#getElement('loop').textContent = String(snapshot.loop.count);
    this.#getElement('mp-label').textContent = `MP ${snapshot.player.magicPower.current}/${snapshot.player.magicPower.max}`;
    const meter = this.#getElement('mp-meter');
    meter.max = snapshot.player.magicPower.max;
    meter.value = snapshot.player.magicPower.current;
    this.#getElement('mahopay').textContent = `${snapshot.player.mahoPayPoints} pt`;
    this.#getElement('area-name').textContent = snapshot.player.areaName;
    const companion = this.#getElement('companion');
    companion.textContent = snapshot.companion ? `${snapshot.companion.name}が同行中` : '';
    companion.hidden = !snapshot.companion;
    this.#getElement('event-count').textContent = String(
      snapshot.currentEvents.length + snapshot.nearbyTasks.length
        + snapshot.nearbyActivities.length + snapshot.nearbyDiscoveries.length,
    );
    this.#getElement('kamo-advice').textContent = snapshot.kamoAdvice;
    const playerMarker = this.#getElement('player-marker');
    playerMarker.style.left = `${snapshot.player.position.x / snapshot.map.width * 100}%`;
    playerMarker.style.top = `${snapshot.player.position.y / snapshot.map.height * 100}%`;
    const viewport = snapshot.map.local.viewport;
    const localWorld = this.#getElement('local-world');
    localWorld.style.width = `${snapshot.map.width / viewport.width * 100}%`;
    localWorld.style.height = `${snapshot.map.height / viewport.height * 100}%`;
    localWorld.style.transform = `translate(${-viewport.x / snapshot.map.width * 100}%, ${-viewport.y / snapshot.map.height * 100}%)`;
    const overviewPlayer = this.#getElement('overview-player');
    overviewPlayer.style.left = `${snapshot.map.overview.playerPosition.x / snapshot.map.overview.width * 100}%`;
    overviewPlayer.style.top = `${snapshot.map.overview.playerPosition.y / snapshot.map.overview.height * 100}%`;

    this.#updateHtmlRegion(
      'quick-events',
      JSON.stringify([snapshot.eventFeed, snapshot.quickEvents]),
      this.#createEventFeedHtml(snapshot.eventFeed, snapshot.quickEvents),
    );
    this.#updateHtmlRegion(
      'map-areas',
      JSON.stringify([snapshot.map.areas, snapshot.map.overview.obstacles]),
      this.#createAreaHtml(snapshot.map.areas, snapshot.map.overview.obstacles, snapshot.map),
    );
    this.#updateHtmlRegion(
      'overview-terrain',
      JSON.stringify([snapshot.map.overview.areas, snapshot.map.overview.obstacles, snapshot.map.overview.landmarks, snapshot.map.overview.targetAreaId]),
      this.#createOverviewHtml(snapshot.map.overview),
    );
    this.#updateHtmlRegion(
      'local-area-state',
      JSON.stringify(snapshot.areaStates),
      this.#createAreaStateHtml(snapshot.areaStates[0]),
    );
    this.#updateHtmlRegion(
      'map-events',
      JSON.stringify(snapshot.map.local.events),
      this.#createMapEventsHtml(snapshot.map.local.events, snapshot.map),
    );
    this.#updateHtmlRegion(
      'map-tasks',
      JSON.stringify(snapshot.map.local.tasks),
      this.#createMapTasksHtml(snapshot.map.local.tasks, snapshot.map),
    );
    this.#updateHtmlRegion(
      'map-activities',
      JSON.stringify(snapshot.map.local.activities),
      this.#createMapActivitiesHtml(snapshot.map.local.activities, snapshot.map),
    );
    this.#updateHtmlRegion(
      'map-landmarks',
      JSON.stringify(snapshot.map.local.landmarks),
      this.#createMapLandmarksHtml(snapshot.map.local.landmarks, snapshot.map),
    );
    this.#updateHtmlRegion(
      'map-happenings',
      JSON.stringify(snapshot.happenings),
      this.#createMapHappeningsHtml(snapshot.happenings, snapshot.map),
    );
    this.#updateHtmlRegion(
      'map-discoveries',
      JSON.stringify(snapshot.map.local.discoveries),
      this.#createMapDiscoveriesHtml(snapshot.map.local.discoveries, snapshot.map),
    );
    this.#updateHtmlRegion(
      'task-hud',
      JSON.stringify([snapshot.plannedAction, snapshot.environmentalCue]),
      this.#createPlannedActionHudHtml(snapshot.plannedAction, snapshot.environmentalCue),
    );
    this.#updateCrowdPoints(snapshot.crowdPoints, snapshot.map);
    this.#updateFlows(snapshot.flows, snapshot.map);
    this.#updateHtmlRegion(
      'current-events',
      JSON.stringify([snapshot.currentEvents, snapshot.nearbyActivities]),
      this.#createCurrentEventsHtml(snapshot.currentEvents)
        + this.#createNearbyActivitiesHtml(snapshot.nearbyActivities),
    );
    this.#updateHtmlRegion(
      'nearby-tasks',
      JSON.stringify(snapshot.nearbyTasks),
      this.#createNearbyTasksHtml(snapshot.nearbyTasks),
    );
    this.#updateHtmlRegion(
      'nearby-discoveries',
      JSON.stringify(snapshot.nearbyDiscoveries),
      this.#createNearbyDiscoveriesHtml(snapshot.nearbyDiscoveries),
    );
    this.#updateHtmlRegion(
      'log',
      JSON.stringify(snapshot.log),
      this.#createLogHtml(snapshot.log),
    );
    this.#updateTaskNavigation(snapshot.taskNavigation, snapshot.map.local.viewport);
    this.#updateKamoNotice(snapshot.kamoNotice, snapshot.taskNavigation, snapshot.map.local.viewport);
    this.#updateOverlay(snapshot);
  }

  /**
   * 変更されない画面骨格を初回だけDOMへ生成する。
   * @private
   * @returns {void}
   */
  #mountDom() {
    this.#rootElement.innerHTML = `
      <div class="prototype-shell">
        <header class="prototype-status">
          <div class="prototype-brand"><span>MAHORA</span><strong>FESTIVAL</strong></div>
          <dl><div><dt>DATE</dt><dd>1日目</dd></div><div><dt>TIME</dt><dd data-view-role="time"></dd></div><div><dt>LOOP</dt><dd data-view-role="loop"></dd></div><div><dt>MAHOPAY</dt><dd data-view-role="mahopay"></dd></div></dl>
          <div class="prototype-mp"><span data-view-role="mp-label"></span><meter data-view-role="mp-meter" min="0"></meter></div>
          <button class="prototype-icon-button" type="button" ${ACTION_ATTRIBUTE}="pause" aria-label="ポーズ">Ⅱ</button>
        </header>
        <section class="prototype-alerts" aria-label="イベント速報">
          <span class="prototype-alerts__label">EVENT</span>
          <div class="prototype-alerts__track" data-view-role="quick-events"></div>
        </section>
        <div class="prototype-layout">
          <main class="prototype-field" aria-label="麻帆良祭会場">
            <div class="prototype-field__skyline" aria-hidden="true"></div>
            <div class="prototype-field__title">
              <span>麻帆良祭 1日目</span>
              <strong data-view-role="area-name"></strong>
              <small data-view-role="companion" hidden></small>
            </div>
            <div class="prototype-overview" aria-label="全体ミニマップ">
              <div data-view-role="overview-terrain"></div>
              <span class="prototype-overview__player" data-view-role="overview-player" aria-label="ネギの現在位置"></span>
            </div>
            <section class="prototype-task-hud" data-view-role="task-hud" aria-label="進行中の仕事"></section>
            <div class="prototype-map" aria-label="ネギ周辺のマップ">
              <div class="prototype-map__world" data-view-role="local-world">
                <div data-view-role="map-areas"></div>
                <div data-view-role="map-flows"></div>
                <div data-view-role="map-crowd"></div>
                <div data-view-role="map-events"></div>
                <div data-view-role="map-tasks"></div>
                <div data-view-role="map-activities"></div>
                <div data-view-role="map-landmarks"></div>
                <div data-view-role="map-happenings"></div>
                <div data-view-role="map-discoveries"></div>
                <span class="prototype-player-marker" data-view-role="player-marker" aria-label="ネギ"></span>
              </div>
              <div class="prototype-task-direction" data-view-role="task-direction" hidden><span>↑</span><small data-view-role="task-direction-label"></small></div>
              <button class="prototype-kamo-notice-icon" type="button" ${ACTION_ATTRIBUTE}="kamo-reopen" data-view-role="kamo-notice-icon" aria-label="最新のカモ君助言を表示" hidden>カモ</button>
              <div class="prototype-kamo-notice" data-view-role="kamo-notice" role="status" aria-live="polite" hidden><strong>カモ君</strong><p data-view-role="kamo-notice-message"></p></div>
              <div class="prototype-local-state" data-view-role="local-area-state"></div>
            </div>
            <aside class="prototype-kamo">
              <span class="prototype-kamo__portrait">カモ</span>
              <p data-view-role="kamo-advice"></p>
            </aside>
          </main>
          <aside class="prototype-events" aria-label="現在地のイベント">
            <header><span>現在地の出来事</span><strong data-view-role="event-count"></strong></header>
            <div class="prototype-events__list" data-view-role="current-events"></div>
            <div class="prototype-events__list prototype-events__list--discoveries" data-view-role="nearby-discoveries"></div>
            <div class="prototype-events__list prototype-events__list--tasks" data-view-role="nearby-tasks"></div>
            <section class="prototype-log">
              <h2>行動ログ</h2>
              <div data-view-role="log"></div>
            </section>
          </aside>
        </div>
        <div data-view-role="overlay"></div>
      </div>
    `;
  }

  /**
   * data-view-roleに一致する要素を取得する。
   * @private
   * @param {string} role - 取得する表示領域名。
   * @returns {HTMLElement} 一致するDOM要素。
   */
  #getElement(role) {
    return this.#rootElement.querySelector(`[data-view-role="${role}"]`);
  }

  /**
   * シグネチャが変化した表示領域だけHTMLを更新する。
   * @private
   * @param {string} role - 更新する表示領域名。
   * @param {string} renderKey - 表示内容を識別するシグネチャ。
   * @param {string} html - 新しい領域内HTML。
   * @returns {void}
   */
  #updateHtmlRegion(role, renderKey, html) {
    if (this.#renderKeys[role] === renderKey) {
      return;
    }
    this.#getElement(role).innerHTML = html;
    this.#renderKeys[role] = renderKey;
  }

  /**
   * ポーズまたは正午のoverlayを状態変化時だけ更新する。
   * @private
   * @param {Object} snapshot - ゲーム状態。
   * @returns {void}
   */
  #updateOverlay(snapshot) {
    let mode = 'none';
    let html = '';
    if (snapshot.isPaused) {
      mode = `pause:${snapshot.pauseTabId}:${snapshot.rewindCost}:${JSON.stringify(snapshot.schedule)}:${JSON.stringify(snapshot.tasks)}:${JSON.stringify(snapshot.taskBatch)}:${JSON.stringify(snapshot.availableActivities)}`;
      html = this.#createPauseHtml(snapshot);
    } else if (snapshot.gameTime.isEnded) {
      mode = `noon:${snapshot.rewindCost}:${snapshot.canRewind}`;
      html = this.#createNoonHtml(snapshot);
    } else if (snapshot.goalSelection) {
      mode = `goal:${JSON.stringify(snapshot.goalSelection)}`;
      html = this.#createGoalSelectionHtml(snapshot.goalSelection);
    } else if (snapshot.interruption) {
      mode = `interruption:${JSON.stringify(snapshot.interruption)}`;
      html = this.#createInterruptionHtml(snapshot.interruption);
    } else if (snapshot.activitySession) {
      mode = `activity:${JSON.stringify(snapshot.activitySession)}`;
      html = this.#createActivitySessionHtml(snapshot.activitySession);
    } else if (snapshot.eventInteraction) {
      mode = `interaction:${JSON.stringify(snapshot.eventInteraction)}`;
      html = this.#createEventInteractionHtml(snapshot.eventInteraction);
    }
    this.#updateHtmlRegion('overlay', mode, html);
  }

  /**
   * 4場所の矩形表示を生成する。
   * @private
   * @param {Array<Object>} areas - 場所snapshot一覧。
   * @param {Array<Object>} obstacles - 障害物一覧。
   * @param {Object} map - マップsnapshot。
   * @returns {string} 場所HTML。
   */
  #createAreaHtml(areas, obstacles, map) {
    let html = '';
    for (const area of areas) {
      const classes = ['prototype-area'];
      if (area.isCurrent) {
        classes.push('is-current');
      }
      const left = area.area.x / map.width * 100;
      const top = area.area.y / map.height * 100;
      const width = area.area.width / map.width * 100;
      const height = area.area.height / map.height * 100;
      html += `
        <div class="${classes.join(' ')}" style="left:${left}%;top:${top}%;width:${width}%;height:${height}%">
          <span class="prototype-area__name">${escapeHtml(area.name)}</span>
        </div>
      `;
    }
    for (const obstacle of obstacles) {
      html += `<i class="prototype-obstacle is-${escapeHtml(obstacle.type)}" style="left:${obstacle.x / map.width * 100}%;top:${obstacle.y / map.height * 100}%;width:${obstacle.width / map.width * 100}%;height:${obstacle.height / map.height * 100}%"></i>`;
    }
    return html;
  }

  /** 現在エリアの状態メーターを生成する。 */
  #createAreaStateHtml(state) {
    if (!state) {
      return '';
    }
    return `
      <dl class="prototype-area__meters">
        <div><dt>盛</dt><dd><i style="width:${state.excitement}%"></i></dd><b>${state.excitement}</b></div>
        <div><dt>混</dt><dd><i style="width:${state.congestion}%"></i></dd><b>${state.congestion}</b></div>
        <div><dt>乱</dt><dd><i style="width:${state.trouble}%"></i></dd><b>${state.trouble}</b></div>
      </dl>
    `;
  }

  /** 全体ミニマップの地形と既知施設を生成する。 */
  #createOverviewHtml(overview) {
    let html = '';
    for (const area of overview.areas) {
      const targetClass = area.id === overview.targetAreaId ? ' is-target' : '';
      html += `<i class="prototype-overview__area${targetClass}" style="left:${area.area.x / overview.width * 100}%;top:${area.area.y / overview.height * 100}%;width:${area.area.width / overview.width * 100}%;height:${area.area.height / overview.height * 100}%"></i>`;
    }
    for (const obstacle of overview.obstacles) {
      html += `<i class="prototype-overview__obstacle" style="left:${obstacle.x / overview.width * 100}%;top:${obstacle.y / overview.height * 100}%;width:${obstacle.width / overview.width * 100}%;height:${obstacle.height / overview.height * 100}%"></i>`;
    }
    for (const landmark of overview.landmarks) {
      const targetClass = landmark.isGoalLandmark ? ' is-goal' : '';
      html += `<span class="prototype-overview__label${targetClass}" style="left:${landmark.position.x / overview.width * 100}%;top:${landmark.position.y / overview.height * 100}%">${escapeHtml(landmark.name)}</span>`;
    }
    return html;
  }

  /**
   * 発生中イベントの点と短い名称を生成する。
   * @private
   * @param {Array<Object>} events - イベントマーカー一覧。
   * @param {Object} map - マップsnapshot。
   * @returns {string} イベントマーカーHTML。
   */
  #createMapEventsHtml(events, map) {
    let html = '';
    for (const event of events) {
      const left = event.position.x / map.width * 100;
      const top = event.position.y / map.height * 100;
      html += `
        <span class="prototype-map-event ${event.isNearby ? 'is-nearby' : ''}" style="left:${left}%;top:${top}%">
          <i></i><small>${escapeHtml(event.title)}</small>
        </span>
      `;
    }
    return html;
  }

  /** 既知の定時イベントと出店のマップマーカーを生成する。 */
  #createMapActivitiesHtml(activities, map) {
    let html = '';
    for (const activity of activities) {
      const classes = [
        'prototype-map-event',
        activity.isNearby ? 'is-nearby' : '',
        activity.isPlanned ? 'is-planned' : '',
      ].filter(Boolean).join(' ');
      html += `
        <span class="${classes}" style="left:${activity.position.x / map.width * 100}%;top:${activity.position.y / map.height * 100}%">
          <i></i><small>${escapeHtml(activity.title)}</small>
        </span>
      `;
    }
    return html;
  }

  /** 視界内にある物理的なランドマークを生成する。 */
  #createMapLandmarksHtml(landmarks, map) {
    let html = '';
    for (const landmark of landmarks) {
      const classes = [
        'prototype-map-landmark',
        `is-${landmark.visualType}`,
        landmark.isGoalLandmark ? 'is-goal' : '',
      ].filter(Boolean).join(' ');
      html += `
        <span class="${classes}" style="left:${landmark.position.x / map.width * 100}%;top:${landmark.position.y / map.height * 100}%">
          <i></i><small>${escapeHtml(landmark.shortLabel)}</small>
        </span>
      `;
    }
    return html;
  }

  /**
   * 未完了の教師仕事地点を生成する。
   * @private
   * @param {Array<Object>} tasks - 教師仕事地点一覧。
   * @param {Object} map - マップsnapshot。
   * @returns {string} 教師仕事マーカーHTML。
   */
  #createMapTasksHtml(tasks, map) {
    let html = '';
    for (const task of tasks) {
      const left = task.position.x / map.width * 100;
      const top = task.position.y / map.height * 100;
      html += `
        <span class="prototype-map-task ${task.isNearby ? 'is-nearby' : ''} ${task.isTracked ? 'is-tracked' : ''}" style="left:${left}%;top:${top}%">
          <i></i><small>${escapeHtml(task.title)}</small>
        </span>
      `;
    }
    return html;
  }

  /**
   * マップ上の連鎖型ハプニングを生成する。
   * @private
   * @param {Array<Object>} happenings - ハプニング一覧。
   * @param {Object} map - マップsnapshot。
   * @returns {string} ハプニングマーカーHTML。
   */
  #createMapHappeningsHtml(happenings, map) {
    let html = '';
    for (const happening of happenings) {
      const left = happening.position.x / map.width * 100;
      const top = happening.position.y / map.height * 100;
      html += `
        <span class="prototype-map-happening is-${escapeHtml(happening.phase)}" style="left:${left}%;top:${top}%">
          <i></i><small>${escapeHtml(happening.title)}</small>
        </span>
      `;
    }
    return html;
  }

  /** ローカル画面内の未発見地点を生成する。 */
  #createMapDiscoveriesHtml(discoveries, map) {
    const cueGlyphs = { crowd: '人', voice: '声', sign: '掲', glimmer: '光' };
    let html = '';
    for (const discovery of discoveries) {
      const left = discovery.position.x / map.width * 100;
      const top = discovery.position.y / map.height * 100;
      html += `
        <span class="prototype-map-discovery ${discovery.isNearby ? 'is-nearby' : ''}" style="left:${left}%;top:${top}%">
          <i>${escapeHtml(cueGlyphs[discovery.cueKind] ?? '気')}</i><small>${escapeHtml(discovery.title)}</small>
        </span>
      `;
    }
    return html;
  }

  /** 通常画面へ現在の予定行動と周囲の気配を表示する。 */
  #createPlannedActionHudHtml(plannedAction, environmentalCue) {
    const cueHtml = environmentalCue
      ? `<p>${escapeHtml(environmentalCue.message)}</p>`
      : '';
    if (!plannedAction) {
      return `<header>予定行動</header><p>ポーズ画面で次の行動を選ぶ</p>${cueHtml}`;
    }
    return `
      <header>予定行動</header>
      <button type="button" class="is-tracked" ${ACTION_ATTRIBUTE}="pause">
        <span>${escapeHtml(plannedAction.motivationLabel ?? '追跡中')}</span>
        <strong>${escapeHtml(plannedAction.title)}</strong>
        <small>${escapeHtml(plannedAction.areaName)}・${Math.ceil(plannedAction.distance)}マス</small>
      </button>
      ${cueHtml}
    `;
  }

  /** 現在地で調べられる発見地点の操作UIを生成する。 */
  #createNearbyDiscoveriesHtml(discoveries) {
    let html = '';
    for (const discovery of discoveries) {
      html += `
        <article class="is-discovery">
          <span>発見</span><strong>${escapeHtml(discovery.title)}</strong>
          <p>${escapeHtml(discovery.description)}</p>
          <button type="button" ${ACTION_ATTRIBUTE}="discovery" data-discovery-id="${escapeHtml(discovery.id)}">${escapeHtml(discovery.actionLabel)}</button>
        </article>
      `;
    }
    return html;
  }

  /** 追跡対象が画面外にある場合の方向矢印を更新する。 */
  #updateTaskNavigation(navigation, viewport) {
    const element = this.#getElement('task-direction');
    if (!navigation || navigation.isTargetVisible) {
      element.hidden = true;
      return;
    }
    const left = 50 + navigation.direction.x * 42;
    const top = 50 + navigation.direction.y * 40;
    const angle = Math.atan2(navigation.direction.y, navigation.direction.x) * 180 / Math.PI + 90;
    element.style.left = `${left}%`;
    element.style.top = `${top}%`;
    element.querySelector('span').style.transform = `rotate(${angle}deg)`;
    this.#getElement('task-direction-label').textContent = `${navigation.areaName}・${navigation.targetLabel}`;
    element.hidden = false;
  }

  /** 新しいカモ君通知を優先度付き表示キューへ登録する。 */
  #queueKamoNotice(notice) {
    if (!notice || this.#seenKamoNoticeIds.has(notice.id)) {
      return;
    }
    this.#seenKamoNoticeIds.add(notice.id);
    this.#latestKamoNotice = notice;
    if (!this.#activeKamoNotice) {
      this.#showKamoNotice(notice);
      return;
    }
    if (notice.priority > this.#activeKamoNotice.priority) {
      this.#kamoNoticeQueue.push(this.#activeKamoNotice);
      this.#showKamoNotice(notice);
    } else {
      this.#kamoNoticeQueue.push(notice);
    }
    this.#kamoNoticeQueue.sort((left, right) => right.priority - left.priority);
    this.#kamoNoticeQueue = this.#kamoNoticeQueue.slice(0, KAMO_NOTICE_QUEUE_LIMIT - 1);
  }

  /** 指定通知を現在の吹き出しとして表示開始する。 */
  #showKamoNotice(notice) {
    this.#activeKamoNotice = notice;
    this.#kamoNoticeShownAt = Date.now();
    this.#isKamoNoticeCollapsed = false;
  }

  /** カモ君通知の経過時間、位置、吹き出しとアイコンを更新する。 */
  #updateKamoNotice(notice, navigation, viewport) {
    this.#queueKamoNotice(notice);
    if (
      this.#activeKamoNotice
      && Date.now() - this.#kamoNoticeShownAt >= KAMO_NOTICE_DURATION_MS
    ) {
      if (this.#kamoNoticeQueue.length > 0) {
        this.#showKamoNotice(this.#kamoNoticeQueue.shift());
      } else {
        this.#activeKamoNotice = null;
        this.#isKamoNoticeCollapsed = true;
      }
    }

    const player = this.#snapshot.player.position;
    const left = (player.x - viewport.x) / viewport.width * 100;
    const playerTop = (player.y - viewport.y) / viewport.height * 100;
    const placeBelow = navigation?.direction.y < 0 || playerTop < 24;
    const top = playerTop + (placeBelow ? 10 : -10);
    const bubble = this.#getElement('kamo-notice');
    const icon = this.#getElement('kamo-notice-icon');
    bubble.style.left = `${Math.max(20, Math.min(80, left))}%`;
    bubble.style.top = `${Math.max(16, Math.min(84, top))}%`;
    bubble.classList.toggle('is-below', placeBelow);
    icon.style.left = `${Math.max(8, Math.min(92, left + 5))}%`;
    icon.style.top = `${Math.max(8, Math.min(92, playerTop - 5))}%`;

    if (this.#activeKamoNotice) {
      this.#getElement('kamo-notice-message').textContent = this.#activeKamoNotice.message;
      bubble.hidden = false;
      icon.hidden = true;
      return;
    }
    bubble.hidden = true;
    icon.hidden = !(this.#isKamoNoticeCollapsed && this.#latestKamoNotice);
  }

  /**
   * 安定IDを使って群衆点DOMの追加、座標更新、削除を行う。
   * @private
   * @param {Array<Object>} crowdPoints - 群衆点一覧。
   * @param {Object} map - マップsnapshot。
   * @returns {void}
   */
  #updateCrowdPoints(crowdPoints, map) {
    const container = this.#getElement('map-crowd');
    const remainingIds = new Set(crowdPoints.map((point) => point.id));
    for (const element of container.querySelectorAll('[data-crowd-id]')) {
      if (!remainingIds.has(element.dataset.crowdId)) {
        element.remove();
      }
    }
    for (const point of crowdPoints) {
      let element = container.querySelector(`[data-crowd-id="${CSS.escape(point.id)}"]`);
      if (!element) {
        element = document.createElement('i');
        element.className = 'prototype-crowd-point';
        element.dataset.crowdId = point.id;
        container.append(element);
      }
      element.style.left = `${point.position.x / map.width * 100}%`;
      element.style.top = `${point.position.y / map.height * 100}%`;
    }
  }

  /**
   * 安定IDを使って波及線DOMの追加、進行更新、削除を行う。
   * @private
   * @param {Array<Object>} flows - 波及線一覧。
   * @param {Object} map - マップsnapshot。
   * @returns {void}
   */
  #updateFlows(flows, map) {
    const container = this.#getElement('map-flows');
    const remainingIds = new Set(flows.map((flow) => flow.id));
    for (const element of container.querySelectorAll('[data-flow-id]')) {
      if (!remainingIds.has(element.dataset.flowId)) {
        element.remove();
      }
    }
    for (const flow of flows) {
      let element = container.querySelector(`[data-flow-id="${CSS.escape(flow.id)}"]`);
      if (!element) {
        element = document.createElement('span');
        element.className = 'prototype-flow-line';
        element.dataset.flowId = flow.id;
        element.append(document.createElement('i'));
        container.append(element);
      }
      const deltaX = (flow.to.x - flow.from.x) / map.width * 100;
      const deltaY = (flow.to.y - flow.from.y) / map.height * 100;
      element.style.left = `${flow.from.x / map.width * 100}%`;
      element.style.top = `${flow.from.y / map.height * 100}%`;
      element.style.width = `${Math.hypot(deltaX, deltaY)}%`;
      element.style.transform = `rotate(${Math.atan2(deltaY, deltaX)}rad)`;
      element.firstElementChild.style.width = `${flow.progress * 100}%`;
    }
  }

  /**
   * イベント速報を生成する。
   * @private
   * @param {Array<Object>} events - 進行中イベント一覧。
   * @returns {string} 速報HTML。
   */
  #createEventFeedHtml(eventFeed, events) {
    if (eventFeed.length === 0 && events.length === 0) {
      return '<span class="prototype-empty-inline">会場はまだ落ち着いている</span>';
    }
    let html = '';
    for (const message of eventFeed.slice(-4)) {
      html += `<span class="prototype-alert prototype-alert--feed">${escapeHtml(message)}</span>`;
    }
    for (const event of events) {
      html += `<span class="prototype-alert">${escapeHtml(event.areaName)}・${escapeHtml(event.title)} <small>〜${escapeHtml(event.endTimeLabel)}</small></span>`;
    }
    return html;
  }

  /**
   * 現在地イベント一覧を生成する。
   * @private
   * @param {Array<Object>} events - 現在地イベント一覧。
   * @returns {string} イベントHTML。
   */
  #createCurrentEventsHtml(events) {
    if (events.length === 0) {
      return '<p class="prototype-empty">今すぐ参加できる出来事はない。</p>';
    }
    let html = '';
    for (const event of events) {
      html += `
        <article class="prototype-event">
          <h2>${escapeHtml(event.title)}</h2>
          <p>${escapeHtml(event.description)}</p>
          <button type="button" ${ACTION_ATTRIBUTE}="event" data-event-id="${escapeHtml(event.id)}" ${event.canInteract ? '' : 'disabled'}>${escapeHtml(event.actionLabel)}</button>
        </article>
      `;
    }
    return html;
  }

  /** 現在地で開始できる予定行動を生成する。 */
  #createNearbyActivitiesHtml(activities) {
    let html = '';
    for (const activity of activities) {
      html += `
        <article class="prototype-event prototype-event--task">
          <h2>${escapeHtml(activity.title)}</h2>
          <p>${activity.availability === 'partial' ? '開催途中から参加できる。' : '予定していた行動を開始できる。'}</p>
          <button type="button" ${ACTION_ATTRIBUTE}="activity-start" data-activity-id="${escapeHtml(activity.id)}">${escapeHtml(activity.actionLabel)}</button>
        </article>
      `;
    }
    return html;
  }

  /**
   * 現在地で操作できる教師仕事を生成する。
   * @private
   * @param {Array<Object>} tasks - 操作可能な教師仕事一覧。
   * @returns {string} 教師仕事HTML。
   */
  #createNearbyTasksHtml(tasks) {
    if (tasks.length === 0) {
      return '';
    }
    let html = '<h2 class="prototype-nearby-task-title">教師仕事</h2>';
    for (const task of tasks) {
      html += `
        <article class="prototype-event prototype-event--task">
          <h2>${escapeHtml(task.title)}</h2>
          <p>${escapeHtml(task.description)}</p>
          <button type="button" ${ACTION_ATTRIBUTE}="task" data-task-id="${escapeHtml(task.taskId)}" data-step-id="${escapeHtml(task.stepId)}">${escapeHtml(task.actionLabel)}</button>
        </article>
      `;
    }
    return html;
  }

  /**
   * 行動ログを生成する。
   * @private
   * @param {Array<string>} log - 行動ログ。
   * @returns {string} ログHTML。
   */
  #createLogHtml(log) {
    let html = '<ul>';
    for (const entry of log) {
      html += `<li>${escapeHtml(entry)}</li>`;
    }
    return `${html}</ul>`;
  }

  /**
   * 正午到達時の巻き戻し案内を生成する。
   * @private
   * @param {Object} snapshot - ゲーム状態。
   * @returns {string} 正午案内HTML。
   */
  #createNoonHtml(snapshot) {
    return `
      <div class="prototype-noon" role="dialog" aria-modal="true">
        <div><span>TIME UP</span><h2>正午になった</h2><p>判明した予定を手掛かりに、次のループを試す。</p>
        <button type="button" ${ACTION_ATTRIBUTE}="rewind" ${snapshot.canRewind ? '' : 'disabled'}>カシオペアでAM10:00へ戻る（MP ${snapshot.rewindCost}）</button></div>
      </div>
    `;
  }

  /**
   * 対応中イベントの状況、進捗、行動選択を生成する。
   * @private
   * @param {Object} interaction - イベント対応snapshot。
   * @returns {string} イベント対応画面HTML。
   */
  #createEventInteractionHtml(interaction) {
    let actionsHtml = '';
    for (const action of interaction.actions) {
      actionsHtml += `
        <button type="button" ${ACTION_ATTRIBUTE}="event-action" data-action-id="${escapeHtml(action.id)}" ${action.enabled ? '' : 'disabled'}>
          <strong>${escapeHtml(action.label)}</strong>
          <span>${escapeHtml(action.detail)}</span>
        </button>
      `;
    }
    const progressPercent = Math.min(
      100,
      interaction.progress / interaction.requiredProgress * 100,
    );
    return `
      <div class="prototype-interaction" role="dialog" aria-modal="true" aria-label="${escapeHtml(interaction.title)}">
        <section class="prototype-interaction__panel">
          <header><span>HAPPENING</span><h2>${escapeHtml(interaction.title)}</h2></header>
          <p class="prototype-interaction__situation">${escapeHtml(interaction.situation)}</p>
          <div class="prototype-interaction__progress">
            <div><span>対応進捗</span><strong>${interaction.progress} / ${interaction.requiredProgress}</strong></div>
            <div class="prototype-interaction__gauge"><i style="width:${progressPercent}%"></i></div>
          </div>
          <div class="prototype-interaction__actions">${actionsHtml}</div>
        </section>
      </div>
    `;
  }

  /** 巻き込みへの判断画面を生成する。 */
  #createInterruptionHtml(interruption) {
    let choicesHtml = '';
    for (const choice of interruption.choices) {
      choicesHtml += `
        <button type="button" ${ACTION_ATTRIBUTE}="interruption-choice" data-choice-id="${escapeHtml(choice.id)}" ${choice.enabled === false ? 'disabled' : ''}>
          <strong>${escapeHtml(choice.label)}</strong><span>${escapeHtml(choice.detail)}</span>
        </button>
      `;
    }
    return `
      <div class="prototype-interaction" role="dialog" aria-modal="true" aria-label="巻き込み">
        <section class="prototype-interaction__panel">
          <header><span>INTERRUPTION</span><h2>${escapeHtml(interruption.title)}</h2></header>
          <p class="prototype-interaction__situation">${escapeHtml(interruption.description)}</p>
          <div class="prototype-interaction__actions">${choicesHtml}</div>
        </section>
      </div>
    `;
  }

  /** 実行中または中断中の予定行動画面を生成する。 */
  #createActivitySessionHtml(session) {
    const progressPercent = session.requiredMinutes > 0
      ? Math.min(100, session.progressMinutes / session.requiredMinutes * 100)
      : 100;
    const primaryAction = session.isAwaitingResume
      ? `<button type="button" ${ACTION_ATTRIBUTE}="activity-resume"><strong>行動へ戻る</strong><span>残り${session.remainingMinutes}分</span></button>`
      : `<button type="button" ${ACTION_ATTRIBUTE}="activity-advance"><strong>次の場面へ</strong><span>残り${session.remainingMinutes}分</span></button>`;
    return `
      <div class="prototype-interaction" role="dialog" aria-modal="true" aria-label="${escapeHtml(session.title)}">
        <section class="prototype-interaction__panel">
          <header><span>${session.isAwaitingResume ? 'SUSPENDED' : 'ACTIVITY'}</span><h2>${escapeHtml(session.title)}</h2></header>
          <p class="prototype-interaction__situation">${session.isAwaitingResume ? '予定外の出来事への対応を終えた。元の行動へ戻るか選ぶ。' : '周囲の様子を見ながら行動を進める。'}</p>
          <div class="prototype-interaction__progress">
            <div><span>進行</span><strong>${session.progressMinutes} / ${session.requiredMinutes}分</strong></div>
            <div class="prototype-interaction__gauge"><i style="width:${progressPercent}%"></i></div>
          </div>
          <div class="prototype-interaction__actions">
            ${primaryAction}
            <button type="button" ${ACTION_ATTRIBUTE}="activity-leave"><strong>ここを離れる</strong><span>予定を中止する</span></button>
          </div>
        </section>
      </div>
    `;
  }

  /**
   * ポーズ画面を生成する。
   * @private
   * @param {Object} snapshot - ゲーム状態。
   * @returns {string} ポーズ画面HTML。
   */
  #createPauseHtml(snapshot) {
    const isSchedule = snapshot.pauseTabId === PROTOTYPE_PAUSE_TABS.SCHEDULE;
    const plannerHtml = this.#createActivityPlannerHtml(
      snapshot.availableActivities,
      isSchedule ? 'schedule' : 'task',
    );
    return `
      <div class="prototype-pause" role="dialog" aria-modal="true" aria-label="ポーズ">
        <section class="prototype-pause__panel">
          <header><div><span>PAUSE</span><h2>行動を確認する</h2></div><button class="prototype-icon-button" type="button" ${ACTION_ATTRIBUTE}="pause" aria-label="ゲームへ戻る">×</button></header>
          <nav aria-label="ポーズメニュー">
            <button type="button" ${ACTION_ATTRIBUTE}="tab" data-tab-id="schedule" class="${isSchedule ? 'is-active' : ''}">スケジュール</button>
            <button type="button" ${ACTION_ATTRIBUTE}="tab" data-tab-id="tasks" class="${isSchedule ? '' : 'is-active'}">タスク</button>
          </nav>
          <div class="prototype-pause__content">${isSchedule ? this.#createScheduleHtml(snapshot.schedule) : this.#createTasksHtml(snapshot.tasks, snapshot.taskBatch)}${plannerHtml}</div>
          <footer><button type="button" ${ACTION_ATTRIBUTE}="rewind" ${snapshot.canRewind ? '' : 'disabled'}>AM10:00へ戻る <small>MP ${snapshot.rewindCost}</small></button><button type="button" ${ACTION_ATTRIBUTE}="pause">ゲームへ戻る</button></footer>
        </section>
      </div>
    `;
  }

  /** 時間を止めて提示する主目的候補を生成する。 */
  #createGoalSelectionHtml(goalSelection) {
    let candidatesHtml = '';
    for (const candidate of goalSelection.candidates) {
      const timeLabel = candidate.startTimeLabel
        ? `${candidate.startTimeLabel}〜${candidate.endTimeLabel}`
        : `目安 ${candidate.endTimeLabel}`;
      candidatesHtml += `
        <article>
          <span>${escapeHtml(candidate.motivationLabel)}</span>
          <strong>${escapeHtml(candidate.title)}</strong>
          <p>${escapeHtml(candidate.areaName)}・${escapeHtml(timeLabel)}</p>
          <button type="button" ${ACTION_ATTRIBUTE}="plan-select" data-action-id="${escapeHtml(candidate.id)}">この目的へ向かう</button>
        </article>
      `;
    }
    return `
      <div class="prototype-goal-selection" role="dialog" aria-modal="true" aria-label="主目的の選択">
        <section>
          <header><span>NEXT GOAL</span><h2>${escapeHtml(goalSelection.title)}</h2></header>
          <div class="prototype-goal-selection__list">${candidatesHtml}</div>
        </section>
      </div>
    `;
  }

  /** ポーズ画面へ予定行動の選択肢を生成する。 */
  #createActivityPlannerHtml(activities, group) {
    const filtered = activities.filter((activity) => (
      activity.isPrimaryGoal
      && (group === 'task' ? activity.kind === 'task' : activity.kind !== 'task')
    ));
    let html = '<div class="prototype-task-list">';
    for (const activity of filtered) {
      const timeLabel = activity.startTimeLabel
        ? `${activity.startTimeLabel}〜${activity.endTimeLabel}`
        : `目安 ${activity.endTimeLabel}`;
      html += `
        <article>
          <span>${activity.isPlanned ? '予定中' : activity.availability === 'closed' ? '終了' : '選択可'}</span>
          <strong>${escapeHtml(activity.title)}</strong>
          <p>${escapeHtml(activity.areaName)}・${escapeHtml(timeLabel)}</p>
          <button type="button" ${ACTION_ATTRIBUTE}="plan-select" data-action-id="${escapeHtml(activity.id)}" ${activity.availability === 'closed' ? 'disabled' : ''}>予定にする</button>
        </article>
      `;
    }
    return `${html}</div>`;
  }

  /**
   * 判明済みスケジュールを生成する。
   * @private
   * @param {Array<Object>} schedule - スケジュール一覧。
   * @returns {string} スケジュールHTML。
   */
  #createScheduleHtml(schedule) {
    let html = '<div class="prototype-schedule"><div class="prototype-schedule__axis"><span>10:00</span><span>11:00</span><span>12:00</span></div>';
    for (const entry of schedule) {
      const start = entry.startMinutes / 120 * 100;
      const width = Math.max(8, 15 / 120 * 100);
      html += `<article><div><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.areaName)}</span></div><div class="prototype-schedule__line"><i style="left:${start}%;width:${width}%"></i></div><time>${escapeHtml(entry.startTimeLabel)}</time></article>`;
    }
    return `${html}</div>`;
  }

  /**
   * タスク一覧を生成する。
   * @private
   * @param {Array<Object>} tasks - タスク一覧。
   * @param {Object} taskBatch - 仕事一式の支給状態。
   * @returns {string} タスクHTML。
   */
  #createTasksHtml(tasks, taskBatch) {
    if (tasks.length === 0) {
      return taskBatch.status === 'waiting'
        ? `<p class="prototype-empty">仕事をすべて完了した。次の支給は ${escapeHtml(taskBatch.nextBatchTimeLabel)}。</p>`
        : '<p class="prototype-empty">本日の教師仕事は終了した。</p>';
    }
    let html = `<div class="prototype-task-summary">第${taskBatch.batchNumber}便・目安 ${escapeHtml(taskBatch.deadlineTimeLabel)}</div><div class="prototype-task-list">`;
    for (const task of tasks) {
      const statusLabel = task.status === 'completed' ? '完了' : task.isLate ? '期限後' : '進行中';
      html += `<article><span>${statusLabel}</span><strong>${escapeHtml(task.title)} ${escapeHtml(task.progressLabel)}</strong><p>${escapeHtml(task.areaName)}・報酬 ${task.rewardPoints} MahoPay</p></article>`;
    }
    return `${html}</div>`;
  }

  /**
   * クリックされたdata属性をゲーム入力へ変換する。
   * @private
   * @param {MouseEvent} event - クリックイベント。
   * @returns {void}
   */
  #onClick(event) {
    const target = event.target.closest(`[${ACTION_ATTRIBUTE}]`);
    if (!target || target.disabled) {
      return;
    }
    const action = target.getAttribute(ACTION_ATTRIBUTE);
    if (action === 'pause') {
      this.#enqueueInput({ type: PROTOTYPE_INPUT_TYPES.PAUSE_TOGGLE });
    } else if (action === 'event') {
      this.#enqueueInput({ type: PROTOTYPE_INPUT_TYPES.EVENT_INTERACT, eventId: target.dataset.eventId });
    } else if (action === 'event-action') {
      this.#enqueueInput({ type: PROTOTYPE_INPUT_TYPES.EVENT_ACTION, actionId: target.dataset.actionId });
    } else if (action === 'task') {
      this.#enqueueInput({
        type: PROTOTYPE_INPUT_TYPES.TASK_INTERACT,
        taskId: target.dataset.taskId,
        stepId: target.dataset.stepId,
      });
    } else if (action === 'track-task') {
      this.#enqueueInput({
        type: PROTOTYPE_INPUT_TYPES.TASK_TRACK,
        taskId: target.dataset.taskId,
      });
    } else if (action === 'plan-select') {
      this.#enqueueInput({
        type: PROTOTYPE_INPUT_TYPES.PLAN_SELECT,
        actionId: target.dataset.actionId,
      });
    } else if (action === 'activity-start') {
      this.#enqueueInput({
        type: PROTOTYPE_INPUT_TYPES.ACTIVITY_START,
        activityId: target.dataset.activityId,
      });
    } else if (action === 'activity-advance') {
      this.#enqueueInput({ type: PROTOTYPE_INPUT_TYPES.ACTIVITY_ADVANCE });
    } else if (action === 'activity-resume') {
      this.#enqueueInput({ type: PROTOTYPE_INPUT_TYPES.ACTIVITY_RESUME });
    } else if (action === 'activity-leave') {
      this.#enqueueInput({ type: PROTOTYPE_INPUT_TYPES.ACTIVITY_LEAVE });
    } else if (action === 'interruption-choice') {
      this.#enqueueInput({
        type: PROTOTYPE_INPUT_TYPES.INTERRUPTION_CHOOSE,
        choiceId: target.dataset.choiceId,
      });
    } else if (action === 'discovery') {
      this.#enqueueInput({
        type: PROTOTYPE_INPUT_TYPES.DISCOVERY_INTERACT,
        discoveryId: target.dataset.discoveryId,
      });
    } else if (action === 'kamo-reopen' && this.#latestKamoNotice) {
      this.#showKamoNotice(this.#latestKamoNotice);
      this.#updateKamoNotice(null, this.#snapshot.taskNavigation, this.#snapshot.map.local.viewport);
    } else if (action === 'happening-choice') {
      this.#enqueueInput({
        type: PROTOTYPE_INPUT_TYPES.HAPPENING_CHOICE,
        happeningId: target.dataset.happeningId,
        choiceId: target.dataset.choiceId,
      });
    } else if (action === 'tab') {
      this.#enqueueInput({ type: PROTOTYPE_INPUT_TYPES.PAUSE_TAB, tabId: target.dataset.tabId });
    } else if (action === 'rewind') {
      this.#enqueueInput({ type: PROTOTYPE_INPUT_TYPES.REWIND });
    }
  }

  /**
   * キーボード操作をゲーム入力へ変換する。
   * @private
   * @param {KeyboardEvent} event - キーボードイベント。
   * @returns {void}
   */
  #onKeyDown(event) {
    if (MOVEMENT_KEY_DIRECTIONS[event.code]) {
      event.preventDefault();
      if (!this.#pressedMovementKeys.has(event.code)) {
        this.#pressedMovementKeys.add(event.code);
        this.#enqueueMovementInput();
      }
      return;
    }
    if (event.repeat) {
      return;
    }
    if (event.code === 'Escape') {
      this.#enqueueInput({ type: PROTOTYPE_INPUT_TYPES.PAUSE_TOGGLE });
      return;
    }
    if (event.code === 'KeyR') {
      this.#enqueueInput({ type: PROTOTYPE_INPUT_TYPES.REWIND });
      return;
    }
  }

  /**
   * WASDのkeyupを移動停止へ反映する。
   * @private
   * @param {KeyboardEvent} event - キーボードイベント。
   * @returns {void}
   */
  #onKeyUp(event) {
    if (!MOVEMENT_KEY_DIRECTIONS[event.code]) {
      return;
    }
    event.preventDefault();
    this.#pressedMovementKeys.delete(event.code);
    this.#enqueueMovementInput();
  }

  /**
   * ウィンドウが操作対象から外れた場合に移動入力を解除する。
   * @private
   * @returns {void}
   */
  #onBlur() {
    if (this.#pressedMovementKeys.size === 0) {
      return;
    }
    this.#pressedMovementKeys.clear();
    this.#enqueueMovementInput();
  }

  /**
   * 押下中WASDから左右・上下の入力値を生成してシーンへ送る。
   * @private
   * @returns {void}
   */
  #enqueueMovementInput() {
    let x = 0;
    let y = 0;
    for (const code of this.#pressedMovementKeys) {
      const direction = MOVEMENT_KEY_DIRECTIONS[code];
      x += direction.x;
      y += direction.y;
    }
    this.#enqueueInput({
      type: PROTOTYPE_INPUT_TYPES.MOVEMENT_SET,
      x,
      y,
    });
  }
}

export {
  PrototypeFestivalView,
};
