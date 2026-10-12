import DashboardKpiCard from './DashboardKpiCard'
import { formatInrAmount } from '../../utils/formatters'

export default function BiggestExpenseThisMonthCard({
  isAuthReady,
  isAuthenticated,
  topExpensesQuery,
  monthLabel = 'Selected month',
}) {
  let value = 'Loading...'
  let meta = 'Finding your largest expense'
  let toneClassName = 'text-cyan-100'

  if (!isAuthReady) {
    value = 'Checking...'
    meta = 'Preparing your dashboard session'
  } else if (!isAuthenticated) {
    value = 'Sign in'
    meta = 'Authentication is required to load dashboard data'
    toneClassName = 'text-white/90'
  } else if (topExpensesQuery.isError) {
    value = 'Unavailable'
    meta = 'Unable to load expense data right now'
    toneClassName = 'text-rose-200'
  } else if (topExpensesQuery.isSuccess) {
    const biggestExpense = topExpensesQuery.data[0]
    value = biggestExpense ? formatInrAmount(biggestExpense.amount) : 'No expenses'
    meta = biggestExpense?.merchant ?? 'No expenses recorded for this period'
    toneClassName = 'text-white'
  }

  return (
    <DashboardKpiCard
      title="Biggest Expense"
      subtitle={`Largest single expense · ${monthLabel}`}
      value={value}
      meta={meta}
      toneClassName={toneClassName}
      className="min-h-[148px]"
    />
  )
}
