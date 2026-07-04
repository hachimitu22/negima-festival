import { INPUT_TYPES, TARGET_PREFIXES } from '../../../gameDomain/actions.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const MAP_COLUMN_COUNT = 5;
const MAP_LAYOUT = Object.freeze({
  roof: { column: 2, row: 1 },
  other_class_corridor: { column: 2, row: 2 },
  classroom_3a_front_corridor: { column: 3, row: 2 },
  classroom_3a: { column: 4, row: 2 },
  health_room: { column: 1, row: 3 },
  health_room_front_corridor: { column: 2, row: 3 },
  hall: { column: 3, row: 3 },
  library_room_front_corridor: { column: 4, row: 3 },
  library_room: { column: 5, row: 3 },
  girls_bathroom: { column: 2, row: 4 },
  staff_room: { column: 4, row: 4 },
  gym_arena: { column: 1, row: 5 },
  gym_front_parking: { column: 3, row: 5 },
  school_ground: { column: 4, row: 5 },
  gym_changing_room: { column: 1, row: 6 },
  gym_equipment_room: { column: 2, row: 6 },
  rest_area: { column: 3, row: 6 },
  church_front: { column: 3, row: 7 },
  food_street: { column: 4, row: 7 },
  david_plaza: { column: 3, row: 8 },
  club_building: { column: 4, row: 8 },
  world_tree: { column: 5, row: 8 },
});
const GROUP_KEYS = new Map([
  ['校舎1階', 'school-first-floor'],
  ['校舎2階', 'school-second-floor'],
  ['校舎屋上', 'school-rooftop'],
  ['体育館', 'gym'],
  ['屋外', 'outdoor'],
]);

