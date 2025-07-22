'use client';

// Multi-Agent Email Agent System - Complete Implementation
// Vollständiges Dashboard-System für automatische E-Mail-Zusammenfassungen aus 3 Postfächern

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Edit,
  Star,
  TrendingUp,
  Users,
  Database,
  Zap,
  BarChart3
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface EmailAccount {
  id: string;
  name: string;
  email: string;
  imap_host: string;
  imap_port: number;
  username: string;
  provider: 'gmail' | 'ionos' | 'custom';
  is_active: boolean;
  last_checked?: string;
  email_count: number;
  error_count: number;
  priority_weight: number;
}

interface DailySummary {
  id: string;
  date: string;
  account_email: string;
  summary_text: string;
  email_count: number;
  high_priority_count: number;
  categories: Record<string, number>;
  relevance_score: number;
  user_rating?: number;
  feedback_text?: string;
  created_at: string;
}

interface Email {
  id: string;
  account_id: string;
  subject: string;
  from_email: string;
  from_name: string;
  body_text: string;
  received_at: string;
  relevance_score: number;
  category: 'personal' | 'system' | 'marketing' | 'other';
  priority_weight: number;
  is_processed: boolean;
  summary?: string;
}

interface SystemStatus {
  last_run: string;
  next_run: string;
  active_accounts: number;
  total_emails_today: number;
  summaries_generated: number;
  system_health: 'healthy' | 'warning' | 'error';
  errors: string[];
}

