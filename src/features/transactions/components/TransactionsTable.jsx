function formatAmount(value) {
  if (value == null) return '—'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDateTimeToIST(messageDatetimeUtc, parsedTxnDate) {
  if (messageDatetimeUtc) {
    const date = new Date(messageDatetimeUtc)

    const datePart = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date)

    const timePart = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date)

    return { date: datePart, time: `${timePart} IST` }
  }

  if (parsedTxnDate) {
    return { date: parsedTxnDate, time: '—' }
  }

  return { date: '—', time: '—' }
}

function getDirectionBadgeClass(direction) {
  if (direction === 'DEBIT') return 'badge badge-error badge-outline'
  if (direction === 'CREDIT') return 'badge badge-success badge-outline'
  return 'badge badge-ghost'
}

function getCategoryBadgeClass(category) {
  if (!category) return 'badge badge-warning badge-outline'
  return 'badge badge-info badge-outline'
}

export default function TransactionsTable({
  rows,
  isLoading,
  isError,
  error,
  pageSize,
  onReview,
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(13,16,34,0.72)_0%,rgba(6,8,18,0.74)_100%)] shadow-[0_28px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="table border-separate border-spacing-0 text-white">
          <thead>
            <tr className="bg-white/[0.035]">
              <th className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.52]">
                Date & Time
              </th>
              <th className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.52]">
                Merchant
              </th>
              <th className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.52]">
                Amount
              </th>
              <th className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.52]">
                Direction
              </th>
              <th className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.52]">
                Category
              </th>
              <th className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.52]">
                Review
              </th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, idx) => (
                <tr key={idx} className="transition-colors duration-200 even:bg-white/[0.015]">
                  <td className="border-b border-white/[0.08] px-6 py-4">
                    <div className="skeleton h-10 w-28 rounded-2xl bg-white/[0.08]" />
                  </td>
                  <td className="border-b border-white/[0.08] px-6 py-4">
                    <div className="skeleton h-10 w-40 rounded-2xl bg-white/[0.08]" />
                  </td>
                  <td className="border-b border-white/[0.08] px-6 py-4">
                    <div className="skeleton h-6 w-24 rounded-full bg-white/[0.08]" />
                  </td>
                  <td className="border-b border-white/[0.08] px-6 py-4">
                    <div className="skeleton h-6 w-20 rounded-full bg-white/[0.08]" />
                  </td>
                  <td className="border-b border-white/[0.08] px-6 py-4">
                    <div className="skeleton h-6 w-24 rounded-full bg-white/[0.08]" />
                  </td>
                  <td className="border-b border-white/[0.08] px-6 py-4">
                    <div className="skeleton h-8 w-20 rounded-2xl bg-white/[0.08]" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-sm text-rose-200">
                  {error?.message || 'Failed to load transactions'}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-sm text-white/60">
                  No transactions found.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const ist = formatDateTimeToIST(
                  row.messageDatetimeUtc,
                  row.parsedTxnDate
                )

                return (
                  <tr
                    key={row.id}
                    className="transition-colors duration-200 even:bg-white/[0.015] hover:bg-white/[0.04]"
                  >
                    <td className="border-b border-white/[0.08] px-6 py-4">
                      <div className="font-medium text-white/[0.92]">{ist.date}</div>
                      <div className="text-xs text-white/[0.52]">{ist.time}</div>
                    </td>

                    <td className="border-b border-white/[0.08] px-6 py-4">
                      <div className="font-medium text-white/[0.92]">{row.merchantDisplay}</div>
                      {row.upiPayeeName && row.upiVpa ? (
                        <div className="text-xs text-white/[0.52]">{row.upiVpa}</div>
                      ) : null}
                    </td>

                    <td className="border-b border-white/[0.08] px-6 py-4 font-medium text-white/[0.92]">
                      {formatAmount(row.amount)}
                    </td>

                    <td className="border-b border-white/[0.08] px-6 py-4">
                      <span className={getDirectionBadgeClass(row.direction)}>
                        {row.direction || 'UNKNOWN'}
                      </span>
                    </td>

                    <td className="border-b border-white/[0.08] px-6 py-4">
                      <span className={getCategoryBadgeClass(row.category)}>
                        {row.category || 'Unlabeled'}
                      </span>
                    </td>

                    <td className="border-b border-white/[0.08] px-6 py-4">
                      <button
                        className="btn btn-sm rounded-xl border-white/[0.15] bg-white/[0.06] text-white shadow-none transition-all duration-150 hover:border-white/[0.24] hover:bg-white/[0.1]"
                        onClick={() => onReview(row.id)}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
