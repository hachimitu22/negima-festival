# EventIdSequence 単体テストケース

## 対象

- 詳細設計: [EventIdSequence（イベントID採番器）](../../../../詳細設計/ドメイン/イベント/EventIdSequence.md)
- 対象: `src/gameDomain/mainGameScene/event/eventIdSequence.js`

caseごとに新しい採番器を生成し、公開APIから観察できる採番結果を検証する。

## EIS-UT-S01 event IDの採番

- 対象: `peek()`、`next()`
- 目的: IDを消費しない参照と、発行による採番の進行を検証する。

### EIS-UT-S01-C01 peekでは次のIDを消費しない

- 前提: 初期値0で採番器を生成する。
- 入力: なし。
- 操作: `peek()`を二回呼ぶ。
- 期待結果: どちらも0を返す。

### EIS-UT-S01-C02 nextではIDを取得して採番を進める

- 前提: 初期値0で採番器を生成する。
- 入力: なし。
- 操作: `next()`を呼んだ後に`peek()`を呼ぶ。
- 期待結果: `next()`は0、続く`peek()`は1を返す。
