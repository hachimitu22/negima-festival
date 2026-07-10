# PlayerControlSystem（プレイヤー操作System）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/playerControlSystem.js`
- 関連: [MainGameScene](MainGameScene.md)

## 目的

メインゲーム中の通常入力を解釈し、担当SystemまたはScene内の暫定request APIへ操作要求を渡す。
Sceneから入力targetの意味解釈を切り離す。

## 所有する状態

初期実装では、永続的なゲーム状態を持たない。
constructorで受け取ったrequest API参照だけを保持する。

## 公開契約

```js
class PlayerControlSystem {
  constructor({
    characterRequests,
    branchRequests,
    cassiopeiaRequests,
  })

  update(inputSnapshot, controlContext)
}
```

### controlContext

`update()`は、`controlContext.gameplayInputEnabled`が`false`の場合、通常入力をrequestへ変換しない。

```js
{
  gameplayInputEnabled: true,
}
```

会話中、巻き戻し中、Scene遷移中などの入力禁止判断は、呼び出し元がcontrol contextへ反映する。
`PlayerControlSystem`自身は会話状態やScene遷移状態を直接参照しない。

### 入力変換

初期実装では`INPUT_TYPES.TARGET_ACTIVATE`だけを対象にする。

| target | request |
| --- | --- |
| `map-position:<x>,<y>` | `characterRequests.movePlayerToMapPosition({ x, y })` |
| `location:<locationId>` | `characterRequests.movePlayerToLocation(locationId)` |
| `branch-choice:<choiceId>` | `branchRequests.chooseCurrentTask(choiceId)` |
| `cassiopeia` | `cassiopeiaRequests.requestUseCassiopeia()` |
| `actor:<actorId>` | 通常入力としては処理しない |
| `conversation:<action>` | 通常入力としては処理しない |

actor入力は、現段階では`MainGameScene`の会話開始処理が先に扱う。
将来`InteractionSystem`を導入する場合、actorやWorldObjectの通常インタラクションは`PlayerControlSystem`から`InteractionSystem`へのrequestに置き換える。

### 戻り値

`update()`は処理した通常入力数を返す。

```js
{
  handledCount: 1,
}
```

この戻り値はデバッグとテスト用であり、ゲームルール判断の正本にしない。

## MainGameSceneとの境界

`MainGameScene`は`PlayerControlSystem`を生成し、通常入力処理フェーズで`update()`を呼ぶ。
`MainGameScene`はtarget prefixを直接解釈しない。

初期段階では、移動は`CharacterSystem`へ、分岐選択は`BranchEventManager`へ、カシオペア使用は`MainGameScene`内の暫定adapterへ渡す。
カシオペア巻き戻し、Event開始、Interaction成立判定は今回の責務に含めない。
