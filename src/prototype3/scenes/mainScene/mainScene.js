import GameScene from '../../gameEngine/gameScene.js';
import Actor from './actor.js';
import ACTOR_IDS from './actorIds.js';
import AreaList from './AreaList.js';
import AREA_IDS from './areaIds.js';
import Events from './events/events.js';
import ActorSystem from './systems/actorSystem.js';
import AreaSystem from './systems/areaSystem.js';
import DialogueSystem from './systems/dialogueSystem.js';
import EventSystem from './systems/eventSystem.js';
import SYSTEM_IDS from './systems/systemIds.js';
import TALK_IDS from './talks/talkIds.js';

/** 移動と明日菜イベントを提供するプロトタイプver3のMainScene。 */
class MainScene extends GameScene {
  /**
   * Systemと初期ゲーム状態を構築する。
   * @param {Object} options - Scene設定。
   */
  constructor() {
    super();

    const actorSystem = new ActorSystem();
    const areaSystem = new AreaSystem({ areas: AreaList });
    const eventSystem = new EventSystem({ events: Events });
    const dialogueSystem = new DialogueSystem();

    actorSystem.addActor(new Actor({
      id: ACTOR_IDS.PLAYER,
      name: 'ネギ',
      areaId: AREA_IDS.SCHOOL_ENTRANCE,
    }));
    actorSystem.addActor(new Actor({
      id: ACTOR_IDS.ASUNA,
      name: '明日菜',
      areaId: AREA_IDS.WORLD_TREE,
      talks: [TALK_IDS.ASUNA_NORMAL],
    }));
    actorSystem.addActor(new Actor({
      id: ACTOR_IDS.NODOKA,
      name: 'のどか',
      areaId: AREA_IDS.PLAZA,
      talks: [TALK_IDS.NODOKA_NORMAL],
    }));

    this.addSystem(actorSystem);
    this.addSystem(areaSystem);
    this.addSystem(eventSystem);
    this.addSystem(dialogueSystem);
    this.initializeSystems();
  }

  /**
   * rendererへ渡すゲーム状態を作成する。
   * @returns {Object} SceneSnapshot。
   */
  createSnapshot() {
    const actorSystem = this.getSystem(SYSTEM_IDS.ACTOR);
    const areaSystem = this.getSystem(SYSTEM_IDS.AREA);
    const dialogueSystem = this.getSystem(SYSTEM_IDS.DIALOGUE);
    const eventSystem = this.getSystem(SYSTEM_IDS.EVENT);
    const actors = actorSystem.createActorsSnapshot();
    const player = actors.find(actor => actor.id === ACTOR_IDS.PLAYER);
    const { areas, moveableAreas } = areaSystem.createAreasSnapshot(player?.areaId);

    return {
      sceneId: 'prototype3-main',
      actors: actors,
      player: { ...player },
      NPCs: actors.filter(actor => actor.id !== ACTOR_IDS.PLAYER),
      areas,
      moveableAreas,
      dialogue: dialogueSystem.createDialogueSnapshot(),
      events: eventSystem.createEventsSnapshot(),
    };
  }
}

export default MainScene;
