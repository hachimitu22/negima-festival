import {
  CANONICAL_INPUT_TYPES,
} from '../gameDomain/canonicalFestivalPrototypeScene/canonicalFestivalPrototypeScene.js';

/** Attribute used to identify canonical prototype action buttons. */
const ACTION_ATTRIBUTE = 'data-canonical-action';

/** Attribute used to identify view role elements. */
const VIEW_ROLE_ATTRIBUTE = 'data-view-role';

/** Maximum number of log entries kept by the temporary DOM renderer. */
const VIEW_LOG_LIMIT = 300;

/** Escape text before embedding it into HTML. */
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/** Temporary DOM renderer for the canonical festival prototype. */
class CanonicalFestivalPrototypeView {
  #rootElement;
  #enqueueInput;
  #requestRenderStep;
  #snapshot;
  #handleClick;
  #handleChange;
  #handleKeyDown;
  #renderKeys;
  #displayLog;
  #lastDialogueKey;
  #lastFestivalNotificationKey;

  /** Create a renderer bound to the root element. */
  constructor(rootElement) {
    this.#rootElement = rootElement;
    this.#enqueueInput = null;
    this.#requestRenderStep = null;
    this.#snapshot = null;
    this.#handleClick = this.#onClick.bind(this);
    this.#handleChange = this.#onChange.bind(this);
    this.#handleKeyDown = this.#onKeyDown.bind(this);
    this.#renderKeys = Object.create(null);
    this.#displayLog = [];
    this.#lastDialogueKey = null;
    this.#lastFestivalNotificationKey = null;
  }

  /** Receive the GameEngine input enqueue function. */
  configure({ enqueueInput, requestRenderStep = null }) {
    this.#enqueueInput = enqueueInput;
    this.#requestRenderStep = requestRenderStep;
  }

