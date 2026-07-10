# PlayerControlSystem（プレイヤー操作System）

## 対象

- `src/gameDomain/mainGameScene/playerControlSystem.js`

## 方針

入力snapshotと小さな記録用request APIを使い、target解釈とrequest発行だけを検証する。
実物のScene、DOM、ゲームループには依存しない。

## Test Suite

### PCS-UT-S01 通常入力のrequest変換

#### PCS-UT-S01-C01 map-position入力を主人公移動requestへ変換する

- 前提: 記録用`characterRequests`を持つ`PlayerControlSystem`を作る。
- 入力: `target.activate`の`map-position:10.5,20.5`。
- 操作: `update()`を呼ぶ。
- 期待結果: `movePlayerToMapPosition({ x: 10.5, y: 20.5 })`が1回呼ばれ、`handledCount`が1になる。

#### PCS-UT-S01-C02 location入力を主人公場所移動requestへ変換する

- 前提: 記録用`characterRequests`を持つ`PlayerControlSystem`を作る。
- 入力: `target.activate`の`location:gym-arena`。
- 操作: `update()`を呼ぶ。
- 期待結果: `movePlayerToLocation('gym-arena')`が1回呼ばれる。

#### PCS-UT-S01-C03 branch-choice入力を分岐選択requestへ変換する

- 前提: 記録用`branchRequests`を持つ`PlayerControlSystem`を作る。
- 入力: `target.activate`の`branch-choice:choice-a`。
- 操作: `update()`を呼ぶ。
- 期待結果: `chooseCurrentTask('choice-a')`が1回呼ばれる。

#### PCS-UT-S01-C04 cassiopeia入力をカシオペア使用requestへ変換する

- 前提: 記録用`cassiopeiaRequests`を持つ`PlayerControlSystem`を作る。
- 入力: `target.activate`の`cassiopeia`。
- 操作: `update()`を呼ぶ。
- 期待結果: `requestUseCassiopeia()`が1回呼ばれる。

### PCS-UT-S02 入力抑制と対象外入力

#### PCS-UT-S02-C01 gameplayInputEnabledがfalseならrequestを発行しない

- 前提: 記録用request APIを持つ`PlayerControlSystem`を作る。
- 入力: map-position入力と`gameplayInputEnabled: false`。
- 操作: `update()`を呼ぶ。
- 期待結果: requestは発行されず、`handledCount`は0になる。

#### PCS-UT-S02-C02 actor入力とconversation入力は通常入力として処理しない

- 前提: 記録用request APIを持つ`PlayerControlSystem`を作る。
- 入力: `actor:student-01`と`conversation:next`。
- 操作: `update()`を呼ぶ。
- 期待結果: requestは発行されず、`handledCount`は0になる。
