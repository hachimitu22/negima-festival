import {
  createAccompanimentCompleteConversationSceneScript,
  createAccompanimentRequestConversationSceneScript,
} from './accompanimentConversationSceneScripts.js';
import { AccompanimentTask } from './accompanimentTask.js';

const ACCOMPANIMENT_INTERACTION_KINDS = Object.freeze({
  REQUEST: 'request',
  COMPLETE: 'complete',
});

class AccompanimentEvent {
  #id;
  #task;

  constructor(id, { companion, destination }) {
    this.#id = id;
    this.#task = new AccompanimentTask({ companion, destination });
  }

  createRequestInteraction() {
    return {
      kind: ACCOMPANIMENT_INTERACTION_KINDS.REQUEST,
      conversationSceneScript: createAccompanimentRequestConversationSceneScript(
        this.#task,
      ),
    };
  }

  createActorInteraction(actorId, currentLocationId) {
    if (
      !this.#task.isExecuting()
      || actorId !== this.#task.companion.id
      || currentLocationId !== this.#task.destination.id
    ) {
      return null;
    }

    return {
      kind: ACCOMPANIMENT_INTERACTION_KINDS.COMPLETE,
      conversationSceneScript: createAccompanimentCompleteConversationSceneScript(
        this.#task,
      ),
    };
  }

  completeInteraction(kind) {
    if (kind === ACCOMPANIMENT_INTERACTION_KINDS.REQUEST) {
      return this.#task.accept();
    }

    if (kind === ACCOMPANIMENT_INTERACTION_KINDS.COMPLETE) {
      return this.#task.complete();
    }

    return false;
  }

  isActorInteractionBlocked(actorId, currentLocationId) {
    return (
      this.#task.isExecuting()
      && actorId === this.#task.companion.id
      && currentLocationId !== this.#task.destination.id
    );
  }

  isExecuting() {
    return this.#task.isExecuting();
  }

  isSucceeded() {
    return this.#task.isSucceeded();
  }

  getCompanionActorId() {
    return this.#task.companion.id;
  }

  getCompanionSnapshot() {
    return { ...this.#task.companion };
  }

  getSnapshot() {
    const task = this.#task.getSnapshot();
    return {
      id: this.#id,
      type: 'accompaniment',
      name: '同行',
      description: `${task.companion.name}と${task.destination.name}へ移動`,
      ...task,
    };
  }
}

export {
  ACCOMPANIMENT_INTERACTION_KINDS,
  AccompanimentEvent,
};
