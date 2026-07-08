import { LOCATION_IDS, findLocation } from '../locations.js';
import { BranchEvent } from './branchEvent.js';
import { BRANCH_TASK_STATES } from './branchTask.js';

const EXHIBIT_TROUBLE_EVENT_TYPE = 'exhibit-trouble';
const EXHIBIT_TROUBLE_EVENT_NAME = '展示トラブル対応';

const EXHIBIT_TROUBLE_EVENT_TASK_IDS = Object.freeze({
  DECIDE_APPROACH: 'decide-approach',
  FETCH_SUPPLIES: 'fetch-supplies',
  MOVE_EXHIBIT: 'move-exhibit',
  REPORT_RESULT: 'report-result',
});

const EXHIBIT_TROUBLE_EVENT_CHOICE_IDS = Object.freeze({
  FETCH_SUPPLIES: 'fetch-supplies',
  MOVE_EXHIBIT: 'move-exhibit',
});

/**
 * 展示トラブル対応イベント定義から実行用のBranchEventを生成する。
 *
 * @public
 * @param {number} id - イベントID。
 * @param {Object} config - イベント生成設定。
 * @param {number} config.startHours - イベント開始時刻。
 * @returns {BranchEvent} 展示トラブル対応イベントとして設定された分岐イベント。
 */
function createExhibitTroubleEvent(id, { startHours }) {
  return new BranchEvent(id, {
    type: EXHIBIT_TROUBLE_EVENT_TYPE,
    name: EXHIBIT_TROUBLE_EVENT_NAME,
    startHours,
    startTaskId: EXHIBIT_TROUBLE_EVENT_TASK_IDS.DECIDE_APPROACH,
    tasks: createExhibitTroubleEventTasks(),
  });
}

/**
 * 展示トラブル対応イベントの分岐タスク定義を作成する。
 *
 * @private
 * @returns {Array<Object>} BranchEventへ渡すタスク定義配列。
 */
function createExhibitTroubleEventTasks() {
  return [
    {
      id: EXHIBIT_TROUBLE_EVENT_TASK_IDS.DECIDE_APPROACH,
      title: '展示トラブルへの対応方針を決める',
      choices: [
        {
          id: EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.FETCH_SUPPLIES,
          title: '体育用具室へ資材を取りに行く',
          result: BRANCH_TASK_STATES.SUCCEEDED,
        },
        {
          id: EXHIBIT_TROUBLE_EVENT_CHOICE_IDS.MOVE_EXHIBIT,
          title: 'ホールへ展示場所を移す',
          result: BRANCH_TASK_STATES.FAILED,
        },
      ],
      branches: {
        succeeded: EXHIBIT_TROUBLE_EVENT_TASK_IDS.FETCH_SUPPLIES,
        failed: EXHIBIT_TROUBLE_EVENT_TASK_IDS.MOVE_EXHIBIT,
      },
    },
    {
      id: EXHIBIT_TROUBLE_EVENT_TASK_IDS.FETCH_SUPPLIES,
      title: '展示用の予備資材を集める',
      destination: getRequiredTaskLocation(LOCATION_IDS.GYM_EQUIPMENT_ROOM),
      durationHours: 3,
      branches: {
        succeeded: EXHIBIT_TROUBLE_EVENT_TASK_IDS.REPORT_RESULT,
      },
    },
    {
      id: EXHIBIT_TROUBLE_EVENT_TASK_IDS.MOVE_EXHIBIT,
      title: '代替展示場所を確保する',
      destination: getRequiredTaskLocation(LOCATION_IDS.HALL),
      durationHours: 3,
      branches: {
        succeeded: EXHIBIT_TROUBLE_EVENT_TASK_IDS.REPORT_RESULT,
      },
    },
    {
      id: EXHIBIT_TROUBLE_EVENT_TASK_IDS.REPORT_RESULT,
      title: '展示対応の結果を報告する',
      destination: getRequiredTaskLocation(LOCATION_IDS.STAFF_ROOM),
      durationHours: 2,
    },
  ];
}

/**
 * タスク目的地として使う場所を取得する。
 *
 * @private
 * @param {string} locationId - 場所ID。
 * @returns {Object} タスク目的地。
 */
function getRequiredTaskLocation(locationId) {
  const location = findLocation(locationId);
  if (!location) {
    throw new Error(`Exhibit trouble event location not found: ${locationId}`);
  }

  return location;
}

export {
  EXHIBIT_TROUBLE_EVENT_CHOICE_IDS,
  EXHIBIT_TROUBLE_EVENT_NAME,
  EXHIBIT_TROUBLE_EVENT_TASK_IDS,
  EXHIBIT_TROUBLE_EVENT_TYPE,
  createExhibitTroubleEvent,
};
