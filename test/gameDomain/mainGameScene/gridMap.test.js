import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GridMap } from '../../../src/gameDomain/mainGameScene/gridMap.js';
import { LOCATIONS } from '../../../src/gameDomain/mainGameScene/locations.js';

describe('GM-UT-S01 cell ownership and passability', () => {
  it('GM-UT-S01-C01 returns the owning location for a position inside a location area', () => {
    // Arrange
    const gridMap = createGridMap([
      createLocation('a', ['b'], { x: 0, y: 0, width: 2, height: 2 }),
      createLocation('b', ['a'], { x: 2, y: 0, width: 2, height: 2 }),
    ]);

    // Act
    const location = gridMap.findLocationByPosition({ x: 1.5, y: 1.5 });

    // Assert
    assert.equal(location.id, 'a');
  });

  it('GM-UT-S01-C02 returns null for a position in an empty cell', () => {
    // Arrange
    const gridMap = createGridMap([
      createLocation('a', [], { x: 0, y: 0, width: 2, height: 2 }),
    ]);

    // Act
    const location = gridMap.findLocationByPosition({ x: 3.5, y: 3.5 });

    // Assert
    assert.equal(location, null);
  });

  it('GM-UT-S01-C03 allows travel across a connected adjacent location boundary', () => {
    // Arrange
    const gridMap = createGridMap([
      createLocation('a', ['b'], { x: 0, y: 0, width: 2, height: 2 }),
      createLocation('b', ['a'], { x: 2, y: 0, width: 2, height: 2 }),
    ]);

    // Act
    const path = gridMap.findPath({ x: 0.5, y: 0.5 }, { x: 3.5, y: 0.5 });

    // Assert
    assert.notEqual(path, null);
    assert.deepEqual(path.at(-1), { x: 3.5, y: 0.5 });
  });

  it('GM-UT-S01-C04 blocks travel across an unconnected adjacent location boundary', () => {
    // Arrange
    const gridMap = createGridMap([
      createLocation('a', [], { x: 0, y: 0, width: 2, height: 2 }),
      createLocation('b', [], { x: 2, y: 0, width: 2, height: 2 }),
    ]);

    // Act
    const path = gridMap.findPath({ x: 0.5, y: 0.5 }, { x: 3.5, y: 0.5 });

    // Assert
    assert.equal(path, null);
  });
});

describe('GM-UT-S02 pathfinding', () => {
  it('GM-UT-S02-C01 returns a path inside the same location', () => {
    // Arrange
    const gridMap = createGridMap([
      createLocation('a', [], { x: 0, y: 0, width: 4, height: 4 }),
    ]);

    // Act
    const path = gridMap.findPath({ x: 0.5, y: 0.5 }, { x: 3.5, y: 0.5 });

    // Assert
    assert.deepEqual(path, [{ x: 3.5, y: 0.5 }]);
  });

  it('GM-UT-S02-C02 returns null when the destination is an empty cell', () => {
    // Arrange
    const gridMap = createGridMap([
      createLocation('a', [], { x: 0, y: 0, width: 2, height: 2 }),
    ]);

    // Act
    const path = gridMap.findPath({ x: 0.5, y: 0.5 }, { x: 3.5, y: 3.5 });

    // Assert
    assert.equal(path, null);
  });

  it('GM-UT-S02-C03 compresses a bent cell route to corner waypoints', () => {
    // Arrange
    const gridMap = createGridMap([
      createLocation('a', ['b'], { x: 0, y: 0, width: 1, height: 3 }),
      createLocation('b', ['a'], { x: 0, y: 3, width: 4, height: 1 }),
    ]);

    // Act
    const path = gridMap.findPath({ x: 0.5, y: 0.5 }, { x: 3.5, y: 3.5 });

    // Assert
    assert.deepEqual(path, [
      { x: 0.5, y: 3.5 },
      { x: 3.5, y: 3.5 },
    ]);
  });
});

describe('GM-UT-S03 wall snapshot', () => {
  it('GM-UT-S03-C01 includes walls for unconnected adjacent boundaries', () => {
    // Arrange
    const gridMap = createGridMap([
      createLocation('a', [], { x: 0, y: 0, width: 1, height: 1 }),
      createLocation('b', [], { x: 1, y: 0, width: 1, height: 1 }),
    ]);

    // Act
    const snapshot = gridMap.createSnapshot();

    // Assert
    assert.ok(snapshot.walls.some(wall => (
      wall.x1 === 1
      && wall.y1 === 0
      && wall.x2 === 1
      && wall.y2 === 1
    )));
  });
});

describe('GM-UT-S04 default location layout', () => {
  it('GM-UT-S04-C01 does not overlap default location rectangles', () => {
    // Arrange
    const overlappingPairs = [];

    // Act
    for (let firstIndex = 0; firstIndex < LOCATIONS.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < LOCATIONS.length; secondIndex += 1) {
        const firstLocation = LOCATIONS[firstIndex];
        const secondLocation = LOCATIONS[secondIndex];
        if (doAreasOverlap(firstLocation.area, secondLocation.area)) {
          overlappingPairs.push(`${firstLocation.name}/${secondLocation.name}`);
        }
      }
    }

    // Assert
    assert.deepEqual(overlappingPairs, []);
  });

  it('GM-UT-S04-C02 keeps default destinations physically adjacent', () => {
    // Arrange
    const locationsById = new Map(LOCATIONS.map(location => [location.id, location]));
    const nonAdjacentPairs = [];

    // Act
    LOCATIONS.forEach(location => {
      location.destinations.forEach(destinationId => {
        const destination = locationsById.get(destinationId);
        if (!destination || !areAreasAdjacent(location.area, destination.area)) {
          nonAdjacentPairs.push(`${location.name}/${destination?.name ?? destinationId}`);
        }
      });
    });

    // Assert
    assert.deepEqual(nonAdjacentPairs, []);
  });
});

function createGridMap(locations) {
  return new GridMap({
    width: 4,
    height: 4,
    locations,
  });
}

function createLocation(id, destinations, area) {
  return {
    id,
    name: id,
    group: 'test',
    destinations,
    area,
  };
}

function doAreasOverlap(firstArea, secondArea) {
  return (
    firstArea.x < secondArea.x + secondArea.width
    && firstArea.x + firstArea.width > secondArea.x
    && firstArea.y < secondArea.y + secondArea.height
    && firstArea.y + firstArea.height > secondArea.y
  );
}

function areAreasAdjacent(firstArea, secondArea) {
  const horizontalOverlap = (
    firstArea.y < secondArea.y + secondArea.height
    && firstArea.y + firstArea.height > secondArea.y
  );
  const verticalOverlap = (
    firstArea.x < secondArea.x + secondArea.width
    && firstArea.x + firstArea.width > secondArea.x
  );
  return (
    (firstArea.x + firstArea.width === secondArea.x && horizontalOverlap)
    || (secondArea.x + secondArea.width === firstArea.x && horizontalOverlap)
    || (firstArea.y + firstArea.height === secondArea.y && verticalOverlap)
    || (secondArea.y + secondArea.height === firstArea.y && verticalOverlap)
  );
}
