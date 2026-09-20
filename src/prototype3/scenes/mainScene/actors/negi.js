import Actor from './actor.js';
import ACTOR_IDS from './actorIds.js';

class Negi extends Actor {
  constructor({ areaId }) {
    super({
      id: ACTOR_IDS.PLAYER,
      name: 'ネギ',
      areaId,
    });
  }
  update() {
    // プレイヤーの入力によって変わるため何もしない
  }

  /**
   * 巻き戻しでは記録を適用せず、現在のプレイヤー状態を維持する。
   * @param {Object} state - 記録したActor状態。
   * @returns {void}
   */
  restore(state) {
  }
}

export default Negi;
