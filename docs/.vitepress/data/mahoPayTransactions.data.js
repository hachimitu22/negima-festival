import { existsSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const MAHO_PAY_TRANSACTION_KINDS = new Set(['earn', 'spend'])
const MAHO_PAY_TRANSACTION_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const DOCS_ROOT = fileURLToPath(new URL('../../', import.meta.url))

const transactions = [
  {
    id: 'patrol-completion',
    kind: 'earn',
    title: '見回りイベント',
    condition: '見回りイベントの成功',
    points: {
      display: '見回り先1地点につき100ポイント',
      min: 100,
      max: 300,
    },
    sourceHref: '/基本設計/イベント/見回りイベント',
    note: '最後の見回り先で一括付与',
  },
  {
    id: 'confession-prevention',
    kind: 'earn',
    title: '告白阻止',
    condition: '世界樹周辺の魔力スポットで告白阻止に成功',
    points: {
      display: '1件につき100ポイント',
      min: 100,
      max: 100,
    },
    sourceHref: '/基本設計/構想整理/教師仕事',
    note: '仮額。正式な報酬額は今後調整する。',
  },
]

function validateMahoPayTransactions(values) {
  if (!Array.isArray(values)) {
    throw new TypeError('MahoPay transactions must be an array.')
  }

  const ids = new Set()
  values.forEach((transaction, index) => {
    const label = `MahoPay transaction at index ${index}`
    if (!transaction || typeof transaction !== 'object') {
      throw new TypeError(`${label} must be an object.`)
    }

    if (
      typeof transaction.id !== 'string'
      || !MAHO_PAY_TRANSACTION_ID_PATTERN.test(transaction.id)
    ) {
      throw new TypeError(`${label} must have a kebab-case id.`)
    }
    if (ids.has(transaction.id)) {
      throw new Error(`Duplicate MahoPay transaction id: ${transaction.id}`)
    }
    ids.add(transaction.id)

    if (!MAHO_PAY_TRANSACTION_KINDS.has(transaction.kind)) {
      throw new TypeError(
        `MahoPay transaction "${transaction.id}" must use kind "earn" or "spend".`,
      )
    }

    validateRequiredText(transaction.title, transaction.id, 'title')
    validateRequiredText(transaction.condition, transaction.id, 'condition')
    validateRequiredText(transaction.sourceHref, transaction.id, 'sourceHref')
    validateOptionalText(transaction.note, transaction.id, 'note')
    validatePoints(transaction.points, transaction.id)
    validateSourceHref(transaction.sourceHref, transaction.id)
  })

  return values
}

function validatePoints(points, transactionId) {
  if (!points || typeof points !== 'object') {
    throw new TypeError(
      `MahoPay transaction "${transactionId}" must have points.`,
    )
  }

  validateRequiredText(points.display, transactionId, 'points.display')
  if (!Number.isInteger(points.min) || points.min < 0) {
    throw new TypeError(
      `MahoPay transaction "${transactionId}" must have a non-negative integer points.min.`,
    )
  }
  if (!Number.isInteger(points.max) || points.max < 0) {
    throw new TypeError(
      `MahoPay transaction "${transactionId}" must have a non-negative integer points.max.`,
    )
  }
  if (points.min > points.max) {
    throw new RangeError(
      `MahoPay transaction "${transactionId}" must not have points.min greater than points.max.`,
    )
  }
}

function validateRequiredText(value, transactionId, fieldName) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(
      `MahoPay transaction "${transactionId}" must have ${fieldName}.`,
    )
  }
}

function validateOptionalText(value, transactionId, fieldName) {
  if (
    value !== undefined
    && (typeof value !== 'string' || value.trim().length === 0)
  ) {
    throw new TypeError(
      `MahoPay transaction "${transactionId}" must have non-empty ${fieldName} when provided.`,
    )
  }
}

function validateSourceHref(sourceHref, transactionId) {
  if (
    !sourceHref.startsWith('/')
    || sourceHref.includes('#')
    || sourceHref.includes('?')
  ) {
    throw new TypeError(
      `MahoPay transaction "${transactionId}" must have an absolute internal sourceHref without a query or hash.`,
    )
  }

  const sourcePath = resolve(DOCS_ROOT, `.${sourceHref}.md`)
  const relativeSourcePath = relative(DOCS_ROOT, sourcePath)
  if (
    relativeSourcePath.startsWith('..')
    || isAbsolute(relativeSourcePath)
    || !existsSync(sourcePath)
  ) {
    throw new Error(
      `MahoPay transaction "${transactionId}" source does not exist: ${sourceHref}`,
    )
  }
}

export {
  validateMahoPayTransactions,
}

export default {
  load() {
    return validateMahoPayTransactions(transactions)
  },
}
