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

/**
 * 全位置データ。
 * @public
 */
const LOCATIONS = [
  { id: LOCATION_IDS.LIBRARY_ROOM                 , name: '図書室'         , group: LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, destinations: ['図書室前廊下'] },
  { id: LOCATION_IDS.LIBRARY_ROOM_FRONT_CORRIDOR  , name: '図書室前廊下'   , group: LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, destinations: ['図書室', '職員室', 'ホール'] },
  { id: LOCATION_IDS.STAFF_ROOM                   , name: '職員室'         , group: LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, destinations: ['図書室前廊下'] },
  { id: LOCATION_IDS.HALL                         , name: 'ホール'         , group: LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, destinations: ['図書室前廊下', '女子トイレ', '保健室前廊下', '3-A前廊下', '別クラス廊下', '体育館前広場'] },
  { id: LOCATION_IDS.GIRLS_BATHROOM               , name: '女子トイレ'     , group: LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, destinations: ['ホール'] },
  { id: LOCATION_IDS.HEALTH_ROOM_FRONT_CORRIDOR   , name: '保健室前廊下'   , group: LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, destinations: ['ホール', '保健室', '別クラス廊下'] },
  { id: LOCATION_IDS.HEALTH_ROOM                  , name: '保健室'         , group: LOCATION_GROUPS.SCHOOL_FIRST_FLOOR, destinations: ['保健室前廊下'] },
  { id: LOCATION_IDS.CLASSROOM_3A_FRONT_CORRIDOR  , name: '3-A前廊下'      , group: LOCATION_GROUPS.SCHOOL_SECOND_FLOOR, destinations: ['ホール', '3-A教室', '別クラス廊下'] },
  { id: LOCATION_IDS.CLASSROOM_3A                 , name: '3-A教室'        , group: LOCATION_GROUPS.SCHOOL_SECOND_FLOOR, destinations: ['3-A前廊下'] },
  { id: LOCATION_IDS.OTHER_CLASS_CORRIDOR         , name: '別クラス廊下'   , group: LOCATION_GROUPS.SCHOOL_SECOND_FLOOR, destinations: ['ホール', '3-A前廊下', '保健室前廊下', '屋上'] },
  { id: LOCATION_IDS.ROOF                         , name: '屋上'           , group: LOCATION_GROUPS.ROOFTOP, destinations: ['別クラス廊下'] },
  { id: LOCATION_IDS.GYM_ARENA                    , name: '体育館アリーナ' , group: LOCATION_GROUPS.GYM, destinations: ['体育用具室', '更衣室', '体育館前広場'] },
  { id: LOCATION_IDS.GYM_EQUIPMENT_ROOM           , name: '体育用具室'     , group: LOCATION_GROUPS.GYM, destinations: ['体育館アリーナ'] },
  { id: LOCATION_IDS.GYM_CHANGING_ROOM            , name: '更衣室'         , group: LOCATION_GROUPS.GYM, destinations: ['体育館アリーナ'] },
  { id: LOCATION_IDS.GYM_FRONT_PARKING            , name: '体育館前広場'   , group: LOCATION_GROUPS.OUTDOOR, destinations: ['ホール', '体育館アリーナ', '休憩所', 'グラウンド'] },
  { id: LOCATION_IDS.SCHOOL_GROUND                , name: 'グラウンド'     , group: LOCATION_GROUPS.OUTDOOR, destinations: ['体育館前広場', '食堂街'] },
  { id: LOCATION_IDS.FOOD_STREET                  , name: '食堂街'         , group: LOCATION_GROUPS.OUTDOOR, destinations: ['グラウンド', 'クラブ棟', '教会前'] },
  { id: LOCATION_IDS.CLUB_BUILDING                , name: 'クラブ棟'       , group: LOCATION_GROUPS.OUTDOOR, destinations: ['食堂街', '世界樹', 'ダビデ広場'] },
  { id: LOCATION_IDS.WORLD_TREE                   , name: '世界樹'         , group: LOCATION_GROUPS.OUTDOOR, destinations: ['クラブ棟'] },
  { id: LOCATION_IDS.REST_AREA                    , name: '休憩所'         , group: LOCATION_GROUPS.OUTDOOR, destinations: ['体育館前広場', '教会前'] },
  { id: LOCATION_IDS.CHURCH_FRONT                 , name: '教会前'         , group: LOCATION_GROUPS.OUTDOOR, destinations: ['食堂街', '休憩所', 'ダビデ広場'] },
  { id: LOCATION_IDS.DAVID_PLAZA                  , name: 'ダビデ広場'     , group: LOCATION_GROUPS.OUTDOOR, destinations: ['クラブ棟', '教会前'] },
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

export {
  LOCATION_IDS,
  LOCATION_GROUPS,
  LOCATIONS,
  findLocation,
  findLocationByName,
};
