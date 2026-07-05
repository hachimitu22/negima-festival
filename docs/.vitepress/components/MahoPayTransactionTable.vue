<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as transactions } from '../data/mahoPayTransactions.data.js'

const props = defineProps({
  kind: {
    type: String,
    default: null,
  },
  ids: {
    type: Array,
    default: null,
  },
  showSource: {
    type: Boolean,
    default: true,
  },
  emptyMessage: {
    type: String,
    default: '現在、定義済みの収支はありません。',
  },
})

const selectedTransactions = computed(() => {
  if (props.kind !== null && !['earn', 'spend'].includes(props.kind)) {
    throw new TypeError(`Unknown MahoPay transaction kind: ${props.kind}`)
  }

  let selected = transactions
  if (props.ids !== null) {
    const requestedIds = new Set()
    selected = props.ids.map(id => {
      if (requestedIds.has(id)) {
        throw new Error(`Duplicate requested MahoPay transaction id: ${id}`)
      }
      requestedIds.add(id)

      const transaction = transactions.find(candidate => candidate.id === id)
      if (!transaction) {
        throw new Error(`Unknown MahoPay transaction id: ${id}`)
      }
      return transaction
    })
  }

  return props.kind === null
    ? selected
    : selected.filter(transaction => transaction.kind === props.kind)
})

function formatPointRange(points) {
  return points.min === points.max
    ? `${points.min}ポイント`
    : `${points.min}〜${points.max}ポイント`
}
</script>

<template>
  <table v-if="selectedTransactions.length > 0">
    <thead>
      <tr>
        <th>項目</th>
        <th>条件</th>
        <th>ポイント</th>
        <th>備考</th>
        <th v-if="showSource">仕様</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="transaction in selectedTransactions"
        :key="transaction.id"
      >
        <td>{{ transaction.title }}</td>
        <td>{{ transaction.condition }}</td>
        <td>
          {{ transaction.points.display }}
          <small>（{{ formatPointRange(transaction.points) }}）</small>
        </td>
        <td>{{ transaction.note ?? 'なし' }}</td>
        <td v-if="showSource">
          <a :href="withBase(transaction.sourceHref)">{{ transaction.title }}</a>
        </td>
      </tr>
    </tbody>
  </table>
  <p v-else>{{ emptyMessage }}</p>
</template>
