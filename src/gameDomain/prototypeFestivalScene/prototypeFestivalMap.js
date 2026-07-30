/** プロトタイプマップの一辺の長さ。 */
const PROTOTYPE_MAP_SIZE = 32;

/** ローカル画面に表示する一辺の長さ。 */
const PROTOTYPE_LOCAL_VIEW_SIZE = 12;

/** ネギの当たり判定半径。 */
const PROTOTYPE_PLAYER_RADIUS = 0.3;

/** 1回の衝突判定で進める最大距離。 */
const PROTOTYPE_MOVEMENT_STEP = 0.2;

/** 移動速度を低下させる混雑度。 */
const PROTOTYPE_CONGESTION_THRESHOLD = 70;

/** 混雑による速度低下を受ける中心からの距離。 */
const PROTOTYPE_CONGESTION_RADIUS = 3;

/** 建物、屋台、柵を表す通行不能矩形。 */
const PROTOTYPE_OBSTACLES = Object.freeze([
  Object.freeze({ id: 'north-divider', type: 'fence', x: 15, y: 0, width: 2, height: 5 }),
  Object.freeze({ id: 'center-divider', type: 'fence', x: 15, y: 10, width: 2, height: 12 }),
  Object.freeze({ id: 'south-divider', type: 'fence', x: 15, y: 27, width: 2, height: 5 }),
  Object.freeze({ id: 'west-divider', type: 'fence', x: 0, y: 15, width: 5, height: 2 }),
  Object.freeze({ id: 'middle-divider', type: 'fence', x: 10, y: 15, width: 12, height: 2 }),
  Object.freeze({ id: 'east-divider', type: 'fence', x: 27, y: 15, width: 5, height: 2 }),
  Object.freeze({ id: 'food-stalls-north', type: 'stall', x: 1, y: 1, width: 5, height: 3 }),
  Object.freeze({ id: 'food-stalls-east', type: 'stall', x: 9, y: 2, width: 4, height: 3 }),
  Object.freeze({ id: 'food-stalls-west', type: 'stall', x: 2, y: 9, width: 5, height: 2 }),
  Object.freeze({ id: 'food-stalls-south', type: 'stall', x: 9, y: 11, width: 4, height: 2 }),
  Object.freeze({ id: 'david-stage', type: 'building', x: 21, y: 1, width: 7, height: 3 }),
  Object.freeze({ id: 'david-kiosk', type: 'stall', x: 18, y: 9, width: 4, height: 2 }),
  Object.freeze({ id: 'david-booths', type: 'stall', x: 26, y: 9, width: 4, height: 2 }),
  Object.freeze({ id: 'gym-building', type: 'building', x: 1, y: 18, width: 4, height: 5 }),
  Object.freeze({ id: 'gym-annex', type: 'building', x: 11, y: 24, width: 3, height: 3 }),
  Object.freeze({ id: 'gym-tents', type: 'stall', x: 2, y: 27, width: 6, height: 3 }),
  Object.freeze({ id: 'world-tree', type: 'building', x: 23, y: 22, width: 5, height: 5 }),
  Object.freeze({ id: 'tree-stalls', type: 'stall', x: 18, y: 18, width: 3, height: 2 }),
  Object.freeze({ id: 'tree-kiosk', type: 'stall', x: 29, y: 18, width: 2, height: 4 }),
]);

/** 全体ミニマップへ表示する既知施設。 */
const PROTOTYPE_LANDMARKS = Object.freeze([
  Object.freeze({ id: 'food-street', name: '屋台通り', shortLabel: '屋台', visualType: 'street', position: Object.freeze({ x: 8, y: 7 }) }),
  Object.freeze({ id: 'david-plaza', name: 'デイビット広場', shortLabel: '広場', visualType: 'plaza', position: Object.freeze({ x: 24, y: 7 }) }),
  Object.freeze({ id: 'gym-front', name: '体育館前', shortLabel: '体育館', visualType: 'building', position: Object.freeze({ x: 8, y: 25 }) }),
  Object.freeze({ id: 'world-tree-front', name: '世界樹前', shortLabel: '世界樹', visualType: 'tree', position: Object.freeze({ x: 24, y: 29 }) }),
]);

