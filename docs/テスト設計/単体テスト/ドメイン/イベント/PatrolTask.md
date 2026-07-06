# PatrolTask 単体テストケース

## 対象

- 詳細設計: [PatrolTask（見回りタスク）](../../../../詳細設計/ドメイン/イベント/PatrolTask.md)
- 対象予定: `src/gameDomain/mainGameScene/event/patrolTask.js`

`PatrolTask`をcaseごとに新しく生成し、公開APIだけを使用して検証する。

## 共通入力

ケースの説明では次の場所を使用する。
各caseでは必要な場所オブジェクトを新しく生成し、case間で共有しない。

- 場所A: `{ id: 'library_room', name: '図書室' }`
- 場所B: `{ id: 'world_tree', name: '世界樹' }`
- 場所C: `{ id: 'school_ground', name: 'グラウンド' }`

## PT-UT-S01 生成と入力検証

- 対象: `constructor()`、`isExecuting()`、`isSucceeded()`、`getSnapshot()`
- 目的: 有効な見回り先による初期状態と、不正な入力の拒否を検証する。

### PT-UT-S01-C01 1地点で初期化する

- 前提: なし。
- 入力: `destinations`へ場所Aだけを指定する。
- 操作: `PatrolTask`を生成し、状態照会とsnapshot取得を行う。
- 期待結果: `isExecuting()`は`true`、`isSucceeded()`は`false`を返す。snapshotは`executing`と、未訪問の場所Aを持つ。

### PT-UT-S01-C02 3地点の順序を維持する

- 前提: なし。
- 入力: `destinations`へ場所B、場所A、場所Cの順で指定する。
- 操作: `PatrolTask`を生成してsnapshotを取得する。
- 期待結果: 3地点を受け入れ、snapshotも場所B、場所A、場所Cの順になる。全地点が未訪問になる。

### PT-UT-S01-C03 nullのdestinationsを拒否する

- 前提: なし。
- 入力: `destinations`へ`null`を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `TypeError`を送出する。

### PT-UT-S01-C04 plain objectのdestinationsを拒否する

- 前提: なし。
- 入力: `destinations`へplain objectを指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `TypeError`を送出する。

### PT-UT-S01-C05 文字列のdestinationsを拒否する

- 前提: なし。
- 入力: `destinations`へ文字列を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `TypeError`を送出する。

### PT-UT-S01-C06 0地点を拒否する

- 前提: なし。
- 入力: `destinations`へ空配列を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `RangeError`を送出する。

### PT-UT-S01-C07 4地点を拒否する

- 前提: なし。
- 入力: `destinations`へ4地点を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `RangeError`を送出する。

### PT-UT-S01-C08 nullの場所を拒否する

- 前提: なし。
- 入力: `destinations`へ`null`を要素として持つ配列を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `TypeError`を送出する。

### PT-UT-S01-C09 IDがない場所を拒否する

- 前提: なし。
- 入力: `destinations`へ`name`だけを持つ場所を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `TypeError`を送出する。

### PT-UT-S01-C10 名前がない場所を拒否する

- 前提: なし。
- 入力: `destinations`へ`id`だけを持つ場所を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `TypeError`を送出する。

### PT-UT-S01-C11 空のIDを拒否する

- 前提: なし。
- 入力: `destinations`へ空文字の`id`を持つ場所を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `TypeError`を送出する。

### PT-UT-S01-C12 空の名前を拒否する

- 前提: なし。
- 入力: `destinations`へ空文字の`name`を持つ場所を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `TypeError`を送出する。

### PT-UT-S01-C13 文字列でないIDを拒否する

- 前提: なし。
- 入力: `destinations`へ文字列以外の`id`を持つ場所を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `TypeError`を送出する。

### PT-UT-S01-C14 文字列でない名前を拒否する

- 前提: なし。
- 入力: `destinations`へ文字列以外の`name`を持つ場所を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `TypeError`を送出する。

### PT-UT-S01-C15 重複した場所IDを拒否する

- 前提: なし。
- 入力: `destinations`へ同じ`id`を持つ2地点を指定する。
- 操作: `PatrolTask`を生成する。
- 期待結果: `Error`を送出する。

## PT-UT-S02 訪問と状態遷移

- 対象: `visitLocation()`、`isExecuting()`、`isSucceeded()`、`getSnapshot()`
- 目的: 場所訪問による進捗、成功、無効な訪問の扱いを検証する。

### PT-UT-S02-C01 対象外の場所を訪問しても変更しない

- 前提: 場所Aと場所Bを持つ実行中taskを生成する。
- 入力: 見回り先ではない場所CのID。
- 操作: `visitLocation()`を呼ぶ。
- 期待結果: `false`を返す。taskは`executing`のままで、全地点が未訪問のままになる。

### PT-UT-S02-C02 未訪問地点を訪問済みにする

- 前提: 場所Aと場所Bを持つ実行中taskを生成する。
- 入力: 場所AのID。
- 操作: `visitLocation()`を呼ぶ。
- 期待結果: `true`を返す。場所Aだけが訪問済みになり、場所Bは未訪問、taskは`executing`のままになる。

### PT-UT-S02-C03 訪問済み地点の再訪問を無視する

- 前提: 場所Aと場所Bを持つtaskで、場所Aを訪問済みにする。
- 入力: 場所AのID。
- 操作: `visitLocation()`を再度呼ぶ。
- 期待結果: `false`を返す。訪問状態と`executing`状態は変化しない。

### PT-UT-S02-C04 任意の順序で全地点を訪問して成功する

- 前提: 場所A、場所B、場所Cを持つ実行中taskを生成する。
- 入力: 場所C、場所A、場所BのID。
- 操作: 入力順に`visitLocation()`を呼ぶ。
- 期待結果: 場所Cと場所Aの訪問後は`executing`を維持する。最後の場所Bの訪問は`true`を返し、全地点が訪問済みになって`succeeded`へ遷移する。

### PT-UT-S02-C05 1地点では最初の訪問で成功する

- 前提: 場所Aだけを持つ実行中taskを生成する。
- 入力: 場所AのID。
- 操作: `visitLocation()`を呼ぶ。
- 期待結果: `true`を返し、場所Aが訪問済みになる。`isExecuting()`は`false`、`isSucceeded()`は`true`を返す。

### PT-UT-S02-C06 成功後の訪問済み地点を無視する

- 前提: 場所Aだけを持つtaskを成功させる。
- 入力: 訪問済みの場所AのID。
- 操作: `visitLocation()`を呼ぶ。
- 期待結果: `false`を返し、成功状態と訪問状態は変化しない。

### PT-UT-S02-C07 成功後の対象外地点を無視する

- 前提: 場所Aだけを持つtaskを成功させる。
- 入力: 見回り先ではない場所BのID。
- 操作: `visitLocation()`を呼ぶ。
- 期待結果: `false`を返し、成功状態と訪問状態は変化しない。

## PT-UT-S03 snapshot

- 対象: `getSnapshot()`
- 目的: snapshotが状態参照だけに使用できることを検証する。

### PT-UT-S03-C01 snapshotからtaskの状態を変更できない

- 前提: 場所Aと場所Bを持つtaskで、場所Aを訪問済みにする。
- 入力: 取得したsnapshotに対する状態、配列順序、場所Aの情報、訪問状態の変更。
- 操作: 最初のsnapshotを変更した後、snapshotを再取得する。
- 期待結果: 再取得したsnapshotは変更前のtask状態を示し、最初のsnapshotに対する変更の影響を受けない。

## 対象外

- `MainGameScene`からの訪問通知
- 見回り先の無作為抽選
- MahoPay報酬
- renderer表示
