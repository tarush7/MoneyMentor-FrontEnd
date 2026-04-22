import { formatAmount, formatDateTimeToIST } from '../utils/formatters'

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

function CategoryPill({ category, onClick, disabled = false, className = '' }) {
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
        } ${className}`}
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
      } ${className}`}
    >
      <span className="h-2 w-2 rounded-full bg-emerald-300" />
      {category}
    </button>
  )
}

function ActionButton({ isReadOnly, onManage, rowId, className = '' }) {
  return (
    <button
      type="button"
      disabled={!onManage}
      className={`btn btn-sm rounded-xl border-white/[0.15] bg-white/[0.06] text-white shadow-none transition-all duration-150 hover:border-white/[0.24] hover:bg-white/[0.1] ${className}`}
      onClick={() => onManage?.(rowId)}
    >
      {isReadOnly ? 'View' : 'Manage'}
    </button>
  )
}

function MobileStatePanel({ children, tone = 'default' }) {
  const toneClass =
    tone === 'error'
      ? 'border-rose-300/15 bg-rose-300/10 text-rose-100'
      : 'border-white/[0.08] bg-white/[0.03] text-white/[0.64]'

  return (
    <div className={`rounded-[1.35rem] border px-4 py-6 text-sm ${toneClass}`}>
      {children}
    </div>
  )
}

function MobileLoadingCards({ count }) {
  return Array.from({ length: count }).map((_, idx) => (
    <div
      key={idx}
      className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="skeleton h-5 w-36 rounded-full bg-white/[0.08]" />
          <div className="mt-2 skeleton h-4 w-28 rounded-full bg-white/[0.08]" />
        </div>
        <div className="skeleton h-10 w-24 rounded-2xl bg-white/[0.08]" />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="skeleton h-10 w-10 rounded-2xl bg-white/[0.08]" />
        <div className="space-y-2">
          <div className="skeleton h-5 w-24 rounded-full bg-white/[0.08]" />
          <div className="skeleton h-3 w-20 rounded-full bg-white/[0.08]" />
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="skeleton h-10 w-full rounded-2xl bg-white/[0.08]" />
        <div className="skeleton h-10 w-full rounded-2xl bg-white/[0.08]" />
      </div>
    </div>
  ))
}

function MobileTransactionCard({
  row,
  isReadOnly,
  onCategorize,
  onManage,
}) {
  const ist = formatDateTimeToIST(row.messageDatetimeUtc, row.parsedTxnDate)
  const amountMeta = getAmountMeta(row.direction)

  return (
    <article className="rounded-[1.5rem] border border-white/[0.08] bg-white/[0.025] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold text-white/[0.94]">
            {row.merchantDisplay}
          </h3>
          {row.upiPayeeName && row.upiVpa ? (
            <p className="mt-1 break-all text-sm text-white/[0.5]">{row.upiVpa}</p>
          ) : null}
        </div>

        <div className="shrink-0 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-right">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.4]">
            Date
          </div>
          <div className="mt-1 text-sm font-medium text-white/[0.88]">{ist.date}</div>
          <div className="text-xs text-white/[0.5]">{ist.time}</div>
        </div>
      </div>

      <div className="mt-4 rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-3">
          <AmountDirectionIcon direction={row.direction} />

          <div className="min-w-0">
            <div className={`text-lg font-semibold ${amountMeta.amountClass}`}>
              {formatAmount(row.amount)}
            </div>
            <div className="text-xs uppercase tracking-[0.22em] text-white/40">
              {amountMeta.label}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <CategoryPill
          category={row.category}
          disabled={isReadOnly}
          className="w-full justify-center"
          onClick={
            onCategorize ? () => onCategorize(row.id) : undefined
          }
        />

        <ActionButton
          isReadOnly={isReadOnly}
          onManage={onManage}
          rowId={row.id}
          className="h-11 w-full min-h-0 px-4 text-sm"
        />
      </div>
    </article>
  )
}

function DesktopTableRows({
  rows,
  isReadOnly,
  onCategorize,
  onManage,
}) {
  return rows.map((row) => {
    const ist = formatDateTimeToIST(row.messageDatetimeUtc, row.parsedTxnDate)
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
              <div className={`text-base font-semibold ${amountMeta.amountClass}`}>
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
          <ActionButton
            isReadOnly={isReadOnly}
            onManage={onManage}
            rowId={row.id}
            className="p-2"
          />
        </td>
      </tr>
    )
  })
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
      <div className="space-y-3 p-3 md:hidden">
        {isLoading ? (
          <MobileLoadingCards count={Math.min(pageSize, 6)} />
        ) : isError ? (
          <MobileStatePanel tone="error">
            {error?.message || 'Failed to load transactions'}
          </MobileStatePanel>
        ) : rows.length === 0 ? (
          <MobileStatePanel>No transactions found.</MobileStatePanel>
        ) : (
          rows.map((row) => (
            <MobileTransactionCard
              key={row.id}
              row={row}
              isReadOnly={isReadOnly}
              onCategorize={onCategorize}
              onManage={onManage}
            />
          ))
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="table min-w-[920px] border-separate border-spacing-0 text-white">
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
              <DesktopTableRows
                rows={rows}
                isReadOnly={isReadOnly}
                onCategorize={onCategorize}
                onManage={onManage}
              />
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
