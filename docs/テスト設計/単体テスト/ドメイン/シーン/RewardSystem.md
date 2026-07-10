# RewardSystem（報酬System）

## 対象

- `src/gameDomain/mainGameScene/rewardSystem.js`

## 方針

実物の`Character`、`Student`、`Teacher`を使い、公開APIとsnapshotから報酬反映を検証する。
DOM、実時間、乱数には依存しない。

## Test Suite

### RS-UT-S01 好感度報酬

#### RS-UT-S01-C01 通常会話結果から生徒の好感度を変更する

- 前提: 生徒actorを返す`actorsProvider`を持つ`RewardSystem`を作る。
- 入力: 生徒actor IDと通常会話結果。
- 操作: `applyConversationResult(actorId, result)`を呼ぶ。
- 期待結果: `true`を返し、生徒snapshotの好感度が上がる。

#### RS-UT-S01-C02 教師への通常会話結果では好感度を変更しない

- 前提: 教師actorを返す`actorsProvider`を持つ`RewardSystem`を作る。
- 入力: 教師actor IDと通常会話結果。
- 操作: `applyConversationResult(actorId, result)`を呼ぶ。
- 期待結果: `false`を返す。

#### RS-UT-S01-C03 指定された基礎好感度変化量を生徒へ反映する

- 前提: 生徒actorを返す`actorsProvider`を持つ`RewardSystem`を作る。
- 入力: 生徒actor IDと基礎変化量20。
- 操作: `applyAffection(actorId, 20)`を呼ぶ。
- 期待結果: `true`を返し、生徒snapshotの好感度が20上がる。

### RS-UT-S02 MahoPay報酬

#### RS-UT-S02-C01 MahoPayポイントを主人公へ加算する

- 前提: 主人公Characterを持つ`RewardSystem`を作る。
- 入力: 100ポイント。
- 操作: `addMahoPayPoints(100)`を呼ぶ。
- 期待結果: `true`を返し、Character snapshotのMahoPay残高が100になる。
