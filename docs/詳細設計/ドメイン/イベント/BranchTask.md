# BranchTask（分岐タスク）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/event/branchTask.js`

## 目的

時間制限付きで目的地への到達を判定する、分岐イベント用の最小タスクを表す。
会話や報酬は扱わず、場所訪問と期限到達による成功・失敗だけを管理する。

## 所有する状態

- `destination`: 到達対象の場所。`id`と`name`のみ保持する。
- `startHours`: タスク開始時刻。
- `durationHours`: 制限時間。
- `deadlineHours`: `startHours + durationHours`。
- `state`: `executing`、`succeeded`、`failed`。

## 公開契約

```js
class BranchTask {
  constructor({ destination, startHours, durationHours })
  visitLocation(locationId, currentHours)
  advanceTo(currentHours)
  isExecuting()
  isSucceeded()
  isFailed()
  getSnapshot(currentHours)
}
```

### visitLocation

`currentHours`が期限前で、かつ`locationId`が目的地と一致した場合だけ`succeeded`へ遷移して`true`を返す。
期限到達後、完了後、目的地以外の訪問では状態を変更せず`false`を返す。

### advanceTo

`currentHours`が`deadlineHours`以上に到達した場合、`failed`へ遷移して`true`を返す。
期限前、または完了済みの場合は`false`を返す。

## snapshot

```js
{
  destination: { id, name },
  state,
  startHours,
  durationHours,
  deadlineHours,
  remainingHours,
}
```

snapshotは内部オブジェクトを直接公開しない。
