import {
  LOCATIONS,
  MAP_GRID_HEIGHT,
  MAP_GRID_WIDTH,
  findLocation,
} from './locations.js';

const DEFAULT_MOVEMENT_SPEED_CELLS_PER_SECOND = 4;
const ORTHOGONAL_DIRECTIONS = Object.freeze([
  Object.freeze({ x: 1, y: 0 }),
  Object.freeze({ x: -1, y: 0 }),
  Object.freeze({ x: 0, y: 1 }),
  Object.freeze({ x: 0, y: -1 }),
]);

/**
 * 32x32グリッド上の場所領域、壁、経路探索を扱うマップ。
 * @public
 */
class GridMap {
  #width;
  #height;
  #locations;
  #locationsById;
  #cellLocationIds;
  #walls;

  /**
   * グリッドマップを初期化する。
   * @public
   * @param {Object} config - 設定。
   * @param {number} config.width - 横マス数。
   * @param {number} config.height - 縦マス数。
   * @param {Array<Object>} config.locations - 場所定義。
   */
  constructor({ width, height, locations }) {
    this.#width = width;
    this.#height = height;
    this.#locations = locations;
    this.#locationsById = new Map(locations.map(location => [location.id, location]));
    this.#cellLocationIds = this.#createCellLocationIds();
    this.#walls = this.#createWalls();
  }

