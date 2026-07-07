import { LOCATION_IDS, LOCATIONS, findLocation } from '../locations.js';
import { BranchEvent } from './branchEvent.js';

const NOTICE_BOARD_EVENT_TYPE = 'notice-board';
const NOTICE_BOARD_EVENT_NAME = '連絡掲示イベント';

const NOTICE_BOARD_EVENT_TASK_IDS = Object.freeze({
  FIND_NOTICE: 'find-notice',
  DELIVER_NOTICE: 'deliver-notice',
  SEARCH_REST_AREA: 'search-rest-area',
  CONFIRM_WORLD_TREE: 'confirm-world-tree',
  REPORT_HALL: 'report-hall',
});

/**
 * 連絡掲示イベント定義から実行用のBranchEventを生成する。
 *
 * @public
 * @param {number} id - イベントID。
 * @param {Object} config - イベント生成設定。
 * @param {string} config.currentLocationId - 開始時のプレイヤー現在地ID。
 * @param {number} config.startHours - イベント開始時刻。
 * @returns {BranchEvent} 連絡掲示イベントとして設定された分岐イベント。
 */
function createNoticeBoardEvent(id, { currentLocationId, startHours }) {
  return new BranchEvent(id, {
    type: NOTICE_BOARD_EVENT_TYPE,
    name: NOTICE_BOARD_EVENT_NAME,
    startHours,
    startTaskId: NOTICE_BOARD_EVENT_TASK_IDS.FIND_NOTICE,
    tasks: createNoticeBoardEventTasks(currentLocationId),
  });
}

/**
 * 連絡掲示イベントの分岐タスク定義を作成する。
 *
 * @private
 * @param {string} currentLocationId - イベント開始時のプレイヤー現在地ID。
 * @returns {Array<Object>} BranchEventへ渡すタスク定義配列。
 */
function createNoticeBoardEventTasks(currentLocationId) {
  return [
    {
      id: NOTICE_BOARD_EVENT_TASK_IDS.FIND_NOTICE,
      title: '紛失した連絡掲示を探す',
      destination: findTaskLocation(
        LOCATION_IDS.LIBRARY_ROOM,
        currentLocationId,
        LOCATION_IDS.STAFF_ROOM,
      ),
      durationHours: 4,
      branches: {
        succeeded: NOTICE_BOARD_EVENT_TASK_IDS.DELIVER_NOTICE,
        failed: NOTICE_BOARD_EVENT_TASK_IDS.SEARCH_REST_AREA,
      },
    },
    {
      id: NOTICE_BOARD_EVENT_TASK_IDS.DELIVER_NOTICE,
      title: '連絡掲示を届ける',
      destination: findTaskLocation(LOCATION_IDS.STAFF_ROOM),
      durationHours: 3,
      branches: {
        succeeded: NOTICE_BOARD_EVENT_TASK_IDS.CONFIRM_WORLD_TREE,
        failed: NOTICE_BOARD_EVENT_TASK_IDS.REPORT_HALL,
      },
    },
    {
      id: NOTICE_BOARD_EVENT_TASK_IDS.SEARCH_REST_AREA,
      title: '代替の集合場所を確認',
      destination: findTaskLocation(LOCATION_IDS.REST_AREA),
      durationHours: 3,
      branches: {
        succeeded: NOTICE_BOARD_EVENT_TASK_IDS.REPORT_HALL,
      },
    },
    {
      id: NOTICE_BOARD_EVENT_TASK_IDS.CONFIRM_WORLD_TREE,
      title: '最終引き渡しを確認',
      destination: findTaskLocation(LOCATION_IDS.WORLD_TREE),
      durationHours: 5,
    },
    {
      id: NOTICE_BOARD_EVENT_TASK_IDS.REPORT_HALL,
      title: '結果を報告',
      destination: findTaskLocation(LOCATION_IDS.HALL),
      durationHours: 2,
    },
  ];
}

/**
 * 連絡掲示タスクで使う目的地を取得し、必要なら代替地点へ差し替える。
 *
 * @private
 * @param {string} locationId - 優先する場所ID。
 * @param {string|null} [excludedLocationId=null] - 除外する場所ID。
 * @param {string|null} [fallbackLocationId=null] - 優先場所が除外対象の場合の代替場所ID。
 * @returns {Object} タスク目的地として使う場所。
 */
function findTaskLocation(locationId, excludedLocationId = null, fallbackLocationId = null) {
  const preferredLocation = findLocation(locationId);
  if (preferredLocation && preferredLocation.id !== excludedLocationId) {
    return preferredLocation;
  }

  const fallbackLocation = fallbackLocationId
    ? findLocation(fallbackLocationId)
    : null;
  if (fallbackLocation && fallbackLocation.id !== excludedLocationId) {
    return fallbackLocation;
  }

  const anyLocation = LOCATIONS.find(location => (
    location.id !== excludedLocationId
  ));
  if (!anyLocation) {
    throw new Error('Notice board event requires at least one usable location.');
  }

  return anyLocation;
}

export {
  NOTICE_BOARD_EVENT_NAME,
  NOTICE_BOARD_EVENT_TASK_IDS,
  NOTICE_BOARD_EVENT_TYPE,
  createNoticeBoardEvent,
};
