import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  EventIdSequence,
} from '../../../../src/gameDomain/mainGameScene/event/eventIdSequence.js';

describe('EIS-UT-S01 event IDの採番', () => {
  it('EIS-UT-S01-C01 peekでは次のIDを消費しない', () => {
    // Arrange
    const sequence = new EventIdSequence();

    // Act
    const firstId = sequence.peek();
    const secondId = sequence.peek();

    // Assert
    assert.equal(firstId, 0);
    assert.equal(secondId, 0);
  });

  it('EIS-UT-S01-C02 nextではIDを取得して採番を進める', () => {
    // Arrange
    const sequence = new EventIdSequence();

    // Act
    const currentId = sequence.next();
    const nextId = sequence.peek();

    // Assert
    assert.equal(currentId, 0);
    assert.equal(nextId, 1);
  });
});
