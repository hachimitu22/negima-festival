const CONVERSATION_SESSION_RESULTS = Object.freeze({
  ADVANCED: 'advanced',
  BLOCKED: 'blocked',
  COMPLETED: 'completed',
});

class ConversationSession {
  constructor(conversation) {
    this.choice = conversation.choice;
    this.messages = conversation.messages;
    this.messageIndex = 0;
  }

  next() {
    if (getConversationChoices(this.choice, this.messageIndex).length > 0) {
      return CONVERSATION_SESSION_RESULTS.BLOCKED;
    }

    const nextMessageIndex = this.messageIndex + 1;
    if (nextMessageIndex >= this.messages.length) {
      return CONVERSATION_SESSION_RESULTS.COMPLETED;
    }

    this.messageIndex = nextMessageIndex;
    return CONVERSATION_SESSION_RESULTS.ADVANCED;
  }

  selectChoice(choiceId) {
    if (!this.choice || this.choice.messageIndex !== this.messageIndex) {
      return false;
    }

    const selectedOption = this.choice.options.find(option => option.id === choiceId);
    if (!selectedOption) {
      return false;
    }

    this.messages = [
      ...this.messages.slice(0, this.messageIndex + 1),
      ...selectedOption.messages,
      ...this.messages.slice(this.messageIndex + 1),
    ];
    this.choice = null;
    this.messageIndex += 1;
    return true;
  }

  getSnapshot() {
    const message = this.messages[this.messageIndex];
    const choices = getConversationChoices(this.choice, this.messageIndex);
    return {
      speakerName: message.speakerName,
      messageIndex: this.messageIndex,
      messageCount: this.messages.length,
      message: message.message,
      choices,
      isLastMessage: choices.length === 0 && this.messageIndex === this.messages.length - 1,
    };
  }
}

function getConversationChoices(choice, messageIndex) {
  if (!choice || choice.messageIndex !== messageIndex) {
    return [];
  }

  return choice.options.map(option => ({
    id: option.id,
    label: option.label,
  }));
}

export {
  CONVERSATION_SESSION_RESULTS,
  ConversationSession,
};
