/**
 * 空間状態versionから場所訪問requestを発行するSystem。
 *
 * @public
 */
class LocationSystem {
  #locationRequests;
  #previousSpatialVersions;
  #visitSources;

  /**
   * LocationSystemを生成する。
   *
   * @public
   * @param {Object} [config={}] - 生成設定。
   * @param {Object<string, Function>} [config.visitSources] - version key別の訪問ID source。
   * @param {Object} [config.locationRequests] - 場所request API。
   */
  constructor({
    visitSources = {},
    locationRequests = {},
  } = {}) {
    this.#visitSources = visitSources;
    this.#locationRequests = locationRequests;
    this.#previousSpatialVersions = new Map();
  }

  /**
   * 空間状態versionを確認し、変化したsourceの訪問IDをrequestへ変換する。
   *
   * @public
   * @param {Object} [options={}] - 更新入力。
   * @param {Array<Object>} [options.subjects=[]] - 空間対象。将来の進入、退出判定用。
   * @param {Object<string, number>} [options.spatialVersions={}] - 空間状態version。
   * @returns {Object} 更新結果。
   */
  update({
    subjects = [],
    spatialVersions = {},
  } = {}) {
    void subjects;

    const changedSpatialKeys = this.#getChangedSpatialKeys(spatialVersions);
    this.#storeSpatialVersions(spatialVersions);

    const visitedLocationIds = this.#consumeVisitedLocationIds(
      changedSpatialKeys,
    );
    if (visitedLocationIds.length > 0) {
      this.#locationRequests.visitLocations?.(visitedLocationIds);
    }

    return {
      changedSpatialKeys,
      visitedLocationIds,
    };
  }

  #getChangedSpatialKeys(spatialVersions) {
    return Object.entries(spatialVersions)
      .filter(([key, version]) => (
        !this.#previousSpatialVersions.has(key)
        || this.#previousSpatialVersions.get(key) !== version
      ))
      .map(([key]) => key);
  }

  #storeSpatialVersions(spatialVersions) {
    this.#previousSpatialVersions = new Map(Object.entries(spatialVersions));
  }

  #consumeVisitedLocationIds(changedSpatialKeys) {
    const visitedLocationIds = [];
    const visitedLocationIdSet = new Set();

    changedSpatialKeys.forEach(key => {
      const source = this.#visitSources[key];
      if (typeof source !== 'function') {
        return;
      }

      const sourceLocationIds = source();
      if (!Array.isArray(sourceLocationIds)) {
        return;
      }

      sourceLocationIds.forEach(locationId => {
        if (
          typeof locationId !== 'string'
          || visitedLocationIdSet.has(locationId)
        ) {
          return;
        }

        visitedLocationIdSet.add(locationId);
        visitedLocationIds.push(locationId);
      });
    });

    return visitedLocationIds;
  }
}

export {
  LocationSystem,
};
