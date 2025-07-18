# Multi-Agent E-Mail Zusammenfassungstool - Vollständiges Briefing

## Projektübersicht

### Ziel
Entwicklung eines intelligenten E-Mail-Managementtools für den Kita-Verein "wuermchen.org", das täglich automatische Zusammenfassungen der relevanten E-Mails aus drei Postfächern erstellt und durch kontinuierliches Lernen die Qualität der Zusammenfassungen verbessert.

### Postfächer
- `chr.bernecker@gmail.com` (Gmail)
- `finanzen@wuermchen.org` (IONOS)
- `vorstand@wuermchen.org` (IONOS)

### Besondere Prioritäten
- `amandabernecker@gmail.com` hat höchste Priorität (Ehefrau)
- Persönliche Mails > System-/Werbemails
- Konfigurierbare Absender-Gewichtung

## Fachliche Anforderungen

### Funktionale Anforderungen

**FR-01: E-Mail-Abruf und -Speicherung**
- Kontinuierlicher Abruf aller drei Postfächer (alle 30 Minuten)
- Intelligente Duplikatserkennung
- Automatische Löschung alter Daten nach definierter Retention

**FR-02: Intelligente Zusammenfassung**
- Tägliche Zusammenfassung der letzten 6 Stunden
- Relevanz-basierte Filterung (1-10 Skala)
- Postfach-spezifische Zusammenfassungen
- Priorisierung nach Absender-Gewichtung

**FR-03: Kontinuierliches Lernen**
- Feedback-System mit Schulnotensystem (1-6)
- Freitext-Feedback für Zusammenfassungen
- Manuelle Relevanz-Bewertung (1-10) für Lernphase
- Automatische Prompt-Optimierung basierend auf Feedback

**FR-04: Real-time Updates**
- Live-Updates neuer E-Mails im Frontend
- Sofortige Anzeige neuer Zusammenfassungen
- Push-Benachrichtigungen bei hochpriorisierten Mails

### Non-funktionale Anforderungen

**NFR-01: Performance**
- Token-effiziente LLM-Nutzung (Budget: ~$5/Monat)
- Response-Zeit < 2 Sekunden für Frontend
- Batch-Processing für E-Mail-Verarbeitung

**NFR-02: Sicherheit**
- Sichere Speicherung von E-Mail-Credentials
- GDPR-konforme Datenverarbeitung
- Verschlüsselung sensibler Daten

**NFR-03: Verfügbarkeit**
- 99% Uptime durch Serverless-Architektur
- Graceful Degradation bei API-Ausfällen
- Retry-Mechanismen für externe Services

## Technische Architektur

### Stack Overview
- **Frontend**: React.js auf Netlify
- **Backend**: Netlify Functions + Supabase Edge Functions
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Real-time Subscriptions
- **LLM**: Claude API (primär), Ollama (sekundär)

### System-Komponenten

#### Agent 1: Mail Manager Service
**Verantwortlichkeiten:**
- IMAP-Verbindung zu allen Postfächern
- E-Mail-Abruf und -Parsing
- Duplikatserkennung
- Datenbank-Persistierung
- Lifecycle-Management (Löschung alter Mails)

**Implementierung:**
- Supabase Edge Function (für längere Laufzeiten)
- Node.js mit `imap` Library
- Cron-Trigger alle 30 Minuten via Netlify Function

#### Agent 2: Summary Generator
**Verantwortlichkeiten:**
- Relevanz-Bewertung neuer E-Mails (1-10)
- Erstellung täglicher Zusammenfassungen
- Priorisierung nach Absender-Gewichtung
- Kategorisierung (persönlich/system/werbung)

**Implementierung:**
- Netlify Function mit Claude API Integration
- Token-optimierte Prompts
- Batch-Processing für Effizienz

#### Agent 3: Learning Optimizer
**Verantwortlichkeiten:**
- Feedback-Verarbeitung
- Prompt-Optimierung basierend auf Bewertungen
- Relevanz-Modell Training
- A/B-Testing verschiedener Zusammenfassungsstrategien

