# プロトタイプver3 テスト設計

## 単体テスト

- GameScene: Systemの登録、検索、重複拒否、依存解決を確認する。
- ActorSystem: 存在するエリアへの移動成功と、不明なActorまたはエリアへの要求拒否を確認する。
- AreaSystem: エリアの存在判定とsnapshotを確認する。
- DialogueSystem: 選択肢表示、文章送り拒否、選択後の分岐、不明な選択肢の拒否、会話完了を確認する。
- EventSystem: 世界樹イベントを完了後に再実行しないことを確認する。
- PlayerControlSystem: 移動成功時だけEventSystemへ進入を要求することを確認する。
- EventSystem: 別のID、進入エリア、会話を持つイベントデータを、System変更なしで実行できることを確認する。
- EventSystem: 重複IDまたは未対応形式のイベントデータを登録時に拒否することを確認する。
- EventSystem: 会話開始イベントは対象Actor、同席エリア、日時範囲、未完了の全条件を満たす場合だけ通常会話より優先して開始することを確認する。
- ClockSystem: 指定日時より後は時刻だけをその日時へ戻し、同時刻または無効時は状態を変更しないことを確認する。
- CassiopeiaSystem: MainSceneからSystem IDで取得でき、生成時の固定値ではなく10:00に記録した値へ復元することを確認する。
- ActorSystem: Scheduleの状態を記録した値へ戻すことを確認する。
- EventSystem: 記録した実行状態へ戻り、10:00に待機中だった完了済みイベントを再実行できることを確認する。
- Schedule: 記録した`enabled`と`status`を、復元時刻による再計算なしで復元することを確認する。
- ScheduleKnowledge: 認知済みIDを重複なく保持し、現在のSchedule状態から登録順のScheduleBookを作ることを確認する。
- ActorSystem: Scheduleの有効化に成功した場合だけScheduleKnowledgeへ登録することを確認する。
- スケジュール帳View: ScheduleBookの予定をActorと時間帯ごとの項目へ変換し、`active`だけを緑、それ以外を灰色、`enabled`が`false`なら「（無効）」付きで表示することを公開APIから確認する。

単体テストはDOMとゲームループを使用せず、実Systemを小さく組み合わせてAAA形式で記述する。

### Test Suite: EventSystem

#### Test Case: 記録した待機状態へ戻すと完了済みイベントを再び開始できる

- 前提: `trigger.time`に1日目10:00の`ClockDateTime`を設定した定時イベント。待機状態を記録してから同日時の通知で開始し、会話を完了する。
- 入力: 記録した待機状態と、設定日時と同値の別の`ClockDateTime`インスタンス。
- 操作: 待機状態を復元し、`onTimeReached({ dateTime }, context)`を呼ぶ。
- 期待結果: 復元後は`waiting`、時刻通知後は`executing`になる。

### Test Suite: ClockSystemの時間変更予約

#### Test Case: 時と分の予約はupdateで反映する

- 前提: 10:00の時計。
- 入力: 1時間30分のClockDuration。
- 操作: 予約前後の日時を取得し、updateを呼ぶ。
- 期待結果: 予約時は10:00、更新後は11:30になる。

#### Test Case: 固定日時への変更を予約する

- 前提: 10:00の時計。
- 入力: 12:00のClockDateTime。
- 操作: 予約してupdateを呼ぶ。
- 期待結果: 余分な5分を加算せず12:00になる。

#### Test Case: 二重予約は反映前後とも拒否する

- 前提: 10:00の時計に30分を予約済み。
- 入力: 別の時間変更。
- 操作: updateの前後で二度目の予約を試す。
- 期待結果: どちらもtime-change-already-requestedを送出し、初回の30分だけを反映する。

#### Test Case: cleanup後に次の予約を受け付ける

- 前提: 30分を反映済みの時計。
- 入力: cleanup後のsetStep。
- 操作: cleanupし、setStepとupdateを呼ぶ。
- 期待結果: 次の5分を加算して10:35になる。

#### Test Case: 同じ予約を再加算しない

- 前提: 30分を予約した時計。
- 入力: 同じ更新コンテキスト。
- 操作: cleanupせずupdateを2回呼ぶ。
- 期待結果: 時計は10:30のままになる。

#### Test Case: 0時間0分も予約枠を使用する

- 前提: 10:00に開始する定時イベントと10:00の時計。
- 入力: 0時間0分のClockDuration。
- 操作: 予約してupdateを呼び、さらにsetStepを試す。
- 期待結果: 時計は変わらずイベントはwaitingを維持し、二度目の予約は例外になる。

