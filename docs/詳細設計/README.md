# 詳細設計

この分類は、ゲーム仕様をどのような責務と公開契約で実現するかを記述する。
ゲーム内のルールは[基本設計](../基本設計/README.md)を正本とし、詳細設計側では重複して定義しない。

## アーキテクチャ方針

- ゲームロジックはDOM、Vue、React、canvas APIに依存させない。
- ゲーム状態からsnapshotを作り、rendererがsnapshotを描画する。
- sceneは大きな実行単位、layerはメインゲーム内の表示切り替え単位とする。
- DOM固有状態はDOM view内に閉じ込める。
- ゲーム内概念の共通分類から、実装上の継承関係を自動的に導かない。

## ファイル命名規約

- 特定のクラスを説明する文書は、クラス名と同じPascalCaseのファイル名にする。
- JavaScript上に実在する型がない構造的契約は、`SceneContract.md`のように役割と`Contract`を組み合わせる。
- クラスを持たないモジュールを説明する文書は、対象モジュール名に合わせる。
- H1見出しは`MainGameScene（メインゲームシーン）`のように識別子と日本語名を併記する。
- ディレクトリ、`README.md`、クラス図などの横断資料は日本語名を許可する。
- 予定名称を先行使用する場合は、現在の実装クラスとソースパスを文書情報へ記載する。

## ゲームエンジン

- [Core（ゲームエンジン・コア）](ゲームエンジン/Core.md)
- [FrameUpdate（フレーム更新契約）](ゲームエンジン/FrameUpdate.md)
- [GameObject（ゲームオブジェクト）](ゲームエンジン/GameObject.md)
- [Request（System要求契約）](ゲームエンジン/Request.md)
- [SceneContract（ゲームシーン契約）](ゲームエンジン/SceneContract.md)

ゲームエンジンはゲーム固有のルールを持たず、実行順序と共通契約を定める。

## ドメイン

### シーン

- [シーン索引](ドメイン/シーン/README.md)
- [CharacterSystem（キャラクター位置・移動System）](ドメイン/シーン/CharacterSystem.md)
- [GameFlowSystem（ゲームフローSystem）](ドメイン/シーン/GameFlowSystem.md)
- [LocationSystem（場所System）](ドメイン/シーン/LocationSystem.md)
- [PlayerControlSystem（プレイヤー操作System）](ドメイン/シーン/PlayerControlSystem.md)
- [RewardSystem（報酬System）](ドメイン/シーン/RewardSystem.md)
- [TimeControlSystem（時間制御System）](ドメイン/シーン/TimeControlSystem.md)
- [TitleScene（タイトルシーン）](ドメイン/シーン/TitleScene.md)
- [MainGameScene（メインゲームシーン）](ドメイン/シーン/MainGameScene.md)
- [ConversationScene（会話シーン）](ドメイン/シーン/ConversationScene.md)
- [CanonicalFestivalPrototypeScene（原作導入プロトタイプシーン）](ドメイン/シーン/CanonicalFestivalPrototypeScene.md)

### 会話

- [DialogueSystem（会話System）](ドメイン/会話/DialogueSystem.md)
- [ConversationSceneSession（会話セッション）](ドメイン/会話/ConversationSceneSession.md)

### イベント

- [イベント索引](ドメイン/イベント/README.md)
- [EventSystem（イベントSystem）](ドメイン/イベント/EventSystem.md)
- [EventIdSequence（イベントID採番器）](ドメイン/イベント/EventIdSequence.md)
- [PatrolEvent（見回りイベント）](ドメイン/イベント/PatrolEvent.md)
- [PatrolEventManager（見回りイベント管理）](ドメイン/イベント/PatrolEventManager.md)
- [PatrolTask（見回りタスク）](ドメイン/イベント/PatrolTask.md)

## 横断資料

クラス図は現在の主要な責務と依存関係を示す。
各Markdown設計文書を公開契約と責務の正本とする。

- <a href="./現行設計概要.drawio" download>現行設計概要（draw.io）</a>
- [フレーム更新スイムレーン](フレーム更新スイムレーン.md)
- [メインゲーム状態遷移図](メインゲーム状態遷移図.md)

<<< ./クラス図.puml{ txt }

## 図の使い分け

- クラス図: 静的な責務、公開契約、依存関係
- 状態遷移図: 会話やイベントの状態変化
- シーケンス図: scene遷移や完了通知など、複数要素間の処理順

クラス図はゲーム仕様や詳細設計の正本にせず、仕様と実装から導出される補助資料として扱う。
