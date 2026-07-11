# TimeControlSystem（時間制御System）

## 対象

- `src/gameDomain/mainGameScene/timeControlSystem.js`

## 方針

実物の`Character`を使い、公開APIとsnapshot fragmentから時間進行、フェス終了、カシオペア遡行を検証する。
DOM、実時間、乱数には依存しない。

## Test Suite

### TCS-UT-S01 ゲーム時間進行

#### TCS-UT-S01-C01 frame経過時間からゲーム時間を進める

- 前提: 時間倍率`0.5`、祭終了`72`時間の`TimeControlSystem`を作る。
- 入力: `deltaTimeMs: 2000`。
- 操作: `advance(frame)`を呼ぶ。
- 期待結果: `elapsedGameHours`は1、snapshotの現在時間は1になる。

#### TCS-UT-S01-C02 祭終了時刻で時間を止める

- 前提: 時間倍率`1`、祭終了`2`時間の`TimeControlSystem`を作る。
- 入力: `deltaTimeMs: 3000`。
- 操作: `advance(frame)`を呼ぶ。
- 期待結果: 現在時間は2、`isEnded`は`true`、`elapsedGameHours`は2になる。

#### TCS-UT-S01-C03 フェス終了後は時間を進めない

- 前提: 祭終了済みまで進めた`TimeControlSystem`を作る。
- 入力: 追加の`deltaTimeMs`。
- 操作: `advance(frame)`を呼ぶ。
- 期待結果: `elapsedGameHours`は0、現在時間は終了時刻のままになる。

### TCS-UT-S02 カシオペア遡行

#### TCS-UT-S02-C01 使用可能な場合はMPを消費して時間を戻す

- 前提: 現在時間30、MP100の主人公を持つ`TimeControlSystem`を作る。
- 入力: なし。
- 操作: `useCassiopeia()`を呼ぶ。
- 期待結果: `currentHours`は6、MPは70、ループ数は2になる。

#### TCS-UT-S02-C02 MP不足の場合は状態を変更しない

- 前提: 現在時間30、MP29の主人公を持つ`TimeControlSystem`を作る。
- 入力: なし。
- 操作: `useCassiopeia()`を呼ぶ。
- 期待結果: `false`を返し、現在時間、MP、ループ数は変わらない。

#### TCS-UT-S02-C03 24時間未満ではゲーム時間0まで戻す

- 前提: 現在時間10、MP100の主人公を持つ`TimeControlSystem`を作る。
- 入力: なし。
- 操作: `useCassiopeia()`を呼ぶ。
- 期待結果: `currentHours`は0、MPは70、ループ数は2になる。

### TCS-UT-S03 更新context

#### TCS-UT-S03-C01 frameと現在時間から更新context fragmentを作る

- 前提: 現在時間1の`TimeControlSystem`を作る。
- 入力: `deltaTimeMs: 1000`、`frameCount: 2`、`targetFrameTimeMs: 1000 / 60`。
- 操作: `createUpdateContextFragment(frame)`を呼ぶ。
- 期待結果: `deltaTimeMs`、`frameCount`、`targetFrameTimeMs`、`deltaFrames`、`gameTimeHours`、`isFestivalEnded`を返す。
