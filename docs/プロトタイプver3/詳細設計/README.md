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

イベント固有のID、開始条件、終了時の時間変更、会話は`events`フォルダのデータモジュールへ定義し、MainSceneが配列としてEventSystemへ渡す。

```js
{
  id: 'world-tree-asuna',
  trigger: {
    type: EventTriggerTypes.AREA_ENTER,
    enteringActorId: ACTOR_IDS.PLAYER,
    enteredAreaId: AREA_IDS.WORLD_TREE,
    presentActorId: ACTOR_IDS.ASUNA,
    receptionTimeRange: SCHEDULES[SCHEDULE_IDS.ASUNA.WORLD_TREE_WAITING].dateTimeRange,
  },
  timeChange: new ClockDuration(),
  dialogue: {
    steps: [{ type: 'message', message: { speaker, text } }],
  },
}
```

EventSystemは登録時にIDの重複と発生エリアを検証する。会話と選択肢の形式はDialogueSystemが開始要求時に検証する。

会話開始イベントは、対象Actor、エリア、受付日時範囲を開始条件に持つ。ActorSystemは通常会話を開始する前にEventSystemへ通知し、条件に一致するイベントが開始された場合は通常会話を開始しない。日時範囲は開始を含み終了を含まない。

同時に実行するイベントは一つとする。待機中の複数イベントが同じ進入条件を満たした場合は、登録順で最初のイベントを開始する。同じループ中で完了済みのイベントは再度開始しない。

DialogueSystemから完了コールバックを受けたEventSystemは、時間変更があればClockSystemへ予約し、イベントを完了して実行中の参照を解除する。DialogueSystemが会話を解放した後、同じGameScene更新内のClockSystem更新で予約を反映する。
初期化時は各イベントを`waiting`とし、巻き戻しでは記録した各イベントの状態へ戻す。会話中は巻き戻しできないため、DialogueSystemの会話状態は変更しない。

### 時間設定のデータ契約

- `trigger.receptionTimeRange`は`ClockDateTimeRange`とする。明日菜・のどか・木乃香は対応する`SCHEDULES`の`dateTimeRange`を参照し、アナウンスでは省略する。
- `TIME_REACHED`の`trigger.time`は`ClockDateTime`とする。EventSystemは通知された日時と設定日時の`getTime()`を比較し、一致した場合に開始する。
- `timeChange`はイベント直下に置き、`ClockDuration`なら終了時に加算する時間量、`ClockDateTime`なら終了後の日時を表す。未指定なら時間変更を予約しない。

### ClockSystemの時間変更予約

- `requestTimeChange(timeChange)`は`ClockDuration`または`ClockDateTime`を受け取る。前者は現在日時に時・分を加算して変更先を求め、後者はその日時を変更先とする。予約時には時計を変更しない。
- 予約先日時を1変数に保持し、未予約は`null`とする。入力処理中に予約し、1回の`GameScene.update()`で2回目の予約は`time-change-already-requested`の例外とし、初回の予約を維持する。0時間0分や現在と同じ日時も予約1件として数える。
- `requestStop(requesterId)`は時計の停止要求を受け付け、要求元IDを`#stopRequesterIds`の`Set`へ重複なく保持する。
- `requestResume(requesterId)`は指定した要求元IDの停止要求を解除する。未登録のIDは何も変更せず、両メソッドとも戻り値はない。要求元の登録・解除では時計を変更せず、時間変更の反映は`update(context)`に委ねる。停止要求は`cleanup()`をまたいで保持する。
- `update(context)`は停止要求がない場合に予約先日時へ時計を進め、変更前後の日時をEventSystemへ通知する。同じ日時なら更新・通知を行わない。予約値は反映後も保持し、`cleanup()`で`null`へ戻す。
- `setStep()`は5分の`ClockDuration`を予約する。移動とイベント完了は同じ予約枠を使い、従来のSTOP・RUN・STEP状態は廃止する。
- 未対応の値は`TypeError`、無効な日時または現在より前の変更先は`RangeError`とし、予約を保持しない。
- `rewindTo(dateTime)`に成功した場合、既存の予約先も復元日時へ置き換える。これにより古い時間変更を取り消し、同一更新内の予約枠は消費したままにする。巻き戻しを拒否した場合は予約も維持する。
- `ClockDateTime.add({ hour = 0, min = 0 })`は時・分の時間量を加算した新しい日時を返す。
- `EventSystem.onTimeReached({ dateTime, previousDateTime }, context)`は、変更前後の間にある未完了の`FESTIVAL_ANNOUNCEMENT`を会話なしで完了させる。到着日時のイベントは既存の一致判定で開始する。`previousDateTime`を省略した呼び出しでは通過判定を行わない。

### ClockDuration

`ClockDuration`は日時を持たず、時・分で時間量を保持する値オブジェクトとする。

- `constructor({ hour = 0, min = 0 } = {})`: 時・分を個別または同時に指定し、省略した項目は0とする。各値が非負の整数でなければ`RangeError`とする。
- 読み取り専用の`hour`・`min` getterで指定した値を返す。時と分の相互換算は行わず、24時間以上・60分以上もそのまま保持する。
- `ClockDateTime`と同じ項目名を用いる。今回は加算や比較などのメソッドを追加しない。

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
