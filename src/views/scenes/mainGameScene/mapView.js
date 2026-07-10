import { INPUT_TYPES, TARGET_PREFIXES } from '../../../gameDomain/actions.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const GROUP_KEYS = new Map([
  ['校舎1階', 'school-first-floor'],
  ['校舎2階', 'school-second-floor'],
  ['校舎屋上', 'school-rooftop'],
  ['体育館', 'gym'],
  ['屋外', 'outdoor'],
]);

/**
 * グリッドマップビューを作成する。
 * @public
 * @param {HTMLElement} rootElement - 描画対象要素。
 * @param {Object} options - view設定。
 * @returns {Object} マップビューAPI。
 */
function createMapView(rootElement, options) {
  const enqueueInput = options.enqueueInput;
  const viewState = options.viewState ?? { trackedActorId: null };
  const title = createHeading('map-title', 'マップ');
  const actorTracker = document.createElement('label');
  const actorTrackerLabel = document.createElement('span');
  const actorSelect = document.createElement('select');
  const clearActorOption = document.createElement('option');
  const legend = document.createElement('ul');
  const stage = document.createElement('div');
  const wallLayer = document.createElementNS(SVG_NAMESPACE, 'svg');
  const locationLayer = document.createElement('div');
  const actorLayer = document.createElement('div');
  let lastMapSignature = null;
  let lastActorOptionSignature = null;
  let latestActors = [];
  let latestMap = null;
  let isInputDisabled = false;

  rootElement.setAttribute('aria-labelledby', title.id);
  actorTracker.dataset.actorTracker = '';
  actorTrackerLabel.textContent = '追跡するアクター';
  actorSelect.id = 'tracked-actor-select';
  actorSelect.dataset.trackedActorSelect = '';
  clearActorOption.value = '';
  clearActorOption.textContent = '追跡しない';
  actorSelect.appendChild(clearActorOption);
  actorTracker.append(actorTrackerLabel, actorSelect);
  legend.dataset.mapLegend = '';
  legend.setAttribute('aria-label', 'マップのエリア');
  stage.dataset.mapStage = '';
  stage.tabIndex = 0;
  wallLayer.dataset.mapWalls = '';
  wallLayer.setAttribute('aria-hidden', 'true');
  locationLayer.dataset.mapLocationLayer = '';
  actorLayer.dataset.mapActorLayer = '';
  stage.append(locationLayer, wallLayer, actorLayer);
  rootElement.append(title, actorTracker, legend, stage);

  actorSelect.addEventListener('change', handleTrackedActorChange);
  stage.addEventListener('click', handleStageClick);

  /**
   * マップ表示を最新snapshotで更新する。
   * @param {Object} map - マップsnapshot。
   * @param {Object} character - 主人公snapshot。
   * @param {Array<Object>} [actors=[]] - アクターsnapshot配列。
   * @param {Object} [options={}] - Update options.
   * @param {boolean} [options.isInputDisabled=false] - Whether map input is disabled.
   * @returns {void}
   */
  function update(map, character, actors = [], { isInputDisabled: nextIsInputDisabled = false } = {}) {
    latestActors = actors;
    latestMap = map;
    isInputDisabled = nextIsInputDisabled;
    actorSelect.disabled = isInputDisabled;
    stage.toggleAttribute('data-map-input-disabled', isInputDisabled);
    updateActorTracker(actors);

    const mapSignature = JSON.stringify({
      width: map.width,
      height: map.height,
      locations: map.locations,
      walls: map.walls,
    });
    if (mapSignature !== lastMapSignature) {
      updateLegend(map.locations);
      updateMapGeometry(map);
      lastMapSignature = mapSignature;
    }

    updateCharacterMarker(character, map);
    updateActorMarkers(actors, map);
  }

  /**
   * マップviewのイベント購読とDOMを破棄する。
   * @returns {void}
   */
  function destroy() {
    actorSelect.removeEventListener('change', handleTrackedActorChange);
    stage.removeEventListener('click', handleStageClick);
    lastMapSignature = null;
    lastActorOptionSignature = null;
    latestActors = [];
    latestMap = null;
    isInputDisabled = false;
    rootElement.replaceChildren();
  }

  /**
   * マップのグリッド寸法と静的レイヤーを更新する。
   * @param {Object} map - マップsnapshot。
   * @returns {void}
   */
  function updateMapGeometry(map) {
    stage.style.setProperty('--map-grid-width', String(map.width));
    stage.style.setProperty('--map-grid-height', String(map.height));
    updateLocationAreas(map);
    updateWalls(map);
  }

  /**
   * 場所領域レイヤーをマップsnapshotに合わせて更新する。
   * @param {Object} map - マップsnapshot。
   * @returns {void}
   */
  function updateLocationAreas(map) {
    const locationIds = new Set(map.locations.map(location => location.id));

    Array.from(locationLayer.children).forEach(area => {
      if (!locationIds.has(area.dataset.locationId)) {
        area.remove();
      }
    });

    map.locations.forEach(location => {
      const area = getOrCreateLocationArea(location);
      const { x, y, width, height } = location.area;
      area.dataset.locationGroup = getGroupKey(location.group);
      area.style.left = `${(x / map.width) * 100}%`;
      area.style.top = `${(y / map.height) * 100}%`;
      area.style.width = `${(width / map.width) * 100}%`;
      area.style.height = `${(height / map.height) * 100}%`;
      area.querySelector('[data-map-location-label]').textContent = location.name;

      if (!area.isConnected) {
        locationLayer.appendChild(area);
      }
    });
  }

  /**
   * 場所領域DOMを取得または作成する。
   * @param {Object} location - 場所snapshot。
   * @returns {HTMLElement} 場所領域DOM。
   */
  function getOrCreateLocationArea(location) {
    const existingArea = locationLayer.querySelector(`[data-location-id="${location.id}"]`);
    if (existingArea) {
      return existingArea;
    }

    const area = document.createElement('div');
    const label = document.createElement('span');
    area.dataset.mapLocationArea = '';
    area.dataset.locationId = location.id;
    label.dataset.mapLocationLabel = '';
    area.appendChild(label);
    return area;
  }

  /**
   * 壁レイヤーをマップsnapshotに合わせて更新する。
   * @param {Object} map - マップsnapshot。
   * @returns {void}
   */
  function updateWalls(map) {
    wallLayer.setAttribute('viewBox', `0 0 ${map.width} ${map.height}`);
    wallLayer.setAttribute('preserveAspectRatio', 'none');

    const wallIds = new Set(map.walls.map(wall => wall.id));
    Array.from(wallLayer.children).forEach(line => {
      if (!wallIds.has(line.dataset.wallId)) {
        line.remove();
      }
    });

    map.walls.forEach(wall => {
      const line = getOrCreateWallLine(wall);
      line.setAttribute('x1', String(wall.x1));
      line.setAttribute('y1', String(wall.y1));
      line.setAttribute('x2', String(wall.x2));
      line.setAttribute('y2', String(wall.y2));
      if (!line.isConnected) {
        wallLayer.appendChild(line);
      }
    });
  }

  /**
   * 壁線分DOMを取得または作成する。
   * @param {Object} wall - 壁snapshot。
   * @returns {SVGLineElement} 壁線分DOM。
   */
  function getOrCreateWallLine(wall) {
    const existingLine = wallLayer.querySelector(`[data-wall-id="${wall.id}"]`);
    if (existingLine) {
      return existingLine;
    }

    const line = document.createElementNS(SVG_NAMESPACE, 'line');
    line.dataset.wallId = wall.id;
    return line;
  }

  /**
   * 主人公マーカーを更新する。
   * @param {Object} character - 主人公snapshot。
   * @param {Object} map - マップsnapshot。
   * @returns {void}
   */
  function updateCharacterMarker(character, map) {
    let marker = actorLayer.querySelector('[data-character-marker]');
    if (!marker) {
      marker = document.createElement('div');
      marker.dataset.characterMarker = '';
      actorLayer.appendChild(marker);
    }

    marker.textContent = '';
    setMarkerPosition(marker, character.position, map);
    marker.title = `ネギ: ${character.location.name}`;
    marker.setAttribute('aria-label', marker.title);
  }

  /**
   * アクターマーカーを更新する。
   * @param {Array<Object>} actors - アクターsnapshot配列。
   * @param {Object} map - マップsnapshot。
   * @returns {void}
   */
  function updateActorMarkers(actors, map) {
    const actorIds = new Set(actors.map(actor => actor.id));
    Array.from(actorLayer.querySelectorAll('[data-actor-id]')).forEach(marker => {
      if (!actorIds.has(marker.dataset.actorId)) {
        marker.remove();
      }
    });

    const actorsByLocationId = groupActorsByLocationId(actors);
    actors.forEach(actor => {
      const marker = getOrCreateActorMarker(actor);
      const locationActors = actorsByLocationId.get(actor.location?.id) ?? [];
      const locationIndex = locationActors.findIndex(candidate => candidate.id === actor.id);
      const position = offsetActorPosition(actor.position, locationIndex);

      marker.textContent = '';
      marker.disabled = isInputDisabled || !actor.isTalkable;
      marker.toggleAttribute('data-tracked-actor', actor.id === viewState.trackedActorId);
      marker.title = `${actor.name}: ${actor.location?.name ?? ''}`;
      marker.setAttribute('aria-label', marker.title);
      setMarkerPosition(marker, position, map);

      if (!marker.isConnected) {
        actorLayer.appendChild(marker);
      }
    });
  }

  /**
   * アクターマーカーDOMを取得または作成する。
   * @param {Object} actor - アクターsnapshot。
   * @returns {HTMLButtonElement} アクターマーカーDOM。
   */
  function getOrCreateActorMarker(actor) {
    const existingMarker = actorLayer.querySelector(`[data-actor-id="${actor.id}"]`);
    if (existingMarker) {
      return existingMarker;
    }

    const marker = document.createElement('button');
    marker.type = 'button';
    marker.dataset.actorMarker = '';
    marker.dataset.actorId = actor.id;
    marker.addEventListener('click', event => {
      event.stopPropagation();
      enqueueInput({
        type: INPUT_TYPES.TARGET_ACTIVATE,
        targetId: createTargetId(TARGET_PREFIXES.ACTOR, actor.id),
      });
    });
    return marker;
  }

  /**
   * マーカーDOMをマップ座標に配置する。
   * @param {HTMLElement} marker - マーカーDOM。
   * @param {Object} position - マップ座標。
   * @param {Object} map - マップsnapshot。
   * @returns {void}
   */
  function setMarkerPosition(marker, position, map) {
    marker.style.left = `${(position.x / map.width) * 100}%`;
    marker.style.top = `${(position.y / map.height) * 100}%`;
  }

  /**
   * 追跡対象アクター選択UIを更新する。
   * @param {Array<Object>} actors - アクターsnapshot配列。
   * @returns {void}
   */
  function updateActorTracker(actors) {
    const optionSignature = JSON.stringify(
      actors.map(actor => ({ id: actor.id, name: actor.name })),
    );
    if (optionSignature !== lastActorOptionSignature) {
      actorSelect.replaceChildren(clearActorOption);
      actors.forEach(actor => {
        const option = document.createElement('option');
        option.value = actor.id;
        option.textContent = actor.name;
        actorSelect.appendChild(option);
      });
      lastActorOptionSignature = optionSignature;
    }

    const hasTrackedActor = actors.some(actor => actor.id === viewState.trackedActorId);
    if (viewState.trackedActorId && !hasTrackedActor) {
      viewState.trackedActorId = null;
    }

    const selectedActorId = viewState.trackedActorId ?? '';
    if (actorSelect.value !== selectedActorId) {
      actorSelect.value = selectedActorId;
    }
  }

  /**
   * 場所グループ凡例を更新する。
   * @param {Array<Object>} locations - 場所snapshot配列。
   * @returns {void}
   */
  function updateLegend(locations) {
    const groups = [];
    const knownGroups = new Set();

    locations.forEach(location => {
      if (!knownGroups.has(location.group)) {
        knownGroups.add(location.group);
        groups.push(location.group);
      }
    });

    const groupKeys = new Set(groups.map(getGroupKey));
    Array.from(legend.children).forEach(item => {
      if (!groupKeys.has(item.dataset.mapLegendGroup)) {
        item.remove();
      }
    });

    groups.forEach(groupName => {
      const groupKey = getGroupKey(groupName);
      let item = Array.from(legend.children)
        .find(candidate => candidate.dataset.mapLegendGroup === groupKey);

      if (!item) {
        item = document.createElement('li');
        const marker = document.createElement('span');
        const label = document.createElement('span');
        item.dataset.mapLegendGroup = groupKey;
        marker.dataset.mapLegendMarker = '';
        label.dataset.mapLegendLabel = '';
        item.append(marker, label);
        legend.appendChild(item);
      }

      item.querySelector('[data-map-legend-label]').textContent = groupName;
    });
  }

  /**
   * 追跡対象アクター選択の変更を反映する。
   * @returns {void}
   */
  function handleTrackedActorChange() {
    viewState.trackedActorId = actorSelect.value || null;
    if (!latestMap) {
      return;
    }
    updateActorMarkers(latestActors, latestMap);
  }

  /**
   * マップクリック位置をマップ座標入力に変換してenqueueする。
   * @param {MouseEvent} event - clickイベント。
   * @returns {void}
   */
  function handleStageClick(event) {
    if (
      isInputDisabled
      || !latestMap
      || event.target.closest('[data-actor-marker]')
    ) {
      return;
    }

    const rect = stage.getBoundingClientRect();
    const x = clamp(
      ((event.clientX - rect.left) / rect.width) * latestMap.width,
      0,
      latestMap.width - Number.EPSILON,
    );
    const y = clamp(
      ((event.clientY - rect.top) / rect.height) * latestMap.height,
      0,
      latestMap.height - Number.EPSILON,
    );

    enqueueInput({
      type: INPUT_TYPES.TARGET_ACTIVATE,
      targetId: createTargetId(
        TARGET_PREFIXES.MAP_POSITION,
        `${formatPositionValue(x)},${formatPositionValue(y)}`,
      ),
    });
  }

  return {
    destroy,
    update,
  };
}

