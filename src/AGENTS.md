# AGENTS

## アーキテクチャ方針

- 詳細な設計契約は `docs/詳細設計` を正本とし、公開契約や責務を変更した場合は対応する設計文書も更新してください。
- `src/gameEngine` は実行順序、frame、input queue、scene control、view lifecycleを担当します。
- `src/gameDomain` はscene、ゲームルール、イベント、入力contractを担当します。
- `src/views` はrendererと入力変換を担当します。
- ゲームロジックはDOM、Vue、React、canvas APIに依存させないでください。
- ゲーム状態からsnapshotを作り、rendererがsnapshotを描画する依存方向を維持してください。viewからsceneやGameObjectを直接参照しないでください。
- DOM固有の状態はDOM view内に閉じ込め、ゲームルール、イベント発生タイミング、layer状態、ループ挙動を移さないでください。
- sceneはタイトル、メインゲーム、会話のような大きな実行単位とし、メインゲーム内の表示切り替えは `activeLayerId` のようなlayer状態で表してください。
- `GameEngine` に接続するrendererの公開APIは `configure`、`init`、`render`、`destroy` を基本とし、将来のcanvas rendererでも実装できる契約を維持してください。
- renderer内部のscene viewでは必要に応じて `mount`、`init`、`update`、`destroy` を使い、`GameEngine` 向けrendererの公開APIと混同しないでください。
- すべてのクラスとメソッドには、役割、主要な引数、戻り値を示すJSDoc形式のコメントを追加してください。

## View変更後の検証

- `src/views` 配下のJavaScriptを変更した場合は、原則として `npm run check:view` を一度だけ実行してください。
- `npm run check:view` はviewモジュールの構文とimport参照を確認するもので、DOMの実行結果やCSSの見た目は保証しません。
- ヘッドレス確認は行わないでください。
- ブラウザは自動起動せず、表示は原則として手動確認にしてください。
- CSS、レイアウト、実操作の確認が必要な場合は、未確認であることと必要な手動確認項目だけを簡潔に報告してください。
- 成功時のコマンド出力やDOM全文を回答へ転載しないでください。
- 検証結果は「静的チェック: 成功/失敗」「ブラウザ表示: 未確認/確認済み」の形式で短く報告してください。
