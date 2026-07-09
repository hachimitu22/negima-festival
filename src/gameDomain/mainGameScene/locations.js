/**
 * マップの横マス数。
 * @public
 */
const MAP_GRID_WIDTH = 32;

/**
 * マップの縦マス数。
 * @public
 */
const MAP_GRID_HEIGHT = 32;

/**
 * 位置 ID 定数。
 * @public
 */
const LOCATION_IDS = {
  LIBRARY_ROOM: 'library_room',
  LIBRARY_ROOM_FRONT_CORRIDOR: 'library_room_front_corridor',
  STAFF_ROOM: 'staff_room',
  HALL: 'hall',
  GIRLS_BATHROOM: 'girls_bathroom',
  HEALTH_ROOM_FRONT_CORRIDOR: 'health_room_front_corridor',
  HEALTH_ROOM: 'health_room',
  CLASSROOM_3A_FRONT_CORRIDOR: 'classroom_3a_front_corridor',
  CLASSROOM_3A: 'classroom_3a',
  OTHER_CLASS_CORRIDOR: 'other_class_corridor',
  ROOF: 'roof',
  GYM_ARENA: 'gym_arena',
  GYM_EQUIPMENT_ROOM: 'gym_equipment_room',
  GYM_CHANGING_ROOM: 'gym_changing_room',
  GYM_FRONT_PARKING: 'gym_front_parking',
  SCHOOL_GROUND: 'school_ground',
  FOOD_STREET: 'food_street',
  CLUB_BUILDING: 'club_building',
  WORLD_TREE: 'world_tree',
  REST_AREA: 'rest_area',
  CHURCH_FRONT: 'church_front',
  DAVID_PLAZA: 'david_plaza',
};

/**
 * 位置グループ定数。
 * @public
 */
const LOCATION_GROUPS = {
  SCHOOL_FIRST_FLOOR: '校舎1階',
  SCHOOL_SECOND_FLOOR: '校舎2階',
  ROOFTOP: '校舎屋上',
  GYM: '体育館',
  OUTDOOR: '屋外',
};

const L = LOCATION_IDS;

/**
 * 全位置データ。
 * @public
 */
