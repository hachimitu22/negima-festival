# Request（System要求契約）

## 文書情報

- 設計状態: 確定
- 対象: System間で時間を要する処理を依頼する共通契約

## 目的

Event、プレイヤー操作、System内部処理からGameplay Systemへ処理を依頼するときの受付結果、識別子、所有者、blocking属性を定める。

## 識別子

`requestId`はrequestそのものを識別する。
requestの発行元は`owner`で表す。

```js
{
  requestId: "request-001",
  owner: {
    type: "eventInstance",
    id: "event-instance-001",
  },
}
```

`owner`はrequest検索、キャンセル、Scene終了時の一括破棄、デバッグログに使う。
`owner`をrequest識別子として使ってはならない。

## 受付結果

Systemへのrequestは、その場で受付結果を返す。

```js
{
  acceptance: "accepted",
  requestId: "request-001",
  blocking: true,
  purpose: "startConversation",
}
```

```js
{
  acceptance: "rejected",
  reason: "conversationAlreadyActive",
}
```

`accepted`は処理完了を意味しない。
時間を要するrequestは、完了時に`requestId`付きの通知またはcallbackで結果を返す。

## blocking

`blocking`は、ゲーム状態が安定状態ではないことを示す。
主にセーブ可否、Scene遷移可否、巻き戻し開始可否、排他的request受付可否の判断に使う。

`blocking`とゲームシミュレーション停止は別概念である。
blocking requestが存在しても、仕様上ゲーム時間を進めてよい場合がある。

初期分類は次の通りとする。

| request | 初期方針 |
| --- | --- |
| 会話開始 | blocking |
| カットシーン・演出開始 | blocking |
| 巻き戻し処理 | blocking |
| Scene遷移 | blocking |
| Event進行上完了待ちとなる強制移動 | blocking |
| プレイヤーの通常移動 | non-blocking |
| NPCの巡回移動 | non-blocking |
| 対象選択 | non-blocking |
| 即時のフラグ変更 | 原則non-blocking |
| 報酬反映 | 処理中のみ短時間blocking、または同期完了 |

各Systemはrequest種別や`purpose`からblocking属性を決める。
呼び出し側が自由にblockingを偽装できないようにする。

## 終了結果

Acceptedされたrequestは、最終的に次のいずれかで終了する。

- `succeeded`
- `failed`
- `cancelled`
- `interrupted`
- `expired`
- `superseded`

すべてを個別内部状態として実装する必要はない。
ただし、呼び出し側が結果の意味を判別できる形で返す。
