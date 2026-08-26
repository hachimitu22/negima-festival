import AREA_IDS from './areaIds.js';

/** MainSceneで使用するエリア定義一覧。 */
const AreaList = Object.freeze([
  Object.freeze({ id: AREA_IDS.SCHOOL_ENTRANCE, name: '学園入口' }),
  Object.freeze({ id: AREA_IDS.WORLD_TREE, name: '世界樹' }),
  Object.freeze({ id: AREA_IDS.PLAZA, name: '広場' }),
  Object.freeze({ id: AREA_IDS.CAFETERIA, name: '食堂' }),
]);

export default AreaList;
