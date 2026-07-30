/** 発見地点から得られる内容種別。 */
const PROTOTYPE_DISCOVERY_TYPES = Object.freeze({
  SCHEDULE: 'schedule',
  HAPPENING: 'happening',
  MAGIC_POWER: 'magic-power',
  MAHOPAY: 'mahopay',
});

/** 発見内容を伏せたまま周囲へ示す手掛かり。 */
const PROTOTYPE_DISCOVERY_CUES = Object.freeze([
  Object.freeze({ kind: 'crowd', label: '人が集まっている' }),
  Object.freeze({ kind: 'voice', label: '呼び声が聞こえる' }),
  Object.freeze({ kind: 'sign', label: '気になる掲示がある' }),
  Object.freeze({ kind: 'glimmer', label: '何かが光っている' }),
]);

/** 4エリアへ2件ずつ配置する発見地点。 */
const PROTOTYPE_DISCOVERY_SITES = Object.freeze([
  Object.freeze({ id: 'discovery-food-1', areaId: 'food-street', position: Object.freeze({ x: 8, y: 6 }) }),
  Object.freeze({ id: 'discovery-food-2', areaId: 'food-street', position: Object.freeze({ x: 14, y: 14 }) }),
  Object.freeze({ id: 'discovery-david-1', areaId: 'david-plaza', position: Object.freeze({ x: 18, y: 6 }) }),
  Object.freeze({ id: 'discovery-david-2', areaId: 'david-plaza', position: Object.freeze({ x: 30, y: 14 }) }),
  Object.freeze({ id: 'discovery-gym-1', areaId: 'gym-front', position: Object.freeze({ x: 6, y: 25 }) }),
  Object.freeze({ id: 'discovery-gym-2', areaId: 'gym-front', position: Object.freeze({ x: 14, y: 30 }) }),
  Object.freeze({ id: 'discovery-tree-1', areaId: 'world-tree-front', position: Object.freeze({ x: 18, y: 25 }) }),
  Object.freeze({ id: 'discovery-tree-2', areaId: 'world-tree-front', position: Object.freeze({ x: 30, y: 29 }) }),
]);

/** 1ループに割り当てる発見内容。 */
const PROTOTYPE_DISCOVERY_CONTENTS = Object.freeze([
  PROTOTYPE_DISCOVERY_TYPES.SCHEDULE,
  PROTOTYPE_DISCOVERY_TYPES.HAPPENING,
  PROTOTYPE_DISCOVERY_TYPES.MAGIC_POWER,
  PROTOTYPE_DISCOVERY_TYPES.MAHOPAY,
  PROTOTYPE_DISCOVERY_TYPES.SCHEDULE,
  PROTOTYPE_DISCOVERY_TYPES.HAPPENING,
  PROTOTYPE_DISCOVERY_TYPES.MAGIC_POWER,
  PROTOTYPE_DISCOVERY_TYPES.MAHOPAY,
]);

/** 指定ループ用の未利用発見地点を生成する。 */
function createPrototypeDiscoveries(loopCount) {
  const offset = Math.max(0, loopCount - 1) % PROTOTYPE_DISCOVERY_CONTENTS.length;
  return PROTOTYPE_DISCOVERY_SITES.map((site, index) => {
    const cue = PROTOTYPE_DISCOVERY_CUES[(index + offset) % PROTOTYPE_DISCOVERY_CUES.length];
    return {
      id: site.id,
      areaId: site.areaId,
      position: { ...site.position },
      type: PROTOTYPE_DISCOVERY_CONTENTS[(index + offset) % PROTOTYPE_DISCOVERY_CONTENTS.length],
      cueKind: cue.kind,
      cueLabel: cue.label,
      isDiscovered: false,
    };
  });
}

export {
  PROTOTYPE_DISCOVERY_SITES,
  PROTOTYPE_DISCOVERY_CUES,
  PROTOTYPE_DISCOVERY_TYPES,
  createPrototypeDiscoveries,
};
