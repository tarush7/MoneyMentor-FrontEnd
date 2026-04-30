export const dashboardKeys = {
  all: ['dashboard'],
  kpis: () => [...dashboardKeys.all, 'kpis'],
  kpiSet: (params) => [...dashboardKeys.kpis(), params],
}
