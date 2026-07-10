# EventSystem 単体テストケース

## 対象

- 詳細設計: [EventSystem（イベントSystem）](../../../../詳細設計/ドメイン/イベント/EventSystem.md)
- 実装: `src/gameDomain/mainGameScene/event/eventSystem.js`

caseごとに実物の`Character`と小さな協力オブジェクトを新しく生成する。
会話開始adapterは、開始要求を記録し、テスト側で完了callbackを呼び出せるようにする。

## ES-UT-S01 event progression

### ES-UT-S01-C01 初期イベントsnapshotを集約する

- 前提: `Character`を持つ`EventSystem`を生成する。
- 入力: なし。
- 操作: `createSnapshotFragment()`を呼ぶ。
- 期待結果: `executingEvents`に見回りと分岐イベントのsnapshotが含まれ、`companion`は`null`。

### ES-UT-S01-C02 場所訪問を見回りと分岐managerへ通知する

- 前提: 初期見回りsnapshotの全目的地を確認する。
- 入力: 見回り目的地ID配列。
- 操作: `visitLocations(locationIds)`を呼ぶ。
- 期待結果: 見回り成功報酬が`Character`のMahoPayポイントへ反映される。

### ES-UT-S01-C03 巻き戻しで継続イベントを破棄する

- 前提: 配達または同行イベントを実行中にする。
- 入力: 巻き戻し後のゲーム時刻。
- 操作: `rewindTo(currentHours)`を呼ぶ。
- 期待結果: 配達または同行snapshotが消え、同行中なら同伴者制御解除requestが発行される。

## ES-UT-S02 actor conversation routing

### ES-UT-S02-C01 配達依頼scriptが選ばれたら配達イベントを実行中にする

- 前提: 会話script生成を配達依頼scriptへ固定した`EventSystem`を作る。
- 入力: sender actor。
- 操作: `requestActorConversation(actor, { currentLocationId })`を呼び、会話完了callbackを呼ぶ。
- 期待結果: `executingEvents`に実行中の配達snapshotが含まれる。

### ES-UT-S02-C02 実行中配達の完了会話で報酬requestを発行してイベントを破棄する

- 前提: 配達イベントを実行中にする。
- 入力: recipient actor。
- 操作: `requestActorConversation(actor, { currentLocationId })`を呼び、会話完了callbackを呼ぶ。
- 期待結果: senderとrecipientへ好感度報酬requestが発行され、配達snapshotが消える。

### ES-UT-S02-C03 同行依頼scriptが選ばれたら同行者を外部制御にする

- 前提: 会話script生成を同行依頼scriptへ固定した`EventSystem`を作る。
- 入力: companion actor。
- 操作: `requestActorConversation(actor, { currentLocationId })`を呼び、会話完了callbackを呼ぶ。
- 期待結果: 同行snapshotと同伴者IDが公開され、同伴者を`external`へ変更するrequestが発行される。

### ES-UT-S02-C04 同行中の目的地外会話をブロックする

- 前提: 同行イベントを実行中にする。
- 入力: 同伴者actorと目的地ではない現在地。
- 操作: `requestActorConversation(actor, { currentLocationId })`を呼ぶ。
- 期待結果: 会話開始adapterは呼ばれず、戻り値は`false`。
