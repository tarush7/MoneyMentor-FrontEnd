import { supabase } from '../../../supabase'
import { getCurrentMonthWindow } from '../utils/getCurrentMonthWindow'

export async function getTopExpenses(limit = 5) {
  const { startDate, endDate } = getCurrentMonthWindow()

  const { data, error } = await supabase.rpc('get_top_expenses', {
    p_start_date: startDate,
    p_end_date: endDate,
    p_limit_count: limit,
  })

  if (error) {
    console.error('Top expenses RPC error:', error)
    throw new Error(error.message)
  }

  const rows = Array.isArray(data)
    ? data.flatMap((item) =>
        Array.isArray(item?.get_top_expenses)
          ? item.get_top_expenses
          : item?.transaction_id
            ? [item]
            : []
      )
    : Array.isArray(data?.get_top_expenses)
      ? data.get_top_expenses
      : []

  return rows
    .map((item) => ({
      transactionId: item.transaction_id,
      date: item.date,
      merchant: item.merchant ?? 'Unknown',
      amount: Number(item.amount ?? 0),
      category: item.category ?? 'Uncategorized',
    }))
    .sort((first, second) => second.amount - first.amount)
    .slice(0, limit)
}