  /**
   * マップsnapshotを返す。
   * @public
   * @returns {Object} マップ描画用snapshot。
   */
  createSnapshot() {
    return {
      width: this.#width,
      height: this.#height,
      locations: this.#locations.map(location => ({
        id: location.id,
        name: location.name,
        group: location.group,
        destinations: [...location.destinations],
        area: { ...location.area },
      })),
      walls: this.#walls.map(wall => ({ ...wall })),
    };
  }

  /**
   * 座標が属する場所を返す。
   * @public
   * @param {Object} position - マップ上の連続座標。
   * @param {number} position.x - X座標。
   * @param {number} position.y - Y座標。
   * @returns {Object|null} 場所。場所に属さない場合はnull。
   */
  findLocationByPosition(position) {
    const cell = this.#getCellFromPosition(position);
    if (!cell) {
      return null;
    }

    return this.findLocationByCell(cell);
  }

  /**
   * セルが属する場所を返す。
   * @public
   * @param {Object} cell - セル座標。
   * @param {number} cell.x - Xセル。
   * @param {number} cell.y - Yセル。
   * @returns {Object|null} 場所。場所に属さない場合はnull。
   */
  findLocationByCell(cell) {
    const locationId = this.#getLocationIdAtCell(cell);
    return locationId ? this.#locationsById.get(locationId) ?? null : null;
  }

  /**
   * 場所の中心座標を返す。
   * @public
   * @param {string} locationId - 場所ID。
   * @returns {Object|null} 中心座標。
   */
  getLocationCenter(locationId) {
    const location = this.#locationsById.get(locationId);
    if (!location) {
      return null;
    }

    return {
      x: location.area.x + (location.area.width / 2),
      y: location.area.y + (location.area.height / 2),
    };
  }

  /**
   * 指定場所内の代表セル中心を返す。
   * @public
   * @param {string} locationId - 場所ID。
   * @returns {Object|null} 代表座標。
   */
  getLocationSpawnPosition(locationId) {
    return this.getLocationCenter(locationId);
  }

  /**
   * 開始座標から目的座標への移動経路を返す。
   * @public
   * @param {Object} startPosition - 開始座標。
   * @param {Object} destinationPosition - 目的座標。
   * @returns {Array<Object>|null} waypoint配列。到達不能ならnull。
   */
  findPath(startPosition, destinationPosition) {
    const startCell = this.#getCellFromPosition(startPosition);
    const destinationCell = this.#getCellFromPosition(destinationPosition);
    if (!startCell || !destinationCell) {
      return null;
    }

    if (!this.findLocationByCell(startCell) || !this.findLocationByCell(destinationCell)) {
      return null;
    }

    const cellPath = this.#findCellPath(startCell, destinationCell);
    if (!cellPath) {
      return null;
    }

    return createCompressedWaypoints(cellPath, destinationPosition);
  }

  /**
   * 開始座標から場所中心への移動経路を返す。
   * @public
   * @param {Object} startPosition - 開始座標。
   * @param {string} locationId - 目的地の場所ID。
   * @returns {Array<Object>|null} waypoint配列。到達不能ならnull。
   */
  findPathToLocation(startPosition, locationId) {
    const destinationPosition = this.getLocationCenter(locationId);
    return destinationPosition ? this.findPath(startPosition, destinationPosition) : null;
  }

  /**
   * 線分上で通過する場所IDを順に返す。
   * @public
   * @param {Object} from - 開始座標。
   * @param {Object} to - 終了座標。
   * @returns {Array<string>} 通過場所ID。
   */
  findLocationIdsAlongLine(from, to) {
    const distance = getDistance(from, to);
    const steps = Math.max(1, Math.ceil(distance * 4));
    const locationIds = [];

    for (let index = 1; index <= steps; index += 1) {
      const ratio = index / steps;
      const position = {
        x: from.x + ((to.x - from.x) * ratio),
        y: from.y + ((to.y - from.y) * ratio),
      };
      const locationId = this.findLocationByPosition(position)?.id ?? null;
      if (locationId && locationIds.at(-1) !== locationId) {
        locationIds.push(locationId);
      }
    }

    return locationIds;
  }

  /**
   * A*でセル単位の移動経路を探索する。
   * @private
   * @param {Object} startCell - 開始セル。
   * @param {Object} destinationCell - 目的地セル。
   * @returns {Array<Object>|null} セル経路。到達不能な場合はnull。
   */
  #findCellPath(startCell, destinationCell) {
    const startKey = createCellKey(startCell);
    const destinationKey = createCellKey(destinationCell);
    const openKeys = new Set([startKey]);
    const cameFrom = new Map();
    const gScore = new Map([[startKey, 0]]);
    const fScore = new Map([[startKey, getHeuristic(startCell, destinationCell)]]);

    while (openKeys.size > 0) {
      const currentKey = getLowestScoreKey(openKeys, fScore);
      const currentCell = parseCellKey(currentKey);

      if (currentKey === destinationKey) {
        return reconstructCellPath(cameFrom, currentCell);
      }

      openKeys.delete(currentKey);
      this.#getNeighbors(currentCell).forEach(neighbor => {
        const neighborKey = createCellKey(neighbor);
        const tentativeScore = (gScore.get(currentKey) ?? Number.POSITIVE_INFINITY) + 1;
        if (tentativeScore >= (gScore.get(neighborKey) ?? Number.POSITIVE_INFINITY)) {
          return;
        }

        cameFrom.set(neighborKey, currentCell);
        gScore.set(neighborKey, tentativeScore);
        fScore.set(
          neighborKey,
          tentativeScore + getHeuristic(neighbor, destinationCell),
        );
        openKeys.add(neighborKey);
      });
    }

    return null;
  }

  /**
   * 移動可能な隣接セルを返す。
   * @private
   * @param {Object} cell - 基準セル。
   * @returns {Array<Object>} 隣接セル配列。
   */
  #getNeighbors(cell) {
    return ORTHOGONAL_DIRECTIONS
      .map(direction => ({
        x: cell.x + direction.x,
        y: cell.y + direction.y,
      }))
      .filter(neighbor => this.#canMoveBetweenCells(cell, neighbor));
  }

  /**
   * 2つのセル間を移動できるか判定する。
   * @private
   * @param {Object} fromCell - 移動元セル。
   * @param {Object} toCell - 移動先セル。
   * @returns {boolean} 移動可能な場合はtrue。
   */
  #canMoveBetweenCells(fromCell, toCell) {
    const fromLocationId = this.#getLocationIdAtCell(fromCell);
    const toLocationId = this.#getLocationIdAtCell(toCell);
    if (!fromLocationId || !toLocationId) {
      return false;
    }
    if (fromLocationId === toLocationId) {
      return true;
    }

    return this.#areLocationsConnected(fromLocationId, toLocationId);
  }

  /**
   * 2つの場所が相互に移動先として接続されているか判定する。
   * @private
   * @param {string} fromLocationId - 移動元場所ID。
   * @param {string} toLocationId - 移動先場所ID。
   * @returns {boolean} 接続されている場合はtrue。
   */
  #areLocationsConnected(fromLocationId, toLocationId) {
    const fromLocation = this.#locationsById.get(fromLocationId);
    const toLocation = this.#locationsById.get(toLocationId);
    return Boolean(
      fromLocation?.destinations.includes(toLocationId)
      && toLocation?.destinations.includes(fromLocationId),
    );
  }

  /**
   * セルに割り当てられている場所IDを返す。
   * @private
   * @param {Object} cell - 対象セル。
   * @returns {string|null} 場所ID。範囲外または空白セルの場合はnull。
   */
  #getLocationIdAtCell(cell) {
    if (!isCellInBounds(cell, this.#width, this.#height)) {
      return null;
    }

    return this.#cellLocationIds[cell.y]?.[cell.x] ?? null;
  }

  /**
   * 連続座標からセル座標を作成する。
   * @private
   * @param {Object} position - 連続座標。
   * @returns {Object|null} セル座標。範囲外の場合はnull。
   */
  #getCellFromPosition(position) {
    if (
      !position
      || typeof position.x !== 'number'
      || typeof position.y !== 'number'
      || position.x < 0
      || position.y < 0
      || position.x >= this.#width
      || position.y >= this.#height
    ) {
      return null;
    }

    return {
      x: Math.floor(position.x),
      y: Math.floor(position.y),
    };
  }

  /**
   * 各セルが属する場所IDの2次元配列を作成する。
   * @private
   * @returns {Array<Array<string|null>>} 場所ID配列。
   */
  #createCellLocationIds() {
    const rows = Array.from(
      { length: this.#height },
      () => Array.from({ length: this.#width }, () => null),
    );

    this.#locations.forEach(location => {
      const { x, y, width, height } = location.area;
      for (let row = y; row < y + height; row += 1) {
        for (let column = x; column < x + width; column += 1) {
          rows[row][column] = location.id;
        }
      }
    });

    return rows;
  }

  /**
   * 移動できないセル境界の壁データを作成する。
   * @private
   * @returns {Array<Object>} 壁データ配列。
   */
  #createWalls() {
    const wallsById = new Map();

    for (let y = 0; y < this.#height; y += 1) {
      for (let x = 0; x < this.#width; x += 1) {
        const cell = { x, y };
        if (!this.#getLocationIdAtCell(cell)) {
          continue;
        }

        addWallIfBlocked(wallsById, cell, { x: x + 1, y }, this.#canMoveBetweenCells(cell, { x: x + 1, y }));
        addWallIfBlocked(wallsById, cell, { x: x - 1, y }, this.#canMoveBetweenCells(cell, { x: x - 1, y }));
        addWallIfBlocked(wallsById, cell, { x, y: y + 1 }, this.#canMoveBetweenCells(cell, { x, y: y + 1 }));
        addWallIfBlocked(wallsById, cell, { x, y: y - 1 }, this.#canMoveBetweenCells(cell, { x, y: y - 1 }));
      }
    }

    return Array.from(wallsById.values());
  }
}

/**
 * 移動不可のセル境界を壁として追加する。
 * @param {Map<string, Object>} wallsById - 壁IDをキーにした壁Map。
 * @param {Object} cell - 基準セル。
 * @param {Object} neighbor - 隣接セル。
 * @param {boolean} canMove - 移動可否。
 * @returns {void}
 */
function addWallIfBlocked(wallsById, cell, neighbor, canMove) {
  if (canMove) {
    return;
  }

  const wall = createWallBetweenCells(cell, neighbor);
  wallsById.set(wall.id, wall);
}

/**
 * 2つのセル境界に対応する壁データを作成する。
 * @param {Object} cell - 基準セル。
 * @param {Object} neighbor - 隣接セル。
 * @returns {Object} 壁データ。
 */
function createWallBetweenCells(cell, neighbor) {
  if (neighbor.x > cell.x) {
    return createWall(cell.x + 1, cell.y, cell.x + 1, cell.y + 1);
  }
  if (neighbor.x < cell.x) {
    return createWall(cell.x, cell.y, cell.x, cell.y + 1);
  }
  if (neighbor.y > cell.y) {
    return createWall(cell.x, cell.y + 1, cell.x + 1, cell.y + 1);
  }
  return createWall(cell.x, cell.y, cell.x + 1, cell.y);
}

/**
 * 壁線分データを作成する。
 * @param {number} x1 - 始点X。
 * @param {number} y1 - 始点Y。
 * @param {number} x2 - 終点X。
 * @param {number} y2 - 終点Y。
 * @returns {Object} 壁線分データ。
 */
function createWall(x1, y1, x2, y2) {
  return {
    id: `${x1},${y1}-${x2},${y2}`,
    x1,
    y1,
    x2,
    y2,
  };
}

/**
 * セル経路を曲がり角と目的地だけのwaypointに圧縮する。
 * @param {Array<Object>} cellPath - セル経路。
 * @param {Object} destinationPosition - 目的地座標。
 * @returns {Array<Object>} waypoint配列。
 */
function createCompressedWaypoints(cellPath, destinationPosition) {
  if (cellPath.length <= 1) {
    return [{ ...destinationPosition }];
  }

  const waypoints = [];
  let previousDirection = getDirection(cellPath[0], cellPath[1]);

  for (let index = 1; index < cellPath.length - 1; index += 1) {
    const nextDirection = getDirection(cellPath[index], cellPath[index + 1]);
    if (
      nextDirection.x !== previousDirection.x
      || nextDirection.y !== previousDirection.y
    ) {
      waypoints.push(getCellCenter(cellPath[index]));
      previousDirection = nextDirection;
    }
  }

  waypoints.push({ ...destinationPosition });
  return waypoints;
}

/**
 * A*の探索履歴からセル経路を復元する。
 * @param {Map<string, Object>} cameFrom - 遷移元セルMap。
 * @param {Object} currentCell - 終端セル。
 * @returns {Array<Object>} セル経路。
 */
function reconstructCellPath(cameFrom, currentCell) {
  const path = [currentCell];
  let currentKey = createCellKey(currentCell);

  while (cameFrom.has(currentKey)) {
    const previousCell = cameFrom.get(currentKey);
    path.unshift(previousCell);
    currentKey = createCellKey(previousCell);
  }

  return path;
}

/**
 * 候補キーのうち最小スコアのキーを返す。
 * @param {Set<string>} keys - 候補キーSet。
 * @param {Map<string, number>} scores - スコアMap。
 * @returns {string|null} 最小スコアのキー。
 */
function getLowestScoreKey(keys, scores) {
  let result = null;
  let lowestScore = Number.POSITIVE_INFINITY;

  keys.forEach(key => {
    const score = scores.get(key) ?? Number.POSITIVE_INFINITY;
    if (score < lowestScore) {
      result = key;
      lowestScore = score;
    }
  });

  return result;
}

/**
 * A*用のマンハッタン距離ヒューリスティックを返す。
 * @param {Object} cell - 対象セル。
 * @param {Object} destinationCell - 目的地セル。
 * @returns {number} 推定距離。
 */
function getHeuristic(cell, destinationCell) {
  return Math.abs(cell.x - destinationCell.x) + Math.abs(cell.y - destinationCell.y);
}

/**
 * 隣接セル間の移動方向を返す。
 * @param {Object} fromCell - 移動元セル。
 * @param {Object} toCell - 移動先セル。
 * @returns {Object} 方向ベクトル。
 */
function getDirection(fromCell, toCell) {
  return {
    x: Math.sign(toCell.x - fromCell.x),
    y: Math.sign(toCell.y - fromCell.y),
  };
}

/**
 * セル中心の連続座標を返す。
 * @param {Object} cell - セル座標。
 * @returns {Object} セル中心座標。
 */
function getCellCenter(cell) {
  return {
    x: cell.x + 0.5,
    y: cell.y + 0.5,
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

/**
 * セルがマップ範囲内にあるか判定する。
 * @param {Object} cell - セル座標。
 * @param {number} width - マップ幅。
 * @param {number} height - マップ高さ。
 * @returns {boolean} 範囲内の場合はtrue。
 */
function isCellInBounds(cell, width, height) {
  return (
    Number.isInteger(cell.x)
    && Number.isInteger(cell.y)
    && cell.x >= 0
    && cell.y >= 0
    && cell.x < width
    && cell.y < height
  );
}

/**
 * セル座標をMapキー文字列に変換する。
 * @param {Object} cell - セル座標。
 * @returns {string} セルキー。
 */
function createCellKey(cell) {
  return `${cell.x},${cell.y}`;
}

/**
 * セルキー文字列をセル座標に戻す。
 * @param {string} key - セルキー。
 * @returns {Object} セル座標。
 */
function parseCellKey(key) {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
}

const DEFAULT_GRID_MAP = new GridMap({
  width: MAP_GRID_WIDTH,
  height: MAP_GRID_HEIGHT,
  locations: LOCATIONS,
});

/**
 * デフォルトのグリッドマップを返す。
 * @public
 * @returns {GridMap} デフォルトグリッドマップ。
 */
function getDefaultGridMap() {
  return DEFAULT_GRID_MAP;
}

/**
 * デフォルト移動速度を返す。
 * @public
 * @returns {number} 1秒あたりの移動セル数。
 */
function getDefaultMovementSpeedCellsPerSecond() {
  return DEFAULT_MOVEMENT_SPEED_CELLS_PER_SECOND;
}

export {
  DEFAULT_MOVEMENT_SPEED_CELLS_PER_SECOND,
  GridMap,
  getDefaultGridMap,
  getDefaultMovementSpeedCellsPerSecond,
};