#### Test Case: 現在と同じ日時も予約枠を使用する

- 前提: 10:00の時計。
- 入力: 10:00のClockDateTime。
- 操作: 予約してupdateを呼び、さらにsetStepを試す。
- 期待結果: 時計は変わらず二度目の予約は例外になる。

#### Test Case: 未対応の型を拒否する

- 前提: 未予約の時計。
- 入力: 通常オブジェクトの{ min: 30 }。
- 操作: 予約を試してからsetStepとupdateを呼ぶ。
- 期待結果: TypeErrorを送出し、予約枠は消費せず5分進められる。

#### Test Case: 過去日時の予約を拒否する

- 前提: 10:00の時計。
- 入力: 09:59のClockDateTime。
- 操作: 予約を試す。
- 期待結果: RangeErrorを送出し、時計は10:00のままとなる。

#### Test Case: 無効な日時の予約を拒否する

- 前提: 未予約の時計。
- 入力: hourにNaNを渡したClockDateTime。
- 操作: 予約を試す。
- 期待結果: RangeErrorを送出する。

#### Test Case: 巻き戻しは古い予約を取り消し予約枠を維持する

- 前提: 11:00の時計に1時間の変更を予約済み。
- 入力: 10:00への巻き戻し。
- 操作: 巻き戻してupdateを呼び、追加予約を試す。cleanup後にsetStepとupdateを呼ぶ。
- 期待結果: 古い1時間を加算せず10:00へ戻り、cleanup前は追加予約を拒否し、cleanup後は10:05へ進める。

#### Test Case: 巻き戻し拒否時は予約を維持する

- 前提: 10:00の時計に1時間の変更を予約済み。
- 入力: 10:00への巻き戻し。
- 操作: 巻き戻しを試してupdateを呼ぶ。
- 期待結果: 巻き戻しはfalse、時計は予約どおり11:00になる。

### Test Suite: ClockSystemの停止と再開

#### Test Case: 停止要求を解除すると次のupdateで時間変更を反映する

- 前提: 10:00の時計に5分の時間変更を予約済み。
- 入力: 同じ要求元IDによるrequestStopとrequestResume。
- 操作: 停止を要求してupdateを呼び、解除前後と再度のupdate後の日時を取得する。
- 期待結果: 停止中と解除直後は10:00、解除後のupdateで10:05になる。

#### Test Case: 他の要求元の停止要求が残る間は停止を維持する

- 前提: 二つの要求元が停止を要求した10:00の時計に5分を予約済み。
- 入力: 各要求元IDのrequestResume。
- 操作: 一つ目を解除してupdateし、二つ目を解除して再度updateする。
- 期待結果: 一つ目の解除後は10:00、すべて解除後は10:05になる。

#### Test Case: 同じ要求元の重複した停止要求は一度の解除で取り消せる

- 前提: 同じ要求元が二度停止を要求した10:00の時計に5分を予約済み。
- 入力: 同じ要求元IDのrequestResume。
- 操作: 一度解除してupdateする。
- 期待結果: 10:05になる。

#### Test Case: 未登録の要求元を解除しても他の停止要求を維持する

- 前提: 一つの要求元が停止を要求した10:00の時計に5分を予約済み。
- 入力: 未登録の要求元IDのrequestResume。
- 操作: 解除してupdateする。
- 期待結果: 例外は発生せず10:00のままになる。

#### Test Case: 解除済みの要求元を再度解除しても時間変更できる

- 前提: 停止要求を解除済みの10:00の時計に5分を予約済み。
- 入力: 同じ要求元IDのrequestResume。
- 操作: 再度解除してupdateする。
- 期待結果: 例外は発生せず10:05になる。

#### Test Case: cleanup後も停止要求を保持する

- 前提: 停止を要求した10:00の時計に5分を予約済み。
- 入力: cleanupと同じ要求元IDのrequestResume。
- 操作: cleanup後に5分を予約してupdateし、停止を解除して再度updateする。
- 期待結果: cleanup後も10:00を維持し、解除後は10:05になる。

### Test Suite: ClockDateTime

#### Test Case: 時と分を加算して日付をまたぐ

- 前提: 6月20日23:45の日時。
- 入力: { hour: 1, min: 30 }。
- 操作: addを呼ぶ。
- 期待結果: 元の日時を変更せず6月21日01:15の新しい日時を返す。

### Test Suite: イベント完了時の時間変更

#### Test Case: のどかイベントの終了後に1時間を反映する