**Implementierung:**
- Lokales LLM via Ollama auf Supabase Edge Functions
- Feedback-Aggregation und -Analyse
- Kontinuierliche Prompt-Verbesserung

## Datenmodell (Supabase Schema)

```sql
-- E-Mail-Konfiguration
CREATE TABLE email_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  provider VARCHAR(50) NOT NULL, -- 'gmail' oder 'ionos'
  imap_host VARCHAR(255) NOT NULL,
  imap_port INTEGER NOT NULL,
  username VARCHAR(255) NOT NULL,
  password_encrypted TEXT NOT NULL,
  priority_weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Absender-Prioritäten
CREATE TABLE sender_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_address VARCHAR(255) UNIQUE NOT NULL,
  priority_weight INTEGER DEFAULT 1, -- 1-10, höher = wichtiger
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E-Mails
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES email_accounts(id),
  message_id VARCHAR(255) UNIQUE NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255),
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  relevance_score INTEGER, -- 1-10, von Agent 2 oder manuell
  relevance_confidence DECIMAL(3,2), -- 0.00-1.00
  category VARCHAR(50), -- 'personal', 'system', 'marketing', 'other'
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tägliche Zusammenfassungen
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  account_id UUID REFERENCES email_accounts(id),
  time_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
  summary_text TEXT NOT NULL,
  total_emails INTEGER NOT NULL,
  relevant_emails INTEGER NOT NULL,
  high_priority_emails INTEGER NOT NULL,
  prompt_version VARCHAR(50),
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback zu Zusammenfassungen
CREATE TABLE summary_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_id UUID REFERENCES daily_summaries(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 6), -- Schulnotensystem
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback zu E-Mail-Relevanz (Lernphase)
CREATE TABLE relevance_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID REFERENCES emails(id),
  manual_relevance_score INTEGER CHECK (manual_relevance_score >= 1 AND manual_relevance_score <= 10),
  feedback_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompt-Versionen für A/B-Testing
CREATE TABLE prompt_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_name VARCHAR(50) UNIQUE NOT NULL,
  agent_type VARCHAR(50) NOT NULL, -- 'summary' oder 'relevance'
  prompt_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  performance_score DECIMAL(3,2), -- Durchschnittsbewertung
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX idx_emails_account_received ON emails(account_id, received_at DESC);
CREATE INDEX idx_emails_relevance ON emails(relevance_score DESC, received_at DESC);
CREATE INDEX idx_summaries_date_account ON daily_summaries(date DESC, account_id);
CREATE INDEX idx_sender_priorities_email ON sender_priorities(email_address);
```

## Agent-Implementierungen

### Agent 1: Mail Manager (Supabase Edge Function)

