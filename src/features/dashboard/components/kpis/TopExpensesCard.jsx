const amountFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

function formatExpenseDate(value) {
  if (!value) return 'Date unavailable'

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function CardMessage({ children, toneClassName = 'text-white/55' }) {
  return (
    <div className={`flex min-h-[260px] items-center justify-center rounded-[22px] border border-white/8 bg-white/[0.03] px-5 text-center text-sm ${toneClassName}`}>
      {children}
    </div>
  )
}

export default function TopExpensesCard({
  isAuthReady,
  isAuthenticated,
  topExpensesQuery,
  monthLabel = 'Selected month',
}) {
  let content

  if (!isAuthReady) {
    content = <CardMessage>Preparing your dashboard session</CardMessage>
  } else if (!isAuthenticated) {
    content = <CardMessage>Sign in to see your top expenses</CardMessage>
  } else if (topExpensesQuery.isPending) {
    content = <CardMessage>Loading top expenses...</CardMessage>
  } else if (topExpensesQuery.isError) {
    content = <CardMessage toneClassName="text-rose-200">Unable to load top expenses right now</CardMessage>
  } else if (topExpensesQuery.data.length === 0) {
    content = <CardMessage>No expenses recorded for this period</CardMessage>
  } else {
    content = (
      <ol className="space-y-2" aria-label={`Top expenses for ${monthLabel}`}>
        {topExpensesQuery.data.map((expense, index) => (
          <li
            key={expense.transactionId ?? `${expense.date}-${index}`}
            className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-2 rounded-[18px] border border-white/[0.06] bg-white/[0.03] px-3 py-3 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4 sm:px-4"
          >
            <span className="row-span-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-200/[0.08] text-xs font-semibold text-cyan-100/80 sm:row-span-1">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium leading-5 text-white/90">
                {expense.merchant}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {expense.category} · {formatExpenseDate(expense.date)}
              </p>
            </div>
            <span className="col-start-2 whitespace-nowrap text-sm font-semibold text-white sm:col-start-3 sm:text-right">
              {amountFormatter.format(expense.amount)}
            </span>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <section className="h-full min-w-0 rounded-[28px] bg-[linear-gradient(180deg,rgba(13,16,34,0.72)_0%,rgba(6,8,18,0.74)_100%)] p-5 shadow-[0_24px_54px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7">
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight text-white">Top Expenses</h2>
            <p className="text-sm leading-6 text-white/45">Largest expenses for {monthLabel}</p>
          </div>
          <span className="rounded-full border border-cyan-200/10 bg-cyan-200/[0.06] px-3 py-1 text-xs font-medium text-cyan-100/75">
            Top 5
          </span>
        </div>
        {content}
      </div>
    </section>
  )
}
