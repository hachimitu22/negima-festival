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
7. 6月20日10:30に食堂の木乃香へ話しかけると、手伝い方の選択肢が表示される。
8. 「料理を運ぶ」と「食器を片づける」で異なる会話結果が表示される。
9. 木乃香のイベント完了後、または10:30より前と10:45より後は通常会話が表示される。
10. 10:45ちょうどはイベントを開始できる。
11. 10:00より後は簡易巻き戻しが有効になり、実行後は時刻と対象状態が10:00時点へ戻る。
12. 巻き戻し後はプレイヤーの現在地とスケジュールの認知状態を維持し、NPCの現在地、イベント状態、Scheduleの有効・実行状態を10:00の記録へ戻す。時刻到達イベントは開始しない。
13. 10:00と会話中は簡易巻き戻しを実行できない。
14. 一度有効にしたスケジュールは巻き戻し後もスケジュール帳へ表示し、再度有効にするまで実行しない。
