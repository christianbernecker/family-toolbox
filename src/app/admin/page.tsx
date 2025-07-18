"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Activity, 
  ExternalLink, 
  ArrowRight,
  Settings
} from 'lucide-react';

interface AdminPage {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  available: boolean;
}

export default function AdminPage() {
  const adminPages: AdminPage[] = [
    {
      id: 'api-keys',
      title: 'API-Schlüssel verwalten',
      description: 'Konfiguriere und überwache deine AI-Provider API-Keys mit detaillierten Analytics und Kosten-Tracking.',
      icon: Key,
      href: '/admin/api-keys',
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'system-check',
      title: 'System Check',
      description: 'Umfassende Überprüfung aller Systemkomponenten, Datenbankverbindungen und API-Dienste.',
      icon: Activity,
      href: '/admin/system-check',
      color: 'bg-green-500',
      available: true
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin-Bereich</h1>
        <p className="text-muted-foreground">
          Verwaltung und Überwachung aller Systemkomponenten
        </p>
      </div>

      {/* Verfügbare Admin-Seiten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminPages.filter(page => page.available).map((page) => (
          <Card key={page.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${page.color}`}>
                  <page.icon className="h-6 w-6 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </div>
              <CardTitle className="text-lg">{page.title}</CardTitle>
              <CardDescription className="text-sm">
                {page.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href={page.href} className="flex items-center gap-2">
                  Öffnen
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin-Funktionen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Hier findest du alle verfügbaren Admin-Funktionen. Weitere Funktionen werden in Zukunft hinzugefügt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 