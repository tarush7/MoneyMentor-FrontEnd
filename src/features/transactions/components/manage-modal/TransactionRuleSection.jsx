function normalizeRuleFragment(value) {
  if (!value) return ''
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function buildPairPreview(transaction) {
  const normalizedPayeeName = normalizeRuleFragment(transaction.upiPayeeName)
  const normalizedUpiVpa = normalizeRuleFragment(transaction.upiVpa)

  if (!normalizedPayeeName || !normalizedUpiVpa) return '—'

  return `${normalizedPayeeName}::${normalizedUpiVpa}`
}

function PreviewRow({ label, value }) {
  return (
    <div className="rounded-[1.1rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
        {label}
      </div>
      <div className="mt-2 break-words text-sm leading-6 text-white/[0.78]">
        {value || '—'}
      </div>
    </div>
  )
}

export default function TransactionRuleSection({ transaction, currentLabel }) {
  const category = currentLabel?.primaryCategory ?? null

  return (
    <section className="rounded-[1.75rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(17,22,43,0.76)_0%,rgba(8,11,24,0.8)_100%)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
          Rules
        </div>
        <h3 className="mt-2 text-lg font-semibold text-white">Auto-Tag Rule</h3>
        <p className="mt-2 text-sm leading-6 text-white/[0.62]">
          Shell only for now. Rule creation will use the saved label and one of
          the rule identity previews below.
        </p>
      </div>

      <div className="mt-5 rounded-[1.1rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white/[0.7]">
        {category
          ? `Ready to create a rule for category: ${category}`
          : 'Save a category first to enable rule creation.'}
      </div>

      <div className="mt-4 space-y-3">
        <PreviewRow
          label="UPI payee name"
          value={normalizeRuleFragment(transaction.upiPayeeName)}
        />
        <PreviewRow
          label="UPI VPA"
          value={normalizeRuleFragment(transaction.upiVpa)}
        />
        <PreviewRow
          label="Payee + VPA pair"
          value={buildPairPreview(transaction)}
        />
      </div>

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.44]">
            Rule type
          </span>
          <select
            className="select h-12 w-full rounded-2xl border-white/[0.12] bg-white/[0.06] text-white/45 shadow-none"
            disabled
            defaultValue="upi_payee_name"
          >
            <option value="upi_payee_name">UPI payee name</option>
            <option value="upi_vpa">UPI VPA</option>
            <option value="upi_payee_name_upi_vpa_pair">
              UPI payee name + UPI VPA pair
            </option>
          </select>
        </label>

        <label className="flex items-center gap-3 rounded-[1.1rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white/[0.48]">
          <input
            type="checkbox"
            className="checkbox checkbox-sm border-white/[0.2] bg-white/[0.02]"
            disabled
          />
          Apply to similar historical transactions
        </label>

        <button
          type="button"
          className="btn h-11 w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] text-white/45 shadow-none"
          disabled
        >
          Create Rule
        </button>
      </div>
    </section>
  )
}
