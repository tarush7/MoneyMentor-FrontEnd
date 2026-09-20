import { supabase } from '../../../supabase'
import { getCurrentMonthWindow } from '../utils/getCurrentMonthWindow'

function sumAmounts(rows) {
  return rows.reduce(
    (total, row) => total + Number(row.expense_amount ?? 0),
    0
  )
}

// export async function getDashboardKpis() {
//   const { startDate, endDate, monthLabel } = getCurrentMonthWindow()

//   const { data, error } = await supabase
//     .from('analytics_expenses_v2')
//     .select('expense_amount')
//     .gte('expense_date', startDate)
//     .lt('expense_date', endDate)

//   if (error) {
//     throw new Error(error.message)
//   }

//   const expenseRows = data ?? []

//   return {
//     monthLabel,
//     expenseRowCount: expenseRows.length,
//     totalSpendThisMonth: sumAmounts(expenseRows),
//   }
// }


export async function getDashboardKpis() {
  const { startDate, endDate, monthLabel } = getCurrentMonthWindow()

  console.log('Dashboard date window:', {
    startDate,
    endDate,
    monthLabel,
  })

  const { data, error } = await supabase
    .from('analytics_expenses_v2')
    .select('expense_date, expense_amount')
    .gte('expense_date', startDate)
    .lt('expense_date', endDate)

  if (error) {
    console.error('Dashboard Supabase error:', error)
    throw new Error(error.message)
  }

  console.log('Dashboard rows from Supabase:', data)
  console.log('Dashboard row count:', data?.length)

  console.log(
    'Dashboard total:',
    (data ?? []).reduce(
      (total, row) => total + Number(row.expense_amount ?? 0),
      0
    )
  )

  const expenseRows = data ?? []

  return {
    monthLabel,
    expenseRowCount: expenseRows.length,
    totalSpendThisMonth: sumAmounts(expenseRows),
  }
}