import { INPUT_TYPES, MAIN_GAME_LAYER_IDS, TARGET_PREFIXES } from '../../../gameDomain/actions.js';
import { createKnownEventsView } from './knownEventsView.js';
import { createStatusView } from './statusView.js';

function createMainGameSceneView(rootElement, options) {
  const statusView = createStatusView();
  const knownEventsView = createKnownEventsView();
  let root = null;
  let elements = null;
  let enqueueInput = null;
  let activeLayerId = null;

  mount(rootElement, options);

  function mount(rootElement, options) {
    enqueueInput = options.enqueueInput;
    root = document.createElement('section');
    root.id = 'main-game-scene';

    elements = {
      menu: createRegion(createList('menu')),
      back: createRegion(createDiv('back')),
      mapList: createRegion(createDiv('map-list')),
      conversation: createRegion(createDiv('conversation')),
      eventList: createRegion(createList('event-list')),
      succeededEventList: createRegion(createList('succeeded-event-list')),
      failedEventList: createRegion(createList('failed-event-list')),
    };

    statusView.mount(root, options);
    knownEventsView.mount(root);
    Object.values(elements).forEach(region => {
      root.append(region.anchor, region.element);
    });
    rootElement.appendChild(root);
  }

  function init(snapshot) {
    statusView.init(snapshot);
    knownEventsView.init(snapshot.knownEvents);
    knownEventsView.setHidden(snapshot.activeLayerId === MAIN_GAME_LAYER_IDS.CONVERSATION);
    updateSceneContent(snapshot);
  }

  function update(snapshot) {
    statusView.update(snapshot);
    knownEventsView.update(snapshot.knownEvents);
    knownEventsView.setHidden(snapshot.activeLayerId === MAIN_GAME_LAYER_IDS.CONVERSATION);
    updateSceneContent(snapshot);
  }

  function updateSceneContent(snapshot) {
    updateActiveLayer(snapshot.activeLayerId);

    if (snapshot.activeLayerId === MAIN_GAME_LAYER_IDS.MENU) {
      updateLayerMenu(snapshot);
    } else if (snapshot.activeLayerId === MAIN_GAME_LAYER_IDS.MAP) {
      updateBackButton();
      updateMap(
        snapshot.mapLocations,
        snapshot.character.location,
        snapshot.persons,
      );
    } else if (snapshot.activeLayerId === MAIN_GAME_LAYER_IDS.CONVERSATION) {
      updateConversation(snapshot.activeConversation);
    } else if (snapshot.activeLayerId === MAIN_GAME_LAYER_IDS.EXECUTING_EVENTS) {
      updateBackButton();
      updateExecutingEvents(snapshot.executingEvents);
    } else if (snapshot.activeLayerId === MAIN_GAME_LAYER_IDS.SUCCEEDED_EVENTS) {
      updateBackButton();
      updateCompletedEvents(elements.succeededEventList.element, snapshot.succeededEvents, '成功');
    } else if (snapshot.activeLayerId === MAIN_GAME_LAYER_IDS.FAILED_EVENTS) {
      updateBackButton();
      updateCompletedEvents(elements.failedEventList.element, snapshot.failedEvents, '失敗');
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
    knownEventsView.destroy();
    root.remove();
    root = null;
    elements = null;
    enqueueInput = null;
    activeLayerId = null;
  }

  function updateActiveLayer(nextLayerId) {
    if (activeLayerId === nextLayerId) {
      return;
    }

    detachInactiveRegions(nextLayerId);
    attachActiveRegions(nextLayerId);
    activeLayerId = nextLayerId;
  }

  function detachInactiveRegions(layerId) {
    getInactiveRegions(layerId).forEach(region => {
      region.element.remove();
    });
  }

  function attachActiveRegions(layerId) {
    getActiveRegions(layerId).forEach(region => {
      if (!region.element.isConnected) {
        region.anchor.after(region.element);
      }
    });
  }

  function getActiveRegions(layerId) {
    if (layerId === MAIN_GAME_LAYER_IDS.MENU) {
      return [elements.menu];
    }

    if (layerId === MAIN_GAME_LAYER_IDS.EXECUTING_EVENTS) {
      return [elements.back, elements.eventList];
    }

    if (layerId === MAIN_GAME_LAYER_IDS.MAP) {
      return [elements.back, elements.mapList];
    }

    if (layerId === MAIN_GAME_LAYER_IDS.CONVERSATION) {
      return [elements.conversation];
    }

    if (layerId === MAIN_GAME_LAYER_IDS.SUCCEEDED_EVENTS) {
      return [elements.back, elements.succeededEventList];
    }

    if (layerId === MAIN_GAME_LAYER_IDS.FAILED_EVENTS) {
      return [elements.back, elements.failedEventList];
    }

    return [];
  }

  function getInactiveRegions(layerId) {
    const activeRegions = new Set(getActiveRegions(layerId));
    return Object.values(elements).filter(region => !activeRegions.has(region));
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

  function updateMap(locations, currentLocation, persons = []) {
    const groups = groupLocations(locations);
    const groupNames = new Set(groups.map(group => group.name));
    const personsByLocationId = groupPeopleByLocationId(persons);

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
        personsByLocationId,
      );

      if (!groupElement.isConnected) {
        elements.mapList.element.appendChild(groupElement);
      }
    });
  }

  function groupPeopleByLocationId(people) {
    const peopleByLocationId = new Map();

    people.forEach(person => {
      const locationId = person.location?.id;
      if (!locationId) {
        return;
      }

      const locationPeople = peopleByLocationId.get(locationId) ?? [];
      locationPeople.push(person);
      peopleByLocationId.set(locationId, locationPeople);
    });

    return peopleByLocationId;
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
    personsByLocationId,
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
        personsByLocationId.get(location.id) ?? [],
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
    const personList = document.createElement('menu');

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
    personList.dataset.locationPersons = '';

    locationItem.append(locationButton, personList);
    return locationItem;
  }

  function updateLocationItem(locationItem, location, currentLocation, persons) {
    const locationButton = locationItem.querySelector('[data-location-button]');
    const personList = locationItem.querySelector('[data-location-persons]');
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

    updateLocationPersons(personList, persons, isCurrentLocation, enqueueInput);
  }

  function updateConversation(conversation) {
    if (!conversation) {
      elements.conversation.element.replaceChildren();
      return;
    }

    const conversationView = getOrCreateConversationView();
    const choices = conversation.choices ?? [];
    conversationView.speaker.textContent = conversation.speakerName;
    conversationView.message.textContent = conversation.message;
    conversationView.progress.textContent = `${conversation.messageIndex + 1} / ${conversation.messageCount}`;
    conversationView.next.textContent = conversation.isLastMessage ? '会話を終える' : '次へ';
    conversationView.progress.hidden = choices.length > 0;
    conversationView.next.hidden = choices.length > 0;
    updateConversationChoices(conversationView.choices, choices);
  }

  function getOrCreateConversationView() {
    let speaker = elements.conversation.element.querySelector('[data-conversation-speaker]');
    if (speaker) {
      return {
        speaker,
        message: elements.conversation.element.querySelector('[data-conversation-message]'),
        progress: elements.conversation.element.querySelector('[data-conversation-progress]'),
        choices: elements.conversation.element.querySelector('[data-conversation-choices]'),
        next: elements.conversation.element.querySelector('[data-conversation-next]'),
      };
    }

    speaker = document.createElement('h2');
    const message = document.createElement('p');
    const progress = document.createElement('p');
    const choices = document.createElement('div');
    const next = document.createElement('button');

    speaker.dataset.conversationSpeaker = '';
    message.dataset.conversationMessage = '';
    progress.dataset.conversationProgress = '';
    choices.dataset.conversationChoices = '';
    next.dataset.conversationNext = '';
    next.type = 'button';
    next.addEventListener('click', () => {
      enqueueInput({
        type: INPUT_TYPES.TARGET_ACTIVATE,
        targetId: createTargetId(TARGET_PREFIXES.CONVERSATION, 'next'),
      });
    });

    elements.conversation.element.append(speaker, message, progress, choices, next);
    return {
      speaker,
      message,
      progress,
      choices,
      next,
    };
  }

  function updateConversationChoices(choiceList, choices) {
    const choiceIds = new Set(choices.map(choice => choice.id));

    Array.from(choiceList.children).forEach(choiceButton => {
      if (!choiceIds.has(choiceButton.dataset.conversationChoiceId)) {
        choiceButton.remove();
      }
    });

    choices.forEach(choice => {
      const choiceButton = getOrCreateConversationChoice(choiceList, choice);
      choiceButton.textContent = choice.label;

      if (!choiceButton.isConnected) {
        choiceList.appendChild(choiceButton);
      }
    });

    choiceList.hidden = choices.length === 0;
  }

  function getOrCreateConversationChoice(choiceList, choice) {
    const existingChoice = Array.from(choiceList.children)
      .find(choiceButton => choiceButton.dataset.conversationChoiceId === choice.id);
    if (existingChoice) {
      return existingChoice;
    }

    const choiceButton = document.createElement('button');
    choiceButton.type = 'button';
    choiceButton.dataset.conversationChoiceId = choice.id;
    choiceButton.addEventListener('click', () => {
      enqueueInput({
        type: INPUT_TYPES.TARGET_ACTIVATE,
        targetId: createTargetId(TARGET_PREFIXES.CONVERSATION, `choice:${choice.id}`),
      });
    });
    return choiceButton;
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
    const action = createEventAction(event);

    eventItem.id = `event-${event.id}`;
    eventItem.dataset.eventId = String(event.id);

    label.dataset.eventLabel = '';
    eventItem.appendChild(label);

    if (action) {
      eventItem.appendChild(action);
    }

    return eventItem;
  }

  function createEventAction(event) {
    if (event.type === 'click') {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '成功';
      button.addEventListener('click', () => {
        enqueueInput({
          type: INPUT_TYPES.TARGET_ACTIVATE,
          targetId: createTargetId(TARGET_PREFIXES.EVENT, event.id),
        });
      });
      return button;
    }

    if (event.type === 'input') {
      const form = document.createElement('form');
      const input = document.createElement('input');
      const button = document.createElement('button');

      input.type = 'text';
      input.value = event.inputValue ?? '';
      input.placeholder = event.targetInput;
      input.addEventListener('input', () => {
        enqueueInput({
          type: INPUT_TYPES.TARGET_INPUT_CHANGE,
          targetId: createTargetId(TARGET_PREFIXES.EVENT, event.id),
          value: input.value,
        });
      });

      button.type = 'submit';
      button.textContent = '送信';

      form.addEventListener('submit', submitEvent => {
        submitEvent.preventDefault();
        enqueueInput({
          type: INPUT_TYPES.TARGET_SUBMIT,
          targetId: createTargetId(TARGET_PREFIXES.EVENT, event.id),
        });
      });

      form.append(input, button);
      return form;
    }

    return null;
  }

  function updateCompletedEvents(eventList, events, statusText) {
    const eventIds = new Set(events.map(event => String(event.id)));

    Array.from(eventList.children).forEach(eventItem => {
      if (!eventIds.has(eventItem.dataset.eventId)) {
        eventItem.remove();
      }
    });

    events.forEach(event => {
      const eventItem = getOrCreateCompletedEventItem(eventList, event);
      eventItem.textContent = formatCompletedEvent(event, statusText);

      if (!eventItem.isConnected) {
        eventList.appendChild(eventItem);
      }
    });
  }

  function getOrCreateCompletedEventItem(eventList, event) {
    const existingItem = eventList.querySelector(`[data-event-id="${event.id}"]`);
    if (existingItem) {
      return existingItem;
    }

    const eventItem = document.createElement('li');
    eventItem.dataset.eventId = String(event.id);
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
  return `${event.id}: ${event.name}: ${event.description} (残り時間: ${event.remainingSeconds}秒)`;
}

