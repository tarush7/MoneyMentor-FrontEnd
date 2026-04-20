import {
  formatAmount,
  formatDateTimeToIST,
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

function CategoryTagIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M10.75 4H5.9a1.9 1.9 0 0 0-1.9 1.9v4.85a1.9 1.9 0 0 0 .56 1.34l3.35 3.35a1.9 1.9 0 0 0 2.69 0l4.84-4.84a1.9 1.9 0 0 0 0-2.69L12.1 4.56A1.9 1.9 0 0 0 10.75 4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.35 7.35h.01" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CategoryPill({ category, onClick, disabled = false }) {
  if (!category) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || !onClick}
        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
          disabled || !onClick
            ? 'cursor-not-allowed border-white/10 bg-white/[0.04] text-white/40'
            : 'border-amber-300/20 bg-amber-300/10 text-amber-300 hover:border-amber-300/35 hover:bg-amber-300/15'
        }`}
      >
        <CategoryTagIcon />
        Add category
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
        disabled || !onClick
          ? 'cursor-not-allowed border-white/10 bg-white/[0.04] text-white/45'
          : 'border-white/10 bg-white/5 text-white/90 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-emerald-300" />
      {category}
    </button>
  )
}

export default function TransactionsTable({
  rows,
  isLoading,
  isError,
  error,
  pageSize,
  isReadOnly = false,
  onCategorize,
  onManage,
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
                    <div className="skeleton h-9 w-32 rounded-full bg-white/[0.08]" />
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
                      <CategoryPill
                        category={row.category}
                        disabled={isReadOnly}
                        onClick={
                          onCategorize ? () => onCategorize(row.id) : undefined
                        }
                      />
                    </td>

                    <td className="border-b border-white/[0.08] px-6 py-4">
                      <button
                        type="button"
                        disabled={!onManage}
                        className="btn btn-sm rounded-xl p-2 border-white/[0.15] bg-white/[0.06] text-white shadow-none transition-all duration-150 hover:border-white/[0.24] hover:bg-white/[0.1]"
                        onClick={() => onManage?.(row.id)}
                      >
                        {isReadOnly ? 'View' : 'Manage'}
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
