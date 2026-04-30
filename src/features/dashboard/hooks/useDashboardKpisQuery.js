import { useQuery } from '@tanstack/react-query'
import { getDashboardKpis } from '../api/getDashboardKpis'
import { dashboardKeys } from '../keys'

export function useDashboardKpisQuery({ enabled = true }) {
  return useQuery({
    queryKey: dashboardKeys.kpiSet({ scope: 'current-month' }),
    queryFn: getDashboardKpis,
    staleTime: 60 * 1000,
    enabled,
  })
}
