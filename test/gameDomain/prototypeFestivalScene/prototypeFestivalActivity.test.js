import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  PROTOTYPE_ACTIVITY_IDS,
  canStartPrototypeActivity,
  findPrototypeActivity,
  getPrototypeActivityAvailability,
} from '../../../src/gameDomain/prototypeFestivalScene/prototypeFestivalActivity.js';

/** PT-UT-S30の予定行動受付判定テストを登録する。 */
function registerActivityAvailabilityTests() {
  /** 定時イベントの開始前、通常受付、途中参加、終了を区別する。 */
  function classifiesScheduledEventAvailability() {
    const activity = findPrototypeActivity(PROTOTYPE_ACTIVITY_IDS.OPENING_STAGE);
    assert.equal(getPrototypeActivityAvailability(activity, 19), 'upcoming');
    assert.equal(getPrototypeActivityAvailability(activity, 20), 'open');
    assert.equal(getPrototypeActivityAvailability(activity, 25), 'open');
    assert.equal(getPrototypeActivityAvailability(activity, 26), 'partial');
    assert.equal(getPrototypeActivityAvailability(activity, 35), 'closed');
  }

  /** 出店は営業時間内をすべて通常受付として扱う。 */
  function classifiesStallAvailability() {
    const activity = findPrototypeActivity(PROTOTYPE_ACTIVITY_IDS.FOOD_STALL);
    assert.equal(getPrototypeActivityAvailability(activity, 0), 'open');
    assert.equal(getPrototypeActivityAvailability(activity, 89), 'open');
    assert.equal(getPrototypeActivityAvailability(activity, 90), 'closed');
  }

  /** 通常受付と途中参加だけを開始可能にする。 */
  function acceptsStartableAvailability() {
    assert.equal(canStartPrototypeActivity('open'), true);
    assert.equal(canStartPrototypeActivity('partial'), true);
    assert.equal(canStartPrototypeActivity('upcoming'), false);
    assert.equal(canStartPrototypeActivity('closed'), false);
  }

  test('PT-UT-S30-C01 定時イベントの受付状態を時刻から判定する', classifiesScheduledEventAvailability);
  test('PT-UT-S30-C02 出店の営業時間を判定する', classifiesStallAvailability);
  test('PT-UT-S30-C03 開始可能な受付状態を限定する', acceptsStartableAvailability);
}

describe('PT-UT-S30 PrototypeFestivalActivity 受付判定', registerActivityAvailabilityTests);
