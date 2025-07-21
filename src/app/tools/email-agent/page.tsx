'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Brain, 
  Star,
  User
} from 'lucide-react';

export default function EmailAgentPage() {
  const [emailData, setEmailData] = useState({
    subject: '',
    from: '',
    body: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateSummary = async () => {
    if (!emailData.subject || !emailData.from || !emailData.body) {
      alert('Bitte füllen Sie alle Felder aus.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/email-agent/summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Zusammenfassung erstellt!');
        // Hier könnte man das Ergebnis anzeigen
      } else {
        alert('Fehler beim Erstellen der Zusammenfassung.');
      }
    } catch (error) {
      console.error('Error creating summary:', error);
      alert('Fehler beim Erstellen der Zusammenfassung.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEvaluateRelevance = async () => {
    if (!emailData.subject || !emailData.from || !emailData.body) {
      alert('Bitte füllen Sie alle Felder aus.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/email-agent/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Relevanz-Bewertung: ${result.relevance_score}/10`);
      } else {
        alert('Fehler bei der Relevanz-Bewertung.');
      }
    } catch (error) {
      console.error('Error evaluating relevance:', error);
      alert('Fehler bei der Relevanz-Bewertung.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* E-Mail Eingabe */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                E-Mail Eingabe
              </CardTitle>
              <CardDescription>
                Gib die E-Mail-Details ein, die analysiert werden sollen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Betreff</Label>
                <Input
                  id="subject"
                  placeholder="E-Mail Betreff..."
                  value={emailData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="from">Von</Label>
                <Input
                  id="from"
                  placeholder="absender@example.com"
                  value={emailData.from}
                  onChange={(e) => handleInputChange('from', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="body">E-Mail Inhalt</Label>
                <Textarea
                  id="body"
                  placeholder="E-Mail Inhalt hier eingeben..."
                  rows={8}
                  value={emailData.body}
                  onChange={(e) => handleInputChange('body', e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleCreateSummary}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Zusammenfassung erstellen
                </Button>
                <Button 
                  onClick={handleEvaluateRelevance}
                  disabled={isLoading}
                  variant="outline"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Relevanz bewerten
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Über den E-Mail Agent */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Über den E-Mail Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  Der E-Mail Agent verwendet künstliche Intelligenz, um Ihre E-Mails zu analysieren und automatisch Zusammenfassungen zu erstellen.
                </p>
                <p><strong>Features:</strong></p>
                <ul className="space-y-1 ml-4">
                  <li>• Automatische Relevanz-Bewertung</li>
                  <li>• Intelligente Zusammenfassungen</li>
                  <li>• Kategorisierung von E-Mails</li>
                  <li>• Extraktion von Aktionspunkten</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 