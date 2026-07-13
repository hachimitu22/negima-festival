# TitleScene（タイトルシーン）

## 文書情報

- 設計状態: 草案
- 対応する基本仕様: [タイトルシーン](../../../基本設計/シーン/タイトルシーン.md)

## 目的

ゲーム起動直後の入力を受け付け、プロローグ閲覧、新規開始、セーブデータからの再開、オプション表示の選択を処理する。
タイトル表示の演出、プロローグ本文、オプション内容、セーブデータ形式は、この草案の対象外とする。

## 予定する識別子

```js
SCENE_IDS.TITLE = 'title'
TITLE_MENU_ITEM_IDS.PROLOGUE = 'prologue'
TITLE_MENU_ITEM_IDS.NEW_GAME = 'new-game'
TITLE_MENU_ITEM_IDS.CONTINUE = 'continue'
TITLE_MENU_ITEM_IDS.OPTIONS = 'options'
TARGET_PREFIXES.TITLE_MENU_ITEM = 'title-menu-item'
```

メニュー選択は次のinputとして受け取る。

```js
{
  type: INPUT_TYPES.TARGET_ACTIVATE,
  targetId: `${TARGET_PREFIXES.TITLE_MENU_ITEM}:${TITLE_MENU_ITEM_IDS.NEW_GAME}`,
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

1. `context.inputs`からタイトルメニュー項目の選択inputを探す。
2. 最初の有効な選択inputだけを処理する。
3. `NEW_GAME`の場合は`new MainGameScene()`を生成し、`sceneControl.replaceScene(mainGameScene)`を呼び出す。
4. `PROLOGUE`の場合はプロローグ表示へ進む。
5. `CONTINUE`の場合は、セーブデータがある場合だけ再開処理へ進む。
6. `OPTIONS`の場合はオプション表示へ進む。
7. 同じcontextの残りのinputを処理せず終了する。

タイトルメニュー項目以外のinputは無視する。
セーブデータがない状態で`CONTINUE`を選択しても、状態を変更しない。
複数の選択inputが含まれていても、処理する項目は1件だけとする。

プロローグ終了時はタイトルへ戻る。
プロローグを別sceneにするか、`TitleScene`内の表示状態にするかは未決定とする。

### `createSnapshot()`

```js
{
  sceneId: SCENE_IDS.TITLE,
  menu: {
    items: [
      { id: TITLE_MENU_ITEM_IDS.PROLOGUE, enabled: true },
      { id: TITLE_MENU_ITEM_IDS.NEW_GAME, enabled: true },
      { id: TITLE_MENU_ITEM_IDS.CONTINUE, enabled: hasSaveData },
      { id: TITLE_MENU_ITEM_IDS.OPTIONS, enabled: true },
    ],
  },
}
```

`hasSaveData`は、セーブデータが存在する場合に`true`とする。
セーブデータがない場合も`CONTINUE`はsnapshotに含め、renderer側で無効表示にする。

## 生成と起動

entry pointは`MainGameScene`ではなく`TitleScene`を初期シーンとして`GameEngine`へ渡す。

```js
const engine = new GameEngine({
  initialScene: new TitleScene(),
  view,
});
```

rendererには`SCENE_IDS.TITLE`に対応するtitle scene viewと、タイトルメニュー項目の選択inputをenqueueする操作が必要となる。
renderer側の具体的な表示設計は別途定める。

## シーン差し替え

はじめからで新しいメインゲームへ進む場合は、開始済みのタイトル状態を残さないため、`pushScene()`ではなく予定契約の`replaceScene()`を使用する。
差し替えの共通仕様は[SceneContract](../../ゲームエンジン/SceneContract.md)を参照する。

## 未決事項

- タイトルロゴ以外に表示する情報。
- プロローグを別sceneにするか、タイトルシーン内の表示状態にするか。
- つづきからで再開するセーブデータの内容。
- オプションの内容。
- 終了操作を追加するか。
- メインゲーム終了後にタイトルへ戻る方法。
- title scene viewの公開契約と表示仕様。
