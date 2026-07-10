# CharacterSystem（キャラクター位置・移動System）

## 対象

- `src/gameDomain/mainGameScene/characterSystem.js`

## 方針

実物の`Character`、`Actor`、`GridMap`を使い、公開APIとsnapshot fragmentだけから位置・移動管理を検証する。
DOM、ゲームループ、実時間には依存しない。

## Test Suite

### CS-UT-S01 主人公移動

#### CS-UT-S01-C01 マップ座標への移動で主人公snapshotと訪問場所を更新する

- 前提: 主人公を初期位置に持つ`CharacterSystem`を作る。
- 入力: 到達可能なマップ座標。
- 操作: `movePlayerToMapPosition()`で移動を開始し、十分な`deltaTimeMs`で`update()`を呼ぶ。
- 期待結果: `createSnapshotFragment().character.location`が目的地の場所になり、`consumeVisitedPlayerLocationIds()`が訪問場所IDを返す。

#### CS-UT-S01-C02 同行者ID付きの主人公移動で同行者にも同じ目的地への移動を開始する

- 前提: 主人公と同じ場所にいるactorを持つ`CharacterSystem`を作る。
- 入力: 到達可能なマップ座標と`companionActorId`。
- 操作: `movePlayerToMapPosition()`を呼び、actor snapshotを取得する。
- 期待結果: 主人公の移動が開始し、同行者の`movement.destination`も主人公の目的地と一致する。

### CS-UT-S02 actor検索と位置読み取り

#### CS-UT-S02-C01 findTalkableActorは主人公と同じ場所にいるactorだけを返す

- 前提: 主人公と同じ場所のactor、異なる場所のactorを持つ`CharacterSystem`を作る。
- 入力: 各actor ID。
- 操作: `findTalkableActor()`を呼ぶ。
- 期待結果: 同じ場所のactorだけを返し、異なる場所のactorは`null`になる。

#### CS-UT-S02-C02 getSpatialSubjectsはGameObject内部を直接公開しない読み取りモデルを返す

- 前提: 主人公とactorを持つ`CharacterSystem`を作る。
- 入力: なし。
- 操作: `getSpatialSubjects()`を呼び、返却されたpositionを書き換えた後、再度取得する。
- 期待結果: 再取得したpositionは実際のGameObject位置のままで、前回返却値の変更に影響されない。
