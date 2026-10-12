import { useQuery } from '@tanstack/react-query'
import { getTopExpenses } from '../api/getTopExpenses'
import { dashboardKeys } from '../keys'
import { getMonthWindow } from '../utils/getMonthWindow'

export function useTopExpensesQuery({ monthKey, userId, limit = 5, enabled = true } = {}) {
  const { startDate, endDate } = getMonthWindow(monthKey)
  return useQuery({
    queryKey: dashboardKeys.topExpenses({ userId, startDate, endDate, limit }),
    queryFn: ({ signal }) => getTopExpenses({ monthKey, limit, signal }),
    staleTime: 60 * 1000,
    enabled,
  })
}
