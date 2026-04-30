import { supabase } from '../../../supabase'
import { getCurrentMonthWindow } from '../utils/getCurrentMonthWindow'

function sumAmounts(rows) {
  return rows.reduce((total, row) => total + Number(row.parsed_amount ?? 0), 0)
}

export async function getDashboardKpis() {
  const { startDate, endDate, monthLabel } = getCurrentMonthWindow()

  const { data, error } = await supabase
    .from('analytics_expenses')
    .select(
      `
        parsed_amount
      `
    )
    .gte('parsed_txn_date', startDate)
    .lte('parsed_txn_date', endDate)

  if (error) {
    throw new Error(error.message)
  }

  const expenseRows = data ?? []

  return {
    monthLabel,
    expenseRowCount: expenseRows.length,
    totalSpendThisMonth: sumAmounts(expenseRows),
  }
}
