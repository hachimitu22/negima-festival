import { INPUT_TYPES, MAIN_GAME_LAYER_IDS, TARGET_PREFIXES } from '../../../gameDomain/actions.js';
import { createStatusView } from '../../statusView.js';

function createMainGameSceneView(rootElement, options) {
  const statusView = createStatusView();
  let root = null;
  let elements = null;
  let enqueueInput = null;
  let activePanelLayerId = null;

  mount(rootElement, options);

  function mount(rootElement, options) {
    enqueueInput = options.enqueueInput;
    root = document.createElement('section');
    root.id = 'main-game-scene';

    elements = {
      eventPanel: createRegion(createDiv('event-panel')),
      menu: createRegion(createList('menu')),
      back: createRegion(createDiv('back')),
      mapList: createRegion(createDiv('map-list')),
      eventList: createRegion(createList('event-list')),
    };

    statusView.mount(root, options);
    [
      elements.menu,
      elements.back,
      elements.eventList,
    ].forEach(region => {
      elements.eventPanel.element.append(region.anchor, region.element);
    });
    [
      elements.eventPanel,
      elements.mapList,
    ].forEach(region => {
      root.append(region.anchor, region.element);
    });
    rootElement.appendChild(root);
  }

  function init(snapshot) {
    statusView.init(snapshot);
    updateSceneContent(snapshot);
  }

  function update(snapshot) {
    statusView.update(snapshot);
    updateSceneContent(snapshot);
  }

  function updateSceneContent(snapshot) {
    updateActivePanelLayer(snapshot.activePanelLayerId);
    updateMap(
      snapshot.mapLocations,
      snapshot.character.location,
      snapshot.actors,
    );

    if (snapshot.activePanelLayerId === MAIN_GAME_LAYER_IDS.MENU) {
      updateLayerMenu(snapshot);
    } else if (snapshot.activePanelLayerId === MAIN_GAME_LAYER_IDS.EXECUTING_EVENTS) {
      updateBackButton();
      updateExecutingEvents(snapshot.executingEvents);
    }
  }

  function destroy() {
    if (!elements) {
      return;
    }

    Object.values(elements).forEach(region => {
      region.element.replaceChildren();
      region.element.remove();
      region.anchor.remove();
    });
    statusView.destroy();
    root.remove();
    root = null;
    elements = null;
    enqueueInput = null;
    activePanelLayerId = null;
  }

  function updateActivePanelLayer(nextLayerId) {
    if (activePanelLayerId === nextLayerId) {
      return;
    }

    const activeRegions = getActivePanelRegions(nextLayerId);
    getInactiveRegions(activeRegions, getPanelRegions()).forEach(region => {
      region.element.remove();
    });
    activeRegions.forEach(region => {
      if (!region.element.isConnected) {
        region.anchor.after(region.element);
      }
    });
    activePanelLayerId = nextLayerId;
  }

  function getActivePanelRegions(layerId) {
    if (layerId === MAIN_GAME_LAYER_IDS.MENU) {
      return [elements.menu];
    }

    if (layerId === MAIN_GAME_LAYER_IDS.EXECUTING_EVENTS) {
      return [elements.back, elements.eventList];
    }

    return [];
  }

  function getPanelRegions() {
    return [
      elements.menu,
      elements.back,
      elements.eventList,
    ];
  }

  function getInactiveRegions(activeRegions, regions) {
    const activeRegionSet = new Set(activeRegions);
    return regions.filter(region => !activeRegionSet.has(region));
  }

  function updateLayerMenu(snapshot) {
    const layerItemIds = new Set(snapshot.layerItems.map(item => item.id));

    Array.from(elements.menu.element.children).forEach(layerItem => {
      if (!layerItemIds.has(layerItem.dataset.layerId)) {
        layerItem.remove();
      }
    });

    snapshot.layerItems.forEach(item => {
      const layerItem = getOrCreateLayerItem(item);
      layerItem.textContent = item.label;

      if (!layerItem.isConnected) {
        elements.menu.element.appendChild(layerItem);
      }
    });
  }

  function getOrCreateLayerItem(item) {
    const existingItem = elements.menu.element.querySelector(`[data-layer-id="${item.id}"]`);
    if (existingItem) {
      return existingItem;
    }

    const layerItem = document.createElement('li');
    layerItem.dataset.layerId = item.id;
    layerItem.addEventListener('click', () => {
      enqueueInput({
        type: INPUT_TYPES.TARGET_ACTIVATE,
        targetId: createTargetId(TARGET_PREFIXES.LAYER, item.id),
      });
    });
    return layerItem;
  }

  function updateBackButton() {
    if (elements.back.element.querySelector('#back-button')) {
      return;
    }

    createBackButton();
  }

  function createBackButton() {
    const backButton = document.createElement('button');
    backButton.id = 'back-button';
    backButton.type = 'button';
    backButton.textContent = 'メニューに戻る';
    backButton.addEventListener('click', () => {
      enqueueInput({
        type: INPUT_TYPES.TARGET_ACTIVATE,
        targetId: createTargetId(TARGET_PREFIXES.LAYER, MAIN_GAME_LAYER_IDS.MENU),
      });
    });
    elements.back.element.prepend(backButton);
  }

  function updateMap(locations, currentLocation, actors = []) {
    const groups = groupLocations(locations);
    const groupNames = new Set(groups.map(group => group.name));
    const actorsByLocationId = groupActorsByLocationId(actors);

    Array.from(elements.mapList.element.children).forEach(groupElement => {
      if (!groupNames.has(groupElement.dataset.mapGroup)) {
        groupElement.remove();
      }
    });

    groups.forEach(group => {
      const groupElement = getOrCreateMapGroup(group.name);
      const locationList = groupElement.querySelector('[data-map-group-locations]');

      updateMapGroupLocations(
        locationList,
        group.locations,
        currentLocation,
        actorsByLocationId,
      );

      if (!groupElement.isConnected) {
        elements.mapList.element.appendChild(groupElement);
      }
    });
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

  function groupLocations(locations) {
    const groups = [];
    const groupsByName = new Map();

    locations.forEach(location => {
      const groupName = location.group;
      let group = groupsByName.get(groupName);

      if (!group) {
        group = {
          name: groupName,
          locations: [],
        };
        groupsByName.set(groupName, group);
        groups.push(group);
      }

      group.locations.push(location);
    });

    return groups;
  }

  function getOrCreateMapGroup(groupName) {
    const existingGroup = Array.from(elements.mapList.element.children)
      .find(groupElement => groupElement.dataset.mapGroup === groupName);

    if (existingGroup) {
      return existingGroup;
    }

    return createMapGroup(groupName);
  }

  function createMapGroup(groupName) {
    const groupElement = document.createElement('section');
    const groupTitle = document.createElement('h3');
    const locationList = document.createElement('div');

    groupElement.dataset.mapGroup = groupName;
    groupTitle.textContent = groupName;
    locationList.dataset.mapGroupLocations = '';

    groupElement.append(groupTitle, locationList);
    return groupElement;
  }

  function updateMapGroupLocations(
    locationList,
    locations,
    currentLocation,
    actorsByLocationId,
  ) {
    const locationIds = new Set(locations.map(location => location.id));

    Array.from(locationList.children).forEach(locationItem => {
      if (!locationIds.has(locationItem.dataset.locationId)) {
        locationItem.remove();
      }
    });

    locations.forEach(location => {
      const locationItem = getOrCreateLocationItem(locationList, location);
      updateLocationItem(
        locationItem,
        location,
        currentLocation,
        actorsByLocationId.get(location.id) ?? [],
      );

      if (!locationItem.isConnected) {
        locationList.appendChild(locationItem);
      }
    });
  }

  function getOrCreateLocationItem(locationList, location) {
    const existingItem = locationList.querySelector(`[data-location-id="${location.id}"]`);

    if (existingItem) {
      return existingItem;
    }

    return createLocationItem(location);
  }

  function createLocationItem(location) {
    const locationItem = document.createElement('div');
    const locationButton = document.createElement('button');
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
    actorList.dataset.locationActors = '';

    locationItem.append(locationButton, actorList);
    return locationItem;
  }

  function updateLocationItem(locationItem, location, currentLocation, actors) {
    const locationButton = locationItem.querySelector('[data-location-button]');
    const actorList = locationItem.querySelector('[data-location-actors]');
    const isCurrentLocation = currentLocation.id === location.id;
    const isMovable = currentLocation.destinations.includes(location.name);
    const locationName = isCurrentLocation ? `${location.name} (現在地)` : location.name;
    const disabled = isCurrentLocation || !isMovable;

    if (locationButton.value !== location.name) {
      locationButton.value = location.name;
    }

    if (locationButton.textContent !== locationName) {
      locationButton.textContent = locationName;
    }

    if (locationButton.disabled !== disabled) {
      locationButton.disabled = disabled;
    }

    updateLocationActors(actorList, actors, isCurrentLocation, enqueueInput);
  }

  function updateExecutingEvents(events) {
    const eventIds = new Set(events.map(event => String(event.id)));

    Array.from(elements.eventList.element.children).forEach(eventItem => {
      if (!eventIds.has(eventItem.dataset.eventId)) {
        eventItem.remove();
      }
    });

    events.forEach(event => {
      const eventItem = getOrCreateExecutingEventItem(event);
      eventItem.querySelector('[data-event-label]').textContent = formatExecutingEvent(event);

      if (!eventItem.isConnected) {
        elements.eventList.element.appendChild(eventItem);
      }
    });
  }

  function getOrCreateExecutingEventItem(event) {
    const existingItem = elements.eventList.element.querySelector(`[data-event-id="${event.id}"]`);
    if (existingItem) {
      return existingItem;
    }

    const eventItem = document.createElement('li');
    const label = document.createElement('span');

    eventItem.id = `event-${event.id}`;
    eventItem.dataset.eventId = String(event.id);

    label.dataset.eventLabel = '';
    eventItem.appendChild(label);

    return eventItem;
  }

  return {
    destroy,
    init,
    update,
  };
}

function createRegion(element) {
  const anchor = document.createComment(`${element.id}-anchor`);
  return {
    anchor,
    element,
  };
}

function createDiv(id) {
  const element = document.createElement('div');
  element.id = id;
  return element;
}

function createList(id) {
  const element = document.createElement('ul');
  element.id = id;
  return element;
}

function formatExecutingEvent(event) {
  return `${event.id}: ${event.name}: ${event.description}`;
}

function updateLocationActors(actorList, actors, isCurrentLocation, enqueueInput) {
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
    const disabled = !isCurrentLocation;

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
  actorItem.dataset.actorId = actor.id;
  actorItem.append(actorButton, actorAffection);
  return actorItem;
}

function createTargetId(prefix, id) {
  return `${prefix}:${id}`;
}

export {
  createMainGameSceneView,
};
