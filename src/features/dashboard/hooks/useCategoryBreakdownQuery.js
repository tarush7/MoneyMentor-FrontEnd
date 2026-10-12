import { useQuery } from '@tanstack/react-query'
import { getCategoryBreakdown } from '../api/getCategoryBreakdown'
import { dashboardKeys } from '../keys'
import { getMonthWindow } from '../utils/getMonthWindow'

export function useCategoryBreakdownQuery({ monthKey, userId, enabled = true } = {}) {
  const { startDate, endDate } = getMonthWindow(monthKey)
  return useQuery({
    queryKey: dashboardKeys.categoryBreakdown({ userId, startDate, endDate }),
    queryFn: ({ signal }) => getCategoryBreakdown({ monthKey, signal }),
    staleTime: 60 * 1000,
    enabled,
  })
}