function formatCompletedEvent(event, statusText) {
  return `${event.id}: ${event.name}: ${event.description} (${statusText})`;
}

function updateLocationPersons(personList, persons, isCurrentLocation, enqueueInput) {
  const personIds = new Set(persons.map(person => person.id));

  Array.from(personList.children).forEach(personItem => {
    if (!personIds.has(personItem.dataset.personId)) {
      personItem.remove();
    }
  });

  persons.forEach(person => {
    const personItem = getOrCreatePersonItem(personList, person, enqueueInput);
    const personButton = personItem.querySelector('[data-person-button]');
    const personAffection = personItem.querySelector('[data-person-affection]');
    const hasAffection = typeof person.affection === 'number';
    const affectionText = hasAffection ? `${person.affection}` : '';
    const disabled = !isCurrentLocation;

    if (personButton.textContent !== person.name) {
      personButton.textContent = person.name;
    }

    if (personButton.disabled !== disabled) {
      personButton.disabled = disabled;
    }

    if (personAffection.textContent !== affectionText) {
      personAffection.textContent = affectionText;
    }

    if (personAffection.hidden !== !hasAffection) {
      personAffection.hidden = !hasAffection;
    }

    if (!personItem.isConnected) {
      personList.appendChild(personItem);
    }
  });
}

function getOrCreatePersonItem(personList, person, enqueueInput) {
  const existingItem = personList.querySelector(`[data-person-id="${person.id}"]`);
  if (existingItem) {
    return existingItem;
  }

  const personItem = document.createElement('li');
  const personButton = document.createElement('button');
  const personAffection = document.createElement('span');
  personButton.type = 'button';
  personButton.textContent = person.name;
  personButton.dataset.personButton = '';
  personButton.setAttribute('compact', '');
  personButton.addEventListener('click', () => {
    enqueueInput({
      type: INPUT_TYPES.TARGET_ACTIVATE,
      targetId: createTargetId(TARGET_PREFIXES.PERSON, person.id),
    });
  });
  personAffection.dataset.personAffection = '';
  personItem.dataset.personId = person.id;
  personItem.append(personButton, personAffection);
  return personItem;
}

function createTargetId(prefix, id) {
  return `${prefix}:${id}`;
}

export {
  createMainGameSceneView,
};
