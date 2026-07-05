# TitleScene（タイトルシーン）

## 文書情報

- 設計状態: 草案
- 対応する基本仕様: [タイトルシーン](../../../基本設計/シーン/タイトルシーン.md)

## 目的

ゲーム起動直後の入力を受け付け、新しい`MainGameScene`を開始する。
タイトル表示の演出や設定機能は、この草案の対象外とする。

## 予定する識別子

```js
SCENE_IDS.TITLE = 'title'
TARGET_PREFIXES.GAME_START = 'game-start'
```

開始操作は次のinputとして受け取る。

```js
{
  type: INPUT_TYPES.TARGET_ACTIVATE,
  targetId: TARGET_PREFIXES.GAME_START,
}
```

## 公開契約

```js
class TitleScene {
  update({ context, sceneControl })
  createSnapshot()
}
```

### `update({ context, sceneControl })`

1. `context.inputs`からゲーム開始inputを探す。
2. 最初の1件が見つかった場合に`new MainGameScene()`を生成する。
3. `sceneControl.replaceScene(mainGameScene)`を呼び出す。
4. 同じcontextの残りのinputを処理せず終了する。

ゲーム開始以外のinputは無視する。
複数のゲーム開始inputが含まれていても、`MainGameScene`は1件だけ生成する。

### `createSnapshot()`

```js
{
  sceneId: SCENE_IDS.TITLE,
}
```

タイトルシーンは進行状態を持たないため、初期草案では`sceneId`以外を公開しない。

## 生成と起動

entry pointは`MainGameScene`ではなく`TitleScene`を初期シーンとして`GameEngine`へ渡す。

```js
const engine = new GameEngine({
  initialScene: new TitleScene(),
  view,
});
```

rendererには`SCENE_IDS.TITLE`に対応するtitle scene viewと、ゲーム開始inputをenqueueする操作が必要となる。
renderer側の具体的な表示設計は別途定める。

## シーン差し替え

開始済みのタイトル状態を残さないため、`pushScene()`ではなく予定契約の`replaceScene()`を使用する。
差し替えの共通仕様は[SceneContract](../../ゲームエンジン/SceneContract.md)を参照する。

## 未決事項

- タイトルロゴ以外に表示する情報。
- 設定、ロード、終了など、ゲーム開始以外の操作。
- メインゲーム終了後にタイトルへ戻る方法。
- title scene viewの公開契約と表示仕様。
