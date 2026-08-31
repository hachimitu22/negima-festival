import SCHEDULE_IDS from "./scheduleIds.js";
import ClockDateTime from '../clockDateTime.js';
import ClockDateTimeRange from '../clockDateTimeRange.js';
import AREA_IDS from '../areaIds.js';

const SCHEDULES = {
  [SCHEDULE_IDS.ASUNA.WORLD_TREE_WAITING]: {
    id: SCHEDULE_IDS.ASUNA.WORLD_TREE_WAITING,
    dateTimeRange: new ClockDateTimeRange({
      from: new ClockDateTime({ date: 20, hour: 10, min: 0 }),
      to: new ClockDateTime({ date: 20, hour: 11, min: 0 }),
    }),
    areaId: AREA_IDS.WORLD_TREE,
  },
  [SCHEDULE_IDS.ASUNA.PLAZA_WAITING]: {
    id: SCHEDULE_IDS.ASUNA.PLAZA_WAITING,
    dateTimeRange: new ClockDateTimeRange({
      from: new ClockDateTime({ date: 20, hour: 11, min: 0 }),
      to: new ClockDateTime({ date: 20, hour: 12, min: 0 }),
    }),
    areaId: AREA_IDS.PLAZA,
  },
  [SCHEDULE_IDS.NODOKA.PLAZA_WAITING]: {
    id: SCHEDULE_IDS.NODOKA.PLAZA_WAITING,
    dateTimeRange: new ClockDateTimeRange({
      from: new ClockDateTime({ date: 20, hour: 10, min: 0 }),
      to: new ClockDateTime({ date: 20, hour: 11, min: 0 }),
    }),
    areaId: AREA_IDS.PLAZA,
  },
};

export default SCHEDULES;