- 前提: 10:00に広場でのどかイベントを開始したEventSystemと実ClockSystem・DialogueSystem。
- 入力: 一緒に回る選択と分岐会話の完了操作。
- 操作: 会話を完了してからClockSystem.updateを呼ぶ。
- 期待結果: イベントと会話の終了時は10:00、時計の更新後は11:00になる。通過したアナウンスは会話なしでcompleteとなる。

#### Test Case: 完了時に固定日時を予約する

- 前提: timeChangeに11:00を指定した実行中イベント。
- 入力: 会話の完了操作。
- 操作: 会話を完了してClockSystem.updateを呼ぶ。
- 期待結果: 完了処理中は10:00、時計の更新後は11:00になる。

#### Test Case: 到着日時のアナウンスは会話解放後に開始する

- 前提: timeChangeに15分を指定した実行中イベントと10:15のアナウンス。
- 入力: 会話の完了操作。
- 操作: 会話を完了してClockSystem.updateを呼ぶ。
- 期待結果: 先のイベントはcomplete、アナウンスはexecutingとなり、その会話を表示する。

#### Test Case: 通過前のアナウンスは待機状態を維持する

- 前提: 10:00の時計と10:15のアナウンス。
- 入力: 5分の時間変更。
- 操作: 予約してClockSystem.updateを呼ぶ。
- 期待結果: アナウンスはwaitingのままで会話は表示されない。

### Test Suite: ClockDuration

#### Test Case: 引数なしは0時間0分になる

- 前提: なし。
- 入力: なし。
- 操作: `new ClockDuration()`を生成して`hour`・`min`を読む。
- 期待結果: どちらも0を返す。

#### Test Case: 分だけを指定すると時は0になる

- 前提: なし。
- 入力: `{ min: 90 }`。
- 操作: `new ClockDuration(input)`を生成して`hour`・`min`を読む。
- 期待結果: `hour`は0、`min`は90を返す。

#### Test Case: 時だけを指定すると分は0になる

- 前提: なし。
- 入力: `{ hour: 25 }`。
- 操作: `new ClockDuration(input)`を生成して`hour`・`min`を読む。
- 期待結果: `hour`は25、`min`は0を返す。

#### Test Case: 時と分を同時に指定できる

- 前提: なし。
- 入力: `{ hour: 1, min: 30 }`。
- 操作: `new ClockDuration(input)`を生成して`hour`・`min`を読む。
- 期待結果: `hour`は1、`min`は30を返す。

#### Test Case: 生成後の時間量を書き換えられない

- 前提: 1時間30分のClockDuration。
- 入力: `hour`への2の代入と`min`への60の代入。
- 操作: 各プロパティへの代入をそれぞれ実行する。
- 期待結果: どちらも`TypeError`を送出し、`hour`は1、`min`は30のままとなる。

#### Test Case: 負数の分数を拒否する

- 前提: なし。
- 入力: `{ min: -1 }`。
- 操作: `new ClockDuration(input)`を生成する。
- 期待結果: `RangeError`を送出する。

#### Test Case: 小数の分数を拒否する

- 前提: なし。
- 入力: `{ min: 0.5 }`。
- 操作: `new ClockDuration(input)`を生成する。
- 期待結果: `RangeError`を送出する。

#### Test Case: 文字列の分数を拒否する

- 前提: なし。
- 入力: `{ min: '30' }`。
- 操作: `new ClockDuration(input)`を生成する。
- 期待結果: `RangeError`を送出する。

#### Test Case: NaNの分数を拒否する

- 前提: なし。
- 入力: `{ min: NaN }`。
- 操作: `new ClockDuration(input)`を生成する。
- 期待結果: `RangeError`を送出する。

#### Test Case: 無限大の分数を拒否する

- 前提: なし。
- 入力: `{ min: Infinity }`。
- 操作: `new ClockDuration(input)`を生成する。
- 期待結果: `RangeError`を送出する。

#### Test Case: 負数の時間数を拒否する

- 前提: なし。
- 入力: `{ hour: -1 }`。
- 操作: `new ClockDuration(input)`を生成する。
- 期待結果: `RangeError`を送出する。

#### Test Case: 小数の時間数を拒否する

- 前提: なし。
- 入力: `{ hour: 0.5 }`。
- 操作: `new ClockDuration(input)`を生成する。
- 期待結果: `RangeError`を送出する。

#### Test Case: 文字列の時間数を拒否する

- 前提: なし。
- 入力: `{ hour: '2' }`。
- 操作: `new ClockDuration(input)`を生成する。
- 期待結果: `RangeError`を送出する。

#### Test Case: NaNの時間数を拒否する

