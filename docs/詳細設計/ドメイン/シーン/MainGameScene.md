# MainGameScene（メインゲームシーン）

<script setup>
import MahoPayTransactionTable from '../../../.vitepress/components/MahoPayTransactionTable.vue'
</script>

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/mainGameScene.js`
- 対応する基本仕様: [メインゲームシーン](../../../基本設計/シーン/メインゲームシーン.md)

## 目的

麻帆良祭のゲーム状態を所有し、プレイヤーと登場人物、MahoPayポイント、グリッドマップ、継続イベントを更新する。
ゲーム時間、フェス終了状態、ループ回数、カシオペア遡行は`TimeControlSystem`へ委譲する。
入力モード、フレーム制御状態、表示layerの決定は`GameFlowSystem`へ委譲する。
主人公と登場人物の位置、移動、移動snapshot生成は`CharacterSystem`へ委譲する。
主人公の場所訪問検出と訪問request発行は`LocationSystem`へ委譲する。
会話の開始条件と台本を決定し、進行中会話の保持、入力処理、時間停止、snapshot生成は`DialogueSystem`へ委譲する。
通常入力のtarget解釈は`PlayerControlSystem`へ委譲する。
継続イベントの保持、進行、イベント会話、実行中イベントsnapshotは`EventSystem`へ委譲する。
会話やイベントによる好感度、MahoPayポイント報酬の反映は`RewardSystem`へ委譲する。

## 所有する状態

| 状態                      | 内容                                             |
| ------------------------- | ------------------------------------------------ |
| `timeControlSystem`       | ゲーム時間、フェス終了、ループ、カシオペア遡行 |
| `gameFlowSystem`          | 入力モード、フレーム制御、表示layer |
| `characterSystem`         | 主人公と登場人物の位置、移動、位置snapshot |
| `locationSystem`          | 空間状態version監視と場所訪問request発行 |
| `dialogueSystem`          | メインゲーム内会話のsession、入力、時間停止、snapshot |
| `playerControlSystem`     | 通常入力の解釈とrequest発行                 |
| `eventSystem`             | 継続イベント、イベント会話、実行中イベントsnapshot |
| `rewardSystem`            | 好感度とMahoPayポイント報酬の反映 |

初期layerはmap、初期の配達または同行はなしとする。
`EventSystem`が初期の見回りと分岐イベントを生成し、最初のsnapshotから実行中イベントとして公開する。
キャラクター、登場人物、各数値の初期値は基本設計を正本とする。

## 公開契約

```js
class MainGameScene {
  update({ context })
  createSnapshot()
}
```

## 更新順序

1. `DialogueSystem.beginFrame()`を呼び出す。
2. `GameFlowSystem.beginFrame({ dialogue })`でフレーム開始時点の入力モードを確定する。
3. `DialogueSystem.processInput(inputs)`で進行中会話の入力を処理する。
4. `GameFlowSystem.canProcessFieldInput()`が`true`なら、input全体から会話開始を成立させるactor入力を探す。
5. 成立した場合は`EventSystem.requestActorConversation()`へactorと現在地を渡す。
6. `GameFlowSystem.createControlContext({ dialogue })`でフレーム制御状態を決定する。
7. `gameplayInputEnabled`が`true`なら、`PlayerControlSystem.update()`で通常入力をrequestへ変換する。
8. `gameplaySimulationEnabled`が`true`なら、`TimeControlSystem.advance(frame)`でゲーム時間を進める。
9. 更新後のゲーム時間を`EventSystem.advanceTo(currentHours)`へ通知する。
10. 経過ゲーム時間と実時間deltaを含むcontextで`CharacterSystem.update()`を呼ぶ。
11. `LocationSystem.update()`へ`CharacterSystem`の空間対象と空間状態versionを渡し、場所訪問requestを発行する。

会話遷移を最優先することで、同じframeの場所移動、時間進行、人物移動を会話開始前に実行しない。

## input

`MainGameScene`は会話開始用のactor入力だけを直接確認する。
それ以外の通常入力解釈は`PlayerControlSystem`が担当する。

`INPUT_TYPES.TARGET_ACTIVATE`だけを対象にする。

| target                  | 処理                             |
| ----------------------- | -------------------------------- |
| `actor:<actorId>`       | 会話開始条件を判定する           |
| `map-position:<x>,<y>`  | マップ座標へプレイヤーを移動する |
| `cassiopeia`            | `TimeControlSystem`へ使用requestを渡す |

`map-position`の`x`と`y`は32x32グリッド上の連続座標とする。
目的地が場所に属さない、または壁で到達できない場合は移動を開始しない。
移動中に別の`map-position`入力を受けた場合は、現在座標から目的地まで経路を引き直す。
同行中にプレイヤーの移動経路が変わった場合は、`CharacterSystem`へ同伴者IDを渡し、同伴者も同じ目的地へ移動させる。

## グリッドマップ移動

- マップは32x32マスで、場所定義が矩形領域を持つ。
- 通行可能マスは場所領域だけとし、場所に属さないマスは通行不可とする。
- 同一場所内の隣接マス間は通行できる。
- 異なる場所間の隣接マスは、双方が接続済みの場合だけ通行できる。
- 経路探索はA*で行い、探索後に通行可能な直線へ圧縮したwaypoint列へ変換する。
- 移動速度は4マス/秒相当の固定値で、ゲーム内時間倍率には連動しない。
- 現在地はキャラクター座標が所属する場所に入った時点で更新する。
- 訪問判定はプレイヤーの現在地が変わった時点で行う。
- Actorの自動移動は、選ばれた移動先場所内のランダムなセル中心を目的地として経路を作成する。

## 会話シーンの生成

`EventSystem`は会話相手と実行中イベントから使用する台本を決定する。
`PatrolEventManager`が管理する見回りは会話台本の選出に関与しない。

### 実行中の配達または同行がない場合

1. 通常会話、配達依頼、同行開始の候補を作る。
2. 会話scriptを選出する。
3. イベントscriptが選ばれた場合だけ`EventIdSequence`のevent IDを進める。
4. 台本と完了callbackを`DialogueSystem.requestStart()`へ渡すadapterを通して、メインシーン内の進行中会話として保持させる。

### 実行中の配達または同行がある場合

1. eventへactor IDと現在地を渡し、イベント固有interactionを問い合わせる。
2. interactionがあればイベント会話を生成する。
3. 同行条件によって会話が禁止されていれば生成しない。
4. それ以外は通常会話を生成する。

通常会話の完了callbackはadapterを通して`RewardSystem`へ好感度反映を依頼する。
イベント会話の完了callbackはeventへ結果を渡し、開始、成功、失敗に応じて`EventSystem`内の実行中イベントを更新し、成功時は`RewardSystem`へ報酬反映を依頼する。

## 見回りの生成と進行

- [`PatrolEventManager`](../イベント/PatrolEventManager.md)が見回り先の抽選、発生時刻、進行、実行中eventの保持と破棄を担当する。
- `EventSystem`は`Character`、共有[`EventIdSequence`](../イベント/EventIdSequence.md)、祭終了時刻からManagerを生成する。
- ゲーム開始時の見回りにはevent ID 0を割り当て、以後は配達、同行、見回りで共有する連番を割り当てる。
- 時間更新後は`EventSystem.advanceTo(currentHours)`を呼ぶ。
- 場所移動の成立後は`EventSystem.visitLocations(locationIds)`を呼ぶ。
- カシオペアによる遡行後は`EventSystem.rewindTo(currentHours)`を呼ぶ。
- scene snapshotの生成時は`EventSystem.createSnapshotFragment().executingEvents`を使用する。

見回り固有の生成条件、抽選、完了報酬、巻き戻し時の破棄は`MainGameScene`で判定しない。

## 継続イベントとの境界

- `DeliveryEvent`と`AccompanimentEvent`がtask状態と会話台本を管理する。
- `EventSystem`が配達または同行を1件保持し、`PatrolEventManager`が見回りを1件まで保持する。
- 同行開始時は同伴者の移動modeを`external`へ変更する。
- 同行中の場所同期は`EventSystem`が同伴者IDを返し、実際の移動開始は`CharacterSystem`が行う。
- 配達または同行の完了や失敗時は報酬を適用し、同伴者を`automatic`へ戻して対象イベントを破棄する。
- 見回り完了時は`PatrolEventManager`が報酬ポイントを請求し、`RewardSystem`へMahoPayポイント反映を依頼して対象イベントを破棄する。
- カシオペア使用時は`TimeControlSystem`が時間遡行とMP消費を行い、成功後に`EventSystem`が同伴者を解放し、Managerへイベント破棄を通知する。

イベントのゲームルールは[基本設計のイベント仕様](../../../基本設計/イベント/README.md)を正本とする。

### 見回りのMahoPay収支

<MahoPayTransactionTable :ids="['patrol-completion']" />

## snapshot

```js
{
  sceneId: SCENE_IDS.MAIN_GAME,
  activeLayerId,
  gameTime: {
    currentHours,
    durationHours,
    isEnded,
  },
  loop: {
    count,
    timeTravelHours,
    cassiopeiaMagicPowerCost,
  },
  character: {
    location,
    position,
    movement,
    magicPower,
    mahoPayPoints,
  },
  actors,
  companion,
  conversation,
  map,
  mapLocations,
  executingEvents,
}
```

- `map`には`width`、`height`、場所定義、壁描画用境界を含める。
- `mapLocations`は互換用に場所配列を保持する。
- `character.position`と`actors[].position`は32x32グリッド上の連続座標とする。
- `movement`は移動中だけ目的地、waypoint、速度を含み、停止中は`null`とする。
- `actors`には各actorのsnapshotと`isTalkable`を含める。
- `companion`は同行中だけ同伴者snapshot、それ以外は`null`とする。
- `gameTime`と`loop`は`TimeControlSystem.createSnapshotFragment()`の結果を使用する。
- `activeLayerId`は`GameFlowSystem.createSnapshotFragment()`の結果を使用する。
- `conversation`は会話中だけ`DialogueSystem.createSnapshotFragment()`の結果、それ以外は`null`とする。
- `executingEvents`は見回り、分岐、配達または同行の順で実行中イベントを格納する。
- actorやeventの内部オブジェクトを直接公開しない。

見回りのevent snapshotは[`PatrolEvent`のsnapshot契約](../イベント/PatrolEvent.md#snapshot)を使用する。

## 依存先

- `Character`、`Student`、`Teacher`
- [`CharacterSystem`](CharacterSystem.md)
- [`GameFlowSystem`](GameFlowSystem.md)
- [`LocationSystem`](LocationSystem.md)
- [`DialogueSystem`](../会話/DialogueSystem.md)
- [`PlayerControlSystem`](PlayerControlSystem.md)
- [`EventSystem`](../イベント/EventSystem.md)
- [`RewardSystem`](RewardSystem.md)
- [`TimeControlSystem`](TimeControlSystem.md)
- location定義と乱数

## フィールド会話パネル

メインゲーム中の通常会話・イベント会話は、scene stackへ`ConversationScene`をpushせず、`MainGameScene`内の進行中会話として扱う。

- 会話中のsnapshotは`sceneId: SCENE_IDS.MAIN_GAME`を維持し、`conversation: dialogueSystem.createSnapshotFragment()`を含める。
- 会話中は`DialogueSystem`が`conversation:*`入力だけ処理し、`GameFlowSystem`が通常入力とゲームシミュレーションを停止する。
- 会話完了時は`DialogueSystem`の完了callbackを通して、通常会話の好感度反映、イベント会話の`completeInteraction()`、同行者制御など既存の完了callback相当処理を実行し、`conversation`を`null`へ戻す。

独立した`ConversationScene`は互換用に残すが、メインゲーム中のフィールド会話表示には使わない。

ゲームエンジンやDOM rendererの実装には依存しない。
