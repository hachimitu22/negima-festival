# AGENTS

## プロジェクト方針
このプロジェクトは、麻帆良祭を題材にしたブラウザゲームのプロトタイプです。
現状のDOM viewは、最終的な絵素材が存在しない段階で素早く挙動を確認するための暫定rendererです。
DOM UIを完成させること自体を主目的にしないでください。

## 描画方針
- ゲームロジックはDOM、Vue、React、canvas APIに依存させないでください。
- `gameState` と `gameController` をゲーム挙動の中心として扱ってください。
- `gameView` と `src/views` 配下のファイルはrenderer/view実装として扱ってください。
- sceneはタイトル、メインゲーム、サブゲームのような大きな実行単位として扱ってください。
- メニュー、マップ、イベント一覧のようなメインゲーム内の切り替え表示はsceneではなくlayerとして扱ってください。
- DOM rendererを後からcanvas rendererへ置き換えられるように、`snapshot -> renderer` の流れを維持してください。
- rendererの公開APIは、将来の `createCanvasGameView()` でも実装できる形を優先してください。

## フレームワーク方針
プロジェクトをDOM UIアプリとして育てる場合は、VueやReactが有効な選択肢になります。
現在のプロトタイプでは、DOMフレームワークの導入よりも、差し替え可能なrenderer境界を保つことを優先してください。

## 実装時の注意
- DOM固有の状態はDOM view層の内部に閉じ込めてください。
- ゲームルール、イベント発生タイミング、layer状態、ループ挙動をDOM要素やUIコンポーネントへ移さないでください。
- sceneの切り替えはロードやゲームモードの大きな切り替えに使い、メインゲーム内の表示切り替えは `activeLayerId` のようなlayer状態で表してください。
- viewの処理を追加する場合は、`mount`、`init`、`render`、`update`、`destroy` のようなライフサイクルを中心に公開契約を保ってください。
