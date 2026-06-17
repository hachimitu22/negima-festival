const LOCATION_IDS = {
  SCHOOL_BUILDING: 'school-building',
  GROUND: 'ground',
  GYM: 'gym',
  COURTYARD: 'courtyard',
  CHURCH_FRONT: 'church-front',
  DAVID_STATUE_FRONT: 'david-statue-front',
  CLUB_BUILDING: 'club-building',
  WORLD_TREE: 'world-tree',
  STUDENT_DORMITORY: 'student-dormitory',
};

const LOCATIONS = [
  { id: LOCATION_IDS.SCHOOL_BUILDING, name: '校舎' },
  { id: LOCATION_IDS.GROUND, name: 'グラウンド' },
  { id: LOCATION_IDS.GYM, name: '体育館' },
  { id: LOCATION_IDS.COURTYARD, name: '中庭' },
  { id: LOCATION_IDS.CHURCH_FRONT, name: '教会前' },
  { id: LOCATION_IDS.DAVID_STATUE_FRONT, name: 'ダビデ象前' },
  { id: LOCATION_IDS.CLUB_BUILDING, name: 'クラブ棟' },
  { id: LOCATION_IDS.WORLD_TREE, name: '世界樹' },
  { id: LOCATION_IDS.STUDENT_DORMITORY, name: '学生寮' },
];

function findLocation(locationId) {
  return LOCATIONS.find(location => location.id === locationId) ?? null;
}

export {
  LOCATION_IDS,
  LOCATIONS,
  findLocation,
};
