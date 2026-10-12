export const dashboardKeys = {
  all: ['dashboard'],
  monthlyStats: (params) => [...dashboardKeys.all, 'monthly-stats', params],
  categoryBreakdown: (params) => [...dashboardKeys.all, 'category-breakdown', params],
  topExpenses: (params) => [...dashboardKeys.all, 'top-expenses', params],
}
