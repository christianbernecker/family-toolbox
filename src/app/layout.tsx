import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth/providers';
import { Toaster } from '@/components/ui/toaster';
import { Metadata } from 'next';

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
