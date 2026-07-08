# BranchEvent 単体テストケース

## 対象

- 詳細設計: [BranchEvent](../../../../詳細設計/ドメイン/イベント/BranchEvent.md)
- 対象: `src/gameDomain/mainGameScene/event/branchEvent.js`

`BranchEvent` の公開APIから観察できる、場所タスク分岐、選択肢タスク分岐、定義検証、snapshotを検証する。モックは使用せず、caseごとに新しいeventと入力値を生成する。

## 共通入力

ケースの説明では次の場所とタスクIDを使用する。各caseでは必要なオブジェクトを新しく生成し、case間で共有しない。

- 場所A: `{ id: 'library_room', name: 'Library' }`
- 場所B: `{ id: 'staff_room', name: 'Staff room' }`
- 場所C: `{ id: 'rest_area', name: 'Rest area' }`
- 場所D: `{ id: 'world_tree', name: 'World tree' }`
- 場所タスクID: `root`、`success`、`failure`、`final`
- 選択肢タスクID: `decide`

## BE-UT-S01 生成と入力検証

- 対象: `constructor()`、`getSnapshot()`
- 目的: 有効な分岐定義の初期化と、不正な分岐定義の拒否を検証する。

### BE-UT-S01-C01 有効な場所タスク定義でeventを初期化する

- 前提: 成功分岐と失敗分岐を持つ場所タスク定義を用意する。
- 入力: event ID 7、種別`test-branch`、名称`Test branch event`、開始タスク`root`、開始時刻0。
- 操作: `BranchEvent` を生成し、snapshotを取得する。
- 期待結果: eventは`executing`で、snapshotは指定したID、種別、名称、現在タスク`root`、`stepIndex: 0`、`stepCount: 3`を持つ。

### BE-UT-S01-C02 空のtasksを拒否する

- 前提: なし。
- 入力: `tasks: []`。
- 操作: `BranchEvent` を生成する。
- 期待結果: `TypeError` を送出する。

### BE-UT-S01-C03 重複したtask IDを拒否する

- 前提: 同じIDを持つ2つのtask定義を用意する。
- 入力: 重複IDを含むtasks。
- 操作: `BranchEvent` を生成する。
- 期待結果: `Error` を送出する。

### BE-UT-S01-C04 存在しないstartTaskIdを拒否する

- 前提: `root` だけを含むtask定義を用意する。
- 入力: `startTaskId: 'unknown'`。
- 操作: `BranchEvent` を生成する。
- 期待結果: `Error` を送出する。

### BE-UT-S01-C05 存在しない分岐先task IDを拒否する

- 前提: `root` の成功分岐が存在しないtask IDを参照する。
- 入力: 不正な分岐参照を含むtasks。
- 操作: `BranchEvent` を生成する。
- 期待結果: `Error` を送出する。

### BE-UT-S01-C06 到達可能な循環分岐を拒否する

- 前提: `root` の成功分岐が `root` 自身を参照する。
- 入力: 循環分岐を含むtasks。
- 操作: `BranchEvent` を生成する。
- 期待結果: `Error` を送出する。

### BE-UT-S01-C07 選択肢の不正なresultを拒否する

- 前提: 選択肢タスクに `result: 'unknown'` の選択肢を含める。
- 入力: 不正な選択肢を含むtasks。
- 操作: `BranchEvent` を生成する。
- 期待結果: `TypeError` を送出する。

## BE-UT-S02 場所タスク分岐

- 対象: `visitLocation()`、`advanceTo()`、`isExecuting()`、`isCompleted()`、`getSnapshot()`
- 目的: 場所タスクの成功分岐、失敗分岐、連鎖完了、完了後の無操作を検証する。

### BE-UT-S02-C01 場所タスク成功時に成功分岐へ進む

- 前提: `root` の成功分岐が `success`、失敗分岐が `failure` のeventを生成する。
- 入力: 場所AのID、現在時刻1。
- 操作: `visitLocation()` を呼び、snapshotを取得する。
- 期待結果: `true` を返し、現在タスクは`success`、`stepIndex`は1、`lastResult`は`root`の`succeeded`になる。

### BE-UT-S02-C02 場所タスク期限切れ時に失敗分岐へ進む

- 前提: `root` の制限時間が2のeventを生成する。
- 入力: 現在時刻2。
- 操作: `advanceTo()` を呼び、snapshotを取得する。
- 期待結果: `true` を返し、現在タスクは`failure`、`lastResult`は`root`の`failed`になる。

