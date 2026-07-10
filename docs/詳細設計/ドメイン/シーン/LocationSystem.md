# LocationSystem（場所System）

## 文書情報

- 設計状態: 確定
- 対象: `src/gameDomain/mainGameScene/locationSystem.js`
- 関連: [MainGameScene](MainGameScene.md)、[CharacterSystem](CharacterSystem.md)

## 目的

位置を持つSystemの空間状態versionを監視し、場所訪問をGameplay requestへ変換する。
初期実装では`CharacterSystem`が記録した主人公の訪問場所IDを消費し、`EventSystem`へ通知する。

場所定義、経路探索、キャラクター移動そのものは扱わない。

## 公開契約

```js
class LocationSystem {
  constructor({ visitSources, locationRequests })
  update({ subjects, spatialVersions })
}
```

### constructor

`visitSources`は空間状態versionのkeyごとに訪問IDを返す関数を持つ。

```js
{
  characters: () => characterSystem.consumeVisitedPlayerLocationIds(),
}
```

`locationRequests.visitLocations(locationIds)`は、重複排除済みの訪問場所ID配列を受け取る。

### update

`spatialVersions`を前回値と比較する。
versionが変わったkeyだけ対応する`visitSources[key]()`を呼び、返された場所IDを重複排除して`locationRequests.visitLocations()`へ渡す。

```js
locationSystem.update({
  subjects: characterSystem.getSpatialSubjects(),
  spatialVersions: {
    characters: characterSystem.getSpatialStateVersion(),
  },
});
```

戻り値は次の形とする。

```js
{
  changedSpatialKeys,
  visitedLocationIds,
}
```

`subjects`は初期実装では訪問判定に使わないが、将来の進入、退出、滞在判定の入力として受け取る。

## MainGameSceneとの境界

`MainGameScene`は`CharacterSystem.update()`後に`LocationSystem.update()`を呼ぶ。
`MainGameScene`は`consumeVisitedPlayerLocationIds()`の結果を直接`EventSystem`へ渡さない。

`LocationSystem`は`EventSystem`へ直接依存せず、`locationRequests` adapterを通して場所訪問を通知する。

## 将来拡張

WorldObjectが移動するようになった場合は、`spatialVersions.worldObjects`と`visitSources.worldObjects`を追加する。
単一の`CharacterSystem` versionをscene全体のversionとして扱わない。
