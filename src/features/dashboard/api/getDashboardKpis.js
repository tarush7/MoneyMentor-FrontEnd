import { supabase } from '../../../supabase'
import { getCurrentMonthWindow } from '../utils/getCurrentMonthWindow'



export async function getDashboardKpis() {
  const { startDate, endDate, monthLabel } = getCurrentMonthWindow()

  console.log('Dashboard date window:', {
    startDate,
    endDate,
    monthLabel,
  })

  const { data, error } = await supabase.rpc(
    'get_monthly_stats',
    {
      p_start_date: startDate,
      p_end_date: endDate,
    }
  )

  if (error) {
    console.error('Dashboard Supabase error:', error)
    throw new Error(error.message)
  }

  console.log('Dashboard KPI RPC response:', data)


  return {
    monthLabel,
    expenseRowCount: Number(
      data?.expense_row_count ?? 0
    ),

    totalSpendThisMonth: Number(
      data?.total_spend ?? 0
    ),

    averageExpense: Number(
      data?.average_expense ?? 0
    ),
  }
}