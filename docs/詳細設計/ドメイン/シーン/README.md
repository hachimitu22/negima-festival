# ドメインのシーン

ゲーム固有の各シーンについて、所有する状態、入力、更新順、snapshot、他のドメインオブジェクトとの境界を定める。
共通契約と遷移方法は[SceneContract](../../ゲームエンジン/SceneContract.md)を正本とする。

## シーン一覧

| シーン                                                  | 役割                                     | 設計状態 |
| ------------------------------------------------------- | ---------------------------------------- | -------- |
| [TitleScene（タイトルシーン）](TitleScene.md)           | ゲーム開始を受け付ける                   | 草案     |
| [MainGameScene（メインゲームシーン）](MainGameScene.md) | 麻帆良祭の時間、人物、イベントを進行する | 確定     |
| [ConversationScene（会話シーン）](ConversationScene.md) | 1件の会話を進行して結果を返す            | 確定     |

## 依存方向

```mermaid
flowchart TB
  TitleScene --> MainGameScene
  MainGameScene --> DialogueSystem
  DialogueSystem --> ConversationSceneSession
  ConversationScene --> ConversationSceneSession
```

- `TitleScene`はゲーム開始時に`MainGameScene`を生成する。
- `MainGameScene`はフィールド会話条件と台本を決定し、メインシーン内の会話状態は`DialogueSystem`へ委譲する。
- `DialogueSystem`は会話台本から`ConversationSceneSession`を生成し、会話入力と時間停止状態を管理する。
- `ConversationScene`は独立会話シーン用に残り、会話台本から`ConversationSceneSession`を生成する。
- 下位のsessionやeventからscene controlを呼び出さない。
