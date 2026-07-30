import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { GameEngine } from '../../src/gameEngine/gameEngine.js';

/** Create a scene double that records update contexts. */
function createSceneDouble() {
  const updates = [];
  return {
    updates,
    update({ context }) {
      updates.push({
        deltaFrames: context.deltaFrames,
        deltaTimeMs: context.deltaTimeMs,
        frameCount: context.frameCount,
        inputs: context.inputs.map((input) => ({ ...input })),
      });
    },
    createSnapshot() {
      return {
        updateCount: updates.length,
        lastInputs: updates.at(-1)?.inputs ?? [],
      };
    },
  };
}

/** Create a view double that records init and render snapshots. */
function createViewDouble() {
  const records = {
    configureContext: null,
    initSnapshots: [],
    renderSnapshots: [],
  };
  return {
    records,
    configure(context) {
      records.configureContext = context;
    },
    init(snapshot) {
      records.initSnapshots.push(snapshot);
    },
    render(snapshot) {
      records.renderSnapshots.push(snapshot);
    },
    destroy() {},
  };
}

describe('GameEngine', () => {
  test('GE-UT-S01-C01 stepは入力なしで時間経過なしの更新と描画を1回行う', () => {
    // Arrange
    const scene = createSceneDouble();
    const view = createViewDouble();
    const engine = new GameEngine({ initialScene: scene, view });
    engine.start();

    // Act
    engine.step();

    // Assert
    assert.equal(scene.updates.length, 1);
    assert.equal(scene.updates[0].deltaTimeMs, 0);
    assert.equal(scene.updates[0].deltaFrames, 0);
    assert.deepEqual(scene.updates[0].inputs, []);
    assert.deepEqual(view.records.renderSnapshots.at(-1), { updateCount: 1, lastInputs: [] });
  });

  test('GE-UT-S01-C02 stepは指定入力をsceneへ渡して更新後snapshotを描画する', () => {
    // Arrange
    const scene = createSceneDouble();
    const view = createViewDouble();
    const engine = new GameEngine({ initialScene: scene, view });
    engine.start();

    // Act
    engine.step({ type: 'choice.select', choiceId: 'start' });

    // Assert
    assert.deepEqual(scene.updates[0].inputs, [{ type: 'choice.select', choiceId: 'start' }]);
    assert.deepEqual(view.records.renderSnapshots.at(-1), {
      updateCount: 1,
      lastInputs: [{ type: 'choice.select', choiceId: 'start' }],
    });
  });

  test('GE-UT-S01-C03 viewは入力登録後に単発更新を要求できる', () => {
    // Arrange
    const scene = createSceneDouble();
    const view = createViewDouble();
    const engine = new GameEngine({ initialScene: scene, view });
    engine.start();

    // Act
    view.records.configureContext.enqueueInput({ type: 'story.advance' });
    view.records.configureContext.requestRenderStep();

    // Assert
    assert.deepEqual(scene.updates[0].inputs, [{ type: 'story.advance' }]);
    assert.equal(view.records.renderSnapshots.at(-1).updateCount, 1);
  });

  test('GE-UT-S01-C04 updateは従来どおり経過時間を使って更新する', () => {
    // Arrange
    const scene = createSceneDouble();
    const view = createViewDouble();
    const engine = new GameEngine({ initialScene: scene, view });
    engine.start();

    // Act
    engine.update(100);
    engine.update(150);

    // Assert
    assert.equal(scene.updates.length, 2);
    assert.equal(scene.updates[0].deltaTimeMs, 0);
    assert.equal(scene.updates[1].deltaTimeMs, 50);
    assert.equal(view.records.renderSnapshots.at(-1).updateCount, 2);
  });

  test('GE-UT-S01-C05 Canonical entry pointは常時animation frame loopを開始しない', () => {
    // Arrange
    const entryPoint = readFileSync(new URL('../../index.js', import.meta.url), 'utf8');

    // Assert
    assert.equal(entryPoint.includes('requestAnimationFrame'), false);
  });
});
