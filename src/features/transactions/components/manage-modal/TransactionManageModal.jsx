import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../../../../providers/AuthProvider'
import { closeTransactionModal } from '../../../../store/slices/uiSlice'
import { useTransactionDetailsQuery } from '../../hooks/useTransactionDetailsQuery'
import {
  formatAmount,
  formatDateTimeToIST,
  getCategoryBadgeClass,
  getDirectionBadgeClass,
} from '../../utils/formatters'
import TransactionDetailsSection from './TransactionDetailsSection'
import TransactionTaggingSection from './TransactionTaggingSection'
import TransactionRuleSection from './TransactionRuleSection'

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m5 5 10 10" strokeLinecap="round" />
      <path d="M15 5 5 15" strokeLinecap="round" />
    </svg>
  )
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="rounded-[1.6rem] border border-white/[0.08] bg-white/[0.035] p-5">
        <div className="skeleton h-4 w-28 rounded-full bg-white/[0.08]" />
        <div className="mt-3 skeleton h-8 w-56 rounded-2xl bg-white/[0.08]" />
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="skeleton h-6 w-28 rounded-full bg-white/[0.08]" />
          <div className="skeleton h-6 w-20 rounded-full bg-white/[0.08]" />
          <div className="skeleton h-6 w-24 rounded-full bg-white/[0.08]" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <div className="rounded-[1.75rem] border border-white/[0.08] bg-white/[0.035] p-6">
          <div className="skeleton h-5 w-44 rounded-full bg-white/[0.08]" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="skeleton h-24 rounded-[1.2rem] bg-white/[0.08]"
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="skeleton h-72 rounded-[1.75rem] bg-white/[0.08]" />
          <div className="skeleton h-80 rounded-[1.75rem] bg-white/[0.08]" />
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-[1.75rem] border border-rose-300/15 bg-rose-300/10 p-6">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-100/75">
        Load Error
      </div>
      <h3 className="mt-2 text-lg font-semibold text-rose-50">
        Failed to load this transaction
      </h3>
      <p className="mt-3 text-sm leading-6 text-rose-100/85">
        {message || 'Something went wrong while fetching transaction details.'}
      </p>

      <div className="mt-5">
        <button
          type="button"
          className="btn h-11 rounded-2xl border border-rose-100/25 bg-rose-100/10 px-5 text-rose-50 shadow-none transition-colors duration-150 hover:bg-rose-100/15"
          onClick={onRetry}
        >
          Retry
        </button>
      </div>
    </div>
  )
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.035] p-6">
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
        Unavailable
      </div>
      <h3 className="mt-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/[0.62]">{description}</p>
    </div>
  )
}

function SummaryStrip({ transaction, isRefreshing }) {
  const currentCategory = transaction.currentLabel?.primaryCategory ?? null
  const transactionDateTime = formatDateTimeToIST(
    transaction.messageDatetimeUtc,
    transaction.parsedTxnDate
  )

  return (
    <div className="rounded-[1.6rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(17,22,43,0.78)_0%,rgba(8,11,24,0.82)_100%)] px-5 py-5 shadow-[0_24px_64px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
              Transaction Manager
            </div>
            {isRefreshing ? (
              <span className="loading loading-spinner loading-xs text-cyan-200" />
            ) : null}
          </div>

          <h2 className="mt-2 text-2xl font-semibold text-white">
            {transaction.merchantDisplay}
          </h2>

          <div className="mt-3 text-sm text-white/[0.62]">
            {transactionDateTime.date}
            {transactionDateTime.time !== '—' ? ` · ${transactionDateTime.time}` : ''}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/[0.92]">
            {formatAmount(transaction.amount)}
          </div>
          <span className={getDirectionBadgeClass(transaction.direction)}>
            {transaction.direction || 'UNKNOWN'}
          </span>
          <span className={getCategoryBadgeClass(currentCategory)}>
            {currentCategory || 'Unlabeled'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function TransactionManageModal() {
  const dispatch = useDispatch()
  const { isAuthReady, isAuthenticated } = useAuth()
  const selectedTransactionId = useSelector(
    (state) => state.ui.selectedTransactionId
  )
  const isOpen = useSelector((state) => state.ui.isTransactionModalOpen)

  const {
    data: transaction,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTransactionDetailsQuery({
    transactionId: selectedTransactionId,
    enabled: isOpen && isAuthReady && isAuthenticated,
  })

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        dispatch(closeTransactionModal())
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [dispatch, isOpen])

  if (!isOpen) return null

  const modal = (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-manage-modal-heading"
    >
      <div
        className="absolute inset-0 bg-[#05030d]/76 backdrop-blur-sm"
        onClick={() => dispatch(closeTransactionModal())}
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(14,18,38,0.92)_0%,rgba(6,8,18,0.95)_100%)] shadow-[0_32px_90px_rgba(0,0,0,0.46),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
              Review
            </div>
            <h2
              id="transaction-manage-modal-heading"
              className="mt-2 text-xl font-semibold text-white"
            >
              Manage Transaction
            </h2>
            <p className="mt-2 text-sm text-white/[0.58]">
              Review details now. Tagging and rule creation shells are in place
              for the next pass.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/[0.7] transition-colors duration-150 hover:bg-white/[0.08] hover:text-white"
            onClick={() => dispatch(closeTransactionModal())}
            aria-label="Close transaction dialog"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          {!selectedTransactionId ? (
            <EmptyState
              title="No transaction selected"
              description="Pick a transaction from the table to populate this modal."
            />
          ) : isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState message={error?.message} onRetry={refetch} />
          ) : !transaction ? (
            <EmptyState
              title="Transaction not found"
              description="The selected transaction could not be loaded from the current dataset."
            />
          ) : (
            <div className="space-y-6">
              <SummaryStrip transaction={transaction} isRefreshing={isFetching} />

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
                <TransactionDetailsSection transaction={transaction} />

                <div className="space-y-6">
                  <TransactionTaggingSection
                    transaction={transaction}
                    currentLabel={transaction.currentLabel}
                  />
                  <TransactionRuleSection
                    transaction={transaction}
                    currentLabel={transaction.currentLabel}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined'
    ? createPortal(modal, document.body)
    : null
}
