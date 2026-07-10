/**
 * ユーザー入力のアクション型定数。
 * 
 * @public
 * @type {Object}
 * @property {string} TARGET_ACTIVATE - ターゲットを操作する入力
 */
const INPUT_TYPES = {
  TARGET_ACTIVATE: 'target.activate',
};

/**
 * メインゲーム画面内の操作対象（アクター、会話、ロケーション、カシオペアUI）の識別プレフィックス。
 * 
 * 入力オブジェクトの id は、これらのプレフィックスで始まり、コロンの後に実体のIDを続ける形式。
 * 例: 'actor:character-01', 'location:library'
 * 
 * @public
 * @type {Object}
 * @property {string} CASSIOPEIA - カシオペア操作パネル用プレフィックス
 * @property {string} CONVERSATION_SCENE - 会話シーン遷移用プレフィックス
 * @property {string} LOCATION - ロケーション移動用プレフィックス
 * @property {string} MAP_POSITION - マップ座標移動用プレフィックス
 * @property {string} ACTOR - キャラクターアクター用プレフィックス
 * @property {string} BRANCH_CHOICE - 分岐イベント選択肢用プレフィックス
 */
const TARGET_PREFIXES = {
  CASSIOPEIA: 'cassiopeia',
  CONVERSATION_SCENE: 'conversation',
  LOCATION: 'location',
  MAP_POSITION: 'map-position',
  ACTOR: 'actor',
  BRANCH_CHOICE: 'branch-choice',
};

/**
 * メインゲームシーン内のレイヤー識別子定数。
 * 
 * GameEngine のレイヤースタック管理で、activeLayerId として使用される。
 * 
 * @public
 * @type {Object}
 * @property {string} CONVERSATION - 会話表示レイヤー
 * @property {string} MAP - マップ表示レイヤー
 */
const MAIN_GAME_LAYER_IDS = {
  CONVERSATION: 'conversation',
  MAP: 'map',
};

/**
 * ゲームシーン識別子定数。
 * 
 * GameEngine のシーンスタック管理で、シーンの型定義や遷移判定に使用される。
 * 
 * @public
 * @type {Object}
 * @property {string} CONVERSATION - 会話シーン
 * @property {string} MAIN_GAME - メインゲームシーン
 */
const SCENE_IDS = {
  CONVERSATION: 'conversation',
  MAIN_GAME: 'main-game',
};

export {
  INPUT_TYPES,
  MAIN_GAME_LAYER_IDS,
  SCENE_IDS,
  TARGET_PREFIXES,
};
