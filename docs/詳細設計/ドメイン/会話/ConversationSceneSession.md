# ConversationSceneSession（会話セッション）

## 目的

`ConversationSceneSession` は、実行中の1件の会話シーンについて、メッセージの進行と選択肢の適用を管理するドメインオブジェクトである。
会話シーン開始時に生成し、会話シーン完了時に破棄する。

## 責務

- 現在のメッセージ位置を保持する。
- 現在選択可能な選択肢を判定する。
- 次のメッセージへ進める。
- 選択結果のメッセージを会話シーンへ反映する。
- 会話シーンの状態を外部から参照するための snapshot を返す。

次の処理は責務に含めない。

- `ConversationSceneScript`の選択と生成
- 生徒と会話シーンを開始できるかどうかの判定
- `targetId` などrenderer由来の入力解析
- `ConversationScene`のpushとpop
- ゲーム時間やイベント進行の停止
- DOMを含むrenderer固有の表示処理

これらは`ConversationSceneScript`の生成処理、`MainGameScene`、`ConversationScene`、rendererがそれぞれ担当する。

## GameObjectとの関係

`ConversationSceneSession` は現在の実装では`GameObject`ではない。
会話シーンはユーザー操作によってのみ進行し、毎フレーム`update()`する対象ではないためである。
`ConversationScene`はgameEngineから毎frame更新されるが、`ConversationSceneSession`はsceneが会話シーン入力を受け取った場合だけ操作される。

時間制限、自動進行、演出待ちなど、フレーム更新で変化するゲームロジックを持たせる場合はGameObject化を再検討する。
`getSnapshot()`を持つこと自体はGameObject化の条件ではない。

## 生成

```js
new ConversationSceneSession(script)
```

`script`は生成済みの`ConversationSceneScript`とし、次の構造を持つ。

```js
{
  id,
  messages: [
    {
      speakerName,
      message,
    },
  ],
  choice: null | {
    messageIndex,
    options: [
      {
        id,
        label,
        messages,
      },
    ],
  },
}
```

`messages`には1件以上のメッセージが存在することを前提とする。
会話シーン台本の検証や話者名の解決は、`ConversationSceneSession`を生成する前に完了させる。

生成直後のメッセージ位置は`0`とする。

## 公開API

### `next()`

現在の会話シーンを次へ進め、`CONVERSATION_SCENE_SESSION_RESULTS`のいずれかを返す。

| 結果                      | 条件                             | 状態変更                  |
| ------------------------- | -------------------------------- | ------------------------- |
| `ADVANCED` (`advanced`)   | 次のメッセージが存在する         | メッセージ位置を1つ進める |
| `BLOCKED` (`blocked`)     | 現在位置に未選択の選択肢がある   | 変更しない                |
| `COMPLETED` (`completed`) | 現在位置が最後のメッセージである | 変更しない                |

`COMPLETED`を受け取った`ConversationScene`が完了callbackへ結果を通知し、自身をscene stackからpopする。

### `selectChoice(choiceId)`

現在位置で`choiceId`に一致する選択肢を適用する。

選択肢が有効な場合は、選択結果のメッセージを現在のメッセージ直後へ挿入し、その先頭へ進んで次の結果を返す。

```js
{
  scriptId,
  choiceId,
}
```

`scriptId`と`choiceId`は選択結果を呼び出し側へ伝えるための識別子とする。
現在位置に選択肢がない場合やIDが一致しない場合は、状態を変更せず`null`を返す。
1回適用した選択肢は再選択できない。

### `getSnapshot()`

現在の会話シーン状態をplain objectとして返す。
renderer固有の要素や内部のメッセージ配列は公開しない。

```js
{
  speakerName,
  message,
  messageIndex,
  messageCount,
  choices: [
    {
      id,
      label,
    },
  ],
  isLastMessage,
}
```

| 項目            | 内容                                           |
| --------------- | ---------------------------------------------- |
| `speakerName`   | 現在のメッセージの話者名                       |
| `message`       | 現在のメッセージ本文                           |
| `messageIndex`  | 現在位置を表す0始まりの番号                    |
| `messageCount`  | 選択結果を反映したメッセージ総数               |
| `choices`       | 現在選択できる選択肢。存在しない場合は空配列   |
| `isLastMessage` | 選択待ちではなく、現在位置が最後の場合に`true` |

snapshotは状態参照用であり、呼び出し側からsessionの状態を変更するためには使用しない。

## Sceneとの境界

`MainGameScene`は会話シーン開始条件を確認して`ConversationSceneScript`を生成する。
生成した台本、停止時点のstatus snapshot、会話シーン結果を受け取る完了callbackを`ConversationScene`へ渡し、scene stackへpushする。

`ConversationScene`は`ConversationSceneSession`を保持し、renderer由来の入力を`next()`または`selectChoice(choiceId)`へ変換する。
選択結果を保持し、`COMPLETED`を受け取った場合は台本IDと選択肢IDから成る結果を完了callbackへ一度だけ渡す。
通知後に`ConversationScene`自身をpopし、stackに保持されている同じ`MainGameScene`インスタンスへ戻る。
完了callbackは`MainGameScene`が生成する。
通常の会話シーンの結果は`MainGameScene`へ反映し、配達イベントの会話シーン結果は`DeliveryEvent`を通して`DeliveryTask`の状態へ反映する。
生徒の基礎好感度変化量の決定と最終変化量の計算は、`ConversationSceneSession`の責務に含めない。

`ConversationScene`のsnapshotには`SCENE_IDS.CONVERSATION`、停止時点のゲーム時間、MP、MahoPayポイント、`ConversationSceneSession.getSnapshot()`の結果を格納する。
