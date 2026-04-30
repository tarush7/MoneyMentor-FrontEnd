import DashboardKpiCard from './DashboardKpiCard'
import { formatInrAmount } from '../../utils/formatters'

export default function TotalSpendThisMonthCard({
  isAuthReady,
  isAuthenticated,
  kpisQuery,
}) {
  if (!isAuthReady) {
    return (
      <DashboardKpiCard
        title="Total Spend This Month"
        subtitle="Current month expense total"
        value="Checking..."
        meta="Preparing your dashboard session"
        toneClassName="text-cyan-100"
        className="min-h-[148px]"
      />
    )
  }

  if (!isAuthenticated) {
    return (
      <DashboardKpiCard
        title="Total Spend This Month"
        subtitle="Current month expense total"
        value="Sign in"
        meta="Authentication is required to load dashboard data"
        toneClassName="text-white/90"
        className="min-h-[148px]"
      />
    )
  }

  if (kpisQuery.isPending) {
    return (
      <DashboardKpiCard
        title="Total Spend This Month"
        subtitle="Current month expense total"
        value="Loading..."
        meta="Reading current-month rows from analytics_expenses"
        toneClassName="text-cyan-100"
        className="min-h-[148px]"
      />
    )
  }

  if (kpisQuery.isError) {
    return (
      <DashboardKpiCard
        title="Total Spend This Month"
        subtitle="Current month expense total"
        value="Unavailable"
        meta="Unable to load expense data right now"
        toneClassName="text-rose-200"
        className="min-h-[148px]"
      />
    )
  }

  const totalSpend = kpisQuery.data?.totalSpendThisMonth ?? 0
  const monthLabel = kpisQuery.data?.monthLabel ?? 'Current month'
  const expenseRowCount = kpisQuery.data?.expenseRowCount ?? 0

  return (
    <DashboardKpiCard
      title="Total Spend This Month"
      subtitle="Current month expense total"
      value={formatInrAmount(totalSpend)}
      meta={`${monthLabel} • ${expenseRowCount} expense rows`}
      toneClassName="text-white"
      className="min-h-[148px]"
    />
  )
}
