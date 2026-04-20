import { useEffect, useMemo, useRef, useState } from 'react'
import { useCreateTaggingRuleMutation } from '../../hooks/useCreateTaggingRuleMutation'
import { useUpsertTransactionLabelMutation } from '../../hooks/useUpsertTransactionLabelMutation'

const CATEGORY_OPTIONS = [
  'Food',
  'Groceries',
  'Travel',
  'Fuel',
  'Bills & Recharges',
  'Shopping',
  'Rent',
  'Health',
  'Entertainment',
  'Subscriptions',
  'Transfer',
  'Other',
]

function ChevronDownIcon({ isOpen }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={`h-5 w-5 text-white/70 transition-transform duration-150 ${
        isOpen ? 'rotate-180' : ''
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="m6.5 8 3.5 4 3.5-4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RememberSwitch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Use this category for similar transactions in the future"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-11 w-[4.5rem] shrink-0 items-center rounded-full border px-1 transition focus:outline-none',
        disabled
          ? 'cursor-not-allowed border-white/10 bg-white/[0.03] opacity-60'
          : checked
            ? 'border-emerald-400/35 bg-emerald-400/15'
            : 'border-white/10 bg-white/[0.04]'
      )}
    >
      <span
        className={cn(
          'h-8 w-8 rounded-full border transition-transform duration-200',
          checked
            ? 'translate-x-[1.95rem] border-emerald-200/35 bg-emerald-200 shadow-[0_0_28px_rgba(167,243,208,0.35)]'
            : 'translate-x-0 border-white/12 bg-white/[0.18]'
        )}
      />
    </button>
  )
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

function normalizeRuleFragment(value) {
  if (!value) return ''
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function buildRememberChoices(transaction) {
  const payeeName = transaction.upiPayeeName?.trim() ?? ''
  const upiVpa = transaction.upiVpa?.trim() ?? ''
  const normalizedPayeeName = normalizeRuleFragment(payeeName)
  const normalizedUpiVpa = normalizeRuleFragment(upiVpa)

  return [
    {
      id: 'upi_payee_name',
      label: 'Name shown in transaction',
      description: normalizedPayeeName
        ? 'Best when the visible payment name stays consistent.'
        : 'Unavailable because this payment does not include a stable name.',
      previewLabel: 'Name shown in transaction',
      previewValue: payeeName,
      disabled: !normalizedPayeeName,
      tone: 'Good default',
    },
    {
      id: 'upi_vpa',
      label: 'UPI ID',
      description: normalizedUpiVpa
        ? 'Useful when the UPI ID is more reliable than the visible name.'
        : 'Unavailable because this payment does not include a UPI ID.',
      previewLabel: 'UPI ID',
      previewValue: upiVpa,
      disabled: !normalizedUpiVpa,
      tone: 'Reliable',
    },
    {
      id: 'upi_payee_name_upi_vpa_pair',
      label: 'Both name and UPI ID',
      description:
        normalizedPayeeName && normalizedUpiVpa
          ? 'Uses both fields together for the safest match.'
          : 'Unavailable because this payment needs both a name and a UPI ID.',
      previewLabel: 'Name + UPI ID',
      previewValue:
        normalizedPayeeName && normalizedUpiVpa
          ? `${payeeName} + ${upiVpa}`
          : '',
      disabled: !(normalizedPayeeName && normalizedUpiVpa),
      tone: 'Most accurate',
    },
  ]
}

function getDefaultRememberType(choices) {
  return (
    choices.find(
      (choice) =>
        choice.id === 'upi_payee_name_upi_vpa_pair' && !choice.disabled
    )?.id ??
    choices.find((choice) => choice.id === 'upi_vpa' && !choice.disabled)?.id ??
    choices.find((choice) => !choice.disabled)?.id ??
    'upi_payee_name'
  )
}

function getCurrentCategoryMeta(currentLabel) {
  if (!currentLabel?.primaryCategory) {
    return {
      label: 'Not labeled yet',
      className:
        'border-amber-300/20 bg-amber-300/10 text-amber-200',
    }
  }

  if (currentLabel.labelSource === 'rule') {
    return {
      label: 'Auto-applied',
      className:
        'border-sky-300/20 bg-sky-300/10 text-sky-200',
    }
  }

  return {
    label: 'Saved by you',
    className:
      'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  }
}

function PreviewCard({ label, value }) {
  return (
    <div className="rounded-[1.1rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
        {label}
      </div>
      <div className="mt-2 break-words text-sm leading-6 text-white/[0.86]">
        {value || '—'}
      </div>
    </div>
  )
}

export default function TransactionTaggingSection({
  transaction,
  currentLabel,
  isReadOnly = false,
  onClose,
}) {
  const initialCategory = currentLabel?.primaryCategory ?? ''
  const initialNote = currentLabel?.customNote ?? ''
  const rememberChoices = buildRememberChoices(transaction)
  const categoryMenuRef = useRef(null)
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || CATEGORY_OPTIONS[0]
  )
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false)
  const [note, setNote] = useState(initialNote)
  const [rememberForSimilar, setRememberForSimilar] = useState(false)
  const [selectedRememberType, setSelectedRememberType] = useState(() =>
    getDefaultRememberType(rememberChoices)
  )
  const saveLabelMutation = useUpsertTransactionLabelMutation(transaction.id)
  const createRuleMutation = useCreateTaggingRuleMutation(transaction.id)

  const normalizedNote = note.trim()
  const hasLabelChanges = useMemo(
    () =>
      selectedCategory !== initialCategory ||
      normalizedNote !== initialNote.trim(),
    [initialCategory, initialNote, normalizedNote, selectedCategory]
  )
  const selectedCategoryLabel = selectedCategory || CATEGORY_OPTIONS[0]
  const currentCategoryMeta = getCurrentCategoryMeta(currentLabel)
  const canRememberSimilar = rememberChoices.some((choice) => !choice.disabled)
  const isRememberEnabled = !isReadOnly && rememberForSimilar
  const selectedRememberChoice =
    rememberChoices.find((choice) => choice.id === selectedRememberType) ??
    rememberChoices[0] ??
    null
  const canCreateRule =
    isRememberEnabled &&
    canRememberSimilar &&
    Boolean(selectedRememberChoice) &&
    !selectedRememberChoice?.disabled
  const canSubmit = !isReadOnly && (hasLabelChanges || canCreateRule)
  const isSubmitting =
    saveLabelMutation.isPending || createRuleMutation.isPending

  useEffect(() => {
    if (!isCategoryMenuOpen) return undefined

    const handlePointerDown = (event) => {
      if (!categoryMenuRef.current?.contains(event.target)) {
        setIsCategoryMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsCategoryMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCategoryMenuOpen])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isReadOnly) {
      console.info(
        '[Tagging UI] Read-only demo mode blocked a save attempt for transaction',
        transaction.id
      )
      return
    }

    const labelPayload = {
      transactionId: transaction.id,
      primaryCategory: selectedCategory,
      customNote: normalizedNote,
    }

    if (!isRememberEnabled) {
      console.groupCollapsed('[Tagging V1] save category')
      console.info('labelPayload', labelPayload)
      console.groupEnd()

      saveLabelMutation.mutate(labelPayload, {
        onSuccess: () => {
          onClose()
        },
      })
      return
    }

    const rulePayload = {
      transactionId: transaction.id,
      primaryCategory: selectedCategory,
      ruleType: selectedRememberType,
      customNote: normalizedNote,
      rulePreview: {
        label: selectedRememberChoice?.previewLabel ?? null,
        value: selectedRememberChoice?.previewValue ?? null,
      },
      sourceTransaction: {
        merchantDisplay: transaction.merchantDisplay,
        upiPayeeName: transaction.upiPayeeName ?? null,
        upiVpa: transaction.upiVpa ?? null,
        upiReference: transaction.upiReference ?? null,
      },
    }

    console.groupCollapsed('[Tagging V2][Frontend] save and create rule')
    console.info('labelPayload', labelPayload)
    console.info('rulePayload', rulePayload)
    console.info(
      'status',
      'The RPC will save the current transaction as manual, create the rule, and backfill historical matches in one DB call.'
    )
    console.groupEnd()

    try {
      const result = await createRuleMutation.mutateAsync({
        transactionId: rulePayload.transactionId,
        primaryCategory: rulePayload.primaryCategory,
        ruleType: rulePayload.ruleType,
        customNote: rulePayload.customNote,
      })

      console.groupCollapsed('[Tagging V2][Frontend] rpc success')
      console.info('rulePreview', rulePayload.rulePreview)
      console.info('sourceTransaction', rulePayload.sourceTransaction)
      console.info('result', result)
      console.groupEnd()

      onClose()
    } catch (error) {
      console.error('[Tagging V2][Frontend] flow failed', error)
    }
  }

  const handleCategorySelect = (category) => {
    if (isReadOnly) return
    setSelectedCategory(category)
    setIsCategoryMenuOpen(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-white/50">Current category</div>
            <div className="mt-1 text-lg font-semibold text-emerald-300">
              {currentLabel?.primaryCategory || 'Unlabeled'}
            </div>
          </div>

          <div
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold',
              currentCategoryMeta.className
            )}
          >
            {currentCategoryMeta.label}
          </div>
        </div>

        {isReadOnly ? (
          <div className="mt-4 rounded-[1.1rem] border border-sky-300/15 bg-sky-300/10 px-4 py-3 text-sm leading-6 text-sky-100/90">
            Demo mode is read-only for this account. You can inspect the
            tagging workflow here, but only the admin account can save
            categories or create rules.
          </div>
        ) : null}

        {selectedCategory !== initialCategory ? (
          <div className="mt-4 rounded-[1.1rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white/[0.72]">
            This transaction will be saved as{' '}
            <span className="font-semibold text-white">{selectedCategory}</span>.
          </div>
        ) : null}
      </div>

      <div className="mt-5 space-y-4">
        <div className="relative" ref={categoryMenuRef}>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
            Category
          </label>
          <button
            type="button"
            className={cn(
              'flex w-full items-center justify-between rounded-2xl border bg-white/[0.04] px-4 py-3 text-left text-lg text-white outline-none transition',
              isReadOnly
                ? 'cursor-not-allowed border-white/10 text-white/55'
                : isCategoryMenuOpen
                ? 'border-emerald-400/45 shadow-[0_0_0_1px_rgba(52,211,153,0.12)]'
                : 'border-white/10 hover:border-white/20'
            )}
            aria-haspopup="listbox"
            aria-expanded={isCategoryMenuOpen}
            disabled={isReadOnly}
            onClick={() => setIsCategoryMenuOpen((current) => !current)}
          >
            <span>{selectedCategoryLabel}</span>
            <ChevronDownIcon isOpen={isCategoryMenuOpen} />
          </button>

          {isCategoryMenuOpen && !isReadOnly ? (
            <div className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-30 overflow-hidden rounded-[1.1rem] border border-white/15 bg-[#111a30] shadow-[0_24px_80px_rgba(0,0,0,0.42)]">
              <ul role="listbox" className="max-h-72 overflow-y-auto py-1.5">
                {CATEGORY_OPTIONS.map((option) => {
                  const isSelected = option === selectedCategory

                  return (
                    <li key={option}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleCategorySelect(option)}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-[1.05rem] transition',
                          isSelected
                            ? 'bg-sky-200 text-slate-900'
                            : 'text-white/92 hover:bg-white/[0.06]'
                        )}
                      >
                        {option}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </div>

      </div>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
              Remember this
            </div>
            <h3 className="mt-2 text-lg font-semibold text-white">
              Create one rule for similar transactions
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/[0.62]">
              Turn this on when you want this category to become an automation
              rule for matching transactions, including historical matches and
              future ones.
            </p>
          </div>

          <RememberSwitch
            checked={isRememberEnabled}
            onChange={setRememberForSimilar}
            disabled={isReadOnly || !canRememberSimilar}
          />
        </div>

        {!canRememberSimilar ? (
          <div className="mt-4 rounded-[1.1rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white/[0.64]">
            We could not find a stable payment name or UPI ID on this
            transaction yet, so similar-transaction memory is unavailable here.
          </div>
        ) : isRememberEnabled ? (
          <div className="mt-5 space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
                How should we identify similar transactions?
              </div>

              <div className="mt-3 space-y-3">
                {rememberChoices.map((choice) => {
                  const isSelected = choice.id === selectedRememberType

                  return (
                    <label
                      key={choice.id}
                      className={cn(
                        'flex items-start gap-3 rounded-[1.15rem] border px-4 py-3 transition',
                        choice.disabled
                          ? 'cursor-not-allowed border-white/[0.08] bg-white/[0.025] opacity-55'
                          : isSelected
                            ? 'cursor-pointer border-emerald-400/35 bg-emerald-400/10'
                            : 'cursor-pointer border-white/[0.08] bg-white/[0.03] hover:border-white/[0.15]'
                      )}
                    >
                      <input
                        type="radio"
                        name="remember-type"
                        value={choice.id}
                        checked={isSelected}
                        disabled={isReadOnly || choice.disabled}
                        onChange={() => setSelectedRememberType(choice.id)}
                        className="mt-1 h-5 w-5 border-white/20 bg-transparent text-emerald-300"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-base font-semibold text-white">
                            {choice.label}
                          </div>
                          <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/[0.5]">
                            {choice.tone}
                          </div>
                        </div>

                        <div className="mt-2 text-sm leading-6 text-white/[0.58]">
                          {choice.description}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {selectedRememberChoice ? (
              <div className="rounded-[1.25rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(17,22,43,0.76)_0%,rgba(8,11,24,0.8)_100%)] p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
                  This will match transactions like
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <PreviewCard
                    label={selectedRememberChoice.previewLabel}
                    value={selectedRememberChoice.previewValue}
                  />
                  <PreviewCard
                    label="Category to use"
                    value={selectedCategoryLabel}
                  />
                </div>

                <div className="mt-3 text-sm text-white/[0.52]">
                  We will standardize casing and extra spaces automatically
                  before matching, so one saved rule can be reused for both past
                  and future transactions.
                </div>
              </div>
            ) : null}

            <div className="rounded-[1.15rem] border border-amber-300/15 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100/85">
              UI direction is locked now: creating a rule will apply to matching
              past transactions and future ones without asking separately about
              history. The backend connection for that flow is the next step.
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-[1.1rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white/[0.64]">
            Turn this on to choose how the app should recognize similar
            payments and build a reusable rule from this transaction.
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
          Optional note
        </label>
        <textarea
          value={note}
          disabled={isReadOnly}
          onChange={(event) => setNote(event.target.value)}
          rows={4}
          placeholder="Example: monthly milk / office snack / one-time payment"
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/25 outline-none transition focus:border-emerald-400/40"
        />
      </div>

      {saveLabelMutation.isError || createRuleMutation.isError ? (
        <div className="mt-4 rounded-xl border border-rose-300/15 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {saveLabelMutation.error?.message ??
            createRuleMutation.error?.message ??
            'Something went wrong.'}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.06]"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-full border border-emerald-400/25 bg-emerald-400/15 px-5 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400/20 disabled:border-white/10 disabled:bg-white/[0.05] disabled:text-white/35"
          disabled={!canSubmit || isSubmitting}
        >
          {isReadOnly
            ? 'Read-only demo'
            : isSubmitting
            ? isRememberEnabled
              ? 'Saving and creating rule...'
              : 'Saving...'
            : isRememberEnabled
              ? 'Save and create rule'
              : 'Save category'}
        </button>
      </div>
    </form>
  )
}
