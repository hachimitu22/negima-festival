# GameObject（ゲームオブジェクト）

## 基準

GameObject は、ゲーム内に存在し、毎フレーム `update(context)` の対象になるものとする。

定義データ、表示 layer、DOM view は GameObject にしない。

## 公開契約

GameObject の必須契約は `update(context)` とする。

`handleAction(action)`、`getSnapshot()`、状態判定メソッドは全 GameObject 共通の必須契約ではない。入力や描画 snapshot が必要な GameObject だけが補助 API として持つ。

GameObject の snapshot は、その状態を所有する GameObject 自身が `getSnapshot()` で作る。
scene や game system は各 GameObject の公開プロパティを列挙せず、`getSnapshot()` の結果を scene snapshot へ集約する。

## 現在の GameObject

### Character

主人公を毎フレーム更新する GameObject。

- `update(context)` で魔力回復などの主人公状態を更新する。
- 現在地と魔力を保持する。
- location 移動は `moveToLocation(locationId)` で行う。
- `getSnapshot()` で現在地と魔力の snapshot を作る。

### Actor

ゲーム内の登場人物を毎フレーム更新する GameObject。

- 名前と現在地を保持し、一定時間ごとにマップ上を移動する。
- `update(context)` は移動modeに関係なく呼び出し、`automatic`の場合だけ自動移動する。
- 同行中は移動modeを`external`へ切り替え、外部から位置を制御する。
- `getSnapshot()` で人物共通の snapshot を作る。
- `Student` は `getSnapshot()` を拡張し、出席番号と好感度を追加する。
- `Teacher` は人物共通の snapshot を利用する。

## GameObject ではないもの

### Location

`LOCATIONS` は場所定義データであり、毎フレーム更新されないため GameObject にしない。

### Layer

Layer はメインゲーム scene 内の表示や操作面の切り替え状態であり、毎フレーム更新されるゲーム内実体ではないため GameObject にしない。

### Scene

Scene は GameObject を更新する実行単位であり、GameObject そのものにはしない。

### DeliveryEventとDeliveryTask

`DeliveryEvent`は依頼、再確認、完了用の会話シーン台本と`DeliveryTask`をまとめる配達イベントである。
`DeliveryTask`は差出人、受取人、配達状態を保持し、会話シーンの完了結果によって状態を遷移させる。

どちらも時間経過では変化せず、毎フレーム`update()`する必要がないためGameObjectを継承しない。
renderer向けsnapshotや状態判定を持つこと自体はGameObject化の条件にしない。

### AccompanimentEventとAccompanimentTask

`AccompanimentEvent`は開始時と目的地での完了用の会話シーン台本、`AccompanimentTask`をまとめる同行イベントである。
`AccompanimentTask`は同伴者、目的地、同行状態を保持し、会話シーンの完了結果によって状態を遷移させる。

同行中のactor位置同期と自動移動の停止は`MainGameScene`が担当する。
どちらも毎フレーム自身を更新する必要がないためGameObjectを継承しない。

## 将来の候補

次のものは、毎フレーム更新する対象になった時点で GameObject 化を検討する。

- [ConversationSceneSession](../ドメイン/会話/ConversationSceneSession.md): 時間制限、自動進行、演出待ちなどを持つ場合。
- DeliveryTask: 配達期限など、時間経過で進行するルールを持つ場合。
