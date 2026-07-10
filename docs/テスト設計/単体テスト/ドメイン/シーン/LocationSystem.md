# LocationSystem（場所System）

## 対象

- `src/gameDomain/mainGameScene/locationSystem.js`

## 方針

小さな`visitSources`と`locationRequests` adapterを使い、公開APIの戻り値と発行requestだけを検証する。
DOM、実時間、乱数には依存しない。

## Test Suite

### LS-UT-S01 空間状態versionと訪問request

#### LS-UT-S01-C01 version変更時に訪問sourceを消費して場所訪問requestを発行する

- 前提: `characters`用の訪問sourceと記録用requestを持つ`LocationSystem`を作る。
- 入力: `spatialVersions.characters`を前回から進め、訪問IDに重複を含める。
- 操作: `update()`を呼ぶ。
- 期待結果: 重複排除済みの訪問IDが`locationRequests.visitLocations()`へ渡る。

#### LS-UT-S01-C02 versionが変わらない場合は訪問sourceを消費しない

- 前提: 1回目の`update()`でversionを記録済みにする。
- 入力: 同じ`spatialVersions.characters`。
- 操作: `update()`を呼ぶ。
- 期待結果: 訪問sourceとrequestは呼ばれず、戻り値の`visitedLocationIds`は空配列になる。

#### LS-UT-S01-C03 複数sourceのうち変化したkeyだけを消費する

- 前提: `characters`と`worldObjects`の訪問sourceを持つ`LocationSystem`を作る。
- 入力: `worldObjects`だけversionを進める。
- 操作: `update()`を呼ぶ。
- 期待結果: `worldObjects`の訪問sourceだけが呼ばれる。
