import GameSystem from '../../../gameEngine/gameSystem.js';
import SYSTEM_IDS from './systemIds.js';

class ClockSystem extends GameSystem {
  #clock;

  constructor() {
    super(SYSTEM_IDS.CLOCK);
    
    this.#clock = new Date('2003/06/20 10:00');
  }

  /**
   * 全System登録後に依存Systemを解決する。
   * @param {Object} dependencies - 依存解決API。
   * @param {Function} dependencies.requireSystem - System取得関数。
   * @returns {void}
   */
  attach(context) {
  }

  /**
   * Systemを更新する。
   * @param {Object} context - フレームコンテキスト。
   * @returns {void}
   */
  update(context) {
    // ダイアログ表示中は時間を経過させない
    if (context.getSystem(SYSTEM_IDS.DIALOGUE).hasActiveDialogue()) {
      return;
    }

    this.#clock.setMinutes(this.#clock.getMinutes() + 5);
  }

  createClockSnapshot() {
    const timeOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };
    return Intl.DateTimeFormat('ja-JP', timeOptions).format(this.#clock);
  }
}

export default ClockSystem;
