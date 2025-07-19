'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Globe, 
  Plus, 
  Settings, 
  Bell, 
  BarChart3,
  Trash2,
  Edit,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  Star,
  TrendingUp
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface WatchedURL {
  id: string;
  url: string;
  title: string;
  description?: string;
  monitoring_instructions: string;
  monitoring_interval: number;
  is_active: boolean;
  is_snoozed: boolean;
  last_checked?: string;
  last_changed?: string;
  tags: string[];
  notification_settings: {
    email: boolean;
    push: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  check_count: number;
  error_count: number;
}

interface ContentChange {
  id: string;
  url_title: string;
  change_summary: string;
  relevance_score: number;
  relevance_category: 'high' | 'medium' | 'low' | 'irrelevant';
  confidence_score: number;
  detected_at: string;
  notification_sent: boolean;
  is_user_relevant?: boolean;
}

export default function URLWatcherPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [watchedUrls, setWatchedUrls] = useState<WatchedURL[]>([]);
  const [recentChanges, setRecentChanges] = useState<ContentChange[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUrl, setEditingUrl] = useState<WatchedURL | null>(null);
  
  // Form State für neue URL
  const [newUrl, setNewUrl] = useState({
    url: '',
    title: '',
    description: '',
    monitoring_instructions: '',
    monitoring_interval: 60,
    notification_settings: {
      email: true,
      push: true,
      frequency: 'immediate' as const
    },
    tags: [] as string[]
  });

  // Dashboard Stats
  const [stats, setStats] = useState({
    total_urls: 0,
    active_urls: 0,
    changes_today: 0,
    high_priority_changes: 0,
    avg_relevance_score: 0
  });

  useEffect(() => {
    fetchWatchedUrls();
    fetchRecentChanges();
    fetchStats();
  }, []);

  const fetchWatchedUrls = async () => {
    try {
      const response = await fetch('/api/url-watcher/urls');
      if (response.ok) {
        const data = await response.json();
        setWatchedUrls(data.urls || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der URLs:', error);
    }
  };

  const fetchRecentChanges = async () => {
    try {
      const response = await fetch('/api/url-watcher/changes?limit=10');
      if (response.ok) {
        const data = await response.json();
        setRecentChanges(data.changes || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Änderungen:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/url-watcher/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Statistiken:', error);
    }
  };

  const handleAddUrl = async () => {
    if (!newUrl.url || !newUrl.monitoring_instructions) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/url-watcher/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUrl)
      });
      
      if (response.ok) {
        await fetchWatchedUrls();
        setShowAddForm(false);
        setNewUrl({
          url: '',
          title: '',
          description: '',
          monitoring_instructions: '',
          monitoring_interval: 60,
          notification_settings: {
            email: true,
            push: true,
            frequency: 'immediate'
          },
          tags: []
        });
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen der URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUrl = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/url-watcher/urls/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive })
      });
      
      if (response.ok) {
        await fetchWatchedUrls();
      }
    } catch (error) {
      console.error('Fehler beim Umschalten der URL:', error);
    }
  };

  const handleDeleteUrl = async (id: string) => {
    if (!confirm('Möchten Sie diese URL wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/url-watcher/urls/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchWatchedUrls();
      }
    } catch (error) {
      console.error('Fehler beim Löschen der URL:', error);
    }
  };

  const handleManualCheck = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/url-watcher/urls/${id}/check`, {
        method: 'POST'
      });
      
      if (response.ok) {
        await fetchWatchedUrls();
        await fetchRecentChanges();
      }
    } catch (error) {
      console.error('Fehler beim manuellen Check:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const relevanceBadgeColor = (category: string) => {
    switch (category) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `vor ${diffDays} Tag${diffDays === 1 ? '' : 'en'}`;
    } else if (diffHours > 0) {
      return `vor ${diffHours} Stunde${diffHours === 1 ? '' : 'n'}`;
    } else {
      return 'vor kurzem';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🌐 URL Watcher
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Intelligente Website-Überwachung mit KI-basierter Relevanz-Bewertung
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Überwachte URLs</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_urls}</div>
              <p className="text-xs text-muted-foreground">
                {stats.active_urls} aktiv
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Änderungen heute</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.changes_today}</div>
              <p className="text-xs text-muted-foreground">
                {stats.high_priority_changes} hohe Priorität
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ø Relevanz</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avg_relevance_score.toFixed(1)}/10</div>
              <p className="text-xs text-muted-foreground">
                Durchschnittsbewertung
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Online</div>
              <p className="text-xs text-muted-foreground">
                Alle Agenten aktiv
              </p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <Button 
                onClick={() => setShowAddForm(true)}
                className="w-full"
                disabled={watchedUrls.length >= 50}
              >
                <Plus className="h-4 w-4 mr-2" />
                URL hinzufügen
              </Button>
              {watchedUrls.length >= 50 && (
                <p className="text-xs text-center mt-2 text-amber-600">
                  Maximum 50 URLs erreicht
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">📊 Dashboard</TabsTrigger>
            <TabsTrigger value="urls">🌐 URLs</TabsTrigger>
            <TabsTrigger value="changes">🔍 Änderungen</TabsTrigger>
            <TabsTrigger value="settings">⚙️ Einstellungen</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Recent Changes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Neueste Änderungen
                  </CardTitle>
                  <CardDescription>
                    Die letzten erkannten Website-Änderungen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentChanges.slice(0, 5).map((change) => (
                      <div key={change.id} className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{change.url_title}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            {change.change_summary}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs ${relevanceBadgeColor(change.relevance_category)}`}>
                              {change.relevance_category} ({change.relevance_score}/10)
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(change.detected_at)}
                            </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {recentChanges.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Noch keine Änderungen erkannt
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top URLs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Top überwachte URLs
                  </CardTitle>
                  <CardDescription>
                    URLs mit den meisten relevanten Änderungen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {watchedUrls
                      .filter(url => url.is_active)
                      .slice(0, 5)
                      .map((url) => (
                      <div key={url.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{url.title}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {url.url}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {url.check_count} Checks
                            </Badge>
                            {url.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${url.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* URLs Tab */}
          <TabsContent value="urls" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Überwachte URLs verwalten</CardTitle>
                <CardDescription>
                  Hinzufügen, bearbeiten und konfigurieren Sie URLs für die Überwachung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL / Titel</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Intervall</TableHead>
                      <TableHead>Letzter Check</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {watchedUrls.map((url) => (
                      <TableRow key={url.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{url.title}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                              {url.url}
                            </div>
                            <div className="flex gap-1 mt-1">
                              {url.tags.slice(0, 3).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              url.is_active 
                                ? (url.error_count > 0 ? 'bg-yellow-500' : 'bg-green-500')
                                : 'bg-gray-400'
                            }`}></div>
                            <span className="text-sm">
                              {url.is_active 
                                ? (url.error_count > 0 ? 'Fehler' : 'Aktiv')
                                : 'Pausiert'
                              }
                            </span>
                            {url.is_snoozed && (
                              <Badge variant="outline" className="text-xs">
                                Stummgeschaltet
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{url.monitoring_interval}min</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {url.last_checked 
                              ? formatRelativeTime(url.last_checked)
                              : 'Nie'
                            }
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleUrl(url.id, !url.is_active)}
                            >
                              {url.is_active ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleManualCheck(url.id)}
                              disabled={isLoading}
                            >
                              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingUrl(url)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUrl(url.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {watchedUrls.length === 0 && (
                  <div className="text-center py-12">
                    <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Noch keine URLs überwacht
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Fügen Sie Ihre erste URL hinzu, um mit der Überwachung zu beginnen.
                    </p>
                    <Button onClick={() => setShowAddForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Erste URL hinzufügen
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Changes Tab */}
          <TabsContent value="changes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Erkannte Änderungen</CardTitle>
                <CardDescription>
                  Übersicht aller erkannten Website-Änderungen mit KI-Bewertung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentChanges.map((change) => (
                    <div key={change.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{change.url_title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {change.change_summary}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={relevanceBadgeColor(change.relevance_category)}>
                            {change.relevance_category}
                          </Badge>
                          <span className="text-sm font-medium">
                            {change.relevance_score}/10
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-500">
                          <span>Konfidenz: {Math.round(change.confidence_score * 100)}%</span>
                          <span>{formatRelativeTime(change.detected_at)}</span>
                          {change.notification_sent && (
                            <Badge variant="outline" className="text-xs">
                              <Bell className="h-3 w-3 mr-1" />
                              Benachrichtigt
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          {change.is_user_relevant === undefined && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="text-green-600">
                                👍
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                👎
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {recentChanges.length === 0 && (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Noch keine Änderungen erkannt
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Das System überwacht Ihre URLs kontinuierlich und zeigt hier relevante Änderungen an.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>URL Watcher Einstellungen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie globale Einstellungen für die URL-Überwachung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Benachrichtigungseinstellungen</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>E-Mail-Benachrichtigungen</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Erhalten Sie E-Mails bei relevanten Änderungen
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Browser-Push-Benachrichtigungen</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Sofortige Browser-Benachrichtigungen aktivieren
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Überwachungseinstellungen</h4>
                  <div className="space-y-4">
                    <div>
                      <Label>Standard-Überwachungsintervall</Label>
                      <Select defaultValue="60">
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">30 Minuten</SelectItem>
                          <SelectItem value="60">1 Stunde</SelectItem>
                          <SelectItem value="120">2 Stunden</SelectItem>
                          <SelectItem value="360">6 Stunden</SelectItem>
                          <SelectItem value="720">12 Stunden</SelectItem>
                          <SelectItem value="1440">24 Stunden</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Mindest-Relevanz für Benachrichtigungen</Label>
                      <Select defaultValue="6">
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="4">Niedrig (4+)</SelectItem>
                          <SelectItem value="6">Mittel (6+)</SelectItem>
                          <SelectItem value="8">Hoch (8+)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Datenschutz & Speicherung</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Änderungshistorie</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Erkannte Änderungen für 90 Tage speichern
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Learning & Optimierung</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          KI-Bewertungen basierend auf Feedback verbessern
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Einstellungen speichern</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add URL Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Neue URL hinzufügen</CardTitle>
                <CardDescription>
                  Konfigurieren Sie eine neue URL für die intelligente Überwachung
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="url">Website-URL *</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={newUrl.url}
                    onChange={(e) => setNewUrl({ ...newUrl, url: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    placeholder="z.B. Firmen-Website"
                    value={newUrl.title}
                    onChange={(e) => setNewUrl({ ...newUrl, title: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    placeholder="Optionale Beschreibung der URL"
                    value={newUrl.description}
                    onChange={(e) => setNewUrl({ ...newUrl, description: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="instructions">Überwachungsanweisungen *</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Beschreiben Sie, welche Änderungen relevant sind. Z.B.: 'Benachrichtige mich bei neuen Produkten, Preisänderungen oder wichtigen Ankündigungen. Ignoriere Navigation und Werbung.'"
                    value={newUrl.monitoring_instructions}
                    onChange={(e) => setNewUrl({ ...newUrl, monitoring_instructions: e.target.value })}
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="interval">Überwachungsintervall</Label>
                  <Select 
                    value={newUrl.monitoring_interval.toString()} 
                    onValueChange={(value) => setNewUrl({ ...newUrl, monitoring_interval: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Minuten</SelectItem>
                      <SelectItem value="60">1 Stunde</SelectItem>
                      <SelectItem value="120">2 Stunden</SelectItem>
                      <SelectItem value="360">6 Stunden</SelectItem>
                      <SelectItem value="720">12 Stunden</SelectItem>
                      <SelectItem value="1440">24 Stunden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Benachrichtigungseinstellungen</Label>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newUrl.notification_settings.email}
                        onCheckedChange={(checked) => 
                          setNewUrl({
                            ...newUrl,
                            notification_settings: { ...newUrl.notification_settings, email: checked }
                          })
                        }
                      />
                      <Label>E-Mail-Benachrichtigungen</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newUrl.notification_settings.push}
                        onCheckedChange={(checked) => 
                          setNewUrl({
                            ...newUrl,
                            notification_settings: { ...newUrl.notification_settings, push: checked }
                          })
                        }
                      />
                      <Label>Push-Benachrichtigungen</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end gap-3 p-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleAddUrl}
                  disabled={!newUrl.url || !newUrl.monitoring_instructions || isLoading}
                >
                  {isLoading ? 'Hinzufügen...' : 'URL hinzufügen'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 