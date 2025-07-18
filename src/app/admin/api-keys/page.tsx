"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { ApiKeyService } from '@/lib/services/api-key-service';
import { 
  CheckCircle, 
  Loader2, 
  AlertCircle, 
  XCircle, 
  Activity,
  Clock,
  DollarSign,
  Zap,
  TrendingUp,
  Eye,
  Shield
} from 'lucide-react';

interface ApiTestResult {
  provider: 'openai' | 'anthropic';
  success: boolean;
  error?: string;
  details?: any;
  responseTime?: number;
}

interface ApiStats {
  provider: 'openai' | 'anthropic';
  totalTokens: number;
  estimatedCost: number;
  lastUsed: string;
  requestCount: number;
  avgResponseTime: number;
}

export default function ApiKeysPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [maskedKeys, setMaskedKeys] = useState({ openai: '', anthropic: '' });
  const [newKeys, setNewKeys] = useState({ openai_api_key: '', anthropic_api_key: '' });
  const [testResults, setTestResults] = useState<ApiTestResult[]>([]);
  const [apiStats, setApiStats] = useState<ApiStats[]>([]);

  const fetchMaskedKeys = async () => {
    setLoading(true);
    try {
      const data = await ApiKeyService.getMaskedApiKeys();
      setMaskedKeys(data);
    } catch (error) {
      console.error('Error fetching masked keys:', error);
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: `Maskierte API-Keys konnten nicht geladen werden: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      setMaskedKeys({ openai: '', anthropic: '' });
    } finally {
      setLoading(false);
    }
  };

  const runApiTests = async () => {
    setTesting(true);
    setTestResults([]);
    
    try {
      const response = await fetch('/api/test-api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Test fehlgeschlagen');
      }

      const result = await response.json();
      
      if (result.success && result.results) {
        setTestResults(result.results);
      }

    } catch (error) {
      console.error('API Keys test error:', error);
      toast({
        variant: 'destructive',
        title: 'Test Fehler',
        description: error instanceof Error ? error.message : 'Unbekannter Fehler beim Testen der API-Keys.',
      });
    } finally {
      setTesting(false);
    }
  };

  // Lade echte API-Statistiken aus dem Logging-System
  const loadApiStats = async () => {
    try {
      const response = await fetch('/api/admin/api-usage-stats?days=30', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch API usage stats');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Konvertiere API Response zu UI Format
        const uiStats: ApiStats[] = result.data.map((stat: any) => ({
          provider: stat.provider,
          totalTokens: stat.totalTokens,
          estimatedCost: stat.totalCost,
          lastUsed: stat.lastUsed,
          requestCount: stat.requestCount,
          avgResponseTime: stat.avgResponseTime
        }));
        
        setApiStats(uiStats);
      } else {
        // Fallback: Leere Stats wenn keine Daten vorhanden
        setApiStats([]);
      }

    } catch (error) {
      console.error('Error loading API stats:', error);
      // Fallback: Mock-Daten für Demo-Zwecke
      const mockStats: ApiStats[] = [
        {
          provider: 'openai',
          totalTokens: 0,
          estimatedCost: 0,
          lastUsed: new Date().toISOString(),
          requestCount: 0,
          avgResponseTime: 0
        },
        {
          provider: 'anthropic',
          totalTokens: 0,
          estimatedCost: 0,
          lastUsed: new Date().toISOString(),
          requestCount: 0,
          avgResponseTime: 0
        }
      ];
      setApiStats(mockStats);
    }
  };

  useEffect(() => {
    fetchMaskedKeys();
    loadApiStats();
    // Automatischer Test beim Laden der Seite
    setTimeout(() => runApiTests(), 1000);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const keysToSave = Object.fromEntries(
        Object.entries(newKeys).filter(([_, value]) => value.trim() !== '')
      );

      if (Object.keys(keysToSave).length === 0) {
        toast({
          title: 'Keine Änderungen',
          description: 'Es wurden keine neuen Keys zum Speichern eingegeben.',
        });
        return;
      }
      
      await ApiKeyService.saveApiKeys(keysToSave);

      toast({
        title: 'Erfolgreich gespeichert',
        description: 'Deine API-Schlüssel wurden sicher aktualisiert.',
      });
      
      setNewKeys({ openai_api_key: '', anthropic_api_key: '' });
      fetchMaskedKeys();
      
      // Nach dem Speichern automatisch testen
      setTimeout(() => runApiTests(), 500);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fehler beim Speichern',
        description: 'Die API-Schlüssel konnten nicht gespeichert werden.',
      });
    } finally {
      setSaving(false);
    }
  };

  const getApiStatus = (provider: 'openai' | 'anthropic') => {
    const hasKey = provider === 'openai' ? maskedKeys.openai : maskedKeys.anthropic;
    const testResult = testResults.find(r => r.provider === provider);
    
    if (!hasKey) {
      return { status: 'not-set', label: 'Nicht konfiguriert', color: 'bg-gray-500' };
    }
    
    if (testing || !testResult) {
      return { status: 'testing', label: 'Wird getestet...', color: 'bg-blue-500' };
    }
    
    if (testResult.success) {
      return { status: 'active', label: 'Aktiv & Funktionsfähig', color: 'bg-green-500' };
    } else {
      return { status: 'error', label: 'Fehler bei Verbindung', color: 'bg-red-500' };
    }
  };

  const getProviderName = (provider: string) => {
    return provider === 'openai' ? 'OpenAI' : 'Anthropic (Claude)';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const formatTime = (ms: number) => {
    return `${ms}ms`;
  };

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) {
      return `vor ${diffMins} Min.`;
    } else if (diffHours < 24) {
      return `vor ${diffHours} Std.`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `vor ${diffDays} Tag${diffDays !== 1 ? 'en' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API-Schlüssel verwalten</h1>
        <p className="text-muted-foreground">
          Verwalte deine AI-Provider API-Keys und überwache deren Nutzung und Performance.
        </p>
      </div>

      {/* API-Keys Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            API-Schlüssel Konfiguration
          </CardTitle>
          <CardDescription>
            Konfiguriere deine API-Schlüssel für verschiedene AI-Provider. Alle Keys werden verschlüsselt gespeichert.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="openai_api_key" className="text-base font-medium">OpenAI API Key</Label>
              <Badge variant="outline" className={`${getApiStatus('openai').color} text-white`}>
                {getApiStatus('openai').label}
              </Badge>
            </div>
            <Input
              id="openai_api_key"
              type="password"
              placeholder="sk-... (neuen Key eingeben zum Ändern)"
              value={newKeys.openai_api_key}
              onChange={(e) => setNewKeys({ ...newKeys, openai_api_key: e.target.value })}
              className="max-w-md"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Aktuell: <span className="font-medium">
                  {loading ? 'Lädt...' : maskedKeys.openai || 'Nicht konfiguriert'}
                </span>
              </span>
              {testResults.find(r => r.provider === 'openai') && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(testResults.find(r => r.provider === 'openai')?.responseTime || 0)}
                </span>
              )}
            </div>
            {testResults.find(r => r.provider === 'openai' && !r.success) && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                {testResults.find(r => r.provider === 'openai')?.error}
              </div>
            )}
          </div>

          {/* Anthropic */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="anthropic_api_key" className="text-base font-medium">Anthropic (Claude) API Key</Label>
              <Badge variant="outline" className={`${getApiStatus('anthropic').color} text-white`}>
                {getApiStatus('anthropic').label}
              </Badge>
            </div>
            <Input
              id="anthropic_api_key"
              type="password"
              placeholder="sk-ant-... (neuen Key eingeben zum Ändern)"
              value={newKeys.anthropic_api_key}
              onChange={(e) => setNewKeys({ ...newKeys, anthropic_api_key: e.target.value })}
              className="max-w-md"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Aktuell: <span className="font-medium">
                  {loading ? 'Lädt...' : maskedKeys.anthropic || 'Nicht konfiguriert'}
                </span>
              </span>
              {testResults.find(r => r.provider === 'anthropic') && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(testResults.find(r => r.provider === 'anthropic')?.responseTime || 0)}
                </span>
              )}
            </div>
            {testResults.find(r => r.provider === 'anthropic' && !r.success) && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                {testResults.find(r => r.provider === 'anthropic')?.error}
              </div>
            )}
          </div>

          <Button onClick={handleSave} disabled={saving} className="max-w-md">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : 'Schlüssel speichern'}
          </Button>
        </CardContent>
      </Card>

      {/* API Usage Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apiStats.length > 0 ? (
          apiStats.map((stats) => (
            <Card key={stats.provider}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  {getProviderName(stats.provider)} Analytics
                </CardTitle>
                <CardDescription>
                  Verbrauch und Performance der letzten 30 Tage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Token Verbrauch */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Token</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(stats.totalTokens)}</div>
                    <div className="text-xs text-muted-foreground">Gesamt verbraucht</div>
                  </div>

                  {/* Kosten */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Kosten</span>
                    </div>
                    <div className="text-2xl font-bold">{formatCurrency(stats.estimatedCost)}</div>
                    <div className="text-xs text-muted-foreground">Geschätzt (30 Tage)</div>
                  </div>

                  {/* Anfragen */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Anfragen</span>
                    </div>
                    <div className="text-2xl font-bold">{formatNumber(stats.requestCount)}</div>
                    <div className="text-xs text-muted-foreground">Gesamt (30 Tage)</div>
                  </div>

                  {/* Response Time */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Ø Response</span>
                    </div>
                    <div className="text-2xl font-bold">{formatTime(stats.avgResponseTime)}</div>
                    <div className="text-xs text-muted-foreground">Durchschnitt</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Zuletzt verwendet:</span>
                    <span className="font-medium">{formatRelativeTime(stats.lastUsed)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Fallback für leere Stats - zeige Demo-Karten
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  OpenAI Analytics
                </CardTitle>
                <CardDescription>
                  Verbrauch und Performance der letzten 30 Tage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Token</span>
                    </div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">Noch keine Nutzung</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Kosten</span>
                    </div>
                    <div className="text-2xl font-bold">$0.00</div>
                    <div className="text-xs text-muted-foreground">Noch keine Kosten</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Anfragen</span>
                    </div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">Noch keine Requests</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Ø Response</span>
                    </div>
                    <div className="text-2xl font-bold">-</div>
                    <div className="text-xs text-muted-foreground">Noch keine Daten</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Anthropic Analytics
                </CardTitle>
                <CardDescription>
                  Verbrauch und Performance der letzten 30 Tage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Token</span>
                    </div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">Noch keine Nutzung</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Kosten</span>
                    </div>
                    <div className="text-2xl font-bold">$0.00</div>
                    <div className="text-xs text-muted-foreground">Noch keine Kosten</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Anfragen</span>
                    </div>
                    <div className="text-2xl font-bold">0</div>
                    <div className="text-xs text-muted-foreground">Noch keine Requests</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Ø Response</span>
                    </div>
                    <div className="text-2xl font-bold">-</div>
                    <div className="text-xs text-muted-foreground">Noch keine Daten</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Status Zusammenfassung */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['openai', 'anthropic'].map((provider) => {
              const status = getApiStatus(provider as 'openai' | 'anthropic');
              const testResult = testResults.find(r => r.provider === provider);
              
              return (
                <div key={provider} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <div>
                      <div className="font-medium">{getProviderName(provider)}</div>
                      <div className="text-sm text-muted-foreground">{status.label}</div>
                    </div>
                  </div>
                  {testResult?.success && (
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Online
                    </div>
                  )}
                  {testResult && !testResult.success && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      Offline
                    </div>
                  )}
                  {testing && (
                    <div className="flex items-center gap-1 text-sm text-blue-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Testing...
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 