function createMapView(rootElement, options) {
  const enqueueInput = options.enqueueInput;
  const viewState = options.viewState ?? { trackedActorId: null };
  const title = createHeading('map-title', 'マップ');
  const actorTracker = document.createElement('label');
  const actorTrackerLabel = document.createElement('span');
  const actorSelect = document.createElement('select');
  const clearActorOption = document.createElement('option');
  const legend = document.createElement('ul');
  const scrollContainer = document.createElement('div');
  const stage = document.createElement('div');
  const connectionLayer = document.createElementNS(SVG_NAMESPACE, 'svg');
  let resizeObserver = null;
  let drawFrameId = null;
  let lastConnectionSignature = null;
  let lastActorOptionSignature = null;
  let latestActors = [];
  let isDestroyed = false;

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
  scrollContainer.dataset.mapScroll = '';
  stage.dataset.mapStage = '';
  connectionLayer.dataset.mapConnections = '';
  connectionLayer.setAttribute('aria-hidden', 'true');
  connectionLayer.setAttribute('focusable', 'false');

  stage.appendChild(connectionLayer);
  scrollContainer.appendChild(stage);
  rootElement.append(title, actorTracker, legend, scrollContainer);
  actorSelect.addEventListener('change', handleTrackedActorChange);

  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(scheduleConnectionDraw);
    resizeObserver.observe(stage);
  }

  function update(locations, currentLocation, actors = []) {
    latestActors = actors;
    updateActorTracker(actors);
    const locationIds = new Set(locations.map(location => location.id));
    const actorsByLocationId = groupActorsByLocationId(actors);
    const connectionSignature = createConnectionSignature(locations);
    let fallbackIndex = 0;

    Array.from(stage.querySelectorAll('[data-location-id]')).forEach(locationItem => {
      if (!locationIds.has(locationItem.dataset.locationId)) {
        locationItem.remove();
      }
    });

    locations.forEach(location => {
      const locationItem = getOrCreateLocationItem(location);
      const layout = MAP_LAYOUT[location.id]
        ?? createFallbackLayout(fallbackIndex++);

      locationItem.style.gridColumn = String(layout.column);
      locationItem.style.gridRow = String(layout.row);
      updateActorPopoverPlacement(locationItem, layout);
      updateLocationItem(
        locationItem,
        location,
        currentLocation,
        actorsByLocationId.get(location.id) ?? [],
      );

      if (!locationItem.isConnected) {
        stage.appendChild(locationItem);
      }
    });

    if (connectionSignature !== lastConnectionSignature) {
      updateLegend(locations);
      updateConnections(locations);
      scheduleConnectionDraw();
      lastConnectionSignature = connectionSignature;
    }
  }

  function destroy() {
    isDestroyed = true;
    actorSelect.removeEventListener('change', handleTrackedActorChange);
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (drawFrameId !== null) {
      cancelAnimationFrame(drawFrameId);
      drawFrameId = null;
    }
    lastConnectionSignature = null;
    lastActorOptionSignature = null;
    latestActors = [];
    rootElement.replaceChildren();
  }

  function getOrCreateLocationItem(location) {
    const existingItem = stage.querySelector(`[data-location-id="${location.id}"]`);
    return existingItem ?? createLocationItem(location);
  }

  function createLocationItem(location) {
    const locationItem = document.createElement('div');
    const locationButton = document.createElement('button');
    const actorSummary = document.createElement('div');
    const trackedActorMarker = document.createElement('span');
    const actorCount = document.createElement('span');
    const actorList = document.createElement('menu');

    locationItem.dataset.locationId = location.id;
    locationButton.type = 'button';
    locationButton.value = location.name;
    locationButton.dataset.locationButton = '';
    locationButton.addEventListener('click', () => {
      enqueueInput({
        type: INPUT_TYPES.TARGET_ACTIVATE,
        targetId: createTargetId(TARGET_PREFIXES.LOCATION, location.id),
      });
    });
    actorSummary.dataset.locationActorSummary = '';
    trackedActorMarker.dataset.trackedActorMarker = '';
    trackedActorMarker.textContent = '♥';
    trackedActorMarker.hidden = true;
    actorCount.dataset.locationActorCount = '';
    actorList.dataset.locationActors = '';
    actorList.setAttribute('aria-label', `${location.name}にいるアクター`);

    actorSummary.append(trackedActorMarker, actorCount);
    locationItem.append(locationButton, actorSummary, actorList);
    return locationItem;
  }

  function updateLocationItem(locationItem, location, currentLocation, actors) {
    const locationButton = locationItem.querySelector('[data-location-button]');
    const actorCount = locationItem.querySelector('[data-location-actor-count]');
    const actorList = locationItem.querySelector('[data-location-actors]');
    const trackedActor = actors.find(actor => actor.id === viewState.trackedActorId)
      ?? null;
    const isCurrentLocation = currentLocation.id === location.id;
    const isMovable = currentLocation.destinations.includes(location.name);
    const locationName = location.name;
    const disabled = isCurrentLocation || !isMovable;

    locationItem.dataset.locationGroup = getGroupKey(location.group);
    locationItem.toggleAttribute('data-current-location', isCurrentLocation);
    locationItem.toggleAttribute('data-movable-location', isMovable);
    locationItem.toggleAttribute('data-has-actors', actors.length > 0);

    if (locationButton.value !== location.name) {
      locationButton.value = location.name;
    }
    if (locationButton.textContent !== locationName) {
      locationButton.textContent = locationName;
    }
    if (locationButton.disabled !== disabled) {
      locationButton.disabled = disabled;
    }
    if (isCurrentLocation) {
      locationButton.setAttribute('aria-current', 'location');
    } else {
      locationButton.removeAttribute('aria-current');
    }

    const actorListLabel = `${location.name}にいるアクター`;
    const actorCountText = `${actors.length}人`;
    if (actorCount.textContent !== actorCountText) {
      actorCount.textContent = actorCountText;
    }
    if (actorList.getAttribute('aria-label') !== actorListLabel) {
      actorList.setAttribute('aria-label', actorListLabel);
    }
    actorList.hidden = actors.length === 0;
    updateTrackedActorMarker(locationItem, trackedActor);
    updateLocationActors(actorList, actors, enqueueInput);
  }

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

  function handleTrackedActorChange() {
    viewState.trackedActorId = actorSelect.value || null;
    updateTrackedActorMarkers(latestActors);
  }

  function updateTrackedActorMarkers(actors) {
    const trackedActor = actors.find(actor => actor.id === viewState.trackedActorId)
      ?? null;

    Array.from(stage.querySelectorAll('[data-location-id]')).forEach(locationItem => {
      const isTrackedLocation = trackedActor?.location?.id
        === locationItem.dataset.locationId;
      updateTrackedActorMarker(
        locationItem,
        isTrackedLocation ? trackedActor : null,
      );
    });
  }

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

  function updateConnections(locations) {
    const connections = createConnections(locations);
    const connectionIds = new Set(connections.map(connection => connection.id));

    Array.from(connectionLayer.children).forEach(line => {
      if (!connectionIds.has(line.dataset.connectionId)) {
        line.remove();
      }
    });

    connections.forEach(connection => {
      let line = Array.from(connectionLayer.children)
        .find(candidate => candidate.dataset.connectionId === connection.id);
      if (!line) {
        line = document.createElementNS(SVG_NAMESPACE, 'line');
        line.dataset.connectionId = connection.id;
        connectionLayer.appendChild(line);
      }
      line.dataset.sourceLocationId = connection.sourceId;
      line.dataset.targetLocationId = connection.targetId;
    });
  }

  function scheduleConnectionDraw() {
    if (isDestroyed || drawFrameId !== null) {
      return;
    }
    drawFrameId = requestAnimationFrame(() => {
      drawFrameId = null;
      drawConnections();
    });
  }

  function drawConnections() {
    const stageRect = stage.getBoundingClientRect();
    const width = stage.clientWidth;
    const height = stage.clientHeight;

    connectionLayer.setAttribute('viewBox', `0 0 ${width} ${height}`);
    connectionLayer.setAttribute('width', String(width));
    connectionLayer.setAttribute('height', String(height));

    Array.from(connectionLayer.children).forEach(line => {
      const sourceButton = findLocationButton(line.dataset.sourceLocationId);
      const targetButton = findLocationButton(line.dataset.targetLocationId);
      if (!sourceButton || !targetButton) {
        line.hidden = true;
        return;
      }

      const endpoints = calculateConnectionEndpoints(
        sourceButton.getBoundingClientRect(),
        targetButton.getBoundingClientRect(),
        stageRect,
      );
      line.hidden = false;
      line.setAttribute('x1', String(endpoints.x1));
      line.setAttribute('y1', String(endpoints.y1));
      line.setAttribute('x2', String(endpoints.x2));
      line.setAttribute('y2', String(endpoints.y2));
    });
  }

  function findLocationButton(locationId) {
    return stage.querySelector(
      `[data-location-id="${locationId}"] [data-location-button]`,
    );
  }

  return {
    destroy,
    update,
  };
}