```typescript
// supabase/functions/mail-manager/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import ImapClient from 'https://esm.sh/imap@0.8.19'

interface EmailAccount {
  id: string
  email: string
  imap_host: string
  imap_port: number
  username: string
  password_encrypted: string
  priority_weight: number
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    // Alle E-Mail-Accounts abrufen
    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('*')
    
    if (error) throw error

    const results = []
    
    for (const account of accounts) {
      const newEmails = await fetchEmailsFromAccount(account)
      results.push({
        account: account.email,
        newEmails: newEmails.length,
        processed: true
      })
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function fetchEmailsFromAccount(account: EmailAccount): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const imap = new ImapClient({
      host: account.imap_host,
      port: account.imap_port,
      tls: true,
      user: account.username,
      password: decrypt(account.password_encrypted),
      tlsOptions: { rejectUnauthorized: false }
    })

    imap.once('ready', () => {
      imap.openBox('INBOX', false, async (err, box) => {
        if (err) {
          reject(err)
          return
        }

        // Nur E-Mails der letzten 6 Stunden
        const since = new Date()
        since.setHours(since.getHours() - 6)
        
        imap.search(['SINCE', since], async (err, results) => {
          if (err) {
            reject(err)
            return
          }

          if (results.length === 0) {
            resolve([])
            imap.end()
            return
          }

          const emails = []
          const fetch = imap.fetch(results, {
            bodies: '',
            envelope: true,
            struct: true
          })

          fetch.on('message', (msg, seqno) => {
            let emailData = {}

            msg.on('body', (stream, info) => {
              let buffer = ''
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8')
              })
              stream.once('end', () => {
                emailData.body = buffer
              })
            })

            msg.once('attributes', (attrs) => {
              emailData = {
                ...emailData,
                messageId: attrs.uid,
                envelope: attrs.envelope,
                date: attrs.envelope.date,
                subject: attrs.envelope.subject?.[0] || '',
                from: attrs.envelope.from?.[0] || {},
                to: attrs.envelope.to || []
              }
            })

            msg.once('end', async () => {
              // Duplikatsprüfung
              const { data: existing } = await supabase
                .from('emails')
                .select('id')
                .eq('message_id', emailData.messageId)
                .single()

              if (!existing) {
                await saveEmailToDatabase(emailData, account.id)
                emails.push(emailData)
              }
            })
          })

          fetch.once('end', () => {
            resolve(emails)
            imap.end()
          })
        })
      })
    })

    imap.once('error', reject)
    imap.connect()
  })
}

async function saveEmailToDatabase(emailData: any, accountId: string) {
  const { error } = await supabase
    .from('emails')
    .insert({
      account_id: accountId,
      message_id: emailData.messageId,
      sender_email: emailData.from.address || '',
      sender_name: emailData.from.name || '',
      subject: emailData.subject,
      body_text: extractTextFromBody(emailData.body),
      body_html: emailData.body,
      received_at: new Date(emailData.date).toISOString()
    })

  if (error) {
    console.error('Error saving email:', error)
  }
}

function decrypt(encryptedPassword: string): string {
  // Implementierung der Passwort-Entschlüsselung
  // Verwende crypto-js oder ähnliche Library
  return encryptedPassword // Placeholder
}

function extractTextFromBody(body: string): string {
  // HTML zu Text Konvertierung
  return body.replace(/<[^>]*>/g, '').trim()
}
```

### Agent 2: Summary Generator (Netlify Function)

```typescript
// netlify/functions/generate-summaries.ts
import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export const handler: Handler = async (event, context) => {
  try {
    const now = new Date()
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000)

    // Alle Accounts abrufen
    const { data: accounts } = await supabase
      .from('email_accounts')
      .select('*')

    const summaries = []

    for (const account of accounts) {
      const summary = await generateSummaryForAccount(account, sixHoursAgo, now)
      if (summary) {
        summaries.push(summary)
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        summaries: summaries.length,
        timestamp: now.toISOString()
      })
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}

async function generateSummaryForAccount(account: any, startTime: Date, endTime: Date) {
  // E-Mails für den Zeitraum abrufen
  const { data: emails } = await supabase
    .from('emails')
    .select(`
      *,
      sender_priorities!left(priority_weight)
    `)
    .eq('account_id', account.id)
    .gte('received_at', startTime.toISOString())
    .lte('received_at', endTime.toISOString())
    .eq('is_processed', false)

  if (!emails || emails.length === 0) {
    return null
  }

  // Relevanz-Bewertung für jede E-Mail
  const processedEmails = []
  for (const email of emails) {
    const relevanceScore = await evaluateEmailRelevance(email)
    
    // E-Mail mit Relevanz-Score aktualisieren
    await supabase
      .from('emails')
      .update({
        relevance_score: relevanceScore.score,
        relevance_confidence: relevanceScore.confidence,
        category: relevanceScore.category,
        is_processed: true
      })
      .eq('id', email.id)

    processedEmails.push({
      ...email,
      relevance_score: relevanceScore.score,
      category: relevanceScore.category
    })
  }

  // Nur relevante E-Mails (Score >= 6) für Zusammenfassung
  const relevantEmails = processedEmails.filter(email => email.relevance_score >= 6)
  
  if (relevantEmails.length === 0) {
    return null
  }

  // Zusammenfassung generieren
  const summaryText = await generateSummaryText(relevantEmails, account)
  
  // Zusammenfassung speichern
  const { data: summary } = await supabase
    .from('daily_summaries')
    .insert({
      date: new Date().toISOString().split('T')[0],
      account_id: account.id,
      time_range_start: startTime.toISOString(),
      time_range_end: endTime.toISOString(),
      summary_text: summaryText,
      total_emails: emails.length,
      relevant_emails: relevantEmails.length,
      high_priority_emails: relevantEmails.filter(e => e.relevance_score >= 8).length,
      prompt_version: 'v1.0'
    })
    .select()
    .single()

  return summary
}

async function evaluateEmailRelevance(email: any) {
  const prompt = `
