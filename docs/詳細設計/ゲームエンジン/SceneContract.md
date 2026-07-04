# SceneContract（ゲームシーン契約）

## 文書情報

- 設計状態: 確定
- 実装状況: 一部実装
- 未実装部分: `replaceScene(scene)`

## 目的

ゲームエンジンが更新する大きな実行単位と、その遷移方法を定義する。
ゲームエンジンはシーンの構造的契約だけを参照し、ゲーム固有のシーン型には依存しない。

## シーン契約

```js
{
  update({ context, sceneControl }),
  createSnapshot(),
}
```

### `update({ context, sceneControl })`

- `context`からframe情報とinputを受け取る。
- シーン固有の入力処理と状態更新を行う。
- 必要な場合は`sceneControl`で遷移する。
- 遷移が成立した場合は、それ以降のinputと状態更新を処理せず終了する。

### `createSnapshot()`

- シーンが所有する状態をrenderer向けのplain objectとして返す。
- viewが描画対象を選べるよう、必ず`sceneId`を含める。
- snapshotからシーン状態を変更できる参照を公開しない。

## scene control

```js
{
  pushScene(scene),
  popScene(),
  replaceScene(scene),
}
```

`sceneControl`だけをシーンへ渡し、`GameEngine`本体とscene stackは公開しない。
ゲームシステムやGameObjectのupdate contextには含めない。

| 操作 | 結果 | 戻り値 | 実装状況 |
| --- | --- | --- | --- |
| `pushScene(scene)` | 最上位へ追加してcurrent sceneにする | 追加したscene | 実装済み |
| `popScene()` | 最上位を除き、直下へ戻る | 除いたscene。初期sceneだけなら`null` | 実装済み |
| `replaceScene(scene)` | 最上位を新しいsceneへ置き換える | 置き換えられたscene | 未実装 |

`pushScene()`と`replaceScene()`はsceneがない場合に`TypeError`とする。

## scene stack

- `GameEngine`がscene stackとcurrent sceneを所有する。
- current sceneは常にstackの最上位と一致させる。
- 更新とsnapshot取得の対象はcurrent sceneだけとする。
- 下位シーンはインスタンスと状態を保持するが、更新しない。
- `popScene()`後は直下に保持されていた同じインスタンスへ戻る。
- 初期シーンは`popScene()`で除去できない。

## シーン差し替え

`replaceScene(scene)`はタイトルから新しいメインゲームを開始するための予定契約である。

1. 引数を検証する。
2. stack最上位のsceneを取り出す。
3. 同じ位置へ新しいsceneを格納する。
4. current sceneを新しいsceneへ変更する。
5. 取り出したsceneを返す。

stackの要素数は変更しない。
初期シーンも差し替え可能とする。
差し替えが成立したframeでは、差し替え元の残りのinputと更新を処理せず、差し替え後のsnapshotを描画する。

タイトルシーンを差し替えるため、メインゲーム終了時にstack操作だけで以前のタイトルへ戻ることはできない。
タイトルへ戻る場合は、新しいタイトルシーンへの差し替えとして別途設計する。

## 遷移入力の優先

同じcontextに複数のinputがある場合、シーンは遷移が成立するinputを通常inputより先に探す。

- 成立する遷移入力が複数ある場合は、queue順で最初の1件だけを処理する。
- 遷移成立後は他のinputを処理しない。
- 遷移元シーンの時間更新、イベント進行、GameObject更新を行わない。
- 同じframeでは遷移後のcurrent sceneを描画する。

## lifecycle

scene固有の`pause`、`resume`、`destroy`は共通契約に含めない。
一時的なシーンは`pushScene()`し、終了時に`popScene()`する。
完全に別の実行単位へ移る場合は`replaceScene()`する。

scene viewの生成と破棄はrendererが`sceneId`の変化を見て行う。
ドメインシーンはview lifecycleを操作しない。

## 現在と予定のシーン

| scene | 遷移方法 | 実装状況 |
| --- | --- | --- |
| `TitleScene` | ゲーム開始時に`MainGameScene`へreplace | 未実装 |
| `MainGameScene` | 会話開始時に`ConversationScene`をpush | 実装済み |
| `ConversationScene` | 会話完了時に自身をpop | 実装済み |

個別の責務は[ドメインのシーン設計](../ドメイン/シーン/README.md)を参照する。
