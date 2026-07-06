# PatrolEvent（見回りイベント）

<script setup>
import MahoPayTransactionTable from '../../../.vitepress/components/MahoPayTransactionTable.vue'
</script>

## 文書情報

- 設計状態: 確定
- 対象予定: `src/gameDomain/mainGameScene/event/patrolEvent.js`
- 対応する基本仕様: [見回りイベント](../../../基本設計/イベント/見回りイベント.md)

## 目的

`PatrolTask`と成功時のMahoPay報酬をまとめ、`MainGameScene`へ見回りの進行、状態照会、renderer向けsnapshotを提供する。
見回りの生成時期、見回り先の抽選、報酬残高への加算は管理しない。

## 所有する状態

- `id`: 配達、同行、見回りで一意となるevent ID
- `task`: 見回り先と訪問状態を管理する`PatrolTask`
- `rewardPoints`: 成功時に一括付与するMahoPayポイント

報酬単価はモジュール内部の`PATROL_REWARD_POINTS_PER_DESTINATION`で定義する。
値は`patrol-completion`の収支定義に従い、`rewardPoints`はコンストラクタで見回り先の件数から確定して進行中に変更しない。

<MahoPayTransactionTable :ids="['patrol-completion']" />

## 公開契約

```js
class PatrolEvent {
  constructor(id, { destinations })
  visitLocation(locationId)
  isExecuting()
  isSucceeded()
  getRewardPoints()
  getSnapshot()
}
```

### constructor

`id`を保持し、`destinations`から`PatrolTask`を生成する。
見回り先の検証と防御的コピーは`PatrolTask`へ委譲する。

### visitLocation

実行中に未訪問の見回り先を指定した場合だけ進捗を更新し、`true`を返す。
対象外、訪問済み、成功後の場所を指定した場合は、状態を変更せず`false`を返す。
最後の未訪問地点を指定した場合は、同じ呼び出し内でeventも成功へ遷移する。

### 状態と報酬の照会

- eventとtaskの状態は常に一致する。
- taskが`executing`の場合はeventも実行中とし、taskが`succeeded`へ遷移した同じ操作でeventも成功とする。
- eventはtaskとは別の進行状態や`failed`状態を持たない。
- `isExecuting()`はeventが実行中の場合だけ`true`を返す。
- `isSucceeded()`はeventが成功済みの場合だけ`true`を返す。
- `getRewardPoints()`はコンストラクタで確定した`rewardPoints`を返す。

`MainGameScene`は場所移動の前後で成功状態を判定し、成功へ遷移した呼び出しに対してだけ報酬を適用する。

## snapshot

```js
{
  id,
  type: 'patrol',
  name: '見回り',
  description,
  state: 'executing',
  destinations: [
    {
      id,
      name,
      isVisited,
    },
  ],
  rewardPoints,
}
```

- `state`と`destinations`は`PatrolTask.getSnapshot()`の結果を使用する。
- `description`は`見回り先: 場所名（未訪問）、場所名（訪問済み）`の形式とする。
- description内の場所は`destinations`と同じ順序にする。
- `rewardPoints`は成功前も含めて、発生時に確定した値を公開する。
- eventとtaskの内部オブジェクトを直接公開しない。

## 他オブジェクトとの境界

- [`MainGameScene`](../シーン/MainGameScene.md)がeventを生成し、成立した場所移動を通知する。
- `MainGameScene`が成功を検出し、`getRewardPoints()`の値を[`Character.addMahoPayPoints()`](../../ゲームエンジン/GameObject.md#character)へ渡す。
- rendererはscene snapshotへ格納されたevent snapshotだけを参照する。
- カシオペアによる破棄は`MainGameScene`がeventへの参照を解放することで行う。

## 単体テスト

[PatrolEvent単体テストケース](../../../テスト設計/単体テスト/ドメイン/イベント/PatrolEvent.md)を参照する。

## 依存先

- [PatrolTask（見回りタスク）](PatrolTask.md)
- [MahoPayポイント収支一覧](../../../基本設計/ゲームシステム/MahoPayポイント収支一覧.md)

VitePress用のMahoPay収支データやrendererには依存しない。
