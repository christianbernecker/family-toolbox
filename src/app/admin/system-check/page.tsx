"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, Activity } from 'lucide-react';

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'error';
  details: Record<string, any>;
}

export default function SystemCheckPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  useEffect(() => {
    runSystemHealthCheck();
  }, []);

  async function runSystemHealthCheck() {
    try {
      setHealthLoading(true);
      console.log('🧪 Running system health check...');
      
      const response = await fetch('/api/system-test');
      const healthData = await response.json();
      
      console.log('🧪 Health check results:', healthData);
      
      // Bestimme Overall-Status
      let overallStatus: 'healthy' | 'warning' | 'error' = 'healthy';
      
      if (!response.ok || !healthData.summary?.overallSuccess) {
        overallStatus = 'error';
      } else if (healthData.summary.failedTests > 0) {
        overallStatus = 'warning';
      }
      
      setSystemHealth({
        overall: overallStatus,
        details: healthData
      });
      
    } catch (error) {
      console.error('🧪 Health check failed:', error);
      setSystemHealth({
        overall: 'error',
        details: {
          error: 'Health check failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      setHealthLoading(false);
    }
  }

  const getHealthStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Check</h1>
        <p className="text-muted-foreground">
          Umfassende Überprüfung aller Systemkomponenten und Dienste.
        </p>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System-Status
          </CardTitle>
          <CardDescription>
            Überprüfung der Verfügbarkeit und Funktionalität aller Systemkomponenten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {systemHealth && getHealthStatusIcon(systemHealth.overall)}
              <div>
                <div className="font-semibold">
                  {systemHealth?.overall === 'healthy' && 'Alle Systeme funktionsfähig'}
                  {systemHealth?.overall === 'warning' && 'Warnungen vorhanden'}
                  {systemHealth?.overall === 'error' && 'Kritische Fehler aufgetreten'}
                </div>
                <div className="text-sm text-muted-foreground">
                  Letzte Überprüfung: {systemHealth ? new Date().toLocaleString('de-DE') : 'Noch nicht durchgeführt'}
                </div>
              </div>
            </div>
            <Button 
              onClick={runSystemHealthCheck}
              disabled={healthLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${healthLoading ? 'animate-spin' : ''}`} />
              Neu prüfen
            </Button>
          </div>

          {systemHealth && systemHealth.details.summary ? (
            <div className="space-y-6">
              {/* Übersicht */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className={`text-2xl font-bold ${getStatusColor('healthy')}`}>
                    {systemHealth.details.summary.passedTests}
                  </div>
                  <div className="text-sm text-gray-600">Erfolgreich</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${getStatusColor('warning')}`}>
                    {systemHealth.details.summary.failedTests}
                  </div>
                  <div className="text-sm text-gray-600">Fehlgeschlagen</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {systemHealth.details.summary.totalTests}
                  </div>
                  <div className="text-sm text-gray-600">Gesamt</div>
                </div>
              </div>
              
              {/* Test-Details */}
              <div className="space-y-3">
                <h4 className="font-semibold">Test-Details:</h4>
                <div className="grid gap-3">
                  {Object.entries(systemHealth.details.tests).map(([testName, testResult]: [string, any]) => (
                    <div key={testName} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {testResult.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium capitalize">
                            {testName.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {testResult.message}
                          </div>
                        </div>
                      </div>
                      {testResult.responseTime && (
                        <div className="text-sm text-muted-foreground">
                          {testResult.responseTime}ms
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : systemHealth && systemHealth.details.error ? (
            <div className="text-red-600 bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                <div>
                  <div className="font-medium">System-Check fehlgeschlagen</div>
                  <div className="text-sm">{systemHealth.details.message}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="text-gray-600">System-Check wird durchgeführt...</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System-Informationen</CardTitle>
          <CardDescription>
            Technische Details und Konfiguration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium">Umgebung</div>
              <div className="text-sm text-muted-foreground">
                {process.env.NODE_ENV === 'production' ? 'Produktion' : 'Entwicklung'}
              </div>
            </div>
            <div>
              <div className="font-medium">Version</div>
              <div className="text-sm text-muted-foreground">Family Toolbox v1.0</div>
            </div>
            <div>
              <div className="font-medium">Datenbank</div>
              <div className="text-sm text-muted-foreground">Supabase</div>
            </div>
            <div>
              <div className="font-medium">Framework</div>
              <div className="text-sm text-muted-foreground">Next.js 14</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 