import { useQuery } from '@tanstack/react-query'
import { getTopExpenses } from '../api/getTopExpenses'
import { dashboardKeys } from '../keys'

export function useTopExpensesQuery({ limit = 5, enabled = true } = {}) {
  return useQuery({
    queryKey: dashboardKeys.topExpenses({ scope: 'current-month', limit }),
    queryFn: () => getTopExpenses(limit),
    staleTime: 60 * 1000,
    enabled,
  })
}
