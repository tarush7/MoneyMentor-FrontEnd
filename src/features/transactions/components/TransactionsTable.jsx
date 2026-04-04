import {
  formatAmount,
  formatDateTimeToIST,
  getCategoryBadgeClass,
} from '../utils/formatters'

function AmountDirectionIcon({ direction }) {
  const isDebit = direction === 'DEBIT'
  const isCredit = direction === 'CREDIT'

  const toneClass = isDebit
    ? 'border-rose-400/25 bg-rose-400/10 text-rose-300'
    : isCredit
      ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
      : 'border-white/[0.12] bg-white/[0.04] text-white/[0.72]'

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${toneClass}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 20 20"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        {isDebit ? (
          <path
            d="M6 14 14 6M8 6h6v6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : isCredit ? (
          <path
            d="M14 6 6 14M6 8v6h6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path d="M6 10h8" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </div>
  )
}

function getAmountMeta(direction) {
  if (direction === 'DEBIT') {
    return {
      amountClass: 'text-rose-200',
      label: 'OUTGOING',
    }
  }

  if (direction === 'CREDIT') {
    return {
      amountClass: 'text-emerald-200',
      label: 'INCOMING',
    }
  }

  return {
    amountClass: 'text-white/[0.9]',
    label: 'UNKNOWN',
  }
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
                Category
              </th>
              <th className="border-b border-white/10 px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.52]">
                Action
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
                    <div className="flex items-center gap-3">
                      <div className="skeleton h-10 w-10 rounded-2xl bg-white/[0.08]" />
                      <div className="space-y-2">
                        <div className="skeleton h-5 w-24 rounded-full bg-white/[0.08]" />
                        <div className="skeleton h-3 w-20 rounded-full bg-white/[0.08]" />
                      </div>
                    </div>
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
                <td colSpan="5" className="px-6 py-10 text-center text-sm text-rose-200">
                  {error?.message || 'Failed to load transactions'}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-sm text-white/60">
                  No transactions found.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const ist = formatDateTimeToIST(
                  row.messageDatetimeUtc,
                  row.parsedTxnDate
                )
                const amountMeta = getAmountMeta(row.direction)

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

                    <td className="border-b border-white/[0.08] px-6 py-4">
                      <div className="flex items-center gap-3">
                        <AmountDirectionIcon direction={row.direction} />

                        <div>
                          <div
                            className={`text-base font-semibold ${amountMeta.amountClass}`}
                          >
                            {formatAmount(row.amount)}
                          </div>
                          <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                            {amountMeta.label}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="border-b border-white/[0.08] px-6 py-4">
                      <span className={getCategoryBadgeClass(row.category)}>
                        {row.category || 'Unlabeled'}
                      </span>
                    </td>

                    <td className="border-b border-white/[0.08] px-6 py-4">
                      <button
                        className="btn btn-sm rounded-xl p-2 border-white/[0.15] bg-white/[0.06] text-white shadow-none transition-all duration-150 hover:border-white/[0.24] hover:bg-white/[0.1]"
                        onClick={() => onReview(row.id)}
                      >
                        Manage
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
