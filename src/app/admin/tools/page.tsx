"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Shield, Loader2, Check, X } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToolManagementService, Tool } from "@/lib/services/tool-management";

export default function AdminToolsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toolManager = new ToolManagementService();

  // Check authentication and admin status
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
      return;
    }

    if (status === 'authenticated') {
      const isAdmin = session?.user?.email === 'chr.bernecker@gmail.com' || 
                     session?.user?.email === 'amandabernecker@gmail.com';
      
      if (!isAdmin) {
        router.push('/tools');
        return;
      }

      loadAllTools();
    }
  }, [status, session, router]);

  const loadAllTools = async () => {
    try {
      setLoading(true);
      const allTools = await toolManager.getAllTools();
      setTools(allTools);
    } catch (err) {
      setError('Fehler beim Laden der Tools');
      console.error('Error loading tools:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToolToggle = async (toolId: string, isActive: boolean) => {
    if (!session?.user?.id) return;

    try {
      setUpdating(toolId);
      setError(null);
      setSuccess(null);

      const result = await fetch('/api/admin/tools/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toolId,
          isActive,
        }),
      });

      if (!result.ok) {
        throw new Error('Fehler beim Aktualisieren des Tool-Status');
      }

      // Update local state
      setTools(prevTools =>
        prevTools.map(tool =>
          tool.id === toolId ? { ...tool, isActive } : tool
        )
      );

      setSuccess(`Tool "${tools.find(t => t.id === toolId)?.name}" wurde ${isActive ? 'aktiviert' : 'deaktiviert'}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren');
      console.error('Error updating tool status:', err);
    } finally {
      setUpdating(null);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Tool-Verwaltung
              </h1>
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

  const activeToolsCount = tools.filter(tool => tool.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/tools">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Tool-Verwaltung
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {activeToolsCount} von {tools.length} Tools aktiv
              </div>
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Verfügbare Tools verwalten
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Aktivieren oder deaktivieren Sie Tools für alle Familienmitglieder
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center space-x-3">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-center space-x-3">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-green-800 dark:text-green-200">{success}</p>
            </div>
          </div>
        )}

        {/* Tools List */}
        <div className="space-y-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tool.color}`}>
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {tool.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tool.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {tool.isActive ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {tool.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Features:
                      </h4>
                      <ul className="space-y-1">
                        {tool.features.slice(0, 2).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <div className="h-1.5 w-1.5 rounded-full bg-red-500 mr-3" />
                            {feature}
                          </li>
                        ))}
                        {tool.features.length > 2 && (
                          <li className="text-sm text-gray-500 dark:text-gray-400">
                            +{tool.features.length - 2} weitere Features
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Details:
                      </h4>
                      <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                        <li>Tool-ID: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{tool.id}</code></li>
                        <li>Reihenfolge: {tool.order}</li>
                        <li>Zuletzt aktualisiert: {new Date(tool.updatedAt).toLocaleDateString('de-DE')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Toggle Switch */}
                <div className="ml-6 flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {tool.isActive ? 'Aktiviert' : 'Deaktiviert'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Für alle Benutzer
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {updating === tool.id && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                    <Switch
                      checked={tool.isActive}
                      onCheckedChange={(checked) => handleToolToggle(tool.id, checked)}
                      disabled={updating === tool.id}
                      className="data-[state=checked]:bg-red-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Administrator-Hinweis
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                Änderungen werden sofort für alle Familienmitglieder wirksam. 
                Deaktivierte Tools sind nicht in der Tool-Übersicht sichtbar.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 