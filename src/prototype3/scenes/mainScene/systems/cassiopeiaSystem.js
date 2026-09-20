import GameSystem from '../../../gameEngine/gameSystem.js';
import INPUT_IDS from '../../../inputIds.js';
import SYSTEM_IDS from './systemIds.js';

/** MainSceneでカシオペアによる簡易巻き戻しを調停する。 */
class CassiopeiaSystem extends GameSystem {
  #clockSystem;
  #actorSystem;
  #eventSystem;
  #startCheckpoint;

  /** CassiopeiaSystemを生成する。 */
  constructor({ clockSystem, actorSystem, eventSystem }) {
    super(SYSTEM_IDS.CASSIOPEIA);
    this.#clockSystem = clockSystem;
    this.#actorSystem = actorSystem;
    this.#eventSystem = eventSystem;
    this.#startCheckpoint = {
      dateTime: clockSystem.getDateTime(),
      actors: actorSystem.captureState(),
      events: eventSystem.captureState(),
    };
  }

  /**
   * 簡易巻き戻し入力を登録する。
   * @param {Object} context - 依存解決API。
   * @returns {void}
   */
  attach(context) {
    context.inputDispatcher.register({
      inputId: INPUT_IDS.CASSIOPEIA.REWIND,
      handler: () => {
        this.#rewind();
      },
    });
  }

  /**
   * 記録した時刻へ戻し、成功した場合だけ記録した状態を復元する。
   * @returns {void}
   */
  #rewind() {
    if (!this.#clockSystem.rewindTo(this.#startCheckpoint.dateTime)) {
      return;
    }

    this.#actorSystem.restoreState(this.#startCheckpoint.actors);
    this.#eventSystem.restoreState(this.#startCheckpoint.events);
  }
}

export default CassiopeiaSystem;
