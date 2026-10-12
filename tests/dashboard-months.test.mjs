import test from 'node:test'
import assert from 'node:assert/strict'
import { getMonthWindow } from '../src/features/dashboard/utils/getMonthWindow.js'
import { dashboardKeys } from '../src/features/dashboard/keys.js'
import { build } from 'esbuild'
import { fileURLToPath } from 'node:url'

const today = new Date(2026, 9, 13)

test('current month retains month-to-date boundaries', () => {
  const range = getMonthWindow(undefined, today)
  assert.equal(range.monthKey, '2026-10')
  assert.equal(range.startDate, '2026-10-01')
  assert.equal(range.endDate, '2026-10-14')
  assert.equal(range.monthLabel, 'October 2026')
})

test('historical months use the next month as their exclusive end date', () => {
  const range = getMonthWindow('2026-09', today)
  assert.equal(range.startDate, '2026-09-01')
  assert.equal(range.endDate, '2026-10-01')
})

test('December and leap-year February boundaries stay correct', () => {
  assert.equal(getMonthWindow('2025-12', today).endDate, '2026-01-01')
  assert.equal(getMonthWindow('2024-02', today).endDate, '2024-03-01')
  assert.equal(getMonthWindow('2025-02', today).endDate, '2025-03-01')
})

test('month-to-date at the end of a year rolls into January', () => {
  assert.equal(getMonthWindow('2026-12', new Date(2026, 11, 31)).endDate, '2027-01-01')
})

test('invalid month values are rejected before calling Supabase', () => {
  for (const month of ['2026-00', '2026-13', '2026-1', 'not-a-month']) {
    assert.throws(() => getMonthWindow(month, today), /Invalid dashboard month/)
  }
})

test('query caches separate both months and authenticated users', () => {
  const period = { userId: 'user-a', startDate: '2026-09-01', endDate: '2026-10-01' }
  for (const key of [dashboardKeys.monthlyStats, dashboardKeys.categoryBreakdown, dashboardKeys.topExpenses]) {
    assert.notDeepEqual(key(period), key({ ...period, startDate: '2026-08-01', endDate: '2026-09-01' }))
    assert.notDeepEqual(key(period), key({ ...period, userId: 'user-b' }))
  }
})

test('all KPI APIs send the selected period and cancellation signal to their RPC', async (context) => {
  const calls = []
  const signal = new AbortController().signal
  const responses = {
    get_monthly_stats: { total_spend: '1000', expense_row_count: '2', average_expense: '500' },
    get_category_breakdown: [{ category: 'Food', total: '1000', count: '2', percentage: '100' }],
    get_top_expenses: [{ transaction_id: 'fixture-expense', date: '2026-09-10', amount: '600', merchant: 'Fixture merchant', category: 'Food' }],
  }
  globalThis.__dashboardRpcFixture = {
    rpc(name, params) {
      const call = { name, params }
      calls.push(call)
      return {
        abortSignal(value) {
          call.signal = value
          return Promise.resolve({ data: responses[name], error: null })
        },
      }
    },
  }
  context.after(() => { delete globalThis.__dashboardRpcFixture })
  const bundle = await build({
    stdin: {
      contents: `export { getMonthlyStats } from './src/features/dashboard/api/getMonthlyStats.js';
        export { getCategoryBreakdown } from './src/features/dashboard/api/getCategoryBreakdown.js';
        export { getTopExpenses } from './src/features/dashboard/api/getTopExpenses.js';`,
      resolveDir: fileURLToPath(new URL('../', import.meta.url)),
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    plugins: [{
      name: 'supabase-fixture',
      setup(builder) {
        builder.onResolve({ filter: /\/supabase$/ }, () => ({ path: 'fixture', namespace: 'test' }))
        builder.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export const supabase = globalThis.__dashboardRpcFixture' }))
      },
    }],
  })
  const api = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`)
  const monthly = await api.getMonthlyStats({ monthKey: '2026-09', signal })
  const categories = await api.getCategoryBreakdown({ monthKey: '2026-09', signal })
  const expenses = await api.getTopExpenses({ monthKey: '2026-09', limit: 5, signal })
  assert.equal(calls.length, 3)
  for (const call of calls) {
    assert.equal(call.params.p_start_date, '2026-09-01')
    assert.equal(call.params.p_end_date, '2026-10-01')
    assert.equal(call.signal, signal)
  }
  assert.equal(calls[2].params.p_limit_count, 5)
  assert.equal(monthly.totalSpend, 1000)
  assert.equal(monthly.monthLabel, 'September 2026')
  assert.equal(categories.categories[0].total, 1000)
  assert.equal(expenses[0].amount, 600)
})
