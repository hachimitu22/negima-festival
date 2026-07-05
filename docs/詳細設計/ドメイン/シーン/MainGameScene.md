# MainGameScene（メインゲームシーン）

<script setup>
import MahoPayTransactionTable from '../../../.vitepress/components/MahoPayTransactionTable.vue'
</script>

## 文書情報

- 設計状態: 確定
- 実装状況: 一部実装
- 対象: `src/gameDomain/mainGameScene/mainGameScene.js`
- 対応する基本仕様: [メインゲームシーン](../../../基本設計/シーン/メインゲームシーン.md)

## 目的

麻帆良祭のゲーム状態を所有し、時間経過、プレイヤーと登場人物、MahoPayポイント、マップ、継続イベントを更新する。
会話の開始条件を判定し、一時的な`ConversationScene`を生成する。

## 所有する状態

| 状態                      | 内容                                             |
| ------------------------- | ------------------------------------------------ |
| `gameTime`                | 現在時間、終了時間、時間倍率、終了状態           |
| `loop`                    | 周回数、遡行時間、カシオペア消費MP               |
| `character`               | プレイヤーの現在地、MP、MahoPayポイント          |
| `actors`                  | 生徒31人と教師2人                                |
| `activeLayerId`           | メインゲーム内で表示するlayer                    |
| `activeConversationEvent` | 実行中の配達または同行。未実行時は`null`         |
| `activePatrolEvent`       | 実行中の見回り。未実行時は`null`                 |
| `nextPatrolTimeHours`     | 次に見回りの発生判定を行うゲーム時間             |
| `lastEventId`             | 両イベント枠で一意な識別子を作るための直前値     |

初期layerはmap、初期の配達または同行はなしとする。
初期の見回りはコンストラクタで生成し、最初のsnapshotから実行中イベントとして公開する。
次回見回り時刻はゲーム時間12とする。
キャラクター、登場人物、各数値の初期値は基本設計を正本とする。

## 公開契約

```js
class MainGameScene {
  update({ context, sceneControl: { pushScene } })
  createSnapshot()
}
```

## 更新順序

1. input全体から会話開始を成立させるactor入力を探す。
2. 成立した場合は`ConversationScene`を生成してpushし、直ちに終了する。
3. 会話へ遷移しなかった場合だけ、場所移動とカシオペア入力を処理する。
4. 場所移動が成立した場合は、見回りへ移動先を通知して完了と報酬を処理する。
5. frame経過量からゲーム時間を進める。
6. 到達した定期発生時刻ごとに見回りの発生可否を判定する。
7. 経過ゲーム時間を含むcontextで`Character`を更新する。
8. 同じcontextで全`Actor`を更新する。

会話遷移を最優先することで、同じframeの場所移動、時間進行、人物移動を会話開始前に実行しない。

## input

`INPUT_TYPES.TARGET_ACTIVATE`だけを解釈する。

| target                  | 処理                             |
| ----------------------- | -------------------------------- |
| `actor:<actorId>`       | 会話開始条件を判定する           |
| `location:<locationId>` | 有効な場所へプレイヤーを移動する |
| `cassiopeia`            | MP条件を満たす場合に時間を戻す   |

同行中に場所移動が成立した場合は、同伴者も同じlocationへ移動する。
見回り中に場所移動が成立した場合は、移動先を訪問済みに更新する。

## 会話シーンの生成

`MainGameScene`は会話相手と`activeConversationEvent`から使用する台本を決定する。
`activePatrolEvent`は会話台本の選出に関与しない。

### 実行中の配達または同行がない場合

1. 通常会話、配達依頼、同行開始の候補を作る。
2. 会話scriptを選出する。
3. イベントscriptが選ばれた場合だけevent IDを進める。
4. 台本、status snapshot、完了callbackから`ConversationScene`を生成する。

### 実行中の配達または同行がある場合

1. eventへactor IDと現在地を渡し、イベント固有interactionを問い合わせる。
2. interactionがあればイベント会話を生成する。
3. 同行条件によって会話が禁止されていれば生成しない。
4. それ以外は通常会話を生成する。

通常会話の完了callbackは生徒の好感度を反映する。
イベント会話の完了callbackはeventへ結果を渡し、開始、成功、失敗に応じて`activeConversationEvent`を更新する。

## 見回りの生成と進行

- 見回りは`PatrolEvent`と`PatrolTask`で訪問先、訪問状態、成功状態を管理する。
- 発生時は現在地、`LOCATION_IDS.GIRLS_BATHROOM`、`LOCATION_IDS.GYM_CHANGING_ROOM`以外のlocationから1から3件を重複なしで選ぶ。
- ゲーム開始時の見回りには最初のevent IDを割り当てる。
- 時間更新後、`nextPatrolTimeHours`以下の各12時間境界を順に消費する。
- 境界の時点で`activePatrolEvent`が`null`なら新しい見回りを生成し、実行中ならその回を見送る。
- 大きなframe差分で複数の境界を越えた場合も、最初に生成した見回りが後続境界では実行中となるため、同一frameで複数件を生成しない。
- ゲーム時間72の境界では発生判定を行わない。
- 場所移動後に`PatrolEvent`へlocation IDを渡し、成功へ遷移した場合だけ報酬を`Character`へ加算して`activePatrolEvent`を破棄する。
- 報酬額は`PatrolEvent`から取得し、同じ成功へ複数回適用しない。

カシオペア使用時は`activePatrolEvent`を破棄する。
`nextPatrolTimeHours`は、遡行後の時刻より大きい最小の12の倍数へ再設定する。
遡行後がゲーム時間0の場合も次回は12とし、開始時の見回りを再生成しない。

## 継続イベントとの境界

- `DeliveryEvent`と`AccompanimentEvent`がtask状態と会話台本を管理する。
- `PatrolEvent`が見回りtaskの状態と報酬を管理する。
- `MainGameScene`が配達または同行を1件、見回りを1件まで別々に保持する。
- 同行開始時は同伴者の移動modeを`external`へ変更する。
- 同行中の場所同期は`MainGameScene`が行う。
- 配達または同行の完了や失敗時は報酬を適用し、同伴者を`automatic`へ戻して対象イベントを破棄する。
- 見回り完了時はMahoPayポイントを適用して対象イベントを破棄する。
- カシオペア使用時は同伴者を解放し、両方の実行中イベントを破棄する。

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
    magicPower,
    mahoPayPoints,
  },
  actors,
  companion,
  mapLocations,
  executingEvents,
}
```

- `actors`には各actorのsnapshotと`isTalkable`を含める。
- `companion`は同行中だけ同伴者snapshot、それ以外は`null`とする。
- `executingEvents`は見回り、配達または同行の順で実行中イベントを格納し、0件から2件とする。
- actorやeventの内部オブジェクトを直接公開しない。

見回りのevent snapshotは次の契約とする。

```js
{
  id,
  type: 'patrol',
  name: '見回り',
  description,
  state: 'executing',
  destinations: [
    {
      id,
      name,
      isVisited,
    },
  ],
  rewardPoints,
}
```

- `destinations`は発生時に決定した順序を維持する。
- `isVisited`は場所移動が成立するたびに更新する。
- `rewardPoints`は`patrol-completion`の収支定義に従って算出する。
- `description`は各見回り先の訪問状態をrendererがそのまま表示できる文字列とする。

## 依存先

- `Character`、`Student`、`Teacher`
- location定義と乱数
- 好感度計算
- `DeliveryEvent`、`AccompanimentEvent`、`PatrolEvent`
- 会話台本生成
- `ConversationScene`

ゲームエンジンやDOM rendererの実装には依存しない。
