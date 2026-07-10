# MainGameScene 単体テスト

## MG-UT-S01 embedded conversation

メインゲーム中の会話を、独立した`ConversationScene`ではなく`MainGameScene`内の会話状態として扱う振る舞いを検証する。

| ケースID | 観点 | 期待結果 |
| --- | --- | --- |
| MG-UT-S01-C01 | actor会話開始 | `pushScene`されず、snapshotの`sceneId`は`SCENE_IDS.MAIN_GAME`のまま`conversation`が設定される。 |
| MG-UT-S01-C02 | 会話中の停止 | 会話中に時間経過とmap入力を渡しても、ゲーム内時間と主人公位置が変わらない。 |
| MG-UT-S01-C03 | 会話完了 | `conversation:*`入力で会話を最後まで進めると、`conversation`が`null`になり、`activeLayerId`がmapへ戻る。 |
