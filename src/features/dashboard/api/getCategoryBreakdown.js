import { supabase } from '../../../supabase'
import { getCurrentMonthWindow } from '../utils/getCurrentMonthWindow'

export async function getCategoryBreakdown() {
  const { startDate, endDate, monthLabel } = getCurrentMonthWindow()

  console.log('Category breakdown date window:', {
    startDate,
    endDate,
    monthLabel,
  })

  const { data, error } = await supabase.rpc(
    'get_category_breakdown',
    {
      p_start_date: startDate,
      p_end_date: endDate,
    }
  )

  if (error) {
    console.error('Category breakdown Supabase error:', error)
    throw new Error(error.message)
  }

  console.log('Category breakdown RPC response:', data)

  const rows = Array.isArray(data)
    ? data.flatMap((item) =>
        Array.isArray(item?.get_category_breakdown)
          ? item.get_category_breakdown
          : [item]
      )
    : Array.isArray(data?.get_category_breakdown)
      ? data.get_category_breakdown
      : []

  const categories = rows.map((item) => ({
    category: item.category ?? 'Uncategorized',
    total: Number(item.total ?? 0),
    count: Number(item.count ?? 0),
    percentage: Number(item.percentage ?? 0),
  }))

  return {
    monthLabel,
    categories,
  }
}
