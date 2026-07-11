const FESTIVAL_DURATION_HOURS = 72;
const TIME_TRAVEL_HOURS = 24;
const GAME_HOURS_PER_REAL_SECOND = 0.5;
const CASSIOPEIA_MAGIC_POWER_COST = 30;

/**
 * メインゲーム中の時間進行とカシオペア遡行を管理するSystem。
 *
 * @public
 */
class TimeControlSystem {
  #character;
  #gameTime;
  #loop;

  /**
   * TimeControlSystemを生成する。
   *
   * @public
   * @param {Object} config - 生成設定。
   * @param {Character} config.character - 主人公Character。
   * @param {number} [config.durationHours] - 祭終了時刻。
   * @param {number} [config.hoursPerRealSecond] - 実時間1秒あたりのゲーム時間。
   * @param {number} [config.timeTravelHours] - カシオペアで戻す時間。
   * @param {number} [config.cassiopeiaMagicPowerCost] - カシオペア消費MP。
   */
  constructor({
    character,
    durationHours = FESTIVAL_DURATION_HOURS,
    hoursPerRealSecond = GAME_HOURS_PER_REAL_SECOND,
    timeTravelHours = TIME_TRAVEL_HOURS,
    cassiopeiaMagicPowerCost = CASSIOPEIA_MAGIC_POWER_COST,
  }) {
    if (!character) {
      throw new TypeError('character is required.');
    }

    this.#character = character;
    this.#gameTime = {
      currentHours: 0,
      durationHours,
      hoursPerRealSecond,
      isEnded: false,
    };
    this.#loop = {
      count: 1,
      timeTravelHours,
      cassiopeiaMagicPowerCost,
    };
  }

  /**
   * frame経過量からゲーム時間を進める。
   *
   * @public
   * @param {Object} frame - frame更新情報。
   * @returns {Object} 時間更新結果。
   */
  advance(frame = {}) {
    if (this.#gameTime.isEnded) {
      return {
        currentHours: this.#gameTime.currentHours,
        elapsedGameHours: 0,
        isEnded: this.#gameTime.isEnded,
      };
    }

    const deltaTimeMs = getFrameDeltaTimeMs(frame);
    const elapsedHours = (
      deltaTimeMs / 1000
    ) * this.#gameTime.hoursPerRealSecond;
    const beforeHours = this.#gameTime.currentHours;
    this.#gameTime.currentHours = Math.min(
      this.#gameTime.currentHours + elapsedHours,
      this.#gameTime.durationHours,
    );
    this.#gameTime.isEnded = (
      this.#gameTime.currentHours >= this.#gameTime.durationHours
    );

    return {
      currentHours: this.#gameTime.currentHours,
      elapsedGameHours: this.#gameTime.currentHours - beforeHours,
      isEnded: this.#gameTime.isEnded,
    };
  }

  /**
   * カシオペアを使い、MP消費と時間遡行を反映する。
   *
   * @public
   * @returns {Object|boolean} 成功時は巻き戻し後時刻、MP不足時はfalse。
   */
  useCassiopeia() {
    const magicPower = this.#character.magicPower;
    if (magicPower.current < this.#loop.cassiopeiaMagicPowerCost) {
      return false;
    }

    magicPower.current -= this.#loop.cassiopeiaMagicPowerCost;
    this.#gameTime.currentHours = Math.max(
      0,
      this.#gameTime.currentHours - this.#loop.timeTravelHours,
    );
    this.#gameTime.isEnded = false;
    this.#loop.count += 1;

    return {
      currentHours: this.#gameTime.currentHours,
    };
  }

  /**
   * 現在ゲーム時間を返す。
   *
   * @public
   * @returns {number} 現在ゲーム時間。
   */
  getCurrentHours() {
    return this.#gameTime.currentHours;
  }

  /**
   * 祭終了時刻を返す。
   *
   * @public
   * @returns {number} 祭終了時刻。
   */
  getDurationHours() {
    return this.#gameTime.durationHours;
  }

  /**
   * フェス終了済みかを返す。
   *
   * @public
   * @returns {boolean} 終了済みの場合はtrue。
   */
  isFestivalEnded() {
    return this.#gameTime.isEnded;
  }

  /**
   * 時間とループのsnapshot fragmentを作る。
   *
   * @public
   * @returns {Object} snapshot fragment。
   */
  createSnapshotFragment() {
    return {
      gameTime: {
        currentHours: this.#gameTime.currentHours,
        durationHours: this.#gameTime.durationHours,
        isEnded: this.#gameTime.isEnded,
      },
      loop: {
        count: this.#loop.count,
        timeTravelHours: this.#loop.timeTravelHours,
        cassiopeiaMagicPowerCost: this.#loop.cassiopeiaMagicPowerCost,
      },
    };
  }

  /**
   * 他System更新用の時間context fragmentを作る。
   *
   * @public
   * @param {Object} frame - frame更新情報。
   * @returns {Object} context fragment。
   */
  createUpdateContextFragment(frame = {}) {
    const deltaTimeMs = getFrameDeltaTimeMs(frame);
    const targetFrameTimeMs = getTargetFrameTimeMs(frame);
    return {
      deltaTimeMs,
      frameCount: getFrameCount(frame),
      targetFrameTimeMs,
      deltaFrames: deltaTimeMs / targetFrameTimeMs,
      gameTimeHours: this.#gameTime.currentHours,
      isFestivalEnded: this.#gameTime.isEnded,
    };
  }
}

function getFrameDeltaTimeMs(frame) {
  if (typeof frame.deltaTimeMs === 'number') {
    return frame.deltaTimeMs;
  }

  if (typeof frame.deltaTime === 'number') {
    return frame.deltaTime;
  }

  return 0;
}

function getFrameCount(frame) {
  if (typeof frame.frameCount === 'number') {
    return frame.frameCount;
  }

  return frame.count;
}

function getTargetFrameTimeMs(frame) {
  return typeof frame.targetFrameTimeMs === 'number'
    ? frame.targetFrameTimeMs
    : 1000 / 60;
}

export {
  CASSIOPEIA_MAGIC_POWER_COST,
  FESTIVAL_DURATION_HOURS,
  GAME_HOURS_PER_REAL_SECOND,
  TIME_TRAVEL_HOURS,
  TimeControlSystem,
};
