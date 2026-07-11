# FrameUpdate（フレーム更新契約）

## 文書情報

- 設計状態: 確定
- 対象: scene内のSystem更新順序とフレーム制御状態

## 目的

SceneがSystemをどの順序で更新し、会話などの一時状態によってゲームシミュレーションを停止する契約を定める。
ゲーム固有の開始条件や報酬判断は各Systemが担当し、Sceneは更新順序とフレーム制御状態の受け渡しだけを担当する。

## フレーム制御状態

初期実装では、フレーム制御状態は次の最小構造とする。

```js
{
  gameplaySimulationEnabled,
  playerControlEnabled,
}
```

`gameplaySimulationEnabled`が`false`の場合、少なくとも以下は更新しない。

- ゲーム時間の進行
- 主人公とNPCの移動更新
- NPCの自律行動判断
- 時間依存のWorld更新
- 位置変化に依存するLocation判定

会話表示、入力表示、snapshot生成など、ゲーム時間に依存しない処理は継続してよい。

## 会話による停止

会話開始requestが受理されたフレームから`gameplaySimulationEnabled`を`false`にする。
会話終了入力を処理したフレームも停止を継続し、次フレームから再開する。

`DialogueSystem.getFrameControlState()`は、進行中の会話sessionが存在する限り停止状態を返す。
`DialogueSystem.beginFrame()`で一時フラグを初期化しても、進行中sessionによる停止状態は解除しない。

## 更新順序

初期実装では、`MainGameScene`の更新順序を次の形へ寄せる。

1. `DialogueSystem.beginFrame()`を呼ぶ。
2. `GameFlowSystem.beginFrame()`でフレーム開始時点の入力モードを確定する。
3. 入力を収集または受け取る。
4. `DialogueSystem.processInput(input)`で進行中会話の入力を処理する。
5. `GameFlowSystem.canProcessFieldInput()`が`true`の場合だけ、会話開始入力を処理する。
6. 会話開始が成立した場合は`DialogueSystem.requestStart()`を呼ぶ。
7. `GameFlowSystem.createControlContext()`でフレーム制御状態を決定する。
8. `gameplayInputEnabled`の場合だけ通常入力を処理する。
9. `gameplaySimulationEnabled`の場合だけ、ゲーム時間、移動、NPC自律行動を更新する。
10. 各Systemのsnapshot fragmentをScene snapshotへ集約する。

`GameFlowSystem`は会話状態に基づく入力モードとframe制御を担当する。
`TimeControlSystem`はゲーム時間進行とカシオペア遡行だけを担当し、frame制御は扱わない。

## 1フレーム遅延

NotificationBusやEventSystemを導入した後も、通知由来のEvent開始は原則として次フレームに処理する。
同一フレーム即時処理が必要になった場合だけ、通常通知とは別の経路を設計する。