Du bist ein AI-Assistent für einen Kita-Verein (wuermchen.org). 
Bewerte die Relevanz dieser E-Mail auf einer Skala von 1-10:

ABSENDER: ${email.sender_email} (${email.sender_name || 'Unbekannt'})
BETREFF: ${email.subject}
INHALT: ${email.body_text?.substring(0, 500) || 'Kein Text'}

KONTEXT:
- Dies ist ein Kita-Verein
- Persönliche Mails sind wichtiger als System-/Werbemails
- amandabernecker@gmail.com hat höchste Priorität
- Finanzen und Vorstandsthemen sind wichtig

KATEGORIEN:
- personal: Persönliche Kommunikation, wichtige Anfragen
- system: Automatische Benachrichtigungen, Server-Mails
- marketing: Werbung, Newsletter, Spam
- other: Alles andere

Antworte NUR mit diesem JSON-Format:
{
  "score": <1-10>,
  "confidence": <0.0-1.0>,
  "category": "<personal|system|marketing|other>",
  "reasoning": "<kurze Begründung>"
}
`

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Günstiger für Batch-Processing
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }]
    })

    const result = JSON.parse(response.content[0].text)
    
    // Prioritäts-Bonus basierend auf Absender
    const senderPriority = email.sender_priorities?.priority_weight || 1
    const adjustedScore = Math.min(10, result.score + (senderPriority - 1))

    return {
      score: adjustedScore,
      confidence: result.confidence,
      category: result.category
    }

  } catch (error) {
    console.error('Error evaluating relevance:', error)
    return {
      score: 5, // Default-Wert
      confidence: 0.1,
      category: 'other'
    }
  }
}

async function generateSummaryText(emails: any[], account: any) {
  const emailsText = emails
    .sort((a, b) => b.relevance_score - a.relevance_score)
    .map(email => `
PRIORITÄT: ${email.relevance_score}/10
VON: ${email.sender_name} <${email.sender_email}>
BETREFF: ${email.subject}
KATEGORIE: ${email.category}
INHALT: ${email.body_text?.substring(0, 300)}...
---`)
    .join('\n')

  const prompt = `
Erstelle eine prägnante deutsche Zusammenfassung für das Postfach ${account.email}.

ZEITRAUM: Letzte 6 Stunden
ANZAHL E-MAILS: ${emails.length} relevante von insgesamt verarbeitet

E-MAILS:
${emailsText}

ANFORDERUNGEN:
- Gruppiere nach Priorität/Themen
- Hebe besonders wichtige Punkte hervor
- Erwähne Handlungsbedarf explizit
- Verwende eine freundliche, professionelle Sprache
- Maximal 200 Wörter

Format:
## Zusammenfassung ${account.email}

[Deine Zusammenfassung hier]

### Handlungsbedarf:
[Falls vorhanden]
`

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }]
    })

    return response.content[0].text

  } catch (error) {
    console.error('Error generating summary:', error)
    return `Zusammenfassung für ${account.email}: ${emails.length} relevante E-Mails erhalten. Manuelle Überprüfung empfohlen.`
  }
}
```

### Agent 3: Learning Optimizer (Netlify Function)

