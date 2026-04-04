import { getCategoryBadgeClass } from '../../utils/formatters'

export default function TransactionTaggingSection({
  transaction,
  currentLabel,
}) {
  const category = currentLabel?.primaryCategory ?? null
  const categorySelectValue = category ?? '__placeholder__'

  return (
    <section className="rounded-[1.75rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(17,22,43,0.76)_0%,rgba(8,11,24,0.8)_100%)] p-6 shadow-[0_24px_64px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.42]">
            Tagging
          </div>
          <h3 className="mt-2 text-lg font-semibold text-white">
            Manual Tagging
          </h3>
          <p className="mt-2 text-sm leading-6 text-white/[0.62]">
            Shell only for now. This card is wired to the current transaction and
            ready for the manual upsert flow next.
          </p>
        </div>

        <span className={getCategoryBadgeClass(category)}>
          {category || 'Unlabeled'}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-[1.1rem] border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-sm text-white/[0.7]">
          Transaction #{transaction.id}
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.44]">
            Category
          </span>
          <select
            className="select h-12 w-full rounded-2xl border-white/[0.12] bg-white/[0.06] text-white/45 shadow-none"
            disabled
            defaultValue={categorySelectValue}
          >
            {!category ? (
              <option value="__placeholder__">
                Category options will be added next
              </option>
            ) : null}
            {category ? <option value={category}>{category}</option> : null}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.44]">
            Custom note
          </span>
          <textarea
            className="textarea min-h-28 w-full rounded-[1.4rem] border-white/[0.12] bg-white/[0.06] text-white/45 shadow-none placeholder:text-white/[0.32]"
            disabled
            defaultValue={currentLabel?.customNote ?? ''}
            placeholder="Manual note support lands in the next pass."
          />
        </label>

        <button
          type="button"
          className="btn h-11 w-full rounded-2xl border border-white/[0.12] bg-white/[0.04] text-white/45 shadow-none"
          disabled
        >
          Save Manual Tag
        </button>
      </div>
    </section>
  )
}
