import { useEffect, useRef } from 'react'
import { formatAmount, formatDateTimeToIST } from '../utils/formatters'

function AmountDirectionIcon({ direction, compact = false }) {
  const isDebit = direction === 'DEBIT'
  const isCredit = direction === 'CREDIT'

  const toneClass = isDebit
    ? compact
      ? 'border-rose-300/20 bg-rose-400/[0.1] text-rose-200'
      : 'border-rose-400/25 bg-rose-400/10 text-rose-300'
    : isCredit
      ? compact
        ? 'border-emerald-300/20 bg-emerald-400/[0.1] text-emerald-200'
        : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300'
      : compact
        ? 'border-white/[0.1] bg-white/[0.045] text-white/[0.68]'
        : 'border-white/[0.12] bg-white/[0.04] text-white/[0.72]'

  const sizeClass = compact
    ? 'h-7 w-7 rounded-full'
    : 'h-10 w-10 rounded-2xl'
  const iconSizeClass = compact ? 'h-3.5 w-3.5' : 'h-5 w-5'

  return (
    <div
      className={`flex items-center justify-center border ${sizeClass} ${toneClass}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 20 20"
        className={iconSizeClass}
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

function CategoryPill({
  category,
  onClick,
  disabled = false,
  className = '',
  compact = false,
}) {
  const isInteractive = Boolean(onClick) && !disabled

  if (!category) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={!isInteractive}
        className={`inline-flex max-w-full items-center gap-2 border font-medium transition ${
          compact
            ? `h-9 rounded-full px-3.5 text-[13px] leading-none ${
                isInteractive
                  ? 'border-amber-300/25 bg-amber-400/[0.08] text-amber-300 hover:border-amber-300/35 hover:bg-amber-400/[0.12]'
                  : 'border-amber-300/15 bg-amber-400/[0.05] text-amber-300/70'
              }`
            : disabled || !onClick
              ? 'cursor-not-allowed rounded-full border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/40'
              : 'rounded-full border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-sm text-amber-300 hover:border-amber-300/35 hover:bg-amber-300/15'
        } ${className}`}
      >
        {compact ? (
          <span className="h-2 w-2 shrink-0 rounded-full bg-current opacity-90" />
        ) : (
          <CategoryTagIcon />
        )}
        <span className="truncate">Add category</span>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isInteractive}
      className={`inline-flex max-w-full items-center gap-2 border font-medium transition ${
        compact
          ? `h-9 rounded-full px-3.5 text-[13px] leading-none ${
              isInteractive
                ? 'border-emerald-300/20 bg-emerald-400/[0.08] text-emerald-200 hover:border-emerald-300/30 hover:bg-emerald-400/[0.12]'
                : 'border-emerald-300/15 bg-emerald-400/[0.05] text-emerald-200/75'
            }`
          : disabled || !onClick
            ? 'cursor-not-allowed rounded-full border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/45'
            : 'rounded-full border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:border-white/20 hover:bg-white/10'
      } ${className}`}
    >
      <span
        className={`shrink-0 rounded-full ${
          compact ? 'h-2 w-2 bg-current opacity-90' : 'h-2 w-2 bg-emerald-300'
        }`}
      />
      <span className="truncate">{category}</span>
    </button>
  )
}

function ActionButton({
  isReadOnly,
  onManage,
  rowId,
  className = '',
  compact = false,
}) {
  return (
    <button
      type="button"
      disabled={!onManage}
      className={`transition-all duration-150 ${
        compact
          ? 'inline-flex h-9 min-h-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] px-4 text-[13px] font-medium text-white/[0.72] hover:border-white/[0.14] hover:bg-white/[0.045] hover:text-white/[0.9]'
          : 'btn btn-sm rounded-xl border-white/[0.15] bg-white/[0.06] text-white shadow-none hover:border-white/[0.24] hover:bg-white/[0.1]'
      } ${className}`}
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
      className="rounded-[1.4rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(20,24,36,0.96)_0%,rgba(14,18,29,0.98)_100%)] px-4 py-4 shadow-[0_16px_36px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="skeleton h-5 w-40 rounded-full bg-white/[0.08]" />
          <div className="mt-2 skeleton h-3.5 w-32 rounded-full bg-white/[0.08]" />
        </div>
        <div className="shrink-0 space-y-2 text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="skeleton h-7 w-7 rounded-full bg-white/[0.08]" />
            <div className="skeleton h-6 w-20 rounded-full bg-white/[0.08]" />
          </div>
          <div className="ml-auto skeleton h-3 w-16 rounded-full bg-white/[0.08]" />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="skeleton h-9 w-28 rounded-full bg-white/[0.08]" />
        </div>
        <div className="skeleton h-9 w-28 rounded-full bg-white/[0.08]" />
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
  const dateTimeLabel =
    ist.time && ist.time !== '—' ? `${ist.date} • ${ist.time}` : ist.date

  return (
    <article className="rounded-[1.4rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(20,24,36,0.96)_0%,rgba(14,18,29,0.98)_100%)] px-4 py-4 shadow-[0_16px_36px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.03)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[1.05rem] font-semibold leading-[1.35] text-white/[0.95]">
            {row.merchantDisplay}
          </h3>
          <p className="mt-1.5 text-[13px] text-white/[0.46]">{dateTimeLabel}</p>
        </div>

        <div className="shrink-0 pt-0.5 text-right">
          <div className="flex items-center justify-end gap-2">
            <AmountDirectionIcon direction={row.direction} compact />
            <div className={`text-xl font-semibold tracking-tight ${amountMeta.amountClass}`}>
              {formatAmount(row.amount)}
            </div>
          </div>
          <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.34em] text-white/[0.34]">
            {amountMeta.label}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <CategoryPill
            category={row.category}
            disabled={isReadOnly}
            compact
            className="max-w-full"
            onClick={onCategorize ? () => onCategorize(row.id) : undefined}
          />
        </div>
        <ActionButton
          isReadOnly={isReadOnly}
          onManage={onManage}
          rowId={row.id}
          compact
          className="min-w-[7.75rem] px-5"
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
  enableInfiniteScroll = false,
  hasMore = false,
  isFetchingMore = false,
  onLoadMore,
  onCategorize,
  onManage,
}) {
  const loadMoreRef = useRef(null)

  useEffect(() => {
    if (
      !enableInfiniteScroll ||
      !hasMore ||
      isFetchingMore ||
      !onLoadMore ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return undefined
    }

    const loadMoreNode = loadMoreRef.current

    if (!loadMoreNode) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (entry?.isIntersecting) {
          onLoadMore()
        }
      },
      {
        rootMargin: '240px 0px',
      }
    )

    observer.observe(loadMoreNode)

    return () => observer.disconnect()
  }, [enableInfiniteScroll, hasMore, isFetchingMore, onLoadMore])

  return (
    <div className="md:overflow-hidden md:rounded-[2rem] md:border md:border-white/[0.12] md:bg-[linear-gradient(180deg,rgba(13,16,34,0.72)_0%,rgba(6,8,18,0.74)_100%)] md:shadow-[0_28px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)] md:backdrop-blur-sm">
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <MobileLoadingCards count={Math.min(pageSize, 6)} />
        ) : isError ? (
          <MobileStatePanel tone="error">
            {error?.message || 'Failed to load transactions'}
          </MobileStatePanel>
        ) : rows.length === 0 ? (
          <MobileStatePanel>No transactions found.</MobileStatePanel>
        ) : (
          <>
            {rows.map((row) => (
              <MobileTransactionCard
                key={row.id}
                row={row}
                isReadOnly={isReadOnly}
                onCategorize={onCategorize}
                onManage={onManage}
              />
            ))}

            {enableInfiniteScroll ? (
              <div
                ref={loadMoreRef}
                className="flex min-h-[3rem] items-center justify-center px-3 py-2"
              >
                {isFetchingMore ? (
                  <span className="loading loading-spinner loading-sm text-cyan-200" />
                ) : hasMore ? (
                  <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/[0.34]">
                    Loading more as you scroll
                  </span>
                ) : (
                  <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/[0.28]">
                    End of transactions
                  </span>
                )}
              </div>
            ) : null}
          </>
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
