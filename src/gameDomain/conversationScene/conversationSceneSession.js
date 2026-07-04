const CONVERSATION_SCENE_SESSION_RESULTS = Object.freeze({
  ADVANCED: 'advanced',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
});

class ConversationSceneSession {
  #scriptId;
  #choice;
  #messages;
  #messageIndex;

  constructor(script) {
    this.#scriptId = script.id;
    this.#choice = script.choice;
    this.#messages = script.messages;
    this.#messageIndex = 0;
  }

  next() {
    if (getConversationSceneChoices(this.#choice, this.#messageIndex).length > 0) {
      return CONVERSATION_SCENE_SESSION_RESULTS.BLOCKED;
    }

    const nextMessageIndex = this.#messageIndex + 1;
    if (nextMessageIndex >= this.#messages.length) {
      return CONVERSATION_SCENE_SESSION_RESULTS.COMPLETED;
    }

    this.#messageIndex = nextMessageIndex;
    return CONVERSATION_SCENE_SESSION_RESULTS.ADVANCED;
  }

  selectChoice(choiceId) {
    if (!this.#choice || this.#choice.messageIndex !== this.#messageIndex) {
      return null;
    }

    const selectedOption = this.#choice.options.find(option => option.id === choiceId);
    if (!selectedOption) {
      return null;
    }

    this.#messages = [
      ...this.#messages.slice(0, this.#messageIndex + 1),
      ...selectedOption.messages,
      ...this.#messages.slice(this.#messageIndex + 1),
    ];
    this.#choice = null;
    this.#messageIndex += 1;
    return {
      scriptId: this.#scriptId,
      choiceId: selectedOption.id,
    };
  }

  getSnapshot() {
    const message = this.#messages[this.#messageIndex];
    const choices = getConversationSceneChoices(this.#choice, this.#messageIndex);
    return {
      speakerName: message.speakerName,
      messageIndex: this.#messageIndex,
      messageCount: this.#messages.length,
      message: message.message,
      choices,
      isLastMessage: (
        choices.length === 0
        && this.#messageIndex === this.#messages.length - 1
      ),
    };
  }
}

function getConversationSceneChoices(choice, messageIndex) {
  if (!choice || choice.messageIndex !== messageIndex) {
    return [];
  }

  return choice.options.map(option => ({
    id: option.id,
    label: option.label,
  }));
}

export {
  CONVERSATION_SCENE_SESSION_RESULTS,
  ConversationSceneSession,
};
