import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '../../providers/AuthProvider'
import { supabase } from '../../supabase'
import { closeLoginModal, openLoginModal } from '../../store/slices/loginSlice'

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 12a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
      <path
        d="M5.5 19.25a6.5 6.5 0 0 1 13 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m5 5 10 10" strokeLinecap="round" />
      <path d="M15 5 5 15" strokeLinecap="round" />
    </svg>
  )
}

export default function AuthNavControl() {
  const { user, isAuthenticated, isAuthReady } = useAuth()
  const dispatch = useDispatch()
  const isOpen = useSelector((state) => state.login.isLoginModalOpen)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(closeLoginModal())
      setPassword('')
      setErrorMessage('')
    }
  }, [dispatch, isAuthenticated])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        dispatch(closeLoginModal())
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [dispatch, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage('')
    }
  }, [isOpen])

  const handleSignIn = async (event) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
  }

  const handleSignOut = async () => {
    setIsSubmitting(true)
    setErrorMessage('')

    const { error } = await supabase.auth.signOut()

    if (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
      return
    }

    setIsSubmitting(false)
    dispatch(closeLoginModal())
  }

  const modal = isOpen ? (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-[#05030d]/72 backdrop-blur-sm"
        onClick={() => dispatch(closeLoginModal())}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(16,20,40,0.9)_0%,rgba(7,9,19,0.94)_100%)] shadow-[0_28px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/[0.44]">
              Access
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {isAuthenticated ? 'Account' : 'Sign In'}
            </h2>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/[0.7] transition-colors duration-150 hover:bg-white/[0.08] hover:text-white"
            onClick={() => dispatch(closeLoginModal())}
            aria-label="Close login dialog"
          >
            <CloseIcon />
          </button>
        </div>

        {isAuthenticated ? (
          <div className="space-y-5 px-6 py-6">
            <div className="rounded-[1.4rem] border border-white/[0.08] bg-white/[0.04] px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.42]">
                Signed In As
              </div>
              <div className="mt-2 break-all text-sm font-medium text-white/[0.9]">
                {user?.email}
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-xl border border-rose-300/15 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="button"
              className="btn h-11 w-full rounded-2xl border border-white/[0.15] bg-white/[0.06] text-white shadow-none transition-all duration-150 hover:border-white/[0.24] hover:bg-white/[0.1]"
              onClick={handleSignOut}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing out...' : 'Sign out'}
            </button>
          </div>
        ) : (
          <form className="space-y-5 px-6 py-6" onSubmit={handleSignIn}>
            <p className="text-sm leading-6 text-white/[0.64]">
              Sign in with your Supabase account to unlock the full transaction dataset.
            </p>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.44]">
                Email
              </span>
              <input
                type="email"
                className="input h-12 p-2 w-full rounded-2xl border-white/[0.12] bg-white/[0.06] text-white shadow-none outline-none placeholder:text-white/[0.35] focus:border-cyan-200/[0.35] focus:outline-none"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.44]">
                Password
              </span>
              <input
                type="password"
                className="input h-12 p-2 w-full rounded-2xl border-white/[0.12] bg-white/[0.06] text-white shadow-none outline-none placeholder:text-white/[0.35] focus:border-cyan-200/[0.35] focus:outline-none"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>

            {errorMessage ? (
              <div className="rounded-xl border border-rose-300/15 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              className="btn h-12 w-full rounded-2xl border border-white bg-white px-6 text-sm font-semibold text-slate-950 shadow-[0_18px_42px_rgba(166,224,255,0.18)] transition-all duration-150 hover:border-white hover:bg-white/92 hover:shadow-[0_20px_46px_rgba(166,224,255,0.22)] disabled:border-white/70 disabled:bg-white/70 disabled:text-slate-900/70"
              disabled={isSubmitting || !isAuthReady}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        )}
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        type="button"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition-all duration-150 hover:border-white/18 hover:bg-white/[0.08] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
        onClick={() => dispatch(openLoginModal())}
        aria-label={isAuthenticated ? 'Account' : 'Login'}
      >
        {isAuthReady ? (
          <UserIcon />
        ) : (
          <span className="loading loading-spinner loading-xs text-cyan-200" />
        )}

        {isAuthenticated ? (
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(165,243,252,0.9)]" />
        ) : null}
      </button>

      {typeof document !== 'undefined' ? createPortal(modal, document.body) : null}
    </>
  )
}
