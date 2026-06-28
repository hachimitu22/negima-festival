# ConversationSession

## 目的

`ConversationSession` は、実行中の1件の会話について、メッセージの進行と選択肢の適用を管理するドメインオブジェクトである。
会話開始時に生成し、会話完了時に破棄する。

## 責務

- 現在のメッセージ位置を保持する。
- 現在選択可能な選択肢を判定する。
- 次のメッセージへ進める。
- 選択結果のメッセージを会話へ反映する。
- 会話状態を外部から参照するための snapshot を返す。

次の処理は責務に含めない。

- 会話内容の選択と生成
- 生徒と会話可能かどうかの判定
- `targetId` などrenderer由来の入力解析
- conversation layerへの切り替えと会話終了後のlayer復帰
- ゲーム時間やイベント進行の停止
- DOMを含むrenderer固有の表示処理

これらは会話データの生成処理、`MainGameScene`、rendererがそれぞれ担当する。

## GameObjectとの関係

`ConversationSession` は現在の実装では`GameObject`ではない。
会話はユーザー操作によってのみ進行し、毎フレーム`update(context)`する対象ではないためである。

時間制限、自動進行、演出待ちなど、フレーム更新で変化するゲームロジックを持たせる場合はGameObject化を再検討する。
`getSnapshot()`を持つこと自体はGameObject化の条件ではない。

## 生成

```js
new ConversationSession(conversation)
```

`conversation`は生成済みの会話内容とし、次の構造を持つ。

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
会話内容の検証や話者名の解決は、`ConversationSession`を生成する前に完了させる。

生成直後のメッセージ位置は`0`とする。

## 公開API

### `next()`

現在の会話を次へ進め、`CONVERSATION_SESSION_RESULTS`のいずれかを返す。

| 結果 | 条件 | 状態変更 |
| --- | --- | --- |
| `ADVANCED` (`advanced`) | 次のメッセージが存在する | メッセージ位置を1つ進める |
| `BLOCKED` (`blocked`) | 現在位置に未選択の選択肢がある | 変更しない |
| `COMPLETED` (`completed`) | 現在位置が最後のメッセージである | 変更しない |

`COMPLETED`を受け取った呼び出し側がsessionを破棄し、必要なlayer遷移を行う。

### `selectChoice(choiceId)`

現在位置で`choiceId`に一致する選択肢を適用する。

選択肢が有効な場合は、選択結果のメッセージを現在のメッセージ直後へ挿入し、その先頭へ進んで次の結果を返す。

```js
{
  conversationId,
  choiceId,
}
```

`conversationId`と`choiceId`は選択結果を呼び出し側へ伝えるための識別子とする。
現在位置に選択肢がない場合やIDが一致しない場合は、状態を変更せず`null`を返す。
1回適用した選択肢は再選択できない。

### `getSnapshot()`

現在の会話状態をplain objectとして返す。
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

| 項目 | 内容 |
| --- | --- |
| `speakerName` | 現在のメッセージの話者名 |
| `message` | 現在のメッセージ本文 |
| `messageIndex` | 現在位置を表す0始まりの番号 |
| `messageCount` | 選択結果を反映したメッセージ総数 |
| `choices` | 現在選択できる選択肢。存在しない場合は空配列 |
| `isLastMessage` | 選択待ちではなく、現在位置が最後の場合に`true` |

snapshotは状態参照用であり、呼び出し側からsessionの状態を変更するためには使用しない。

## MainGameSceneとの境界

`MainGameScene`は会話開始条件を確認して会話内容を生成し、`ConversationSession`を保持する。
入力を`next()`または`selectChoice(choiceId)`へ変換する。
`COMPLETED`を受け取った場合は会話IDと選択肢IDから成る会話結果を`GameSystem`へ渡し、sessionを破棄してmap layerへ戻す。
生徒の基礎好感度変化量の決定と最終変化量の計算は、`ConversationSession`の責務に含めない。

scene snapshotを作る際は、`ConversationSession.getSnapshot()`の結果を`activeConversation`として格納する。
