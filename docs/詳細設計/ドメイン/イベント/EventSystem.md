# EventSystem（イベントSystem）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/event/eventSystem.js`
- 対応する基本仕様: [イベント](../../../基本設計/イベント/README.md)

## 目的

メインゲーム中の継続イベントを管理し、`MainGameScene`からイベント固有の状態保持、会話候補生成、イベント進行、snapshot集約を切り出す。

`EventSystem`は次を担当する。

- `PatrolEventManager`と`BranchEventManager`の生成、更新、巻き戻し
- 配達または同行イベントを1件まで保持する
- actor会話時にイベント会話を優先し、必要なら通常会話へフォールバックする
- イベント完了時の報酬requestと同行者制御requestを発行する
- 実行中イベントと同行者のsnapshot fragmentを生成する

通常会話のsession進行は`DialogueSystem`が担当する。
actorの探索、位置・移動更新、報酬反映の実処理は`MainGameScene`側のadapterが担当する。

## 公開契約

```js
class EventSystem {
  constructor({
    character,
    durationHours,
    actorsProvider,
    conversationRequests,
    rewardRequests,
    companionRequests,
  })

  requestActorConversation(actor, { currentLocationId })
  advanceTo(currentHours)
  visitLocations(locationIds)
  chooseCurrentTask(choiceId)
  rewindTo(currentHours)
  getActiveCompanionActorId()
  isActorInteractionBlocked(actorId, currentLocationId)
  createSnapshotFragment()
}
```

## 更新と入力

`MainGameScene`はactor入力から会話対象actorを決定した後、`requestActorConversation(actor, { currentLocationId })`を呼ぶ。

- 実行中の配達または同行がある場合、eventへactor IDと現在地を渡してinteractionを問い合わせる。
- interactionがあればイベント会話を`conversationRequests.start()`へ渡す。
- 同行中で目的地外の同行者会話が禁止される場合は`false`を返す。
- イベント会話がない場合は通常会話を生成し、完了時に`rewardRequests.applyConversationResult(actorId, result)`を呼ぶ。
- 実行中の配達または同行がない場合、通常会話に配達依頼と同行依頼の候補scriptを追加し、選ばれたscriptに応じて通常会話またはイベント会話を開始する。

`advanceTo(currentHours)`は見回りと分岐managerへゲーム時刻を通知する。
`visitLocations(locationIds)`は重複を除いた場所IDを見回りと分岐managerへ通知する。
`chooseCurrentTask(choiceId)`は分岐managerへ選択肢を渡す。
`rewindTo(currentHours)`は配達または同行を破棄し、見回りと分岐managerを巻き戻す。

## adapter

`EventSystem`は`DialogueSystem`、`CharacterSystem`、好感度計算へ直接依存しない。
副作用は次のadapterへ依頼する。

```js
conversationRequests.start({ script, onComplete })

rewardRequests.applyConversationResult(actorId, conversationResult)
rewardRequests.applyAffection(actorId, amount)
rewardRequests.addMahoPayPoints(points)

companionRequests.setActorMovementMode(actorId, movementMode)
companionRequests.resetActorNextMoveTime(actorId)
```

`conversationRequests.start()`は会話開始に成功した場合だけ`true`を返す。

## snapshot

```js
{
  companion,
  executingEvents,
}
```

- `companion`は同行中だけ同伴者snapshot、それ以外は`null`。
- `executingEvents`は見回り、分岐、配達または同行の順に格納する。
- 内部eventオブジェクトはsnapshotへ直接公開しない。

## MainGameSceneとの境界

`MainGameScene`は`EventSystem`を生成し、次を委譲する。

- actor会話開始時のイベント会話判定
- 分岐選択request
- 時間経過と場所訪問のイベント進行
- カシオペア遡行時のイベント破棄
- 同行者ID、同行者snapshot、実行中イベントsnapshotの取得

`MainGameScene`は引き続きactor入力の抽出、talkable actor検索、ゲーム時間、カシオペアMP消費、報酬requestの`RewardSystem`接続を担当する。
