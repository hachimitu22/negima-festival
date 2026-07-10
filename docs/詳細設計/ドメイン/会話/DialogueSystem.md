# DialogueSystem（会話System）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/conversationScene/dialogueSystem.js`
- 関連: [ConversationSceneSession](ConversationSceneSession.md)

## 目的

メインゲーム中のフィールド会話について、会話sessionの生成と破棄、会話入力処理、完了callback、フレーム停止状態、snapshot fragment生成を担当する。
会話の台本選出、会話開始条件、好感度やイベント状態の反映は呼び出し元の責務とする。

## 所有する状態

- `activeSession`: 進行中の`ConversationSceneSession`
- `activeRequest`: 会話開始requestのID、owner、blocking情報
- `conversationResult`: 完了callbackへ渡す台本IDと選択肢ID
- `onComplete`: 会話完了時に一度だけ呼ぶcallback
- `gameplaySimulationBlockedForFrame`: 会話終了フレームを停止するための一時フラグ

## 公開契約

```js
class DialogueSystem {
  beginFrame()
  requestStart({ script, owner, onComplete })
  processInput(inputSnapshot)
  getFrameControlState()
  createSnapshotFragment()
  hasActiveSession()
  dispose()
}
```

### beginFrame

フレーム開始時の一時状態を初期化する。
ただし、進行中sessionがある場合はそのフレームのゲームシミュレーション停止状態を維持する。

### requestStart

生成済み会話scriptから`ConversationSceneSession`を開始する。
進行中sessionがある場合、またはscriptがない場合は`rejected`を返す。

受付成功時は`accepted`、`requestId`、`blocking: true`を返す。
受付成功フレームはゲームシミュレーションを停止する。

```js
{
  acceptance: "accepted",
  requestId,
  blocking: true,
  purpose: "startConversation",
}
```

### processInput

進行中sessionがある場合だけ、`conversation:*`入力を処理する。
通常のmap、actor、cassiopeia入力は処理しない。

`next`でsessionが完了した場合は、sessionを破棄して`onComplete`へ結果を渡す。
会話終了入力を処理したフレームもゲームシミュレーション停止を維持する。

### getFrameControlState

次の状態を返す。

```js
{
  gameplaySimulationBlocked,
  playerControlBlocked,
}
```

`activeSession`が存在する場合、または当該フレーム中に会話が開始・終了した場合、`gameplaySimulationBlocked`は`true`とする。

### createSnapshotFragment

進行中sessionがある場合は`ConversationSceneSession.getSnapshot()`を返す。
進行中sessionがない場合は`null`を返す。

### dispose

進行中session、完了callback、request情報、一時状態を破棄する。
Scene破棄時、巻き戻し時、独立した会話状態を破棄したい場合に使用する。

## Sceneとの境界

Sceneは`DialogueSystem`を生成し、更新順序に従って公開APIを呼ぶ。
Sceneは会話sessionの内部状態を直接参照しない。

`MainGameScene`は当面、会話開始条件とscript選出を保持する。
選出後のsession保持、入力処理、時間停止判定、会話snapshot生成は`DialogueSystem`へ移す。
