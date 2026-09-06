# プロトタイプver3 詳細設計

## SceneとSystem

`GameScene`は`systemId`をキーにSystemを登録する。重複IDは拒否し、全Systemの登録後に`initializeSystems()`を呼び出す。
初期化時に渡す`requireSystem(systemId)`は、未登録のSystemを要求した場合に例外を送出する。
MainSceneで使用するIDは`SYSTEM_IDS`定数へ集約し、Systemのコンストラクタ、`requireSystem`、`getSystem`から参照する。

更新順は次のとおりとする。

1. PlayerControlSystem
2. ActorSystem
3. AreaSystem
4. EventSystem
5. DialogueSystem

## 公開API

| System | API | 結果 |
| --- | --- | --- |
| ActorSystem | `requestMoveActor({ actorId, areaId })` | `accepted`、`succeeded`と必要に応じて`reason` |
| AreaSystem | `hasArea(areaId)` | 存在判定 |
| EventSystem | `requestAreaEntered(areaId)` | イベント開始の受付結果 |
| EventSystem | `onTalkStarted({ initiatingActorId, actorId }, context)` | 会話開始条件に一致するイベントを開始した場合は`true`、それ以外は`false` |
| DialogueSystem | `requestStart({ ownerId, messages, choices })` | 受付結果とrequestId |
| DialogueSystem | `requestAdvance()` | 受付結果 |
| DialogueSystem | `requestChoose(choiceId)` | 選択受付結果 |
| DialogueSystem | `hasActiveDialogue()` | 会話中判定 |
| DialogueSystem | `takeRequestResult(requestId)` | 完了結果または`null` |

PlayerControlSystemはActorSystemへの移動要求が成功した場合だけ、EventSystemへ移動先エリアへの進入を要求する。AreaSystemは進入状態を保持しない。

DialogueSystemは同時に1会話だけを実行する。選択肢がある共通会話の最終文では文章送りを拒否し、選択された分岐会話へ切り替える。分岐会話の最後で文章送りを受けると会話を終了し、対応するrequestIdの成功結果を一度だけ取得可能にする。

## イベントデータと実行

イベント固有のID、開始条件、会話は`events`フォルダのデータモジュールへ定義し、MainSceneが配列としてEventSystemへ渡す。

```js
{
  id: 'world-tree-asuna',
  areaId: 'world-tree',
  dialogue: {
    messages: [{ speaker, text }],
    choices: [{ id, text, messages: [{ speaker, text }] }],
  },
}
```

EventSystemは登録時にIDの重複と発生エリアを検証する。会話と選択肢の形式はDialogueSystemが開始要求時に検証する。

会話開始イベントは、対象Actor、エリア、開始日時、終了日時を開始条件に持つ。ActorSystemは通常会話を開始する前にEventSystemへ通知し、条件に一致するイベントが開始された場合は通常会話を開始しない。日時範囲は両端を含む。

同時に実行するイベントは一つとする。待機中の複数イベントが同じ進入条件を満たした場合は、登録順で最初のイベントを開始する。完了済みイベントは再度開始しない。

会話要求IDをイベントの実行状態に保持し、成功結果を受け取るとイベントを完了する。

## 入力

```js
{ type: 'area.move', areaId: 'world-tree' }
{ type: 'dialogue.next' }
{ type: 'dialogue.choose', choiceId: 'look-around-festival' }
```

会話中は`dialogue.next`または`dialogue.choose`を処理し、それ以外の入力を無視する。通常時は1回の更新につき最初の有効な移動入力だけを処理する。

## SceneSnapshot

```js
{
  sceneId: 'prototype3-main',
  player: { id, name, areaId },
  actors: [{ id, name, areaId }],
  areas: [{ id, name }],
  moveableAreas: [{ id, name }],
  dialogue: null | { speaker, text, messageIndex, messageCount, choices: [{ id, text }] },
  events: [{ id, status }],
}
```

イベント状態は`waiting`、`executing`、`completed`のいずれかとする。
エリアIDは`school-entrance`、`world-tree`、`plaza`、`cafeteria`、Actor IDは`player`、`asuna`、`nodoka`、`konoka`を使用する。

## View

MainViewは`configure`、`init`、`render`、`destroy`を実装する。表示操作は入力をenqueueしてから`requestRenderStep`を呼ぶ。
操作要素は生成時に各要素へ`click`リスナーを設定し、その要素に対応する入力を直接生成する。
ゲーム状態やルールをDOMへ保持せず、毎回SceneSnapshotから表示を作る。