  /** Mount DOM and render the initial snapshot. */
  init(snapshot) {
    this.#snapshot = snapshot;
    this.#renderKeys = Object.create(null);
    this.#displayLog = [];
    this.#lastDialogueKey = null;
    this.#lastFestivalNotificationKey = null;
    this.#mountDom();
    this.#rootElement.addEventListener('click', this.#handleClick);
    this.#rootElement.addEventListener('change', this.#handleChange);
    window.addEventListener('keydown', this.#handleKeyDown);
    this.#renderSnapshot();
  }

  /** Render the latest snapshot. */
  render(snapshot) {
    this.#snapshot = snapshot;
    this.#renderSnapshot();
  }

  /** Remove DOM and input listeners. */
  destroy() {
    this.#rootElement.removeEventListener('click', this.#handleClick);
    this.#rootElement.removeEventListener('change', this.#handleChange);
    window.removeEventListener('keydown', this.#handleKeyDown);
    this.#renderKeys = Object.create(null);
    this.#rootElement.replaceChildren();
    this.#enqueueInput = null;
    this.#requestRenderStep = null;
    this.#snapshot = null;
    this.#displayLog = [];
    this.#lastDialogueKey = null;
  }

  /** Create the three-block temporary screen skeleton. */
  #mountDom() {
    this.#rootElement.innerHTML = `
      <div class="canonical-shell">
        <section class="canonical-status" ${VIEW_ROLE_ATTRIBUTE}="status">
          <h1>CANONICAL PROTOTYPE</h1>
          <dl>
            <div><dt>DAY</dt><dd data-view-role="day"></dd></div>
            <div><dt>LOOP</dt><dd data-view-role="loop"></dd></div>
            <div><dt>TIME</dt><dd data-view-role="time"></dd></div>
            <div><dt>OUTFIT</dt><dd data-view-role="outfit"></dd></div>
            <div><dt>PHONE</dt><dd data-view-role="phone"></dd></div>
            <div><dt>MP</dt><dd><span data-view-role="mp"></span><meter data-view-role="mp-meter" min="0"></meter></dd></div>
            <div><dt>PARTY</dt><dd data-view-role="party"></dd></div>
          </dl>
          <div class="canonical-save-controls" data-view-role="save-controls">
            <button type="button" ${ACTION_ATTRIBUTE}="save" data-view-role="save-button">セーブ</button>
            <button type="button" ${ACTION_ATTRIBUTE}="load" data-view-role="load-button">ロード</button>
            <small data-view-role="save-status"></small>
          </div>
        </section>
        <aside class="canonical-schedule" ${VIEW_ROLE_ATTRIBUTE}="schedule"></aside>
        <aside class="canonical-classmate-status" ${VIEW_ROLE_ATTRIBUTE}="classmate-status"></aside>
        <main class="canonical-main" ${VIEW_ROLE_ATTRIBUTE}="main"></main>
        <aside class="canonical-log" ${VIEW_ROLE_ATTRIBUTE}="log"></aside>
      </div>
    `;
  }

  /** Render all blocks from the current snapshot. */
  #renderSnapshot() {
    const snapshot = this.#snapshot;
    this.#appendDialogueLog(snapshot);
    this.#appendFestivalNotificationLog(snapshot);
    this.#getElement('day').textContent = `${snapshot.gameTime.festivalDay}日目`;
    this.#getElement('loop').textContent = `${snapshot.gameTime.loopCount}ループ目`;
    this.#getElement('time').textContent = snapshot.gameTime.label;
    this.#getElement('outfit').textContent = snapshot.player.outfit?.label ?? '背広';
    this.#getElement('phone').textContent = snapshot.phoneTime ?? '-';
    this.#getElement('mp').textContent = `${snapshot.player.magicPower.current}/${snapshot.player.magicPower.max}`;
    this.#getElement('mp-meter').max = snapshot.player.magicPower.max;
    this.#getElement('mp-meter').value = snapshot.player.magicPower.current;
    this.#getElement('party').textContent = (snapshot.companions ?? [])
      .filter((companion) => companion.id !== 'kamo')
      .map((companion) => companion.name)
      .join('、') || 'なし';
    const saveData = snapshot.saveData ?? { canSave: false, canLoad: false, status: null };
    this.#getElement('save-button').disabled = !saveData.canSave;
    this.#getElement('load-button').disabled = !saveData.canLoad;
    this.#getElement('save-status').textContent = saveData.status?.text ?? '';
    this.#getElement('save-status').dataset.statusKind = saveData.status?.kind ?? '';
    this.#updateHtmlRegion('schedule', this.#createScheduleRenderKey(snapshot), this.#createScheduleHtml(snapshot));
    this.#updateHtmlRegion('classmate-status', this.#createClassmateStatusRenderKey(snapshot), this.#createClassmateStatusHtml(snapshot));
    this.#updateHtmlRegion('main', this.#createMainRenderKey(snapshot), this.#createMainHtml(snapshot));
    this.#updateHtmlRegion('log', JSON.stringify(this.#displayLog), this.#createLogHtml());
  }

  /** Get an element by its view role. */
  #getElement(role) {
    return this.#rootElement.querySelector(`[${VIEW_ROLE_ATTRIBUTE}="${role}"]`);
  }

  /** Replace an HTML region only when its render key changed. */
  #updateHtmlRegion(role, renderKey, html) {
    if (this.#renderKeys[role] === renderKey) {
      return;
    }
    this.#getElement(role).innerHTML = html;
    this.#renderKeys[role] = renderKey;
  }

  /** Create the render key for the schedule block. */
  #createScheduleRenderKey(snapshot) {
    const negi = snapshot.schedule?.negi;
    const festival = snapshot.schedule?.festival;
    const activeEvent = snapshot.activeEvent;
    return JSON.stringify({
      activeEvent: activeEvent
        ? `${activeEvent.id}:${activeEvent.status}:${activeEvent.startTimeLabel}:${activeEvent.endTimeLabel}:${activeEvent.companionIds.join(',')}`
        : null,
      negiRange: negi?.range ?? null,
      negiEntries: (negi?.entries ?? [])
        .map((entry) => `${entry.id}:${entry.branchOfId ?? ''}:${entry.attractionName}:${entry.isNameHidden}:${entry.areaId}:${entry.startMinute}:${entry.endMinute}:${entry.isAllDay}:${entry.isCompleted}:${entry.isAvailableInCurrentArea}`),
      festivalRange: festival?.range ?? null,
      festivalEntries: (festival?.entries ?? [])
        .map((entry) => `${entry.id}:${entry.areaId}:${entry.startMinute}:${entry.endMinute}:${entry.isAllDay}:${entry.excitement?.current}:${entry.isAvailableInCurrentArea}`),
    });
  }

  /** Create the schedule block HTML. */
  #createScheduleHtml(snapshot) {
    const negi = snapshot.schedule?.negi;
    const festival = snapshot.schedule?.festival;
    const negiEntries = negi?.entries ?? [];
    const festivalEntries = festival?.entries ?? [];
    if ((!negi?.range || negiEntries.length === 0) && (!festival?.range || festivalEntries.length === 0)) {
      return '<h2>スケジュール</h2><p>表示できる予定はありません。</p>';
    }
    let scheduleHtml = '<h2>スケジュール</h2>';
    scheduleHtml += this.#createScheduleSectionHtml('ネギのスケジュール', negi?.range, negiEntries, (entry) => ({
      title: `${entry.branchOfId ? '分岐: ' : ''}<b>${escapeHtml(entry.actorName)}</b> ${escapeHtml(entry.attractionName)}`,
      detail: `${escapeHtml(entry.areaName)} / ${entry.isAllDay ? '終日' : `${escapeHtml(entry.startTimeLabel)}-${escapeHtml(entry.endTimeLabel)}`}${entry.conditionText ? ` / 発生条件: ${escapeHtml(entry.conditionText)}` : ''}`,
    }));
    scheduleHtml += this.#createScheduleSectionHtml('麻帆良祭スケジュール', festival?.range, festivalEntries, (entry) => {
      const timeLabel = entry.isAllDay ? '終日' : `${escapeHtml(entry.startTimeLabel)}-${escapeHtml(entry.endTimeLabel)}`;
      return {
        title: escapeHtml(entry.title),
        detail: `${escapeHtml(entry.areaName)} / ${timeLabel} / 盛り上がり ${escapeHtml(entry.excitement?.current ?? 0)}/${escapeHtml(entry.excitement?.max ?? 100)}`,
      };
    });
    if (snapshot.activeEvent) {
      const activeEvent = snapshot.activeEvent;
      let activeEventHtml = '<section class="canonical-active-event">';
      activeEventHtml += '<h3>実行中イベント</h3>';
      activeEventHtml += `<p><b>${escapeHtml(activeEvent.title)}</b></p>`;
      activeEventHtml += `<p>${escapeHtml(activeEvent.status)} / ${escapeHtml(activeEvent.startTimeLabel)}-${escapeHtml(activeEvent.endTimeLabel)}</p>`;
      activeEventHtml += `<p>同行: ${escapeHtml(activeEvent.companionIds.join('、'))}</p>`;
      activeEventHtml += '</section>';
      scheduleHtml = activeEventHtml + scheduleHtml;
    }
    return scheduleHtml;
  }

  /** Create the render key for the classmate status block. */
  #createClassmateStatusRenderKey(snapshot) {
    return JSON.stringify((snapshot.classmateStatus ?? [])
      .map((entry) => `${entry.id}:${entry.areaId}:${entry.areaName}:${entry.status}:${entry.statusLabel}:${entry.affection?.current}:${entry.affection?.max}`));
  }

  /** Create the current classmate status block HTML. */
  #createClassmateStatusHtml(snapshot) {
    const entries = snapshot.classmateStatus ?? [];
    let html = '<h2>クラスメイトステータス</h2><ul class="canonical-classmate-status-list">';
    for (const entry of entries) {
      html += '<li>';
      html += `<strong>${escapeHtml(entry.name)}</strong>`;
      html += `<span>${escapeHtml(entry.areaName)}</span>`;
      html += `<span>${escapeHtml(entry.statusLabel)}</span>`;
      html += `<span>好感度 ${escapeHtml(entry.affection?.current ?? 0)}/${escapeHtml(entry.affection?.max ?? 100)}</span>`;
      html += '</li>';
    }
    html += '</ul>';
    return html;
  }

  /** Create one schedule section HTML. */
  #createScheduleSectionHtml(title, range, entries, createText) {
    if (!range || entries.length === 0) {
      return '';
    }
    const duration = range.endMinute - range.startMinute;
    let html = `<section><h3>${escapeHtml(title)}</h3>`;
    html += `<div class="canonical-schedule-axis"><span>${escapeHtml(range.startTimeLabel)}</span><span>${escapeHtml(range.endTimeLabel)}</span></div>`;
    html += '<ol>';
    for (const entry of entries) {
      const start = Math.max(0, (entry.startMinute - range.startMinute) / duration * 100);
      const width = Math.max(1, (entry.endMinute - entry.startMinute) / duration * 100);
      const className = [
        entry.isCompleted ? 'is-completed' : '',
        entry.isAvailableInCurrentArea ? 'is-current-area' : '',
      ].filter(Boolean).join(' ');
      const text = createText(entry);
      html += `<li class="${className}">`;
      html += `<p>${text.title}</p>`;
      html += `<p>${text.detail}</p>`;
      html += `<div class="canonical-schedule-line"><i style="left:${start}%;width:${width}%"></i></div>`;
      html += '</li>';
    }
    html += '</ol></section>';
    return html;
  }

  /** Create the render key for the main block. */
  #createMainRenderKey(snapshot) {
    return JSON.stringify({
      phaseId: snapshot.phase.id,
      phaseLabel: snapshot.phase.label,
      inputKind: snapshot.phase.inputKind,
      objectiveTitle: snapshot.objective.title,
      mapName: snapshot.map.name,
      dialogue: snapshot.dialogue
        ? {
          speaker: snapshot.dialogue.speaker,
          text: snapshot.dialogue.text,
          index: snapshot.dialogue.index,
          total: snapshot.dialogue.total,
        }
        : null,
      festivalNotification: snapshot.festivalNotification
        .map((notification) => `${notification.id}:${notification.text}`),
      choices: snapshot.choices.map((choice) => `${choice.id}:${choice.label}:${choice.isRecommended}`),
      routeComplete: snapshot.routeComplete,
      gameOver: `${snapshot.gameOver?.isActive}:${snapshot.gameOver?.reason ?? ''}`,
      hauntedHouse: snapshot.events['haunted-house']
        ? `${snapshot.events['haunted-house'].data.difficulty.id}:${snapshot.events['haunted-house'].data.panic.current}:${snapshot.events['haunted-house'].data.excitement.current}:${snapshot.events['haunted-house'].data.result}`
        : null,
      chaoSearch: {
        isSetsunaWithParty: snapshot.events['chao-search'].data.isSetsunaWithParty,
        canStartNodokaDate: snapshot.events['chao-search'].data.canStartNodokaDate,
        hints: snapshot.events['chao-search'].data.hints.map((hint) => `${hint.actorId}:${hint.text}`),
        airshipOverview: snapshot.events['chao-search'].data.airshipOverview
          ? snapshot.events['chao-search'].data.airshipOverview.areas.map((area) => `${area.id}:${area.summary}`)
          : null,
      },
      freeExplore: {
        currentLocationId: snapshot.freeExplore.currentLocation.id,
        destinationIds: snapshot.freeExplore.destinations.map((entry) => `${entry.id}:${entry.isCurrent}`),
        interruption: snapshot.freeExplore.interruption
          ? `${snapshot.freeExplore.interruption.id}:${snapshot.freeExplore.interruption.source}`
          : null,
        actionIds: snapshot.freeExplore.locationActions.map((entry) => entry.id),
        actionResult: snapshot.freeExplore.actionResult
          ? `${snapshot.freeExplore.actionResult.title}:${snapshot.freeExplore.actionResult.text}`
          : null,
      },
      prepareDate: {
        hasPrepared: snapshot.prepareDate.hasPrepared,
        hasStrolled: snapshot.prepareDate.hasStrolled,
        hasCoordinated: snapshot.prepareDate.hasCoordinated,
        hasGift: snapshot.prepareDate.hasGift,
        hasTopic: snapshot.prepareDate.hasTopic,
        outfit: snapshot.prepareDate.outfit,
        preparationScore: snapshot.prepareDate.preparationScore,
      },
      thirdLoop: {
        currentAttractionAreaId: snapshot.events['classmate-attraction-tour'].data.currentAttractionAreaId,
        completedAttractionActorIds: snapshot.events['classmate-attraction-tour'].data.completedAttractionActorIds,
        isAttractionTourComplete: snapshot.events['classmate-attraction-tour'].data.isAttractionTourComplete,
        tournamentResult: snapshot.events['mahora-budokai'].data.tournamentResult,
        tournamentBattle: snapshot.events['mahora-budokai'].data.tournamentBattle
          ? `${snapshot.events['mahora-budokai'].data.tournamentBattle.playerHp}:${snapshot.events['mahora-budokai'].data.tournamentBattle.opponentHp}:${snapshot.events['mahora-budokai'].data.tournamentBattle.lastPlayerHand}:${snapshot.events['mahora-budokai'].data.tournamentBattle.lastOpponentHand}`
          : null,
      },
      mainEvent: {
        activeEventId: snapshot.mainEvent.activeEventId,
        events: snapshot.mainEvent.events.map((entry) => `${entry.id}:${entry.isActive}`),
      },
    });
  }

  /** Create the main block HTML. */
  #createMainHtml(snapshot) {
    return `
      <section class="canonical-actions">
        ${this.#createActionHtml(snapshot)}
      </section>
      <section class="canonical-message">
        ${this.#createMessageHtml(snapshot)}
      </section>
    `;
  }

  /** Create all current action buttons for the main block. */
  #createActionHtml(snapshot) {
    let html = '<h2>選択肢</h2>';
    html += this.#createBasicInfoHtml(snapshot);
    html += this.#createStateInfoHtml(snapshot);
    html += this.#createTutorialControlHtml(snapshot);
    html += this.#createFreeExploreHtml(snapshot);
    html += this.#createSearchChaoHtml(snapshot);
    html += this.#createPrepareDateHtml(snapshot);
    html += this.#createClassmateAttractionHtml(snapshot);
    html += this.#createChoiceHtml(snapshot);
    if (snapshot.routeComplete) {
      html += `<button type="button" ${ACTION_ATTRIBUTE}="restart">最初から</button>`;
    }
    if (snapshot.gameOver?.isActive) {
      html += `<button type="button" ${ACTION_ATTRIBUTE}="restart">タイトルへ戻る</button>`;
    }
    return html;
  }

  /** Create tutorial control buttons. */
  #createTutorialControlHtml(snapshot) {
    if (!snapshot.tutorial?.canSkip) {
      return '';
    }
    return `
      <section class="canonical-tutorial-controls">
        <button type="button" ${ACTION_ATTRIBUTE}="tutorial-skip">チュートリアルをスキップ</button>
      </section>
    `;
  }

  /** Create the current place and objective summary. */
  #createBasicInfoHtml(snapshot) {
    const names = [
      ...snapshot.companions
        .filter((companion) => companion.isActive && companion.displayOnMap)
        .map((companion) => companion.name),
      ...snapshot.actors.map((actor) => actor.name),
    ];
    let html = '<section class="canonical-summary">';
    html += `<p><b>現在地</b>: ${escapeHtml(snapshot.map.name)}</p>`;
    html += `<p><b>目的</b>: ${escapeHtml(snapshot.objective.title)}</p>`;
    html += `<p><b>段階</b>: ${escapeHtml(snapshot.phase.label)} / ${escapeHtml(this.#createInputHint(snapshot))}</p>`;
    if (names.length > 0) {
      html += `<p><b>登場人物</b>: ${names.map((name) => escapeHtml(name)).join(' / ')}</p>`;
    }
    html += '</section>';
    return html;
  }

  /** Create small state hints that affect the current choice. */
  #createStateInfoHtml(snapshot) {
    let html = '';
    if (snapshot.phase.id.includes('haunted') || snapshot.phase.id === 'select-haunted-difficulty') {
      html += '<section class="canonical-state">';
      html += `<p><b>難易度</b>: ${escapeHtml(snapshot.events['haunted-house'].data.difficulty.label)}</p>`;
      html += `<p><b>パニック</b>: ${snapshot.events['haunted-house'].data.panic.current}/${snapshot.events['haunted-house'].data.panic.max}</p>`;
      html += `<meter min="0" max="${snapshot.events['haunted-house'].data.panic.max}" value="${snapshot.events['haunted-house'].data.panic.current}"></meter>`;
      html += '</section>';
    }
    if (snapshot.events['haunted-house']?.data.excitement.current > 0) {
      html += '<section class="canonical-state">';
      html += `<p><b>ホラーハウスの盛り上がり</b>: ${snapshot.events['haunted-house'].data.excitement.current}/${snapshot.events['haunted-house'].data.excitement.max}</p>`;
      html += '</section>';
    }
    if (snapshot.events['mahora-budokai']?.data.tournamentBattle) {
      html += '<section class="canonical-state">';
      html += `<p><b>ネギHP</b>: ${escapeHtml(snapshot.events['mahora-budokai'].data.tournamentBattle.playerHp)}/100</p>`;
      html += `<p><b>相手HP</b>: ${escapeHtml(snapshot.events['mahora-budokai'].data.tournamentBattle.opponentHp)}/50</p>`;
      html += '</section>';
    }
    if (snapshot.events['chao-search'].data.airshipOverview) {
      html += `<section class="canonical-state"><h3>${escapeHtml(snapshot.events['chao-search'].data.airshipOverview.title)}</h3>`;
      for (const area of snapshot.events['chao-search'].data.airshipOverview.areas) {
        html += `<p><b>${escapeHtml(area.name)}</b>: ${escapeHtml(area.summary)}</p>`;
      }
      html += '</section>';
    }
    return html;
  }

  /** Create free-explore actions when that subsystem is active. */
  #createFreeExploreHtml(snapshot) {
    if (!['free-explore', 'interruption', 'location-actions', 'location-action-result'].includes(snapshot.phase.id)) {
      return '';
    }
    const freeExplore = snapshot.freeExplore;
    let html = '<section class="canonical-action-group">';
    html += `<h3>${escapeHtml(freeExplore.currentLocation.label)} / ${escapeHtml(freeExplore.currentLocation.areaName)}</h3>`;
    if (freeExplore.libraryDungeon?.isActive) {
      html += `<p>図書館島 地下${escapeHtml(freeExplore.libraryDungeon.currentFloor)}階</p>`;
      if (freeExplore.libraryDungeon.pendingBarrierCost !== null) {
        html += `<p>結界解除に${escapeHtml(freeExplore.libraryDungeon.pendingBarrierCost)}MP必要</p>`;
      }
    }
    if (snapshot.phase.id === 'interruption' && freeExplore.interruption) {
      html += `<p><b>${escapeHtml(freeExplore.interruption.title)}</b>: ${escapeHtml(freeExplore.interruption.description)}</p>`;
      for (const choice of freeExplore.interruption.choices) {
        html += `<button type="button" ${ACTION_ATTRIBUTE}="interruption" data-choice-id="${escapeHtml(choice.id)}">${escapeHtml(choice.label)}</button>`;
      }
    } else if (['free-explore', 'location-actions'].includes(snapshot.phase.id)) {
      html += this.#createMainEventControlsHtml(snapshot);
      html += this.#createLocationActionGroupsHtml(freeExplore.locationActions);
    } else if (snapshot.phase.id === 'location-action-result' && freeExplore.actionResult) {
      html += `<p><b>${escapeHtml(freeExplore.actionResult.title)}</b>: ${escapeHtml(freeExplore.actionResult.text)}</p>`;
      html += `<button type="button" ${ACTION_ATTRIBUTE}="advance">次へ</button>`;
    }
    html += '</section>';
    return html;
  }

  /** Create grouped action buttons for the current location. */
  #createLocationActionGroupsHtml(actions) {
    const normalActions = actions.filter((action) => !['destination', 'wait-until', 'cassiopeia-rewind'].includes(action.kind));
    const moveActions = actions.filter((action) => action.kind === 'destination');
    const waitActions = actions.filter((action) => action.kind === 'wait-until');
    const rewindActions = actions.filter((action) => action.kind === 'cassiopeia-rewind');
    let html = '';
    if (normalActions.length > 0) {
      html += '<section class="canonical-location-action-group"><h4>行動</h4>';
      html += this.#createLocationActionButtonsHtml(normalActions);
      html += '</section>';
    }
    if (moveActions.length > 0) {
      html += '<section class="canonical-location-action-group"><h4>移動</h4>';
      html += this.#createLocationActionButtonsHtml(moveActions);
      html += '</section>';
    }
    if (waitActions.length > 0) {
      html += '<section class="canonical-location-action-group"><h4>待機</h4>';
      html += '<label>時刻まで待つ <select data-canonical-select="wait-until"><option value="">選択</option>';
      for (const action of waitActions) {
        html += `<option value="${escapeHtml(action.targetMinute)}">${escapeHtml(action.label)}</option>`;
      }
      html += '</select></label></section>';
    }
    if (rewindActions.length > 0) {
      html += '<section class="canonical-location-action-group"><h4>カシオペア</h4>';
      html += '<label>巻き戻し先 <select data-canonical-select="cassiopeia-rewind"><option value="">選択</option>';
      for (const action of rewindActions) {
        html += `<option value="${escapeHtml(action.targetMinute)}">${escapeHtml(action.label)}</option>`;
      }
      html += '</select></label></section>';
    }
    return html;
  }

  /** Create buttons for location actions. */
  #createLocationActionButtonsHtml(actions) {
    let html = '';
    for (const action of actions) {
      html += `<button type="button" ${ACTION_ATTRIBUTE}="location-action" data-action-id="${escapeHtml(action.id)}" ${action.isEnabled === false ? 'disabled' : ''}>${escapeHtml(action.label)}</button>`;
    }
    return html;
  }

  /** Create Chao search controls. */
  #createSearchChaoHtml(snapshot) {
    if (snapshot.phase.id !== 'search-chao') {
      return '';
    }
    let html = '<section class="canonical-action-group">';
    html += `<h3>チャオ探索</h3>`;
    html += `<p>刹那: ${snapshot.events['chao-search'].data.isSetsunaWithParty ? '同行中' : '解散場所で待機'}</p>`;
    html += this.#createMainEventControlsHtml(snapshot);
    for (const hint of snapshot.events['chao-search'].data.hints) {
      html += `<p><b>${escapeHtml(hint.actorName)}</b>: ${escapeHtml(hint.text)}</p>`;
    }
    html += '</section>';
    return html;
  }

