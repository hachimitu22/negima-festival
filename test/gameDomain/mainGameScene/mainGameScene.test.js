import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  INPUT_TYPES,
  MAIN_GAME_LAYER_IDS,
  SCENE_IDS,
  TARGET_PREFIXES,
} from '../../../src/gameDomain/actions.js';
import { MainGameScene } from '../../../src/gameDomain/mainGameScene/mainGameScene.js';
import { getDefaultGridMap } from '../../../src/gameDomain/mainGameScene/gridMap.js';
import { LOCATION_IDS } from '../../../src/gameDomain/mainGameScene/locations.js';

describe('MG-UT-S01 embedded conversation', () => {
  it('MG-UT-S01-C01 keeps the main scene active when an actor conversation starts', () => {
    // Arrange
    const scene = new MainGameScene();
    moveCharacterToGymArena(scene);

    // Act
    const sceneControl = updateScene(scene, {
      inputs: [createTargetInput(TARGET_PREFIXES.ACTOR, 'student-02')],
    });
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(sceneControl.pushedScenes.length, 0);
    assert.equal(snapshot.sceneId, SCENE_IDS.MAIN_GAME);
    assert.equal(snapshot.activeLayerId, MAIN_GAME_LAYER_IDS.CONVERSATION);
    assert.ok(snapshot.conversation);
  });

  it('MG-UT-S01-C04 stops game time on the conversation start frame', () => {
    // Arrange
    const scene = new MainGameScene();
    moveCharacterToGymArena(scene);
    const beforeSnapshot = scene.createSnapshot();

    // Act
    updateScene(scene, {
      deltaTimeMs: 5000,
      inputs: [createTargetInput(TARGET_PREFIXES.ACTOR, 'student-02')],
    });
    const afterSnapshot = scene.createSnapshot();

    // Assert
    assert.equal(
      afterSnapshot.gameTime.currentHours,
      beforeSnapshot.gameTime.currentHours,
    );
    assert.ok(afterSnapshot.conversation);
  });

  it('MG-UT-S01-C02 stops game time and ignores map input during a conversation', () => {
    // Arrange
    const scene = new MainGameScene();
    moveCharacterToGymArena(scene);
    updateScene(scene, {
      inputs: [createTargetInput(TARGET_PREFIXES.ACTOR, 'student-02')],
    });
    const beforeSnapshot = scene.createSnapshot();

    // Act
    updateScene(scene, {
      deltaTimeMs: 5000,
      inputs: [createMapPositionInput(22.5, 20.5)],
    });
    const afterSnapshot = scene.createSnapshot();

    // Assert
    assert.equal(
      afterSnapshot.gameTime.currentHours,
      beforeSnapshot.gameTime.currentHours,
    );
    assert.deepEqual(
      afterSnapshot.character.position,
      beforeSnapshot.character.position,
    );
    assert.ok(afterSnapshot.conversation);
  });

  it('MG-UT-S01-C03 clears the embedded conversation after conversation input completes it', () => {
    // Arrange
    const scene = new MainGameScene();
    moveCharacterToGymArena(scene);
    updateScene(scene, {
      inputs: [createTargetInput(TARGET_PREFIXES.ACTOR, 'student-02')],
    });

    // Act
    completeConversation(scene);
    const snapshot = scene.createSnapshot();

    // Assert
    assert.equal(snapshot.conversation, null);
    assert.equal(snapshot.activeLayerId, MAIN_GAME_LAYER_IDS.MAP);
  });

  it('MG-UT-S01-C05 resumes game time on the frame after conversation completion', () => {
    // Arrange
    const scene = new MainGameScene();
    moveCharacterToGymArena(scene);
    updateScene(scene, {
      inputs: [createTargetInput(TARGET_PREFIXES.ACTOR, 'student-02')],
    });
    const beforeCompletionSnapshot = scene.createSnapshot();

    // Act
    completeConversation(scene, { deltaTimeMs: 5000 });
    const completionFrameSnapshot = scene.createSnapshot();
    updateScene(scene, { deltaTimeMs: 1000 });
    const resumedFrameSnapshot = scene.createSnapshot();

    // Assert
    assert.equal(completionFrameSnapshot.conversation, null);
    assert.equal(
      completionFrameSnapshot.gameTime.currentHours,
      beforeCompletionSnapshot.gameTime.currentHours,
    );
    assert.ok(
      resumedFrameSnapshot.gameTime.currentHours
        > completionFrameSnapshot.gameTime.currentHours,
    );
  });
});

describe('MG-UT-S02 normal input routing', () => {
  it('MG-UT-S02-C01 applies cassiopeia input through player control routing', () => {
    // Arrange
    const scene = new MainGameScene();
    updateScene(scene, { deltaTimeMs: 60000 });
    const beforeSnapshot = scene.createSnapshot();

    // Act
    updateScene(scene, {
      inputs: [{
        type: INPUT_TYPES.TARGET_ACTIVATE,
        targetId: TARGET_PREFIXES.CASSIOPEIA,
      }],
    });
    const afterSnapshot = scene.createSnapshot();

    // Assert
    assert.equal(beforeSnapshot.gameTime.currentHours, 30);
    assert.equal(afterSnapshot.gameTime.currentHours, 6);
    assert.equal(afterSnapshot.loop.count, beforeSnapshot.loop.count + 1);
    assert.equal(
      afterSnapshot.character.magicPower.current,
      beforeSnapshot.character.magicPower.current
        - afterSnapshot.loop.cassiopeiaMagicPowerCost,
    );
  });
});

function moveCharacterToGymArena(scene) {
  const gymArenaCenter = getDefaultGridMap().getLocationCenter(
    LOCATION_IDS.GYM_ARENA,
  );
  updateScene(scene, {
    inputs: [createMapPositionInput(gymArenaCenter.x, gymArenaCenter.y)],
  });
  updateScene(scene, { deltaTimeMs: 2500 });
  assert.equal(
    scene.createSnapshot().character.location.id,
    LOCATION_IDS.GYM_ARENA,
  );
}

function completeConversation(scene, { deltaTimeMs = 0 } = {}) {
  for (let count = 0; count < 30; count += 1) {
    const conversation = scene.createSnapshot().conversation;
    if (!conversation) {
      return;
    }

    const action = conversation.choices.length > 0
      ? `choice:${conversation.choices[0].id}`
      : 'next';
    updateScene(scene, {
      deltaTimeMs,
      inputs: [createTargetInput(TARGET_PREFIXES.CONVERSATION_SCENE, action)],
    });
  }

  assert.fail('Conversation did not complete within the expected input count.');
}

function updateScene(scene, { inputs = [], deltaTimeMs = 0 } = {}) {
  const sceneControl = createSceneControl();
  scene.update({
    context: {
      inputs,
      deltaTimeMs,
      frameCount: 1,
      targetFrameTimeMs: 1000 / 60,
    },
    sceneControl,
  });
  return sceneControl;
}

function createSceneControl() {
  const pushedScenes = [];
  return {
    pushedScenes,
    pushScene(scene) {
      pushedScenes.push(scene);
    },
  };
}

function createMapPositionInput(x, y) {
  return createTargetInput(TARGET_PREFIXES.MAP_POSITION, `${x},${y}`);
}

function createTargetInput(prefix, value) {
  return {
    type: INPUT_TYPES.TARGET_ACTIVATE,
    targetId: `${prefix}:${value}`,
  };
}
