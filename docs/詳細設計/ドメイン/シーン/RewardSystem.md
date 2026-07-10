# RewardSystem（報酬System）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/rewardSystem.js`
- 関連: [MainGameScene](MainGameScene.md)、[EventSystem](../イベント/EventSystem.md)

## 目的

会話やイベントの結果として発生する報酬を、対象のゲーム状態へ反映する。
初期実装では生徒の好感度と主人公のMahoPayポイントを扱う。

`RewardSystem`は次を担当する。

- 通常会話結果から生徒の基礎好感度変化量を取得し、最終好感度変化量を反映する
- イベント成功報酬として指定された基礎好感度変化量を生徒へ反映する
- MahoPayポイントを主人公へ加算する

報酬の発生条件、イベント状態、会話scriptの選出は扱わない。

## 公開契約

```js
class RewardSystem {
  constructor({ character, actorsProvider })

  applyConversationResult(actorId, conversationResult)
  applyAffection(actorId, baseChange)
  addMahoPayPoints(points)
}
```

### applyConversationResult

actor IDから対象actorを取得する。
対象が`Student`の場合だけ、`Student.getBaseConversationSceneAffectionChange(conversationResult)`で基礎変化量を取得し、`applyAffection(actorId, baseChange)`へ渡す。
対象が生徒でない場合は`false`を返す。

### applyAffection

actor IDから対象actorを取得する。
対象が`Student`の場合だけ、`calculateAffectionChange({ baseChange })`で最終変化量を計算し、`Student.changeAffection(amount)`を呼ぶ。
対象が生徒でない場合は`false`を返す。

### addMahoPayPoints

`Character.addMahoPayPoints(points)`を呼び、MahoPay残高へ反映する。
ポイントの妥当性は`Character`側の公開契約に従う。

## 他Systemとの接続

`EventSystem`は通常会話完了、配達成功、同行成功に応じて`rewardRequests`を呼び出す。
`MainGameScene`は`rewardRequests`を`RewardSystem`へ接続する。

`PatrolEventManager`は見回り成功時に`PatrolEvent.claimRewardPoints()`で取得したMahoPayポイントを`rewardRequests.addMahoPayPoints(points)`へ渡す。
`EventSystem`配下で使う場合、このrequestは`RewardSystem.addMahoPayPoints(points)`へ接続される。

## snapshot

`RewardSystem`自身はsnapshot fragmentを持たない。
好感度はactor snapshot、MahoPay残高はcharacter snapshotに反映される。
