# CanonicalFestivalPrototypeScene チュートリアルスキップ 単体テスト

## CFP-UT-S15 チュートリアルスキップ

| Case ID | 前提・操作 | 期待結果 |
| --- | --- | --- |
| CFP-UT-S15-C01 | `prologue`で`canonical.tutorial.skip`を入力する | `location-actions`へ進み、1日目2ループ目AM10:10、MP70、入場門、チャオ探索メインになる |
| CFP-UT-S15-C02 | `eva-escape`で`canonical.tutorial.skip`を入力する | `prologue`からのスキップと同じ状態へ進む |
| CFP-UT-S15-C03 | チュートリアル終了後に`canonical.tutorial.skip`を入力する | 状態を変更しない |