export default function EmailAgentPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [recentEmails, setRecentEmails] = useState<Email[]>([]);
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  
  // Form states
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState<EmailAccount | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    email: '',
    imap_host: '',
    imap_port: 993,
    username: '',
    password: '',
    provider: 'custom' as const,
    priority_weight: 1.0
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadStatus(),
        loadSummaries(),
        loadRecentEmails(),
        loadAccounts(),
        loadLogs()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatus = async () => {
    try {
      const response = await fetch('/api/email-agent');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error loading status:', error);
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

  const loadLogs = async () => {
    try {
      const response = await fetch('/api/logs/mail-agent');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  const triggerManualRun = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/email-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'manual_run' })
      });
      
      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error triggering manual run:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAccount = async () => {
    try {
      const response = await fetch('/api/email-agent/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      });
      
      if (response.ok) {
        setShowAddAccount(false);
        setNewAccount({
          name: '',
          email: '',
          imap_host: '',
          imap_port: 993,
          username: '',
          password: '',
          provider: 'custom',
          priority_weight: 1.0
        });
        await loadAccounts();
      }
    } catch (error) {
      console.error('Error adding account:', error);
    }
  };

  const submitFeedback = async (summaryId: string, rating: number, feedbackText: string) => {
    try {
      await fetch('/api/email-agent/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary_id: summaryId,
          rating,
          feedback_text: feedbackText
        })
      });
      
      await loadSummaries();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getStatusColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'personal': return 'bg-blue-100 text-blue-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      case 'marketing': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">E-Mail Agent</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Intelligente E-Mail-Zusammenfassungen</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {status && (
                <Badge variant="outline" className={getStatusColor(status.system_health)}>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  {status.system_health}
                </Badge>
              )}
              <Button onClick={triggerManualRun} disabled={isLoading} size="sm">
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Aktualisieren
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
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
              <Users className="h-4 w-4" />
              Konten
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Logs
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktive Konten</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{status?.active_accounts || 0}</div>
                  <p className="text-xs text-muted-foreground">von {accounts.length} konfigurierten</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">E-Mails heute</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{status?.total_emails_today || 0}</div>
                  <p className="text-xs text-muted-foreground">seit Mitternacht</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Zusammenfassungen</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{status?.summaries_generated || 0}</div>
                  <p className="text-xs text-muted-foreground">heute generiert</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System-Status</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getStatusColor(status?.system_health || 'healthy')}`}>
                    {status?.system_health || 'Unknown'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Letzter Lauf: {status?.last_run ? formatDate(status.last_run) : 'Nie'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Neueste Zusammenfassungen</CardTitle>
                  <CardDescription>Die letzten generierten Zusammenfassungen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {summaries.slice(0, 3).map((summary) => (
                      <div key={summary.id} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <Badge variant="outline">{summary.email_count} E-Mails</Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {summary.account_email}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {summary.summary_text.substring(0, 120)}...
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(summary.created_at)}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < (summary.user_rating || 0) 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hochpriorisierte E-Mails</CardTitle>
                  <CardDescription>E-Mails mit hoher Relevanz</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentEmails
                      .filter(email => email.relevance_score >= 8)
                      .slice(0, 3)
                      .map((email) => (
                        <div key={email.id} className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <Badge className={getCategoryColor(email.category)}>
                              {email.category}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {email.subject}
                            </p>
                            <p className="text-sm text-gray-500">
                              Von: {email.from_name || email.from_email}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(email.received_at)}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Badge variant="outline">
                              {email.relevance_score}/10
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Summaries Tab */}
          <TabsContent value="summaries" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Tägliche Zusammenfassungen</h2>
                <p className="text-gray-500">Automatisch generierte E-Mail-Zusammenfassungen</p>
              </div>
              <Button onClick={triggerManualRun} disabled={isLoading}>
                <Brain className="mr-2 h-4 w-4" />
                Neue Zusammenfassung erstellen
              </Button>
            </div>

            <div className="space-y-6">
              {summaries.map((summary) => (
                <SummaryCard 
                  key={summary.id} 
                  summary={summary} 
                  onFeedback={submitFeedback}
                />
              ))}
            </div>
          </TabsContent>

          {/* Emails Tab */}
          <TabsContent value="emails" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Verarbeitete E-Mails</h2>
                <p className="text-gray-500">Alle E-Mails mit Relevanz-Bewertung</p>
              </div>
            </div>

            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Betreff</TableHead>
                      <TableHead>Von</TableHead>
                      <TableHead>Konto</TableHead>
                      <TableHead>Kategorie</TableHead>
                      <TableHead>Relevanz</TableHead>
                      <TableHead>Empfangen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEmails.map((email) => (
                      <TableRow key={email.id}>
                        <TableCell className="font-medium">{email.subject}</TableCell>
                        <TableCell>{email.from_name || email.from_email}</TableCell>
                        <TableCell>
                          {accounts.find(a => a.id === email.account_id)?.email || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(email.category)}>
                            {email.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{email.relevance_score}/10</Badge>
                        </TableCell>
                        <TableCell>{formatDate(email.received_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">E-Mail-Konten</h2>
                <p className="text-gray-500">Konfiguration der überwachten Postfächer</p>
              </div>
              <Button onClick={() => setShowAddAccount(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Konto hinzufügen
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account) => (
                <AccountCard key={account.id} account={account} onEdit={setEditingAccount} />
              ))}
            </div>

            {/* Add Account Modal */}
            {showAddAccount && (
              <AddAccountModal 
                account={newAccount}
                setAccount={setNewAccount}
                onSave={addAccount}
                onCancel={() => setShowAddAccount(false)}
              />
            )}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">System-Logs</h2>
                <p className="text-gray-500">Aktivitäten und Fehlermeldungen</p>
              </div>
            </div>

            <Card>
              <CardContent>
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-4 py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-shrink-0">
                        <Badge variant={log.level === 'ERROR' ? 'destructive' : 'outline'}>
                          {log.level}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{log.message}</p>
                        <p className="text-xs text-gray-500">{formatDate(log.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Helper Components
const SummaryCard = ({ summary, onFeedback }: { summary: DailySummary; onFeedback: (id: string, rating: number, feedback: string) => void }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(summary.user_rating || 0);
  const [feedbackText, setFeedbackText] = useState(summary.feedback_text || '');

  const submitFeedback = () => {
    onFeedback(summary.id, rating, feedbackText);
    setShowFeedback(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{summary.account_email}</CardTitle>
            <CardDescription>
              {new Date(summary.date).toLocaleDateString('de-DE')} • {summary.email_count} E-Mails
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{summary.relevance_score}/10</Badge>
            <Button variant="outline" size="sm" onClick={() => setShowFeedback(!showFeedback)}>
              <Star className="mr-1 h-3 w-3" />
              Bewerten
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-700">{summary.summary_text}</p>
          
          <div className="flex flex-wrap gap-2">
            {Object.entries(summary.categories).map(([category, count]) => (
              <Badge key={category} variant="secondary">
                {category}: {count}
              </Badge>
            ))}
          </div>

          {showFeedback && (
            <div className="border-t pt-4 space-y-4">
              <div>
                <Label>Bewertung (1-6, Schulnotensystem)</Label>
                <div className="flex space-x-1 mt-1">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <Button
                      key={num}
                      variant={rating === num ? "default" : "outline"}
                      size="sm"
                      onClick={() => setRating(num)}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="feedback">Feedback (optional)</Label>
                <Textarea
                  id="feedback"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Was könnte verbessert werden?"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={submitFeedback} size="sm">Speichern</Button>
                <Button variant="outline" onClick={() => setShowFeedback(false)} size="sm">
                  Abbrechen
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AccountCard = ({ account, onEdit }: { account: EmailAccount; onEdit: (account: EmailAccount) => void }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{account.name}</CardTitle>
          <div className="flex items-center space-x-2">
            {account.is_active ? (
              <Badge className="bg-green-100 text-green-800">Aktiv</Badge>
            ) : (
              <Badge variant="secondary">Inaktiv</Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => onEdit(account)}>
              <Edit className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{account.email}</p>
          <p className="text-sm text-gray-500">{account.imap_host}:{account.imap_port}</p>
          <div className="flex justify-between text-sm">
            <span>E-Mails: {account.email_count}</span>
            <span>Fehler: {account.error_count}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Priorität: {account.priority_weight}x</span>
            <span className="text-gray-500">
              {account.last_checked ? formatDate(account.last_checked) : 'Nie geprüft'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AddAccountModal = ({ account, setAccount, onSave, onCancel }: {
  account: any;
  setAccount: (account: any) => void;
  onSave: () => void;
  onCancel: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>E-Mail-Konto hinzufügen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={account.name}
              onChange={(e) => setAccount({...account, name: e.target.value})}
              placeholder="z.B. Gmail Privat"
            />
          </div>
          
          <div>
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              value={account.email}
              onChange={(e) => setAccount({...account, email: e.target.value})}
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <Label htmlFor="provider">Provider</Label>
            <Select value={account.provider} onValueChange={(value) => setAccount({...account, provider: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="ionos">IONOS</SelectItem>
                <SelectItem value="custom">Benutzerdefiniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="imap_host">IMAP Server</Label>
              <Input
                id="imap_host"
                value={account.imap_host}
                onChange={(e) => setAccount({...account, imap_host: e.target.value})}
                placeholder="imap.gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="imap_port">Port</Label>
              <Input
                id="imap_port"
                type="number"
                value={account.imap_port}
                onChange={(e) => setAccount({...account, imap_port: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="username">Benutzername</Label>
            <Input
              id="username"
              value={account.username}
              onChange={(e) => setAccount({...account, username: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={account.password}
              onChange={(e) => setAccount({...account, password: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="priority">Prioritäts-Gewichtung</Label>
            <Input
              id="priority"
              type="number"
              step="0.1"
              value={account.priority_weight}
              onChange={(e) => setAccount({...account, priority_weight: parseFloat(e.target.value)})}
            />
          </div>
        </CardContent>
        <CardContent>
          <div className="flex space-x-2">
            <Button onClick={onSave}>Speichern</Button>
            <Button variant="outline" onClick={onCancel}>Abbrechen</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('de-DE');
} 