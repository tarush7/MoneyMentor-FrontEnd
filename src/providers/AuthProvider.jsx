import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [isAuthReady, setIsAuthReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return

      if (error) {
        setSession(null)
      } else {
        setSession(data.session ?? null)
      }

      setIsAuthReady(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null)
      setIsAuthReady(true)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session?.user),
      isAuthReady,
    }),
    [isAuthReady, session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)

  if (!value) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return value
}
