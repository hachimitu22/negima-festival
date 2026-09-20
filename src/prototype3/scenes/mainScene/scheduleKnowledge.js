/** プレイヤーが認知しているスケジュールを管理する。 */
class ScheduleKnowledge {
  #knownScheduleIds = new Set();

  /**
   * スケジュールを認知済みにする。
   * @param {string} scheduleId - スケジュールID。
   * @returns {void}
   */
  learn(scheduleId) {
    this.#knownScheduleIds.add(scheduleId);
  }

  /**
   * 現在のSchedule状態からスケジュール帳を作る。
   * @param {Array<Object>} scheduleSnapshots - 全Scheduleの現在状態。
   * @returns {{ schedules: Array<Object> }} 表示用のスケジュール帳。
   */
  createScheduleBook(scheduleSnapshots) {
    const schedulesById = new Map(
      scheduleSnapshots.map(schedule => [schedule.id, schedule]),
    );
    const schedules = [...this.#knownScheduleIds].map(scheduleId => {
      const schedule = schedulesById.get(scheduleId);
      if (!schedule) {
        throw new Error(`schedule-not-found: ${scheduleId}`);
      }
      return schedule;
    });

    return { schedules };
  }
}

export default ScheduleKnowledge;