/** 通路沿いに置く近傍ハプニング候補地点。 */
const PROTOTYPE_HAPPENING_SITES = Object.freeze([
  Object.freeze({ id: 'food-1', areaId: 'food-street', position: Object.freeze({ x: 7, y: 3 }) }),
  Object.freeze({ id: 'food-2', areaId: 'food-street', position: Object.freeze({ x: 13, y: 6 }) }),
  Object.freeze({ id: 'food-3', areaId: 'food-street', position: Object.freeze({ x: 6, y: 8 }) }),
  Object.freeze({ id: 'food-4', areaId: 'food-street', position: Object.freeze({ x: 13, y: 9 }) }),
  Object.freeze({ id: 'food-5', areaId: 'food-street', position: Object.freeze({ x: 6, y: 13 }) }),
  Object.freeze({ id: 'food-6', areaId: 'food-street', position: Object.freeze({ x: 2, y: 13 }) }),
  Object.freeze({ id: 'david-1', areaId: 'david-plaza', position: Object.freeze({ x: 19, y: 5 }) }),
  Object.freeze({ id: 'david-2', areaId: 'david-plaza', position: Object.freeze({ x: 23, y: 7 }) }),
  Object.freeze({ id: 'david-3', areaId: 'david-plaza', position: Object.freeze({ x: 29, y: 6 }) }),
  Object.freeze({ id: 'david-4', areaId: 'david-plaza', position: Object.freeze({ x: 23, y: 12 }) }),
  Object.freeze({ id: 'david-5', areaId: 'david-plaza', position: Object.freeze({ x: 29, y: 13 }) }),
  Object.freeze({ id: 'david-6', areaId: 'david-plaza', position: Object.freeze({ x: 18, y: 13 }) }),
  Object.freeze({ id: 'gym-1', areaId: 'gym-front', position: Object.freeze({ x: 11, y: 18 }) }),
  Object.freeze({ id: 'gym-2', areaId: 'gym-front', position: Object.freeze({ x: 14, y: 20 }) }),
  Object.freeze({ id: 'gym-3', areaId: 'gym-front', position: Object.freeze({ x: 10, y: 24 }) }),
  Object.freeze({ id: 'gym-4', areaId: 'gym-front', position: Object.freeze({ x: 4, y: 25 }) }),
  Object.freeze({ id: 'gym-5', areaId: 'gym-front', position: Object.freeze({ x: 9, y: 29 }) }),
  Object.freeze({ id: 'gym-6', areaId: 'gym-front', position: Object.freeze({ x: 14, y: 29 }) }),
  Object.freeze({ id: 'tree-1', areaId: 'world-tree-front', position: Object.freeze({ x: 19, y: 21 }) }),
  Object.freeze({ id: 'tree-2', areaId: 'world-tree-front', position: Object.freeze({ x: 22, y: 20 }) }),
  Object.freeze({ id: 'tree-3', areaId: 'world-tree-front', position: Object.freeze({ x: 28, y: 18 }) }),
  Object.freeze({ id: 'tree-4', areaId: 'world-tree-front', position: Object.freeze({ x: 20, y: 24 }) }),
  Object.freeze({ id: 'tree-5', areaId: 'world-tree-front', position: Object.freeze({ x: 29, y: 27 }) }),
  Object.freeze({ id: 'tree-6', areaId: 'world-tree-front', position: Object.freeze({ x: 24, y: 29 }) }),
]);

/** 数値を指定範囲へ収める。 */
function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

/** 円形の移動体が矩形へ接触しているか判定する。 */
function circleIntersectsRectangle(position, radius, rectangle) {
  const closestX = clamp(position.x, rectangle.x, rectangle.x + rectangle.width);
  const closestY = clamp(position.y, rectangle.y, rectangle.y + rectangle.height);
  return Math.hypot(position.x - closestX, position.y - closestY) < radius;
}

/** 指定座標へネギを配置できるか判定する。 */
function isPrototypePositionWalkable(position, radius = PROTOTYPE_PLAYER_RADIUS) {
  if (
    position.x < radius
    || position.y < radius
    || position.x > PROTOTYPE_MAP_SIZE - radius
    || position.y > PROTOTYPE_MAP_SIZE - radius
  ) {
    return false;
  }
  return !PROTOTYPE_OBSTACLES.some((obstacle) => (
    circleIntersectsRectangle(position, radius, obstacle)
  ));
}

