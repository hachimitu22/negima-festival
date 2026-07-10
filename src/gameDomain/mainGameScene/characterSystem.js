import { findLocation } from './locations.js';

const PLAYER_SPATIAL_SUBJECT_ID = 'player';

/**
 * 主人公と登場人物の位置、移動、位置snapshotを管理するSystem。
 *
 * @public
 */
class CharacterSystem {
  #playerCharacter;
  #actors;
  #gridMap;
  #spatialStateVersion;

  /**
   * CharacterSystemを生成する。
   *
   * @public
   * @param {Object} config - 生成設定。
   * @param {Character} config.playerCharacter - 主人公Character。
   * @param {Array<Actor>} config.actors - NPC actor配列。
   * @param {GridMap} config.gridMap - 経路探索に使うグリッドマップ。
   */
  constructor({ playerCharacter, actors = [], gridMap }) {
    if (!playerCharacter) {
      throw new TypeError('playerCharacter is required.');
    }

    if (!gridMap) {
      throw new TypeError('gridMap is required.');
    }

    this.#playerCharacter = playerCharacter;
    this.#actors = [...actors];
    this.#gridMap = gridMap;
    this.#spatialStateVersion = 0;
  }

  /**
   * 主人公とactorのフレーム更新を行う。
   *
   * @public
   * @param {Object} context - 更新コンテキスト。
   * @returns {void}
   */
  update(context) {
    const updateContext = {
      gridMap: this.#gridMap,
      ...context,
    };
    const beforeSignature = this.#createSpatialSignature();
    this.#playerCharacter.update(updateContext);
    this.#actors.forEach(actor => {
      actor.update(updateContext);
    });
    this.#incrementSpatialVersionIfChanged(beforeSignature);
  }

  /**
   * 場所IDを目的地として主人公の移動を開始する。
   *
   * @public
   * @param {string} locationId - 目的地の場所ID。
   * @param {Object} [options={}] - 移動オプション。
   * @param {string|null} [options.companionActorId=null] - 同行者actor ID。
   * @returns {boolean} 移動開始できた場合はtrue。
   */
  movePlayerToLocation(locationId, { companionActorId = null } = {}) {
    const location = findLocation(locationId);
    if (!location) {
      return false;
    }

    const path = this.#gridMap.findPathToLocation(
      this.#playerCharacter.position,
      location.id,
    );
    return this.#startPlayerMovement(path, { companionActorId });
  }

  /**
   * マップ座標を目的地として主人公の移動を開始する。
   *
   * @public
   * @param {Object} position - 目的地座標。
   * @param {Object} [options={}] - 移動オプション。
   * @param {string|null} [options.companionActorId=null] - 同行者actor ID。
   * @returns {boolean} 移動開始できた場合はtrue。
   */
  movePlayerToMapPosition(position, { companionActorId = null } = {}) {
    const path = this.#gridMap.findPath(
      this.#playerCharacter.position,
      position,
    );
    return this.#startPlayerMovement(path, { companionActorId });
  }

  /**
   * actorを指定場所へ即時移動する。
   *
   * @public
   * @param {string} actorId - actor ID。
   * @param {string} locationId - 移動先場所ID。
   * @returns {boolean} 移動できた場合はtrue。
   */
  moveActorToLocation(actorId, locationId) {
    const actor = this.findActor(actorId);
    const location = findLocation(locationId);
    if (!actor || !location) {
      return false;
    }

    const beforeSignature = this.#createSpatialSignature();
    const didMove = actor.moveToLocation(location.id);
    if (didMove) {
      this.#incrementSpatialVersionIfChanged(beforeSignature);
    }
    return didMove;
  }

  /**
   * actorの移動モードを変更する。
   *
   * @public
   * @param {string} actorId - actor ID。
   * @param {string} movementMode - 移動モード。
   * @returns {boolean} 変更できた場合はtrue。
   */
  setActorMovementMode(actorId, movementMode) {
    const actor = this.findActor(actorId);
    if (!actor) {
      return false;
    }

    return actor.setMovementMode(movementMode);
  }

  /**
   * actorの次回自動移動時刻をリセットする。
   *
   * @public
   * @param {string} actorId - actor ID。
   * @param {number} currentGameTimeHours - 現在ゲーム内時刻。
   * @returns {boolean} リセットできた場合はtrue。
   */
  resetActorNextMoveTime(actorId, currentGameTimeHours) {
    const actor = this.findActor(actorId);
    if (!actor) {
      return false;
    }

    actor.resetNextMoveTime(currentGameTimeHours);
    return true;
  }

  /**
   * 全actorの次回自動移動時刻をリセットする。
   *
   * @public
   * @param {number} currentGameTimeHours - 現在ゲーム内時刻。
   * @returns {void}
   */
  resetAllActorNextMoveTimes(currentGameTimeHours) {
    this.#actors.forEach(actor => {
      actor.resetNextMoveTime(currentGameTimeHours);
    });
  }

  /**
   * actor IDからactorを返す。
   *
   * @public
   * @param {string} actorId - actor ID。
   * @returns {Actor|null} 対象actor。見つからない場合はnull。
   */
  findActor(actorId) {
    return this.#actors.find(candidate => candidate.id === actorId) ?? null;
  }

  /**
   * 主人公と同じ場所にいるactorだけを返す。
   *
   * @public
   * @param {string} actorId - actor ID。
   * @returns {Actor|null} 会話可能なactor。対象外ならnull。
   */
  findTalkableActor(actorId) {
    const actor = this.findActor(actorId);
    if (!actor || actor.locationId !== this.#playerCharacter.locationId) {
      return null;
    }

    return actor;
  }

  /**
   * 主人公Characterを返す。
   *
   * @public
   * @returns {Character} 主人公Character。
   */
  getPlayerCharacter() {
    return this.#playerCharacter;
  }

  /**
   * actor配列を返す。
   *
   * @public
   * @returns {Array<Actor>} actor配列。
   */
  getActors() {
    return [...this.#actors];
  }

  /**
   * 主人公の現在地IDを返す。
   *
   * @public
   * @returns {string} 主人公の現在地ID。
   */
  getPlayerLocationId() {
    return this.#playerCharacter.locationId;
  }

  /**
   * 主人公が前回取得以降に入った場所IDを返してクリアする。
   *
   * @public
   * @returns {Array<string>} 場所ID配列。
   */
  consumeVisitedPlayerLocationIds() {
    return this.#playerCharacter.consumeVisitedLocationIds();
  }

  /**
   * 位置を持つ対象の読み取りモデルを返す。
   *
   * @public
   * @returns {Array<Object>} 空間対象配列。
   */
  getSpatialSubjects() {
    return [
      createSpatialSubject({
        subjectType: 'character',
        subjectId: PLAYER_SPATIAL_SUBJECT_ID,
        source: this.#playerCharacter,
      }),
      ...this.#actors.map(actor => createSpatialSubject({
        subjectType: 'actor',
        subjectId: actor.id,
        source: actor,
      })),
    ];
  }

  /**
   * 位置状態versionを返す。
   *
   * @public
   * @returns {number} 位置状態version。
   */
  getSpatialStateVersion() {
    return this.#spatialStateVersion;
  }

  /**
   * Scene snapshot向けのfragmentを返す。
   *
   * @public
   * @returns {Object} characterとactorsのsnapshot fragment。
   */
  createSnapshotFragment() {
    return {
      character: this.#playerCharacter.getSnapshot(),
      actors: this.#actors.map(actor => actor.getSnapshot()),
    };
  }

  #startPlayerMovement(path, { companionActorId = null } = {}) {
    const didMove = this.#playerCharacter.startMovement(path);
    if (!didMove) {
      return false;
    }

    this.#startCompanionMovement(path, companionActorId);
    return true;
  }

  #startCompanionMovement(playerPath, companionActorId) {
    if (!companionActorId) {
      return false;
    }

    const companion = this.findActor(companionActorId);
    const destination = playerPath?.at(-1);
    const companionPath = companion && destination
      ? this.#gridMap.findPath(companion.position, destination)
      : null;

    return companion?.startMovement(companionPath) ?? false;
  }

  #incrementSpatialVersionIfChanged(beforeSignature) {
    if (this.#createSpatialSignature() !== beforeSignature) {
      this.#spatialStateVersion += 1;
    }
  }

  #createSpatialSignature() {
    return JSON.stringify(this.getSpatialSubjects());
  }
}

function createSpatialSubject({ subjectType, subjectId, source }) {
  return {
    subjectType,
    subjectId,
    locationId: source.locationId,
    position: {
      x: source.position.x,
      y: source.position.y,
    },
  };
}

export {
  CharacterSystem,
  PLAYER_SPATIAL_SUBJECT_ID,
};
