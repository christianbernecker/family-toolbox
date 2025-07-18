"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileCheck, Bot, ArrowRight, Settings, Mail } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToolManagementService, Tool } from "@/lib/services/tool-management";
import Image from 'next/image';

// Icon mapping
const iconMap = {
  FileCheck: FileCheck,
  Bot: Bot,
  Mail: Mail,
};

// User Greeting Component
function UserGreeting({ user }: { user: { name?: string | null; image?: string | null } }) {
  if (!user) return null;

  return (
    <div className="flex items-center space-x-4 mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {user.image && (
        <Image
          src={user.image}
          alt={user.name || 'Profilbild'}
          width={56}
          height={56}
          className="rounded-full"
        />
      )}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Willkommen zurück, {user.name?.split(' ')[0] || 'Nutzer'}!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Wähle ein Tool, um zu starten.
        </p>
      </div>
    </div>
  );
}

export default function ToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toolManager = new ToolManagementService();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Load active tools
  useEffect(() => {
    if (session) {
      loadActiveTools();
    }
  }, [session]);

  const loadActiveTools = async () => {
    try {
      setLoading(true);
      const activeTools = await toolManager.getActiveTools();
      setTools(activeTools);
    } catch (err) {
      setError('Fehler beim Laden der Tools');
      console.error('Error loading tools:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-red-700">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                  Family Toolbox
                </span>
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          </div>
        </main>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = session?.user?.email === 'chr.bernecker@gmail.com' || 
                 session?.user?.email === 'amandabernecker@gmail.com';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-red-700">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
                Family Toolbox
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Einstellungen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* User Greeting */}
        {session?.user && <UserGreeting user={session.user} />}
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verfügbare Tools
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {tools.length > 0 
              ? `${tools.length} aktivierte Tools verfügbar` 
              : 'Keine Tools verfügbar'
            }
          </p>
        </div>

        {error && (
          <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {tools.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-200 dark:bg-gray-700">
                <Settings className="h-10 w-10 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Keine Tools verfügbar
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
              Derzeit sind keine Tools aktiviert.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => {
              const IconComponent = iconMap[tool.icon as keyof typeof iconMap] || FileCheck;
              
              return (
                <div
                  key={tool.id}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="h-2 bg-gradient-to-r from-red-500 to-red-700" />
                  <div className="p-8">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${tool.color}`}>
                        <IconComponent className="h-8 w-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {tool.name}
                        </h3>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {tool.description}
                    </p>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Features:
                      </h4>
                      <ul className="space-y-2">
                        {tool.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-3" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Link href={tool.href}>
                      <Button className="w-full bg-gradient-to-r from-red-500 to-red-700">
                        Tool öffnen
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
} 