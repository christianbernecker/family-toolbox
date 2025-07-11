"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileCheck, 
  Bot, 
  Activity,
  Users,
  Settings,
  ArrowRight,
  LogOut,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { SignOutButton } from "@/components/auth/signout-button";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ToolToggle } from "@/components/tools/tool-toggle";
import { toolManager, type ToolStatus } from "@/lib/tools/manager";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [tools, setTools] = useState<ToolStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalTools: number;
    activeTools: number;
    inactiveTools: number;
    toolsWithErrors: number;
    lastActivity?: string;
  } | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadTools();
      loadStats();
    }
  }, [session?.user?.id]);

  const loadTools = async () => {
    try {
      if (!session?.user?.id) return;
      
      setLoading(true);
      const userTools = await toolManager.getAllUserTools(session.user.id);
      setTools(userTools);
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      if (!session?.user?.id) return;
      
      const userStats = await toolManager.getUserToolStats(session.user.id);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleToggleTool = async (toolId: string) => {
    try {
      if (!session?.user?.id) return;
      
      const response = await fetch(`/api/tools/${toolId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle tool');
      }

      await loadTools();
      await loadStats();
    } catch (error) {
      console.error('Error toggling tool:', error);
    }
  };

  const activeTools = tools.filter(t => t.isActive);
  const inactiveTools = tools.filter(t => !t.isActive);
  const toolsWithErrors = tools.filter(t => t.hasErrors);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {session?.user?.name}
              </span>
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
              </Link>
              <SignOutButton className="text-sm" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Willkommen zurück, {session?.user?.name}!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Hier ist Ihre Tool-Übersicht für die Familie
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Aktive Tools</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.activeTools || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Gesamt Tools</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalTools || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inaktive Tools</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.inactiveTools || 0}
                </p>
              </div>
              <Settings className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fehler</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.toolsWithErrors || 0}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Verfügbare Tools
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                loadTools();
                loadStats();
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Aktualisieren
            </Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-6 h-6 animate-spin" />
                <span>Lade Tools...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Tools */}
              {activeTools.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    Aktive Tools ({activeTools.length})
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {activeTools.map((toolStatus) => (
                      <ToolToggle
                        key={toolStatus.tool.id}
                        toolStatus={toolStatus}
                        onToggle={handleToggleTool}
                        onOpenDetails={(toolId) => {
                          console.log('Open details for', toolId);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Inactive Tools */}
              {inactiveTools.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <Settings className="h-5 w-5 text-gray-500 mr-2" />
                    Inaktive Tools ({inactiveTools.length})
                  </h4>
                  <div className="space-y-3">
                    {inactiveTools.map((toolStatus) => (
                      <ToolToggle
                        key={toolStatus.tool.id}
                        toolStatus={toolStatus}
                        onToggle={handleToggleTool}
                        onOpenDetails={(toolId) => {
                          console.log('Open details for', toolId);
                        }}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tools with Errors */}
              {toolsWithErrors.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-red-700 dark:text-red-400 mb-3 flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    Tools mit Fehlern ({toolsWithErrors.length})
                  </h4>
                  <div className="space-y-3">
                    {toolsWithErrors.map((toolStatus) => (
                      <ToolToggle
                        key={toolStatus.tool.id}
                        toolStatus={toolStatus}
                        onToggle={handleToggleTool}
                        onOpenDetails={(toolId) => {
                          console.log('Open details for', toolId);
                        }}
                        compact={true}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              {/* No Tools Available */}
              {tools.length === 0 && (
                <div className="text-center py-12">
                  <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Keine Tools verfügbar
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Es sind noch keine Tools konfiguriert.
                  </p>
                  <Link href="/dashboard/settings">
                    <Button>
                      Zu den Einstellungen
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Letzte Aktivitäten
          </h3>
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-center text-gray-500 dark:text-gray-400">
              Noch keine Aktivitäten vorhanden
            </p>
          </div>
        </div>
      </main>
    </div>
    </AuthGuard>
  );
} 