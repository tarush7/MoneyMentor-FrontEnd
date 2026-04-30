function joinClasses(...values) {
  return values.filter(Boolean).join(' ')
}

export default function DashboardKpiCard({
  title,
  subtitle,
  value,
  meta,
  className = '',
  toneClassName = 'text-white',
}) {
  return (
    <section
      className={joinClasses(
        'h-full rounded-[28px] bg-[linear-gradient(180deg,rgba(13,16,34,0.72)_0%,rgba(6,8,18,0.74)_100%)] p-6 shadow-[0_24px_54px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7',
        className
      )}
    >
      <div className="flex h-full flex-col gap-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          {subtitle ? <p className="text-sm leading-6 text-white/45">{subtitle}</p> : null}
        </div>

        <div className="mt-auto space-y-3">
          <div className={joinClasses('text-3xl font-semibold tracking-tight sm:text-[2rem]', toneClassName)}>
            {value}
          </div>

          {meta ? (
            <div className="text-sm leading-6 text-white/52">
              {meta}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
