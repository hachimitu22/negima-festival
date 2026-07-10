# CharacterSystem（キャラクター位置・移動System）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/characterSystem.js`
- 関連: [MainGameScene](MainGameScene.md)

## 目的

メインゲーム中の主人公と登場人物の位置、移動、移動更新、位置snapshot fragmentを管理する。
会話開始条件、好感度、人物プロフィール、イベント候補、報酬ルールは扱わない。

## 所有する状態

- `playerCharacter`: 主人公`Character`
- `actors`: NPC、同行者を含む`Actor`配列
- `gridMap`: 経路探索と場所座標解決に使う`GridMap`
- `spatialStateVersion`: 位置変化を検知するためのversion

`CharacterSystem`は既存の`Character`と`Actor`インスタンスを保持して操作する。
初期段階では`Character`と`Actor`のGameObject化は維持し、移動処理の実装も各GameObjectの公開メソッドを使う。

## 公開契約

```js
class CharacterSystem {
  constructor({ playerCharacter, actors, gridMap })
  update(context)
  movePlayerToLocation(locationId, options)
  movePlayerToMapPosition(position, options)
  moveActorToLocation(actorId, locationId)
  setActorMovementMode(actorId, movementMode)
  resetActorNextMoveTime(actorId, currentGameTimeHours)
  resetAllActorNextMoveTimes(currentGameTimeHours)
  findActor(actorId)
  findTalkableActor(actorId)
  getPlayerCharacter()
  getActors()
  getPlayerLocationId()
  consumeVisitedPlayerLocationIds()
  getSpatialSubjects()
  getSpatialStateVersion()
  createSnapshotFragment()
}
```

### update

`Character.update(context)`と各`Actor.update(context)`を呼ぶ。
`context`には`deltaTimeMs`、`elapsedGameHours`、`gridMap`、`gameTimeHours`を含める。
更新によって主人公またはactorの位置・場所が変わった場合、`spatialStateVersion`を進める。

### movePlayerToLocation / movePlayerToMapPosition

`gridMap`で経路を作り、主人公の`startMovement()`を呼ぶ。
`options.companionActorId`がある場合は、同じ目的地へ同行者の移動も開始する。
目的地が不正、または経路が作れない場合は`false`を返す。

### moveActorToLocation

actor IDと場所IDを解決し、対象actorの`moveToLocation()`を呼ぶ。
成功時は`spatialStateVersion`を進める。

### findTalkableActor

指定actorが主人公と同じ現在地にいる場合だけactorを返す。
会話禁止条件やイベント固有のブロック判定は`MainGameScene`側に残す。

### getSpatialSubjects

LocationSystem導入に備え、位置を持つ対象の読み取りモデルを返す。

```js
[
  {
    subjectType: "character",
    subjectId: "player",
    locationId,
    position: { x, y },
  },
  {
    subjectType: "actor",
    subjectId,
    locationId,
    position: { x, y },
  },
]
```

戻り値は読み取り用のplain objectとし、呼び出し側がGameObject内部状態を書き換えられない形にする。

### createSnapshotFragment

Scene snapshotへ集約するため、次のfragmentを返す。

```js
{
  character,
  actors,
}
```

`character`は`Character.getSnapshot()`、`actors`は各actorの`getSnapshot()`結果を使用する。

## MainGameSceneとの境界

`MainGameScene`は主人公、actor、gridMapを生成し、`CharacterSystem`へ渡す。
以後、位置検索、移動開始、移動更新、位置snapshot集約は`CharacterSystem`へ委譲する。

当面、次の責務は`MainGameScene`に残す。

- 会話開始条件のうち、イベント固有のブロック判定
- 配達・同行イベント候補生成
- 好感度変更
- MahoPay報酬やカシオペア消費MP
- 見回り・分岐managerへの場所訪問通知

これらは後続の`PlayerControlSystem`、`EventSystem`、`LocationSystem`、`RewardSystem`切り出し時に再配置する。
