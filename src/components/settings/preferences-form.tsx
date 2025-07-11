'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Settings, 
  Palette,
  Globe,
  Bell,
  Mail,
  RefreshCw,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface PreferencesFormProps {
  initialSettings?: {
    theme: 'light' | 'dark' | 'system';
    language: 'de' | 'en';
    notifications_enabled: boolean;
    email_notifications: boolean;
    auto_updates: boolean;
  };
  onSave?: (preferences: any) => void;
}

export function PreferencesForm({ initialSettings, onSave }: PreferencesFormProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [preferences, setPreferences] = useState({
    theme: initialSettings?.theme || 'system',
    language: initialSettings?.language || 'de',
    notifications_enabled: initialSettings?.notifications_enabled ?? true,
    email_notifications: initialSettings?.email_notifications ?? false,
    auto_updates: initialSettings?.auto_updates ?? true,
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save preferences');
      }

      setSuccess('Einstellungen erfolgreich gespeichert');
      onSave?.(preferences);

    } catch (err) {
      console.error('Error saving preferences:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Benutzereinstellungen
        </CardTitle>
        <CardDescription>
          Passe die Family Toolbox an deine Bedürfnisse an.
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

        {/* Appearance */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4 text-gray-600" />
            <h3 className="text-lg font-medium">Darstellung</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Design</Label>
              <Select value={preferences.theme} onValueChange={(value) => updatePreference('theme', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Design auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Hell</SelectItem>
                  <SelectItem value="dark">Dunkel</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="language">Sprache</Label>
              <Select value={preferences.language} onValueChange={(value) => updatePreference('language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sprache auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-gray-600" />
            <h3 className="text-lg font-medium">Benachrichtigungen</h3>
          </div>
          
          <div className="space-y-4 pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications_enabled">Web-Benachrichtigungen</Label>
                <p className="text-sm text-gray-500">
                  Erhalte Benachrichtigungen direkt im Browser
                </p>
              </div>
              <Switch
                id="notifications_enabled"
                checked={preferences.notifications_enabled}
                onCheckedChange={(checked) => updatePreference('notifications_enabled', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notifications">E-Mail Benachrichtigungen</Label>
                <p className="text-sm text-gray-500">
                  Erhalte wichtige Updates per E-Mail
                </p>
              </div>
              <Switch
                id="email_notifications"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
              />
            </div>
          </div>
        </div>

        {/* Updates */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 text-gray-600" />
            <h3 className="text-lg font-medium">Updates</h3>
          </div>
          
          <div className="pl-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_updates">Automatische Updates</Label>
                <p className="text-sm text-gray-500">
                  Installiere Updates automatisch im Hintergrund
                </p>
              </div>
              <Switch
                id="auto_updates"
                checked={preferences.auto_updates}
                onCheckedChange={(checked) => updatePreference('auto_updates', checked)}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            onClick={handleSave} 
            disabled={saving}
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
                Einstellungen speichern
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 