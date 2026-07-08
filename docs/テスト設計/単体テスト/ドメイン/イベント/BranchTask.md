# BranchTask 単体テストケース

## 対象

- 詳細設計: [BranchTask](../../../../詳細設計/ドメイン/イベント/BranchTask.md)
- 対象: `src/gameDomain/mainGameScene/event/branchTask.js`

`BranchTask` をケースごとに新しく生成し、公開APIだけを使用して、到達判定、期限判定、snapshotを検証する。

## 共通入力

ケースの説明では次の場所を使用する。各caseでは必要な場所オブジェクトを新しく生成し、case間で共有しない。

- 場所A: `{ id: 'library_room', name: 'Library' }`
- 場所B: `{ id: 'staff_room', name: 'Staff room' }`

## BT-UT-S01 初期化とsnapshot

- 対象: `constructor()`、`isExecuting()`、`isSucceeded()`、`isFailed()`、`getSnapshot()`
- 目的: 有効な到達タスクの初期状態と、snapshotの公開情報を検証する。

### BT-UT-S01-C01 時間制限付きタスクを実行中で初期化する

- 前提: なし。
- 入力: 場所A、開始時刻2、制限時間3。
- 操作: `BranchTask` を生成し、時刻2のsnapshotを取得する。
- 期待結果: `isExecuting()` は `true`、`isSucceeded()` と `isFailed()` は `false` を返す。snapshotは場所A、`executing`、開始時刻2、制限時間3、期限5、残り3時間を持つ。

### BT-UT-S01-C02 snapshotからタスク状態を変更できない

- 前提: 場所A、開始時刻0、制限時間4の実行中taskを生成する。
- 入力: 時刻1のsnapshot。
- 操作: 取得したsnapshotの場所、状態、残り時間を書き換えた後、再度snapshotを取得する。
- 期待結果: 再取得したsnapshotは書き換え前のtask状態を示し、場所A、`executing`、残り3時間のままである。

### BT-UT-S01-C03 小数時刻の残り時間を計算する

- 前提: 場所A、開始時刻1.5、制限時間2.25の実行中taskを生成する。
- 入力: 時刻2.25。
- 操作: snapshotを取得する。
- 期待結果: 期限は3.75、残り時間は1.5になる。

## BT-UT-S02 入力検証

- 対象: `constructor()`、`advanceTo()`、`getSnapshot()`
- 目的: 不正な設定値と時刻入力を拒否することを検証する。

### BT-UT-S02-C01 destinationがnullの設定を拒否する

- 前提: なし。
- 入力: `destination: null`。
- 操作: `BranchTask` を生成する。
- 期待結果: `TypeError` を送出する。

### BT-UT-S02-C02 destination.idが文字列でない設定を拒否する

- 前提: なし。
- 入力: `destination.id` が数値の場所。
- 操作: `BranchTask` を生成する。
- 期待結果: `TypeError` を送出する。

### BT-UT-S02-C03 destination.nameが文字列でない設定を拒否する

- 前提: なし。
- 入力: `destination.name` が数値の場所。
- 操作: `BranchTask` を生成する。
- 期待結果: `TypeError` を送出する。

### BT-UT-S02-C04 startHoursが負数の設定を拒否する

- 前提: なし。
- 入力: 開始時刻-1。
- 操作: `BranchTask` を生成する。
- 期待結果: `TypeError` を送出する。

### BT-UT-S02-C05 durationHoursが0の設定を拒否する

- 前提: なし。
- 入力: 制限時間0。
- 操作: `BranchTask` を生成する。
- 期待結果: `RangeError` を送出する。

### BT-UT-S02-C06 currentHoursが負数の進行を拒否する

- 前提: 場所A、開始時刻0、制限時間2の実行中taskを生成する。
- 入力: 現在時刻-1。
- 操作: `advanceTo()` を呼ぶ。
- 期待結果: `TypeError` を送出する。

### BT-UT-S02-C07 currentHoursが有限数でないsnapshot取得を拒否する

- 前提: 場所A、開始時刻0、制限時間2の実行中taskを生成する。
- 入力: 現在時刻 `Infinity`。
- 操作: `getSnapshot()` を呼ぶ。
- 期待結果: `TypeError` を送出する。

## BT-UT-S03 訪問と期限による状態遷移

- 対象: `visitLocation()`、`advanceTo()`、`isExecuting()`、`isSucceeded()`、`isFailed()`、`getSnapshot()`
- 目的: 到達成功、対象外訪問、期限失敗、完了後の無操作を検証する。

### BT-UT-S03-C01 期限前に目的地を訪問すると成功する

- 前提: 場所A、開始時刻1、制限時間3の実行中taskを生成する。
- 入力: 場所AのID、現在時刻3。
- 操作: `visitLocation()` を呼ぶ。
- 期待結果: `true` を返し、taskは`succeeded`になる。

### BT-UT-S03-C02 対象外の場所訪問では状態を変更しない

- 前提: 場所A、開始時刻1、制限時間3の実行中taskを生成する。
- 入力: 場所BのID、現在時刻3。
- 操作: `visitLocation()` を呼び、snapshotを取得する。
- 期待結果: `false` を返し、taskは`executing`、残り時間は1のままである。

### BT-UT-S03-C03 期限到達時刻の目的地訪問は失敗扱いになる

- 前提: 場所A、開始時刻1、制限時間3の実行中taskを生成する。
- 入力: 場所AのID、現在時刻4。
- 操作: `visitLocation()` を呼ぶ。
- 期待結果: `false` を返し、taskは`failed`になる。

### BT-UT-S03-C04 期限前のadvanceToでは状態を変更しない

- 前提: 場所A、開始時刻1、制限時間3の実行中taskを生成する。
- 入力: 現在時刻3.99。
- 操作: `advanceTo()` を呼ぶ。
- 期待結果: `false` を返し、taskは`executing`のままである。

### BT-UT-S03-C05 期限到達時刻のadvanceToで失敗する

- 前提: 場所A、開始時刻1、制限時間3の実行中taskを生成する。
- 入力: 現在時刻4。
- 操作: `advanceTo()` を呼ぶ。
- 期待結果: `true` を返し、taskは`failed`になる。

### BT-UT-S03-C06 成功後の訪問と時間進行を無視する

- 前提: 場所Aを訪問して成功済みのtaskを用意する。
- 入力: 場所AのIDと期限後の時刻10。
- 操作: `visitLocation()` と `advanceTo()` を呼ぶ。
- 期待結果: どちらも `false` を返し、taskは`succeeded`のままである。

## 対象外

- BranchEventによる分岐先選択
- BranchEventManagerによるイベント生成
- renderer表示