  /** Create date-preparation state text. */
  #createPrepareDateHtml(snapshot) {
    if (snapshot.phase.id !== 'prepare-date') {
      return '';
    }
    let html = '<section class="canonical-action-group">';
    html += '<h3>自由時間</h3>';
    html += `<p>服装コーディネート: ${snapshot.prepareDate.hasCoordinated ? '完了' : '未実施'}</p>`;
    html += `<p>デート準備: ${snapshot.prepareDate.hasPrepared ? '完了' : '未実施'}</p>`;
    html += `<p>祭り見物: ${snapshot.prepareDate.hasStrolled ? '完了' : '未実施'}</p>`;
    html += '</section>';
    return html;
  }

  /** Create classmate attraction tour state text. */
  #createClassmateAttractionHtml(snapshot) {
    if (snapshot.phase.id !== 'classmate-attraction-tour') {
      return '';
    }
    let html = '<section class="canonical-action-group">';
    html += '<h3>クラスメイト出し物巡り</h3>';
    html += `<p>${snapshot.events['classmate-attraction-tour'].data.completedAttractionActorIds.length}/${snapshot.events['classmate-attraction-tour'].data.attractions.length}</p>`;
    for (const attraction of snapshot.events['classmate-attraction-tour'].data.attractions) {
      html += `<p>${attraction.isCompleted ? '済' : '未'} ${escapeHtml(attraction.name)} / ${escapeHtml(attraction.attractionName)}</p>`;
    }
    html += '</section>';
    return html;
  }

  /** Create normal phase choices. */
  #createChoiceHtml(snapshot) {
    if (snapshot.choices.length === 0) {
      return '';
    }
    let html = '<section class="canonical-action-group canonical-choices">';
    for (const choice of snapshot.choices) {
      html += `<button type="button" ${ACTION_ATTRIBUTE}="choice" data-choice-id="${escapeHtml(choice.id)}">${escapeHtml(choice.label)}${choice.isRecommended ? ' *' : ''}</button>`;
    }
    html += '</section>';
    return html;
  }

  /** Create main-event controls for free-explore phases. */
  #createMainEventControlsHtml(snapshot) {
    if (snapshot.mainEvent.events.length === 0) {
      return '';
    }
    let html = '<section class="canonical-main-events"><h3>メインイベント</h3>';
    for (const event of snapshot.mainEvent.events) {
      html += `<p>${escapeHtml(event.title)}${event.isActive ? ' / 選択中' : ''}</p>`;
      html += `<button type="button" ${ACTION_ATTRIBUTE}="main-event" data-event-id="${escapeHtml(event.id)}">メインにする</button>`;
    }
    html += `<button type="button" ${ACTION_ATTRIBUTE}="main-event-clear">メイン解除</button>`;
    html += '</section>';
    return html;
  }

  /** Create the current message box HTML. */
  #createMessageHtml(snapshot) {
    let html = '<h2>メッセージ</h2>';
    if (snapshot.gameOver?.isActive) {
      html += '<section class="canonical-game-over">';
      html += '<p><b>ゲームオーバー</b></p>';
      html += `<p>${escapeHtml(snapshot.gameOver.reason)}</p>`;
      html += '</section>';
      return html;
    }
    if (snapshot.festivalNotification.length > 0) {
      html += '<section class="canonical-festival-notification">';
      for (const notification of snapshot.festivalNotification) {
        html += `<p><b>${escapeHtml(notification.speaker)}</b></p>`;
        html += `<p>${escapeHtml(notification.text)}</p>`;
      }
      html += '</section>';
    }
    if (!snapshot.dialogue) {
      return `
        ${html}
        <p>行動を選択してください。</p>
      `;
    }
    html += `<p><b>${escapeHtml(snapshot.dialogue.speaker)}</b></p>`;
    html += `<p>${escapeHtml(snapshot.dialogue.text)}</p>`;
    if (snapshot.phase.inputKind === 'story') {
      html += `<button type="button" ${ACTION_ATTRIBUTE}="advance">次へ</button>`;
    }
    return html;
  }

  /** Create the log block HTML. */
  #createLogHtml() {
    const entries = this.#displayLog
      .map((entry) => `<li><span>${escapeHtml(entry.kind)}</span>${escapeHtml(entry.text)}</li>`)
      .join('');
    return `<h2>ログ</h2><ol>${entries}</ol>`;
  }

  /** Create a short label for the current input mode. */
  #createInputHint(snapshot) {
    if (snapshot.gameOver?.isActive) {
      return 'タイトルへ戻る';
    }
    if (snapshot.routeComplete) {
      return '最初から開始';
    }
    if (snapshot.phase.inputKind === 'story') {
      return 'クリック / Enter';
    }
    if (snapshot.phase.inputKind === 'choice') {
      return '選択';
    }
    return '';
  }

  /** Append a displayed dialogue to the view log once. */
  #appendDialogueLog(snapshot) {
    if (!snapshot.dialogue) {
      return;
    }
    const dialogueKey = `${snapshot.phase.id}:${snapshot.dialogue.index}:${snapshot.dialogue.speaker}:${snapshot.dialogue.text}`;
    if (this.#lastDialogueKey === dialogueKey) {
      return;
    }
    this.#lastDialogueKey = dialogueKey;
    this.#appendLog('メッセージ', `${snapshot.dialogue.speaker}: ${snapshot.dialogue.text}`);
  }

  /** Append a festival broadcast notification to the view log once. */
  #appendFestivalNotificationLog(snapshot) {
    const notifications = snapshot.festivalNotification;
    if (notifications.length === 0) {
      return;
    }
    const notificationKey = notifications
      .map((notification) => `${notification.id}:${notification.text}`)
      .join('|');
    const notification = notifications[0];
    if (this.#lastFestivalNotificationKey === notificationKey) {
      return;
    }
    this.#lastFestivalNotificationKey = notificationKey;
    for (const additionalNotification of notifications.slice(1)) {
      this.#appendLog('麻帆良祭放送', `${additionalNotification.speaker}: ${additionalNotification.text}`);
    }
    this.#appendLog('麻帆良祭放送', `${notification.speaker}: ${notification.text}`);
  }

  /** Append one line to the view log. */
  #appendLog(kind, text) {
    this.#displayLog.push({ kind, text });
    if (this.#displayLog.length > VIEW_LOG_LIMIT) {
      this.#displayLog.shift();
    }
  }

  /** Convert click operations into scene input. */
  #onClick(event) {
    const target = event.target.closest(`[${ACTION_ATTRIBUTE}]`);
    if (!target) {
      if (this.#snapshot?.phase.inputKind === 'story') {
        this.#submitInput({ type: CANONICAL_INPUT_TYPES.STORY_ADVANCE });
      }
      return;
    }
    const action = target.getAttribute(ACTION_ATTRIBUTE);
    if (action === 'advance') {
      this.#submitInput({ type: CANONICAL_INPUT_TYPES.STORY_ADVANCE });
    } else if (action === 'choice') {
      this.#appendLog('選択', target.textContent.trim());
      this.#submitInput({
        type: CANONICAL_INPUT_TYPES.CHOICE_SELECT,
        choiceId: target.getAttribute('data-choice-id'),
      });
    } else if (action === 'main-event') {
      this.#appendLog('選択', target.textContent.trim());
      this.#submitInput({
        type: CANONICAL_INPUT_TYPES.MAIN_EVENT_SET,
        eventId: target.getAttribute('data-event-id'),
      });
    } else if (action === 'main-event-clear') {
      this.#appendLog('選択', target.textContent.trim());
      this.#submitInput({ type: CANONICAL_INPUT_TYPES.MAIN_EVENT_CLEAR });
    } else if (action === 'destination') {
      this.#appendLog('選択', target.textContent.trim());
      this.#submitInput({
        type: CANONICAL_INPUT_TYPES.DESTINATION_SELECT,
        destinationId: target.getAttribute('data-destination-id'),
      });
    } else if (action === 'location-action') {
      this.#appendLog('選択', target.textContent.trim());
      this.#submitInput({
        type: CANONICAL_INPUT_TYPES.LOCATION_ACTION_SELECT,
        actionId: target.getAttribute('data-action-id'),
      });
    } else if (action === 'interruption') {
      this.#appendLog('選択', target.textContent.trim());
      this.#submitInput({
        type: CANONICAL_INPUT_TYPES.INTERRUPTION_SELECT,
        choiceId: target.getAttribute('data-choice-id'),
      });
    } else if (action === 'tutorial-skip') {
      this.#appendLog('選択', target.textContent.trim());
      this.#submitInput({ type: CANONICAL_INPUT_TYPES.TUTORIAL_SKIP });
    } else if (action === 'restart') {
      this.#displayLog = [];
      this.#lastDialogueKey = null;
      this.#lastFestivalNotificationKey = null;
      this.#submitInput({ type: CANONICAL_INPUT_TYPES.ROUTE_RESTART });
    } else if (action === 'save') {
      this.#submitInput({ type: CANONICAL_INPUT_TYPES.SAVE_GAME });
    } else if (action === 'load') {
      if (window.confirm('保存時点の状態をロードしますか？')) {
        this.#submitInput({ type: CANONICAL_INPUT_TYPES.LOAD_GAME });
      }
    }
    this.#updateHtmlRegion('log', JSON.stringify(this.#displayLog), this.#createLogHtml());
  }

  /** Convert select operations into scene input. */
  #onChange(event) {
    const select = event.target.closest('[data-canonical-select]');
    if (!select || !select.value) {
      return;
    }
    const kind = select.getAttribute('data-canonical-select');
    const type = kind === 'wait-until'
      ? CANONICAL_INPUT_TYPES.WAIT_UNTIL
      : CANONICAL_INPUT_TYPES.CASSIOPEIA_REWIND;
    this.#appendLog('選択', select.options[select.selectedIndex].textContent);
    this.#submitInput({ type, targetMinute: Number(select.value) });
    select.value = '';
  }

  /** Convert keyboard operations into scene input. */
  #onKeyDown(event) {
    if (event.repeat) {
      return;
    }
    if (event.code === 'Enter' || event.code === 'Space') {
      event.preventDefault();
      this.#submitInput({ type: CANONICAL_INPUT_TYPES.STORY_ADVANCE });
    }
  }

  /** Submit one input and request an immediate event-driven render step. */
  #submitInput(input) {
    if (!this.#enqueueInput) {
      return;
    }
    this.#enqueueInput(input);
    if (this.#requestRenderStep) {
      this.#requestRenderStep();
    }
  }
}

export {
  CanonicalFestivalPrototypeView,
};
