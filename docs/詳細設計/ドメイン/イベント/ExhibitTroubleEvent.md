# ExhibitTroubleEvent（展示トラブル対応イベント定義）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/event/exhibitTroubleEvent.js`

## 目的

`ExhibitTroubleEvent` は、連絡掲示イベント完了後に開始する2件目の `BranchEvent` チェーンを定義する。
最初のタスクで対応方針を選び、その後は既存の場所到達/期限切れタスクとして進行することで、選択肢による分岐を表す。

## 公開契約

```js
createExhibitTroubleEvent(id, { startHours })
```

この関数は、次の設定を持つ `BranchEvent` を返す。

- `type: 'exhibit-trouble'`
- `name: '展示トラブル対応'`
- 開始タスク: `decide-approach`

## タスク構成

| Task ID           | 種類     | 目的                           | 分岐                                      |
| ----------------- | -------- | ------------------------------ | ----------------------------------------- |
| `decide-approach` | choice   | 対応方針を選ぶ                 | `fetch-supplies` または `move-exhibit`    |
| `fetch-supplies`  | location | 体育用具室で予備資材を集める   | 成功すると `report-result` へ進む         |
| `move-exhibit`    | location | ホールで代替展示場所を確保する | 成功すると `report-result` へ進む         |
| `report-result`   | location | 職員室で対応結果を報告する     | 成功または失敗でイベントチェーンを完了する |

選択肢タスクは、イベントsnapshotの `currentTask.choices` に選択肢を公開する。
選択された選択肢は、`BranchEventManager.chooseCurrentTask(choiceId)` を通じて `BranchEvent.choose(choiceId, currentHours)` へ渡される。

## 責務境界

- このイベントは報酬を持たない。
- このイベント専用のDOM UIは作らない。
- 暫定DOM rendererは、snapshotから取得した汎用の選択肢ボタンだけを表示する。
