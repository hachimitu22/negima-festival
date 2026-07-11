# TimeControlSystem（時間制御System）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/timeControlSystem.js`
- 関連: [MainGameScene](MainGameScene.md)、[PlayerControlSystem](PlayerControlSystem.md)

## 目的

メインゲーム中のゲーム時間、フェス終了状態、ループ回数、カシオペアによる時間遡行を管理する。

`TimeControlSystem`は次を担当する。

- frame経過時間からゲーム時間を進める
- ゲーム時間を祭終了時刻で止め、終了状態を更新する
- カシオペア使用時にMPを消費し、ゲーム時間を戻し、ループ回数を増やす
- 時間とループのsnapshot fragmentを生成する
- 他System更新用の時間context fragmentを生成する

会話中に時間を止めるかどうかの判定、巻き戻し時のイベント破棄、actor次回自動移動時刻の再設定は扱わない。

## 所有する状態

| 状態 | 内容 |
| --- | --- |
| `gameTime` | 現在時間、終了時間、時間倍率、終了状態 |
| `loop` | 周回数、遡行時間、カシオペア消費MP |
| `character` | カシオペア消費MPを反映する主人公Character |

## 公開契約

```js
class TimeControlSystem {
  constructor({
    character,
    durationHours,
    hoursPerRealSecond,
    timeTravelHours,
    cassiopeiaMagicPowerCost,
  })

  advance(frame)
  useCassiopeia()
  getCurrentHours()
  getDurationHours()
  isFestivalEnded()
  createSnapshotFragment()
  createUpdateContextFragment(frame)
}
```

### advance

`frame.deltaTimeMs`、または互換用の`frame.deltaTime`から実時間の経過ミリ秒を取得する。
`elapsedHours = deltaTimeMs / 1000 * hoursPerRealSecond`でゲーム時間を進める。
ゲーム時間は`durationHours`を超えない。

フェス終了済みの場合は時間を進めず、`elapsedGameHours: 0`を返す。

戻り値は次の形とする。

```js
{
  currentHours,
  elapsedGameHours,
  isEnded,
}
```

### useCassiopeia

主人公の現在MPが`cassiopeiaMagicPowerCost`未満の場合は`false`を返し、状態を変更しない。

使用可能な場合は次を行う。

1. 主人公MPから`cassiopeiaMagicPowerCost`を引く。
2. 現在ゲーム時間を`timeTravelHours`だけ戻す。ただし0未満にはしない。
3. フェス終了状態を解除する。
4. ループ回数を1増やす。

成功時は次の形を返す。

```js
{
  currentHours,
}
```

巻き戻し成功後の`DialogueSystem.dispose()`、`EventSystem.rewindTo(currentHours)`、`CharacterSystem.resetAllActorNextMoveTimes(currentHours)`は呼び出し元が担当する。

### createSnapshotFragment

Scene snapshotへ集約するため、次のfragmentを返す。

```js
{
  gameTime: {
    currentHours,
    durationHours,
    isEnded,
  },
  loop: {
    count,
    timeTravelHours,
    cassiopeiaMagicPowerCost,
  },
}
```

### createUpdateContextFragment

`CharacterSystem`などの更新へ渡すframe由来の時間情報を作る。

```js
{
  deltaTimeMs,
  frameCount,
  targetFrameTimeMs,
  deltaFrames,
  gameTimeHours,
  isFestivalEnded,
}
```

`frame.frameCount`がない場合は互換用に`frame.count`を使う。

## MainGameSceneとの境界

`MainGameScene`は`TimeControlSystem.advance(frame)`でゲーム時間を進め、戻り値の`elapsedGameHours`を`CharacterSystem.update()`へ渡す。
更新後の現在時間は`EventSystem.advanceTo(currentHours)`へ通知する。

`PlayerControlSystem`からのカシオペアrequestは`MainGameScene`のadapterを通して`TimeControlSystem.useCassiopeia()`へ接続する。
成功時だけ`MainGameScene`がactor次回移動時刻再設定とイベント巻き戻しを呼ぶ。

## snapshot

`TimeControlSystem`は`gameTime`と`loop`だけをsnapshot fragmentとして公開する。
主人公MPは`Character` snapshot、イベント破棄結果は`EventSystem` snapshotへ反映される。
