'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  FileText, 
  Brain, 
  Settings, 
  Play, 
  Pause, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { DailySummary, Email, EmailAccount } from '../../../types/email-agent';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function EmailAgentPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [recentEmails, setRecentEmails] = useState<Email[]>([]);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    imap_host: '',
    imap_port: '993',
    username: '',
    password: '',
    provider: 'custom'
  });
  const [logs, setLogs] = useState([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLevel, setLogsLevel] = useState('all');
  const LOGS_PAGE_SIZE = 20;

  // Status abrufen
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/email-agent');
      const data = await response.json();
      setStatus(data.status);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  // E-Mail-Agent ausführen
  const runEmailAgent = async (action: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/email-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Daten nach erfolgreicher Ausführung aktualisieren
        await Promise.all([
          fetchSummaries(),
          fetchRecentEmails(),
          fetchAccounts()
        ]);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to run email agent:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Zusammenfassungen abrufen
  const fetchSummaries = async () => {
    try {
      const response = await fetch('/api/email-agent/summaries?limit=10');
      const data = await response.json();
      if (data.success) {
        setSummaries(data.summaries);
      }
    } catch (error) {
      console.error('Failed to fetch summaries:', error);
    }
  };

  // Aktuelle E-Mails abrufen
  const fetchRecentEmails = async () => {
    try {
      const response = await fetch('/api/email-agent/emails?limit=20');
      const data = await response.json();
      if (data.success) {
        setRecentEmails(data.emails);
      }
    } catch (error) {
      console.error('Failed to fetch recent emails:', error);
    }
  };

  // E-Mail-Accounts abrufen
  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/email-agent/accounts');
      const data = await response.json();
      if (data.success) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  };

  // Neuen E-Mail-Account hinzufügen
  const addAccount = async () => {
    try {
      const response = await fetch('/api/email-agent/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccount),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowAddForm(false);
        setNewAccount({
          name: '',
          email: '',
          imap_host: '',
          imap_port: '993',
          username: '',
          password: '',
          provider: 'custom'
        });
        await fetchAccounts();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to add account:', error);
      throw error;
    }
  };

  // E-Mail-Account bearbeiten
  const editAccount = async () => {
    if (!editingAccount) return;
    
    try {
      const response = await fetch('/api/email-agent/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingAccount.id,
          name: editingAccount.name,
          email: editingAccount.email,
          provider: editingAccount.provider,
          imap_host: editingAccount.imap_host,
          imap_port: editingAccount.imap_port,
          username: editingAccount.username,
          priority_weight: editingAccount.priority_weight,
          is_active: editingAccount.is_active
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setShowEditForm(false);
        setEditingAccount(null);
        await fetchAccounts();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to edit account:', error);
      throw error;
    }
  };

  // E-Mail-Account löschen
  const deleteAccount = async (accountId: string) => {
    if (!confirm('Möchtest du diesen E-Mail-Account wirklich löschen?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/email-agent/accounts?id=${accountId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        await fetchAccounts();
      }
      
      return result;
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  };

  // Account zum Bearbeiten öffnen
  const openEditForm = (account: EmailAccount) => {
    setEditingAccount(account);
    setShowEditForm(true);
  };

  // Provider-Einstellungen automatisch ausfüllen
  const handleProviderChange = (provider: string) => {
    const providerSettings = {
      gmail: {
        imap_host: 'imap.gmail.com',
        imap_port: '993',
        username: newAccount.email
      },
      outlook: {
        imap_host: 'outlook.office365.com',
        imap_port: '993',
        username: newAccount.email
      },
      yahoo: {
        imap_host: 'imap.mail.yahoo.com',
        imap_port: '993',
        username: newAccount.email
      },
      protonmail: {
        imap_host: 'imap.protonmail.ch',
        imap_port: '993',
        username: newAccount.email
      },
      custom: {
        imap_host: '',
        imap_port: '993',
        username: ''
      }
    };

    const settings = providerSettings[provider as keyof typeof providerSettings];
    setNewAccount(prev => ({
      ...prev,
      provider,
      imap_host: settings.imap_host,
      imap_port: settings.imap_port,
      username: settings.username || prev.username
    }));
  };

  // Mail-Agent-Logs abrufen
  const fetchLogs = async (page = 1, level = 'all') => {
    const sources = [
      'email-agent-api',
      'mail-manager',
      'summary-generator',
      'learning-optimizer'
    ];
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: LOGS_PAGE_SIZE.toString(),
      sources: sources.join(','),
      level: level
    });
    const res = await fetch(`/api/logs/mail-agent?${params.toString()}`);
    const data = await res.json();
    setLogs(data.logs || []);
  };

  // Initial laden
  useEffect(() => {
    fetchStatus();
    fetchSummaries();
    fetchRecentEmails();
    fetchAccounts();
    fetchLogs(logsPage, logsLevel);
  }, [logsPage, logsLevel]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            E-Mail Agent
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Intelligente E-Mail-Verarbeitung und Zusammenfassung
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={status?.agents?.mailManager === 'available' ? 'default' : 'destructive'}>
            <Mail className="w-3 h-3 mr-1" />
            Mail Manager
          </Badge>
          <Badge variant={status?.agents?.summaryGenerator === 'available' ? 'default' : 'destructive'}>
            <FileText className="w-3 h-3 mr-1" />
            Summary Generator
          </Badge>
          <Badge variant={status?.agents?.learningOptimizer === 'available' ? 'default' : 'destructive'}>
            <Brain className="w-3 h-3 mr-1" />
            Learning Optimizer
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Play className="w-5 h-5 mr-2" />
            Agent-Aktionen
          </CardTitle>
          <CardDescription>
            Führe verschiedene E-Mail-Agent-Aktionen aus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => runEmailAgent('fetch')}
              disabled={isLoading}
              variant="outline"
            >
              <Mail className="w-4 h-4 mr-2" />
              E-Mails abrufen
            </Button>
            
            <Button 
              onClick={() => runEmailAgent('process')}
              disabled={isLoading}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              E-Mails verarbeiten
            </Button>
            
            <Button 
              onClick={() => runEmailAgent('learn')}
              disabled={isLoading}
              variant="outline"
            >
              <Brain className="w-4 h-4 mr-2" />
              Feedback verarbeiten
            </Button>
            
            <Button 
              onClick={() => runEmailAgent('full-cycle')}
              disabled={isLoading}
              className="bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Vollständiger Zyklus
            </Button>
          </div>
          
          {isLoading && (
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Agent wird ausgeführt...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="summaries">Zusammenfassungen</TabsTrigger>
          <TabsTrigger value="emails">E-Mails</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktive Accounts</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accounts.filter(a => a.is_active).length}</div>
                <p className="text-xs text-muted-foreground">
                  von {accounts.length} konfiguriert
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Neue E-Mails (24h)</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {recentEmails.filter(e => {
                    const emailDate = new Date(e.received_at);
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    return emailDate >= yesterday;
                  }).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  in den letzten 24 Stunden
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Zusammenfassungen</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaries.length}</div>
                <p className="text-xs text-muted-foreground">
                  erstellt
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
                  Alle Agents verfügbar
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Aktuelle Aktivität</CardTitle>
              <CardDescription>
                Die neuesten E-Mails und Zusammenfassungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEmails.slice(0, 5).map((email) => (
                  <div key={email.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <Badge variant={email.relevance_score && email.relevance_score >= 7 ? 'default' : 'secondary'}>
                        {email.relevance_score || 'N/A'}/10
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {email.subject}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {email.sender_name || email.sender_email}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(email.received_at).toLocaleString('de-DE')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Summaries Tab */}
        <TabsContent value="summaries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Zusammenfassungen</CardTitle>
              <CardDescription>
                Tägliche Zusammenfassungen der wichtigsten E-Mails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaries.map((summary) => (
                  <div key={summary.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">
                        {new Date(summary.date).toLocaleDateString('de-DE')}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {summary.total_emails} E-Mails
                        </Badge>
                        <Badge variant="outline">
                          {summary.relevant_emails} relevant
                        </Badge>
                        {summary.high_priority_emails > 0 && (
                          <Badge variant="destructive">
                            {summary.high_priority_emails} hoch
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {summary.summary_text}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {new Date(summary.time_range_start).toLocaleTimeString('de-DE')} - 
                        {new Date(summary.time_range_end).toLocaleTimeString('de-DE')}
                      </span>
                      <span>
                        {summary.tokens_used} Tokens • {summary.processing_time_ms}ms
                      </span>
                    </div>
                  </div>
                ))}
                
                {summaries.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine Zusammenfassungen verfügbar</p>
                    <p className="text-sm">Führe den E-Mail-Agent aus, um Zusammenfassungen zu erstellen</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Emails Tab */}
        <TabsContent value="emails" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Übersicht</CardTitle>
              <CardDescription>
                Alle verarbeiteten E-Mails mit Relevanz-Bewertung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentEmails.map((email) => (
                  <div key={email.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex-shrink-0">
                      <Badge 
                        variant={
                          email.relevance_score && email.relevance_score >= 8 ? 'default' :
                          email.relevance_score && email.relevance_score >= 5 ? 'secondary' : 'outline'
                        }
                      >
                        {email.relevance_score || 'N/A'}/10
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {email.subject}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {email.sender_name || email.sender_email}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {email.category || 'other'}
                      </Badge>
                    </div>
                    <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(email.received_at).toLocaleString('de-DE')}
                    </div>
                  </div>
                ))}
                
                {recentEmails.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Noch keine E-Mails verfügbar</p>
                    <p className="text-sm">Führe den E-Mail-Agent aus, um E-Mails abzurufen</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {/* E-Mail-Accounts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>E-Mail-Accounts</CardTitle>
                  <CardDescription>
                    Konfigurierte E-Mail-Accounts für den Agent
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Account hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add Account Form */}
                {showAddForm && (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardHeader>
                      <CardTitle className="text-lg">Neuen E-Mail-Account hinzufügen</CardTitle>
                      <CardDescription>
                        Konfiguriere einen neuen E-Mail-Account für den Agent
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Account Name</Label>
                          <Input
                            id="name"
                            placeholder="z.B. Mein Gmail"
                            value={newAccount.name}
                            onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">E-Mail-Adresse</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="deine-email@gmail.com"
                            value={newAccount.email}
                            onChange={(e) => setNewAccount(prev => ({ 
                              ...prev, 
                              email: e.target.value,
                              username: e.target.value // Auto-fill username
                            }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="provider">E-Mail-Provider</Label>
                        <Select 
                          value={newAccount.provider} 
                          onValueChange={handleProviderChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Provider auswählen" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="gmail">Gmail</SelectItem>
                            <SelectItem value="outlook">Outlook/Hotmail</SelectItem>
                            <SelectItem value="yahoo">Yahoo</SelectItem>
                            <SelectItem value="protonmail">ProtonMail</SelectItem>
                            <SelectItem value="custom">Benutzerdefiniert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="imap_host">IMAP Server</Label>
                          <Input
                            id="imap_host"
                            placeholder="imap.gmail.com"
                            value={newAccount.imap_host}
                            onChange={(e) => setNewAccount(prev => ({ ...prev, imap_host: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="imap_port">IMAP Port</Label>
                          <Input
                            id="imap_port"
                            placeholder="993"
                            value={newAccount.imap_port}
                            onChange={(e) => setNewAccount(prev => ({ ...prev, imap_port: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Benutzername</Label>
                          <Input
                            id="username"
                            placeholder="deine-email@gmail.com"
                            value={newAccount.username}
                            onChange={(e) => setNewAccount(prev => ({ ...prev, username: e.target.value }))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="password">Passwort</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="App-Passwort für Gmail"
                            value={newAccount.password}
                            onChange={(e) => setNewAccount(prev => ({ ...prev, password: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddForm(false)}
                        >
                          Abbrechen
                        </Button>
                        <Button 
                          onClick={addAccount}
                          className="bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800"
                        >
                          Account hinzufügen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Edit Account Form */}
                {showEditForm && editingAccount && (
                  <Card className="border-2 border-dashed border-blue-300">
                    <CardHeader>
                      <CardTitle className="text-lg">E-Mail-Account bearbeiten</CardTitle>
                      <CardDescription>
                        Bearbeite die Einstellungen für {editingAccount.email}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-name">Account Name</Label>
                          <Input
                            id="edit-name"
                            placeholder="z.B. Mein Gmail"
                            value={editingAccount.name || ''}
                            onChange={(e) => setEditingAccount(prev => prev ? { ...prev, name: e.target.value } : null)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-email">E-Mail-Adresse</Label>
                          <Input
                            id="edit-email"
                            type="email"
                            placeholder="deine-email@gmail.com"
                            value={editingAccount.email}
                            onChange={(e) => setEditingAccount(prev => prev ? { ...prev, email: e.target.value } : null)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-imap-host">IMAP Server</Label>
                          <Input
                            id="edit-imap-host"
                            placeholder="imap.gmail.com"
                            value={editingAccount.imap_host}
                            onChange={(e) => setEditingAccount(prev => prev ? { ...prev, imap_host: e.target.value } : null)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-imap-port">IMAP Port</Label>
                          <Input
                            id="edit-imap-port"
                            placeholder="993"
                            value={editingAccount.imap_port.toString()}
                            onChange={(e) => setEditingAccount(prev => prev ? { ...prev, imap_port: parseInt(e.target.value) || 993 } : null)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="edit-username">Benutzername</Label>
                          <Input
                            id="edit-username"
                            placeholder="deine-email@gmail.com"
                            value={editingAccount.username}
                            onChange={(e) => setEditingAccount(prev => prev ? { ...prev, username: e.target.value } : null)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="edit-priority">Priorität</Label>
                          <Input
                            id="edit-priority"
                            type="number"
                            min="1"
                            max="10"
                            placeholder="1"
                            value={editingAccount.priority_weight}
                            onChange={(e) => setEditingAccount(prev => prev ? { ...prev, priority_weight: parseInt(e.target.value) || 1 } : null)}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="edit-active"
                            checked={editingAccount.is_active}
                            onChange={(e) => setEditingAccount(prev => prev ? { ...prev, is_active: e.target.checked } : null)}
                            className="rounded"
                          />
                          <Label htmlFor="edit-active">Account aktiv</Label>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-2 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowEditForm(false);
                            setEditingAccount(null);
                          }}
                        >
                          Abbrechen
                        </Button>
                        <Button 
                          onClick={editAccount}
                          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800"
                        >
                          Änderungen speichern
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Accounts */}
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{account.name || account.email}</h3>
                      <p className="text-sm text-gray-500">
                        {account.email} • {account.imap_host}:{account.imap_port}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={account.is_active ? 'default' : 'secondary'}>
                        {account.is_active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                      <Badge variant="outline">
                        Priorität: {account.priority_weight}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditForm(account)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteAccount(account.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {accounts.length === 0 && !showAddForm && !showEditForm && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Keine E-Mail-Accounts konfiguriert</p>
                    <p className="text-sm">Füge E-Mail-Accounts hinzu, um den Agent zu starten</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Mail-Agent Logs */}
          <Card>
            <CardHeader>
              <CardTitle>Mail-Agent Logs</CardTitle>
              <CardDescription>
                Protokolliert alle Aktionen und Fehler des E-Mail Agenten (nur Mail-Agent-relevante Logs)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-2">
                <label>Level:</label>
                <select value={logsLevel} onChange={e => { setLogsLevel(e.target.value); setLogsPage(1); }}>
                  <option value="all">Alle</option>
                  <option value="INFO">Info</option>
                  <option value="WARN">Warnung</option>
                  <option value="ERROR">Fehler</option>
                </select>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zeit</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>{new Date(log.created_at).toLocaleString('de-DE')}</TableCell>
                      <TableCell>{log.level}</TableCell>
                      <TableCell>{log.source}</TableCell>
                      <TableCell>{log.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-2">
                <Button onClick={() => setLogsPage(p => Math.max(1, p - 1))} disabled={logsPage === 1}>Zurück</Button>
                <span>Seite {logsPage}</span>
                <Button onClick={() => setLogsPage(p => p + 1)} disabled={logs.length < LOGS_PAGE_SIZE}>Weiter</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 