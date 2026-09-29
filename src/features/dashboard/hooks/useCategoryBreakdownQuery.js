import { useQuery } from '@tanstack/react-query'
import { getCategoryBreakdown } from '../api/getCategoryBreakdown'
import { dashboardKeys } from '../keys'

export function useCategoryBreakdownQuery({ enabled = true } = {}) {
  return useQuery({
    queryKey: dashboardKeys.categoryBreakdown({ scope: 'current-month' }),
    queryFn: getCategoryBreakdown,
    staleTime: 60 * 1000,
    enabled,
  })
}
