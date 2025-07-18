import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Key, Home, Activity, Settings } from 'lucide-react';
import { UserNav } from '@/components/auth/user-nav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'API Keys', href: '/admin/api-keys', icon: Key },
    { name: 'System Check', href: '/admin/system-check', icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex h-16 items-center justify-center border-b border-gray-200 dark:border-gray-800">
          <Link href="/tools" className="flex items-center space-x-2">
            <Settings className="h-6 w-6 text-red-500" />
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <Button variant="ghost" className="w-full justify-start">
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex h-16 items-center justify-end border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-8">
          <UserNav />
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 