import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamic import for AuthProvider to avoid SSR issues
const AuthProvider = dynamic(() => import('@/lib/auth/providers').then(mod => ({ default: mod.AuthProvider })), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Family Toolbox',
  description: 'AI-gestützte Tools für die Familie.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
