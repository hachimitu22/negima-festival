# PatrolEventManager 単体テストケース

## 対象

- 詳細設計: [PatrolEventManager（見回りイベント管理）](../../../../詳細設計/ドメイン/イベント/PatrolEventManager.md)
- 対象: `src/gameDomain/mainGameScene/event/patrolEventManager.js`

caseごとに実物の`Character`、`EventIdSequence`、`PatrolEventManager`を新しく生成する。
モックや共有可変状態は使用しない。
抽選された見回り先は公開snapshotから取得し、特定の抽選結果に依存せず操作する。

## PEM-UT-S01 初期イベント

- 対象: `constructor()`、`getExecutingEventSnapshot()`
- 目的: ゲーム開始時の見回りと抽選条件を検証する。

### PEM-UT-S01-C01 生成直後から見回りを実行する

- 前提: なし。
- 入力: Character、初期値0の採番器、祭終了時刻。
- 操作: Managerを生成して実行中eventのsnapshotを取得する。
- 期待結果: ID 0の見回りが`executing`である。

### PEM-UT-S01-C02 見回り先を1地点以上3地点以下にする

- 前提: Managerを生成する。
- 入力: なし。
- 操作: 実行中eventのsnapshotを取得する。
- 期待結果: 見回り先が1地点以上3地点以下である。

### PEM-UT-S01-C03 見回り先を重複させない

- 前提: Managerを生成する。
- 入力: なし。
- 操作: snapshotから見回り先IDを取得する。
- 期待結果: すべてのIDが一意である。

### PEM-UT-S01-C04 現在地を見回り先から除外する

- 前提: Managerを生成する。
- 入力: Characterの現在地。
- 操作: snapshotから見回り先IDを取得する。
- 期待結果: Characterの現在地を含まない。

### PEM-UT-S01-C05 女子トイレを見回り先から除外する

- 前提: Managerを生成する。
- 入力: 女子トイレのlocation ID。
- 操作: snapshotから見回り先IDを取得する。
- 期待結果: 女子トイレを含まない。

### PEM-UT-S01-C06 更衣室を見回り先から除外する

- 前提: Managerを生成する。
- 入力: 更衣室のlocation ID。
- 操作: snapshotから見回り先IDを取得する。
- 期待結果: 更衣室を含まない。

## PEM-UT-S02 場所の訪問と報酬

- 対象: `visitCurrentLocation()`、`getExecutingEventSnapshot()`
- 目的: Characterの現在地による進行、完了、報酬の一度限りの反映を検証する。

### PEM-UT-S02-C01 対象外の現在地では進行しない

- 前提: Managerを生成し、Characterを見回り先ではない場所へ置く。
- 入力: なし。
- 操作: `visitCurrentLocation()`を呼ぶ。
- 期待結果: `false`を返し、event snapshotとMahoPay残高を変更しない。

### PEM-UT-S02-C02 対象の現在地を訪問する

- 前提: Managerを生成し、Characterをsnapshotに含まれる見回り先へ移動する。
- 入力: なし。
- 操作: `visitCurrentLocation()`を呼ぶ。
- 期待結果: `true`を返す。

### PEM-UT-S02-C03 全地点の訪問完了時に報酬を加算してeventを破棄する

- 前提: Managerを生成し、snapshotから全見回り先と報酬額を取得する。
- 入力: snapshotに含まれる全見回り先。
- 操作: Characterを各地点へ移動して`visitCurrentLocation()`を呼ぶ。
- 期待結果: snapshotの報酬額がCharacterへ加算され、実行中eventは`null`になる。

### PEM-UT-S02-C04 完了後に同じ場所を訪問しても報酬を再加算しない

- 前提: 見回りを完了して報酬を加算し、Characterを最後の見回り先へ置く。
- 入力: なし。
- 操作: `visitCurrentLocation()`を再度呼ぶ。
- 期待結果: `false`を返し、MahoPay残高を変更しない。

### PEM-UT-S02-C05 指定した場所IDを訪問する

- 前提: Managerを生成し、snapshotに含まれる見回り先を取得する。
- 入力: 見回り先の場所ID。
- 操作: `visitLocation(locationId)`を呼ぶ。
- 期待結果: `true`を返す。

## PEM-UT-S03 定期発生

- 対象: `advanceTo()`
- 目的: 12時間境界での生成、見送り、祭終了時刻の制限を検証する。

### PEM-UT-S03-C01 発生境界前には新しい見回りを生成しない

- 前提: 初期見回りを完了する。
- 入力: ゲーム時間11.999。
- 操作: `advanceTo()`を呼ぶ。
- 期待結果: 実行中eventは`null`のままとなる。

### PEM-UT-S03-C02 発生境界で新しい見回りを生成する

- 前提: 初期見回りを完了する。
- 入力: ゲーム時間12。
- 操作: `advanceTo()`を呼ぶ。
- 期待結果: ID 1の見回りを生成する。

### PEM-UT-S03-C03 実行中の発生境界を見送る

- 前提: 初期見回りを実行したままゲーム時間12へ進め、その後に完了する。
- 入力: ゲーム時間12。
- 操作: `advanceTo()`を再度呼ぶ。
- 期待結果: 時刻12の境界は消費済みであり、新しい見回りを生成しない。

### PEM-UT-S03-C04 複数境界を越えても一件だけ生成する

- 前提: 初期見回りを完了する。
- 入力: ゲーム時間36。
- 操作: `advanceTo()`を呼ぶ。
- 期待結果: 最初の境界でID 1の見回りを生成し、後続境界では追加生成しない。

### PEM-UT-S03-C05 祭終了時刻には新しい見回りを生成しない

- 前提: ゲーム時間60までの境界を処理し、実行中の見回りを完了する。
- 入力: ゲーム時間72。
- 操作: `advanceTo()`を呼ぶ。
- 期待結果: 新しい見回りを生成しない。

## PEM-UT-S04 時刻の巻き戻し

- 対象: `rewindTo()`、`advanceTo()`
- 目的: 巻き戻し時の破棄と次回発生境界を検証する。

### PEM-UT-S04-C01 巻き戻し時に実行中の見回りを破棄する

- 前提: 初期見回りを実行中にする。
- 入力: ゲーム時間6。
- 操作: `rewindTo()`を呼ぶ。
- 期待結果: 実行中eventは`null`になる。

### PEM-UT-S04-C02 巻き戻し後の次の境界で見回りを生成する

- 前提: ゲーム時間6へ巻き戻す。
- 入力: ゲーム時間12。
- 操作: `advanceTo()`を呼ぶ。
- 期待結果: ID 1の見回りを生成する。

### PEM-UT-S04-C03 時刻0への巻き戻しでは初期見回りを再生成しない

- 前提: ゲーム時間0へ巻き戻す。
- 入力: ゲーム時間0。
- 操作: `advanceTo()`を呼ぶ。
- 期待結果: 実行中eventは`null`のままとなる。
