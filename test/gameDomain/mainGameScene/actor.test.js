import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Actor } from '../../../src/gameDomain/mainGameScene/actor.js';
import { getDefaultGridMap } from '../../../src/gameDomain/mainGameScene/gridMap.js';
import {
  LOCATION_IDS,
  findLocation,
} from '../../../src/gameDomain/mainGameScene/locations.js';

describe('A-UT-S01 automatic movement', () => {
  it('A-UT-S01-C01 chooses a random cell center inside the destination location', () => {
    // Arrange
    const gridMap = getDefaultGridMap();
    const destinationLocation = findLocation(LOCATION_IDS.GYM_FRONT_PARKING);
    const randomInt = createRandomIntSequence([
      0,
      6,
      0,
      0,
      0,
    ]);
    const actor = new Actor('actor-1', 'actor', LOCATION_IDS.HALL, {
      randomInt,
    });

    // Act
    actor.update({
      deltaTimeMs: 0,
      gameTimeHours: 3,
      gridMap,
    });
    const snapshot = actor.getSnapshot();

    // Assert
    assert.deepEqual(snapshot.movement.destination, {
      x: destinationLocation.area.x + 0.5,
      y: destinationLocation.area.y + 0.5,
    });
    assert.equal(
      gridMap.findLocationByPosition(snapshot.movement.destination).id,
      destinationLocation.id,
    );
    assert.notDeepEqual(
      snapshot.movement.destination,
      gridMap.getLocationCenter(destinationLocation.id),
    );
  });
});

function createRandomIntSequence(values) {
  let index = 0;
  return (min, max) => {
    const range = max - min + 1;
    const value = values[index] ?? 0;
    index += 1;
    return min + (value % range);
  };
}
