import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import GlassSurface from '../components/reactbits/GlassSurface'
import CardSwap, { Card } from '../components/reactbits/CardSwap'
import Prism from '../components/reactbits/Prism'
import Stack from '../components/reactbits/Stack'

const PHONE_MEDIA_QUERY = '(max-width: 767px)'

const heroCardClasses = [
  'overflow-hidden rounded-[28px] border-white/60 bg-[linear-gradient(180deg,rgba(7,10,24,0.98)_0%,rgba(3,5,14,0.98)_100%)] shadow-[0_32px_80px_rgba(0,0,0,0.52)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/45 after:absolute after:-bottom-12 after:left-1/2 after:h-24 after:w-40 after:-translate-x-1/2 after:rounded-full after:bg-cyan-300/12 after:blur-3xl',
  'overflow-hidden rounded-[28px] border-white/50 bg-[linear-gradient(180deg,rgba(8,9,22,0.96)_0%,rgba(4,5,15,0.96)_100%)] shadow-[0_28px_70px_rgba(0,0,0,0.48)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/38 after:absolute after:-bottom-12 after:left-1/2 after:h-24 after:w-40 after:-translate-x-1/2 after:rounded-full after:bg-indigo-300/12 after:blur-3xl',
  'overflow-hidden rounded-[28px] border-white/45 bg-[linear-gradient(180deg,rgba(7,8,20,0.94)_0%,rgba(4,5,13,0.95)_100%)] shadow-[0_24px_64px_rgba(0,0,0,0.44)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/34 after:absolute after:-bottom-12 after:left-1/2 after:h-24 after:w-40 after:-translate-x-1/2 after:rounded-full after:bg-fuchsia-300/10 after:blur-3xl',
  'overflow-hidden rounded-[28px] border-white/40 bg-[linear-gradient(180deg,rgba(8,8,18,0.92)_0%,rgba(4,4,12,0.92)_100%)] shadow-[0_20px_56px_rgba(0,0,0,0.4)] before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/30 after:absolute after:-bottom-12 after:left-1/2 after:h-24 after:w-40 after:-translate-x-1/2 after:rounded-full after:bg-sky-300/8 after:blur-3xl'
]

const heroStackCardBaseClass =
  'h-full w-full rounded-[28px] border bg-black [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden]'

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  )

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const mediaQuery = window.matchMedia(query)
    const updateMatch = () => setMatches(mediaQuery.matches)

    updateMatch()
    mediaQuery.addEventListener('change', updateMatch)

    return () => mediaQuery.removeEventListener('change', updateMatch)
  }, [query])

  return matches
}

export default function HomePage() {
  const isPhoneViewport = useMediaQuery(PHONE_MEDIA_QUERY)
  const heroCtas = (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <Link
        to="/dashboard"
        className="btn h-12 w-full rounded-2xl border border-white bg-white px-6 text-sm font-semibold text-slate-950 shadow-[0_18px_42px_rgba(166,224,255,0.18)] transition-all duration-150 hover:border-white hover:bg-white/92 hover:shadow-[0_20px_46px_rgba(166,224,255,0.22)] active:translate-y-px active:scale-[0.985] active:shadow-[0_10px_24px_rgba(166,224,255,0.14)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 sm:h-[3.25rem] sm:w-auto"
      >
        See FinSight AI in Action
      </Link>

      <a
        href="#how-it-works"
        className="btn h-12 w-full rounded-2xl border border-white/80 bg-transparent px-6 text-sm font-semibold text-white shadow-none transition-all duration-150 hover:border-white hover:bg-white/10 hover:text-white active:translate-y-px active:scale-[0.985] active:border-white active:bg-white/14 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 sm:h-[3.25rem] sm:w-auto"
      >
        How It Works
      </a>
    </div>
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070411] text-white">

      <div className="absolute inset-0 z-0">
        <Prism
          animationType="3drotate"
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

      <div className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
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

              {/* <div className="flex items-center gap-2">
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
              </div> */}
            </div>
          </GlassSurface>
        </div>
      </div>

      <section className="relative z-10 px-4 pb-10 pt-28 sm:px-6 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-[32px] ">
            <div className="relative grid gap-12 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)] lg:items-center lg:gap-8 lg:px-12 lg:py-12">
              <div className="max-w-none sm:max-w-xl">
                <h1 className="mt-6 max-w-[10.8ch] text-[2.65rem] font-semibold leading-[1.08] tracking-[-0.02em] text-white [text-wrap:balance] sm:max-w-2xl sm:text-5xl sm:leading-[1.03] sm:tracking-[-0.035em] lg:max-w-3xl lg:text-[3.5rem] lg:leading-[1.02] lg:tracking-[-0.04em]">
                  Turn raw transactions into clear financial insights.
                </h1>

                <p className="mt-5 max-w-[31ch] text-[0.98rem] leading-7 text-white/78 sm:max-w-xl sm:text-lg sm:leading-8 sm:text-white/72">
                  Connect your transaction data and let FinSight AI automatically categorize
                  spending, detect patterns, and surface insights you can actually use.
                </p>

                {!isPhoneViewport ? heroCtas : null}
              </div>

              <div className="relative flex min-h-[360px] items-end justify-center lg:min-h-[520px]">
                <div className="absolute left-10 top-14 h-24 w-24 rounded-full bg-cyan-300/14 blur-3xl" />
                <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-fuchsia-500/12 blur-3xl" />

                <div className="relative flex w-full items-end justify-center pb-2 lg:justify-end lg:pr-4">
                  {isPhoneViewport ? (
                    <div className="w-full">
                      <div className="flex justify-center py-4 max-[390px]:scale-[0.9]">
                        <div className="origin-center">
                          <Stack
                            randomRotation
                            sensitivity={110}
                            sendToBackOnClick
                            cardDimensions={{ width: 248, height: 318 }}
                            className="pointer-events-auto"
                            aria-hidden="true"
                          >
                            {heroCardClasses.map((customClass, index) => (
                              <div
                                key={`stack-card-${index}`}
                                className={`${heroStackCardBaseClass} ${customClass}`}
                              />
                            ))}
                          </Stack>
                        </div>
                      </div>

                      {heroCtas}
                    </div>
                  ) : (
                    <div className="origin-bottom translate-y-4 sm:translate-y-6 lg:translate-x-8 lg:translate-y-8">
                      <CardSwap
                        width={360}
                        height={430}
                        cardDistance={38}
                        verticalDistance={30}
                        delay={3600}
                        skewAmount={3}
                        easing="smooth"
                        className="pointer-events-none relative h-[430px] w-[360px] overflow-visible perspective-[1400px]"
                        aria-hidden="true"
                      >
                        {heroCardClasses.map((customClass, index) => (
                          <Card key={index} customClass={customClass} />
                        ))}
                      </CardSwap>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
