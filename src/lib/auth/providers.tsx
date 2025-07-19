'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode, useEffect, useState } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [mounted, setMounted] = useState(false)
  const [hasWindow, setHasWindow] = useState(false)

  useEffect(() => {
    // Check if we're in browser environment
    setHasWindow(typeof window !== 'undefined')
    setMounted(true)
  }, [])

  // During SSR or before mounting: render without any providers
  if (!mounted || !hasWindow) {
    return <div suppressHydrationWarning>{children}</div>
  }

  // Only after mounting and confirming browser environment
  try {
    return (
      <SessionProvider 
        refetchInterval={0}
        refetchOnWindowFocus={false}
      >
        {children}
      </SessionProvider>
    )
  } catch (error) {
    // Fallback if SessionProvider fails
    console.warn('SessionProvider failed, rendering without auth:', error)
    return <div>{children}</div>
  }
} 