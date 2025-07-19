'use client';

import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with useSession
const EmailAgentPageContent = dynamic(() => import('./EmailAgentPageContent'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📧 E-Mail Agent
        </h1>
        <p className="text-gray-600">
          Lade...
        </p>
      </div>
    </div>
  </div>
});

export default function EmailAgentPage() {
  return <EmailAgentPageContent />;
} 