```typescript
// netlify/functions/learning-optimizer.ts
import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const handler: Handler = async (event, context) => {
  try {
    if (event.httpMethod === 'POST') {
      const { type, data } = JSON.parse(event.body!)
      
      if (type === 'summary_feedback') {
        await processSummaryFeedback(data)
      } else if (type === 'relevance_feedback') {
        await processRelevanceFeedback(data)
      }
      
      // Periodische Optimierung ausführen
      await optimizePrompts()
      
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      }
    }

    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}

async function processSummaryFeedback(feedbackData: any) {
  // Feedback in Datenbank speichern
  await supabase
    .from('summary_feedback')
    .insert({
      summary_id: feedbackData.summaryId,
      rating: feedbackData.rating,
      feedback_text: feedbackData.feedbackText
    })

  // Schlechte Bewertungen (4-6) analysieren
  if (feedbackData.rating >= 4) {
    await analyzeBadFeedback(feedbackData)
  }
}

async function processRelevanceFeedback(feedbackData: any) {
  // Manuelle Relevanz-Bewertung speichern
  await supabase
    .from('relevance_feedback')
    .insert({
      email_id: feedbackData.emailId,
      manual_relevance_score: feedbackData.relevanceScore,
      feedback_notes: feedbackData.notes
    })

  // Training-Dataset erweitern
  await updateTrainingData(feedbackData)
}

async function optimizePrompts() {
  // Durchschnittliche Bewertungen der letzten 30 Tage abrufen
  const { data: recentFeedback } = await supabase
    .from('summary_feedback')
    .select(`
      rating,
      feedback_text,
      daily_summaries(prompt_version)
    `)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (!recentFeedback || recentFeedback.length < 10) {
    return // Nicht genug Daten für Optimierung
  }

  const avgRating = recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length

  // Wenn Durchschnittsbewertung < 2.5, neue Prompt-Version erstellen
  if (avgRating > 2.5) {
    await createImprovedPrompt(recentFeedback)
  }
}

async function createImprovedPrompt(feedbackData: any[]) {
  // Häufige Kritikpunkte analysieren
  const commonIssues = analyzeFeedbackPatterns(feedbackData)
  
  // Neue Prompt-Version mit Verbesserungen erstellen
  const improvedPrompt = generateImprovedPrompt(commonIssues)
  
  await supabase
    .from('prompt_versions')
    .insert({
      version_name: `v${Date.now()}`,
      agent_type: 'summary',
      prompt_text: improvedPrompt,
      is_active: false // Erst nach A/B-Test aktivieren
    })
}

function analyzeFeedbackPatterns(feedbackData: any[]): string[] {
  const issues = []
  const negativeFeedback = feedbackData.filter(f => f.rating >= 4)
  
  for (const feedback of negativeFeedback) {
    if (feedback.feedback_text) {
      const text = feedback.feedback_text.toLowerCase()
      if (text.includes('zu lang')) issues.push('length')
      if (text.includes('unwichtig') || text.includes('irrelevant')) issues.push('relevance')
      if (text.includes('unverständlich')) issues.push('clarity')
      if (text.includes('fehlt')) issues.push('completeness')
    }
  }
  
  return [...new Set(issues)]
}

function generateImprovedPrompt(issues: string[]): string {
  let basePrompt = `
Erstelle eine prägnante deutsche Zusammenfassung für das Postfach.

ANFORDERUNGEN:
- Gruppiere nach Priorität/Themen
- Hebe besonders wichtige Punkte hervor
- Erwähne Handlungsbedarf explizit
- Verwende eine freundliche, professionelle Sprache
`

  // Anpassungen basierend auf Feedback
  if (issues.includes('length')) {
    basePrompt += '- Maximal 150 Wörter (statt 200)\n'
  }
  
  if (issues.includes('relevance')) {
    basePrompt += '- Fokussiere nur auf wirklich wichtige E-Mails (Score >= 7)\n'
  }
  
  if (issues.includes('clarity')) {
    basePrompt += '- Verwende einfache, klare Sprache\n- Vermeide Fachbegriffe\n'
  }
  
  if (issues.includes('completeness')) {
    basePrompt += '- Stelle sicher, dass alle wichtigen Informationen enthalten sind\n'
  }

  return basePrompt
}
```