function createConnections(locations) {
  const locationsByName = new Map(
    locations.map(location => [location.name, location]),
  );
  const knownConnections = new Set();
  const connections = [];

  locations.forEach(location => {
    location.destinations.forEach(destinationName => {
      const destination = locationsByName.get(destinationName);
      if (!destination) {
        return;
      }

      const ids = [location.id, destination.id].sort();
      const id = ids.join('--');
      if (knownConnections.has(id)) {
        return;
      }

      knownConnections.add(id);
      connections.push({
        id,
        sourceId: location.id,
        targetId: destination.id,
      });
    });
  });

  return connections;
}

function createConnectionSignature(locations) {
  return JSON.stringify(locations.map(location => ({
    id: location.id,
    name: location.name,
    group: location.group,
    destinations: location.destinations,
  })));
}

function calculateConnectionEndpoints(sourceRect, targetRect, stageRect) {
  const sourceCenter = getRelativeCenter(sourceRect, stageRect);
  const targetCenter = getRelativeCenter(targetRect, stageRect);
  const deltaX = targetCenter.x - sourceCenter.x;
  const deltaY = targetCenter.y - sourceCenter.y;
  const sourceScale = getRectangleBoundaryScale(
    deltaX,
    deltaY,
    sourceRect.width,
    sourceRect.height,
  );
  const targetScale = getRectangleBoundaryScale(
    deltaX,
    deltaY,
    targetRect.width,
    targetRect.height,
  );

  return {
    x1: sourceCenter.x + (deltaX * sourceScale),
    y1: sourceCenter.y + (deltaY * sourceScale),
    x2: targetCenter.x - (deltaX * targetScale),
    y2: targetCenter.y - (deltaY * targetScale),
  };
}

