'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Shield,
  Loader2
} from 'lucide-react';

interface ApiKeysFormProps {
  onSave?: (keys: { openai_api_key?: string; claude_api_key?: string }) => void;
}

export function ApiKeysForm({ onSave }: ApiKeysFormProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [keys, setKeys] = useState({
    openai_api_key: '',
    claude_api_key: ''
  });
  
  const [keyStatus, setKeyStatus] = useState({
    hasOpenAiKey: false,
    hasClaudeKey: false
  });
  
  const [showKeys, setShowKeys] = useState({
    openai: false,
    claude: false
  });

  useEffect(() => {
    loadKeyStatus();
  }, []);

  const loadKeyStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/api-keys');
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys status');
      }
      
      const result = await response.json();
      setKeyStatus(result.data);
    } catch (err) {
      console.error('Error loading API keys status:', err);
      setError('Fehler beim Laden der API Key Status');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Filter out empty keys
      const keysToSave: { openai_api_key?: string; claude_api_key?: string } = {};
      
      if (keys.openai_api_key.trim()) {
        keysToSave.openai_api_key = keys.openai_api_key.trim();
      }
      
      if (keys.claude_api_key.trim()) {
        keysToSave.claude_api_key = keys.claude_api_key.trim();
      }

      if (Object.keys(keysToSave).length === 0) {
        setError('Bitte mindestens einen API Key eingeben');
        return;
      }

      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keysToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save API keys');
      }

      const result = await response.json();
      setKeyStatus(result.data);
      setSuccess('API Keys erfolgreich gespeichert');
      
      // Clear input fields
      setKeys({ openai_api_key: '', claude_api_key: '' });
      
      // Call onSave callback
      onSave?.(keysToSave);

    } catch (err) {
      console.error('Error saving API keys:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der API Keys');
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (keyType: 'openai' | 'claude') => {
    setShowKeys(prev => ({
      ...prev,
      [keyType]: !prev[keyType]
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Keys
        </CardTitle>
        <CardDescription>
          Hinterlege deine API Keys für OpenAI und Claude. Diese werden verschlüsselt gespeichert.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-full ${keyStatus.hasOpenAiKey ? 'bg-green-100' : 'bg-gray-200'}`}>
              <Key className={`h-4 w-4 ${keyStatus.hasOpenAiKey ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">OpenAI API</p>
              <p className="text-xs text-gray-500">
                {keyStatus.hasOpenAiKey ? 'Konfiguriert' : 'Nicht konfiguriert'}
              </p>
            </div>
            {keyStatus.hasOpenAiKey && (
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            )}
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className={`p-2 rounded-full ${keyStatus.hasClaudeKey ? 'bg-green-100' : 'bg-gray-200'}`}>
              <Key className={`h-4 w-4 ${keyStatus.hasClaudeKey ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="text-sm font-medium">Claude API</p>
              <p className="text-xs text-gray-500">
                {keyStatus.hasClaudeKey ? 'Konfiguriert' : 'Nicht konfiguriert'}
              </p>
            </div>
            {keyStatus.hasClaudeKey && (
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
            )}
          </div>
        </div>

        {/* API Key Input Forms */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai_key">OpenAI API Key</Label>
            <div className="relative">
              <Input
                id="openai_key"
                type={showKeys.openai ? 'text' : 'password'}
                placeholder="sk-..."
                value={keys.openai_api_key}
                onChange={(e) => setKeys(prev => ({ ...prev, openai_api_key: e.target.value }))}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => toggleShowKey('openai')}
              >
                {showKeys.openai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Erhältlich auf <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">platform.openai.com</a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="claude_key">Claude API Key</Label>
            <div className="relative">
              <Input
                id="claude_key"
                type={showKeys.claude ? 'text' : 'password'}
                placeholder="sk-ant-..."
                value={keys.claude_api_key}
                onChange={(e) => setKeys(prev => ({ ...prev, claude_api_key: e.target.value }))}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => toggleShowKey('claude')}
              >
                {showKeys.claude ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Erhältlich auf <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">console.anthropic.com</a>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Sicherheitshinweis</p>
            <p className="text-blue-700 mt-1">
              Ihre API Keys werden verschlüsselt in der Datenbank gespeichert und sind nur für Sie zugänglich.
              Teilen Sie Ihre API Keys niemals mit anderen.
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving || (!keys.openai_api_key.trim() && !keys.claude_api_key.trim())}
            className="bg-red-600 hover:bg-red-700"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Speichere...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                API Keys speichern
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 