import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../../../../providers/AuthProvider'
import { closeTransactionModal } from '../../../../store/slices/uiSlice'
import { isAdminWriterUser } from '../../../../utils/adminAccess'
import { useTransactionDetailsQuery } from '../../hooks/useTransactionDetailsQuery'
import {
  formatAmount,
  formatDateTimeToIST,
  getCategoryBadgeClass,
} from '../../utils/formatters'
import TransactionDetailsSection from './TransactionDetailsSection'
import TransactionTaggingSection from './TransactionTaggingSection'

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
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="skeleton h-4 w-28 rounded-full bg-white/[0.08]" />
        <div className="mt-3 skeleton h-8 w-56 rounded-2xl bg-white/[0.08]" />
        <div className="mt-3 skeleton h-4 w-44 rounded-full bg-white/[0.08]" />
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="skeleton h-5 w-36 rounded-full bg-white/[0.08]" />
        <div className="mt-5 skeleton h-12 w-full rounded-2xl bg-white/[0.08]" />
        <div className="mt-4 skeleton h-32 w-full rounded-2xl bg-white/[0.08]" />
        <div className="mt-6 flex justify-end gap-3">
          <div className="skeleton h-11 w-24 rounded-full bg-white/[0.08]" />
          <div className="skeleton h-11 w-32 rounded-full bg-white/[0.08]" />
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-[1.75rem] border border-rose-300/15 bg-rose-300/10 p-5 sm:p-6">
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
    <div className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.035] p-5 sm:p-6">
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
  const subtitle =
    transaction.upiVpa || transaction.parsedChannel || transaction.upiReference || 'No extra identity'

  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {isRefreshing ? (
              <span className="loading loading-spinner loading-xs text-cyan-200" />
            ) : null}
          </div>

          <h2 className="mt-2 break-words text-xl font-semibold text-white sm:text-2xl">
            {transaction.merchantDisplay}
          </h2>

          <div className="mt-1 break-all text-sm text-white/55 sm:break-words">{subtitle}</div>

          <div className="mt-3 text-sm text-white/60">
            {transactionDateTime.date}
            {transactionDateTime.time !== '—'
              ? ` · ${transactionDateTime.time}`
              : ''}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/90">
            {formatAmount(transaction.amount)}
          </div>
          <span className={getCategoryBadgeClass(currentCategory)}>
            {currentCategory || 'Unlabeled'}
          </span>
        </div>
      </div>
    </div>
  )
}

function ManageStatusRow({ label, value, helper }) {
  return (
    <div className="rounded-[1.1rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-white/[0.9]">
        {value}
      </div>
      {helper ? (
        <div className="mt-1 text-sm leading-6 text-white/[0.58]">{helper}</div>
      ) : null}
    </div>
  )
}

function ManageShellSection({ currentLabel }) {
  const currentCategory = currentLabel?.primaryCategory ?? 'Unlabeled'
  const categoryHelper = currentLabel?.primaryCategory
    ? currentLabel?.labelSource === 'manual'
      ? 'This category was saved directly on the transaction.'
      : 'This category came from an automated label source.'
    : 'No category is saved on this transaction yet.'

  return (
    <section className="rounded-[1.75rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(17,22,43,0.76)_0%,rgba(8,11,24,0.8)_100%)] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
          Management
        </div>
        <h3 className="mt-2 text-lg font-semibold text-white">
          Transaction workspace
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/[0.62]">
          This entry point is reserved for the broader management flow. It is
          read-only for now while those controls are being shaped.
        </p>
      </div>

      <div className="mt-5 space-y-3">
        <ManageStatusRow
          label="Current category"
          value={currentCategory}
          helper={categoryHelper}
        />
        <ManageStatusRow
          label="Automation"
          value="Coming next"
          helper="Future rule creation and similar-transaction handling will appear here."
        />
        <ManageStatusRow
          label="Historical updates"
          value="Not active yet"
          helper="Backfilling older similar payments is not connected from this entry point yet."
        />
      </div>

      <div className="mt-5 rounded-[1.1rem] border border-emerald-400/18 bg-emerald-400/10 px-4 py-3 text-sm leading-6 text-emerald-100/90">
        Use the category pill in the table when you want to save a category on
        a transaction right now.
      </div>
    </section>
  )
}

export default function TransactionManageModal() {
  const dispatch = useDispatch()
  const { isAuthReady, isAuthenticated, user } = useAuth()
  const selectedTransactionId = useSelector(
    (state) => state.ui.selectedTransactionId
  )
  const modalView = useSelector((state) => state.ui.transactionModalView)
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

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = () => {
    dispatch(closeTransactionModal())
  }
  const isManageView = modalView === 'manage'
  const isReadOnlyDemo = !isAdminWriterUser(user)
  const headerTitle = isManageView
    ? 'Manage transaction'
    : 'Categorize transaction'
  const headerDescription = isManageView
    ? 'Review the transaction context here. Editing controls will expand from this entry point next.'
    : isReadOnlyDemo
      ? 'Demo mode is read-only. You can review the category and rule setup here, but only the admin account can save changes.'
      : 'Set the category for this payment and review how similar ones should be recognized.'
  const modalMaxWidthClass = isManageView ? 'max-w-6xl' : 'max-w-2xl'

  const modal = (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center px-0 py-0 sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-manage-modal-heading"
    >
      <div
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className={`relative z-10 flex h-[100dvh] w-full ${modalMaxWidthClass} flex-col overflow-hidden rounded-none border-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_25%),linear-gradient(180deg,#07101f_0%,#040915_100%)] shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:h-auto sm:max-h-[90vh] sm:rounded-[2rem] sm:border sm:border-white/10`}>
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
          <div className="min-w-0">
            <div
              id="transaction-manage-modal-heading"
              className="text-xl font-semibold uppercase text-white sm:text-2xl"
            >
              {headerTitle}
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
              {headerDescription}
            </p>
          </div>

          <button
            type="button"
            className="shrink-0 rounded-full border border-white/10 bg-white/5 p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            onClick={handleClose}
            aria-label="Close transaction dialog"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6 sm:py-6">
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
            isManageView ? (
              <div className="space-y-5">
                <SummaryStrip transaction={transaction} isRefreshing={isFetching} />
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)] lg:gap-6">
                  <TransactionDetailsSection transaction={transaction} />
                  <ManageShellSection currentLabel={transaction.currentLabel} />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <SummaryStrip transaction={transaction} isRefreshing={isFetching} />
                <TransactionTaggingSection
                  key={`${transaction.id}:${transaction.currentLabel?.primaryCategory ?? ''}:${transaction.currentLabel?.customNote ?? ''}`}
                  transaction={transaction}
                  currentLabel={transaction.currentLabel}
                  isReadOnly={isReadOnlyDemo}
                  onClose={handleClose}
                />
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )

  return typeof document !== 'undefined'
    ? createPortal(modal, document.body)
    : null
}
