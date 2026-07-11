# GameFlowSystem（ゲームフローSystem）

## 対象

- `src/gameDomain/mainGameScene/gameFlowSystem.js`

## 方針

実物の`DialogueSystem`を使い、公開APIから入力モード、フレーム制御、表示layerを検証する。
DOM、実時間、乱数には依存しない。

## Test Suite

### GFS-UT-S01 フレーム開始時の入力モード

#### GFS-UT-S01-C01 会話がないフレームはgameplay入力を許可する

- 前提: 進行中会話を持たない`DialogueSystem`と`GameFlowSystem`を作る。
- 入力: なし。
- 操作: `beginFrame({ dialogue })`後に`createControlContext({ dialogue })`を呼ぶ。
- 期待結果: `inputMode`は`gameplay`、`gameplayInputEnabled`と`gameplaySimulationEnabled`は`true`、`activeLayerId`はmapになる。

#### GFS-UT-S01-C02 フレーム開始時に会話中ならfield入力を処理しない

- 前提: 進行中会話を持つ`DialogueSystem`と`GameFlowSystem`を作る。
- 入力: なし。
- 操作: `beginFrame({ dialogue })`後に`canProcessFieldInput()`と`createControlContext({ dialogue })`を呼ぶ。
- 期待結果: `inputMode`は`dialogue`、`canProcessFieldInput()`は`false`、通常入力とゲームシミュレーションは無効、`activeLayerId`はconversationになる。

### GFS-UT-S02 会話開始・終了フレーム

#### GFS-UT-S02-C01 会話開始フレームはgameplay入力とシミュレーションを止める

- 前提: フレーム開始時点では会話がない。
- 入力: フレーム中に`DialogueSystem.requestStart()`を受理させる。
- 操作: `createControlContext({ dialogue })`を呼ぶ。
- 期待結果: `inputMode`は`gameplay`のまま、`gameplayInputEnabled`と`gameplaySimulationEnabled`は`false`、`activeLayerId`はconversationになる。

#### GFS-UT-S02-C02 会話完了フレームはfield入力とシミュレーションを止める

- 前提: フレーム開始時点で進行中会話がある。
- 入力: 会話完了入力。
- 操作: `DialogueSystem.processInput()`後に`createControlContext({ dialogue })`を呼ぶ。
- 期待結果: `inputMode`は`dialogue`のまま、`canProcessFieldInput()`は`false`、ゲームシミュレーションは無効、`activeLayerId`はmapになる。
