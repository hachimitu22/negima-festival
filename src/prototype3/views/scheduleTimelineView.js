import ACTOR_IDS from '../scenes/mainScene/actors/actorIds.js';
import { SCHEDULE_STATUS } from '../scenes/mainScene/schedule.js';

let s_timelineContainer = null;
let s_timeline = null;
let s_dataset = null;

function convertNPCsToTimelineItems({ NPCs, clock }) {
  return NPCs.flatMap((NPC) => {
    const schedules = NPC.schedules.filter((schedule) => schedule.enabled);
    return schedules.map(schedule => {
      const title = `${schedule.dateTimeRange.from} - ${schedule.dateTimeRange.to}`;
      return {
        id: schedule.id,
        group: NPC.id,
        content: schedule.id,
        title: title,
        start: new Date(schedule.dateTimeRange.from),
        end: new Date(schedule.dateTimeRange.to),
        style: schedule.status === SCHEDULE_STATUS.ACTIVE ? 'background-color: green;' : 'background-color: gray;',
      };
    });
  });
}

function createScheduleTimelineView(submitInput, { NPCs, clock }) {
  if (s_timelineContainer === null) {
    // 初回描画
    const container = document.createElement('div');
    container.id = 'visualization';

    const groups = Object.values(ACTOR_IDS).map((actorId) => ({
      id: actorId,
      content: actorId,
    }));

    const dataset = new vis.DataSet(convertNPCsToTimelineItems({ NPCs, clock }));
    const options = {
      start: new Date('2020-06-20 00:00'),
      end: new Date('2020-06-20 24:00'),
      min: new Date('2020-06-20 00:00'),
      max: new Date('2020-06-20 24:00'),

      stack: false,
      moveable: true,
      zoomable: true,
      groupHeightMode: 'fixed',

      // 表示幅の制限
      zoomMin: 30 * 60 * 1000, // 最小30分
      zoomMax: 8 * 60 * 60 * 1000, // 最大8時間

      showCurrentTime: true,
      showMinorLabels: false,
    };

    const timeline = new vis.Timeline(container, dataset, groups, options);
    timeline.setCurrentTime(new Date(clock));

    s_timeline = timeline;
    s_dataset = dataset;
    s_timelineContainer = container;
    return s_timelineContainer;
  } else {
    // 2回目以降の描画

    // 時刻を更新する
    s_timeline.setCurrentTime(new Date(clock));

    // スケジュールを更新する
    const newItems = convertNPCsToTimelineItems({ NPCs, clock });
    s_dataset.clear();
    s_dataset.add(newItems);

    return s_timelineContainer;
  }
}



export default createScheduleTimelineView;
