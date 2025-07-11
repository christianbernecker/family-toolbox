'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Wrench, 
  BarChart3, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  Info
} from 'lucide-react';
import { ToolCard } from '@/components/tools/tool-card';
import { ToolToggle } from '@/components/tools/tool-toggle';
import { toolManager, type ToolStatus } from '@/lib/tools/manager';
import { toolRegistry } from '@/lib/tools/registry';
import { ApiKeysForm } from '@/components/settings/api-keys-form';
import { PreferencesForm } from '@/components/settings/preferences-form';
import type { UserSettings } from '@/lib/types/database';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [tools, setTools] = useState<ToolStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{
    totalTools: number;
    activeTools: number;
    inactiveTools: number;
    toolsWithErrors: number;
    lastActivity?: string;
  } | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      loadTools();
      loadStats();
      loadUserSettings();
    }
  }, [session?.user?.id]);

  const loadTools = async () => {
    try {
      if (!session?.user?.id) return;
      
      setLoading(true);
      const userTools = await toolManager.getAllUserTools(session.user.id);
      setTools(userTools);
      setError(null);
    } catch (err) {
      console.error('Error loading tools:', err);
      setError('Fehler beim Laden der Tools');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      if (!session?.user?.id) return;
      
      const userStats = await toolManager.getUserToolStats(session.user.id);
      setStats(userStats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadUserSettings = async () => {
    try {
      if (!session?.user?.id) return;
      
      const response = await fetch('/api/settings');
      if (response.ok) {
        const result = await response.json();
        setUserSettings(result.data);
      }
    } catch (err) {
      console.error('Error loading user settings:', err);
    }
  };

  const handleToggleTool = async (toolId: string) => {
    try {
      if (!session?.user?.id) return;
      
      // Optimistic update
      setTools(prev => prev.map(tool => 
        tool.tool.id === toolId 
          ? { ...tool, isActive: !tool.isActive }
          : tool
      ));

      // API call
      const response = await fetch(`/api/tools/${toolId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle tool');
      }

      // Reload tools to get updated state
      await loadTools();
      await loadStats();
    } catch (err) {
      console.error('Error toggling tool:', err);
      // Revert optimistic update on error
      await loadTools();
      setError('Fehler beim Aktivieren/Deaktivieren des Tools');
    }
  };

  const handleRefresh = async () => {
    await loadTools();
    await loadStats();
    await loadUserSettings();
  };

  const activeTools = tools.filter(t => t.isActive);
  const inactiveTools = tools.filter(t => !t.isActive);
  const toolsWithErrors = tools.filter(t => t.hasErrors);

  const getToolsByCategory = (category: string) => {
    return tools.filter(tool => tool.tool.category === category);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Lade Tools...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Einstellungen</h1>
            <p className="text-gray-600 mt-2">
              Verwalte deine Tools und Konfigurationen
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTools}</div>
              <p className="text-xs text-muted-foreground">Tools verfügbar</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktiv</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeTools}</div>
              <p className="text-xs text-muted-foreground">Tools aktiviert</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inaktiv</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactiveTools}</div>
              <p className="text-xs text-muted-foreground">Tools deaktiviert</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fehler</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.toolsWithErrors}</div>
              <p className="text-xs text-muted-foreground">Tools mit Fehlern</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="tools" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="tools">Tools ({tools.length})</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="preferences">Einstellungen</TabsTrigger>
          <TabsTrigger value="active">Aktiv ({activeTools.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inaktiv ({inactiveTools.length})</TabsTrigger>
          <TabsTrigger value="registry">Registry</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {tools.map((toolStatus) => (
              <ToolCard
                key={toolStatus.tool.id}
                toolStatus={toolStatus}
                onToggle={handleToggleTool}
                onOpenSettings={(toolId) => {
                  console.log('Open settings for', toolId);
                }}
                onOpenInfo={(toolId) => {
                  console.log('Open info for', toolId);
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <ApiKeysForm 
            onSave={(keys) => {
              console.log('API Keys saved:', keys);
            }}
          />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <PreferencesForm 
            initialSettings={userSettings?.preferences}
            onSave={(preferences) => {
              console.log('Preferences saved:', preferences);
              loadUserSettings(); // Reload settings
            }}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeTools.map((toolStatus) => (
              <ToolCard
                key={toolStatus.tool.id}
                toolStatus={toolStatus}
                onToggle={handleToggleTool}
                onOpenSettings={(toolId) => {
                  console.log('Open settings for', toolId);
                }}
                onOpenInfo={(toolId) => {
                  console.log('Open info for', toolId);
                }}
              />
            ))}
          </div>
          {activeTools.length === 0 && (
            <Card className="p-8">
              <div className="text-center">
                <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Keine aktiven Tools
                </h3>
                <p className="text-gray-500">
                  Aktiviere Tools um sie hier zu sehen.
                </p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <div className="space-y-4">
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
        </TabsContent>

        <TabsContent value="registry" className="space-y-4">
          {/* Tool Registry Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Tool Registry Information
              </CardTitle>
              <CardDescription>
                Übersicht über alle verfügbaren Tools in der Family Toolbox
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Status</h4>
                  <div className="space-y-1">
                    {Object.entries(toolRegistry.getToolStats().byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <Badge variant={status === 'stable' ? 'default' : status === 'beta' ? 'secondary' : 'destructive'}>
                          {status}
                        </Badge>
                        <span className="text-sm">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Kategorien</h4>
                  <div className="space-y-1">
                    {Object.entries(toolRegistry.getToolStats().byCategory).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{category}</span>
                        <span className="text-sm">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Gesamt</h4>
                  <div className="text-2xl font-bold">{toolRegistry.getToolStats().total}</div>
                  <p className="text-sm text-gray-500">Tools verfügbar</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
  );
} 