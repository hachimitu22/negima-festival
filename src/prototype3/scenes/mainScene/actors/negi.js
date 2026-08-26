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
}

export default Negi;
