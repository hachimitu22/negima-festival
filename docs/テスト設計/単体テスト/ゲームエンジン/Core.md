# Core（ゲームエンジン・コア）単体テスト

## 方針

`GameEngine`の更新順序、入力queue、view描画契約を公開APIから検証する。
sceneとviewは小さなdoubleを使い、ゲームドメインの具体仕様には依存しない。

## GE-UT-S01 更新方式

| Case ID | 前提・操作 | 期待結果 |
| --- | --- | --- |
| GE-UT-S01-C01 | `start()`後に`step()`を呼ぶ | 入力なし、時間経過なしでsceneを1回更新し、更新後snapshotを描画する |
| GE-UT-S01-C02 | `step(input)`を呼ぶ | 指定inputをsceneへ渡し、更新後snapshotを描画する |
| GE-UT-S01-C03 | viewが`enqueueInput()`後に`requestRenderStep()`を呼ぶ | queue済みinputを処理して描画する |
| GE-UT-S01-C04 | `update(now)`を2回呼ぶ | 従来どおり経過時間を計算して更新と描画を行う |
| GE-UT-S01-C05 | Canonical entry pointを確認する | 常時`requestAnimationFrame` loopを開始しない |
