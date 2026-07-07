# BranchEvent（分岐イベント）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/event/branchEvent.js`

## 目的

`BranchTask`の成功または失敗に応じて次のタスクを生成し、複数段の分岐チェーンを進行する。
イベント自体は報酬を扱わず、現在タスク、進行段階、直前結果、renderer向けsnapshotを管理する。

## タスク定義

constructorには、イベント種別、表示名、開始タスクID、タスク定義配列を渡す。

```js
{
  id,
  title,
  destination: { id, name },
  durationHours,
  branches: {
    succeeded: nextTaskId,
    failed: nextTaskId,
  },
}
```

`branches`を省略、または分岐先を`null`にした結果で現在タスクが解決した場合、チェーンは完了する。
未知の分岐先ID、重複ID、循環参照は生成時に拒否する。

## 公開契約

```js
class BranchEvent {
  constructor(id, { type, name, tasks, startTaskId, startHours })
  visitLocation(locationId, currentHours)
  advanceTo(currentHours)
  isExecuting()
  isCompleted()
  getSnapshot(currentHours)
}
```

### 状態遷移

- `visitLocation`で現在タスクが成功すると、`branches.succeeded`の次タスクを同じ`currentHours`から開始する。
- `advanceTo`で現在タスクが失敗すると、`branches.failed`の次タスクを同じ`currentHours`から開始する。
- 分岐先がない場合は`completed`へ遷移し、現在タスクを破棄する。

## snapshot

```js
{
  id,
  type,
  name,
  description,
  state: 'executing' | 'completed',
  stepIndex,
  stepCount,
  currentTask,
  lastResult,
}
```

`currentTask`は現在タスクの`id`、`title`、`BranchTask` snapshotを含む。
`stepIndex`は完了済みタスク数、`stepCount`は開始タスクから到達可能な最大段数を表す。
`type`と`name`を省略した場合は、汎用の分岐イベント表示を使用する。
