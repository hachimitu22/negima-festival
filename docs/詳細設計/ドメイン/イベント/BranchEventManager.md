# BranchEventManager（分岐イベント管理）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/event/branchEventManager.js`

## 目的

メインゲーム中の分岐イベントチェーンを1件保持し、ゲーム時刻と場所移動を`BranchEvent`へ接続する。
DOM rendererには依存せず、scene snapshotへ実行中イベントを渡すための状態だけを公開する。

## 所有する状態

- `character`: 現在地を参照するプレイヤーキャラクター。
- `eventIdSequence`: 分岐イベント生成時に使う共通イベントID採番器。
- `activeEvent`: 実行中の`BranchEvent`。未実行または完了後は`null`。
- `currentHours`: 最後にsceneから渡されたゲーム時刻。

## 公開契約

```js
class BranchEventManager {
  constructor({ character, eventIdSequence })
  advanceTo(currentHours)
  visitCurrentLocation()
  visitLocation(locationId)
  rewindTo(currentHours)
  getExecutingEventSnapshot()
}
```

### 生成と破棄

constructorで生成対象の分岐イベントを1件生成する。
チェーンが完了したら`activeEvent`を`null`にする。
カシオペアによる巻き戻しでは`rewindTo`で実行中チェーンを破棄し、初期イベントは再生成しない。

### MainGameSceneとの接続

- 時間更新後に`advanceTo(currentHours)`を呼び、期限切れによる失敗分岐を進める。
- 場所移動が成功した後に`visitCurrentLocation()`または`visitLocation(locationId)`を呼び、目的地到達による成功分岐を進める。
- 座標移動中に入った場所を通知する場合は`visitLocation(locationId)`を使う。
- `getExecutingEventSnapshot()`は実行中イベントがある場合だけ`BranchEvent.getSnapshot(currentHours)`を返す。

## 分岐イベント定義との境界

分岐イベントの名称、タスク定義、分岐内容、初期目的地の調整、報酬有無は個別のイベント定義側で扱う。
このmanagerは、生成済みの`BranchEvent`への時刻通知、場所訪問通知、snapshot取得、破棄だけを担当する。
