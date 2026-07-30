# CanonicalFestivalPrototypeScene チュートリアルスキップ

## 入力

`canonical.tutorial.skip`を追加する。

この入力はチュートリアル中だけ受け付ける。
対象フェーズは`prologue`から`eva-escape`までとする。
それ以外のフェーズでは状態を変更しない。

## スキップ後状態

スキップ後は通常のエヴァ逃走完了後と同じ入口へ合流する。

- `phaseId`: `location-actions`
- `gameTime`: 1日目2ループ目AM10:10
- `phoneTime`: `20:06`
- `magicPower`: 70
- 現在地: `entrance-gate`
- チャオ探索: 開始済み
- メインイベント: `chao-search`
- 刹那: 同行解除、待機状態

チャオの正解場所は通常のチャオ探索開始と同じくランダムに決める。
正解場所IDはsnapshotへ公開しない。

## Snapshot

`tutorial`を追加する。

- `canSkip`: チュートリアル中なら`true`
- `isSkipped`: チュートリアルスキップを実行済みなら`true`

DOM rendererは`canSkip`が`true`の間だけ、チュートリアルスキップボタンを表示する。
