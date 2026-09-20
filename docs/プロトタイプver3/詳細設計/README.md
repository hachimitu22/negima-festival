# プロトタイプver3 詳細設計

## SceneとSystem

`GameScene`は`systemId`をキーにSystemを登録する。重複IDは拒否し、全Systemの登録後に`initializeSystems()`を呼び出す。
初期化時に渡す`requireSystem(systemId)`は、未登録のSystemを要求した場合に例外を送出する。
MainSceneで使用するIDは`SYSTEM_IDS`定数へ集約し、Systemのコンストラクタ、`requireSystem`、`getSystem`から参照する。

入力を配信した後、Systemを登録順に更新し、全Systemの更新後に登録順で`cleanup()`を呼ぶ。
MainSceneのSystem更新順は次のとおりとする。

1. ClockSystem
2. CassiopeiaSystem
3. ActorSystem
4. AreaSystem
5. EventSystem
6. DialogueSystem

## 公開API

| System         | API                                                      | 結果                                                                                |
| -------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| ActorSystem    | `requestMoveActor({ actorId, areaId })`                  | `accepted`、`succeeded`と必要に応じて`reason`                                       |
| ActorSystem    | `enableSchedule(actorId, scheduleId)`                    | 対象Scheduleを有効にし、成功時はScheduleKnowledgeへ登録する                         |
| AreaSystem     | `hasArea(areaId)`                                        | 存在判定                                                                            |
| EventSystem    | `requestAreaEntered(areaId)`                             | イベント開始の受付結果                                                              |
| EventSystem    | `onTalkStarted({ initiatingActorId, actorId }, context)` | 会話開始条件に一致するイベントを開始した場合は`true`、それ以外は`false`             |
| EventSystem    | `captureState()` / `restoreState(state)`                 | ID付きの実行状態を記録・復元し、復元時に実行中イベントの参照を解除する              |
| ClockSystem    | `rewindTo(dateTime)`                                     | 指定日時への巻き戻しを実行した場合は`true`、実行不可の場合は`false`                 |
| ClockSystem    | `canRewindToStart()`                                     | 現在時刻が1日目10:00より後かを返す                                                  |
| ActorSystem    | `captureState()` / `restoreState(states)`                | 全Actorの状態を記録し、復元を各Actorへ委譲する。復元した更新ではActor更新を抑止する |
| DialogueSystem | `requestStart({ ownerId, messages, choices })`           | 受付結果とrequestId                                                                 |
| DialogueSystem | `requestAdvance()`                                       | 受付結果                                                                            |
| DialogueSystem | `requestChoose(choiceId)`                                | 選択受付結果                                                                        |
| DialogueSystem | `hasActiveDialogue()`                                    | 会話中判定                                                                          |
| DialogueSystem | `takeRequestResult(requestId)`                           | 完了結果または`null`                                                                |

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

同時に実行するイベントは一つとする。待機中の複数イベントが同じ進入条件を満たした場合は、登録順で最初のイベントを開始する。同じループ中で完了済みのイベントは再度開始しない。

会話要求IDをイベントの実行状態に保持し、成功結果を受け取るとイベントを完了する。
初期化時は各イベントを`waiting`とし、巻き戻しでは記録した各イベントの状態へ戻す。会話中は巻き戻しできないため、DialogueSystemの会話状態は変更しない。

## スケジュール状態

Scheduleは、現在ループの`enabled`と時刻に応じた`status`を管理する。`status`は`waiting`、`active`、`finished`のいずれかとし、`active`は必ず`enabled`を伴う。

ActorはSchedule一覧を`#schedules`として保持し、更新、有効化、状態の記録・復元を自身のメソッドで行う。描画用snapshotには従来どおり`schedules`を含める。Actorの予定による移動は`enabled`かつ`active`の場合だけ行う。

`Actor.captureState()`は`{ areaId, schedules: [{ scheduleId, enabled, status }] }`を独立した値として返す。Scheduleは登録順で記録する。`Actor.restore(state)`は記録した現在地と各Scheduleの状態を復元し、時刻から再計算しない。戻り値はなく、Schedule IDが存在しない場合は`schedule-not-found: actorId/scheduleId`を送出する。

ActorSystemの`captureState()`は全Actorの記録へ`actorId`を付加した配列を登録順で返す。`restoreState(states)`はIDで取得したActorの`restore(state)`へ委譲し、存在しないActor IDには`actor-not-found: actorId`を送出する。Negiは`captureState()`を継承し、`restore(state)`を空実装にすることで巻き戻し時に現在の状態を維持する。

