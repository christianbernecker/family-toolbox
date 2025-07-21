"use client";

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionSafe } from '@/hooks/use-session-safe';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSessionSafe();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated') {
      // Redirect to tools page as main interface
      router.push('/tools');
    }
  }, [status, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">
          Weiterleitung zu den Tools...
        </p>
      </div>
    </div>
  );
} 