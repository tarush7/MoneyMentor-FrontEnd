import { supabase } from '../../../supabase'
import { getMonthWindow } from '../utils/getMonthWindow'



export async function getMonthlyStats({ monthKey, signal } = {}) {
  const { startDate, endDate, monthLabel } = getMonthWindow(monthKey)

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
  ).abortSignal(signal)

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

    totalSpend: Number(
      data?.total_spend ?? 0
    ),

    averageExpense: Number(
      data?.average_expense ?? 0
    ),
  }
}
