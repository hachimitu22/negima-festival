# MahoPayポイント収支一覧

<script setup>
import MahoPayTransactionTable from '../../.vitepress/components/MahoPayTransactionTable.vue'
</script>

## 文書情報

- 仕様状態: 確定
- 実装状況: 未実装

## 目的

MahoPayポイントを獲得する方法と使用する方法を一か所で確認できるようにする。

この一覧は中央の収支データから自動生成する。
条件やポイント数をこのページまたは個別仕様の本文へ重複して記述しない。

## 獲得

<MahoPayTransactionTable kind="earn" />

## 使用

<MahoPayTransactionTable
  kind="spend"
  empty-message="現在、定義済みの使用方法はありません。"
/>

## 共通ルール

残高、加算と減算、カシオペア使用時の扱いは[MahoPayポイント](MahoPayポイント.md)を正本とする。
