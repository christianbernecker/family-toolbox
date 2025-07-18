"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Activity, 
  Settings, 
  ExternalLink, 
  ArrowRight,
  Shield,
  BarChart3,
  Database,
  Zap
} from 'lucide-react';
import { ApiKeyService } from '@/lib/services/api-key-service';
import { signOut } from 'next-auth/react';

interface AdminFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  status?: string;
}

export default function SettingsPage() {
  const [apiKeys, setApiKeys] = useState<{ openai: string; anthropic: string }>({ openai: '', anthropic: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApiKeyStatus();
  }, []);

  async function fetchApiKeyStatus() {
    try {
      setLoading(true);
      
      const maskedKeys = await ApiKeyService.getMaskedApiKeys();
      
      const displayKeys = {
        openai: maskedKeys.openai === 'OPENAI_API_KEY_SET' ? 'Konfiguriert' : 'Nicht konfiguriert',
        anthropic: maskedKeys.anthropic === 'ANTHROPIC_API_KEY_SET' ? 'Konfiguriert' : 'Nicht konfiguriert'
      };
      
      setApiKeys(displayKeys);
      
    } catch (err) {
      console.error('Error fetching API keys:', err);
      setApiKeys({ openai: 'Fehler beim Laden', anthropic: 'Fehler beim Laden' });
    } finally {
      setLoading(false);
    }
  }

  const adminFeatures: AdminFeature[] = [
    {
      id: 'api-keys',
      title: 'API-Schlüssel verwalten',
      description: 'Konfiguriere und überwache deine AI-Provider API-Keys mit detaillierten Analytics und Kosten-Tracking.',
      icon: Key,
      href: '/admin/api-keys',
      color: 'bg-blue-500',
      status: `${apiKeys.openai === 'Konfiguriert' ? 1 : 0}/${apiKeys.anthropic === 'Konfiguriert' ? 1 : 0} APIs konfiguriert`
    },
    {
      id: 'system-check',
      title: 'System Check',
      description: 'Umfassende Überprüfung aller Systemkomponenten, Datenbankverbindungen und API-Dienste.',
      icon: Activity,
      href: '/admin/system-check',
      color: 'bg-green-500'
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Detaillierte Einblicke in API-Nutzung, Token-Verbrauch, Kosten und Performance-Metriken.',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500'
    },
    {
      id: 'database',
      title: 'Datenbank-Verwaltung',
      description: 'Überwachung der Datenbankverbindung, Tabellen-Status und Backup-Informationen.',
      icon: Database,
      href: '/admin/database',
      color: 'bg-orange-500'
    },
    {
      id: 'logs',
      title: 'System-Logs',
      description: 'Zentralisierte Anzeige aller System-Logs, Fehler und Performance-Metriken.',
      icon: Zap,
      href: '/admin/logs',
      color: 'bg-red-500'
    },
    {
      id: 'security',
      title: 'Sicherheit & Zugriff',
      description: 'Verwaltung von Benutzerberechtigungen, Session-Monitoring und Sicherheits-Einstellungen.',
      icon: Shield,
      href: '/admin/security',
      color: 'bg-indigo-500'
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin-Bereich</h1>
          <p className="text-muted-foreground mt-2">
            Verwaltung und Überwachung aller Systemkomponenten
          </p>
        </div>
        <Button
          variant="destructive"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Log&nbsp;out
        </Button>
      </div>

      {/* Admin Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature) => (
          <Card key={feature.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${feature.color}`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription className="text-sm">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {feature.status && (
                  <div className="text-sm text-muted-foreground">
                    {feature.status}
                  </div>
                )}
                <Button asChild size="sm" className="ml-auto">
                  <a href={feature.href} className="flex items-center gap-2">
                    Öffnen
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Schnell-Übersicht
          </CardTitle>
          <CardDescription>
            Aktueller Status wichtiger Systemkomponenten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Key className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-medium">API-Keys</div>
                <div className="text-sm text-muted-foreground">
                  {loading ? 'Lädt...' : `${apiKeys.openai === 'Konfiguriert' ? 1 : 0}/${apiKeys.anthropic === 'Konfiguriert' ? 1 : 0} konfiguriert`}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <div className="font-medium">System-Status</div>
                <div className="text-sm text-muted-foreground">
                  Überprüfung erforderlich
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <div className="font-medium">Analytics</div>
                <div className="text-sm text-muted-foreground">
                  Verfügbar
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnell-Aktionen</CardTitle>
          <CardDescription>
            Häufig verwendete Admin-Funktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <a href="/admin/api-keys">
                <Key className="h-4 w-4 mr-2" />
                API-Keys verwalten
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin/system-check">
                <Activity className="h-4 w-4 mr-2" />
                System-Check
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="/tools">
                <Settings className="h-4 w-4 mr-2" />
                Zurück zu Tools
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 