- 前提: なし。
- 入力: `{ hour: NaN }`。
- 操作: `new ClockDuration(input)`を生成する。
- 期待結果: `RangeError`を送出する。

#### Test Case: 無限大の時間数を拒否する

- 前提: なし。
- 入力: `{ hour: Infinity }`。
- 操作: `new ClockDuration(input)`を生成する。
- 期待結果: `RangeError`を送出する。

### Test Suite: Actor

#### Test Case: 現在地とScheduleの記録と復元を独立した値で行う

- 前提: 有効・実行中のScheduleと無効・待機中のScheduleを持つActor。
- 入力: 記録したActor状態、両Scheduleの終了時刻、移動先エリア。
- 操作: 状態を記録し、両Scheduleを有効化して終了まで更新してから移動し、記録を復元する。復元後に記録側の値を変更する。
- 期待結果: 記録は現在地と登録順のSchedule状態を保持し、Actor更新の影響を受けない。現在地と全Scheduleが記録した状態へ戻り、記録側の値を変更してもActorの状態は変わらない。

#### Test Case: ScheduleがないActorの現在地を記録・復元する

- 前提: Scheduleを渡さず生成したActor。
- 入力: 移動先エリアと記録したActor状態。
- 操作: `captureState()`で記録し、移動後に`restore(state)`を呼ぶ。
- 期待結果: 記録とsnapshotの`schedules`はいずれも空配列で、現在地は記録した位置に戻る。

#### Test Case: 不明なScheduleの復元を拒否する

- 前提: 復元対象のScheduleを持たないActor。
- 入力: 未登録のSchedule IDと有効・実行中の状態を含むActor状態。
- 操作: `restore(state)`を呼ぶ。
- 期待結果: `schedule-not-found: actorId/scheduleId`の例外を送出し、Actorのsnapshotは変わらない。

### Test Suite: Negi

#### Test Case: 記録を復元しても現在地を維持する

- 前提: 学校入口で状態を記録したNegi。
- 入力: 食堂への移動と記録した状態。
- 操作: 移動後に`restore(state)`を呼ぶ。
- 期待結果: 記録は学校入口を保持し、Negiのsnapshotは復元前の食堂にいる状態を維持する。

### Test Suite: ActorSystem

#### Test Case: 記録したNPC位置へ戻し、同じ更新ではActorを移動させない

- 前提: Negiと実行中Scheduleを持つActorを登録したActorSystem。
- 入力: 両者を移動させる前に記録した状態。
- 操作: `restoreState(state)`と`update(context)`を呼び、その後`cleanup()`を経て再び更新する。
- 期待結果: 記録はプレイヤーを含む登録順のActor状態である。Negiは現在地を維持し、Actorは記録した位置へ戻る。同じ更新では移動せず、次の更新でScheduleによる移動を再開する。

#### Test Case: 不明なActorの復元を拒否する

- 前提: Actorを登録していないActorSystem。
- 入力: 未登録のActor IDを持つ状態の配列。
- 操作: `restoreState(states)`を呼ぶ。
- 期待結果: `actor-not-found: actorId`の例外を送出する。

## 通しテスト

MainSceneへ次の入力を順に渡し、公開snapshotだけを検証する。

1. 初期位置が学校入口で、移動先に世界樹と広場がある。
2. 世界樹へ移動すると明日菜の質問と2つの選択肢が表示される。
3. 選択した返答に対応するネギと明日菜の会話が表示される。
4. 分岐会話を最後まで進めるとイベントが完了し、移動可能になる。
5. もう一方の選択肢では異なる明日菜の返答になる。
6. 別エリアを経由して世界樹へ戻っても会話は再開しない。
7. 6月20日10:00に食堂の木乃香へ話しかけると、手伝い方の選択肢が表示される。
8. 「料理を運ぶ」と「食器を片づける」で異なる会話結果が表示される。
9. 木乃香のイベント完了後、または受付時間外は通常会話が表示される。
10. 10:15ちょうどは通常会話が表示される。
11. 10:00より後は簡易巻き戻しが有効になり、実行後は時刻と対象状態が10:00時点へ戻る。
12. 巻き戻し後はプレイヤーの現在地とスケジュールの認知状態を維持し、NPCの現在地、イベント状態、Scheduleの有効・実行状態を10:00の記録へ戻す。時刻到達イベントは開始しない。
13. 10:00と会話中は簡易巻き戻しを実行できない。
14. 一度有効にしたスケジュールは巻き戻し後もスケジュール帳へ表示し、再度有効にするまで実行しない。