/**
 * 同じ場所にいるアクターのマーカー表示位置を少しずらす。
 * @param {Object} position - 元のマップ座標。
 * @param {number} index - 同一場所内の表示順。
 * @returns {Object} 表示用座標。
 */
function offsetActorPosition(position, index) {
  if (index <= 0) {
    return position;
  }

  const angle = index * 1.7;
  const radius = 0.22 + ((index % 3) * 0.05);
  return {
    x: position.x + (Math.cos(angle) * radius),
    y: position.y + (Math.sin(angle) * radius),
  };
}

/**
 * アクターを現在地IDごとにまとめる。
 * @param {Array<Object>} actors - アクターsnapshot配列。
 * @returns {Map<string, Array<Object>>} 場所ID別アクターMap。
 */
function groupActorsByLocationId(actors) {
  const actorsByLocationId = new Map();

  actors.forEach(actor => {
    const locationId = actor.location?.id;
    if (!locationId) {
      return;
    }

    const locationActors = actorsByLocationId.get(locationId) ?? [];
    locationActors.push(actor);
    actorsByLocationId.set(locationId, locationActors);
  });

  return actorsByLocationId;
}

/**
 * 場所グループ名からCSS用の安定キーを作成する。
 * @param {string} groupName - 場所グループ名。
 * @returns {string} グループキー。
 */
