'use client';

// Multi-Agent Email Agent System - Complete Implementation
// This is the full dashboard-based UI with tabs for Dashboard, Summaries, Emails, Accounts, and Logs

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadSummaries(),
        loadRecentEmails(),
        loadAccounts(),
        loadStatus()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummaries = async () => {
    try {
      const response = await fetch('/api/email-agent/summaries');
      if (response.ok) {
        const data = await response.json();
        setSummaries(data.summaries || []);
      }
    } catch (error) {
      console.error('Error loading summaries:', error);
    }
  };

  const loadRecentEmails = async () => {
    try {
      const response = await fetch('/api/email-agent/emails');
      if (response.ok) {
        const data = await response.json();
        setRecentEmails(data.emails || []);
      }
    } catch (error) {
      console.error('Error loading emails:', error);
    }
  };

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/email-agent/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/email-agent');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Error loading status:', error);
    }
  };

  const loadLogs = async (page = 1) => {
    try {
      const response = await fetch(`/api/log?page=${page}&source=email-agent`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const startEmailAgent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/email-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'start' }),
      });
      
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error starting email agent:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAccount = async () => {
    try {
      const response = await fetch('/api/email-agent/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAccount),
      });
      
      if (response.ok) {
        await loadAccounts();
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
      }
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      const response = await fetch(`/api/email-agent/accounts`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accountId }),
      });
      
      if (response.ok) {
        await loadAccounts();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const getStatusBadge = (status: any) => {
    if (status?.isRunning) {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Aktiv</Badge>;
    }
    return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Inaktiv</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📧 E-Mail Agent
          </h1>
          <p className="text-gray-600">
            Intelligente E-Mail-Verarbeitung und -Zusammenfassung für mehrere Postfächer
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="summaries" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Zusammenfassungen
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              E-Mails
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Konten
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Agent Status</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {getStatusBadge(status)}
                    <Button
                      size="sm"
                      onClick={startEmailAgent}
                      disabled={isLoading}
                      className="ml-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : status?.isRunning ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                      {status?.isRunning ? 'Stoppen' : 'Starten'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">E-Mail-Konten</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{accounts.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Konfigurierte Postfächer
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
                    Heute erstellt
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Letzte Aktivität</CardTitle>
                <CardDescription>
                  Übersicht der neuesten E-Mails und Zusammenfassungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEmails.slice(0, 5).map((email, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                                             <div className="flex-shrink-0">
                         {(email.relevance_score || 0) >= 8 ? (
                           <CheckCircle className="h-5 w-5 text-green-500" />
                         ) : (email.relevance_score || 0) >= 6 ? (
                           <AlertCircle className="h-5 w-5 text-yellow-500" />
                         ) : (
                           <Clock className="h-5 w-5 text-gray-400" />
                         )}
                       </div>
                       <div className="flex-1">
                         <div className="font-medium">{email.subject}</div>
                         <div className="text-sm text-gray-500">
                           Von: {email.sender_email} • {formatDate(email.received_at)}
                         </div>
                       </div>
                       <Badge variant="secondary">
                         Relevanz: {email.relevance_score || 0}/10
                       </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summaries Tab */}
          <TabsContent value="summaries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tägliche Zusammenfassungen</CardTitle>
                <CardDescription>
                  Von der KI generierte Zusammenfassungen relevanter E-Mails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summaries.map((summary, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {formatDate(summary.created_at)}
                        </CardTitle>
                        <CardDescription>
                          {summary.total_emails} E-Mails • {summary.relevant_emails} relevant
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none">
                          {summary.summary_text}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aktuelle E-Mails</CardTitle>
                <CardDescription>
                  Alle verarbeiteten E-Mails mit Relevanz-Bewertung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Betreff</TableHead>
                      <TableHead>Absender</TableHead>
                      <TableHead>Datum</TableHead>
                      <TableHead>Relevanz</TableHead>
                      <TableHead>Kategorie</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEmails.map((email, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{email.subject}</TableCell>
                        <TableCell>{email.sender_email}</TableCell>
                        <TableCell>{formatDate(email.received_at)}</TableCell>
                                                 <TableCell>
                           <Badge 
                             variant={(email.relevance_score || 0) >= 8 ? "default" : 
                                    (email.relevance_score || 0) >= 6 ? "secondary" : "outline"}
                           >
                             {email.relevance_score || 0}/10
                           </Badge>
                         </TableCell>
                        <TableCell>
                          <Badge variant="outline">{email.category || 'Unbekannt'}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>E-Mail-Konten</CardTitle>
                  <CardDescription>
                    Verwalten Sie die überwachten E-Mail-Postfächer
                  </CardDescription>
                </div>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Konto hinzufügen
                </Button>
              </CardHeader>
              <CardContent>
                {showAddForm && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Neues E-Mail-Konto</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={newAccount.name}
                            onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                            placeholder="z.B. Hauptpostfach"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">E-Mail-Adresse</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newAccount.email}
                            onChange={(e) => setNewAccount({...newAccount, email: e.target.value})}
                            placeholder="name@example.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="imap_host">IMAP Server</Label>
                          <Input
                            id="imap_host"
                            value={newAccount.imap_host}
                            onChange={(e) => setNewAccount({...newAccount, imap_host: e.target.value})}
                            placeholder="imap.gmail.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="imap_port">IMAP Port</Label>
                          <Input
                            id="imap_port"
                            value={newAccount.imap_port}
                            onChange={(e) => setNewAccount({...newAccount, imap_port: e.target.value})}
                            placeholder="993"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="password">App-Passwort</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newAccount.password}
                          onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                          placeholder="App-spezifisches Passwort"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addAccount}>
                          Konto hinzufügen
                        </Button>
                        <Button variant="outline" onClick={() => setShowAddForm(false)}>
                          Abbrechen
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Server</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{account.name}</TableCell>
                        <TableCell>{account.email}</TableCell>
                        <TableCell>{account.imap_host}:{account.imap_port}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Aktiv
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingAccount(account);
                                setShowEditForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteAccount(account.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System-Logs</CardTitle>
                <CardDescription>
                  Detaillierte Protokolle der E-Mail-Agent-Aktivitäten
                </CardDescription>
                <Button onClick={() => loadLogs(logsPage)} className="w-fit">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Aktualisieren
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zeit</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Quelle</TableHead>
                      <TableHead>Nachricht</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: any, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(log.created_at)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={log.level === 'error' ? "destructive" : 
                                   log.level === 'warn' ? "secondary" : "outline"}
                          >
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.source}</TableCell>
                        <TableCell className="max-w-md truncate">{log.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 