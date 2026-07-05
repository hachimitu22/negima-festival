# ConversationScene（会話シーン）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/conversationScene/conversationScene.js`
- 対応する基本仕様: [会話シーン](../../../基本設計/シーン/会話シーン.md)

## 目的

生成済みの会話台本を1件実行し、メッセージ送りと選択を処理する。
完了時に結果を呼び出し元へ一度通知し、自身を終了して直前のシーンへ戻る。

## 生成

```js
new ConversationScene({
  script,
  statusSnapshot,
  onComplete,
})
```

| 引数             | 内容                                      |
| ---------------- | ----------------------------------------- |
| `script`         | 生成、検証済みの`ConversationSceneScript` |
| `statusSnapshot` | 会話開始時点の固定status snapshot         |
| `onComplete`     | 会話結果を一度受け取るcallback            |

生成時に`ConversationSceneSession`を作る。
結果の初期値は台本IDと`choiceId: null`とする。

## 所有する状態

- `session`: 会話メッセージと選択の進行
- `statusSnapshot`: 会話中に固定表示するメインゲーム状態
- `onComplete`: 完了結果の通知先
- `result`: 台本IDと選択肢ID
- `isCompleted`: 重複完了を防ぐ状態

## 公開契約

```js
class ConversationScene {
  update({ context, sceneControl: { popScene } })
  createSnapshot()
}
```

## input処理

`INPUT_TYPES.TARGET_ACTIVATE`のうち、`conversation:`から始まるtargetだけを処理する。

| action              | 処理                                   |
| ------------------- | -------------------------------------- |
| `choice:<choiceId>` | `session.selectChoice(choiceId)`を呼ぶ |
| `next`              | `session.next()`を呼ぶ                 |

- 無関係なinputは無視する。
- 有効な選択結果が返った場合は`result`を更新する。
- `ADVANCED`と`BLOCKED`ではシーンを維持する。
- `COMPLETED`を受け取った最初の1回だけ完了処理を行う。

## 完了処理

1. `isCompleted`を`true`にする。
2. `onComplete(result)`を呼ぶ。
3. `popScene()`で自身を除く。
4. 同じcontextの残りのinputを処理せず終了する。

完了callbackをpopより先に実行し、復帰後の`MainGameScene`のsnapshotへ結果を反映できるようにする。
`isCompleted`により、重複inputがあっても結果を複数回通知しない。

## snapshot

```js
{
  ...statusSnapshot,
  sceneId: SCENE_IDS.CONVERSATION,
  conversation: session.getSnapshot(),
}
```

会話開始後は`MainGameScene`を更新しないため、ゲーム時間、MP、MahoPayポイントは`statusSnapshot`の値を維持する。
会話内容だけをsessionの現在状態から毎回作る。

## 会話セッションとの境界

メッセージ位置、選択肢、会話完了判定は[ConversationSceneSession](../会話/ConversationSceneSession.md)が担当する。

`ConversationScene`は次だけを担当する。

- renderer由来inputの解析
- session APIの呼び出し
- 会話結果の保持
- 完了callbackの通知
- scene stackからの復帰
- scene snapshotの構築

台本の選出、好感度計算、イベント状態変更は担当しない。

## 依存先

- `ConversationSceneSession`
- input contract
- scene controlの`popScene`

`MainGameScene`、event、rendererはcallbackとsnapshotを介して接続し、`ConversationScene`から直接操作しない。