## Token-Optimierung Strategy

### LLM-Aufteilung
1. **Claude Haiku**: Relevanz-Bewertung (günstig, schnell)
2. **Claude Sonnet**: Zusammenfassungen (qualitativ hochwertig)
3. **Lokales Ollama**: Feedback-Analyse (kostenlos)

### Token-Sparpakete
- **Batch-Processing**: Mehrere E-Mails in einem Request
- **Template-Prompts**: Wiederverwendbare Prompt-Strukturen
- **Caching**: Ähnliche E-Mails nicht neu bewerten
- **Relevanz-Filter**: Nur relevante E-Mails (>= 6) für Zusammenfassung

### Geschätzte Kosten
- 50 E-Mails/Tag × 3 Postfächer = 150 E-Mails
- Relevanz-Bewertung: 150 × 200 Tokens = 30k Tokens/Tag
- Zusammenfassungen: 3 × 800 Tokens = 2.4k Tokens/Tag
- **Monatlich**: ~1M Tokens ≈ $3-5/Monat

## Rate Limits & Constraints

### Gmail IMAP Limits
- **Bandwidth**: 2.5 GB/Tag
- **Requests**: 250 IMAP requests/Benutzer/Sekunde
- **Mitigation**: Exponential Backoff, Request-Batching

### IONOS IMAP Limits
- **Connections**: Max 10 gleichzeitige Verbindungen
- **Rate**: Keine offiziellen Limits dokumentiert
- **Mitigation**: Conservative Connection Pooling

### Netlify Function Limits
- **Execution Time**: 10 Sekunden (daher Supabase Edge Functions für IMAP)
- **Memory**: 1024 MB
- **Invocations**: 125k/Monat (Free Tier)

### Claude API Limits
- **Rate**: 5 Requests/Minute (Tier 1)
- **Monthly**: 30k Tokens/Monat (Free Tier)
- **Mitigation**: Request Queuing, Batch Processing

## Real-time Implementation

### Supabase Real-time Setup
```typescript
// Frontend: Real-time Subscriptions
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Neue E-Mails abonnieren
const emailSubscription = supabase
  .channel('emails')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'emails' },
    (payload) => {
      console.log('Neue E-Mail:', payload.new)
      // Update UI
      addNewEmailToList(payload.new)
    }
  )
  .subscribe()

// Neue Zusammenfassungen abonnieren
const summarySubscription = supabase
  .channel('summaries')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'daily_summaries' },
    (payload) => {
      console.log('Neue Zusammenfassung:', payload.new)
      // Update Dashboard
      addNewSummaryToDashboard(payload.new)
    }
  )
  .subscribe()
```

### Push Notifications (Optional)
```typescript
// High-Priority E-Mail Notifications
const checkHighPriorityEmails = async () => {
  const { data: highPriorityEmails } = await supabase
    .from('emails')
    .select('*')
    .gte('relevance_score', 9)
    .eq('notification_sent', false)

  for (const email of highPriorityEmails) {
    await sendPushNotification({
      title: 'Wichtige E-Mail erhalten',
      body: `Von: ${email.sender_name}\nBetreff: ${email.subject}`,
      data: { emailId: email.id }
    })

    // Notification als gesendet markieren
    await supabase
      .from('emails')
      .update({ notification_sent: true })
      .eq('id', email.id)
  }
}
```

## Frontend-Komponenten

