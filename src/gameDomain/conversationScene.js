import { INPUT_TYPES, SCENE_IDS, TARGET_PREFIXES } from './actions.js';
import {
  CONVERSATION_SESSION_RESULTS,
  ConversationSession,
} from './conversationSession.js';

class ConversationScene {
  constructor({ conversation, statusSnapshot, onComplete }) {
    this.session = new ConversationSession(conversation);
    this.statusSnapshot = statusSnapshot;
    this.onComplete = onComplete;
    this.result = {
      conversationId: conversation.id,
      choiceId: null,
    };
    this.isCompleted = false;
  }

  update({
    context,
    sceneControl: { popScene },
  }) {
    const inputs = context.inputs ?? [];

    for (const input of inputs) {
      if (this.processInput(input, popScene)) {
        break;
      }
    }
  }

  processInput(input, popScene) {
    if (input.type !== INPUT_TYPES.TARGET_ACTIVATE) {
      return false;
    }

    const action = getTargetValue(input.targetId, TARGET_PREFIXES.CONVERSATION);
    if (!action) {
      return false;
    }

    return this.handleConversationAction(action, popScene);
  }

  handleConversationAction(action, popScene) {
    const choiceId = getTargetValue(action, 'choice');
    if (choiceId) {
      const result = this.session.selectChoice(choiceId);
      if (result) {
        this.result = result;
      }
      return false;
    }

    if (action !== 'next') {
      return false;
    }

    const result = this.session.next();
    if (result !== CONVERSATION_SESSION_RESULTS.COMPLETED || this.isCompleted) {
      return false;
    }

    this.isCompleted = true;
    if (typeof this.onComplete === 'function') {
      this.onComplete(this.result);
    }
    if (typeof popScene === 'function') {
      popScene();
    }
    return true;
  }

  createSnapshot() {
    return {
      ...this.statusSnapshot,
      sceneId: SCENE_IDS.CONVERSATION,
      conversation: this.session.getSnapshot(),
    };
  }
}

function getTargetValue(targetId, prefix) {
  const expectedPrefix = `${prefix}:`;
  if (typeof targetId !== 'string' || !targetId.startsWith(expectedPrefix)) {
    return null;
  }

  return targetId.slice(expectedPrefix.length);
}

export {
  ConversationScene,
};