function getRelativeCenter(rect, containerRect) {
  return {
    x: rect.left - containerRect.left + (rect.width / 2),
    y: rect.top - containerRect.top + (rect.height / 2),
  };
}

function getRectangleBoundaryScale(deltaX, deltaY, width, height) {
  const horizontalScale = deltaX === 0
    ? Number.POSITIVE_INFINITY
    : (width / 2) / Math.abs(deltaX);
  const verticalScale = deltaY === 0
    ? Number.POSITIVE_INFINITY
    : (height / 2) / Math.abs(deltaY);
  return Math.min(horizontalScale, verticalScale);
}

function createFallbackLayout(index) {
  return {
    column: (index % MAP_COLUMN_COUNT) + 1,
    row: 9 + Math.floor(index / MAP_COLUMN_COUNT),
  };
}

function updateActorPopoverPlacement(locationItem, layout) {
  locationItem.dataset.actorPopoverHorizontal = layout.column >= 4
    ? 'left'
    : 'right';
  locationItem.dataset.actorPopoverVertical = layout.row >= 7
    ? 'above'
    : 'below';
}

function updateTrackedActorMarker(locationItem, actor) {
  const marker = locationItem.querySelector('[data-tracked-actor-marker]');
  const isTrackedLocation = actor !== null;

  locationItem.toggleAttribute(
    'data-tracked-actor-location',
    isTrackedLocation,
  );
  marker.hidden = !isTrackedLocation;

  if (actor) {
    const label = `${actor.name}を追跡中`;
    marker.title = label;
    marker.setAttribute('aria-label', label);
  } else {
    marker.removeAttribute('title');
    marker.removeAttribute('aria-label');
  }
}

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

function updateLocationActors(actorList, actors, enqueueInput) {
  const actorIds = new Set(actors.map(actor => actor.id));

  Array.from(actorList.children).forEach(actorItem => {
    if (!actorIds.has(actorItem.dataset.actorId)) {
      actorItem.remove();
    }
  });

  actors.forEach(actor => {
    const actorItem = getOrCreateActorItem(actorList, actor, enqueueInput);
    const actorButton = actorItem.querySelector('[data-actor-button]');
    const actorAffection = actorItem.querySelector('[data-actor-affection]');
    const hasAffection = typeof actor.affection === 'number';
    const affectionText = hasAffection ? `${actor.affection}` : '';
    const disabled = !actor.isTalkable;

    if (actorButton.textContent !== actor.name) {
      actorButton.textContent = actor.name;
    }
    if (actorButton.disabled !== disabled) {
      actorButton.disabled = disabled;
    }
    if (actorAffection.textContent !== affectionText) {
      actorAffection.textContent = affectionText;
    }
    if (actorAffection.hidden !== !hasAffection) {
      actorAffection.hidden = !hasAffection;
    }
    if (!actorItem.isConnected) {
      actorList.appendChild(actorItem);
    }
  });
}

function getOrCreateActorItem(actorList, actor, enqueueInput) {
  const existingItem = actorList.querySelector(`[data-actor-id="${actor.id}"]`);
  if (existingItem) {
    return existingItem;
  }

  const actorItem = document.createElement('li');
  const actorButton = document.createElement('button');
  const actorAffection = document.createElement('span');

  actorButton.type = 'button';
  actorButton.textContent = actor.name;
  actorButton.dataset.actorButton = '';
  actorButton.setAttribute('compact', '');
  actorButton.addEventListener('click', () => {
    enqueueInput({
      type: INPUT_TYPES.TARGET_ACTIVATE,
      targetId: createTargetId(TARGET_PREFIXES.ACTOR, actor.id),
    });
  });
  actorAffection.dataset.actorAffection = '';
  actorAffection.setAttribute('aria-label', '好感度');
  actorItem.dataset.actorId = actor.id;
  actorItem.append(actorButton, actorAffection);
  return actorItem;
}

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

function createTargetId(prefix, id) {
  return `${prefix}:${id}`;
}

function createHeading(id, text) {
  const element = document.createElement('h2');
  element.id = id;
  element.textContent = text;
  return element;
}

export {
  createMapView,
};