### BE-UT-S02-C03 対象外の場所訪問では分岐しない

- 前提: `root` が現在タスクのeventを生成する。
- 入力: 場所BのID、現在時刻1。
- 操作: `visitLocation()` を呼び、snapshotを取得する。
- 期待結果: `false` を返し、現在タスクは`root`、`stepIndex`は0、`lastResult`は`null`のままである。

### BE-UT-S02-C04 後続タスクの失敗分岐へ進む

- 前提: `root` を成功させて、現在タスクを`success`にする。
- 入力: `success` の期限到達時刻4。
- 操作: `advanceTo()` を呼び、snapshotを取得する。
- 期待結果: `true` を返し、現在タスクは`failure`、`lastResult`は`success`の`failed`になる。

### BE-UT-S02-C05 最終タスク解決後にeventを完了する

- 前提: `root`、`success`を成功させて、現在タスクを`final`にする。
- 入力: 場所DのID、現在時刻3。
- 操作: `visitLocation()` を呼び、snapshotを取得する。
- 期待結果: `true` を返し、eventは`completed`、現在タスクは`null`、`stepIndex`は3になる。

### BE-UT-S02-C06 完了後の訪問と時間進行を無視する

- 前提: 最終タスクを成功させて完了済みのeventを用意する。
- 入力: 任意の場所IDと時刻10。
- 操作: `visitLocation()` と `advanceTo()` を呼ぶ。
- 期待結果: どちらも `false` を返し、eventは`completed`のままである。

## BE-UT-S03 選択肢タスク分岐

- 対象: `choose()`、`visitLocation()`、`advanceTo()`、`getSnapshot()`
- 目的: 選択肢タスクの公開情報、選択結果による分岐、無効な選択を検証する。

### BE-UT-S03-C01 選択肢タスクのsnapshotに選択肢を公開する

- 前提: `decide` を開始タスクにしたeventを生成する。
- 入力: なし。
- 操作: snapshotを取得する。
- 期待結果: 現在タスクは`decide`で、選択肢IDとタイトルを定義順に公開する。選択肢の内部resultはsnapshotに含めない。

### BE-UT-S03-C02 成功扱いの選択肢で成功分岐へ進む

- 前提: `decide` の成功分岐が `success` のeventを生成する。
- 入力: 成功選択肢ID、現在時刻1。
- 操作: `choose()` を呼び、snapshotを取得する。
- 期待結果: `true` を返し、現在タスクは`success`、`lastResult`は`decide`の`succeeded`と選択肢IDを持つ。

### BE-UT-S03-C03 失敗扱いの選択肢で失敗分岐へ進む

- 前提: `decide` の失敗分岐が `failure` のeventを生成する。
- 入力: 失敗選択肢ID、現在時刻1。
- 操作: `choose()` を呼び、snapshotを取得する。
- 期待結果: `true` を返し、現在タスクは`failure`、`lastResult`は`decide`の`failed`と選択肢IDを持つ。

### BE-UT-S03-C04 未定義の選択肢IDは無視する

- 前提: `decide` が現在タスクのeventを生成する。
- 入力: 未定義の選択肢ID、現在時刻1。
- 操作: `choose()` を呼び、snapshotを取得する。
- 期待結果: `false` を返し、現在タスクは`decide`、`stepIndex`は0、`lastResult`は`null`のままである。

### BE-UT-S03-C05 選択肢タスクでは場所訪問と時間進行を無視する

- 前提: `decide` が現在タスクのeventを生成する。
- 入力: 任意の場所ID、現在時刻10。
- 操作: `visitLocation()` と `advanceTo()` を呼ぶ。
- 期待結果: どちらも `false` を返し、現在タスクは`decide`のままである。

## BE-UT-S04 snapshot

- 対象: `getSnapshot()`
- 目的: snapshotが状態参照だけに使用でき、取得後の変更がevent内部へ影響しないことを検証する。

### BE-UT-S04-C01 snapshotからevent状態を変更できない

- 前提: `root` を成功させ、現在タスクを`success`にしたeventを用意する。
- 入力: 取得済みsnapshotへの変更。
- 操作: snapshotの現在タスクとlastResultを書き換えた後、再度snapshotを取得する。
- 期待結果: 再取得したsnapshotは実際のevent状態を示し、現在タスクは`success`、`lastResult`は`root`の`succeeded`のままである。

## 対象外

- BranchEventManagerによるイベント生成順
- 具体イベント定義であるNoticeBoardEvent、ExhibitTroubleEventの内容
- renderer表示