/** 軸分離衝突判定で連続座標を移動する。 */
function movePrototypePosition(position, displacement) {
  const distance = Math.hypot(displacement.x, displacement.y);
  const stepCount = Math.max(1, Math.ceil(distance / PROTOTYPE_MOVEMENT_STEP));
  const step = { x: displacement.x / stepCount, y: displacement.y / stepCount };
  let current = { x: position.x, y: position.y };
  for (let index = 0; index < stepCount; index += 1) {
    const nextX = { x: current.x + step.x, y: current.y };
    if (isPrototypePositionWalkable(nextX)) {
      current = nextX;
    }
    const nextY = { x: current.x, y: current.y + step.y };
    if (isPrototypePositionWalkable(nextY)) {
      current = nextY;
    }
  }
  return current;
}

/** 2座標間を障害物が遮っていないか判定する。 */
function hasPrototypeLineOfSight(from, to) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const sampleCount = Math.max(1, Math.ceil(distance / 0.15));
  for (let index = 1; index < sampleCount; index += 1) {
    const ratio = index / sampleCount;
    const sample = {
      x: from.x + (to.x - from.x) * ratio,
      y: from.y + (to.y - from.y) * ratio,
    };
    if (PROTOTYPE_OBSTACLES.some((obstacle) => circleIntersectsRectangle(sample, 0.01, obstacle))) {
      return false;
    }
  }
  return true;
}

/** ネギを中心とした12×12の表示矩形を生成する。 */
function createPrototypeViewport(position) {
  const halfSize = PROTOTYPE_LOCAL_VIEW_SIZE / 2;
  return {
    x: clamp(position.x - halfSize, 0, PROTOTYPE_MAP_SIZE - PROTOTYPE_LOCAL_VIEW_SIZE),
    y: clamp(position.y - halfSize, 0, PROTOTYPE_MAP_SIZE - PROTOTYPE_LOCAL_VIEW_SIZE),
    width: PROTOTYPE_LOCAL_VIEW_SIZE,
    height: PROTOTYPE_LOCAL_VIEW_SIZE,
  };
}

/** 座標が表示矩形内にあるか判定する。 */
function isPositionInPrototypeViewport(position, viewport) {
  return position.x >= viewport.x
    && position.x <= viewport.x + viewport.width
    && position.y >= viewport.y
    && position.y <= viewport.y + viewport.height;
}

/** 表示矩形と交差する障害物だけを返す。 */
function getPrototypeObstaclesInViewport(viewport) {
  return PROTOTYPE_OBSTACLES.filter((obstacle) => (
    obstacle.x < viewport.x + viewport.width
    && obstacle.x + obstacle.width > viewport.x
    && obstacle.y < viewport.y + viewport.height
    && obstacle.y + obstacle.height > viewport.y
  ));
}

/** 現在地の混雑を反映したプレイヤー移動速度を返す。 */
function getPrototypeMovementSpeed({
  baseSpeed,
  playerPosition,
  currentAreaId,
  areaStates,
  happenings,
}) {
  const currentState = areaStates.find((state) => state.id === currentAreaId);
  const hasNearbyCrowd = happenings.some((happening) => (
    happening.areaId === currentAreaId
    && Math.hypot(
      playerPosition.x - happening.position.x,
      playerPosition.y - happening.position.y,
    ) <= PROTOTYPE_CONGESTION_RADIUS
  ));
  return currentState?.congestion >= PROTOTYPE_CONGESTION_THRESHOLD && hasNearbyCrowd
    ? baseSpeed / 2
    : baseSpeed;
}

export {
  PROTOTYPE_HAPPENING_SITES,
  PROTOTYPE_CONGESTION_RADIUS,
  PROTOTYPE_CONGESTION_THRESHOLD,
  PROTOTYPE_LANDMARKS,
  PROTOTYPE_LOCAL_VIEW_SIZE,
  PROTOTYPE_MAP_SIZE,
  PROTOTYPE_OBSTACLES,
  PROTOTYPE_PLAYER_RADIUS,
  createPrototypeViewport,
  getPrototypeObstaclesInViewport,
  getPrototypeMovementSpeed,
  hasPrototypeLineOfSight,
  isPositionInPrototypeViewport,
  isPrototypePositionWalkable,
  movePrototypePosition,
};
