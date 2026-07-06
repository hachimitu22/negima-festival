# PatrolEventManager（見回りイベント管理）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/event/patrolEventManager.js`
- 対応する基本仕様: [見回りイベント](../../../基本設計/イベント/見回りイベント.md)

## 目的

見回りイベントの生成、定期発生、場所移動との接続、成功報酬の反映、実行中イベントの保持と破棄を管理する。
`MainGameScene`へ見回り固有の判断を公開せず、renderer向けには実行中eventのsnapshotだけを提供する。

## 所有する状態

- `character`: 現在地の参照とMahoPay報酬の反映対象
- `eventIdSequence`: 見回り生成時に使用する共通event ID採番器
- `durationHours`: 祭の終了時刻
- `activeEvent`: 実行中の`PatrolEvent`。未実行時は`null`
- `nextPatrolTimeHours`: 次に見回りの発生可否を判定する時刻

生成直後に最初の見回りを生成し、次回判定時刻を12とする。

## 公開契約

```js
class PatrolEventManager {
  constructor({ character, eventIdSequence, durationHours })
  advanceTo(currentHours)
  visitCurrentLocation()
  rewindTo(currentHours)
  getExecutingEventSnapshot()
}
```

### advanceTo

`currentHours`以下かつ`durationHours`未満の12時間境界を古い順に処理する。
境界で`activeEvent`がなければ見回りを生成し、実行中ならその境界での生成を見送る。
処理した境界は生成の有無にかかわらず次へ進める。

大きな時間差で複数境界を越えた場合、最初の境界で生成された見回りが後続境界では実行中となるため、一度の呼び出しで複数件を生成しない。
祭の終了時刻とそれ以降では生成しない。

### visitCurrentLocation

実行中の見回りへ`character.locationId`を通知する。
未訪問の見回り先を訪問した場合は`true`、それ以外は`false`を返す。

訪問によって見回りが成功した場合は、`PatrolEvent.claimRewardPoints()`で報酬を一度だけ請求し、`Character.addMahoPayPoints()`で反映してから`activeEvent`を破棄する。
報酬額や完了結果は呼び出し側へ返さない。

### rewindTo

`activeEvent`を破棄する。
次回判定時刻を、`currentHours`より大きい最小の12の倍数へ設定する。
`currentHours`が0の場合も初期見回りは再生成しない。

### getExecutingEventSnapshot

実行中の場合は`PatrolEvent.getSnapshot()`の結果、未実行の場合は`null`を返す。
`PatrolEvent`自体は外部へ公開しない。

## 見回り先の抽選

1. 全locationから生成時の現在地、女子トイレ、更衣室を除外する。
2. 見回り先の件数を1件から3件の範囲で等確率に決定する。
3. 候補から1件を等確率で選び、同じ候補を再選出できないように取り除く。
4. 決定した件数に達するまで選出を繰り返す。

選出順序はevent完了まで維持する。

## 他オブジェクトとの境界

- `MainGameScene`は生成時に実物の`Character`、共有`EventIdSequence`、祭終了時刻を渡す。
- `MainGameScene`は時間更新、成立した場所移動、カシオペアによる巻き戻しを公開APIへ接続する。
- [`PatrolEvent`](PatrolEvent.md)が訪問状態、成功状態、報酬請求、event snapshotを管理する。
- rendererは`MainGameScene`のscene snapshotへ格納されたevent snapshotだけを参照する。

## 単体テスト

[PatrolEventManager単体テストケース](../../../テスト設計/単体テスト/ドメイン/イベント/PatrolEventManager.md)を参照する。

## 依存先

- [EventIdSequence（イベントID採番器）](EventIdSequence.md)
- [PatrolEvent（見回りイベント）](PatrolEvent.md)
- [GameObject（Character）](../../ゲームエンジン/GameObject.md#character)
- location定義と乱数
