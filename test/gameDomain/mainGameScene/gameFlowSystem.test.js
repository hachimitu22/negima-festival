import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  INPUT_TYPES,
  MAIN_GAME_LAYER_IDS,
  TARGET_PREFIXES,
} from '../../../src/gameDomain/actions.js';
import { DialogueSystem } from '../../../src/gameDomain/conversationScene/dialogueSystem.js';
import {
  GAME_FLOW_INPUT_MODES,
  GameFlowSystem,
} from '../../../src/gameDomain/mainGameScene/gameFlowSystem.js';

describe('GFS-UT-S01 frame-start input mode', () => {
  it('GFS-UT-S01-C01 enables gameplay input when no conversation is active', () => {
    // Arrange
    const dialogue = createDialogueSystem();
    const system = new GameFlowSystem();
    dialogue.beginFrame();

    // Act
    system.beginFrame({ dialogue });
    const controlContext = system.createControlContext({ dialogue });
    const snapshot = system.createSnapshotFragment({ dialogue });

    // Assert
    assert.equal(controlContext.inputMode, GAME_FLOW_INPUT_MODES.GAMEPLAY);
    assert.equal(system.canProcessFieldInput(), true);
    assert.equal(controlContext.gameplayInputEnabled, true);
    assert.equal(controlContext.playerControlEnabled, true);
    assert.equal(controlContext.gameplaySimulationEnabled, true);
    assert.equal(snapshot.activeLayerId, MAIN_GAME_LAYER_IDS.MAP);
  });

  it('GFS-UT-S01-C02 disables field input when a conversation is active at frame start', () => {
    // Arrange
    const dialogue = createDialogueSystem();
    const system = new GameFlowSystem();
    startConversation(dialogue);
    dialogue.beginFrame();

    // Act
    system.beginFrame({ dialogue });
    const controlContext = system.createControlContext({ dialogue });
    const snapshot = system.createSnapshotFragment({ dialogue });

    // Assert
    assert.equal(controlContext.inputMode, GAME_FLOW_INPUT_MODES.DIALOGUE);
    assert.equal(system.canProcessFieldInput(), false);
    assert.equal(controlContext.gameplayInputEnabled, false);
    assert.equal(controlContext.playerControlEnabled, false);
    assert.equal(controlContext.gameplaySimulationEnabled, false);
    assert.equal(snapshot.activeLayerId, MAIN_GAME_LAYER_IDS.CONVERSATION);
  });
});

describe('GFS-UT-S02 conversation start and completion frames', () => {
  it('GFS-UT-S02-C01 disables gameplay input and simulation on a conversation start frame', () => {
    // Arrange
    const dialogue = createDialogueSystem();
    const system = new GameFlowSystem();
    dialogue.beginFrame();
    system.beginFrame({ dialogue });

    // Act
    startConversation(dialogue);
    const controlContext = system.createControlContext({ dialogue });
    const snapshot = system.createSnapshotFragment({ dialogue });

    // Assert
    assert.equal(controlContext.inputMode, GAME_FLOW_INPUT_MODES.GAMEPLAY);
    assert.equal(system.canProcessFieldInput(), true);
    assert.equal(controlContext.gameplayInputEnabled, false);
    assert.equal(controlContext.playerControlEnabled, false);
    assert.equal(controlContext.gameplaySimulationEnabled, false);
    assert.equal(snapshot.activeLayerId, MAIN_GAME_LAYER_IDS.CONVERSATION);
  });

  it('GFS-UT-S02-C02 disables field input and simulation on a conversation completion frame', () => {
    // Arrange
    const dialogue = createDialogueSystem();
    const system = new GameFlowSystem();
    startConversation(dialogue);
    dialogue.beginFrame();
    system.beginFrame({ dialogue });

    // Act
    dialogue.processInput([
      createConversationInput('next'),
    ]);
    const controlContext = system.createControlContext({ dialogue });
    const snapshot = system.createSnapshotFragment({ dialogue });

    // Assert
    assert.equal(controlContext.inputMode, GAME_FLOW_INPUT_MODES.DIALOGUE);
    assert.equal(system.canProcessFieldInput(), false);
    assert.equal(controlContext.gameplayInputEnabled, false);
    assert.equal(controlContext.playerControlEnabled, false);
    assert.equal(controlContext.gameplaySimulationEnabled, false);
    assert.equal(snapshot.activeLayerId, MAIN_GAME_LAYER_IDS.MAP);
  });
});

function createDialogueSystem() {
  return new DialogueSystem();
}

function startConversation(dialogue) {
  return dialogue.requestStart({
    script: {
      id: 'test-conversation',
      messages: [
        {
          speakerName: 'Speaker',
          message: 'Message',
        },
      ],
    },
  });
}

function createConversationInput(action) {
  return {
    type: INPUT_TYPES.TARGET_ACTIVATE,
    targetId: `${TARGET_PREFIXES.CONVERSATION_SCENE}:${action}`,
  };
}
