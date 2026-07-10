import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  INPUT_TYPES,
  TARGET_PREFIXES,
} from '../../../src/gameDomain/actions.js';
import { DialogueSystem } from '../../../src/gameDomain/conversationScene/dialogueSystem.js';

describe('DialogueSystem', () => {
  it('accepts one conversation start and rejects another while active', () => {
    const dialogueSystem = new DialogueSystem();

    dialogueSystem.beginFrame();
    const accepted = dialogueSystem.requestStart({
      script: createScript(),
      owner: {
        type: 'test',
        id: 'owner-1',
      },
    });
    const rejected = dialogueSystem.requestStart({
      script: createScript('second'),
      owner: {
        type: 'test',
        id: 'owner-2',
      },
    });

    assert.equal(accepted.acceptance, 'accepted');
    assert.equal(accepted.blocking, true);
    assert.equal(typeof accepted.requestId, 'string');
    assert.equal(rejected.acceptance, 'rejected');
    assert.equal(rejected.reason, 'conversationAlreadyActive');
    assert.equal(dialogueSystem.hasActiveSession(), true);
    assert.equal(
      dialogueSystem.getFrameControlState().gameplaySimulationBlocked,
      true,
    );
  });

  it('keeps simulation blocked on the conversation completion frame only', () => {
    const dialogueSystem = new DialogueSystem();
    let completionResult = null;

    dialogueSystem.beginFrame();
    dialogueSystem.requestStart({
      script: createScript(),
      owner: {
        type: 'test',
        id: 'owner-1',
      },
      onComplete: result => {
        completionResult = result;
      },
    });

    dialogueSystem.beginFrame();
    dialogueSystem.processInput([createConversationInput('next')]);
    assert.equal(dialogueSystem.hasActiveSession(), true);
    assert.equal(
      dialogueSystem.getFrameControlState().gameplaySimulationBlocked,
      true,
    );

    dialogueSystem.beginFrame();
    dialogueSystem.processInput([createConversationInput('next')]);

    assert.equal(dialogueSystem.hasActiveSession(), false);
    assert.deepEqual(completionResult, {
      scriptId: 'conversation-1',
      choiceId: null,
    });
    assert.equal(
      dialogueSystem.getFrameControlState().gameplaySimulationBlocked,
      true,
    );

    dialogueSystem.beginFrame();
    assert.equal(
      dialogueSystem.getFrameControlState().gameplaySimulationBlocked,
      false,
    );
  });

  it('disposes active conversation state', () => {
    const dialogueSystem = new DialogueSystem();

    dialogueSystem.beginFrame();
    dialogueSystem.requestStart({
      script: createScript(),
      owner: {
        type: 'test',
        id: 'owner-1',
      },
    });
    dialogueSystem.dispose();

    assert.equal(dialogueSystem.hasActiveSession(), false);
    assert.equal(dialogueSystem.createSnapshotFragment(), null);
    assert.equal(
      dialogueSystem.getFrameControlState().gameplaySimulationBlocked,
      false,
    );
  });
});

function createScript(id = 'conversation-1') {
  return {
    id,
    messages: [
      {
        speakerName: '話者',
        message: '最初のメッセージ',
      },
      {
        speakerName: '話者',
        message: '最後のメッセージ',
      },
    ],
    choice: null,
  };
}

function createConversationInput(action) {
  return {
    type: INPUT_TYPES.TARGET_ACTIVATE,
    targetId: `${TARGET_PREFIXES.CONVERSATION_SCENE}:${action}`,
  };
}