## カシオペアによる簡易巻き戻し

簡易巻き戻しはMainScene固有の仕様とし、GameSceneの更新処理へ組み込まない。CassiopeiaSystemはMainSceneのGameSystemとして`cassiopeia.rewind`を受け付ける。MainSceneがActorとScheduleを生成した後、CassiopeiaSystemはClockSystemの日時、ActorSystemの全Actor状態、EventSystemの全イベント状態を1件の記録として保持する。記録はIDと可変状態の値で構成し、Actor・Schedule・Eventオブジェクトへの参照や描画用SceneSnapshotを保持しない。

`#rewind`はClockSystemの`rewindTo(記録日時)`が成功した場合だけ、ActorSystemとEventSystemの`restoreState`を呼ぶ。ScheduleKnowledgeは記録・復元の対象外とする。今回は会話・イベント実行中ではない10:00時点だけを記録する。

ActorSystemは状態を復元した更新で通常のActor更新を行わず、`cleanup()`で抑止状態を解除する。ClockSystemは時刻の所有と変更だけを担当する。

## ScheduleKnowledgeとScheduleBook

ScheduleKnowledgeはGameSystemにせず、MainSceneが所有するゲーム状態とする。`learn(scheduleId)`で認知済みIDを重複なく登録し、巻き戻しでは変更しない。ActorSystemは`enableSchedule(actorId, scheduleId)`が成功した場合だけ対象IDを登録する。

MainSceneはActor snapshotから全Scheduleを取り出し、親ActorのIDを`actorId`として付加する。ScheduleKnowledgeの`createScheduleBook(scheduleSnapshots)`は認知済みIDに対応するScheduleだけを登録順に返し、対応するScheduleがなければ`schedule-not-found`を送出する。Scheduleの可変状態はActor側だけが所有し、ScheduleKnowledgeには複製しない。

## 入力

```js
{ type: 'area.move', areaId: 'world-tree' }
{ type: 'dialogue.next' }
{ type: 'dialogue.choose', choiceId: 'look-around-festival' }
{ inputId: 'cassiopeia.rewind' }
```

会話中は`dialogue.next`または`dialogue.choose`を処理し、それ以外の入力を無視する。通常時は1回の更新につき最初の有効な移動入力だけを処理する。

CassiopeiaSystemは入力ID`cassiopeia.rewind`を受け付ける。会話中または1日目10:00の場合はClockSystemが要求を拒否するため、他の状態を変更しない。成功時は時刻を1日目10:00へ置き換えて時計を停止し、時刻到達イベントを発生させない。

## SceneSnapshot

```js
{
  sceneId: 'prototype3-main',
  clock: string,
  canRewindTime: boolean,
  player: { id, name, areaId },
  actors: [{
    id,
    name,
    areaId,
    schedules: [{ id, dateTimeRange, areaId, enabled, status }],
  }],
  areas: [{ id, name }],
  moveableAreas: [{ id, name }],
  dialogue: null | { speaker, text, messageIndex, messageCount, choices: [{ id, text }] },
  events: [{ id, status }],
  scheduleBook: {
    schedules: [{ id, actorId, dateTimeRange, areaId, enabled, status }],
  },
}
```

イベント状態は`waiting`、`executing`、`complete`のいずれかとする。
エリアIDは`school-entrance`、`world-tree`、`plaza`、`cafeteria`、Actor IDは`player`、`asuna`、`nodoka`、`konoka`を使用する。

## View

MainViewは`configure`、`init`、`render`、`destroy`を実装する。表示操作は入力をenqueueしてから`requestRenderStep`を呼ぶ。
操作要素は生成時に各要素へ`click`リスナーを設定し、その要素に対応する入力を直接生成する。
ゲーム状態やルールをDOMへ保持せず、毎回SceneSnapshotから表示を作る。
スケジュール帳は他のViewと同じく`submitInput`を受け取り、描画状態としてClockとScheduleBookだけを使用する。ScheduleBookの`schedules`を`actorId`ごとの項目として表示し、`status`が`active`なら緑、それ以外は灰色とする。`enabled`が`false`の項目には「（無効）」を付け、認知済みだが現在ループで実行判定しないことを示す。グループ一覧には`ACTOR_IDS`を使用する。
時刻欄は「10:00に戻す」ボタンを表示し、`canRewindTime`が`false`の場合は無効化する。
