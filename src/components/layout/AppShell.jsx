import { Link, useLocation } from 'react-router-dom'
import AuthNavControl from '../auth/AuthNavControl'
import Dock from '../reactbits/Dock'
import GlassSurface from '../reactbits/GlassSurface'
import Prism from '../reactbits/Prism'

function joinClasses(...values) {
  return values.filter(Boolean).join(' ')
}

function DashboardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4.75 5.75h6.5v5.5h-6.5z" />
      <path d="M12.75 5.75h6.5v8h-6.5z" />
      <path d="M4.75 13.75h6.5v4.5h-6.5z" />
      <path d="M12.75 16.25h6.5v2h-6.5z" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m4.75 10.5 7.25-5.75 7.25 5.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.75 9.75v8.5h10.5v-8.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 18.25v-4.5h4v4.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TransactionsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 6.75h14" />
      <path d="M5 12h14" />
      <path d="M5 17.25h9" />
      <path d="M16.5 15.5 19 18l-2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const dockItems = [
  {
    to: '/',
    label: 'Home',
    icon: <HomeIcon />,
  },
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: <DashboardIcon />,
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: <TransactionsIcon />,
  },
]

export default function AppShell({ children, contentClassName = '', showDock }) {
  const location = useLocation()
  const shouldShowDock = showDock ?? location.pathname !== '/'

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

              <AuthNavControl />
            </div>
          </GlassSurface>
        </div>
      </div>

      <div className={joinClasses('relative z-10', shouldShowDock && 'pb-28', contentClassName)}>
        {children}
      </div>

      {shouldShowDock ? <Dock items={dockItems} /> : null}
    </main>
  )
}
