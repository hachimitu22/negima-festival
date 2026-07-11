# GameFlowSystem（ゲームフローSystem）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/gameFlowSystem.js`
- 関連: [MainGameScene](MainGameScene.md)、[DialogueSystem](../会話/DialogueSystem.md)、[PlayerControlSystem](PlayerControlSystem.md)

## 目的

メインゲーム中のフレーム開始時点の入力モード、フレーム制御状態、表示layerを決定する。
会話中や会話開始・終了フレームで、通常入力とゲームシミュレーションを止める判断を`MainGameScene`から切り離す。

`GameFlowSystem`は次を担当する。

- フレーム開始時点の`inputMode`を保持する
- `DialogueSystem`のフレーム制御状態から、通常入力とゲームシミュレーションの有効/無効を返す
- 進行中会話の有無から`activeLayerId`を返す

会話入力処理、会話開始request、通常入力のtarget解釈、時間進行、イベント進行は扱わない。

## 公開契約

```js
const GAME_FLOW_INPUT_MODES = {
  GAMEPLAY: "gameplay",
  DIALOGUE: "dialogue",
}

class GameFlowSystem {
  beginFrame({ dialogue })
  canProcessFieldInput()
  createControlContext({ dialogue })
  createSnapshotFragment({ dialogue })
}
```

### beginFrame

フレーム開始時点の会話状態から`inputMode`を確定する。

- `dialogue.hasActiveSession()`が`true`: `inputMode`は`dialogue`
- それ以外: `inputMode`は`gameplay`

この値は当該フレーム中に会話が完了しても変更しない。
会話完了フレームでは、フレーム開始時点の`dialogue`入力モードに従い、通常入力は処理しない。

### canProcessFieldInput

フレーム開始時点の`inputMode`が`gameplay`の場合だけ`true`を返す。
`MainGameScene`はこの戻り値が`true`の場合だけ、actor会話開始入力を確認する。

### createControlContext

`DialogueSystem.getFrameControlState()`の結果を使い、次のcontrol contextを返す。

```js
{
  inputMode,
  gameplayInputEnabled,
  playerControlEnabled,
  gameplaySimulationEnabled,
}
```

- `gameplayInputEnabled`: `inputMode`が`gameplay`かつ`DialogueSystem`がplayer controlを止めていない場合に`true`
- `playerControlEnabled`: `gameplayInputEnabled`と同じ値。`FrameUpdate`設計との対応用に返す
- `gameplaySimulationEnabled`: `DialogueSystem`がゲームシミュレーションを止めていない場合に`true`

会話開始requestが当該フレームで受理された場合、`inputMode`は`gameplay`のままだが、`gameplayInputEnabled`と`gameplaySimulationEnabled`は`false`になる。

### createSnapshotFragment

進行中会話がある場合は`activeLayerId: MAIN_GAME_LAYER_IDS.CONVERSATION`を返す。
それ以外は`activeLayerId: MAIN_GAME_LAYER_IDS.MAP`を返す。

```js
{
  activeLayerId,
}
```

## MainGameSceneとの境界

`MainGameScene`は`DialogueSystem.beginFrame()`の直後に`GameFlowSystem.beginFrame({ dialogue })`を呼ぶ。
会話入力処理後、`canProcessFieldInput()`が`true`の場合だけactor会話開始入力を確認する。
その後、`createControlContext({ dialogue })`の結果を`PlayerControlSystem.update()`へ渡し、`gameplaySimulationEnabled`が`true`の場合だけ時間、イベント、キャラクター、場所更新へ進む。

`activeLayerId`は`GameFlowSystem.createSnapshotFragment({ dialogue })`の結果をscene snapshotへ集約する。