### Dashboard-Layout
```typescript
// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const Dashboard: React.FC = () => {
  const [summaries, setSummaries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentSummaries()
    setupRealTimeSubscriptions()
  }, [])

  const loadRecentSummaries = async () => {
    const { data } = await supabase
      .from('daily_summaries')
      .select(`
        *,
        email_accounts(email)
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    setSummaries(data || [])
    setLoading(false)
  }

  return (
    <div className="dashboard">
      <h1>E-Mail Dashboard</h1>
      
      <div className="summary-grid">
        {summaries.map(summary => (
          <SummaryCard 
            key={summary.id} 
            summary={summary}
            onFeedback={handleFeedback}
          />
        ))}
      </div>
      
      <RelevanceLearning />
    </div>
  )
}
```

### Feedback-Interface
```typescript
// src/components/FeedbackInterface.tsx
const FeedbackInterface: React.FC<{ summaryId: string }> = ({ summaryId }) => {
  const [rating, setRating] = useState<number>(1)
  const [feedbackText, setFeedbackText] = useState('')

  const submitFeedback = async () => {
    await fetch('/.netlify/functions/learning-optimizer', {
      method: 'POST',
      body: JSON.stringify({
        type: 'summary_feedback',
        data: { summaryId, rating, feedbackText }
      })
    })
  }

  return (
    <div className="feedback-interface">
      <h3>Zusammenfassung bewerten</h3>
      
      <div className="rating-scale">
        {[1, 2, 3, 4, 5, 6].map(num => (
          <button
            key={num}
            className={rating === num ? 'active' : ''}
            onClick={() => setRating(num)}
          >
            {num}
          </button>
        ))}
      </div>
      
      <textarea
        placeholder="Feedback zur Zusammenfassung..."
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
      />
      
      <button onClick={submitFeedback}>
        Feedback senden
      </button>
    </div>
  )
}
```

## Deployment & Configuration

### Netlify Deployment
```yaml
# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

# Umgebungsvariablen
[context.production.environment]
  SUPABASE_URL = "your-supabase-url"
  SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
  ANTHROPIC_API_KEY = "your-claude-api-key"
```

### Cron-Jobs Setup
```typescript
// netlify/functions/scheduled-mail-fetch.ts
exports.handler = async (event, context) => {
  // Trigger für Supabase Edge Function
  const response = await fetch('https://your-supabase-project.supabase.co/functions/v1/mail-manager', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    }
  })

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true })
  }
}
```

### Supabase Edge Functions Deployment
```bash
# Deployment-Befehle
supabase functions deploy mail-manager --project-ref your-project-ref
supabase functions deploy learning-optimizer --project-ref your-project-ref