const LOCATIONS = [
  createLocation(L.ROOF, '屋上', LOCATION_GROUPS.ROOFTOP, [L.OTHER_CLASS_CORRIDOR], { x: 12, y: 0, width: 4, height: 3 }),
  createLocation(L.OTHER_CLASS_CORRIDOR, '別クラス廊下', LOCATION_GROUPS.SCHOOL_SECOND_FLOOR, [L.HALL, L.CLASSROOM_3A_FRONT_CORRIDOR, L.HEALTH_ROOM_FRONT_CORRIDOR, L.ROOF], { x: 12, y: 3, width: 6, height: 4 }),
  createLocation(L.CLASSROOM_3A_FRONT_CORRIDOR, '3-A前廊下', LOCATION_GROUPS.SCHOOL_SECOND_FLOOR, [L.HALL, L.CLASSROOM_3A, L.OTHER_CLASS_CORRIDOR], { x: 18, y: 4, width: 4, height: 4 }),
  createLocation(L.CLASSROOM_3A, '3-A教室', LOCATION_GROUPS.SCHOOL_SECOND_FLOOR, [L.CLASSROOM_3A_FRONT_CORRIDOR], { x: 22, y: 4, width: 4, height: 4 }),
  createLocation(L.HEALTH_ROOM, '保健室', LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, [L.HEALTH_ROOM_FRONT_CORRIDOR], { x: 4, y: 4, width: 4, height: 4 }),
  createLocation(L.HEALTH_ROOM_FRONT_CORRIDOR, '保健室前廊下', LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, [L.HALL, L.HEALTH_ROOM, L.OTHER_CLASS_CORRIDOR], { x: 8, y: 4, width: 4, height: 4 }),
  createLocation(L.HALL, 'ホール', LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, [L.LIBRARY_ROOM_FRONT_CORRIDOR, L.GIRLS_BATHROOM, L.HEALTH_ROOM_FRONT_CORRIDOR, L.CLASSROOM_3A_FRONT_CORRIDOR, L.OTHER_CLASS_CORRIDOR, L.GYM_FRONT_PARKING], { x: 12, y: 7, width: 6, height: 5 }),
  createLocation(L.LIBRARY_ROOM_FRONT_CORRIDOR, '図書室前廊下', LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, [L.LIBRARY_ROOM, L.STAFF_ROOM, L.HALL], { x: 18, y: 8, width: 5, height: 3 }),
  createLocation(L.LIBRARY_ROOM, '図書室', LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, [L.LIBRARY_ROOM_FRONT_CORRIDOR], { x: 23, y: 8, width: 4, height: 3 }),
  createLocation(L.GIRLS_BATHROOM, '女子トイレ', LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, [L.HALL], { x: 8, y: 10, width: 4, height: 3 }),
  createLocation(L.STAFF_ROOM, '職員室', LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, [L.LIBRARY_ROOM_FRONT_CORRIDOR], { x: 18, y: 11, width: 4, height: 3 }),
  createLocation(L.GYM_ARENA, '体育館アリーナ', LOCATION_GROUPS.GYM, [L.GYM_EQUIPMENT_ROOM, L.GYM_CHANGING_ROOM, L.GYM_FRONT_PARKING], { x: 7, y: 14, width: 6, height: 5 }),
  createLocation(L.GYM_FRONT_PARKING, '体育館前広場', LOCATION_GROUPS.OUTDOOR, [L.HALL, L.GYM_ARENA, L.REST_AREA, L.SCHOOL_GROUND], { x: 13, y: 12, width: 5, height: 4 }),
  createLocation(L.SCHOOL_GROUND, 'グラウンド', LOCATION_GROUPS.OUTDOOR, [L.GYM_FRONT_PARKING, L.FOOD_STREET], { x: 18, y: 14, width: 5, height: 3 }),
  createLocation(L.GYM_EQUIPMENT_ROOM, '体育用具室', LOCATION_GROUPS.GYM, [L.GYM_ARENA], { x: 7, y: 19, width: 3, height: 3 }),
  createLocation(L.GYM_CHANGING_ROOM, '更衣室', LOCATION_GROUPS.GYM, [L.GYM_ARENA], { x: 10, y: 19, width: 3, height: 3 }),
  createLocation(L.REST_AREA, '休憩所', LOCATION_GROUPS.OUTDOOR, [L.GYM_FRONT_PARKING, L.CHURCH_FRONT], { x: 13, y: 16, width: 4, height: 5 }),
  createLocation(L.FOOD_STREET, '食堂街', LOCATION_GROUPS.OUTDOOR, [L.SCHOOL_GROUND, L.CLUB_BUILDING, L.CHURCH_FRONT], { x: 21, y: 17, width: 4, height: 7 }),
  createLocation(L.CHURCH_FRONT, '教会前', LOCATION_GROUPS.OUTDOOR, [L.FOOD_STREET, L.REST_AREA, L.DAVID_PLAZA], { x: 17, y: 20, width: 4, height: 4 }),
  createLocation(L.DAVID_PLAZA, 'ダビデ広場', LOCATION_GROUPS.OUTDOOR, [L.CLUB_BUILDING, L.CHURCH_FRONT], { x: 17, y: 24, width: 4, height: 4 }),
  createLocation(L.CLUB_BUILDING, 'クラブ棟', LOCATION_GROUPS.OUTDOOR, [L.FOOD_STREET, L.WORLD_TREE, L.DAVID_PLAZA], { x: 21, y: 24, width: 4, height: 4 }),
  createLocation(L.WORLD_TREE, '世界樹', LOCATION_GROUPS.OUTDOOR, [L.CLUB_BUILDING], { x: 25, y: 24, width: 3, height: 4 }),
];

/**
 * 位置 ID から位置を検索。
 * @public
 * @param {string} locationId - 位置 ID
 * @returns {Object|null} 位置オブジェクト、見つからない場合は null
 */
function findLocation(locationId) {
  return LOCATIONS.find(location => location.id === locationId) ?? null;
}

/**
 * 位置名から位置を検索。
 * @public
 * @param {string} locationName - 位置名
 * @returns {Object|null} 位置オブジェクト、見つからない場合は null
 */
function findLocationByName(locationName) {
  return LOCATIONS.find(location => location.name === locationName) ?? null;
}

/**
 * 場所定義オブジェクトを作成する。
 * @param {string} id - 場所ID。
 * @param {string} name - 表示名。
 * @param {string} group - 場所グループ。
 * @param {Array<string>} destinations - 移動先場所ID配列。
 * @param {Object} area - マップ上の矩形範囲。
 * @returns {Object} 場所定義。
 */
function createLocation(id, name, group, destinations, area) {
  return {
    id,
    name,
    group,
    destinations,
    area,
  };
}

export {
  LOCATION_IDS,
  LOCATION_GROUPS,
  LOCATIONS,
  MAP_GRID_HEIGHT,
  MAP_GRID_WIDTH,
  findLocation,
  findLocationByName,
};
