import { INPUT_TYPES, TARGET_PREFIXES } from '../../../gameDomain/actions.js';
import { createStatusView } from '../../statusView.js';

function createMainGameSceneView(rootElement, options) {
  const statusView = createStatusView();
  let root = null;
  let elements = null;
  let enqueueInput = null;

  mount(rootElement, options);

  function mount(rootElement, options) {
    enqueueInput = options.enqueueInput;
    root = document.createElement('section');
    root.id = 'main-game-scene';

    elements = {
      eventPanel: createRegion(createDiv('event-panel')),
      eventTitle: createHeading('executing-events-title', '実行中イベント'),
      mapList: createRegion(createDiv('map-list')),
      eventList: createList('event-list'),
    };

    statusView.mount(root, options);
    elements.eventPanel.element.setAttribute('aria-labelledby', elements.eventTitle.id);
    elements.eventPanel.element.append(elements.eventTitle, elements.eventList);
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
    updateMap(
      snapshot.mapLocations,
      snapshot.character.location,
      snapshot.actors,
    );
    updateExecutingEvents(snapshot.executingEvents);
  }

  function destroy() {
    if (!elements) {
      return;
    }

    [
      elements.eventPanel,
      elements.mapList,
    ].forEach(region => {
      region.element.replaceChildren();
      region.element.remove();
      region.anchor.remove();
    });
    statusView.destroy();
    root.remove();
    root = null;
    elements = null;
    enqueueInput = null;
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

    updateLocationActors(actorList, actors, enqueueInput);
  }

  function updateExecutingEvents(events) {
    const eventIds = new Set(events.map(event => String(event.id)));

    Array.from(elements.eventList.children).forEach(eventItem => {
      if (!eventIds.has(eventItem.dataset.eventId)) {
        eventItem.remove();
      }
    });

    events.forEach(event => {
      const eventItem = getOrCreateExecutingEventItem(event);
      eventItem.querySelector('[data-event-label]').textContent = formatExecutingEvent(event);

      if (!eventItem.isConnected) {
        elements.eventList.appendChild(eventItem);
      }
    });
  }

  function getOrCreateExecutingEventItem(event) {
    const existingItem = elements.eventList.querySelector(`[data-event-id="${event.id}"]`);
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

function createHeading(id, text) {
  const element = document.createElement('h2');
  element.id = id;
  element.textContent = text;
  return element;
}

function formatExecutingEvent(event) {
  return `${event.id}: ${event.name}: ${event.description}`;
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