function getGroupKey(groupName) {
  const knownKey = GROUP_KEYS.get(groupName);
  if (knownKey) {
    return knownKey;
  }

  let hash = 0;
  for (const character of groupName) {
    hash = ((hash << 5) - hash + character.codePointAt(0)) | 0;
  }
  return `other-${Math.abs(hash)}`;
}

/**
 * 入力用ターゲットIDを作成する。
 * @param {string} prefix - ターゲットprefix。
 * @param {string} id - ターゲット値。
 * @returns {string} ターゲットID。
 */
function createTargetId(prefix, id) {
  return `${prefix}:${id}`;
}

/**
 * 見出し要素を作成する。
 * @param {string} id - 要素ID。
 * @param {string} text - 表示テキスト。
 * @returns {HTMLHeadingElement} 見出し要素。
 */
function createHeading(id, text) {
  const element = document.createElement('h2');
  element.id = id;
  element.textContent = text;
  return element;
}

/**
 * 数値を指定範囲に丸める。
 * @param {number} value - 対象値。
 * @param {number} min - 最小値。
 * @param {number} max - 最大値。
 * @returns {number} 範囲内に丸めた値。
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * ターゲットIDに入れる座標値文字列を整形する。
 * @param {number} value - 座標値。
 * @returns {string} 整形後の座標値。
 */
function formatPositionValue(value) {
  return value.toFixed(3).replace(/\.?0+$/, '');
}

export {
  createMapView,
};
