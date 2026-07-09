# Actor（登場人物）

## 対象

- `src/gameDomain/mainGameScene/actor.js`

## 方針

Actorの自動移動を公開snapshotから検証する。
乱数は注入した決定的な関数で制御し、実時間、DOM、ゲームループには依存しない。

## Test Suite

### A-UT-S01 自動移動

#### A-UT-S01-C01 自動移動の目的地は選ばれた場所内のランダムなセル中心になる

- 前提: 移動時刻に達したActorを作り、移動先と場所内セルを決定的な乱数で選ぶ。
- 入力: 自動移動時刻以降の更新context。
- 操作: `update()`を呼び、`getSnapshot()`で移動状態を取得する。
- 期待結果: `movement.destination`は選ばれた場所内にあり、その場所の中心座標ではなく、選ばれたセル中心になる。
