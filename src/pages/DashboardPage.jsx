import { Link } from 'react-router-dom'

export default function DashboardPage() {
  return (
    <main className="min-h-screen px-6 py-12 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
              Dashboard Route
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral">Dashboard</h1>
          </div>

          <Link to="/" className="btn btn-outline">
            Back Home
          </Link>
        </div>

        <div className="hero rounded-[2rem] border border-base-300 bg-base-100 shadow-xl">
          <div className="hero-content w-full flex-col items-start gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight">
                The route shell is ready for the old transaction UI to move in.
              </h2>
              <p className="mt-3 text-base leading-7 text-base-content/65">
                I left this as a clean themed placeholder so the new homepage and the dashboard path
                feel connected while the module split continues.
              </p>
            </div>

            <div className="stats border border-base-300 bg-base-200 shadow-sm">
              <div className="stat">
                <div className="stat-title">Status</div>
                <div className="stat-value text-primary">Shell</div>
                <div className="stat-desc">Ready for dashboard migration</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
