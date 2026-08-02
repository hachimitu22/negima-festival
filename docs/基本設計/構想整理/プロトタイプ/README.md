# Canonicalプロトタイプ整理

## 対象

現在実装されているCanonicalFestivalPrototypeSceneのドメイン要素、用語、イベント、ゲーム機能を整理する。

この章はプロトタイプの現在仕様を扱う。将来構想と3日目最終局面などの未実装要素は扱わない。

## 文書

| 文書 | 内容 |
| --- | --- |
| [ドメイン要素](ドメイン要素.md) | プロトタイプを構成する概念、状態、要素間の関係 |
| [ユビキタス言語](ユビキタス言語.md) | プロトタイプ内で使用する用語の定義 |
| [システム一覧](システム一覧.md) | ゲーム機能と責務、実装対応 |

## 実装対応

実装の中心は`src/gameDomain/canonicalFestivalPrototypeScene/canonicalFestivalPrototypeScene.js`である。
各イベントとシステムの実装対応は[システム一覧](システム一覧.md)に記載する。
