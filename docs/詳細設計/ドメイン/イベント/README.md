# ドメインのイベント

ゲーム固有のイベントとタスクについて、所有する状態、公開契約、状態遷移、snapshot、sceneとの境界を定める。
イベントの開始条件、成功条件、報酬などのゲームルールは[基本設計のイベント仕様](../../../基本設計/イベント/README.md)を正本とする。

## 設計一覧

- [EventIdSequence（イベントID採番器）](EventIdSequence.md)
- [PatrolEvent（見回りイベント）](PatrolEvent.md)
- [PatrolEventManager（見回りイベント管理）](PatrolEventManager.md)
- [PatrolTask（見回りタスク）](PatrolTask.md)

## 責務の境界

- eventはtaskとイベント固有情報をまとめ、sceneへ状態照会とsnapshotを提供する。
- taskは達成すべき目的と状態遷移を管理する。
- sceneはイベント管理を呼び出す時刻や入力との接続を担当する。
- 見回りでは`PatrolEventManager`が生成時期、報酬の適用、実行中イベントの保持と破棄を担当する。
- eventとtaskは時間経過による自己更新を行わず、`GameObject`を継承しない。