# Cron-Job für Edge Function
supabase functions schedule mail-manager --cron "*/30 * * * *" --project-ref your-project-ref
```

## Entwicklungsreihenfolge

### Phase 1: Foundation (Woche 1-2)
1. **Supabase Setup**
   - Datenbank-Schema erstellen
   - Row Level Security konfigurieren
   - Real-time aktivieren

2. **Basic Frontend**
   - React-App mit Tailwind CSS
   - Supabase-Integration
   - Grundlegendes Dashboard

3. **Mail-Account Konfiguration**
   - Sichere Credential-Speicherung
   - Test-Verbindungen zu allen Postfächern

### Phase 2: Agent 1 - Mail Manager (Woche 3)
1. **IMAP-Integration**
   - Supabase Edge Function
   - E-Mail-Parsing
   - Duplikatserkennung

2. **Datenbank-Integration**
   - E-Mail-Speicherung
   - Lifecycle-Management

3. **Testing & Debugging**
   - Rate-Limit-Handling
   - Error-Recovery

### Phase 3: Agent 2 - Summary Generator (Woche 4)
1. **Relevanz-Bewertung**
   - Claude Haiku Integration
   - Scoring-Algorithmus
   - Absender-Priorisierung

2. **Zusammenfassungs-Generierung**
   - Claude Sonnet Integration
   - Template-Optimierung
   - Token-Effizienz

3. **Frontend-Integration**
   - Summary-Display
   - Real-time Updates

### Phase 4: Agent 3 - Learning System (Woche 5-6)
1. **Feedback-Interface**
   - Rating-System (1-6)
   - Freitext-Feedback
   - Relevanz-Bewertung (1-10)

2. **Learning-Algorithmus**
   - Feedback-Analyse
   - Prompt-Optimierung
   - A/B-Testing

3. **Continuous Improvement**
   - Performance-Monitoring
   - Automatische Anpassungen

### Phase 5: Optimization & Polish (Woche 7)
1. **Performance-Optimierung**
   - Token-Efficiency
   - Caching-Strategien
   - Rate-Limit-Optimierung

2. **User Experience**
   - UI/UX-Verbesserungen
   - Mobile Responsiveness
   - Accessibility

3. **Monitoring & Analytics**
   - Error-Tracking
   - Performance-Metriken
   - Usage-Analytics

## Monitoring & Wartung

### Health Checks
```typescript
// netlify/functions/health-check.ts
exports.handler = async () => {
  const checks = []

  // Supabase Verbindung
  try {
    await supabase.from('email_accounts').select('count').single()
    checks.push({ service: 'supabase', status: 'healthy' })
  } catch (error) {
    checks.push({ service: 'supabase', status: 'unhealthy', error: error.message })
  }

  // Claude API
  try {
    await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 10,
      messages: [{ role: "user", content: "Test" }]
    })
    checks.push({ service: 'claude', status: 'healthy' })
  } catch (error) {
    checks.push({ service: 'claude', status: 'unhealthy', error: error.message })
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      checks,
      overall: checks.every(c => c.status === 'healthy') ? 'healthy' : 'unhealthy'
    })
  }
}
```

### Error Handling
- **Graceful Degradation**: Bei API-Ausfällen weiter funktionsfähig
- **Retry Logic**: Exponential Backoff für externe Services
- **Alerting**: Slack/E-Mail bei kritischen Fehlern
- **Logging**: Strukturierte Logs für Debugging

## Sicherheitsaspekte

### Datenschutz (GDPR)
- **Datenminimierung**: Nur relevante E-Mail-Teile speichern
- **Retention**: Automatische Löschung nach 90 Tagen
- **Verschlüsselung**: Supabase RLS + Column-Encryption für sensitive Daten
- **Anonymisierung**: KI-Training nur mit anonymisierten Daten

### Zugriffskontrolle
- **Row Level Security**: User-spezifische Datenfilterung
- **API-Authentication**: Service-Role-Keys für Backend
- **Rate Limiting**: Schutz vor Abuse
- **Audit Logging**: Alle kritischen Aktionen protokollieren

## Testing Strategy

### Unit Tests
```typescript
// tests/agents/mail-manager.test.ts
describe('Mail Manager Agent', () => {
  test('should fetch new emails from IMAP', async () => {
    const mockAccount = { /* ... */ }
    const emails = await fetchEmailsFromAccount(mockAccount)
    expect(emails).toBeInstanceOf(Array)
  })

  test('should detect duplicate emails', async () => {
    // Test-Implementation
  })
})
```

### Integration Tests
```typescript
// tests/integration/e2e.test.ts
describe('End-to-End Flow', () => {
  test('should process emails and generate summary', async () => {
    // 1. Trigger Mail-Fetch
    // 2. Verify E-Mails in DB
    // 3. Trigger Summary Generation
    // 4. Verify Summary Quality
  })
})
```

### Performance Tests
- **Load Testing**: Simuliere hohe E-Mail-Volumina
- **Token Usage**: Überwache API-Kosten
- **Response Times**: Frontend-Performance

---

## Nächste Schritte

1. **Supabase-Projekt erstellen** und Schema deployen
2. **Netlify-App erstellen** und Umgebungsvariablen setzen
3. **Test-E-Mail-Accounts** für Development einrichten
4. **Phase 1 Development** starten mit Foundation-Setup

**Geschätzter Zeitaufwand**: 6-7 Wochen für MVP
**Laufende Kosten**: ~$8-12/Monat (Supabase + API-Calls + Netlify Pro)

Dieses Briefing bietet eine vollständige Roadmap für die Entwicklung des Multi-Agent E-Mail-Tools mit allen technischen Details und Best Practices für eine professionelle Implementierung.