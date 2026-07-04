# MainGameScene（メインゲームシーン）

## 文書情報

- 設計状態: 確定
- 実装状況: 実装済み
- 対象: `src/gameDomain/mainGameScene/mainGameScene.js`
- 対応する基本仕様: [メインゲームシーン](../../../基本設計/シーン/メインゲームシーン.md)

## 目的

麻帆良祭のゲーム状態を所有し、時間経過、プレイヤーと登場人物、マップ、継続イベントを更新する。
会話の開始条件を判定し、一時的な`ConversationScene`を生成する。

## 所有する状態

| 状態 | 内容 |
| --- | --- |
| `gameTime` | 現在時間、終了時間、時間倍率、終了状態 |
| `loop` | 周回数、遡行時間、カシオペア消費MP |
| `character` | プレイヤーの現在地とMP |
| `actors` | 生徒31人と教師2人 |
| `activeLayerId` | メインゲーム内で表示するlayer |
| `activeEvent` | 実行中の配達または同行。未実行時は`null` |
| `lastEventId` | 次のイベント識別子を作るための直前値 |

初期layerはmap、初期イベントはなしとする。
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
4. frame経過量からゲーム時間を進める。
5. 経過ゲーム時間を含むcontextで`Character`を更新する。
6. 同じcontextで全`Actor`を更新する。

会話遷移を最優先することで、同じframeの場所移動、時間進行、人物移動を会話開始前に実行しない。

## input

`INPUT_TYPES.TARGET_ACTIVATE`だけを解釈する。

| target | 処理 |
| --- | --- |
| `actor:<actorId>` | 会話開始条件を判定する |
| `location:<locationId>` | 有効な場所へプレイヤーを移動する |
| `cassiopeia` | MP条件を満たす場合に時間を戻す |

同行中に場所移動が成立した場合は、同伴者も同じlocationへ移動する。

## 会話シーンの生成

`MainGameScene`は会話相手と`activeEvent`から使用する台本を決定する。

### 実行中イベントがない場合

1. 通常会話、配達依頼、同行開始の候補を作る。
2. 会話scriptを選出する。
3. イベントscriptが選ばれた場合だけevent IDを進める。
4. 台本、status snapshot、完了callbackから`ConversationScene`を生成する。

### 実行中イベントがある場合

1. eventへactor IDと現在地を渡し、イベント固有interactionを問い合わせる。
2. interactionがあればイベント会話を生成する。
3. 同行条件によって会話が禁止されていれば生成しない。
4. それ以外は通常会話を生成する。

通常会話の完了callbackは生徒の好感度を反映する。
イベント会話の完了callbackはeventへ結果を渡し、開始、成功、失敗に応じて`activeEvent`を更新する。

## 継続イベントとの境界

- `DeliveryEvent`と`AccompanimentEvent`がtask状態と会話台本を管理する。
- `MainGameScene`が実行中イベントを1件保持する。
- 同行開始時は同伴者の移動modeを`external`へ変更する。
- 同行中の場所同期は`MainGameScene`が行う。
- 完了または失敗時は報酬を適用し、同伴者を`automatic`へ戻してイベントを破棄する。
- カシオペア使用時は同伴者を解放し、実行中イベントを破棄する。

イベントのゲームルールは[基本設計のイベント仕様](../../../基本設計/イベント/README.md)を正本とする。

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
  character,
  actors,
  companion,
  mapLocations,
  executingEvents,
}
```

- `actors`には各actorのsnapshotと`isTalkable`を含める。
- `companion`は同行中だけ同伴者snapshot、それ以外は`null`とする。
- `executingEvents`は実行中イベントがあれば1件、なければ空配列とする。
- actorやeventの内部オブジェクトを直接公開しない。

## 依存先

- `Character`、`Student`、`Teacher`
- location定義と乱数
- 好感度計算
- `DeliveryEvent`、`AccompanimentEvent`
- 会話台本生成
- `ConversationScene`

ゲームエンジンやDOM rendererの実装には依存しない。
