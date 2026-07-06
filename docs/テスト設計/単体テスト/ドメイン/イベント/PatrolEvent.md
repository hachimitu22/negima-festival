# PatrolEvent 単体テストケース

## 対象

- 詳細設計: [PatrolEvent（見回りイベント）](../../../../詳細設計/ドメイン/イベント/PatrolEvent.md)
- 対象: `src/gameDomain/mainGameScene/event/patrolEvent.js`

`PatrolEvent`の公開APIから観察できる振る舞いを検証する。
モックは使用せず、caseごとに新しいeventと入力値を生成する。

## 共通入力

ケースの説明では次の場所を使用する。
各caseでは必要な場所オブジェクトを新しく生成し、case間で共有しない。

- 場所A: `{ id: 'library_room', name: '図書室' }`
- 場所B: `{ id: 'world_tree', name: '世界樹' }`
- 場所C: `{ id: 'school_ground', name: 'グラウンド' }`

報酬の期待値は[MahoPayポイント収支一覧](../../../../基本設計/ゲームシステム/MahoPayポイント収支一覧.md)の`patrol-completion`を正本とする。

## PE-UT-S01 生成と公開情報

- 対象: `constructor()`、`isExecuting()`、`isSucceeded()`、`getSnapshot()`
- 目的: 生成時の状態、報酬、renderer向け情報を検証する。

### PE-UT-S01-C01 1地点のeventを初期化する

- 前提: なし。
- 入力: event IDと場所A。
- 操作: `PatrolEvent`を生成し、状態とsnapshotを取得する。
- 期待結果: eventは実行中で成功前となる。snapshotは指定したID、event情報、未訪問の場所A、1地点分の報酬を持つ。

### PE-UT-S01-C02 3地点分の報酬を確定する

- 前提: なし。
- 入力: 場所A、場所B、場所C。
- 操作: `PatrolEvent`を生成してsnapshotを取得する。
- 期待結果: snapshotの報酬は中央収支定義の3地点分となる。

### PE-UT-S01-C03 初期descriptionへ順序と訪問状態を反映する

- 前提: なし。
- 入力: 場所B、場所Aの順の見回り先。
- 操作: `PatrolEvent`を生成してsnapshotを取得する。
- 期待結果: descriptionは`見回り先: 世界樹（未訪問）、図書室（未訪問）`となり、`destinations`も場所B、場所Aの順になる。

## PE-UT-S02 訪問と状態遷移

- 対象: `visitLocation()`、`isExecuting()`、`isSucceeded()`、`getSnapshot()`
- 目的: 場所訪問による進捗、成功、報酬額の不変性を検証する。

### PE-UT-S02-C01 対象外の訪問ではeventの進捗を変更しない

- 前提: 場所Aと場所Bを持つ実行中eventを生成する。
- 入力: 見回り先ではない場所CのID。
- 操作: `visitLocation()`を呼ぶ。
- 期待結果: `false`を返す。eventは実行中のままで、snapshotは変化しない。

### PE-UT-S02-C02 訪問進捗をsnapshotへ反映する

- 前提: 場所Aと場所Bを持つ実行中eventを生成する。
- 入力: 場所AのID。
- 操作: `visitLocation()`を呼んでsnapshotを取得する。
- 期待結果: `true`を返す。場所Aだけが訪問済みとなり、descriptionへ反映される。

### PE-UT-S02-C03 最後の訪問で成功する

- 前提: 場所Aと場所Bを持つeventで、場所Aを訪問済みにする。
- 入力: 場所BのID。
- 操作: `visitLocation()`を呼ぶ。
- 期待結果: `true`を返す。eventは成功し、snapshotは全地点を訪問済みかつ`succeeded`として返す。

### PE-UT-S02-C04 進行によって報酬額を変更しない

- 前提: 場所Aと場所Bを持つ実行中eventを生成する。
- 入力: 場所A、場所BのID。
- 操作: 生成直後、場所Aの訪問後、場所Bの訪問後にsnapshotを取得する。
- 期待結果: すべて同じ2地点分の報酬を持つ。

## PE-UT-S03 報酬の請求

- 対象: `claimRewardPoints()`
- 目的: 成功報酬を成功後に一度だけ請求できることを検証する。

### PE-UT-S03-C01 成功前は報酬を請求できない

- 前提: 場所Aを持つ実行中eventを生成する。
- 入力: なし。
- 操作: `claimRewardPoints()`を呼ぶ。
- 期待結果: `null`を返す。

### PE-UT-S03-C02 成功後の初回請求で報酬を取得する

- 前提: 場所Aと場所Bを訪問してeventを成功させる。
- 入力: なし。
- 操作: `claimRewardPoints()`を呼ぶ。
- 期待結果: 2地点分の報酬を返す。

### PE-UT-S03-C03 報酬を二回請求できない

- 前提: 場所Aを訪問してeventを成功させ、報酬を一度請求する。
- 入力: なし。
- 操作: `claimRewardPoints()`を再度呼ぶ。
- 期待結果: `null`を返す。

## PE-UT-S04 snapshot

- 対象: `getSnapshot()`
- 目的: snapshotが状態参照だけに使用できることを検証する。

### PE-UT-S04-C01 snapshotからeventの状態を変更できない

- 前提: 場所Aと場所Bを持つeventで、場所Aを訪問済みにする。
- 入力: 取得したsnapshotに対するメタデータ、状態、配列、場所情報の変更。
- 操作: 最初のsnapshotを変更した後、snapshotを再取得する。
- 期待結果: 再取得したsnapshotは変更前のevent状態を示し、最初のsnapshotに対する変更の影響を受けない。

## 対象外

- 見回りの生成時刻と見回り先の抽選
- `Character`へのMahoPay報酬適用
- renderer表示
