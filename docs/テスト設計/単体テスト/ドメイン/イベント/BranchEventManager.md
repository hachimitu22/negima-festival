# BranchEventManager 単体テストケース

## 対象

- 詳細設計: [BranchEventManager](../../../../詳細設計/ドメイン/イベント/BranchEventManager.md)
- 対象: `src/gameDomain/mainGameScene/event/branchEventManager.js`

caseごとに実物の `Character`、`EventIdSequence`、`BranchEventManager` を新しく生成する。モックは使用せず、公開snapshotと戻り値だけで分岐イベント管理を検証する。

## 共通入力

- 初期現在地: `LOCATION_IDS.GYM_FRONT_PARKING`
- ID採番器: 初期値0の `EventIdSequence`
- 実行イベント: 掲示板イベントの完了後に展示トラブル対応イベントが生成される

## BEM-UT-S01 初期分岐イベント

- 対象: `constructor()`、`getExecutingEventSnapshot()`
- 目的: ゲーム開始時に最初の分岐イベントが生成されることを検証する。

### BEM-UT-S01-C01 生成直後に掲示板イベントを実行する

- 前提: 初期現在地の `Character` と初期値0の `EventIdSequence` を用意する。
- 入力: なし。
- 操作: `BranchEventManager` を生成し、実行中eventのsnapshotを取得する。
- 期待結果: ID 0、種別`notice-board`、状態`executing`、現在タスク`find-notice`のeventを返す。

### BEM-UT-S01-C02 初期タスクの目的地は現在地以外になる

- 前提: 初期現在地の `Character` でmanagerを生成する。
- 入力: なし。
- 操作: 実行中eventのsnapshotを取得する。
- 期待結果: 現在タスクの目的地IDは `Character.locationId` と異なる。

## BEM-UT-S02 時刻と移動による進行

- 対象: `visitCurrentLocation()`、`visitLocation(locationId)`、`advanceTo()`、`getExecutingEventSnapshot()`
- 目的: 現在地訪問と期限到達で、実行中eventが分岐することを検証する。

### BEM-UT-S02-C01 現在タスクの目的地訪問で成功分岐へ進む

- 前提: 掲示板イベントを実行中のmanagerを生成する。
- 入力: `Character` を現在タスクの目的地へ移動する。
- 操作: `visitCurrentLocation()` を呼び、snapshotを取得する。
- 期待結果: `true` を返し、現在タスクは`deliver-notice`、`lastResult`は`find-notice`の`succeeded`になる。

### BEM-UT-S02-C02 期限到達で失敗分岐へ進む

- 前提: 掲示板イベントを実行中のmanagerを生成する。
- 入力: 現在タスクの期限時刻。
- 操作: `advanceTo()` を呼び、snapshotを取得する。
- 期待結果: `true` を返し、現在タスクは`search-rest-area`、`lastResult`は`find-notice`の`failed`になる。

### BEM-UT-S02-C03 掲示板イベント完了後に展示トラブル対応イベントを開始する

- 前提: 掲示板イベントを成功分岐で最後まで完了できるmanagerを生成する。
- 入力: 各現在タスクの目的地。
- 操作: 目的地訪問を繰り返して掲示板イベントを完了し、snapshotを取得する。
- 期待結果: ID 1、種別`exhibit-trouble`、現在タスク`decide-approach`のeventを返す。

### BEM-UT-S02-C04 指定した場所IDの訪問で成功分岐へ進む

- 前提: 掲示板イベントを実行中のmanagerを生成する。
- 入力: 現在タスクの目的地ID。
- 操作: `visitLocation(locationId)`を呼び、snapshotを取得する。
- 期待結果: `true`を返し、現在タスクは`deliver-notice`、`lastResult`は`find-notice`の`succeeded`になる。

## BEM-UT-S03 選択肢による進行

- 対象: `chooseCurrentTask()`、`getExecutingEventSnapshot()`
- 目的: 展示トラブル対応イベントの選択肢タスクをmanager経由で進行できることを検証する。

### BEM-UT-S03-C01 展示トラブル対応イベントの成功選択肢で資材取得タスクへ進む

- 前提: 掲示板イベントを完了し、展示トラブル対応イベントの`decide-approach`を実行中にする。
- 入力: 選択肢ID`fetch-supplies`。
- 操作: `chooseCurrentTask()` を呼び、snapshotを取得する。
- 期待結果: `true` を返し、現在タスクは`fetch-supplies`、`lastResult`は`decide-approach`の`succeeded`と選択肢IDを持つ。

### BEM-UT-S03-C02 展示トラブル対応イベントの失敗選択肢で展示移動タスクへ進む

- 前提: 掲示板イベントを完了し、展示トラブル対応イベントの`decide-approach`を実行中にする。
- 入力: 選択肢ID`move-exhibit`。
- 操作: `chooseCurrentTask()` を呼び、snapshotを取得する。
- 期待結果: `true` を返し、現在タスクは`move-exhibit`、`lastResult`は`decide-approach`の`failed`と選択肢IDを持つ。

### BEM-UT-S03-C03 未定義の選択肢IDは進行しない

- 前提: 展示トラブル対応イベントの`decide-approach`を実行中にする。
- 入力: 未定義の選択肢ID。
- 操作: `chooseCurrentTask()` を呼び、snapshotを取得する。
- 期待結果: `false` を返し、現在タスクは`decide-approach`、`lastResult`は`null`のままである。

### BEM-UT-S03-C04 選択肢タスクではない場合のchooseCurrentTaskを無視する

- 前提: 掲示板イベントの場所タスクを実行中にする。
- 入力: 任意の選択肢ID。
- 操作: `chooseCurrentTask()` を呼び、snapshotを取得する。
- 期待結果: `false` を返し、現在タスクは`find-notice`のままである。

## BEM-UT-S04 完了と破棄

- 対象: `visitCurrentLocation()`、`chooseCurrentTask()`、`advanceTo()`、`rewindTo()`、`getExecutingEventSnapshot()`
- 目的: すべての分岐イベント完了後の破棄と、巻き戻し時の破棄を検証する。

### BEM-UT-S04-C01 展示トラブル対応イベント完了後に実行中eventをnullにする

- 前提: 展示トラブル対応イベントを実行中にする。
- 入力: 成功選択肢と後続タスクの目的地。
- 操作: `chooseCurrentTask()` と目的地訪問を繰り返して展示トラブル対応イベントを完了する。
- 期待結果: `getExecutingEventSnapshot()` は `null` を返す。

### BEM-UT-S04-C02 実行中eventがない場合は操作を無視する

- 前提: すべての分岐イベントを完了し、実行中eventがないmanagerを用意する。
- 入力: 任意の時刻、現在地、選択肢ID。
- 操作: `advanceTo()`、`visitCurrentLocation()`、`chooseCurrentTask()` を呼ぶ。
- 期待結果: すべて `false` を返し、実行中eventは`null`のままである。

### BEM-UT-S04-C03 巻き戻し時に実行中eventを破棄し再生成しない

- 前提: 掲示板イベントを実行中のmanagerを生成する。
- 入力: 巻き戻し時刻0、その後の時刻24。
- 操作: `rewindTo(0)` を呼んだ後、`advanceTo(24)`、`visitCurrentLocation()`、`chooseCurrentTask()` を呼ぶ。
- 期待結果: 実行中eventは`null`のままで、各操作は`false`を返す。

## 対象外

- MainGameSceneからの呼び出し順
- renderer表示
- MahoPay報酬
