/**
 * waypoint列から移動状態を作る。
 * @public
 * @param {Array<Object>} waypoints - 目的地までのwaypoint配列。
 * @param {number} speedCellsPerSecond - 1秒あたりの移動マス数。
 * @returns {Object|null} 移動状態。
 */
function createMovement(waypoints, speedCellsPerSecond) {
  if (!Array.isArray(waypoints) || waypoints.length === 0) {
    return null;
  }

  const copiedWaypoints = waypoints.map(copyPosition);
  return {
    destination: copyPosition(copiedWaypoints.at(-1)),
    waypoints: copiedWaypoints,
    speedCellsPerSecond,
  };
}

/**
 * 移動状態を実時間delta分だけ進める。
 * @public
 * @param {Object} options - 更新オプション。
 * @param {Object} options.position - 現在座標。
 * @param {string} options.locationId - 現在地ID。
 * @param {Object|null} options.movement - 移動状態。
 * @param {number} options.deltaTimeMs - 実時間delta。
 * @param {GridMap} options.gridMap - グリッドマップ。
 * @returns {Object} 更新後の座標、移動状態、現在地、通過場所ID。
 */
function advanceMovement({
  position,
  locationId,
  movement,
  deltaTimeMs,
  gridMap,
}) {
  if (!movement || deltaTimeMs <= 0) {
    return {
      position,
      locationId,
      movement,
      visitedLocationIds: [],
    };
  }

  let currentPosition = copyPosition(position);
  let currentLocationId = locationId;
  let remainingDistance = movement.speedCellsPerSecond * (deltaTimeMs / 1000);
  const waypoints = movement.waypoints.map(copyPosition);
  const visitedLocationIds = [];

  while (remainingDistance > 0 && waypoints.length > 0) {
    const targetPosition = waypoints[0];
    const distance = getDistance(currentPosition, targetPosition);
    const nextPosition = distance <= remainingDistance
      ? targetPosition
      : interpolatePosition(
        currentPosition,
        targetPosition,
        remainingDistance / distance,
      );

    gridMap.findLocationIdsAlongLine(currentPosition, nextPosition).forEach(nextLocationId => {
      if (nextLocationId !== currentLocationId) {
        currentLocationId = nextLocationId;
        visitedLocationIds.push(nextLocationId);
      }
    });

    currentPosition = copyPosition(nextPosition);

    if (distance <= remainingDistance) {
      waypoints.shift();
      remainingDistance -= distance;
    } else {
      remainingDistance = 0;
    }
  }

  return {
    position: currentPosition,
    locationId: currentLocationId,
    movement: waypoints.length > 0
      ? {
        destination: copyPosition(movement.destination),
        speedCellsPerSecond: movement.speedCellsPerSecond,
        waypoints,
      }
      : null,
    visitedLocationIds,
  };
}

/**
 * 移動状態snapshotを作る。
 * @public
 * @param {Object|null} movement - 移動状態。
 * @returns {Object|null} snapshot。
 */
function createMovementSnapshot(movement) {
  if (!movement) {
    return null;
  }

  return {
    destination: copyPosition(movement.destination),
    speedCellsPerSecond: movement.speedCellsPerSecond,
    waypoints: movement.waypoints.map(copyPosition),
  };
}

/**
 * 座標オブジェクトを複製する。
 * @param {Object} position - 複製元座標。
 * @returns {Object} 複製した座標。
 */
function copyPosition(position) {
  return {
    x: position.x,
    y: position.y,
  };
}

/**
 * 2点間を指定割合で線形補間する。
 * @param {Object} from - 開始座標。
 * @param {Object} to - 終了座標。
 * @param {number} ratio - 補間割合。
 * @returns {Object} 補間後座標。
 */
function interpolatePosition(from, to, ratio) {
  return {
    x: from.x + ((to.x - from.x) * ratio),
    y: from.y + ((to.y - from.y) * ratio),
  };
}

/**
 * 2点間のユークリッド距離を返す。
 * @param {Object} from - 開始座標。
 * @param {Object} to - 終了座標。
 * @returns {number} 距離。
 */
function getDistance(from, to) {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

export {
  advanceMovement,
  createMovement,
  createMovementSnapshot,
};
