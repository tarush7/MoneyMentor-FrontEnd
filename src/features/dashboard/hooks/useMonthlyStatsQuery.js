import { useQuery } from '@tanstack/react-query'
import { getMonthlyStats } from '../api/getMonthlyStats'
import { dashboardKeys } from '../keys'

export function useMonthlyStatsQuery({ enabled = true }) {
  return useQuery({
    queryKey: dashboardKeys.monthlyStats({ scope: 'current-month' }),
    queryFn: getMonthlyStats,
    staleTime: 60 * 1000,
    enabled,
  })
}
