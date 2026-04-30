import AppShell from '../components/layout/AppShell'
import TotalSpendThisMonthCard from '../features/dashboard/components/kpis/TotalSpendThisMonthCard'
import { useDashboardKpisQuery } from '../features/dashboard/hooks/useDashboardKpisQuery'
import { useAuth } from '../providers/AuthProvider'

function joinClasses(...values) {
  return values.filter(Boolean).join(' ')
}

function DashboardSkeletonCard({ title, subtitle, className = '', children }) {
  return (
    <section
      className={joinClasses(
        'h-full rounded-[28px] bg-[linear-gradient(180deg,rgba(13,16,34,0.72)_0%,rgba(6,8,18,0.74)_100%)] p-6 shadow-[0_24px_54px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-7',
        className
      )}
    >
      <div className="flex h-full flex-col gap-5">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          {subtitle ? <p className="text-sm leading-6 text-white/45">{subtitle}</p> : null}
        </div>

        {children ? <div className="flex flex-1 flex-col">{children}</div> : <div className="flex-1" />}
      </div>
    </section>
  )
}

function PlaceholderPanel({ label, className = '' }) {
  return (
    <div
      className={joinClasses(
        'flex flex-1 items-center justify-center rounded-[22px] border border-dashed border-white/12 bg-white/[0.03] text-sm font-medium text-white/30',
        className
      )}
    >
      {label}
    </div>
  )
}

function PlaceholderRows({ rows = 4 }) {
  return (
    <div className="flex flex-1 flex-col gap-3">
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className={joinClasses(
            'rounded-[18px] border border-white/8 bg-white/[0.03]',
            index === 0 ? 'h-10' : 'h-12'
          )}
        />
      ))}
    </div>
  )
}

const rowGridClass = 'grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12'

export default function DashboardPage() {
  const { isAuthReady, isAuthenticated } = useAuth()
  const dashboardKpisQuery = useDashboardKpisQuery({
    enabled: isAuthReady && isAuthenticated,
  })

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
            Dashboard Layout
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="max-w-2xl text-sm leading-6 text-white/55">
            Wireframe-only layout for reviewing grid structure, spacing, and alignment.
          </p>
        </div>

        <div className="space-y-4">
          <div className={rowGridClass}>
            <div className="md:col-span-3 lg:col-span-3">
              <TotalSpendThisMonthCard
                isAuthReady={isAuthReady}
                isAuthenticated={isAuthenticated}
                kpisQuery={dashboardKpisQuery}
              />
            </div>

            {['Net Cash Flow This Month', 'Daily Burn Rate', 'Biggest Expense This Month'].map((title) => (
              <div key={title} className="md:col-span-3 lg:col-span-3">
                <DashboardSkeletonCard
                  title={title}
                  subtitle="KPI card next"
                  className="min-h-[148px]"
                />
              </div>
            ))}
          </div>

          <div className={rowGridClass}>
            <div className="md:col-span-6 lg:col-span-5">
              <DashboardSkeletonCard
                title="Welcome"
                subtitle="Intro card placeholder"
                className="min-h-[220px]"
              >
                <PlaceholderPanel label="Content placeholder" />
              </DashboardSkeletonCard>
            </div>

            <div className="md:col-span-3 lg:col-span-3">
              <DashboardSkeletonCard
                title="Satisfaction"
                subtitle="Chart placeholder"
                className="min-h-[220px]"
              >
                <PlaceholderPanel label="Empty chart area" />
              </DashboardSkeletonCard>
            </div>

            <div className="md:col-span-3 lg:col-span-4">
              <DashboardSkeletonCard
                title="Referral"
                subtitle="Chart placeholder"
                className="min-h-[220px]"
              >
                <PlaceholderPanel label="Empty chart area" />
              </DashboardSkeletonCard>
            </div>
          </div>

          <div className={rowGridClass}>
            <div className="md:col-span-6 lg:col-span-7">
              <DashboardSkeletonCard
                title="Sales Overview"
                subtitle="Chart placeholder"
                className="min-h-[300px]"
              >
                <PlaceholderPanel label="Large chart area" />
              </DashboardSkeletonCard>
            </div>

            <div className="md:col-span-6 lg:col-span-5">
              <DashboardSkeletonCard
                title="Active Users"
                subtitle="Chart placeholder"
                className="min-h-[300px]"
              >
                <PlaceholderPanel label="Chart area" />
              </DashboardSkeletonCard>
            </div>
          </div>

          <div className={rowGridClass}>
            <div className="md:col-span-6 lg:col-span-8">
              <DashboardSkeletonCard
                title="Projects"
                subtitle="Table placeholder"
                className="min-h-[320px]"
              >
                <PlaceholderRows rows={5} />
              </DashboardSkeletonCard>
            </div>

            <div className="md:col-span-6 lg:col-span-4">
              <DashboardSkeletonCard
                title="Orders Overview"
                subtitle="Table placeholder"
                className="min-h-[320px]"
              >
                <PlaceholderRows rows={4} />
              </DashboardSkeletonCard>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
