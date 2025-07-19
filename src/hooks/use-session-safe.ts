'use client'

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useSessionSafe() {
  const [mounted, setMounted] = useState(false);
  const [hasWindow, setHasWindow] = useState(false);
  const session = useSession();

  useEffect(() => {
    setHasWindow(typeof window !== 'undefined');
    setMounted(true);
  }, []);

  // During SSR or before mounting: return safe defaults
  if (!mounted || !hasWindow) {
    return {
      data: null,
      status: 'loading' as const,
      mounted: false,
      hasWindow: false
    };
  }

  // After mounting in browser: return actual session
  try {
    return {
      data: session.data,
      status: session.status,
      mounted: true,
      hasWindow: true
    };
  } catch (error) {
    console.warn('useSession failed:', error);
    return {
      data: null,
      status: 'loading' as const,
      mounted: true,
      hasWindow: true
    };
  }
} 