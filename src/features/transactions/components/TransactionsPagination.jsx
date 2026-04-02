export default function TransactionsPagination({
  page,
  pageSize,
  totalCount,
  onPrev,
  onNext,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  return (
    <div className="mt-4 rounded-[1.75rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(13,16,34,0.72)_0%,rgba(6,8,18,0.74)_100%)] px-5 py-4 shadow-[0_20px_55px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <span className="text-sm text-white/[0.62] whitespace-nowrap">
            Total transactions: <span className="font-semibold text-white/[0.92]">{totalCount}</span>
          </span>

          <div className="flex items-center gap-2">
            <span className="text-sm text-white/[0.62] whitespace-nowrap">Rows:</span>
            <select
              className="select select-sm w-[76px] rounded-xl border border-white/[0.12] bg-white/[0.06] text-white shadow-none outline-none transition-colors duration-150 hover:border-white/[0.2] focus:border-cyan-200/[0.35] focus:outline-none"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            className="btn btn-sm h-10 min-h-0 w-10 rounded-xl border-white/[0.12] bg-white/[0.06] px-0 text-lg text-white shadow-none transition-all duration-150 hover:border-white/[0.24] hover:bg-white/[0.1] disabled:border-white/[0.08] disabled:bg-white/[0.03] disabled:text-white/[0.28]"
            disabled={page <= 1}
            onClick={onPrev}
            aria-label="Previous page"
          >
            &#8249;
          </button>

          <span className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-white/[0.62]">
            Page <span className="font-semibold text-white/[0.92]">{page}</span> of{' '}
            <span className="font-semibold text-white/[0.92]">{totalPages}</span>
          </span>

          <button
            className="btn btn-sm h-10 min-h-0 w-10 rounded-xl border-white/[0.12] bg-white/[0.06] px-0 text-lg text-white shadow-none transition-all duration-150 hover:border-white/[0.24] hover:bg-white/[0.1] disabled:border-white/[0.08] disabled:bg-white/[0.03] disabled:text-white/[0.28]"
            disabled={page >= totalPages}
            onClick={onNext}
            aria-label="Next page"
          >
            &#8250;
          </button>
        </div>
      </div>
    </div>
  )
}
