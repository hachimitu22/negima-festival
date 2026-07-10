# MainGameScene（メインゲームシーン）

<script setup>
import MahoPayTransactionTable from '../../../.vitepress/components/MahoPayTransactionTable.vue'
</script>

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/mainGameScene.js`
- 対応する基本仕様: [メインゲームシーン](../../../基本設計/シーン/メインゲームシーン.md)

## 目的

麻帆良祭のゲーム状態を所有し、時間経過、プレイヤーと登場人物、MahoPayポイント、グリッドマップ、継続イベントを更新する。
会話の開始条件を判定し、メインシーン内の進行中会話として`ConversationSceneSession`を保持する。

## 所有する状態

| 状態                      | 内容                                             |
| ------------------------- | ------------------------------------------------ |
| `gameTime`                | 現在時間、終了時間、時間倍率、終了状態           |
| `loop`                    | 周回数、遡行時間、カシオペア消費MP               |
| `character`               | プレイヤーの現在地、マップ座標、移動状態、MP、MahoPayポイント |
| `actors`                  | 生徒31人と教師2人の現在地、マップ座標、移動状態 |
| `activeLayerId`           | メインゲーム内で表示するlayer                    |
| `activeConversationEvent` | 実行中の配達または同行。未実行時は`null`         |
| `eventIdSequence`         | 配達、同行、見回りで共有するevent ID採番器       |
| `patrolEventManager`      | 見回りの生成、進行、報酬、保持を管理するManager  |

初期layerはmap、初期の配達または同行はなしとする。
`PatrolEventManager`が初期の見回りを生成し、最初のsnapshotから実行中イベントとして公開する。
キャラクター、登場人物、各数値の初期値は基本設計を正本とする。

## 公開契約

```js
class MainGameScene {
  update({ context })
  createSnapshot()
}
```

## 更新順序

1. 進行中会話がある場合は`conversation:*`入力だけを処理し、直ちに終了する。
2. input全体から会話開始を成立させるactor入力を探す。
3. 成立した場合は`ConversationSceneSession`を生成して`activeLayerId`を`conversation`にし、直ちに終了する。
4. 会話へ遷移しなかった場合だけ、マップ座標クリック、イベント選択、カシオペア入力を処理する。
5. frame経過量からゲーム時間を進める。
6. 更新後のゲーム時間を`PatrolEventManager`と`BranchEventManager`へ通知する。
7. 経過ゲーム時間と実時間deltaを含むcontextで`Character`を更新する。
8. 同じcontextで全`Actor`を更新する。
9. `Character`が移動中に入った場所がある場合は、各場所IDを`PatrolEventManager.visitLocation(locationId)`と`BranchEventManager.visitLocation(locationId)`へ通知する。

会話遷移を最優先することで、同じframeの場所移動、時間進行、人物移動を会話開始前に実行しない。

## input

`INPUT_TYPES.TARGET_ACTIVATE`だけを解釈する。

| target                  | 処理                             |
| ----------------------- | -------------------------------- |
| `actor:<actorId>`       | 会話開始条件を判定する           |
| `map-position:<x>,<y>`  | マップ座標へプレイヤーを移動する |
| `cassiopeia`            | MP条件を満たす場合に時間を戻す   |

`map-position`の`x`と`y`は32x32グリッド上の連続座標とする。
目的地が場所に属さない、または壁で到達できない場合は移動を開始しない。
移動中に別の`map-position`入力を受けた場合は、現在座標から目的地まで経路を引き直す。
同行中にプレイヤーの移動経路が変わった場合は、同伴者も同じ目的地へ移動させる。

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

`MainGameScene`は会話相手と`activeConversationEvent`から使用する台本を決定する。
`PatrolEventManager`が管理する見回りは会話台本の選出に関与しない。

### 実行中の配達または同行がない場合

1. 通常会話、配達依頼、同行開始の候補を作る。
2. 会話scriptを選出する。
3. イベントscriptが選ばれた場合だけ`EventIdSequence`のevent IDを進める。
4. 台本と完了callbackから`ConversationSceneSession`を生成し、メインシーン内の進行中会話として保持する。

### 実行中の配達または同行がある場合

1. eventへactor IDと現在地を渡し、イベント固有interactionを問い合わせる。
2. interactionがあればイベント会話を生成する。
3. 同行条件によって会話が禁止されていれば生成しない。
4. それ以外は通常会話を生成する。

通常会話の完了callbackは生徒の好感度を反映する。
イベント会話の完了callbackはeventへ結果を渡し、開始、成功、失敗に応じて`activeConversationEvent`を更新する。

## 見回りの生成と進行

- [`PatrolEventManager`](../イベント/PatrolEventManager.md)が見回り先の抽選、発生時刻、進行、報酬適用、実行中eventの保持と破棄を担当する。
- `MainGameScene`は`Character`の生成後に、同じCharacter、共有[`EventIdSequence`](../イベント/EventIdSequence.md)、祭終了時刻からManagerを生成する。
- ゲーム開始時の見回りにはevent ID 0を割り当て、以後は配達、同行、見回りで共有する連番を割り当てる。
- 時間更新後は`advanceTo(currentHours)`を呼ぶ。
- 場所移動の成立後は`visitCurrentLocation()`を呼ぶ。
- カシオペアによる遡行後は`rewindTo(currentHours)`を呼ぶ。
- scene snapshotの生成時は`getExecutingEventSnapshot()`の結果を配達または同行のsnapshotより前へ格納する。

見回り固有の生成条件、抽選、完了報酬、巻き戻し時の破棄は`MainGameScene`で判定しない。

## 継続イベントとの境界

- `DeliveryEvent`と`AccompanimentEvent`がtask状態と会話台本を管理する。
- `MainGameScene`が配達または同行を1件保持し、`PatrolEventManager`が見回りを1件まで保持する。
- 同行開始時は同伴者の移動modeを`external`へ変更する。
- 同行中の場所同期は`MainGameScene`が行う。
- 配達または同行の完了や失敗時は報酬を適用し、同伴者を`automatic`へ戻して対象イベントを破棄する。
- 見回り完了時は`PatrolEventManager`がMahoPayポイントを適用して対象イベントを破棄する。
- カシオペア使用時は同伴者を解放し、Managerへ見回りの破棄を通知する。

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
- `conversation`は会話中だけ`ConversationSceneSession.getSnapshot()`、それ以外は`null`とする。
- `executingEvents`は見回り、配達または同行の順で実行中イベントを格納し、0件から2件とする。
- actorやeventの内部オブジェクトを直接公開しない。

見回りのevent snapshotは[`PatrolEvent`のsnapshot契約](../イベント/PatrolEvent.md#snapshot)を使用する。

## 依存先

- `Character`、`Student`、`Teacher`
- location定義と乱数
- 好感度計算
- `DeliveryEvent`、`AccompanimentEvent`
- [`EventIdSequence`](../イベント/EventIdSequence.md)
- [`PatrolEventManager`](../イベント/PatrolEventManager.md)
- 会話台本生成
- `ConversationSceneSession`

## フィールド会話パネル

メインゲーム中の通常会話・イベント会話は、scene stackへ`ConversationScene`をpushせず、`MainGameScene`内の進行中会話として扱う。

- 会話中のsnapshotは`sceneId: SCENE_IDS.MAIN_GAME`を維持し、`conversation: session.getSnapshot()`を含める。
- 会話中は`conversation:*`入力だけ処理し、ゲーム内時間、主人公移動、actor自動移動、map入力、event選択、カシオペア入力は進めない。
- 会話完了時は通常会話の好感度反映、イベント会話の`completeInteraction()`、同行者制御など既存の完了callback相当処理を実行し、`conversation`を`null`へ戻す。

独立した`ConversationScene`は互換用に残すが、メインゲーム中のフィールド会話表示には使わない。

ゲームエンジンやDOM rendererの実装には依存しない。
