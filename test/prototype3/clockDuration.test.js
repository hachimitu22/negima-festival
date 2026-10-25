import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import ClockDuration from '../../src/prototype3/scenes/mainScene/clockDuration.js';

describe('ClockDuration', () => {
  test('引数なしは0時間0分になる', () => {
    // Arrange

    // Act
    const duration = new ClockDuration();

    // Assert
    assert.equal(duration.hour, 0);
    assert.equal(duration.min, 0);
  });

  test('分だけを指定すると時は0になる', () => {
    // Arrange
    const input = { min: 90 };

    // Act
    const duration = new ClockDuration(input);

    // Assert
    assert.equal(duration.hour, 0);
    assert.equal(duration.min, 90);
  });

  test('時だけを指定すると分は0になる', () => {
    // Arrange
    const input = { hour: 25 };

    // Act
    const duration = new ClockDuration(input);

    // Assert
    assert.equal(duration.hour, 25);
    assert.equal(duration.min, 0);
  });

  test('時と分を同時に指定できる', () => {
    // Arrange
    const input = { hour: 1, min: 30 };

    // Act
    const duration = new ClockDuration(input);

    // Assert
    assert.equal(duration.hour, 1);
    assert.equal(duration.min, 30);
  });

  test('生成後の時間量を書き換えられない', () => {
    // Arrange
    const duration = new ClockDuration({ hour: 1, min: 30 });

    // Act
    const changeHour = () => { duration.hour = 2; };
    const changeMin = () => { duration.min = 60; };

    // Assert
    assert.throws(changeHour, TypeError);
    assert.throws(changeMin, TypeError);
    assert.equal(duration.hour, 1);
    assert.equal(duration.min, 30);
  });

  for (const [name, min] of [
    ['負数の分数を拒否する', -1],
    ['小数の分数を拒否する', 0.5],
    ['文字列の分数を拒否する', '30'],
    ['NaNの分数を拒否する', NaN],
    ['無限大の分数を拒否する', Infinity],
  ]) {
    test(name, () => {
      // Arrange
      const input = { min };

      // Act
      const create = () => new ClockDuration(input);

      // Assert
      assert.throws(create, RangeError);
    });
  }

  for (const [name, hour] of [
    ['負数の時間数を拒否する', -1],
    ['小数の時間数を拒否する', 0.5],
    ['文字列の時間数を拒否する', '2'],
    ['NaNの時間数を拒否する', NaN],
    ['無限大の時間数を拒否する', Infinity],
  ]) {
    test(name, () => {
      // Arrange
      const input = { hour };

      // Act
      const create = () => new ClockDuration(input);

      // Assert
      assert.throws(create, RangeError);
    });
  }
});
