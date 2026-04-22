import {
  formatAmount,
  formatDateTimeToIST,
  getDirectionBadgeClass,
} from '../../utils/formatters'

function DetailField({ label, value, multiline = false }) {
  return (
    <div className="rounded-[1.2rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
        {label}
      </div>
      <div
        className={`mt-2 text-sm leading-6 text-white/[0.9] ${
          multiline ? 'whitespace-pre-wrap break-words' : 'break-words'
        }`}
      >
        {value || '—'}
      </div>
    </div>
  )
}

export default function TransactionDetailsSection({ transaction }) {
  const transactionDateTime = formatDateTimeToIST(
    transaction.messageDatetimeUtc,
    transaction.parsedTxnDate
  )

  const paidFromValue = transaction.accountLast4
    ? `•••• ${transaction.accountLast4}`
    : '—'

  return (
    <section className="rounded-[1.75rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(17,22,43,0.76)_0%,rgba(8,11,24,0.8)_100%)] p-4 shadow-[0_24px_64px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
          Details
        </div>
        <h3 className="mt-2 text-lg font-semibold text-white">
          Transaction Details
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/[0.62]">
          Full payment context from the parsed transaction row and original bank
          alert.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/[0.42]">
            Core Payment Details
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <DetailField label="Paid to" value={transaction.upiPayeeName} />
            <DetailField label="UPI ID" value={transaction.upiVpa} />
            <DetailField
              label="Reference number"
              value={transaction.upiReference}
            />
            <DetailField label="Paid from" value={paidFromValue} />
            <DetailField
              label="Payment method"
              value={transaction.parsedChannel}
            />
            <DetailField label="Bank" value={transaction.bankName} />
            <div className="rounded-[1.2rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
                Date & time
              </div>
              <div className="mt-2 text-sm text-white/[0.9]">
                {transactionDateTime.date}
              </div>
              <div className="text-xs text-white/[0.52]">
                {transactionDateTime.time}
              </div>
            </div>
            <DetailField label="Amount" value={formatAmount(transaction.amount)} />
            <div className="rounded-[1.2rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
                Direction
              </div>
              <div className="mt-2">
                <span className={getDirectionBadgeClass(transaction.direction)}>
                  {transaction.direction || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/[0.42]">
            Alert Context
          </div>

          <div className="grid gap-3">
            <DetailField label="Alert title" value={transaction.subjectRaw} />
            <DetailField
              label="Bank alert"
              value={transaction.bodyText}
              multiline
            />
          </div>
        </div>
      </div>
    </section>
  )
}
