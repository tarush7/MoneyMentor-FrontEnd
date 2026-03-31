import { Link } from 'react-router-dom'
import GlassSurface from '../components/reactbits/GlassSurface'
import Prism from '../components/reactbits/Prism'

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070411] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(54,34,110,0.34),_transparent_34%),linear-gradient(180deg,_#090312_0%,_#070411_52%,_#05030d_100%)]" />

      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Prism
          bloom={0.8}
          glow={0.9}
          timeScale={0.35}
          maxDpr={1}
          raySteps={56}
          frameRate={30}
          pauseWhenHidden
          suspendWhenOffscreen
        />
      </div>

      {/* Glass nav */}
      <div className="sticky top-0 z-50 px-4 pt-4">
        <div className="mx-auto max-w-5xl">
          <GlassSurface
            as="nav"
            renderMode="css"
            appearance="dark"
            borderRadius={999}
            backgroundOpacity={0.14}
            className="mx-auto w-full max-w-3xl border border-white/10"
            contentClassName="px-5 py-3 sm:px-6"
            aria-label="Primary"
          >
            <div className="flex w-full items-center justify-between gap-6">
              <Link to="/" className="text-lg font-semibold tracking-tight text-white">
                FinSight AI
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="rounded-full px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/8 hover:text-white"
                >
                  Home
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-full px-3 py-2 text-sm font-medium text-white/72 transition hover:bg-white/8 hover:text-white"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </GlassSurface>
        </div>
      </div>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-100px)] w-full max-w-5xl flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-300/90">Home</p>

        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
          Keep the homepage simple for now.
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-white/68">
          This route only needs the basics while we shape the actual product experience.
        </p>

        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_42px_rgba(166,224,255,0.18)] transition hover:bg-cyan-100"
          >
            Open Dashboard
          </Link>
        </div>
      </section>
    </main>
  )
}
