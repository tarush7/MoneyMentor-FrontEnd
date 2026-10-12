import { useQuery } from '@tanstack/react-query'
import { getMonthlyStats } from '../api/getMonthlyStats'
import { dashboardKeys } from '../keys'
import { getMonthWindow } from '../utils/getMonthWindow'

export function useMonthlyStatsQuery({ monthKey, userId, enabled = true } = {}) {
  const { startDate, endDate } = getMonthWindow(monthKey)
  return useQuery({
    queryKey: dashboardKeys.monthlyStats({ userId, startDate, endDate }),
    queryFn: ({ signal }) => getMonthlyStats({ monthKey, signal }),
    staleTime: 60 * 1000,
    enabled,
  })
}
