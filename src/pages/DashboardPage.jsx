import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8 px-6 pb-12 pt-28 lg:px-10 lg:pt-32">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/75">
              Dashboard Route
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-white">Dashboard</h1>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(7,10,24,0.92)_0%,rgba(3,5,14,0.94)_100%)] shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
          <div className="flex w-full flex-col items-start gap-6 p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                The route shell is ready for the old transaction UI to move in.
              </h2>
              <p className="mt-3 text-base leading-7 text-white/65">
                I left this as a clean themed placeholder so the new homepage and the dashboard path
                feel connected while the module split continues.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/12 bg-white/6 px-6 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                  Status
                </div>
                <div className="text-3xl font-semibold tracking-tight text-cyan-200">Shell</div>
                <div className="text-sm text-white/55">Ready for dashboard migration</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
