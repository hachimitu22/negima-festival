# EventIdSequence（イベントID採番器）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/event/eventIdSequence.js`

## 目的

配達、同行、見回りで共有するevent IDを一意な連番として発行する。
会話候補の生成時はIDを消費せず参照し、候補が選出された場合だけ採番を進められるようにする。

## 所有する状態

- `nextId`: 次に発行する非負整数のevent ID

初期値は0とする。

## 公開契約

```js
class EventIdSequence {
  constructor()
  peek()
  next()
}
```

### peek

`nextId`を変更せず、次に発行するIDを返す。
同じ状態で複数回呼び出した場合は同じIDを返す。

### next

現在の`nextId`を返し、次回のIDを1増加させる。

## 利用境界

- `MainGameScene`は配達と同行の会話候補へ`peek()`のIDを設定し、候補が選出された場合だけ`next()`を呼ぶ。
- [`PatrolEventManager`](PatrolEventManager.md)は見回りを生成する場合に`next()`で取得したIDを使用する。
- 同じ`EventIdSequence`インスタンスを両者で共有し、同時に表示されるeventのIDを一意にする。

## 単体テスト

[EventIdSequence単体テストケース](../../../テスト設計/単体テスト/ドメイン/イベント/EventIdSequence.md)を参照する。
