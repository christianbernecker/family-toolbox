# URL Watcher Tool - Vollständiges Briefing (4-Agent-Architektur)

## Projektübersicht

### Ziel
Entwicklung eines intelligenten URL-Überwachungstools als Erweiterung des bestehenden E-Mail-Managementsystems. Das Tool überwacht bis zu 50 URLs auf relevante inhaltliche Änderungen und benachrichtigt den Nutzer automatisch via E-Mail und Browser-Push-Notifications.

### Integration
Das URL Watcher Tool wird vollständig in das bestehende Multi-Agent E-Mail-System integriert und nutzt gemeinsame Infrastruktur-Komponenten (Supabase, Netlify, Dashboard, Benachrichtigungssystem).

### 4-Agent-Architektur

**Agent 1 (Observer):** Website-Überwachung, Content-Speicherung, Datenbank-Lifecycle
**Agent 2 (Änderungs-Checker):** LLM-basierte Relevanz-Analyse von Änderungen
**Agent 3 (Notifier):** Multi-Channel-Benachrichtigungssystem
**Agent 4 (Optimizer):** Kontinuierliches Lernen durch User-Feedback

## Fachliche Anforderungen

### Funktionale Anforderungen

**FR-01: URL-Management**
- Hinzufügen/Entfernen von URLs (max. 50)
- URL-spezifische Überwachungsanweisungen definieren
- Tags und Gruppierung für bessere Organisation
- Individuelle Überwachungsintervalle pro URL
- Temporäres Stumm-Schalten (Snoozing)

**FR-02: Intelligente Inhalts-Überwachung**
- Stündliche Überwachung aller aktiven URLs
- JavaScript-Rendering für SPA-Support
- Intelligente Diff-Erkennung (Textinhalte fokussiert)
- Automatisches Ignorieren von Datum/Zeit-Feldern, Werbung, etc.
- Änderungs-Historie für 90 Tage

**FR-03: LLM-basierte Relevanz-Bewertung**
- URL-spezifische Überwachungsanweisungen berücksichtigen
- Kategorisierung von Änderungen (hoch/mittel/niedrig/irrelevant)
- Kontextuelle Analyse basierend auf Website-Typ
- Token-effiziente Batch-Verarbeitung

**FR-04: Multi-Channel-Benachrichtigungen**
- HTML-E-Mails mit Diff-Highlighting
- Browser-Push-Notifications
- Konfigurierbare Benachrichtigungsfrequenz pro URL
- Benachrichtigungsfilter basierend auf Relevanz-Level

**FR-05: Kontinuierliches Lernen**
- User-Feedback zu Relevanz-Bewertungen
- Automatische Prompt-Optimierung
- Lernhistorie und Performance-Tracking
- A/B-Testing verschiedener Bewertungsstrategien

### Non-funktionale Anforderungen

**NFR-01: Performance & Skalierung**
- Gleichzeitiger Abruf von max. 50 URLs
- Content-Größenlimit: 5MB pro Seite
- Response-Zeit < 3 Sekunden für Frontend-Operationen
- Effiziente Caching-Strategien

**NFR-02: Kosten-Effizienz**
- LLM-Token-Budget: ~$2-3/Monat zusätzlich
- Intelligente Batch-Verarbeitung
- Nur Änderungen werden LLM-analysiert

**NFR-03: Rechtliche Compliance**
- Respektierung von robots.txt (optional)
- Rate-Limiting zur Server-Schonung
- Transparente Bot-Identifikation
- GDPR-konforme Datenspeicherung

**NFR-04: Integration & Wartbarkeit**
- Nahtlose Integration in bestehendes E-Mail-Dashboard
- Shared Authentication und User-Management
- Gemeinsame Benachrichtigungsinfrastruktur
- Einheitliches UI/UX-Design

## Technische Architektur

### Agent 1: Observer (Website-Überwachung)

**Verantwortlichkeiten:**
- Periodischer Abruf aller aktiven URLs
- Content-Extraktion und -Normalisierung
- Diff-Berechnung gegen vorherige Version
- Datenbank-Speicherung neuer Snapshots
- Automatische Bereinigung alter Daten (90 Tage)
- Caching-Management für Performance

**Technische Implementierung:**
- Supabase Edge Function mit Playwright
- Cron-Schedule alle 60 Minuten
- Parallelverarbeitung mit Rate-Limiting
- Intelligente Content-Extraktion

**Performance-Optimierungen:**
- Content-Hashing für Change-Detection
- Compressed Storage für Snapshots
- Smart Retry-Logic mit Exponential Backoff

### Agent 2: Änderungs-Checker (LLM-Relevanz-Analyse)

**Verantwortlichkeiten:**
- Analyse aller neuen Diffs von Agent 1
- URL-spezifische Anweisungen interpretieren
- Relevanz-Bewertung via LLM
- Kategorisierung der Änderungen
- Confidence-Score für Bewertungen

**LLM-Integration:**
- **Primär:** GPT-4o-mini (kostengünstig, hochwertig)
- **Backup:** Claude Haiku (Fallback bei API-Ausfällen)
- Token-optimierte Prompts mit Batch-Processing

**Intelligenz-Features:**
- Kontextbewusste Analyse basierend auf Website-Typ
- Automatisches Ignorieren von Standard-Elementen
- Lernfähige Prompt-Anpassung

### Agent 3: Notifier (Benachrichtigungssystem)

**Verantwortlichkeiten:**
- Verarbeitung relevanter Änderungen von Agent 2
- HTML-E-Mail-Generierung mit Diff-Highlighting
- Browser-Push-Notification-Versendung
- Benachrichtigungsfilterung nach User-Präferenzen
- Delivery-Tracking und Retry-Handling

**Benachrichtigungskanäle:**
- **E-Mail:** Stylish HTML-Templates mit Change-Previews
- **Push:** Browser-Notifications mit Sofort-/Batch-Modi
- **Dashboard:** Real-time In-App-Notifications

**Smart-Features:**
- Adaptive Benachrichtigungsfrequenz
- Prioritätsbasierte Sortierung
- Snooze-Funktionalität

### Agent 4: Optimizer (Kontinuierliches Lernen)

**Verantwortlichkeiten:**
- User-Feedback-Sammlung und -Analyse
- Prompt-Engineering basierend auf Feedback-Patterns
- Performance-Monitoring aller Agenten
- A/B-Testing neuer Bewertungsstrategien
- Kontinuierliche Modell-Verbesserung

**Learning-Pipeline:**
- Feedback-Aggregation und Pattern-Erkennung
- Automatische Prompt-Optimierung
- Performance-Metriken und Erfolgs-Tracking

## Datenmodell (Supabase Schema-Erweiterung)

```sql
-- URL-Konfiguration
CREATE TABLE watched_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  monitoring_instructions TEXT NOT NULL, -- LLM-Anweisungen
  monitoring_interval INTEGER DEFAULT 60, -- Minuten
  is_active BOOLEAN DEFAULT TRUE,
  is_snoozed BOOLEAN DEFAULT FALSE,
  snooze_until TIMESTAMP WITH TIME ZONE,
  last_checked TIMESTAMP WITH TIME ZONE,
  last_changed TIMESTAMP WITH TIME ZONE,
  check_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  tags TEXT[], -- Array für Tag-System
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "frequency": "immediate"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content-Snapshots
CREATE TABLE url_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES watched_urls(id) ON DELETE CASCADE,
  content_hash VARCHAR(64) NOT NULL, -- SHA-256 für Change-Detection
  raw_content TEXT, -- Komprimiert gespeichert
  extracted_text TEXT NOT NULL, -- Bereinigter Text-Content
  metadata JSONB, -- Title, Meta-Tags, etc.
  content_size INTEGER,
  fetch_duration INTEGER, -- Millisekunden
  fetch_status INTEGER, -- HTTP Status Code
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Erkannte Änderungen
CREATE TABLE content_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES watched_urls(id) ON DELETE CASCADE,
  previous_snapshot_id UUID REFERENCES url_snapshots(id),
  current_snapshot_id UUID REFERENCES url_snapshots(id),
  change_type VARCHAR(50) NOT NULL, -- 'content', 'structure', 'metadata'
  diff_text TEXT, -- Textuelle Beschreibung der Änderung
  diff_html TEXT, -- HTML mit Highlighting
  change_summary TEXT, -- Von Agent 1 generiert
  relevance_score INTEGER, -- 1-10 von Agent 2
  relevance_category VARCHAR(50), -- 'high', 'medium', 'low', 'irrelevant'
  confidence_score DECIMAL(3,2), -- 0.00-1.00
  llm_reasoning TEXT, -- Begründung vom LLM
  is_user_relevant BOOLEAN, -- Basierend auf User-Feedback
  notification_sent BOOLEAN DEFAULT FALSE,
  analyzed_at TIMESTAMP WITH TIME ZONE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Benachrichtigungen
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  change_id UUID REFERENCES content_changes(id),
  notification_type VARCHAR(20) NOT NULL, -- 'email', 'push', 'in_app'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'read'
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Feedback für Learning
CREATE TABLE change_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  change_id UUID REFERENCES content_changes(id),
  feedback_type VARCHAR(20) NOT NULL, -- 'relevance', 'quality', 'accuracy'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1=irrelevant, 5=sehr relevant
  feedback_text TEXT,
  correction_data JSONB, -- Strukturierte Korrekturen
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LLM-Prompt-Versionen für A/B-Testing
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) UNIQUE NOT NULL,
  template_type VARCHAR(50) NOT NULL, -- 'relevance_analysis', 'change_summary'
  prompt_content TEXT NOT NULL,
  version VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  performance_score DECIMAL(3,2), -- Durchschnittliche User-Bewertung
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2), -- Anteil positiver Bewertungen
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- URL-Tags für Organisation
CREATE TABLE url_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  tag_name VARCHAR(50) NOT NULL,
  tag_color VARCHAR(7), -- Hex-Farbcode
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tag_name)
);

-- Performance-Metriken
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  metric_unit VARCHAR(20),
  agent_name VARCHAR(50),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX idx_watched_urls_active ON watched_urls(is_active, last_checked) WHERE is_active = true;
CREATE INDEX idx_watched_urls_user ON watched_urls(user_id);
CREATE INDEX idx_snapshots_url_captured ON url_snapshots(url_id, captured_at DESC);
CREATE INDEX idx_changes_url_detected ON content_changes(url_id, detected_at DESC);
CREATE INDEX idx_changes_relevance ON content_changes(relevance_score DESC, detected_at DESC);
CREATE INDEX idx_notifications_user_status ON notifications(user_id, status, created_at DESC);
CREATE INDEX idx_feedback_change ON change_feedback(change_id);

-- Trigger für automatische Updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_watched_urls_updated_at BEFORE UPDATE ON watched_urls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Agent-Implementierungen

### Agent 1: Observer (Supabase Edge Function)

```typescript
// supabase/functions/url-observer/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { chromium } from 'https://esm.sh/playwright-chromium@1.40.0'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface WatchedURL {
  id: string
  url: string
  title: string
  monitoring_interval: number
  last_checked: string | null
  notification_settings: any
}

serve(async (req) => {
  try {
    console.log('🔍 URL Observer Agent started')

    // Aktive URLs abrufen, die überwacht werden müssen
    const urlsToCheck = await getURLsToCheck()
    console.log(`📋 Found ${urlsToCheck.length} URLs to check`)

    const results = []
    const browser = await chromium.launch({ headless: true })

    try {
      // Parallele Verarbeitung mit Rate-Limiting (max 5 gleichzeitig)
      const chunks = chunkArray(urlsToCheck, 5)
      
      for (const chunk of chunks) {
        const chunkResults = await Promise.allSettled(
          chunk.map(url => processURL(browser, url))
        )
        
        chunkResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          } else {
            console.error(`❌ Error processing ${chunk[index].url}:`, result.reason)
            results.push({
              url_id: chunk[index].id,
              url: chunk[index].url,
              success: false,
              error: result.reason.message
            })
          }
        })

        // Rate-Limiting: 2 Sekunden Pause zwischen Chunks
        if (chunks.indexOf(chunk) < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
    } finally {
      await browser.close()
    }

    // Cleanup alte Snapshots (älter als 90 Tage)
    await cleanupOldSnapshots()

    return new Response(JSON.stringify({
      success: true,
      processed: results.length,
      changes_detected: results.filter(r => r.has_changes).length,
      errors: results.filter(r => !r.success).length,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('💥 Observer Agent failed:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function getURLsToCheck(): Promise<WatchedURL[]> {
  const now = new Date()
  const { data: urls, error } = await supabase
    .from('watched_urls')
    .select('*')
    .eq('is_active', true)
    .eq('is_snoozed', false)
    .or(`last_checked.is.null,last_checked.lt.${
      new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    }`)

  if (error) {
    throw new Error(`Failed to fetch URLs: ${error.message}`)
  }

  return urls || []
}

async function processURL(browser: any, urlConfig: WatchedURL) {
  const startTime = Date.now()
  
  console.log(`🌐 Processing: ${urlConfig.url}`)

  // Update last_checked timestamp
  await supabase
    .from('watched_urls')
    .update({ 
      last_checked: new Date().toISOString(),
      check_count: supabase.rpc('increment_count', { url_id: urlConfig.id })
    })
    .eq('id', urlConfig.id)

  try {
    const page = await browser.newPage({
      userAgent: 'Mozilla/5.0 (compatible; URLWatcher/1.0; +https://your-domain.com/bot)'
    })

    // Set timeouts and limits
    page.setDefaultTimeout(30000)
    await page.setViewportSize({ width: 1280, height: 720 })

    // Navigate to URL
    const response = await page.goto(urlConfig.url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    })

    if (!response || !response.ok()) {
      throw new Error(`HTTP ${response?.status()}: ${response?.statusText()}`)
    }

    // Wait for dynamic content (but not too long)
    await page.waitForTimeout(2000)

    // Extract content
    const content = await extractPageContent(page)
    const contentHash = await generateContentHash(content.extractedText)

    await page.close()

    // Check if content has changed
    const { data: lastSnapshot } = await supabase
      .from('url_snapshots')
      .select('content_hash, id')
      .eq('url_id', urlConfig.id)
      .order('captured_at', { ascending: false })
      .limit(1)
      .single()

    const hasChanges = !lastSnapshot || lastSnapshot.content_hash !== contentHash

    // Save new snapshot
    const { data: newSnapshot, error: snapshotError } = await supabase
      .from('url_snapshots')
      .insert({
        url_id: urlConfig.id,
        content_hash: contentHash,
        raw_content: compressContent(content.rawContent),
        extracted_text: content.extractedText,
        metadata: content.metadata,
        content_size: content.extractedText.length,
        fetch_duration: Date.now() - startTime,
        fetch_status: response.status()
      })
      .select()
      .single()

    if (snapshotError) {
      throw snapshotError
    }

    // If changes detected, create change record for Agent 2
    if (hasChanges && lastSnapshot) {
      await createChangeRecord(urlConfig.id, lastSnapshot.id, newSnapshot.id, content)
    }

    console.log(`✅ ${urlConfig.url}: ${hasChanges ? 'CHANGED' : 'unchanged'}`)

    return {
      url_id: urlConfig.id,
      url: urlConfig.url,
      success: true,
      has_changes: hasChanges,
      content_size: content.extractedText.length,
      fetch_duration: Date.now() - startTime
    }

  } catch (error) {
    console.error(`❌ Error processing ${urlConfig.url}:`, error)

    // Update error count
    await supabase
      .from('watched_urls')
      .update({ 
        error_count: supabase.rpc('increment_error_count', { url_id: urlConfig.id }),
        last_error: error.message
      })
      .eq('id', urlConfig.id)

    throw error
  }
}

async function extractPageContent(page: any) {
  const content = await page.evaluate(() => {
    // Remove irrelevant elements
    const elementsToRemove = [
      'script', 'style', 'nav', 'header', 'footer', 
      '[class*="ad"]', '[class*="banner"]', '[class*="cookie"]',
      '[class*="popup"]', '[id*="ad"]', '.advertisement'
    ]
    
    elementsToRemove.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => el.remove())
    })

    // Extract meaningful text
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement
          if (!parent) return NodeFilter.FILTER_REJECT
          
          const style = window.getComputedStyle(parent)
          if (style.display === 'none' || style.visibility === 'hidden') {
            return NodeFilter.FILTER_REJECT
          }
          
          return node.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        }
      }
    )

    const textNodes = []
    let node
    while (node = walker.nextNode()) {
      const text = node.textContent?.trim()
      if (text && text.length > 10) { // Filter very short text
        textNodes.push(text)
      }
    }

    return {
      rawContent: document.documentElement.outerHTML,
      extractedText: textNodes.join('\n').replace(/\s+/g, ' ').trim(),
      metadata: {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content'),
        lastModified: document.lastModified,
        url: window.location.href
      }
    }
  })

  return content
}

async function generateContentHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

function compressContent(content: string): string {
  // Simple compression - könnte durch gzip ersetzt werden
  return content.replace(/\s+/g, ' ').trim()
}

async function createChangeRecord(urlId: string, previousSnapshotId: string, currentSnapshotId: string, content: any) {
  const { error } = await supabase
    .from('content_changes')
    .insert({
      url_id: urlId,
      previous_snapshot_id: previousSnapshotId,
      current_snapshot_id: currentSnapshotId,
      change_type: 'content',
      change_summary: `Content updated: ${content.extractedText.substring(0, 200)}...`,
      detected_at: new Date().toISOString()
    })

  if (error) {
    console.error('Failed to create change record:', error)
  } else {
    console.log(`📝 Change record created for URL ${urlId}`)
  }
}

async function cleanupOldSnapshots() {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
  
  const { error } = await supabase
    .from('url_snapshots')
    .delete()
    .lt('captured_at', ninetyDaysAgo.toISOString())

  if (error) {
    console.error('Failed to cleanup old snapshots:', error)
  } else {
    console.log('🧹 Cleaned up old snapshots')
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}
```

### Agent 2: Änderungs-Checker (Netlify Function)

```typescript
// netlify/functions/change-analyzer.ts
import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

export const handler: Handler = async (event, context) => {
  try {
    console.log('🤖 Change Analyzer Agent started')

    // Unanalysierte Änderungen abrufen
    const { data: pendingChanges, error } = await supabase
      .from('content_changes')
      .select(`
        *,
        watched_urls!inner(
          id,
          url,
          title,
          monitoring_instructions,
          notification_settings
        ),
        current_snapshot:url_snapshots!current_snapshot_id(extracted_text, metadata),
        previous_snapshot:url_snapshots!previous_snapshot_id(extracted_text, metadata)
      `)
      .is('analyzed_at', null)
      .limit(20) // Batch-Processing

    if (error) {
      throw new Error(`Failed to fetch pending changes: ${error.message}`)
    }

    if (!pendingChanges || pendingChanges.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No pending changes to analyze',
          processed: 0
        })
      }
    }

    console.log(`📊 Analyzing ${pendingChanges.length} changes`)

    const results = []
    for (const change of pendingChanges) {
      try {
        const analysis = await analyzeChange(change)
        await updateChangeWithAnalysis(change.id, analysis)
        results.push({ changeId: change.id, success: true, ...analysis })

        // Rate limiting für LLM API
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Failed to analyze change ${change.id}:`, error)
        results.push({ changeId: change.id, success: false, error: error.message })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        processed: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('💥 Change Analyzer Agent failed:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}

async function analyzeChange(change: any) {
  const { watched_urls: url, current_snapshot, previous_snapshot } = change

  // Generiere Diff-Text
  const diffText = generateDiffText(
    previous_snapshot?.extracted_text || '', 
    current_snapshot?.extracted_text || ''
  )

  // Hole aktuelle Prompt-Version
  const { data: promptTemplate } = await supabase
    .from('prompt_templates')
    .select('*')
    .eq('template_type', 'relevance_analysis')
    .eq('is_active', true)
    .single()

  const prompt = buildAnalysisPrompt(url, diffText, promptTemplate?.prompt_content)

  // LLM-Analyse (primär GPT-4o-mini)
  let analysis
  try {
    analysis = await performGPTAnalysis(prompt)
  } catch (error) {
    console.warn('GPT analysis failed, falling back to Claude:', error)
    analysis = await performClaudeAnalysis(prompt)
  }

  // Generiere HTML-Diff für Benachrichtigungen
  const diffHtml = generateDiffHtml(
    previous_snapshot?.extracted_text || '', 
    current_snapshot?.extracted_text || ''
  )

  return {
    ...analysis,
    diff_html: diffHtml,
    diff_text: diffText
  }
}

function buildAnalysisPrompt(url: any, diffText: string, customTemplate?: string): string {
  const basePrompt = customTemplate || `
Du bist ein AI-Assistent für die Überwachung von Website-Änderungen.

WEBSITE-INFORMATIONEN:
URL: ${url.url}
Titel: ${url.title || 'Unbekannt'}
Überwachungsanweisungen: ${url.monitoring_instructions}

ERKANNTE ÄNDERUNG:
${diffText.substring(0, 2000)}${diffText.length > 2000 ? '...' : ''}

AUFGABE:
Bewerte die Relevanz dieser Änderung basierend auf den Überwachungsanweisungen.
Berücksichtige den Kontext der Website und ignoriere unwichtige Elemente wie:
- Datum/Zeit-Anzeigen
- Werbe-Banner  
- Besucherzähler
- Cookie-Hinweise
- Navigation-Updates

ANTWORT-FORMAT (nur JSON):
{
  "relevance_score": <1-10>,
  "relevance_category": "<high|medium|low|irrelevant>",
  "confidence_score": <0.0-1.0>,
  "reasoning": "<kurze Begründung>",
  "change_type": "<content|structure|metadata|navigation>",
  "user_action_required": <true|false>,
  "summary": "<prägnante Zusammenfassung der Änderung>"
}
`

  return basePrompt
}

async function performGPTAnalysis(prompt: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 500,
    temperature: 0.1
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from GPT')
  }

  try {
    return JSON.parse(content)
  } catch (parseError) {
    throw new Error(`Failed to parse GPT response: ${content}`)
  }
}

async function performClaudeAnalysis(prompt: string) {
  const response = await anthropic.messages.create({
    model: "claude-3-haiku-20240307",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }]
  })

  const content = response.content[0]?.text
  if (!content) {
    throw new Error('No response from Claude')
  }

  try {
    return JSON.parse(content)
  } catch (parseError) {
    throw new Error(`Failed to parse Claude response: ${content}`)
  }
}

function generateDiffText(oldText: string, newText: string): string {
  // Einfache Diff-Implementierung (kann durch difflib ersetzt werden)
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  
  const diff = []
  const maxLines = Math.max(oldLines.length, newLines.length)
  
  for (let i = 0; i < maxLines && diff.length < 20; i++) {
    const oldLine = oldLines[i] || ''
    const newLine = newLines[i] || ''
    
    if (oldLine !== newLine) {
      if (oldLine) diff.push(`- ${oldLine}`)
      if (newLine) diff.push(`+ ${newLine}`)
    }
  }
  
  return diff.join('\n')
}

function generateDiffHtml(oldText: string, newText: string): string {
  // HTML-Version für E-Mail-Benachrichtigungen
  const diffText = generateDiffText(oldText, newText)
  
  return diffText
    .replace(/^- (.*)$/gm, '<div class="diff-removed">- $1</div>')
    .replace(/^\+ (.*)$/gm, '<div class="diff-added">+ $1</div>')
}

async function updateChangeWithAnalysis(changeId: string, analysis: any) {
  const { error } = await supabase
    .from('content_changes')
    .update({
      relevance_score: analysis.relevance_score,
      relevance_category: analysis.relevance_category,
      confidence_score: analysis.confidence_score,
      llm_reasoning: analysis.reasoning,
      diff_text: analysis.diff_text,
      diff_html: analysis.diff_html,
      analyzed_at: new Date().toISOString()
    })
    .eq('id', changeId)

  if (error) {
    throw new Error(`Failed to update change ${changeId}: ${error.message}`)
  }

  console.log(`✅ Updated change ${changeId} with relevance score ${analysis.relevance_score}`)
}
```

### Agent 3: Notifier (Netlify Function)

```typescript
// netlify/functions/notification-sender.ts
import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import webpush from 'web-push'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// E-Mail-Transport konfigurieren
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST!,
  port: parseInt(process.env.SMTP_PORT!),
  secure: true,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!
  }
})

// Web Push konfigurieren
webpush.setVapidDetails(
  'mailto:' + process.env.CONTACT_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export const handler: Handler = async (event, context) => {
  try {
    console.log('📬 Notification Agent started')

    // Relevante Änderungen abrufen, die noch nicht benachrichtigt wurden
    const { data: relevantChanges, error } = await supabase
      .from('content_changes')
      .select(`
        *,
        watched_urls!inner(
          id,
          url,
          title,
          notification_settings,
          user_id
        )
      `)
      .eq('notification_sent', false)
      .gte('relevance_score', 6) // Nur mittlere bis hohe Relevanz
      .not('relevance_category', 'eq', 'irrelevant')

    if (error) {
      throw new Error(`Failed to fetch relevant changes: ${error.message}`)
    }

    if (!relevantChanges || relevantChanges.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No relevant changes to notify',
          sent: 0
        })
      }
    }

    console.log(`🔔 Sending notifications for ${relevantChanges.length} changes`)

    const results = []
    for (const change of relevantChanges) {
      try {
        const notificationResults = await sendNotifications(change)
        results.push({ changeId: change.id, success: true, ...notificationResults })
        
        // Mark as notified
        await supabase
          .from('content_changes')
          .update({ notification_sent: true })
          .eq('id', change.id)

      } catch (error) {
        console.error(`Failed to send notifications for change ${change.id}:`, error)
        results.push({ changeId: change.id, success: false, error: error.message })
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        processed: results.length,
        successful: results.filter(r => r.success).length,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('💥 Notification Agent failed:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    }
  }
}

async function sendNotifications(change: any) {
  const { watched_urls: url } = change
  const settings = url.notification_settings
  const results = { email: false, push: false }

  // E-Mail-Benachrichtigung
  if (settings.email) {
    try {
      await sendEmailNotification(change, url)
      results.email = true
      await recordNotification(url.user_id, change.id, 'email', 'sent')
    } catch (error) {
      console.error('Email notification failed:', error)
      await recordNotification(url.user_id, change.id, 'email', 'failed', error.message)
    }
  }

  // Push-Benachrichtigung
  if (settings.push) {
    try {
      await sendPushNotification(change, url)
      results.push = true
      await recordNotification(url.user_id, change.id, 'push', 'sent')
    } catch (error) {
      console.error('Push notification failed:', error)
      await recordNotification(url.user_id, change.id, 'push', 'failed', error.message)
    }
  }

  return results
}

async function sendEmailNotification(change: any, url: any) {
  const emailHtml = generateEmailHtml(change, url)
  
  const mailOptions = {
    from: process.env.FROM_EMAIL!,
    to: process.env.NOTIFICATION_EMAIL!, // Deine E-Mail-Adresse
    subject: `🔔 Änderung erkannt: ${url.title || url.url}`,
    html: emailHtml
  }

  await emailTransporter.sendMail(mailOptions)
  console.log(`📧 Email sent for change ${change.id}`)
}

function generateEmailHtml(change: any, url: any): string {
  const relevanceEmoji = {
    'high': '🔥',
    'medium': '⚠️',
    'low': 'ℹ️'
  }[change.relevance_category] || '📝'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>URL Watcher - Änderung erkannt</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { padding: 20px; }
    .relevance-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
    .relevance-high { background: #fee2e2; color: #dc2626; }
    .relevance-medium { background: #fef3c7; color: #d97706; }
    .relevance-low { background: #dbeafe; color: #2563eb; }
    .diff-container { background: #f8f9fa; border-radius: 6px; padding: 15px; margin: 15px 0; border-left: 4px solid #667eea; }
    .diff-added { background: #d4edda; padding: 2px 4px; margin: 2px 0; border-radius: 3px; }
    .diff-removed { background: #f8d7da; padding: 2px 4px; margin: 2px 0; border-radius: 3px; text-decoration: line-through; }
    .footer { background: #f8f9fa; padding: 15px 20px; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; text-align: center; }
    .btn { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Website-Änderung erkannt</h1>
      <p style="margin: 0; opacity: 0.9;">${url.title || url.url}</p>
    </div>
    
    <div class="content">
      <div class="relevance-badge relevance-${change.relevance_category}">
        ${relevanceEmoji} ${change.relevance_category.toUpperCase()} (${change.relevance_score}/10)
      </div>
      
      <h2>Änderungsdetails</h2>
      <p><strong>URL:</strong> <a href="${url.url}" target="_blank">${url.url}</a></p>
      <p><strong>Erkannt am:</strong> ${new Date(change.detected_at).toLocaleString('de-DE')}</p>
      <p><strong>Konfidenz:</strong> ${Math.round(change.confidence_score * 100)}%</p>
      
      ${change.llm_reasoning ? `
      <h3>KI-Bewertung</h3>
      <p>${change.llm_reasoning}</p>
      ` : ''}
      
      <h3>Erkannte Änderungen</h3>
      <div class="diff-container">
        ${change.diff_html || change.diff_text || 'Änderungen erkannt, aber Details konnten nicht generiert werden.'}
      </div>
      
      <a href="${process.env.APP_URL}/dashboard" class="btn">Dashboard öffnen</a>
    </div>
    
    <div class="footer">
      URL Watcher Tool | <a href="${process.env.APP_URL}/settings">Einstellungen</a>
    </div>
  </div>
</body>
</html>
  `
}

async function sendPushNotification(change: any, url: any) {
  // Alle Push-Subscriptions für den User abrufen
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', url.user_id)
    .eq('is_active', true)

  if (!subscriptions || subscriptions.length === 0) {
    console.log('No push subscriptions found for user')
    return
  }

  const payload = JSON.stringify({
    title: `🔔 ${url.title || 'Website-Änderung'}`,
    body: `${change.llm_reasoning || 'Relevante Änderung erkannt'}`,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: url.url,
      changeId: change.id,
      action: 'view_change'
    },
    actions: [
      {
        action: 'view',
        title: 'Anzeigen'
      },
      {
        action: 'dismiss',
        title: 'Schließen'
      }
    ]
  })

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        JSON.parse(subscription.subscription_data),
        payload
      )
    } catch (error) {
      console.error(`Failed to send push to subscription ${subscription.id}:`, error)
      
      // Deaktiviere ungültige Subscriptions
      if (error.statusCode === 410) {
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false })
          .eq('id', subscription.id)
      }
    }
  }

  console.log(`📱 Push notifications sent for change ${change.id}`)
}

async function recordNotification(userId: string, changeId: string, type: string, status: string, errorMessage?: string) {
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      change_id: changeId,
      notification_type: type,
      status,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
      error_message: errorMessage
    })
}
```

### Agent 4: Optimizer (Netlify Function)

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
      
      if (type === 'relevance_feedback') {
        await processRelevanceFeedback(data)
      } else if (type === 'optimize_prompts') {
        await optimizePrompts()
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true })
      }
    }

    // Automatische Optimierung (Cron-Job)
    await performAutomaticOptimization()

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        message: 'Automatic optimization completed'
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

async function processRelevanceFeedback(feedbackData: any) {
  // User-Feedback in Datenbank speichern
  await supabase
    .from('change_feedback')
    .insert({
      user_id: feedbackData.userId,
      change_id: feedbackData.changeId,
      feedback_type: 'relevance',
      rating: feedbackData.rating,
      feedback_text: feedbackData.feedbackText,
      correction_data: feedbackData.corrections
    })

  // Change-Record mit User-Feedback aktualisieren
  if (feedbackData.rating <= 2) {
    // User findet es irrelevant
    await supabase
      .from('content_changes')
      .update({ is_user_relevant: false })
      .eq('id', feedbackData.changeId)
  } else if (feedbackData.rating >= 4) {
    // User findet es relevant
    await supabase
      .from('content_changes')
      .update({ is_user_relevant: true })
      .eq('id', feedbackData.changeId)
  }

  console.log(`📝 Processed feedback for change ${feedbackData.changeId}`)
}

async function performAutomaticOptimization() {
  console.log('🎯 Starting automatic optimization')

  // Performance-Metriken sammeln
  await collectPerformanceMetrics()

  // Prompt-Optimierung basierend auf Feedback
  await optimizePrompts()

  // Schlecht performende URLs identifizieren
  await identifyProblematicUrls()

  console.log('✅ Automatic optimization completed')
}

async function collectPerformanceMetrics() {
  // Durchschnittliche Relevanz-Accuracy berechnen
  const { data: feedbackStats } = await supabase
    .from('change_feedback')
    .select('rating, change_id')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (feedbackStats && feedbackStats.length > 0) {
    const avgUserRating = feedbackStats.reduce((sum, f) => sum + f.rating, 0) / feedbackStats.length
    
    await supabase
      .from('system_metrics')
      .insert({
        metric_type: 'user_satisfaction',
        metric_value: avgUserRating,
        metric_unit: 'rating_1_5',
        agent_name: 'change_analyzer'
      })
  }

  // False-Positive-Rate berechnen
  const { data: accuracyStats } = await supabase
    .from('content_changes')
    .select('relevance_score, is_user_relevant')
    .not('is_user_relevant', 'is', null)
    .gte('detected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (accuracyStats && accuracyStats.length > 0) {
    const correctPredictions = accuracyStats.filter(s => 
      (s.relevance_score >= 6 && s.is_user_relevant) ||
      (s.relevance_score < 6 && !s.is_user_relevant)
    ).length

    const accuracy = correctPredictions / accuracyStats.length

    await supabase
      .from('system_metrics')
      .insert({
        metric_type: 'relevance_accuracy',
        metric_value: accuracy,
        metric_unit: 'percentage',
        agent_name: 'change_analyzer'
      })
  }
}

async function optimizePrompts() {
  // Sammle Feedback-Patterns der letzten 30 Tage
  const { data: recentFeedback } = await supabase
    .from('change_feedback')
    .select(`
      *,
      content_changes!inner(
        relevance_score,
        relevance_category,
        llm_reasoning,
        watched_urls!inner(monitoring_instructions)
      )
    `)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (!recentFeedback || recentFeedback.length < 10) {
    console.log('Insufficient feedback for prompt optimization')
    return
  }

  // Analysiere häufige Fehler
  const lowRatedChanges = recentFeedback.filter(f => f.rating <= 2)
  const commonIssues = analyzeCommonIssues(lowRatedChanges)

  // Erstelle verbesserte Prompt-Version
  if (commonIssues.length > 0) {
    const improvedPrompt = generateImprovedPrompt(commonIssues)
    
    // Neue Prompt-Version als Kandidat speichern
    await supabase
      .from('prompt_templates')
      .insert({
        template_name: `auto_optimized_${Date.now()}`,
        template_type: 'relevance_analysis',
        prompt_content: improvedPrompt,
        version: `auto_v${Math.floor(Date.now() / 1000)}`,
        is_active: false // Erst nach A/B-Test aktivieren
      })

    console.log('🔧 Created improved prompt template')
  }
}

function analyzeCommonIssues(lowRatedFeedback: any[]): string[] {
  const issues = []
  
  for (const feedback of lowRatedFeedback) {
    const text = feedback.feedback_text?.toLowerCase() || ''
    const reasoning = feedback.content_changes.llm_reasoning?.toLowerCase() || ''
    
    // Häufige Probleme identifizieren
    if (text.includes('nicht wichtig') || text.includes('irrelevant')) {
      issues.push('false_positive')
    }
    if (text.includes('zu sensitiv') || text.includes('übertrieben')) {
      issues.push('oversensitive')
    }
    if (text.includes('datum') || text.includes('zeit')) {
      issues.push('temporal_elements')
    }
    if (text.includes('werbung') || text.includes('banner')) {
      issues.push('advertising_elements')
    }
    if (reasoning.includes('navigation') && feedback.rating <= 2) {
      issues.push('navigation_changes')
    }
  }
  
  // Zähle Häufigkeiten
  const issueFrequency = {}
  issues.forEach(issue => {
    issueFrequency[issue] = (issueFrequency[issue] || 0) + 1
  })
  
  // Returniere Issues mit > 20% Häufigkeit
  const threshold = lowRatedFeedback.length * 0.2
  return Object.keys(issueFrequency).filter(issue => issueFrequency[issue] > threshold)
}

function generateImprovedPrompt(commonIssues: string[]): string {
  let basePrompt = `
Du bist ein AI-Assistent für die Überwachung von Website-Änderungen.

AUFGABE:
Bewerte die Relevanz dieser Änderung basierend auf den Überwachungsanweisungen.
`

  // Anpassungen basierend auf häufigen Problemen
  if (commonIssues.includes('false_positive')) {
    basePrompt += `
WICHTIG: Sei konservativer bei der Relevanz-Bewertung. Nur wirklich bedeutsame Änderungen sollten als relevant eingestuft werden.
`
  }

  if (commonIssues.includes('temporal_elements')) {
    basePrompt += `
IGNORIERE EXPLIZIT:
- Datum/Zeit-Anzeigen und Zeitstempel
- "Zuletzt aktualisiert" Informationen
- Relative Zeitangaben wie "vor 2 Stunden"
`
  }

  if (commonIssues.includes('advertising_elements')) {
    basePrompt += `
IGNORIERE WERBUNG UND MARKETING:
- Werbe-Banner und Promotional-Content
- Shopping-Angebote und Preise (außer explizit überwacht)
- Newsletter-Anmeldungen
`
  }

  if (commonIssues.includes('navigation_changes')) {
    basePrompt += `
NAVIGATION-ÄNDERUNGEN:
- Navigation-Updates sind meist nicht relevant
- Fokussiere auf Haupt-Content-Bereiche
`
  }

  basePrompt += `
ANTWORT-FORMAT (nur JSON):
{
  "relevance_score": <1-10>,
  "relevance_category": "<high|medium|low|irrelevant>",
  "confidence_score": <0.0-1.0>,
  "reasoning": "<kurze Begründung>",
  "change_type": "<content|structure|metadata|navigation>",
  "user_action_required": <true|false>,
  "summary": "<prägnante Zusammenfassung der Änderung>"
}
`

  return basePrompt
}

async function identifyProblematicUrls() {
  // URLs mit häufig falsch-positiven Bewertungen identifizieren
  const { data: problematicUrls } = await supabase
    .from('watched_urls')
    .select(`
      id,
      url,
      title,
      content_changes!inner(
        id,
        relevance_score,
        is_user_relevant
      )
    `)
    .gte('content_changes.detected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  for (const url of problematicUrls || []) {
    const changes = url.content_changes
    const falsePositives = changes.filter(c => 
      c.relevance_score >= 6 && c.is_user_relevant === false
    ).length

    const falsePositiveRate = falsePositives / changes.length

    if (falsePositiveRate > 0.5 && changes.length >= 5) {
      console.log(`⚠️ URL ${url.url} has high false-positive rate: ${falsePositiveRate}`)
      
      // Könnte automatisch Monitoring-Instructions anpassen oder Admin benachrichtigen
    }
  }
}
```

## Frontend-Integration (React-Komponenten)

### URL-Management Dashboard

```typescript
// src/components/URLWatcher/URLDashboard.tsx
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Globe, AlertCircle, CheckCircle, Clock } from 'lucide-react'

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL!, process.env.REACT_APP_SUPABASE_ANON_KEY!)

const URLDashboard: React.FC = () => {
  const [urls, setUrls] = useState([])
  const [recentChanges, setRecentChanges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddUrl, setShowAddUrl] = useState(false)

  useEffect(() => {
    loadURLs()
    loadRecentChanges()
    setupRealTimeSubscriptions()
  }, [])

  const loadURLs = async () => {
    const { data, error } = await supabase
      .from('watched_urls')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setUrls(data)
    setLoading(false)
  }

  const loadRecentChanges = async () => {
    const { data } = await supabase
      .from('content_changes')
      .select(`
        *,
        watched_urls(url, title)
      `)
      .gte('relevance_score', 6)
      .order('detected_at', { ascending: false })
      .limit(10)

    if (data) setRecentChanges(data)
  }

  const setupRealTimeSubscriptions = () => {
    const changesSubscription = supabase
      .channel('url_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'content_changes' },
        (payload) => {
          if (payload.new.relevance_score >= 6) {
            loadRecentChanges()
          }
        }
      )
      .subscribe()

    return () => {
      changesSubscription.unsubscribe()
    }
  }

  return (
    <div className="url-watcher-dashboard">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">URL Watcher</h1>
        <button
          onClick={() => setShowAddUrl(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          URL hinzufügen
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard 
          title="Überwachte URLs" 
          value={urls.length} 
          icon={<Globe className="text-blue-600" />} 
        />
        <StatsCard 
          title="Aktive URLs" 
          value={urls.filter(u => u.is_active).length} 
          icon={<CheckCircle className="text-green-600" />} 
        />
        <StatsCard 
          title="Änderungen heute" 
          value={recentChanges.filter(c => 
            new Date(c.detected_at).toDateString() === new Date().toDateString()
          ).length} 
          icon={<AlertCircle className="text-orange-600" />} 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <URLList urls={urls} onUpdate={loadURLs} />
        <RecentChanges changes={recentChanges} />
      </div>

      {showAddUrl && (
        <AddURLModal 
          onClose={() => setShowAddUrl(false)}
          onSuccess={() => {
            setShowAddUrl(false)
            loadURLs()
          }}
        />
      )}
    </div>
  )
}

const StatsCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      {icon}
    </div>
  </div>
)

const URLList: React.FC<{ urls: any[]; onUpdate: () => void }> = ({ urls, onUpdate }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900">Überwachte URLs</h2>
    </div>
    <div className="divide-y divide-gray-200">
      {urls.map(url => (
        <URLItem key={url.id} url={url} onUpdate={onUpdate} />
      ))}
    </div>
  </div>
)

const URLItem: React.FC<{ url: any; onUpdate: () => void }> = ({ url, onUpdate }) => {
  const statusColor = url.is_active ? 'text-green-600' : 'text-gray-400'
  const lastChecked = url.last_checked ? new Date(url.last_checked).toLocaleString('de-DE') : 'Nie'

  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${url.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
            <h3 className="font-medium text-gray-900 truncate">{url.title || url.url}</h3>
          </div>
          <p className="text-sm text-gray-600 truncate mt-1">{url.url}</p>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>Zuletzt geprüft: {lastChecked}</span>
            {url.tags && (
              <div className="flex gap-1">
                {url.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="bg-gray-100 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <URLActions url={url} onUpdate={onUpdate} />
      </div>
    </div>
  )
}

export default URLDashboard
```

### Change-Feedback Interface

```typescript
// src/components/URLWatcher/ChangeFeedback.tsx
import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react'

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL!, process.env.REACT_APP_SUPABASE_ANON_KEY!)

interface ChangeFeedbackProps {
  change: any
  onFeedbackSubmitted: () => void
}

const ChangeFeedback: React.FC<ChangeFeedbackProps> = ({ change, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState<number>(3)
  const [feedbackText, setFeedbackText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submitFeedback = async () => {
    setSubmitting(true)
    
    try {
      await fetch('/.netlify/functions/learning-optimizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'relevance_feedback',
          data: {
            userId: 'current-user-id', // Von Auth Context
            changeId: change.id,
            rating,
            feedbackText,
            corrections: {} // Zusätzliche strukturierte Korrekturen
          }
        })
      })

      onFeedbackSubmitted()
    } catch (error) {
      console.error('Failed to submit feedback:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg mt-4">
      <h4 className="font-medium text-gray-900 mb-3">War diese Änderung relevant?</h4>
      
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3, 4, 5].map(num => (
          <button
            key={num}
            onClick={() => setRating(num)}
            className={`flex items-center justify-center w-8 h-8 rounded ${
              rating === num 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-300 text-gray-400 hover:text-gray-600'
            }`}
          >
            <Star size={16} fill={rating >= num ? 'currentColor' : 'none'} />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating === 1 ? 'Irrelevant' : rating === 5 ? 'Sehr relevant' : 'Mittelmäßig'}
        </span>
      </div>

      <textarea
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
        placeholder="Zusätzliches Feedback (optional)..."
        className="w-full p-2 border border-gray-300 rounded text-sm resize-none"
        rows={2}
      />

      <div className="flex gap-2 mt-3">
        <button
          onClick={submitFeedback}
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Wird gesendet...' : 'Feedback senden'}
        </button>
      </div>
    </div>
  )
}

export default ChangeFeedback
```

## Deployment & Konfiguration

### Netlify Function Cron-Jobs

```yaml
# netlify.toml (Ergänzung)
[[plugins]]
  package = "@netlify/plugin-scheduled-functions"

[build.environment]
  # Neue Umgebungsvariablen für URL Watcher
  OPENAI_API_KEY = "your-openai-api-key"
  VAPID_PUBLIC_KEY = "your-vapid-public-key"
  VAPID_PRIVATE_KEY = "your-vapid-private-key"
  SMTP_HOST = "your-smtp-host"
  SMTP_PORT = "587"
  SMTP_USER = "your-smtp-user"
  SMTP_PASS = "your-smtp-password"
  FROM_EMAIL = "noreply@your-domain.com"
  NOTIFICATION_EMAIL = "your-notification-email@domain.com"
  CONTACT_EMAIL = "contact@your-domain.com"
  APP_URL = "https://your-app.netlify.app"

# Scheduled Functions
[[build.functions]]
  directory = "netlify/functions"

# Agent 1: Observer - alle 60 Minuten
[[function."url-observer-trigger"]]
  schedule = "0 * * * *"

# Agent 2: Change Analyzer - alle 10 Minuten  
[[function."change-analyzer"]]
  schedule = "*/10 * * * *"

# Agent 3: Notifier - alle 5 Minuten
[[function."notification-sender"]]
  schedule = "*/5 * * * *"

# Agent 4: Optimizer - täglich um 03:00
[[function."learning-optimizer"]]
  schedule = "0 3 * * *"
```

### Supabase Edge Functions

```bash
# Deployment-Befehle
supabase functions deploy url-observer --project-ref your-project-ref

# Cron-Job für URL Observer (Edge Function)
supabase functions schedule url-observer --cron "0 * * * *" --project-ref your-project-ref
```

### Push Notification Setup

```typescript
// src/utils/pushNotifications.ts
export const initializePushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported')
    return
  }

  const registration = await navigator.serviceWorker.register('/sw.js')
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
  })

  // Subscription in Datenbank speichern
  await supabase
    .from('push_subscriptions')
    .insert({
      user_id: 'current-user-id',
      subscription_data: JSON.stringify(subscription),
      is_active: true
    })
}
```

```javascript
// public/sw.js - Service Worker
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {}
  
  const options = {
    body: data.body,
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    data: data.data,
    actions: data.actions,
    requireInteraction: true
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    )
  }
})
```

## Token-Effizienz & Kostenoptimierung

### Geschätzte Kosten (monatlich)

**GPT-4o-mini Verwendung:**
- 50 URLs × 30 Tage × 0.5 Änderungen/Tag = 750 Analysen/Monat
- Pro Analyse: ~400 Tokens Input + 150 Tokens Output = 550 Tokens
- Total: 750 × 550 = 412.500 Tokens/Monat
- Kosten: $0.15/1M Input + $0.60/1M Output ≈ **$0.15/Monat**

**Claude Haiku (Backup):**
- ~10% der Analysen als Fallback = 75 Analysen
- Kosten: ~**$0.05/Monat**

**Supabase Edge Functions:**
- Monatliche Nutzung: ~2.000 Invocations
- Kosten: **Kostenlos** (unter Free Tier Limit)

**Gesamtkosten: ~$0.20/Monat** (deutlich unter Budget!)

### Performance-Optimierungen

**Batch Processing:**
```typescript
// Mehrere Änderungen in einem LLM-Request
const batchAnalyzeChanges = async (changes: any[]) => {
  const batchPrompt = changes.map((change, index) => 
    `ÄNDERUNG ${index + 1}:\nURL: ${change.url}\n${change.diff_text}\n---`
  ).join('\n')

  // Einzelner LLM-Call für multiple Änderungen
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: batchPrompt }],
    max_tokens: 1000
  })

  // Parse multiple responses
  return parseMultipleAnalyses(response.choices[0].message.content)
}
```

**Smart Caching:**
```typescript
// Content-Hash-basiertes Caching
const analyzeWithCache = async (change: any) => {
  const cacheKey = `analysis_${change.content_hash}_${change.url_id}`
  
  const cached = await redis.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  const analysis = await performAnalysis(change)
  await redis.setex(cacheKey, 3600, JSON.stringify(analysis)) // 1h Cache
  
  return analysis
}
```

## Entwicklungsreihenfolge

### Phase 1: Foundation & Agent 1 (Woche 1-2)
1. **Datenbank-Schema Erweiterung**
   - Neue Tabellen in Supabase erstellen
   - Migration von bestehendem Schema

2. **Agent 1 (Observer) Implementierung**
   - Supabase Edge Function mit Playwright
   - Basic Web-Scraping und Content-Extraktion
   - Cron-Job Setup

3. **Frontend-Integration**
   - URL-Management Interface
   - Dashboard-Erweiterung
   - Real-time Updates

### Phase 2: Agent 2 & Basic Intelligence (Woche 3)
1. **Agent 2 (Änderungs-Checker)**
   - LLM-Integration (GPT-4o-mini)
   - Relevanz-Bewertung
   - Diff-Generierung

2. **Testing & Debugging**
   - End-to-End-Tests
   - Performance-Optimierung
   - Error-Handling

### Phase 3: Agent 3 & Notifications (Woche 4)
1. **Agent 3 (Notifier)**
   - E-Mail-System mit HTML-Templates
   - Push-Notification-Setup
   - Multi-Channel-Benachrichtigungen

2. **User Experience**
   - Benachrichtigungseinstellungen
   - Snooze-Funktionalität
   - Mobile Responsiveness

### Phase 4: Agent 4 & Learning (Woche 5)
1. **Agent 4 (Optimizer)**
   - Feedback-Collection
   - Prompt-Optimierung
   - Performance-Monitoring

2. **Advanced Features**
   - A/B-Testing für Prompts
   - Automatische Verbesserungen
   - Analytics Dashboard

### Phase 5: Integration & Polish (Woche 6)
1. **Cross-Tool Integration**
   - Gemeinsame Komponenten mit E-Mail-Tool
   - Unified Dashboard
   - Shared Learning

2. **Production Readiness**
   - Monitoring & Alerting
   - Documentation
   - User Onboarding

## Monitoring & Analytics

### System Health Dashboard
```typescript
// src/components/SystemHealth.tsx
const SystemHealth: React.FC = () => {
  const [metrics, setMetrics] = useState([])

  useEffect(() => {
    loadSystemMetrics()
  }, [])

  const loadSystemMetrics = async () => {
    const { data } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false })

    setMetrics(data || [])
  }

  const avgUserSatisfaction = metrics
    .filter(m => m.metric_type === 'user_satisfaction')
    .reduce((sum, m, _, arr) => sum + m.metric_value / arr.length, 0)

  const relevanceAccuracy = metrics
    .filter(m => m.metric_type === 'relevance_accuracy')
    .slice(0, 1)[0]?.metric_value || 0

  return (
    <div className="system-health">
      <h2>System Health</h2>
      <div className="metrics-grid">
        <MetricCard 
          title="User Satisfaction" 
          value={`${avgUserSatisfaction.toFixed(1)}/5`}
          trend={calculateTrend(metrics, 'user_satisfaction')}
        />
        <MetricCard 
          title="Relevance Accuracy" 
          value={`${(relevanceAccuracy * 100).toFixed(1)}%`}
          trend={calculateTrend(metrics, 'relevance_accuracy')}
        />
      </div>
    </div>
  )
}
```

### Error Tracking
```typescript
// Agent Error Monitoring
const trackAgentError = async (agentName: string, error: Error, context: any) => {
  await supabase
    .from('system_metrics')
    .insert({
      metric_type: 'error_count',
      metric_value: 1,
      metric_unit: 'count',
      agent_name: agentName,
      recorded_at: new Date().toISOString()
    })

  // Optional: Slack/E-Mail Alerting bei kritischen Fehlern
  if (error.message.includes('CRITICAL')) {
    await sendErrorAlert(agentName, error, context)
  }
}
```

---

# Erweiterte Implementierungsdetails

## 🔧 Detaillierte Implementierung

### Development Environment Setup

#### Lokale Entwicklungsumgebung

```bash
# 1. Repository Setup
git clone <your-existing-email-tool-repo>
cd email-tool-project

# 2. URL Watcher Erweiterung
mkdir -p src/components/URLWatcher
mkdir -p netlify/functions/url-watcher
mkdir -p supabase/functions/url-watcher

# 3. Dependencies Installation
npm install playwright-chromium
npm install openai @anthropic-ai/sdk
npm install nodemailer web-push
npm install diff2html simple-diff
npm install cheerio jsdom
npm install compression

# 4. Environment Variables (.env.local)
cat > .env.local << EOF
# Existing variables...
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-claude-key
VAPID_PUBLIC_KEY=your-vapid-public
VAPID_PRIVATE_KEY=your-vapid-private
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-pass
NOTIFICATION_EMAIL=your-email@domain.com
PLAYWRIGHT_BROWSERS_PATH=/tmp/playwright
EOF

# 5. Playwright Setup für lokale Entwicklung
npx playwright install chromium
npx playwright install-deps

# 6. Supabase Migration
supabase migration new url_watcher_schema
```

#### Supabase Migration Script

```sql
-- supabase/migrations/20241219000001_url_watcher_schema.sql

-- Extension für bessere Text-Suche
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- URL-Konfiguration mit erweiterten Features
CREATE TABLE watched_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL CHECK (url ~ '^https?://'),
  title VARCHAR(255),
  description TEXT,
  monitoring_instructions TEXT NOT NULL,
  monitoring_interval INTEGER DEFAULT 60 CHECK (monitoring_interval >= 30),
  is_active BOOLEAN DEFAULT TRUE,
  is_snoozed BOOLEAN DEFAULT FALSE,
  snooze_until TIMESTAMP WITH TIME ZONE,
  last_checked TIMESTAMP WITH TIME ZONE,
  last_changed TIMESTAMP WITH TIME ZONE,
  last_success TIMESTAMP WITH TIME ZONE,
  check_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  consecutive_errors INTEGER DEFAULT 0,
  last_error TEXT,
  last_status_code INTEGER,
  tags TEXT[] DEFAULT '{}',
  css_selectors JSONB DEFAULT '[]'::jsonb, -- Spezifische Bereiche
  ignore_patterns TEXT[] DEFAULT '{}', -- Regex-Patterns zum Ignorieren
  notification_settings JSONB DEFAULT '{
    "email": true, 
    "push": true, 
    "frequency": "immediate",
    "min_relevance": 6,
    "quiet_hours": {"start": "22:00", "end": "08:00"}
  }'::jsonb,
  content_settings JSONB DEFAULT '{
    "ignore_timestamps": true,
    "ignore_ads": true,
    "ignore_navigation": true,
    "min_change_threshold": 0.05
  }'::jsonb,
  performance_stats JSONB DEFAULT '{
    "avg_response_time": 0,
    "success_rate": 0,
    "last_content_size": 0
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_url UNIQUE(user_id, url)
);

-- Content-Snapshots mit Kompression
CREATE TABLE url_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES watched_urls(id) ON DELETE CASCADE,
  content_hash VARCHAR(64) NOT NULL,
  content_hash_normalized VARCHAR(64), -- Nach Bereinigung
  raw_content TEXT, -- Komprimiert via pg_compress
  extracted_text TEXT NOT NULL,
  text_normalized TEXT, -- Bereinigt für Vergleiche
  metadata JSONB DEFAULT '{}'::jsonb,
  extraction_stats JSONB DEFAULT '{}'::jsonb,
  content_size INTEGER,
  compressed_size INTEGER,
  fetch_duration INTEGER,
  fetch_status INTEGER,
  fetch_headers JSONB,
  screenshot_url TEXT, -- Optional: Screenshot für visuelle Diffs
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT idx_snapshots_hash UNIQUE(url_id, content_hash)
);

-- Erkannte Änderungen mit erweiterten Metadaten
CREATE TABLE content_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES watched_urls(id) ON DELETE CASCADE,
  previous_snapshot_id UUID REFERENCES url_snapshots(id),
  current_snapshot_id UUID REFERENCES url_snapshots(id),
  change_type VARCHAR(50) NOT NULL DEFAULT 'content',
  change_magnitude DECIMAL(5,4), -- 0.0000-1.0000, Prozent der Änderung
  diff_text TEXT,
  diff_html TEXT,
  diff_stats JSONB DEFAULT '{}'::jsonb, -- Statistiken über die Änderung
  change_summary TEXT,
  change_keywords TEXT[], -- Extrahierte Schlüsselwörter
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10),
  relevance_category VARCHAR(50) CHECK (relevance_category IN ('high', 'medium', 'low', 'irrelevant')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  llm_model VARCHAR(50), -- Welches LLM verwendet wurde
  llm_reasoning TEXT,
  llm_prompt_version VARCHAR(50),
  llm_tokens_used INTEGER,
  llm_cost_usd DECIMAL(10,6),
  processing_duration INTEGER, -- Millisekunden
  is_user_relevant BOOLEAN,
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_channels TEXT[] DEFAULT '{}',
  analyzed_at TIMESTAMP WITH TIME ZONE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_magnitude CHECK (change_magnitude >= 0)
);

-- Benachrichtigungen mit Delivery-Tracking
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  change_id UUID REFERENCES content_changes(id) ON DELETE CASCADE,
  notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('email', 'push', 'in_app', 'webhook')),
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  template_used VARCHAR(50),
  content_preview TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  delivery_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Feedback für Advanced Learning
CREATE TABLE change_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  change_id UUID REFERENCES content_changes(id) ON DELETE CASCADE,
  feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('relevance', 'quality', 'accuracy', 'false_positive', 'false_negative')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  correction_data JSONB DEFAULT '{}'::jsonb,
  feedback_context JSONB DEFAULT '{}'::jsonb, -- Browser, Zeit, etc.
  is_training_data BOOLEAN DEFAULT TRUE,
  processed_for_learning BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LLM-Prompt-Evolution mit A/B-Testing
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(100) UNIQUE NOT NULL,
  template_type VARCHAR(50) NOT NULL CHECK (template_type IN ('relevance_analysis', 'change_summary', 'categorization')),
  prompt_content TEXT NOT NULL,
  version VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  is_experimental BOOLEAN DEFAULT FALSE,
  performance_score DECIMAL(3,2),
  usage_count INTEGER DEFAULT 0,
  success_rate DECIMAL(3,2),
  avg_confidence DECIMAL(3,2),
  avg_user_rating DECIMAL(3,2),
  cost_per_analysis DECIMAL(10,6),
  tokens_per_analysis INTEGER,
  experimental_group VARCHAR(20), -- A/B Testing
  created_by VARCHAR(50) DEFAULT 'system',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retired_at TIMESTAMP WITH TIME ZONE
);

-- URL-Tags für bessere Organisation
CREATE TABLE url_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name VARCHAR(50) NOT NULL,
  tag_color VARCHAR(7) DEFAULT '#3B82F6',
  tag_icon VARCHAR(20),
  description TEXT,
  auto_apply_rules JSONB DEFAULT '[]'::jsonb, -- Automatische Tag-Zuweisung
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_tag UNIQUE(user_id, tag_name)
);

-- Push-Subscription Management
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_data JSONB NOT NULL,
  endpoint TEXT NOT NULL,
  browser_info JSONB DEFAULT '{}'::jsonb,
  device_info JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_endpoint UNIQUE(endpoint)
);

-- System-Metriken für Monitoring
CREATE TABLE system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  metric_name VARCHAR(100),
  metric_value DECIMAL(15,6) NOT NULL,
  metric_unit VARCHAR(20),
  dimensions JSONB DEFAULT '{}'::jsonb, -- Zusätzliche Dimensionen
  agent_name VARCHAR(50),
  url_id UUID REFERENCES watched_urls(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_metric_value CHECK (metric_value >= 0)
);

-- Web-Scraping Logs für Debugging
CREATE TABLE scraping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES watched_urls(id) ON DELETE CASCADE,
  scraping_session_id UUID DEFAULT gen_random_uuid(),
  log_level VARCHAR(10) CHECK (log_level IN ('DEBUG', 'INFO', 'WARN', 'ERROR')),
  message TEXT NOT NULL,
  error_details JSONB,
  performance_data JSONB,
  browser_logs JSONB,
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance-Indizes
CREATE INDEX idx_watched_urls_active_check ON watched_urls(is_active, last_checked) WHERE is_active = true;
CREATE INDEX idx_watched_urls_user ON watched_urls(user_id);
CREATE INDEX idx_watched_urls_tags ON watched_urls USING GIN(tags);

CREATE INDEX idx_snapshots_url_captured ON url_snapshots(url_id, captured_at DESC);
CREATE INDEX idx_snapshots_hash_lookup ON url_snapshots(content_hash);
CREATE INDEX idx_snapshots_size ON url_snapshots(content_size);

CREATE INDEX idx_changes_url_detected ON content_changes(url_id, detected_at DESC);
CREATE INDEX idx_changes_relevance_detected ON content_changes(relevance_score DESC, detected_at DESC);
CREATE INDEX idx_changes_unanalyzed ON content_changes(analyzed_at) WHERE analyzed_at IS NULL;
CREATE INDEX idx_changes_user_relevant ON content_changes(is_user_relevant, detected_at DESC) WHERE is_user_relevant IS NOT NULL;

CREATE INDEX idx_notifications_user_status ON notifications(user_id, status, created_at DESC);
CREATE INDEX idx_notifications_pending ON notifications(status, created_at) WHERE status = 'pending';

CREATE INDEX idx_feedback_change ON change_feedback(change_id);
CREATE INDEX idx_feedback_unprocessed ON change_feedback(processed_for_learning) WHERE processed_for_learning = false;

CREATE INDEX idx_metrics_type_recorded ON system_metrics(metric_type, recorded_at DESC);
CREATE INDEX idx_metrics_agent_recorded ON system_metrics(agent_name, recorded_at DESC);

CREATE INDEX idx_scraping_logs_url_session ON scraping_logs(url_id, scraping_session_id);
CREATE INDEX idx_scraping_logs_level_created ON scraping_logs(log_level, created_at DESC);

-- Text-Suche für Content
CREATE INDEX idx_snapshots_text_search ON url_snapshots USING GIN(to_tsvector('german', extracted_text));
CREATE INDEX idx_changes_keywords ON content_changes USING GIN(change_keywords);

-- Trigger für automatische Updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_watched_urls_updated_at 
  BEFORE UPDATE ON watched_urls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger für Tag-Usage-Count
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE url_tags 
    SET usage_count = (
      SELECT COUNT(*) 
      FROM watched_urls 
      WHERE user_id = url_tags.user_id 
      AND tags @> ARRAY[url_tags.tag_name]
    )
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$ language 'plpgsql';

CREATE TRIGGER trigger_tag_usage_count
  AFTER INSERT OR UPDATE ON watched_urls
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- RLS (Row Level Security) Policies
ALTER TABLE watched_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE url_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies für User-Isolation
CREATE POLICY "Users can only access their own URLs" ON watched_urls
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own snapshots" ON url_snapshots
  FOR ALL USING (EXISTS (
    SELECT 1 FROM watched_urls 
    WHERE watched_urls.id = url_snapshots.url_id 
    AND watched_urls.user_id = auth.uid()
  ));

CREATE POLICY "Users can only access their own changes" ON content_changes
  FOR ALL USING (EXISTS (
    SELECT 1 FROM watched_urls 
    WHERE watched_urls.id = content_changes.url_id 
    AND watched_urls.user_id = auth.uid()
  ));

CREATE POLICY "Users can only access their own notifications" ON notifications
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own feedback" ON change_feedback
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own tags" ON url_tags
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own push subscriptions" ON push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Funktionen für komplexe Operationen
CREATE OR REPLACE FUNCTION get_url_health_score(url_uuid UUID)
RETURNS DECIMAL(3,2) AS $
DECLARE
  success_rate DECIMAL(3,2);
  error_rate DECIMAL(3,2);
  response_time_score DECIMAL(3,2);
  health_score DECIMAL(3,2);
BEGIN
  SELECT 
    CASE 
      WHEN check_count = 0 THEN 0
      ELSE ROUND((check_count - error_count)::DECIMAL / check_count, 2)
    END,
    CASE 
      WHEN check_count = 0 THEN 0
      ELSE ROUND(error_count::DECIMAL / check_count, 2)
    END
  INTO success_rate, error_rate
  FROM watched_urls
  WHERE id = url_uuid;
  
  -- Berechne Health Score (0.0 - 1.0)
  health_score := GREATEST(0, success_rate - (error_rate * 0.5));
  
  RETURN health_score;
END;
$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER AS $
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Lösche Snapshots älter als 90 Tage
  DELETE FROM url_snapshots 
  WHERE captured_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Lösche Logs älter als 30 Tage
  DELETE FROM scraping_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Lösche alte Metriken (älter als 180 Tage)
  DELETE FROM system_metrics 
  WHERE recorded_at < NOW() - INTERVAL '180 days';
  
  RETURN deleted_count;
END;
$ LANGUAGE plpgsql;

-- Stored Procedure für Batch-URL-Health-Check
CREATE OR REPLACE FUNCTION batch_health_check()
RETURNS TABLE(url_id UUID, url TEXT, health_score DECIMAL, status TEXT) AS $
BEGIN
  RETURN QUERY
  SELECT 
    wu.id,
    wu.url,
    get_url_health_score(wu.id),
    CASE 
      WHEN wu.consecutive_errors > 5 THEN 'critical'
      WHEN wu.consecutive_errors > 2 THEN 'warning'
      WHEN wu.last_checked < NOW() - INTERVAL '2 hours' THEN 'stale'
      ELSE 'healthy'
    END as status
  FROM watched_urls wu
  WHERE wu.is_active = true;
END;
$ LANGUAGE plpgsql;
```

### Advanced Agent Implementations

#### Agent 1: Observer mit Advanced Features

```typescript
// supabase/functions/url-observer-advanced/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { chromium } from 'https://esm.sh/playwright-chromium@1.40.0'
import { createHash } from 'https://deno.land/std@0.168.0/hash/mod.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface WatchedURL {
  id: string
  url: string
  title: string
  monitoring_interval: number
  last_checked: string | null
  css_selectors: any[]
  ignore_patterns: string[]
  content_settings: any
  notification_settings: any
}

serve(async (req) => {
  const scraping_session_id = crypto.randomUUID()
  
  try {
    await logScraping(scraping_session_id, null, 'INFO', 'Observer Agent started')

    const urlsToCheck = await getURLsToCheck()
    await logScraping(scraping_session_id, null, 'INFO', `Found ${urlsToCheck.length} URLs to check`)

    const browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    })

    const results = []
    const concurrency = 3 // Reduziert für Stabilität

    try {
      for (let i = 0; i < urlsToCheck.length; i += concurrency) {
        const chunk = urlsToCheck.slice(i, i + concurrency)
        
        const chunkResults = await Promise.allSettled(
          chunk.map(url => processURLAdvanced(browser, url, scraping_session_id))
        )
        
        chunkResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            results.push(result.value)
          } else {
            const url = chunk[index]
            logScraping(scraping_session_id, url.id, 'ERROR', `Failed to process ${url.url}: ${result.reason}`)
            results.push({
              url_id: url.id,
              url: url.url,
              success: false,
              error: result.reason.message
            })
          }
        })

        // Adaptive Rate-Limiting basierend auf Server-Response
        const avgResponseTime = results
          .filter(r => r.success)
          .reduce((sum, r, _, arr) => sum + (r.fetch_duration || 0) / arr.length, 0)
        
        const pauseDuration = avgResponseTime > 5000 ? 5000 : 2000
        if (i + concurrency < urlsToCheck.length) {
          await new Promise(resolve => setTimeout(resolve, pauseDuration))
        }
      }
    } finally {
      await browser.close()
    }

    // Performance-Metriken speichern
    await recordMetrics(results, scraping_session_id)

    // Cleanup alte Daten
    await performCleanup()

    await logScraping(scraping_session_id, null, 'INFO', 'Observer Agent completed successfully')

    return new Response(JSON.stringify({
      success: true,
      session_id: scraping_session_id,
      processed: results.length,
      changes_detected: results.filter(r => r.has_changes).length,
      errors: results.filter(r => !r.success).length,
      avg_response_time: results.reduce((sum, r, _, arr) => sum + (r.fetch_duration || 0) / arr.length, 0),
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    await logScraping(scraping_session_id, null, 'ERROR', `Observer Agent failed: ${error.message}`, {
      stack: error.stack,
      name: error.name
    })
    
    return new Response(JSON.stringify({
      success: false,
      session_id: scraping_session_id,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

async function processURLAdvanced(browser: any, urlConfig: WatchedURL, sessionId: string) {
  const startTime = Date.now()
  
  await logScraping(sessionId, urlConfig.id, 'INFO', `Processing: ${urlConfig.url}`)

  // Update last_checked with better error handling
  try {
    await supabase
      .from('watched_urls')
      .update({ 
        last_checked: new Date().toISOString(),
        check_count: supabase.rpc('increment', { table_name: 'watched_urls', column_name: 'check_count', row_id: urlConfig.id })
      })
      .eq('id', urlConfig.id)
  } catch (error) {
    await logScraping(sessionId, urlConfig.id, 'WARN', `Failed to update last_checked: ${error.message}`)
  }

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; URLWatcher/1.0; +https://your-domain.com/bot)',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  })

  const page = await context.newPage()

  try {
    // Advanced timeout and error handling
    page.setDefaultTimeout(45000)
    
    // Listen to console logs for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logScraping(sessionId, urlConfig.id, 'DEBUG', `Browser console error: ${msg.text()}`)
      }
    })

    // Navigation with retry logic
    let response
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await page.goto(urlConfig.url, {
          waitUntil: 'domcontentloaded',
          timeout: 30000
        })
        break
      } catch (error) {
        if (attempt === 3) throw error
        await logScraping(sessionId, urlConfig.id, 'WARN', `Attempt ${attempt} failed, retrying: ${error.message}`)
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt))
      }
    }

    if (!response || !response.ok()) {
      throw new Error(`HTTP ${response?.status()}: ${response?.statusText()}`)
    }

    // Wait for dynamic content with intelligent timing
    const contentSettings = urlConfig.content_settings || {}
    const waitTime = contentSettings.dynamic_wait || 3000
    await page.waitForTimeout(Math.min(waitTime, 10000))

    // Advanced content extraction
    const content = await extractAdvancedContent(page, urlConfig)
    const normalizedContent = normalizeContent(content.extractedText, urlConfig)
    const contentHash = generateHash(content.extractedText)
    const normalizedHash = generateHash(normalizedContent)

    await context.close()

    // Check for changes with normalized comparison
    const { data: lastSnapshot } = await supabase
      .from('url_snapshots')
      .select('content_hash, content_hash_normalized, id, extracted_text')
      .eq('url_id', urlConfig.id)
      .order('captured_at', { ascending: false })
      .limit(1)
      .single()

    const hasChanges = !lastSnapshot || 
      (lastSnapshot.content_hash !== contentHash && 
       lastSnapshot.content_hash_normalized !== normalizedHash)

    // Calculate change magnitude if changes detected
    let changeMagnitude = 0
    if (hasChanges && lastSnapshot?.extracted_text) {
      changeMagnitude = calculateChangeMagnitude(lastSnapshot.extracted_text, content.extractedText)
    }

    // Save snapshot with advanced metadata
    const snapshotData = {
      url_id: urlConfig.id,
      content_hash: contentHash,
      content_hash_normalized: normalizedHash,
      raw_content: compressContent(content.rawContent),
      extracted_text: content.extractedText,
      text_normalized: normalizedContent,
      metadata: {
        ...content.metadata,
        processing_stats: content.processingStats
      },
      extraction_stats: content.extractionStats,
      content_size: content.extractedText.length,
      compressed_size: compressContent(content.rawContent).length,
      fetch_duration: Date.now() - startTime,
      fetch_status: response.status(),
      fetch_headers: Object.fromEntries(response.headers())
    }

    const { data: newSnapshot, error: snapshotError } = await supabase
      .from('url_snapshots')
      .insert(snapshotData)
      .select()
      .single()

    if (snapshotError) {
      throw snapshotError
    }

    // Create detailed change record if changes detected
    if (hasChanges && lastSnapshot && changeMagnitude > (contentSettings.min_change_threshold || 0.01)) {
      await createAdvancedChangeRecord(
        urlConfig.id, 
        lastSnapshot.id, 
        newSnapshot.id, 
        content, 
        lastSnapshot.extracted_text,
        changeMagnitude,
        sessionId
      )
    }

    // Update URL performance stats
    await updateURLPerformanceStats(urlConfig.id, {
      response_time: Date.now() - startTime,
      success: true,
      content_size: content.extractedText.length
    })

    await logScraping(sessionId, urlConfig.id, 'INFO', 
      `✅ ${urlConfig.url}: ${hasChanges ? 'CHANGED' : 'unchanged'} (${(Date.now() - startTime)}ms)`)

    return {
      url_id: urlConfig.id,
      url: urlConfig.url,
      success: true,
      has_changes: hasChanges,
      change_magnitude: changeMagnitude,
      content_size: content.extractedText.length,
      fetch_duration: Date.now() - startTime,
      status_code: response.status()
    }

  } catch (error) {
    await context.close()
    
    await logScraping(sessionId, urlConfig.id, 'ERROR', `Error processing ${urlConfig.url}: ${error.message}`, {
      stack: error.stack,
      url: urlConfig.url
    })

    // Update error count with exponential backoff
    await supabase
      .from('watched_urls')
      .update({ 
        error_count: supabase.rpc('increment', { table_name: 'watched_urls', column_name: 'error_count', row_id: urlConfig.id }),
        consecutive_errors: supabase.rpc('increment', { table_name: 'watched_urls', column_name: 'consecutive_errors', row_id: urlConfig.id }),
        last_error: error.message,
        last_status_code: error.status || 0
      })
      .eq('id', urlConfig.id)

    await updateURLPerformanceStats(urlConfig.id, {
      response_time: Date.now() - startTime,
      success: false,
      error_message: error.message
    })

    throw error
  }
}

async function extractAdvancedContent(page: any, urlConfig: WatchedURL) {
  const startTime = Date.now()
  
  const content = await page.evaluate((config) => {
    const { css_selectors = [], ignore_patterns = [], content_settings = {} } = config
    
    // Remove unwanted elements based on configuration
    const elementsToRemove = [
      'script', 'style', 'noscript',
      ...(content_settings.ignore_ads ? [
        '[class*="ad"]', '[class*="banner"]', '[id*="ad"]', 
        '.advertisement', '.sponsored', '[class*="promo"]'
      ] : []),
      ...(content_settings.ignore_navigation ? [
        'nav', 'header', 'footer', '.navigation', '.menu'
      ] : []),
      ...(content_settings.ignore_timestamps ? [
        '[class*="timestamp"]', '[class*="date"]', '.time', '.updated'
      ] : [])
    ]
    
    elementsToRemove.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => el.remove())
      } catch (e) {
        console.warn(`Failed to remove elements with selector ${selector}:`, e)
      }
    })

    // Extract content from specific selectors if configured
    let contentElements = []
    if (css_selectors.length > 0) {
      css_selectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            contentElements.push(el)
          })
        } catch (e) {
          console.warn(`Invalid CSS selector ${selector}:`, e)
        }
      })
    } else {
      // Default: extract from main content areas
      const mainSelectors = [
        'main', '[role="main"]', '.main-content', '#main-content',
        'article', '.article', '.content', '.post-content',
        '.entry-content', '.page-content'
      ]
      
      for (const selector of mainSelectors) {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          elements.forEach(el => contentElements.push(el))
          break // Use first matching selector
        }
      }
      
      // Fallback to body if no main content found
      if (contentElements.length === 0) {
        contentElements.push(document.body)
      }
    }

    // Advanced text extraction with structure preservation
    const extractedParts = []
    const processingStats = {
      elements_processed: 0,
      text_nodes_found: 0,
      ignored_elements: 0
    }

    contentElements.forEach(element => {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            processingStats.text_nodes_found++
            
            const parent = node.parentElement
            if (!parent) return NodeFilter.FILTER_REJECT
            
            const style = window.getComputedStyle(parent)
            if (style.display === 'none' || style.visibility === 'hidden') {
              processingStats.ignored_elements++
              return NodeFilter.FILTER_REJECT
            }
            
            const text = node.textContent?.trim()
            if (!text || text.length < 3) {
              return NodeFilter.FILTER_REJECT
            }
            
            // Apply ignore patterns
            for (const pattern of ignore_patterns) {
              try {
                if (new RegExp(pattern, 'i').test(text)) {
                  processingStats.ignored_elements++
                  return NodeFilter.FILTER_REJECT
                }
              } catch (e) {
                console.warn(`Invalid ignore pattern ${pattern}:`, e)
              }
            }
            
            return NodeFilter.FILTER_ACCEPT
          }
        }
      )

      let node
      while (node = walker.nextNode()) {
        const text = node.textContent.trim()
        if (text.length > 0) {
          extractedParts.push({
            text: text,
            element: node.parentElement.tagName.toLowerCase(),
            classes: Array.from(node.parentElement.classList || []),
            id: node.parentElement.id || null
          })
          processingStats.elements_processed++
        }
      }
    })

    // Extract structured metadata
    const metadata = {
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
      keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content'),
      author: document.querySelector('meta[name="author"]')?.getAttribute('content'),
      lastModified: document.lastModified,
      url: window.location.href,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
      og_title: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      og_description: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      lang: document.documentElement.lang || 'unknown',
      viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
      charset: document.characterSet,
      headings: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
        level: h.tagName.toLowerCase(),
        text: h.textContent.trim()
      })).filter(h => h.text.length > 0),
      images: Array.from(document.querySelectorAll('img')).slice(0, 10).map(img => ({
        src: img.src,
        alt: img.alt,
        title: img.title
      })),
      links: Array.from(document.querySelectorAll('a[href]')).slice(0, 20).map(a => ({
        href: a.href,
        text: a.textContent.trim(),
        title: a.title
      })).filter(l => l.text.length > 0)
    }

    return {
      rawContent: document.documentElement.outerHTML,
      extractedText: extractedParts.map(p => p.text).join('\n'),
      structuredText: extractedParts,
      metadata: metadata,
      processingStats: processingStats,
      extractionStats: {
        total_elements: extractedParts.length,
        total_characters: extractedParts.reduce((sum, p) => sum + p.text.length, 0),
        avg_element_length: extractedParts.length > 0 ? 
          extractedParts.reduce((sum, p) => sum + p.text.length, 0) / extractedParts.length : 0
      }
    }
  }, urlConfig)

  content.extractionStats.processing_time_ms = Date.now() - startTime
  return content
}

function normalizeContent(text: string, urlConfig: WatchedURL): string {
  const settings = urlConfig.content_settings || {}
  let normalized = text

  // Standard normalization
  normalized = normalized
    .replace(/\s+/g, ' ') // Multiple whitespace to single space
    .replace(/[\r\n]+/g, '\n') // Multiple newlines to single
    .trim()

  // Remove timestamps if configured
  if (settings.ignore_timestamps) {
    // German and English date/time patterns
    const timePatterns = [
      /\d{1,2}\.\d{1,2}\.\d{4}/g, // DD.MM.YYYY
      /\d{4}-\d{2}-\d{2}/g, // YYYY-MM-DD
      /\d{1,2}:\d{2}(:\d{2})?/g, // HH:MM(:SS)
      /vor \d+ (Minute|Stunde|Tag|Woche|Monat|Jahr)n?/gi,
      /\d+ (minute|hour|day|week|month|year)s? ago/gi,
      /zuletzt (aktualisiert|bearbeitet|geändert)/gi,
      /last (updated|modified|changed)/gi
    ]
    
    timePatterns.forEach(pattern => {
      normalized = normalized.replace(pattern, '[TIMESTAMP]')
    })
  }

  // Remove dynamic numbers if configured
  if (settings.ignore_counters) {
    normalized = normalized
      .replace(/\(\d+\)/g, '(COUNT)') // (123) -> (COUNT)
      .replace(/\d+ (Kommentare?|Comments?)/gi, 'X $1')
      .replace(/\d+ (Bewertungen?|Reviews?)/gi, 'X $1')
  }

  // Apply custom ignore patterns
  if (urlConfig.ignore_patterns) {
    urlConfig.ignore_patterns.forEach(pattern => {
      try {
        normalized = normalized.replace(new RegExp(pattern, 'gi'), '[IGNORED]')
      } catch (e) {
        console.warn(`Invalid ignore pattern: ${pattern}`)
      }
    })
  }

  return normalized
}

function calculateChangeMagnitude(oldText: string, newText: string): number {
  // Levenshtein distance for change magnitude
  const matrix = []
  const oldLen = oldText.length
  const newLen = newText.length

  if (oldLen === 0) return newLen === 0 ? 0 : 1
  if (newLen === 0) return 1

  // Initialize matrix
  for (let i = 0; i <= oldLen; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= newLen; j++) {
    matrix[0][j] = j
  }

  // Calculate distance
  for (let i = 1; i <= oldLen; i++) {
    for (let j = 1; j <= newLen; j++) {
      const cost = oldText[i - 1] === newText[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  const distance = matrix[oldLen][newLen]
  const maxLen = Math.max(oldLen, newLen)
  
  return maxLen === 0 ? 0 : Math.min(1, distance / maxLen)
}

async function createAdvancedChangeRecord(
  urlId: string, 
  previousSnapshotId: string, 
  currentSnapshotId: string, 
  content: any,
  previousText: string,
  changeMagnitude: number,
  sessionId: string
) {
  // Generate detailed diff
  const diffText = generateDetailedDiff(previousText, content.extractedText)
  const changeKeywords = extractChangeKeywords(diffText)
  
  const changeData = {
    url_id: urlId,
    previous_snapshot_id: previousSnapshotId,
    current_snapshot_id: currentSnapshotId,
    change_type: determineChangeType(diffText),
    change_magnitude: changeMagnitude,
    diff_text: diffText.substring(0, 5000), // Limit for storage
    diff_stats: {
      added_lines: (diffText.match(/^\+/gm) || []).length,
      removed_lines: (diffText.match(/^-/gm) || []).length,
      modified_sections: extractModifiedSections(diffText),
      change_density: changeMagnitude,
      structural_changes: detectStructuralChanges(previousText, content.extractedText)
    },
    change_summary: generateChangeSummary(diffText, changeMagnitude),
    change_keywords: changeKeywords,
    detected_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from('content_changes')
    .insert(changeData)

  if (error) {
    await logScraping(sessionId, urlId, 'ERROR', `Failed to create change record: ${error.message}`)
  } else {
    await logScraping(sessionId, urlId, 'INFO', 
      `📝 Change record created: ${changeMagnitude.toFixed(3)} magnitude, ${changeKeywords.length} keywords`)
  }
}

function generateDetailedDiff(oldText: string, newText: string): string {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  
  const diff = []
  const maxLines = Math.max(oldLines.length, newLines.length)
  
  for (let i = 0; i < maxLines && diff.length < 100; i++) {
    const oldLine = oldLines[i] || ''
    const newLine = newLines[i] || ''
    
    if (oldLine !== newLine) {
      if (oldLine && !newLine) {
        diff.push(`- ${oldLine}`)
      } else if (!oldLine && newLine) {
        diff.push(`+ ${newLine}`)
      } else {
        diff.push(`- ${oldLine}`)
        diff.push(`+ ${newLine}`)
      }
    }
  }
  
  return diff.join('\n')
}

function extractChangeKeywords(diffText: string): string[] {
  const keywords = new Set<string>()
  
  // Extract words from added/changed lines
  const changedLines = diffText.split('\n').filter(line => line.startsWith('+') || line.startsWith('-'))
  
  changedLines.forEach(line => {
    const text = line.substring(1).trim()
    // Extract meaningful words (3+ characters, not common words)
    const words = text.match(/\b[a-zA-ZäöüÄÖÜß]{3,}\b/g) || []
    
    words.forEach(word => {
      const lower = word.toLowerCase()
      // Skip common German/English words
      if (!['der', 'die', 'das', 'und', 'oder', 'the', 'and', 'for', 'with', 'this', 'that'].includes(lower)) {
        keywords.add(lower)
      }
    })
  })
  
  return Array.from(keywords).slice(0, 10) // Limit to 10 keywords
}

function determineChangeType(diffText: string): string {
  const addedLines = (diffText.match(/^\+/gm) || []).length
  const removedLines = (diffText.match(/^-/gm) || []).length
  
  if (addedLines === 0 && removedLines > 0) return 'removal'
  if (removedLines === 0 && addedLines > 0) return 'addition'
  if (addedLines > 0 && removedLines > 0) return 'modification'
  
  return 'content'
}

function extractModifiedSections(diffText: string): string[] {
  const sections = []
  const lines = diffText.split('\n')
  
  let currentSection = []
  for (const line of lines) {
    if (line.startsWith('+') || line.startsWith('-')) {
      currentSection.push(line)
    } else if (currentSection.length > 0) {
      sections.push(currentSection.join('\n'))
      currentSection = []
    }
  }
  
  if (currentSection.length > 0) {
    sections.push(currentSection.join('\n'))
  }
  
  return sections.slice(0, 5) // Limit sections
}

function detectStructuralChanges(oldText: string, newText: string): any {
  const oldHeadings = (oldText.match(/^#{1,6}\s+.+$/gm) || []).length
  const newHeadings = (newText.match(/^#{1,6}\s+.+$/gm) || []).length
  
  const oldParagraphs = oldText.split('\n\n').length
  const newParagraphs = newText.split('\n\n').length
  
  return {
    heading_change: newHeadings - oldHeadings,
    paragraph_change: newParagraphs - oldParagraphs,
    length_change: newText.length - oldText.length,
    structure_modified: Math.abs(newHeadings - oldHeadings) > 0 || 
                       Math.abs(newParagraphs - oldParagraphs) > 2
  }
}

function generateChangeSummary(diffText: string, magnitude: number): string {
  const addedLines = (diffText.match(/^\+/gm) || []).length
  const removedLines = (diffText.match(/^-/gm) || []).length
  
  if (magnitude > 0.5) {
    return `Major content change: ${addedLines} additions, ${removedLines} removals`
  } else if (magnitude > 0.1) {
    return `Moderate content change: ${addedLines} additions, ${removedLines} removals`
  } else {
    return `Minor content update: ${addedLines} additions, ${removedLines} removals`
  }
}

// Utility functions continued...
async function logScraping(sessionId: string, urlId: string | null, level: string, message: string, details?: any) {
  try {
    await supabase
      .from('scraping_logs')
      .insert({
        scraping_session_id: sessionId,
        url_id: urlId,
        log_level: level,
        message: message,
        error_details: details,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Failed to log scraping event:', error)
  }
}

async function recordMetrics(results: any[], sessionId: string) {
  const successfulResults = results.filter(r => r.success)
  const failedResults = results.filter(r => !r.success)
  
  const metrics = [
    {
      metric_type: 'scraping_success_rate',
      metric_value: results.length > 0 ? successfulResults.length / results.length : 0,
      metric_unit: 'percentage',
      agent_name: 'observer'
    },
    {
      metric_type: 'avg_response_time',
      metric_value: successfulResults.length > 0 ? 
        successfulResults.reduce((sum, r) => sum + r.fetch_duration, 0) / successfulResults.length : 0,
      metric_unit: 'milliseconds',
      agent_name: 'observer'
    },
    {
      metric_type: 'changes_detected',
      metric_value: successfulResults.filter(r => r.has_changes).length,
      metric_unit: 'count',
      agent_name: 'observer'
    }
  ]
  
  for (const metric of metrics) {
    await supabase
      .from('system_metrics')
      .insert({
        ...metric,
        dimensions: { session_id: sessionId },
        recorded_at: new Date().toISOString()
      })
  }
}

async function updateURLPerformanceStats(urlId: string, stats: any) {
  const { data: currentUrl } = await supabase
    .from('watched_urls')
    .select('performance_stats, check_count, error_count')
    .eq('id', urlId)
    .single()

  if (currentUrl) {
    const current = currentUrl.performance_stats || {}
    const checkCount = currentUrl.check_count || 0
    const errorCount = currentUrl.error_count || 0
    
    const updatedStats = {
      avg_response_time: stats.success ? 
        ((current.avg_response_time || 0) * (checkCount - 1) + stats.response_time) / checkCount :
        current.avg_response_time || 0,
      success_rate: checkCount > 0 ? (checkCount - errorCount) / checkCount : 0,
      last_content_size: stats.content_size || current.last_content_size || 0,
      last_error: stats.error_message || current.last_error,
      last_update: new Date().toISOString()
    }

    await supabase
      .from('watched_urls')
      .update({ 
        performance_stats: updatedStats,
        last_success: stats.success ? new Date().toISOString() : undefined,
        consecutive_errors: stats.success ? 0 : (supabase.rpc('increment', { 
          table_name: 'watched_urls', 
          column_name: 'consecutive_errors', 
          row_id: urlId 
        }))
      })
      .eq('id', urlId)
  }
}

async function performCleanup() {
  try {
    // Clean old snapshots (90 days)
    const { data: cleanupResult } = await supabase
      .rpc('cleanup_old_data')

    // Clean old scraping logs (30 days)
    await supabase
      .from('scraping_logs')
      .delete()
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    console.log(`Cleanup completed: ${cleanupResult} old records removed`)
  } catch (error) {
    console.error('Cleanup failed:', error)
  }
}

function generateHash(content: string): string {
  return createHash('sha256').update(content).toString()
}

function compressContent(content: string): string {
  // Simple compression - in production, use gzip
  return content
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

async function getURLsToCheck(): Promise<WatchedURL[]> {
  const now = new Date()
  
  // Smart scheduling: URLs with errors get checked less frequently
  const { data: urls, error } = await supabase
    .from('watched_urls')
    .select('*')
    .eq('is_active', true)
    .eq('is_snoozed', false)
    .or(`last_checked.is.null,and(last_checked.lt.${
      new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    },consecutive_errors.lt.3),and(last_checked.lt.${
      new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    },consecutive_errors.gte.3,consecutive_errors.lt.10),last_checked.lt.${
      new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString()
    }`)

  if (error) {
    throw new Error(`Failed to fetch URLs: ${error.message}`)
  }

  return urls || []
}
```

## 🎯 Erweiterte Features & Funktionalität

### V2 Features Roadmap

#### PDF & Document Monitoring

```typescript
// Enhanced Agent 1 für PDF-Support
async function processPDFContent(url: string, urlConfig: WatchedURL) {
  const response = await fetch(url)
  const pdfBuffer = await response.arrayBuffer()
  
  // PDF-Text-Extraktion
  const pdfText = await extractPDFText(pdfBuffer)
  
  // PDF-Metadaten
  const pdfMetadata = await extractPDFMetadata(pdfBuffer)
  
  return {
    extractedText: pdfText,
    metadata: {
      ...pdfMetadata,
      pageCount: pdfMetadata.pages,
      fileSize: pdfBuffer.byteLength,
      contentType: 'application/pdf'
    },
    contentType: 'pdf'
  }
}

async function extractPDFText(buffer: ArrayBuffer): Promise<string> {
  // Implementierung mit pdf-parse oder ähnlicher Library
  // Für Supabase Edge Functions: pdf2json oder Browser-basierte Lösung
  return "PDF text content..."
}
```

#### API Endpoint Monitoring

```typescript
// API-Monitoring für JSON/XML Endpoints
async function processAPIContent(url: string, urlConfig: WatchedURL) {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'URLWatcher/1.0'
    }
  })
  
  const contentType = response.headers.get('content-type') || ''
  
  if (contentType.includes('application/json')) {
    const jsonData = await response.json()
    return {
      extractedText: JSON.stringify(jsonData, null, 2),
      metadata: {
        contentType: 'application/json',
        objectKeys: Object.keys(jsonData).length,
        dataStructure: analyzeJSONStructure(jsonData)
      },
      structuredData: jsonData
    }
  } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
    const xmlText = await response.text()
    return {
      extractedText: xmlText,
      metadata: {
        contentType: 'application/xml',
        xmlElements: (xmlText.match(/<[^>]+>/g) || []).length
      }
    }
  }
  
  return null
}

function analyzeJSONStructure(data: any): any {
  if (Array.isArray(data)) {
    return {
      type: 'array',
      length: data.length,
      itemTypes: [...new Set(data.map(item => typeof item))]
    }
  } else if (typeof data === 'object' && data !== null) {
    return {
      type: 'object',
      keys: Object.keys(data).length,
      keyTypes: Object.fromEntries(
        Object.entries(data).map(([key, value]) => [key, typeof value])
      )
    }
  }
  return { type: typeof data }
}
```

#### Visual Change Detection

```typescript
// Screenshot-basierte Änderungserkennung
async function captureAndCompareScreenshots(page: any, urlId: string) {
  // Screenshot erstellen
  const screenshot = await page.screenshot({
    fullPage: true,
    type: 'png'
  })
  
  // Upload zu Supabase Storage
  const screenshotPath = `screenshots/${urlId}/${Date.now()}.png`
  const { data: uploadData, error } = await supabase.storage
    .from('screenshots')
    .upload(screenshotPath, screenshot)
  
  if (error) {
    console.error('Screenshot upload failed:', error)
    return null
  }
  
  // Vergleich mit vorherigem Screenshot
  const { data: lastScreenshot } = await supabase
    .from('url_snapshots')
    .select('screenshot_url')
    .eq('url_id', urlId)
    .not('screenshot_url', 'is', null)
    .order('captured_at', { ascending: false })
    .limit(1)
    .single()
  
  if (lastScreenshot?.screenshot_url) {
    const visualDiff = await compareScreenshots(lastScreenshot.screenshot_url, screenshotPath)
    return {
      screenshot_url: screenshotPath,
      visual_diff: visualDiff
    }
  }
  
  return { screenshot_url: screenshotPath }
}

async function compareScreenshots(oldPath: string, newPath: string) {
  // Implementierung mit Canvas API oder ImageMagick
  // Für einfache Implementierung: Pixel-basierter Vergleich
  return {
    similarity: 0.95,
    diff_regions: [],
    has_visual_changes: false
  }
}
```

#### Smart Content Filtering

```typescript
// Intelligente Content-Filterung
interface ContentFilter {
  name: string
  type: 'regex' | 'css_selector' | 'keyword' | 'ai_prompt'
  pattern: string
  action: 'include' | 'exclude' | 'highlight'
  priority: number
}

async function applyContentFilters(content: string, filters: ContentFilter[]): Promise<string> {
  let filteredContent = content
  
  // Sortiere Filter nach Priorität
  const sortedFilters = filters.sort((a, b) => b.priority - a.priority)
  
  for (const filter of sortedFilters) {
    switch (filter.type) {
      case 'regex':
        if (filter.action === 'exclude') {
          filteredContent = filteredContent.replace(new RegExp(filter.pattern, 'gi'), '')
        } else if (filter.action === 'highlight') {
          filteredContent = filteredContent.replace(
            new RegExp(filter.pattern, 'gi'), 
            `[HIGHLIGHT]---

## Nächste Schritte

1. **Phase 1 starten:** Datenbank-Schema deployen und Agent 1 implementieren
2. **Test-URLs definieren:** 5-10 URLs für initiale Tests auswählen
3. **LLM-APIs testen:** OpenAI und Claude Integration verifizieren
4. **Monitoring Setup:** Basic Logging und Error-Tracking implementieren

**Geschätzter Zeitaufwand:** 5-6 Wochen für MVP
**Laufende Kosten:** ~$0.20/Monat für LLM-APIs (deutlich unter Budget!)
**Integration:** Nahtlose Einbindung in bestehendes E-Mail-Tool

Dieses System bietet eine perfekte Ergänzung zum E-Mail-Tool und nutzt die bewährte 4-Agent-Architektur für maximale Flexibilität und Skalierbarkeit![/HIGHLIGHT]`
          )
        }
        break
        
      case 'keyword':
        const keywords = filter.pattern.split(',').map(k => k.trim())
        for (const keyword of keywords) {
          if (filter.action === 'exclude') {
            filteredContent = filteredContent.replace(
              new RegExp(`\\b${keyword}\\b`, 'gi'), 
              ''
            )
          } else if (filter.action === 'highlight') {
            filteredContent = filteredContent.replace(
              new RegExp(`\\b${keyword}\\b`, 'gi'), 
              `[HIGHLIGHT]${keyword}[/HIGHLIGHT]`
            )
          }
        }
        break
        
      case 'ai_prompt':
        // AI-basierte Filterung für komplexe Anforderungen
        filteredContent = await applyAIFilter(filteredContent, filter.pattern)
        break
    }
  }
  
  return filteredContent.replace(/\s+/g, ' ').trim()
}

async function applyAIFilter(content: string, prompt: string): Promise<string> {
  const filterPrompt = `
Filtere den folgenden Content basierend auf dieser Anweisung:
${prompt}

Content:
${content.substring(0, 2000)}

Antworte nur mit dem gefilterten Content:
`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: filterPrompt }],
      max_tokens: 1000,
      temperature: 0.1
    })

    return response.choices[0]?.message?.content || content
  } catch (error) {
    console.error('AI filtering failed:', error)
    return content
  }
}
```

### Advanced Analytics & Reporting

#### Dashboard Analytics

```typescript
// src/components/URLWatcher/Analytics.tsx
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState({
    changeFrequency: [],
    relevanceDistribution: [],
    errorRates: [],
    responseTimesTrend: [],
    topChangedURLs: [],
    userSatisfaction: []
  })

  useEffect(() => {
    loadAnalyticsData()
  }, [])

  const loadAnalyticsData = async () => {
    // Change Frequency über Zeit
    const { data: changes } = await supabase
      .from('content_changes')
      .select('detected_at, relevance_score, url_id, watched_urls(url)')
      .gte('detected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('detected_at', { ascending: true })

    // Gruppiere Änderungen nach Tag
    const changesByDay = changes?.reduce((acc, change) => {
      const day = new Date(change.detected_at).toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {}) || {}

    const changeFrequency = Object.entries(changesByDay).map(([date, count]) => ({
      date,
      changes: count
    }))

    // Relevanz-Verteilung
    const relevanceDistribution = [
      { name: 'Hoch (8-10)', value: changes?.filter(c => c.relevance_score >= 8).length || 0, color: '#ef4444' },
      { name: 'Mittel (5-7)', value: changes?.filter(c => c.relevance_score >= 5 && c.relevance_score < 8).length || 0, color: '#f59e0b' },
      { name: 'Niedrig (1-4)', value: changes?.filter(c => c.relevance_score < 5).length || 0, color: '#10b981' }
    ]

    // Top URLs mit den meisten Änderungen
    const urlChanges = changes?.reduce((acc, change) => {
      const url = change.watched_urls.url
      acc[url] = (acc[url] || 0) + 1
      return acc
    }, {}) || {}

    const topChangedURLs = Object.entries(urlChanges)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([url, changes]) => ({ url: url.substring(0, 50) + '...', changes }))

    // Performance-Metriken
    const { data: metrics } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: true })

    const responseTimesTrend = metrics
      ?.filter(m => m.metric_type === 'avg_response_time')
      .map(m => ({
        date: new Date(m.recorded_at).toLocaleDateString(),
        responseTime: m.metric_value
      })) || []

    // User Satisfaction
    const { data: feedback } = await supabase
      .from('change_feedback')
      .select('rating, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const satisfactionByWeek = feedback?.reduce((acc, f) => {
      const week = getWeekNumber(new Date(f.created_at))
      acc[week] = acc[week] || { ratings: [], count: 0 }
      acc[week].ratings.push(f.rating)
      acc[week].count++
      return acc
    }, {}) || {}

    const userSatisfaction = Object.entries(satisfactionByWeek).map(([week, data]) => ({
      week: `KW ${week}`,
      avgRating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length,
      responses: data.count
    }))

    setAnalyticsData({
      changeFrequency,
      relevanceDistribution,
      topChangedURLs,
      responseTimesTrend,
      userSatisfaction,
      errorRates: [] // TODO: Implement error rate analytics
    })
  }

  return (
    <div className="analytics-dashboard p-6">
      <h1 className="text-2xl font-bold mb-6">URL Watcher Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Change Frequency */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Änderungen über Zeit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.changeFrequency}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="changes" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Relevance Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Relevanz-Verteilung</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.relevanceDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {analyticsData.relevanceDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Changed URLs */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">URLs mit meisten Änderungen</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.topChangedURLs} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="url" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="changes" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User Satisfaction */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">User-Zufriedenheit</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.userSatisfaction}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgRating" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

export default Analytics
```

#### Smart Reporting System

```typescript
// Automatische Report-Generierung
interface ReportConfig {
  frequency: 'daily' | 'weekly' | 'monthly'
  includeMetrics: string[]
  recipients: string[]
  format: 'html' | 'pdf' | 'json'
}

async function generateAutomaticReport(config: ReportConfig) {
  const timeRange = getTimeRangeForFrequency(config.frequency)
  
  // Sammle alle relevanten Metriken
  const reportData = await collectReportData(timeRange, config.includeMetrics)
  
  // Generiere Report basierend auf Format
  const report = config.format === 'html' 
    ? await generateHTMLReport(reportData)
    : await generatePDFReport(reportData)
  
  // Versende Report
  for (const recipient of config.recipients) {
    await sendReport(recipient, report, config)
  }
}

async function collectReportData(timeRange: { start: Date, end: Date }, metrics: string[]) {
  const data = {
    summary: {},
    changes: [],
    performance: {},
    userFeedback: {},
    errors: []
  }

  if (metrics.includes('changes')) {
    const { data: changes } = await supabase
      .from('content_changes')
      .select(`
        *,
        watched_urls(url, title)
      `)
      .gte('detected_at', timeRange.start.toISOString())
      .lte('detected_at', timeRange.end.toISOString())
      .order('relevance_score', { ascending: false })

    data.changes = changes || []
    data.summary.totalChanges = changes?.length || 0
    data.summary.highRelevanceChanges = changes?.filter(c => c.relevance_score >= 8).length || 0
  }

  if (metrics.includes('performance')) {
    const { data: perfMetrics } = await supabase
      .from('system_metrics')
      .select('*')
      .gte('recorded_at', timeRange.start.toISOString())
      .lte('recorded_at', timeRange.end.toISOString())

    data.performance = {
      avgResponseTime: perfMetrics?.filter(m => m.metric_type === 'avg_response_time')
        .reduce((sum, m, _, arr) => sum + m.metric_value / arr.length, 0) || 0,
      successRate: perfMetrics?.filter(m => m.metric_type === 'scraping_success_rate')
        .reduce((sum, m, _, arr) => sum + m.metric_value / arr.length, 0) || 0
    }
  }

  if (metrics.includes('feedback')) {
    const { data: feedback } = await supabase
      .from('change_feedback')
      .select('rating, feedback_text')
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString())

    data.userFeedback = {
      avgRating: feedback?.reduce((sum, f, _, arr) => sum + f.rating / arr.length, 0) || 0,
      totalFeedback: feedback?.length || 0,
      commonIssues: extractCommonFeedbackIssues(feedback || [])
    }
  }

  return data
}

function generateHTMLReport(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>URL Watcher Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { background: #3b82f6; color: white; padding: 20px; margin-bottom: 30px; }
    .metric { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #3b82f6; }
    .change-item { border-bottom: 1px solid #eee; padding: 10px 0; }
    .high-relevance { border-left: 4px solid #ef4444; }
    .medium-relevance { border-left: 4px solid #f59e0b; }
    .low-relevance { border-left: 4px solid #10b981; }
  </style>
</head>
<body>
  <div class="header">
    <h1>URL Watcher Report</h1>
    <p>Generiert am: ${new Date().toLocaleDateString('de-DE')}</p>
  </div>
  
  <div class="summary">
    <h2>Zusammenfassung</h2>
    <div class="metric">
      <strong>Gesamte Änderungen:</strong> ${data.summary.totalChanges}
    </div>
    <div class="metric">
      <strong>Hoch relevante Änderungen:</strong> ${data.summary.highRelevanceChanges}
    </div>
    <div class="metric">
      <strong>Durchschnittliche Response-Zeit:</strong> ${Math.round(data.performance.avgResponseTime)}ms
    </div>
    <div class="metric">
      <strong>Erfolgsrate:</strong> ${Math.round(data.performance.successRate * 100)}%
    </div>
  </div>
  
  <div class="changes">
    <h2>Top Änderungen</h2>
    ${data.changes.slice(0, 10).map(change => `
      <div class="change-item ${getRelevanceClass(change.relevance_score)}">
        <h4>${change.watched_urls.title || change.watched_urls.url}</h4>
        <p><strong>Relevanz:</strong> ${change.relevance_score}/10</p>
        <p><strong>Erkannt am:</strong> ${new Date(change.detected_at).toLocaleString('de-DE')}</p>
        <p>${change.llm_reasoning}</p>
      </div>
    `).join('')}
  </div>
</body>
</html>
  `
}

function getRelevanceClass(score: number): string {
  if (score >= 8) return 'high-relevance'
  if (score >= 5) return 'medium-relevance'
  return 'low-relevance'
}
```

## 🔗 Cross-Tool Integration

### Unified Dashboard Architecture

```typescript
// src/components/UnifiedDashboard.tsx
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Mail, Globe, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

interface UnifiedStats {
  emailSummaries: number
  urlWatchers: number
  totalNotifications: number
  activeAlerts: number
  systemHealth: 'healthy' | 'warning' | 'critical'
}

const UnifiedDashboard: React.FC = () => {
  const [stats, setStats] = useState<UnifiedStats>({
    emailSummaries: 0,
    urlWatchers: 0,
    totalNotifications: 0,
    activeAlerts: 0,
    systemHealth: 'healthy'
  })
  
  const [recentActivity, setRecentActivity] = useState([])
  const [crossToolInsights, setCrossToolInsights] = useState([])

  useEffect(() => {
    loadUnifiedStats()
    loadRecentActivity()
    loadCrossToolInsights()
  }, [])

  const loadUnifiedStats = async () => {
    // Email Tool Stats
    const { data: emailSummaries } = await supabase
      .from('daily_summaries')
      .select('id')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // URL Watcher Stats  
    const { data: urlChanges } = await supabase
      .from('content_changes')
      .select('id')
      .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .gte('relevance_score', 6)

    // Combined Notifications
    const { data: notifications } = await supabase
      .from('notifications')
      .select('id, status')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    // System Health Check
    const { data: errorMetrics } = await supabase
      .from('system_metrics')
      .select('metric_value')
      .eq('metric_type', 'error_rate')
      .gte('recorded_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('recorded_at', { ascending: false })
      .limit(1)

    const errorRate = errorMetrics?.[0]?.metric_value || 0
    const systemHealth = errorRate > 0.1 ? 'critical' : errorRate > 0.05 ? 'warning' : 'healthy'

    setStats({
      emailSummaries: emailSummaries?.length || 0,
      urlWatchers: urlChanges?.length || 0,
      totalNotifications: notifications?.length || 0,
      activeAlerts: notifications?.filter(n => n.status === 'pending').length || 0,
      systemHealth
    })
  }

  const loadRecentActivity = async () => {
    // Kombiniere Activities aus beiden Tools
    const activities = []

    // Email Activities
    const { data: emailActivities } = await supabase
      .from('daily_summaries')
      .select(`
        id,
        created_at,
        summary_text,
        relevant_emails,
        email_accounts(email)
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    emailActivities?.forEach(activity => {
      activities.push({
        id: activity.id,
        type: 'email_summary',
        icon: <Mail className="text-blue-600" />,
        title: `E-Mail Zusammenfassung: ${activity.email_accounts.email}`,
        description: `${activity.relevant_emails} relevante E-Mails`,
        timestamp: activity.created_at,
        priority: 'normal'
      })
    })

    // URL Change Activities
    const { data: urlActivities } = await supabase
      .from('content_changes')
      .select(`
        id,
        detected_at,
        relevance_score,
        llm_reasoning,
        watched_urls(url, title)
      `)
      .gte('relevance_score', 7)
      .order('detected_at', { ascending: false })
      .limit(5)

    urlActivities?.forEach(activity => {
      activities.push({
        id: activity.id,
        type: 'url_change',
        icon: <Globe className="text-green-600" />,
        title: `Website-Änderung: ${activity.watched_urls.title || activity.watched_urls.url}`,
        description: activity.llm_reasoning,
        timestamp: activity.detected_at,
        priority: activity.relevance_score >= 9 ? 'high' : 'normal'
      })
    })

    // Sortiere nach Timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    setRecentActivity(activities.slice(0, 10))
  }

  const loadCrossToolInsights = async () => {
    // Cross-Tool Korrelations-Analyse
    const insights = []

    // Insight 1: E-Mails und Website-Änderungen derselben Domain
    const { data: emailDomains } = await supabase
      .from('emails')
      .select('sender_email')
      .gte('received_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const { data: watchedURLs } = await supabase
      .from('watched_urls')
      .select('url')

    const commonDomains = findCommonDomains(
      emailDomains?.map(e => extractDomain(e.sender_email)) || [],
      watchedURLs?.map(u => extractDomain(u.url)) || []
    )

    if (commonDomains.length > 0) {
      insights.push({
        type: 'correlation',
        title: 'Domain-Korrelation entdeckt',
        description: `${commonDomains.length} Domains sind sowohl in E-Mails als auch in überwachten URLs aktiv`,
        actionable: true,
        details: commonDomains
      })
    }

    // Insight 2: Notification Pattern Analyse
    const { data: notificationStats } = await supabase
      .from('notifications')
      .select('notification_type, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    const notificationsByHour = analyzeNotificationPatterns(notificationStats || [])
    const peakHours = findPeakNotificationHours(notificationsByHour)

    if (peakHours.length > 0) {
      insights.push({
        type: 'pattern',
        title: 'Benachrichtigungs-Pattern erkannt',
        description: `Höchste Aktivität zwischen ${peakHours[0]}:00 und ${peakHours[peakHours.length-1]}:00`,
        actionable: true,
        suggestion: 'Erwäge Quiet Hours für bessere User Experience'
      })
    }

    setCrossToolInsights(insights)
  }

  return (
    <div className="unified-dashboard">
      <div className="dashboard-header mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Unified Dashboard</h1>
        <p className="text-gray-600">Überblick über E-Mail-Tool und URL Watcher</p>
      </div>

      {/* System Health Status */}
      <div className="system-health mb-6">
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          stats.systemHealth === 'healthy' ? 'bg-green-50 text-green-800' :
          stats.systemHealth === 'warning' ? 'bg-yellow-50 text-yellow-800' :
          'bg-red-50 text-red-800'
        }`}>
          {stats.systemHealth === 'healthy' ? <CheckCircle /> : <AlertCircle />}
          <span className="font-medium">
            System Status: {stats.systemHealth === 'healthy' ? 'Gesund' : 
                          stats.systemHealth === 'warning' ? 'Warnung' : 'Kritisch'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="E-Mail Zusammenfassungen"
          value={stats.emailSummaries}
          icon={<Mail className="text-blue-600" />}
          subtitle="Letzte 24h"
        />
        <StatCard
          title="Website-Änderungen"
          value={stats.urlWatchers}
          icon={<Globe className="text-green-600" />}
          subtitle="Relevante Änderungen"
        />
        <StatCard
          title="Benachrichtigungen"
          value={stats.totalNotifications}
          icon={<TrendingUp className="text-purple-600" />}
          subtitle="Gesendet heute"
        />
        <StatCard
          title="Aktive Alerts"
          value={stats.activeAlerts}
          icon={<AlertCircle className="text-orange-600" />}
          subtitle="Ausstehend"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Neueste Aktivitäten</h2>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        {/* Cross-Tool Insights */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Cross-Tool Insights</h2>
          <div className="space-y-4">
            {crossToolInsights.map((insight, index) => (
              <InsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard: React.FC<{
  title: string
  value: number
  icon: React.ReactNode
  subtitle: string
}> = ({ title, value, icon, subtitle }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      {icon}
    </div>
  </div>
)

const ActivityItem: React.FC<{ activity: any }> = ({ activity }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
    {activity.icon}
    <div className="flex-1">
      <h4 className="font-medium text-gray-900">{activity.title}</h4>
      <p className="text-sm text-gray-600">{activity.description}</p>
      <p className="text-xs text-gray-500 mt-1">
        {new Date(activity.timestamp).toLocaleString('de-DE')}
      </p>
    </div>
    {activity.priority === 'high' && (
      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
    )}
  </div>
)

const InsightCard: React.FC<{ insight: any }> = ({ insight }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <h4 className="font-medium text-gray-900 mb-2">{insight.title}</h4>
    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
    {insight.suggestion && (
      <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
        💡 {insight.suggestion}
      </p>
    )}
  </div>
)

// Utility Functions
function extractDomain(url: string): string {
  try {
    return new URL(url.startsWith('http') ? url : `http://${url}`).hostname
  } catch {
    return url.split('@').pop()?.split('/')[0] || url
  }
}

function findCommonDomains(emailDomains: string[], urlDomains: string[]): string[] {
  const emailSet = new Set(emailDomains)
  return urlDomains.filter(domain => emailSet.has(domain))
}

function analyzeNotificationPatterns(notifications: any[]): Record<number, number> {
  const hourCounts: Record<number, number> = {}
  
  notifications.forEach(notification => {
    const hour = new Date(notification.created_at).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  return hourCounts
}

function findPeakNotificationHours(hourCounts: Record<number, number>): number[] {
  const avgCount = Object.values(hourCounts).reduce((sum, count) => sum + count, 0) / 24
  
  return Object.entries(hourCounts)
    .filter(([hour, count]) => count > avgCount * 1.5)
    .map(([hour]) => parseInt(hour))
    .sort((a, b) => a - b)
}

export default UnifiedDashboard
```

### Shared Learning System

```typescript
// Cross-Tool Learning Coordinator
class CrossToolLearningSystem {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  async shareUrlPatterns() {
    // E-Mail-Tool lernt von URL-Watcher Relevanz-Patterns
    const { data: urlFeedback } = await this.supabase
      .from('change_feedback')
      .select(`
        rating,
        feedback_text,
        content_changes!inner(
          relevance_score,
          llm_reasoning,
          watched_urls!inner(url)
        )
      `)
      .eq('feedback_type', 'relevance')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Extrahiere Learnings für E-Mail-Tool
    const patterns = this.extractRelevancePatterns(urlFeedback || [])
    
    // Teile Patterns mit E-Mail-Tool
    await this.updateEmailToolPrompts(patterns)
  }
  
  async shareEmailPatterns() {
    // URL-Watcher lernt von E-Mail-Tool Relevanz-Bewertungen
    const { data: emailFeedback } = await this.supabase
      .from('summary_feedback')
      .select(`
        rating,
        feedback_text,
        daily_summaries!inner(
          summary_text,
          relevant_emails
        )
      `)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const patterns = this.extractEmailPatterns(emailFeedback || [])
    await this.updateUrlWatcherPrompts(patterns)
  }
  
  private extractRelevancePatterns(feedback: any[]): LearningPattern[] {
    const patterns: LearningPattern[] = []
    
    // Analysiere positive Feedback-Patterns
    const positiveExamples = feedback.filter(f => f.rating >= 4)
    const negativeExamples = feedback.filter(f => f.rating <= 2)
    
    // Extrahiere Keyword-Patterns
    const positiveKeywords = this.extractKeywords(
      positiveExamples.map(e => e.content_changes.llm_reasoning).join(' ')
    )
    const negativeKeywords = this.extractKeywords(
      negativeExamples.map(e => e.content_changes.llm_reasoning).join(' ')
    )
    
    patterns.push({
      type: 'keyword_positive',
      keywords: positiveKeywords,
      confidence: positiveExamples.length / feedback.length
    })
    
    patterns.push({
      type: 'keyword_negative', 
      keywords: negativeKeywords,
      confidence: negativeExamples.length / feedback.length
    })
    
    return patterns
  }
  
  private async updateEmailToolPrompts(patterns: LearningPattern[]) {
    const currentPrompt = await this.getCurrentEmailPrompt()
    const enhancedPrompt = this.enhancePromptWithPatterns(currentPrompt, patterns)
    
    await this.supabase
      .from('prompt_templates')
      .insert({
        template_name: `cross_learned_${Date.now()}`,
        template_type: 'email_relevance',
        prompt_content: enhancedPrompt,
        version: 'cross_v1',
        is_active: false, // A/B Test erst
        created_by: 'cross_tool_learning'
      })
  }
  
  private enhancePromptWithPatterns(basePrompt: string, patterns: LearningPattern[]): string {
    let enhanced = basePrompt
    
    patterns.forEach(pattern => {
      if (pattern.type === 'keyword_positive' && pattern.confidence > 0.7) {
        enhanced += `\n\nPOSITIVE INDICATORS (from URL learning):\n`
        enhanced += `Pay special attention to content mentioning: ${pattern.keywords.join(', ')}\n`
      }
      
      if (pattern.type === 'keyword_negative' && pattern.confidence > 0.7) {
        enhanced += `\n\nNEGATIVE INDICATORS (from URL learning):\n`
        enhanced += `Be more skeptical of content mentioning: ${pattern.keywords.join(', ')}\n`
      }
    })
    
    return enhanced
  }
}

interface LearningPattern {
  type: 'keyword_positive' | 'keyword_negative' | 'structural' | 'temporal'
  keywords: string[]
  confidence: number
  metadata?: any
}
```

### Smart Notification Coordination

```typescript
// Koordinierte Benachrichtigungen zwischen beiden Tools
class UnifiedNotificationSystem {
  async coordinated_send(emailSummary?: any, urlChanges?: any[]) {
    // Prüfe ob User gerade "beschäftigt" ist (viele Notifications)
    const userContext = await this.getUserNotificationContext()
    
    if (userContext.isOverloaded) {
      return await this.sendBatchNotification(emailSummary, urlChanges)
    }
    
    // Sende getrennte Notifications wenn nicht überlastet
    if (emailSummary) await this.sendEmailNotification(emailSummary)
    if (urlChanges?.length > 0) {
      for (const change of urlChanges) {
        await this.sendUrlChangeNotification(change)
      }
    }
  }
  
  private async sendBatchNotification(emailSummary: any, urlChanges: any[]) {
    const combinedContent = this.generateCombinedNotification(emailSummary, urlChanges)
    
    await this.sendNotification({
      type: 'combined',
      title: '📬 Zusammenfassung: E-Mails & Website-Änderungen',
      content: combinedContent,
      priority: 'normal'
    })
  }
  
  private generateCombinedNotification(emailSummary: any, urlChanges: any[]): string {
    let content = ''
    
    if (emailSummary) {
      content += `📧 E-Mails: ${emailSummary.relevant_emails} neue relevante E-Mails\n\n`
    }
    
    if (urlChanges?.length > 0) {
      content += `🌐 Website-Änderungen:\n`
      urlChanges.slice(0, 3).forEach(change => {
        content += `• ${change.watched_urls.title}: ${change.llm_reasoning.substring(0, 100)}...\n`
      })
      
      if (urlChanges.length > 3) {
        content += `... und ${urlChanges.length - 3} weitere\n`
      }
    }
    
    return content
  }
  
  private async getUserNotificationContext() {
    const last15min = new Date(Date.now() - 15 * 60 * 1000)
    
    const { data: recentNotifications } = await supabase
      .from('notifications')
      .select('id, notification_type')
      .gte('created_at', last15min.toISOString())
      .eq('user_id', 'current-user-id')
    
    return {
      isOverloaded: (recentNotifications?.length || 0) > 5,
      recentCount: recentNotifications?.length || 0
    }
  }
}
```

## 🧪 Testing & Qualitätssicherung

### Comprehensive Testing Strategy

#### Unit Tests für alle Agenten

```typescript
// tests/agents/observer.test.ts
import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { createMockBrowser, createMockPage } from '../mocks/playwright.mock'
import { processURLAdvanced } from '../../supabase/functions/url-observer-advanced'

describe('Agent 1: Observer', () => {
  let mockBrowser: any
  let mockPage: any
  
  beforeEach(() => {
    mockBrowser = createMockBrowser()
    mockPage = createMockPage()
  })
  
  afterEach(() => {
    mockBrowser.close()
  })

  test('should extract content from simple HTML page', async () => {
    const mockHTML = `
      <html>
        <body>
          <h1>Test Title</h1>
          <p>Test content paragraph</p>
          <div class="ad-banner">Advertisement</div>
        </body>
      </html>
    `
    
    mockPage.setContent(mockHTML)
    mockPage.evaluate.mockResolvedValue({
      extractedText: 'Test Title\nTest content paragraph',
      metadata: { title: 'Test Title' },
      processingStats: { elements_processed: 2 }
    })
    
    const urlConfig = {
      id: 'test-url-id',
      url: 'https://example.com',
      content_settings: { ignore_ads: true }
    }
    
    const result = await processURLAdvanced(mockBrowser, urlConfig, 'session-123')
    
    expect(result.success).toBe(true)
    expect(result.content_size).toBeGreaterThan(0)
    expect(mockPage.evaluate).toHaveBeenCalled()
  })
  
  test('should handle HTTP errors gracefully', async () => {
    mockPage.goto.mockRejectedValue(new Error('HTTP 404: Not Found'))
    
    const urlConfig = {
      id: 'test-url-id',
      url: 'https://example.com/404',
      content_settings: {}
    }
    
    await expect(processURLAdvanced(mockBrowser, urlConfig, 'session-123'))
      .rejects.toThrow('HTTP 404: Not Found')
  })
  
  test('should detect content changes correctly', async () => {
    const oldContent = 'Original content'
    const newContent = 'Modified content with changes'
    
    const magnitude = calculateChangeMagnitude(oldContent, newContent)
    
    expect(magnitude).toBeGreaterThan(0)
    expect(magnitude).toBeLessThanOrEqual(1)
  })
  
  test('should normalize content properly', async () => {
    const content = `
      Content with    multiple spaces
      Published: 12.01.2024 15:30
      Last updated 2 hours ago
    `
    
    const urlConfig = {
      content_settings: { ignore_timestamps: true }
    }
    
    const normalized = normalizeContent(content, urlConfig)
    
    expect(normalized).not.toContain('12.01.2024')
    expect(normalized).not.toContain('2 hours ago')
    expect(normalized).toContain('[TIMESTAMP]')
  })
})

// tests/agents/change-analyzer.test.ts
describe('Agent 2: Change Analyzer', () => {
  test('should analyze relevance correctly', async () => {
    const mockChange = {
      id: 'change-123',
      url_id: 'url-123',
      diff_text: '+ Important new product announcement\n- Old announcement',
      watched_urls: {
        url: 'https://company.com',
        title: 'Company News',
        monitoring_instructions: 'Monitor for product announcements and important updates'
      },
      current_snapshot: { extracted_text: 'New content...' },
      previous_snapshot: { extracted_text: 'Old content...' }
    }
    
    // Mock OpenAI response
    mockOpenAI.chat.completions.create.mockResolvedValue({
      choices: [{
        message: {
          content: JSON.stringify({
            relevance_score: 8,
            relevance_category: 'high',
            confidence_score: 0.9,
            reasoning: 'Product announcement matches monitoring instructions',
            change_type: 'content'
          })
        }
      }]
    })
    
    const analysis = await analyzeChange(mockChange)
    
    expect(analysis.relevance_score).toBe(8)
    expect(analysis.relevance_category).toBe('high')
    expect(analysis.confidence_score).toBe(0.9)
  })
  
  test('should handle LLM API failures gracefully', async () => {
    mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'))
    mockClaude.messages.create.mockResolvedValue({
      content: [{ text: JSON.stringify({ relevance_score: 5 }) }]
    })
    
    const mockChange = { /* minimal change object */ }
    
    const analysis = await analyzeChange(mockChange)
    
    expect(analysis.relevance_score).toBe(5)
    expect(mockClaude.messages.create).toHaveBeenCalled()
  })
})

// tests/agents/notifier.test.ts  
describe('Agent 3: Notifier', () => {
  test('should generate proper HTML email', async () => {
    const mockChange = {
      id: 'change-123',
      relevance_score: 9,
      relevance_category: 'high',
      llm_reasoning: 'Critical security update detected',
      detected_at: new Date().toISOString(),
      diff_html: '<div class="diff-added">+ Security patch released</div>'
    }
    
    const mockUrl = {
      title: 'Security Blog',
      url: 'https://security.example.com'
    }
    
    const html = generateEmailHtml(mockChange, mockUrl)
    
    expect(html).toContain('🔔 Website-Änderung erkannt')
    expect(html).toContain('Security Blog')
    expect(html).toContain('Critical security update detected')
    expect(html).toContain('HIGH (9/10)')
  })
  
  test('should respect notification frequency settings', async () => {
    const userSettings = {
      notification_settings: {
        frequency: 'daily_digest',
        quiet_hours: { start: '22:00', end: '08:00' }
      }
    }
    
    // Test während Quiet Hours
    const quietTime = new Date()
    quietTime.setHours(23, 0, 0, 0)
    
    const shouldSend = shouldSendImmediateNotification(userSettings, quietTime)
    expect(shouldSend).toBe(false)
    
    // Test außerhalb Quiet Hours
    const normalTime = new Date()
    normalTime.setHours(14, 0, 0, 0)
    
    const shouldSendNormal = shouldSendImmediateNotification(userSettings, normalTime)
    expect(shouldSendNormal).toBe(true)
  })
})

// tests/agents/optimizer.test.ts
describe('Agent 4: Optimizer', () => {
  test('should identify common feedback patterns', async () => {
    const mockFeedback = [
      { rating: 1, feedback_text: 'Too many timestamp changes, not relevant' },
      { rating: 2, feedback_text: 'Navigation updates are not important' },
      { rating: 1, feedback_text: 'Date changes should be ignored' },
      { rating: 5, feedback_text: 'Good catch on the price update' }
    ]
    
    const issues = analyzeCommonIssues(mockFeedback)
    
    expect(issues).toContain('temporal_elements')
    expect(issues).toContain('navigation_changes')
    expect(issues).not.toContain('false_positive') // Only 25% rate
  })
  
  test('should generate improved prompts based on feedback', async () => {
    const commonIssues = ['temporal_elements', 'advertising_elements']
    
    const improvedPrompt = generateImprovedPrompt(commonIssues)
    
    expect(improvedPrompt).toContain('IGNORIERE EXPLIZIT')
    expect(improvedPrompt).toContain('Datum/Zeit-Anzeigen')
    expect(improvedPrompt).toContain('Werbe-Banner')
  })
})
```

#### Integration Tests

```typescript
// tests/integration/end-to-end.test.ts
describe('End-to-End URL Watcher Flow', () => {
  test('complete change detection and notification flow', async () => {
    // 1. Setup test URL
    const { data: testUrl } = await supabase
      .from('watched_urls')
      .insert({
        url: 'https://test-site.example.com',
        title: 'Test Site',
        monitoring_instructions: 'Monitor for any content changes',
        user_id: 'test-user-id'
      })
      .select()
      .single()
    
    // 2. Trigger Observer Agent
    const observerResponse = await fetch('/.netlify/functions/url-observer-trigger', {
      method: 'POST',
      body: JSON.stringify({ url_ids: [testUrl.id] })
    })
    
    expect(observerResponse.ok).toBe(true)
    
    // 3. Verify snapshot was created
    const { data: snapshots } = await supabase
      .from('url_snapshots')
      .select('*')
      .eq('url_id', testUrl.id)
    
    expect(snapshots.length).toBeGreaterThan(0)
    
    // 4. Simulate content change by adding another snapshot
    await supabase
      .from('url_snapshots')
      .insert({
        url_id: testUrl.id,
        content_hash: 'different-hash',
        extracted_text: 'Changed content',
        captured_at: new Date().toISOString()
      })
    
    // 5. Trigger Change Analyzer
    const analyzerResponse = await fetch('/.netlify/functions/change-analyzer', {
      method: 'POST'
    })
    
    expect(analyzerResponse.ok).toBe(true)
    
    // 6. Verify change was detected and analyzed
    const { data: changes } = await supabase
      .from('content_changes')
      .select('*')
      .eq('url_id', testUrl.id)
      .not('analyzed_at', 'is', null)
    
    expect(changes.length).toBeGreaterThan(0)
    expect(changes[0].relevance_score).toBeGreaterThan(0)
    
    // 7. Trigger Notifier if relevant
    if (changes[0].relevance_score >= 6) {
      const notifierResponse = await fetch('/.netlify/functions/notification-sender', {
        method: 'POST'
      })
      
      expect(notifierResponse.ok).toBe(true)
      
      // 8. Verify notification was sent
      const { data: notifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('change_id', changes[0].id)
      
      expect(notifications.length).toBeGreaterThan(0)
      expect(notifications[0].status).toBe('sent')
    }
    
    // Cleanup
    await supabase.from('watched_urls').delete().eq('id', testUrl.id)
  })
  
  test('learning feedback loop', async () => {
    // 1. Create test change
    const { data: change } = await createTestChange()
    
    // 2. Submit negative feedback
    const feedbackResponse = await fetch('/.netlify/functions/learning-optimizer', {
      method: 'POST',
      body: JSON.stringify({
        type: 'relevance_feedback',
        data: {
          changeId: change.id,
          rating: 1,
          feedbackText: 'Too many date/time changes'
        }
      })
    })
    
    expect(feedbackResponse.ok).toBe(true)
    
    // 3. Trigger optimization
    const optimizerResponse = await fetch('/.netlify/functions/learning-optimizer', {
      method: 'POST',
      body: JSON.stringify({ type: 'optimize_prompts' })
    })
    
    expect(optimizerResponse.ok).toBe(true)
    
    // 4. Verify new prompt template was created
    const { data: newPrompts } = await supabase
      .from('prompt_templates')
      .select('*')
      .like('template_name', 'auto_optimized_%')
      .order('created_at', { ascending: false })
      .limit(1)
    
    expect(newPrompts.length).toBeGreaterThan(0)
    expect(newPrompts[0].prompt_content).toContain('temporal_elements')
  })
})
```

#### Performance Tests

```typescript
// tests/performance/load.test.ts
describe('Performance & Load Tests', () => {
  test('should handle 50 URLs concurrently', async () => {
    const startTime = Date.now()
    
    // Create 50 test URLs
    const urls = Array.from({ length: 50 }, (_, i) => ({
      url: `https://test-site-${i}.example.com`,
      monitoring_instructions: 'Test monitoring'
    }))
    
    // Process all URLs
    const results = await Promise.allSettled(
      urls.map(url => processTestURL(url))
    )
    
    const endTime = Date.now()
    const duration = endTime - startTime
    
    // Performance assertions
    expect(duration).toBeLessThan(5 * 60 * 1000) // Under 5 minutes
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const successRate = successful / urls.length
    
    expect(successRate).toBeGreaterThan(0.9) // 90% success rate
    
    // Memory usage check
    const memoryUsage = process.memoryUsage()
    expect(memoryUsage.heapUsed).toBeLessThan(512 * 1024 * 1024) // Under 512MB
  })
  
  test('token usage optimization', async () => {
    const mockChanges = createMockChanges(10)
    
    // Test batch processing vs individual processing
    const batchStartTime = Date.now()
    const batchResult = await batchAnalyzeChanges(mockChanges)
    const batchDuration = Date.now() - batchStartTime
    
    const individualStartTime = Date.now()
    const individualResults = await Promise.all(
      mockChanges.map(change => analyzeChangeIndividually(change))
    )
    const individualDuration = Date.now() - individualStartTime
    
    // Batch should be faster and use fewer tokens
    expect(batchDuration).toBeLessThan(individualDuration)
    expect(batchResult.totalTokens).toBeLessThan(
      individualResults.reduce((sum, r) => sum + r.tokens, 0)
    )
  })
  
  test('database query performance', async () => {
    // Test complex queries with large datasets
    const startTime = Date.now()
    
    const { data, error } = await supabase
      .from('content_changes')
      .select(`
        *,
        watched_urls(url, title),
        notifications(status)
      `)
      .gte('detected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('detected_at', { ascending: false })
      .limit(1000)
    
    const queryDuration = Date.now() - startTime
    
    expect(error).toBeNull()
    expect(queryDuration).toBeLessThan(2000) // Under 2 seconds
    expect(data?.length).toBeLessThanOrEqual(1000)
  })
})
```

#### Error Handling Tests

```typescript
// tests/error-handling/resilience.test.ts
describe('Error Handling & Resilience', () => {
  test('should handle network timeouts gracefully', async () => {
    const slowUrl = {
      id: 'slow-url',
      url: 'https://slow-response.example.com',
      content_settings: {}
    }
    
    // Mock slow response
    mockPage.goto.mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 31000)
      )
    )
    
    const result = await processURLAdvanced(mockBrowser, slowUrl, 'session-123')
      .catch(error => ({ success: false, error: error.message }))
    
    expect(result.success).toBe(false)
    expect(result.error).toContain('Timeout')
    
    // Verify error was logged
    const { data: logs } = await supabase
      .from('scraping_logs')
      .select('*')
      .eq('url_id', slowUrl.id)
      .eq('log_level', 'ERROR')
    
    expect(logs.length).toBeGreaterThan(0)
  })
  
  test('should recover from LLM API failures', async () => {
    // Mock primary LLM failure
    mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Rate Limit'))
    
    // Mock secondary LLM success
    mockClaude.messages.create.mockResolvedValue({
      content: [{ text: JSON.stringify({ relevance_score: 7 }) }]
    })
    
    const analysis = await analyzeChange(mockChange)
    
    expect(analysis.relevance_score).toBe(7)
    expect(mockClaude.messages.create).toHaveBeenCalled()
  })
  
  test('should handle malformed HTML gracefully', async () => {
    const malformedHTML = `
      <html>
        <body>
          <div>Unclosed div
          <span>Nested without closing
          Invalid & entities
        </body>
      </html>
    `
    
    mockPage.setContent(malformedHTML)
    mockPage.evaluate.mockResolvedValue({
      extractedText: 'Unclosed div Nested without closing Invalid entities',
      metadata: { title: '' },
      processingStats: { elements_processed: 1 }
    })
    
    const result = await extractAdvancedContent(mockPage, {})
    
    expect(result.extractedText).toBeTruthy()
    expect(result.processingStats.elements_processed).toBeGreaterThan(0)
  })
})
```

### Automated Testing Pipeline

```yaml
# .github/workflows/test.yml
name: URL Watcher Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
        env:
          NODE_ENV: test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup test database
        run: |
          npm run db:setup:test
          npm run db:migrate:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Install Playwright
        run: npx playwright install chromium
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          NODE_ENV: test
          SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_TEST_KEY }}

  performance-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance tests
        run: npm run test:performance
        env:
          NODE_ENV: test
      
      - name: Upload performance reports
        uses: actions/upload-artifact@v3
        with:
          name: performance-reports
          path: performance-reports/

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install
      
      - name: Start test servers
        run: |
          npm run build
          npm run start:test &
          sleep 10
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🔒 Sicherheit & Datenschutz

### GDPR-Compliance Implementation

```typescript
// src/utils/gdpr-compliance.ts
interface GDPRDataProcessor {
  processPersonalData(data: any): any
  anonymizeData(data: any): any
  deletePersonalData(userId: string): Promise<void>
  exportUserData(userId: string): Promise<any>
}

class URLWatcherGDPRProcessor implements GDPRDataProcessor {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  processPersonalData(data: any): any {
    // Entferne oder hashe persönliche Identifikatoren
    return {
      ...data,
      ip_address: this.hashPII(data.ip_address),
      user_agent: this.anonymizeUserAgent(data.user_agent),
      personal_identifiers: undefined
    }
  }
  
  anonymizeData(data: any): any {
    // Für ML-Training: Entferne alle persönlichen Bezüge
    return {
      content_type: data.content_type,
      change_magnitude: data.change_magnitude,
      relevance_score: data.relevance_score,
      feedback_rating: data.feedback_rating,
      // Entferne URLs, User-IDs, etc.
      url: this.anonymizeURL(data.url),
      user_id: undefined,
      personal_content: undefined
    }
  }
  
  async deletePersonalData(userId: string): Promise<void> {
    // Cascade-Delete aller User-Daten
    const tables = [
      'watched_urls',
      'change_feedback', 
      'notifications',
      'push_subscriptions',
      'url_tags'
    ]
    
    for (const table of tables) {
      await this.supabase
        .from(table)
        .delete()
        .eq('user_id', userId)
    }
    
    // Anonymisiere verbleibende Daten (für Systemmetriken)
    await this.supabase
      .from('system_metrics')
      .update({ user_id: null })
      .eq('user_id', userId)
    
    // Lösche Screenshots aus Storage
    await this.deleteUserScreenshots(userId)
  }
  
  async exportUserData(userId: string): Promise<any> {
    const userData = {}
    
    // Sammle alle User-Daten für Export
    const { data: urls } = await this.supabase
      .from('watched_urls')
      .select('*')
      .eq('user_id', userId)
    
    const { data: feedback } = await this.supabase
      .from('change_feedback')
      .select('*')
      .eq('user_id', userId)
    
    const { data: notifications } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
    
    return {
      export_date: new Date().toISOString(),
      user_id: userId,
      watched_urls: urls,
      feedback: feedback,
      notifications: notifications,
      data_processing_info: {
        retention_period: '90 days for snapshots, 180 days for metrics',
        processing_purpose: 'Website change monitoring and notification',
        legal_basis: 'User consent'
      }
    }
  }
  
  private hashPII(data: string): string {
    if (!data) return ''
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 8)
  }
  
  private anonymizeUserAgent(userAgent: string): string {
    // Entferne spezifische Versions-Nummern und identifizierende Details
    return userAgent
      .replace(/\d+\.\d+\.\d+/g, 'X.X.X')
      .replace(/\([^)]+\)/g, '(anonymized)')
  }
  
  private anonymizeURL(url: string): string {
    try {
      const parsed = new URL(url)
      return `${parsed.protocol}//${parsed.hostname.replace(/[^.]/g, 'X')}/path`
    } catch {
      return 'anonymized-url'
    }
  }
  
  private async deleteUserScreenshots(userId: string): Promise<void> {
    const { data: userUrls } = await this.supabase
      .from('watched_urls')
      .select('id')
      .eq('user_id', userId)
    
    if (userUrls) {
      for (const url of userUrls) {
        // Lösche alle Screenshots für diese URL
        const { data: files } = await this.supabase.storage
          .from('screenshots')
          .list(`${url.id}/`)
        
        if (files) {
          const filePaths = files.map(file => `${url.id}/${file.name}`)
          await this.supabase.storage
            .from('screenshots')
            .remove(filePaths)
        }
      }
    }
  }
}

// Data Retention Policy Implementation
class DataRetentionManager {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  async enforceRetentionPolicy(): Promise<void> {
    console.log('🗂️ Starting data retention enforcement')
    
    // Lösche alte Snapshots (90 Tage)
    await this.cleanupSnapshots()
    
    // Lösche alte Logs (30 Tage)
    await this.cleanupLogs()
    
    // Lösche alte Metriken (180 Tage)
    await this.cleanupMetrics()
    
    // Lösche verwaiste Screenshots
    await this.cleanupOrphanedScreenshots()
    
    console.log('✅ Data retention enforcement completed')
  }
  
  private async cleanupSnapshots(): Promise<void> {
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    
    const { data: oldSnapshots } = await this.supabase
      .from('url_snapshots')
      .select('id, screenshot_url')
      .lt('captured_at', cutoffDate.toISOString())
    
    if (oldSnapshots && oldSnapshots.length > 0) {
      // Lösche Screenshots aus Storage
      const screenshotPaths = oldSnapshots
        .map(s => s.screenshot_url)
        .filter(url => url)
      
      if (screenshotPaths.length > 0) {
        await this.supabase.storage
          .from('screenshots')
          .remove(screenshotPaths)
      }
      
      // Lösche Snapshot-Datensätze
      await this.supabase
        .from('url_snapshots')
        .delete()
        .lt('captured_at', cutoffDate.toISOString())
      
      console.log(`🗑️ Deleted ${oldSnapshots.length} old snapshots`)
    }
  }
  
  private async cleanupLogs(): Promise<void> {
    const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    const { count } = await this.supabase
      .from('scraping_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
    
    console.log(`🗑️ Deleted ${count} old log entries`)
  }
  
  private async cleanupMetrics(): Promise<void> {
    const cutoffDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    
    const { count } = await this.supabase
      .from('system_metrics')
      .delete()
      .lt('recorded_at', cutoffDate.toISOString())
    
    console.log(`🗑️ Deleted ${count} old metrics`)
  }
}
```

### Security Best Practices

```typescript
// src/utils/security.ts
class SecurityManager {
  // Rate Limiting für API-Endpunkte
  static rateLimiter = new Map<string, { count: number, resetTime: number }>()
  
  static checkRateLimit(identifier: string, maxRequests: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now()
    const userLimit = this.rateLimiter.get(identifier)
    
    if (!userLimit || now > userLimit.resetTime) {
      this.rateLimiter.set(identifier, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (userLimit.count >= maxRequests) {
      return false
    }
    
    userLimit.count++
    return true
  }
  
  // Input Validation
  static validateURL(url: string): boolean {
    try {
      const parsed = new URL(url)
      
      // Nur HTTP/HTTPS erlauben
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false
      }
      
      // Keine lokalen/private IPs
      if (this.isPrivateIP(parsed.hostname)) {
        return false
      }
      
      // Keine gefährlichen Domains
      if (this.isDangerousDomain(parsed.hostname)) {
        return false
      }
      
      return true
    } catch {
      return false
    }
  }
  
  private static isPrivateIP(hostname: string): boolean {
    const privateRanges = [
      /^localhost$/i,
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./
    ]
    
    return privateRanges.some(range => range.test(hostname))
  }
  
  private static isDangerousDomain(hostname: string): boolean {
    const dangerousPatterns = [
      /malware/i,
      /phishing/i,
      /suspicious/i
    ]
    
    return dangerousPatterns.some(pattern => pattern.test(hostname))
  }
  
  // Content Sanitization
  static sanitizeUserInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim()
      .substring(0, 1000) // Limit length
  }
  
  // Verschlüsselung für sensitive Daten
  static encryptSensitiveData(data: string): string {
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipher(algorithm, key)
    cipher.setAAD(Buffer.from('url-watcher', 'utf8'))
    
    let encrypted = cipher.update(data, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  }
  
  static decryptSensitiveData(encryptedData: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':')
    
    const algorithm = 'aes-256-gcm'
    const key = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    
    const decipher = crypto.createDecipher(algorithm, key)
    decipher.setAAD(Buffer.from('url-watcher', 'utf8'))
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }
}

// Secure Headers Middleware
export const securityHeaders = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://your-supabase-url.supabase.co;",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}
```

### Audit Logging

```typescript
// src/utils/audit-logger.ts
interface AuditEvent {
  event_type: string
  user_id?: string
  resource_type: string
  resource_id?: string
  action: string
  details: any
  ip_address?: string
  user_agent?: string
  timestamp: string
}

class AuditLogger {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  async logEvent(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      timestamp: new Date().toISOString()
    }
    
    // Sichere sensible Daten
    if (auditEvent.ip_address) {
      auditEvent.ip_address = this.hashIP(auditEvent.ip_address)
    }
    
    await this.supabase
      .from('audit_logs')
      .insert(auditEvent)
  }
  
  async logURLCreation(userId: string, urlId: string, url: string, context: any): Promise<void> {
    await this.logEvent({
      event_type: 'resource_created',
      user_id: userId,
      resource_type: 'watched_url',
      resource_id: urlId,
      action: 'create',
      details: {
        url: SecurityManager.sanitizeUserInput(url),
        monitoring_instructions: SecurityManager.sanitizeUserInput(context.monitoring_instructions),
        source_ip: context.ip_address
      },
      ip_address: context.ip_address,
      user_agent: context.user_agent
    })
  }
  
  async logDataAccess(userId: string, resourceType: string, action: string, context: any): Promise<void> {
    await this.logEvent({
      event_type: 'data_access',
      user_id: userId,
      resource_type: resourceType,
      action: action,
      details: {
        query_params: context.queryParams,
        result_count: context.resultCount
      },
      ip_address: context.ip_address,
      user_agent: context.user_agent
    })
  }
  
  async logSecurityEvent(eventType: string, details: any, context: any): Promise<void> {
    await this.logEvent({
      event_type: 'security_event',
      resource_type: 'system',
      action: eventType,
      details: {
        ...details,
        severity: this.calculateSeverity(eventType),
        blocked: details.blocked || false
      },
      ip_address: context.ip_address,
      user_agent: context.user_agent
    })
  }
  
  private hashIP(ip: string): string {
    // Hashe IP für Privacy-Compliance
    return crypto.createHash('sha256').update(ip + process.env.IP_SALT!).digest('hex').substring(0, 16)
  }
  
  private calculateSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap = {
      'rate_limit_exceeded': 'medium',
      'invalid_url_submitted': 'low',
      'suspicious_activity': 'high',
      'unauthorized_access': 'critical',
      'malware_detected': 'critical'
    }
    
    return severityMap[eventType] || 'low'
  }
}

// Audit Log Schema Extension
/*
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID,
  action VARCHAR(50) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address_hash VARCHAR(32), -- Gehashte IP für Privacy
  user_agent_hash VARCHAR(32), -- Gehashter User-Agent
  severity VARCHAR(20) DEFAULT 'low',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'))
);

CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type, timestamp DESC);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity, timestamp DESC) WHERE severity IN ('high', 'critical');
*/
```

## 📊 Business & Operations

### Cost Management & Optimization

```typescript
// src/utils/cost-optimizer.ts
interface CostTracker {
  trackLLMUsage(model: string, tokens: number, cost: number): Promise<void>
  trackStorageUsage(bytes: number): Promise<void>
  generateCostReport(period: 'daily' | 'weekly' | 'monthly'): Promise<CostReport>
  optimizeCosts(): Promise<CostOptimization[]>
}

interface CostReport {
  period: string
  totalCost: number
  breakdown: {
    llm_api: number
    storage: number
    compute: number
    bandwidth: number
  }
  usage_stats: {
    urls_monitored: number
    changes_analyzed: number
    notifications_sent: number
    snapshots_stored: number
  }
  trends: {
    cost_per_url: number
    cost_per_change: number
    efficiency_score: number
  }
}

class CostOptimizer implements CostTracker {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  async trackLLMUsage(model: string, tokens: number, cost: number): Promise<void> {
    await this.supabase
      .from('cost_tracking')
      .insert({
        cost_type: 'llm_api',
        provider: model.includes('gpt') ? 'openai' : 'anthropic',
        model: model,
        usage_amount: tokens,
        usage_unit: 'tokens',
        cost_usd: cost,
        recorded_at: new Date().toISOString()
      })
  }
  
  async trackStorageUsage(bytes: number): Promise<void> {
    await this.supabase
      .from('cost_tracking')
      .insert({
        cost_type: 'storage',
        provider: 'supabase',
        usage_amount: bytes,
        usage_unit: 'bytes',
        cost_usd: bytes * 0.021 / (1024 * 1024 * 1024), // $0.021 per GB
        recorded_at: new Date().toISOString()
      })
  }
  
  async generateCostReport(period: 'daily' | 'weekly' | 'monthly'): Promise<CostReport> {
    const timeRange = this.getTimeRange(period)
    
    // Kosten-Breakdown abrufen
    const { data: costs } = await this.supabase
      .from('cost_tracking')
      .select('cost_type, cost_usd, usage_amount, usage_unit')
      .gte('recorded_at', timeRange.start.toISOString())
      .lte('recorded_at', timeRange.end.toISOString())
    
    // Usage-Statistiken abrufen
    const { data: urlCount } = await this.supabase
      .from('watched_urls')
      .select('id', { count: 'exact' })
      .eq('is_active', true)
    
    const { data: changeCount } = await this.supabase
      .from('content_changes')
      .select('id', { count: 'exact' })
      .gte('detected_at', timeRange.start.toISOString())
      .lte('detected_at', timeRange.end.toISOString())
    
    const { data: notificationCount } = await this.supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .gte('created_at', timeRange.start.toISOString())
      .lte('created_at', timeRange.end.toISOString())
    
    // Berechne Kosten-Breakdown
    const breakdown = (costs || []).reduce((acc, cost) => {
      acc[cost.cost_type] = (acc[cost.cost_type] || 0) + cost.cost_usd
      return acc
    }, {
      llm_api: 0,
      storage: 0,
      compute: 0,
      bandwidth: 0
    })
    
    const totalCost = Object.values(breakdown).reduce((sum, cost) => sum + cost, 0)
    
    return {
      period: `${timeRange.start.toISOString().split('T')[0]} to ${timeRange.end.toISOString().split('T')[0]}`,
      totalCost,
      breakdown,
      usage_stats: {
        urls_monitored: urlCount?.length || 0,
        changes_analyzed: changeCount?.length || 0,
        notifications_sent: notificationCount?.length || 0,
        snapshots_stored: 0 // TODO: Calculate from storage usage
      },
      trends: {
        cost_per_url: (urlCount?.length || 0) > 0 ? totalCost / (urlCount?.length || 1) : 0,
        cost_per_change: (changeCount?.length || 0) > 0 ? totalCost / (changeCount?.length || 1) : 0,
        efficiency_score: this.calculateEfficiencyScore(breakdown, changeCount?.length || 0)
      }
    }
  }
  
  async optimizeCosts(): Promise<CostOptimization[]> {
    const optimizations: CostOptimization[] = []
    
    // 1. Identifiziere teure URLs
    const expensiveUrls = await this.findExpensiveURLs()
    if (expensiveUrls.length > 0) {
      optimizations.push({
        type: 'expensive_urls',
        description: `${expensiveUrls.length} URLs verursachen überdurchschnittlich hohe Kosten`,
        potential_savings: expensiveUrls.reduce((sum, url) => sum + url.monthly_cost, 0) * 0.3,
        action: 'Review monitoring frequency for high-cost URLs',
        details: expensiveUrls
      })
    }
    
    // 2. LLM-Modell-Optimierung
    const llmOptimization = await this.analyzeLLMUsage()
    if (llmOptimization.potential_savings > 0) {
      optimizations.push(llmOptimization)
    }
    
    // 3. Storage-Optimierung  
    const storageOptimization = await this.analyzeStorageUsage()
    if (storageOptimization.potential_savings > 0) {
      optimizations.push(storageOptimization)
    }
    
    // 4. Notification-Optimierung
    const notificationOptimization = await this.analyzeNotificationEfficiency()
    if (notificationOptimization.potential_savings > 0) {
      optimizations.push(notificationOptimization)
    }
    
    return optimizations
  }
  
  private async findExpensiveURLs(): Promise<any[]> {
    // Berechne Kosten pro URL basierend auf Aktivität
    const { data: urlActivity } = await this.supabase
      .from('watched_urls')
      .select(`
        id,
        url,
        title,
        check_count,
        error_count,
        content_changes(id)
      `)
      .eq('is_active', true)
    
    return (urlActivity || [])
      .map(url => ({
        ...url,
        changes_per_check: url.check_count > 0 ? url.content_changes.length / url.check_count : 0,
        estimated_monthly_cost: this.estimateURLCost(url)
      }))
      .filter(url => url.estimated_monthly_cost > 0.50) // URLs über $0.50/Monat
      .sort((a, b) => b.estimated_monthly_cost - a.estimated_monthly_cost)
  }
  
  private estimateURLCost(url: any): number {
    // Einfache Kostenschätzung basierend auf Aktivität
    const checksPerMonth = (url.check_count / 30) * 30 // Extrapoliere auf Monat
    const changesPerMonth = url.content_changes.length * (30 / 7) // Letzte Woche extrapoliert
    
    const scrapingCost = checksPerMonth * 0.001 // $0.001 pro Check
    const analysisCost = changesPerMonth * 0.01 // $0.01 pro Analyse
    const storageCost = url.content_changes.length * 0.0001 // $0.0001 pro Snapshot
    
    return scrapingCost + analysisCost + storageCost
  }
  
  private async analyzeLLMUsage(): Promise<CostOptimization> {
    const { data: llmUsage } = await this.supabase
      .from('cost_tracking')
      .select('model, cost_usd, usage_amount')
      .eq('cost_type', 'llm_api')
      .gte('recorded_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    
    const totalLLMCost = (llmUsage || []).reduce((sum, usage) => sum + usage.cost_usd, 0)
    const gptUsage = (llmUsage || []).filter(u => u.model.includes('gpt'))
    const claudeUsage = (llmUsage || []).filter(u => u.model.includes('claude'))
    
    // Analysiere ob günstigeres Modell verwendet werden könnte
    const gptCost = gptUsage.reduce((sum, u) => sum + u.cost_usd, 0)
    const claudeCost = claudeUsage.reduce((sum, u) => sum + u.cost_usd, 0)
    
    let potentialSavings = 0
    let recommendation = ''
    
    if (gptCost > claudeCost && gptCost > 1.0) {
      potentialSavings = gptCost * 0.4 // 40% Einsparung durch Claude
      recommendation = 'Switch mehr Analysen zu Claude Haiku für niedrigere Kosten'
    }
    
    return {
      type: 'llm_optimization',
      description: 'LLM-Kosten können durch Modell-Optimierung reduziert werden',
      potential_savings: potentialSavings,
      action: recommendation,
      details: {
        current_gpt_cost: gptCost,
        current_claude_cost: claudeCost,
        total_llm_cost: totalLLMCost
      }
    }
  }
}

interface CostOptimization {
  type: string
  description: string
  potential_savings: number
  action: string
  details: any
}

// Cost Tracking Schema
/*
CREATE TABLE cost_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_type VARCHAR(50) NOT NULL, -- 'llm_api', 'storage', 'compute', 'bandwidth'
  provider VARCHAR(50) NOT NULL, -- 'openai', 'anthropic', 'supabase', 'netlify'
  model VARCHAR(100), -- Spezifisches Modell/Service
  usage_amount DECIMAL(15,6) NOT NULL,
  usage_unit VARCHAR(20) NOT NULL, -- 'tokens', 'bytes', 'requests', 'seconds'
  cost_usd DECIMAL(10,6) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cost_tracking_type_date ON cost_tracking(cost_type, recorded_at DESC);
CREATE INDEX idx_cost_tracking_provider_date ON cost_tracking(provider, recorded_at DESC);
*/
```

### Monitoring & Alerting System

```typescript
// src/utils/monitoring.ts
interface MonitoringSystem {
  checkSystemHealth(): Promise<HealthStatus>
  monitorPerformance(): Promise<PerformanceMetrics>
  detectAnomalies(): Promise<Anomaly[]>
  sendAlerts(alerts: Alert[]): Promise<void>
}

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'critical'
  components: {
    database: ComponentHealth
    agents: ComponentHealth
    external_apis: ComponentHealth
    storage: ComponentHealth
  }
  uptime: number
  last_check: string
}

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'critical'
  response_time?: number
  error_rate?: number
  last_error?: string
  details: any
}

class SystemMonitor implements MonitoringSystem {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  private alertThresholds = {
    error_rate: 0.05, // 5%
    response_time: 5000, // 5 seconds
    success_rate: 0.95 // 95%
  }
  
  async checkSystemHealth(): Promise<HealthStatus> {
    const [database, agents, apis, storage] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkAgentsHealth(),
      this.checkExternalAPIsHealth(),
      this.checkStorageHealth()
    ])
    
    const overallHealth = this.calculateOverallHealth([database, agents, apis, storage])
    
    const healthStatus: HealthStatus = {
      overall: overallHealth,
      components: { database, agents, external_apis: apis, storage },
      uptime: await this.calculateUptime(),
      last_check: new Date().toISOString()
    }
    
    // Speichere Health-Status für Trending
    await this.recordHealthStatus(healthStatus)
    
    return healthStatus
  }
  
  private async checkDatabaseHealth(): Promise<ComponentHealth> {
    try {
      const startTime = Date.now()
      
      // Einfache Ping-Query
      const { data, error } = await this.supabase
        .from('watched_urls')
        .select('id')
        .limit(1)
      
      const responseTime = Date.now() - startTime
      
      if (error) {
        return {
          status: 'critical',
          response_time: responseTime,
          last_error: error.message,
          details: { error }
        }
      }
      
      // Prüfe Connection Pool
      const { data: connectionStats } = await this.supabase
        .rpc('get_connection_stats')
      
      const status = responseTime > 2000 ? 'degraded' : 'healthy'
      
      return {
        status,
        response_time: responseTime,
        details: {
          connection_stats: connectionStats,
          query_performance: 'normal'
        }
      }
    } catch (error) {
      return {
        status: 'critical',
        last_error: error.message,
        details: { error }
      }
    }
  }
  
  private async checkAgentsHealth(): Promise<ComponentHealth> {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // Prüfe Agent-Ausführungen
    const { data: agentMetrics } = await this.supabase
      .from('system_metrics')
      .select('agent_name, metric_type, metric_value')
      .gte('recorded_at', last24h.toISOString())
      .in('metric_type', ['success_rate', 'error_rate', 'execution_time'])
    
    const agentHealth = (agentMetrics || []).reduce((acc, metric) => {
      if (!acc[metric.agent_name]) {
        acc[metric.agent_name] = {}
      }
      acc[metric.agent_name][metric.metric_type] = metric.metric_value
      return acc
    }, {})
    
    // Bewerte Agent-Health
    const criticalAgents = Object.entries(agentHealth).filter(([name, metrics]) => 
      metrics.error_rate > this.alertThresholds.error_rate ||
      metrics.success_rate < this.alertThresholds.success_rate
    )
    
    const status = criticalAgents.length > 0 ? 'critical' : 
                   Object.keys(agentHealth).length < 4 ? 'degraded' : 'healthy'
    
    return {
      status,
      details: {
        agents: agentHealth,
        critical_agents: criticalAgents.map(([name]) => name),
        last_execution: await this.getLastAgentExecution()
      }
    }
  }
  
  private async checkExternalAPIsHealth(): Promise<ComponentHealth> {
    const apiChecks = await Promise.allSettled([
      this.checkOpenAIHealth(),
      this.checkClaudeHealth(),
      this.checkSMTPHealth()
    ])
    
    const results = apiChecks.map((check, index) => ({
      api: ['openai', 'claude', 'smtp'][index],
      status: check.status,
      result: check.status === 'fulfilled' ? check.value : check.reason
    }))
    
    const failedAPIs = results.filter(r => r.status === 'rejected').length
    const status = failedAPIs === 0 ? 'healthy' : 
                   failedAPIs === results.length ? 'critical' : 'degraded'
    
    return {
      status,
      details: {
        api_results: results,
        failed_count: failedAPIs
      }
    }
  }
  
  private async checkOpenAIHealth(): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` }
      })
      
      return {
        status: response.ok ? 'healthy' : 'degraded',
        response_time: 0, // TODO: Measure actual response time
        http_status: response.status
      }
    } catch (error) {
      return {
        status: 'critical',
        error: error.message
      }
    }
  }
  
  async monitorPerformance(): Promise<PerformanceMetrics> {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    // Sammle Performance-Metriken
    const { data: metrics } = await this.supabase
      .from('system_metrics')
      .select('*')
      .gte('recorded_at', last24h.toISOString())
    
    const performanceMetrics: PerformanceMetrics = {
      avg_response_time: this.calculateAverage(metrics, 'avg_response_time'),
      success_rate: this.calculateAverage(metrics, 'scraping_success_rate'),
      error_rate: this.calculateAverage(metrics, 'error_rate'),
      throughput: this.calculateThroughput(metrics),
      resource_usage: await this.getResourceUsage(),
      trending: this.calculateTrends(metrics)
    }
    
    return performanceMetrics
  }
  
  async detectAnomalies(): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = []
    
    // 1. Ungewöhnliche Error-Rate
    const errorRateAnomaly = await this.detectErrorRateAnomaly()
    if (errorRateAnomaly) anomalies.push(errorRateAnomaly)
    
    // 2. Performance-Degradation
    const performanceAnomaly = await this.detectPerformanceAnomaly()
    if (performanceAnomaly) anomalies.push(performanceAnomaly)
    
    // 3. Ungewöhnliche Kosten
    const costAnomaly = await this.detectCostAnomaly()
    if (costAnomaly) anomalies.push(costAnomaly)
    
    // 4. Suspicious User Activity
    const activityAnomaly = await this.detectSuspiciousActivity()
    if (activityAnomaly) anomalies.push(activityAnomaly)
    
    return anomalies
  }
  
  private async detectErrorRateAnomaly(): Promise<Anomaly | null> {
    const { data: recentErrors } = await this.supabase
      .from('system_metrics')
      .select('metric_value, recorded_at')
      .eq('metric_type', 'error_rate')
      .gte('recorded_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
      .order('recorded_at', { ascending: false })
    
    if (!recentErrors || recentErrors.length === 0) return null
    
    const avgErrorRate = recentErrors.reduce((sum, m) => sum + m.metric_value, 0) / recentErrors.length
    const baseline = 0.02 // 2% baseline error rate
    
    if (avgErrorRate > baseline * 3) { // 3x higher than baseline
      return {
        type: 'error_rate_spike',
        severity: avgErrorRate > baseline * 5 ? 'critical' : 'high',
        description: `Error rate spiked to ${(avgErrorRate * 100).toFixed(2)}% (baseline: ${(baseline * 100).toFixed(2)}%)`,
        detected_at: new Date().toISOString(),
        details: {
          current_rate: avgErrorRate,
          baseline_rate: baseline,
          spike_factor: avgErrorRate / baseline,
          affected_period: '1 hour'
        }
      }
    }
    
    return null
  }
  
  async sendAlerts(alerts: Alert[]): Promise<void> {
    for (const alert of alerts) {
      await this.processAlert(alert)
    }
  }
  
  private async processAlert(alert: Alert): Promise<void> {
    // 1. Speichere Alert in Datenbank
    await this.supabase
      .from('system_alerts')
      .insert({
        alert_type: alert.type,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        details: alert.details,
        status: 'active',
        created_at: new Date().toISOString()
      })
    
    // 2. Sende Notifications basierend auf Severity
    if (alert.severity === 'critical') {
      await this.sendCriticalAlert(alert)
    } else if (alert.severity === 'high') {
      await this.sendHighPriorityAlert(alert)
    }
    
    // 3. Auto-remediation für bekannte Probleme
    await this.attemptAutoRemediation(alert)
  }
  
  private async sendCriticalAlert(alert: Alert): Promise<void> {
    // Sofortige Benachrichtigung via E-Mail + SMS/Slack
    const message = `🚨 CRITICAL ALERT: ${alert.title}\n\n${alert.description}\n\nDetails: ${JSON.stringify(alert.details, null, 2)}`
    
    // E-Mail
    await this.sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `🚨 URL Watcher Critical Alert: ${alert.title}`,
      body: message,
      priority: 'high'
    })
    
    // Slack/Discord Webhook (falls konfiguriert)
    if (process.env.SLACK_WEBHOOK_URL) {
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          channel: '#alerts',
          username: 'URL Watcher',
          icon_emoji: ':rotating_light:'
        })
      })
    }
  }
}

interface PerformanceMetrics {
  avg_response_time: number
  success_rate: number
  error_rate: number
  throughput: number
  resource_usage: any
  trending: any
}

interface Anomaly {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detected_at: string
  details: any
}

interface Alert {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  details: any
}

// Monitoring Schema Extension
/*
CREATE TABLE system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  auto_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_alerts_severity_status ON system_alerts(severity, status, created_at DESC);
CREATE INDEX idx_system_alerts_type_created ON system_alerts(alert_type, created_at DESC);
*/
```

## 🚀 Performance & Scaling

### Database Performance Optimization

```typescript
// Database optimization strategies
class DatabaseOptimizer {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  async optimizeQueryPerformance(): Promise<void> {
    // 1. Analysiere langsame Queries
    const slowQueries = await this.identifySlowQueries()
    
    // 2. Optimiere Indizes
    await this.optimizeIndexes()
    
    // 3. Partitionierung für große Tabellen
    await this.implementPartitioning()
    
    // 4. Query-Caching
    await this.setupQueryCaching()
  }
  
  private async identifySlowQueries(): Promise<any[]> {
    // Nutze pg_stat_statements für PostgreSQL
    const { data: slowQueries } = await this.supabase
      .rpc('get_slow_queries', { 
        min_duration_ms: 1000,
        limit_results: 20 
      })
    
    return slowQueries || []
  }
  
  private async optimizeIndexes(): Promise<void> {
    // Identifiziere fehlende Indizes basierend auf Query-Patterns
    const indexRecommendations = [
      // Composite Index für häufige Filterungen
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_changes_url_relevance_detected 
       ON content_changes(url_id, relevance_score DESC, detected_at DESC)',
      
      // Partial Index für aktive URLs
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_watched_urls_active_last_checked 
       ON watched_urls(last_checked DESC) WHERE is_active = true AND is_snoozed = false',
      
      // GIN Index für JSONB-Suchen
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_metadata_gin 
       ON notifications USING GIN(delivery_metadata)',
      
      // Expression Index für Domain-Gruppierung
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_watched_urls_domain 
       ON watched_urls((regexp_replace(url, \'^https?://([^/]+).*\', \'\\1\')))',
      
      // Covering Index für Dashboard-Queries
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_content_changes_dashboard_covering 
       ON content_changes(detected_at DESC) 
       INCLUDE (url_id, relevance_score, relevance_category, llm_reasoning)'
    ]
    
    for (const indexSQL of indexRecommendations) {
      try {
        await this.supabase.rpc('execute_sql', { sql: indexSQL })
        console.log('✅ Index created successfully')
      } catch (error) {
        console.error('❌ Index creation failed:', error)
      }
    }
  }
  
  private async implementPartitioning(): Promise<void> {
    // Partitioniere große Tabellen nach Datum
    const partitioningQueries = [
      // Partitioniere url_snapshots nach Monat
      `
      -- Convert existing table to partitioned table
      CREATE TABLE url_snapshots_partitioned (
        LIKE url_snapshots INCLUDING ALL
      ) PARTITION BY RANGE (captured_at);
      
      -- Create monthly partitions for current and next 3 months
      CREATE TABLE url_snapshots_y2024m12 PARTITION OF url_snapshots_partitioned
        FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');
      CREATE TABLE url_snapshots_y2025m01 PARTITION OF url_snapshots_partitioned
        FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
      CREATE TABLE url_snapshots_y2025m02 PARTITION OF url_snapshots_partitioned
        FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
      CREATE TABLE url_snapshots_y2025m03 PARTITION OF url_snapshots_partitioned
        FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
      `,
      
      // Partitioniere system_metrics nach Woche
      `
      CREATE TABLE system_metrics_partitioned (
        LIKE system_metrics INCLUDING ALL
      ) PARTITION BY RANGE (recorded_at);
      `
    ]
    
    // Implementiere schrittweise Migration
    await this.migrateToPartitionedTables()
  }
  
  private async setupQueryCaching(): Promise<void> {
    // Implementiere Application-Level Caching
    const cacheConfig = {
      dashboard_stats: { ttl: 300 }, // 5 Minuten
      url_health_scores: { ttl: 900 }, // 15 Minuten
      system_metrics: { ttl: 60 }, // 1 Minute
      user_preferences: { ttl: 3600 } // 1 Stunde
    }
    
    // Setup Redis-ähnliches Caching mit Supabase
    await this.implementCachingLayer(cacheConfig)
  }
}

// Connection Pooling Optimization
class ConnectionManager {
  private pools: Map<string, any> = new Map()
  
  getOptimizedConnection(purpose: 'read' | 'write' | 'analytics'): any {
    const poolConfig = {
      read: {
        max: 20,
        min: 5,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 30000
      },
      write: {
        max: 10,
        min: 2,
        acquireTimeoutMillis: 60000,
        idleTimeoutMillis: 30000
      },
      analytics: {
        max: 5,
        min: 1,
        acquireTimeoutMillis: 120000,
        idleTimeoutMillis: 60000
      }
    }
    
    if (!this.pools.has(purpose)) {
      this.pools.set(purpose, this.createPool(poolConfig[purpose]))
    }
    
    return this.pools.get(purpose)
  }
  
  private createPool(config: any): any {
    // Implementierung abhängig von verwendeter Library
    return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      db: {
        pool: config
      }
    })
  }
}
```

### Caching Strategy

```typescript
// src/utils/caching.ts
interface CacheManager {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  invalidate(pattern: string): Promise<void>
  warmup(): Promise<void>
}

class MultiLevelCacheManager implements CacheManager {
  private memoryCache = new Map<string, { value: any, expires: number }>()
  private maxMemorySize = 100 // MB
  private currentMemorySize = 0
  
  async get<T>(key: string): Promise<T | null> {
    // Level 1: Memory Cache
    const memoryResult = this.getFromMemory(key)
    if (memoryResult !== null) {
      return memoryResult as T
    }
    
    // Level 2: Supabase Cache Table
    const dbResult = await this.getFromDatabase(key)
    if (dbResult !== null) {
      // Schreibe zurück in Memory Cache
      await this.setInMemory(key, dbResult, 300) // 5 min
      return dbResult as T
    }
    
    return null
  }
  
  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    // Schreibe in beide Cache-Layer
    await Promise.all([
      this.setInMemory(key, value, Math.min(ttl, 1800)), // Max 30 min in memory
      this.setInDatabase(key, value, ttl)
    ])
  }
  
  private getFromMemory(key: string): any | null {
    const cached = this.memoryCache.get(key)
    if (!cached) return null
    
    if (Date.now() > cached.expires) {
      this.memoryCache.delete(key)
      return null
    }
    
    return cached.value
  }
  
  private async setInMemory(key: string, value: any, ttl: number): Promise<void> {
    const expires = Date.now() + (ttl * 1000)
    const serialized = JSON.stringify(value)
    const size = Buffer.byteLength(serialized, 'utf8')
    
    // Memory Management
    if (this.currentMemorySize + size > this.maxMemorySize * 1024 * 1024) {
      await this.evictOldestEntries(size)
    }
    
    this.memoryCache.set(key, { value, expires })
    this.currentMemorySize += size
  }
  
  private async getFromDatabase(key: string): Promise<any | null> {
    const { data } = await supabase
      .from('cache_entries')
      .select('value, expires_at')
      .eq('key', key)
      .single()
    
    if (!data) return null
    
    if (new Date(data.expires_at) < new Date()) {
      // Expired - remove
      await supabase
        .from('cache_entries')
        .delete()
        .eq('key', key)
      return null
    }
    
    return JSON.parse(data.value)
  }
  
  private async setInDatabase(key: string, value: any, ttl: number): Promise<void> {
    const expiresAt = new Date(Date.now() + (ttl * 1000))
    
    await supabase
      .from('cache_entries')
      .upsert({
        key,
        value: JSON.stringify(value),
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      })
  }
  
  async warmup(): Promise<void> {
    // Lade häufig verwendete Daten vor
    const warmupQueries = [
      { key: 'active_urls_count', query: this.getActiveURLsCount },
      { key: 'recent_changes', query: this.getRecentChanges },
      { key: 'system_health', query: this.getSystemHealth },
      { key: 'user_preferences', query: this.getUserPreferences }
    ]
    
    for (const { key, query } of warmupQueries) {
      try {
        const data = await query()
        await this.set(key, data, 1800) // 30 min
        console.log(`✅ Warmed up cache for ${key}`)
      } catch (error) {
        console.error(`❌ Failed to warm up ${key}:`, error)
      }
    }
  }
  
  async invalidate(pattern: string): Promise<void> {
    // Memory Cache
    for (const key of this.memoryCache.keys()) {
      if (key.includes(pattern)) {
        this.memoryCache.delete(key)
      }
    }
    
    // Database Cache
    await supabase
      .from('cache_entries')
      .delete()
      .like('key', `%${pattern}%`)
  }
  
  private async evictOldestEntries(neededSpace: number): Promise<void> {
    const entries = Array.from(this.memoryCache.entries())
      .sort((a, b) => a[1].expires - b[1].expires)
    
    let freedSpace = 0
    for (const [key, entry] of entries) {
      const entrySize = Buffer.byteLength(JSON.stringify(entry.value), 'utf8')
      this.memoryCache.delete(key)
      freedSpace += entrySize
      this.currentMemorySize -= entrySize
      
      if (freedSpace >= neededSpace) break
    }
  }
}

// Cache Schema
/*
CREATE TABLE cache_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_cache_entries_key ON cache_entries(key);
CREATE INDEX idx_cache_entries_expires ON cache_entries(expires_at);

-- Auto-cleanup für expired entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cache_entries WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$ LANGUAGE plpgsql;
*/
```

### Horizontal Scaling Strategy

```typescript
// src/utils/scaling.ts
class ScalingManager {
  private loadBalancer = new LoadBalancer()
  private queueManager = new QueueManager()
  
  async scaleBasedOnLoad(): Promise<void> {
    const currentLoad = await this.measureSystemLoad()
    const scalingDecision = this.analyzeScalingNeed(currentLoad)
    
    if (scalingDecision.action === 'scale_up') {
      await this.scaleUp(scalingDecision.target)
    } else if (scalingDecision.action === 'scale_down') {
      await this.scaleDown(scalingDecision.target)
    }
  }
  
  private async measureSystemLoad(): Promise<SystemLoad> {
    return {
      cpu_usage: await this.getCPUUsage(),
      memory_usage: await this.getMemoryUsage(),
      queue_depth: await this.getQueueDepth(),
      response_time: await this.getAvgResponseTime(),
      error_rate: await this.getErrorRate(),
      active_connections: await this.getActiveConnections()
    }
  }
  
  private analyzeScalingNeed(load: SystemLoad): ScalingDecision {
    // Scale-Up Triggers
    if (load.cpu_usage > 80 || load.memory_usage > 85 || load.queue_depth > 100) {
      return {
        action: 'scale_up',
        target: 'agents',
        reason: 'High resource usage detected',
        priority: 'high'
      }
    }
    
    if (load.response_time > 5000 || load.error_rate > 0.05) {
      return {
        action: 'scale_up',
        target: 'workers',
        reason: 'Performance degradation detected',
        priority: 'medium'
      }
    }
    
    // Scale-Down Triggers
    if (load.cpu_usage < 30 && load.memory_usage < 40 && load.queue_depth < 10) {
      return {
        action: 'scale_down',
        target: 'workers',
        reason: 'Underutilization detected',
        priority: 'low'
      }
    }
    
    return { action: 'maintain', target: null, reason: 'Load within normal range' }
  }
  
  async distributeWorkload(): Promise<void> {
    // Intelligente Verteilung der URL-Checks
    const activeURLs = await this.getActiveURLs()
    const workers = await this.getAvailableWorkers()
    
    // Gruppiere URLs nach Komplexität und Priorität
    const urlGroups = this.groupURLsByComplexity(activeURLs)
    
    // Verteile auf verfügbare Worker
    for (const group of urlGroups) {
      const optimalWorker = this.selectOptimalWorker(workers, group)
      await this.assignWorkToWorker(optimalWorker, group)
    }
  }
  
  private groupURLsByComplexity(urls: any[]): URLGroup[] {
    return urls.reduce((groups, url) => {
      const complexity = this.calculateURLComplexity(url)
      const priority = this.calculateURLPriority(url)
      
      const groupKey = `${complexity}_${priority}`
      if (!groups[groupKey]) {
        groups[groupKey] = {
          complexity,
          priority,
          urls: []
        }
      }
      
      groups[groupKey].urls.push(url)
      return groups
    }, {})
  }
  
  private calculateURLComplexity(url: any): 'simple' | 'medium' | 'complex' {
    let score = 0
    
    // JavaScript-heavy sites
    if (url.content_settings?.requires_js) score += 3
    
    // Large pages
    if (url.performance_stats?.last_content_size > 1024 * 1024) score += 2
    
    // Slow response times
    if (url.performance_stats?.avg_response_time > 5000) score += 2
    
    // Complex CSS selectors
    if (url.css_selectors?.length > 5) score += 1
    
    // Error-prone URLs
    if (url.error_count > url.check_count * 0.1) score += 2
    
    if (score >= 6) return 'complex'
    if (score >= 3) return 'medium'
    return 'simple'
  }
  
  private selectOptimalWorker(workers: Worker[], group: URLGroup): Worker {
    // Finde Worker mit niedrigster Last für diese Komplexität
    return workers
      .filter(w => w.canHandle(group.complexity))
      .sort((a, b) => a.currentLoad - b.currentLoad)[0]
  }
}

class QueueManager {
  private queues: Map<string, Queue> = new Map()
  
  async setupQueues(): Promise<void> {
    // Verschiedene Queues für verschiedene Prioritäten
    this.queues.set('critical', new Queue({
      name: 'critical-urls',
      concurrency: 10,
      priority: 1
    }))
    
    this.queues.set('normal', new Queue({
      name: 'normal-urls', 
      concurrency: 20,
      priority: 2
    }))
    
    this.queues.set('low', new Queue({
      name: 'low-priority-urls',
      concurrency: 5,
      priority: 3
    }))
    
    // Background Tasks Queue
    this.queues.set('background', new Queue({
      name: 'background-tasks',
      concurrency: 3,
      priority: 4
    }))
  }
  
  async addToQueue(priority: string, task: Task): Promise<void> {
    const queue = this.queues.get(priority)
    if (!queue) {
      throw new Error(`Queue ${priority} not found`)
    }
    
    await queue.add(task.name, task.data, {
      attempts: task.retries || 3,
      backoff: 'exponential',
      removeOnComplete: 100,
      removeOnFail: 50
    })
  }
  
  async getQueueStats(): Promise<QueueStats[]> {
    const stats = []
    
    for (const [name, queue] of this.queues) {
      const queueStats = await queue.getJobCounts()
      stats.push({
        name,
        ...queueStats,
        throughput: await this.calculateThroughput(queue),
        avgProcessingTime: await this.getAvgProcessingTime(queue)
      })
    }
    
    return stats
  }
}

interface SystemLoad {
  cpu_usage: number
  memory_usage: number
  queue_depth: number
  response_time: number
  error_rate: number
  active_connections: number
}

interface ScalingDecision {
  action: 'scale_up' | 'scale_down' | 'maintain'
  target: string | null
  reason: string
  priority?: string
}

interface URLGroup {
  complexity: 'simple' | 'medium' | 'complex'
  priority: 'low' | 'normal' | 'high' | 'critical'
  urls: any[]
}

interface Worker {
  id: string
  currentLoad: number
  capabilities: string[]
  canHandle(complexity: string): boolean
}

interface Task {
  name: string
  data: any
  retries?: number
}

interface QueueStats {
  name: string
  waiting: number
  active: number
  completed: number
  failed: number
  throughput: number
  avgProcessingTime: number
}
```

### Auto-Scaling Implementation

```typescript
// src/utils/auto-scaler.ts
class AutoScaler {
  private scalingRules: ScalingRule[] = [
    {
      metric: 'queue_depth',
      threshold: 50,
      action: 'scale_up',
      cooldown: 300, // 5 minutes
      target: 'workers'
    },
    {
      metric: 'error_rate',
      threshold: 0.1,
      action: 'investigate',
      cooldown: 60,
      target: 'monitoring'
    },
    {
      metric: 'avg_response_time',
      threshold: 10000,
      action: 'scale_up',
      cooldown: 180,
      target: 'compute'
    }
  ]
  
  async executeAutoScaling(): Promise<void> {
    const metrics = await this.getCurrentMetrics()
    
    for (const rule of this.scalingRules) {
      const shouldTrigger = await this.evaluateRule(rule, metrics)
      
      if (shouldTrigger && !this.isInCooldown(rule)) {
        await this.executeScalingAction(rule, metrics)
        this.setCooldown(rule)
      }
    }
  }
  
  private async executeScalingAction(rule: ScalingRule, metrics: any): Promise<void> {
    switch (rule.action) {
      case 'scale_up':
        await this.scaleUpService(rule.target)
        break
      case 'scale_down':
        await this.scaleDownService(rule.target)
        break
      case 'investigate':
        await this.triggerInvestigation(rule, metrics)
        break
    }
  }
  
  private async scaleUpService(target: string): Promise<void> {
    switch (target) {
      case 'workers':
        await this.addWorkerInstances(2)
        break
      case 'compute':
        await this.increaseComputeResources()
        break
      case 'database':
        await this.scaleDatabase()
        break
    }
  }
  
  private async addWorkerInstances(count: number): Promise<void> {
    // Für Serverless: Erhöhe Concurrency-Limits
    await this.updateNetlifyFunctionConfig({
      timeout: 30,
      memory: 1024,
      concurrency: 50 // Erhöht von 25
    })
    
    // Für Supabase Edge Functions: Skaliert automatisch
    // Dokumentiere Scaling-Event
    await this.logScalingEvent({
      action: 'scale_up',
      target: 'workers',
      instances_added: count,
      reason: 'High queue depth detected'
    })
  }
}

interface ScalingRule {
  metric: string
  threshold: number
  action: 'scale_up' | 'scale_down' | 'investigate'
  cooldown: number
  target: string
}
```

## 🔄 Backup & Recovery Strategien

### Comprehensive Backup System

```typescript
// src/utils/backup-manager.ts
class BackupManager {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  private backupStorage = process.env.BACKUP_STORAGE_URL! // S3, GCS, etc.
  
  async createFullBackup(): Promise<BackupResult> {
    const backupId = `backup_${Date.now()}`
    const startTime = Date.now()
    
    try {
      console.log('🔄 Starting full backup...')
      
      // 1. Database Backup
      const dbBackup = await this.backupDatabase(backupId)
      
      // 2. File Storage Backup (Screenshots, etc.)
      const storageBackup = await this.backupStorage(backupId)
      
      // 3. Configuration Backup
      const configBackup = await this.backupConfiguration(backupId)
      
      // 4. Create Backup Manifest
      const manifest = await this.createBackupManifest(backupId, {
        database: dbBackup,
        storage: storageBackup,
        configuration: configBackup
      })
      
      const duration = Date.now() - startTime
      
      console.log(`✅ Full backup completed in ${duration}ms`)
      
      return {
        backup_id: backupId,
        success: true,
        duration,
        size_bytes: manifest.total_size,
        components: manifest.components
      }
      
    } catch (error) {
      console.error('❌ Backup failed:', error)
      
      await this.logBackupEvent({
        backup_id: backupId,
        status: 'failed',
        error: error.message,
        duration: Date.now() - startTime
      })
      
      throw error
    }
  }
  
  private async backupDatabase(backupId: string): Promise<BackupComponent> {
    // Backup aller kritischen Tabellen
    const tables = [
      'watched_urls',
      'url_snapshots',
      'content_changes', 
      'notifications',
      'change_feedback',
      'prompt_templates',
      'url_tags',
      'push_subscriptions',
      'system_metrics',
      'audit_logs'
    ]
    
    const backupData = {}
    let totalSize = 0
    
    for (const table of tables) {
      console.log(`📋 Backing up table: ${table}`)
      
      const { data, error } = await this.supabase
        .from(table)
        .select('*')
      
      if (error) {
        throw new Error(`Failed to backup table ${table}: ${error.message}`)
      }
      
      backupData[table] = data
      totalSize += JSON.stringify(data).length
    }
    
    // Komprimiere und speichere
    const compressed = await this.compressData(backupData)
    const backupPath = `${backupId}/database.json.gz`
    
    await this.uploadToStorage(backupPath, compressed)
    
    return {
      component: 'database',
      path: backupPath,
      size_bytes: compressed.length,
      tables_count: tables.length,
      records_count: Object.values(backupData).reduce((sum, records) => sum + records.length, 0)
    }
  }
  
  private async backupStorage(backupId: string): Promise<BackupComponent> {
    // Backup von Supabase Storage (Screenshots, etc.)
    const { data: files, error } = await this.supabase.storage
      .from('screenshots')
      .list('', { limit: 10000 })
    
    if (error) {
      throw new Error(`Failed to list storage files: ${error.message}`)
    }
    
    let totalSize = 0
    const backedUpFiles = []
    
    for (const file of files || []) {
      const { data: fileData, error: downloadError } = await this.supabase.storage
        .from('screenshots')
        .download(file.name)
      
      if (downloadError) {
        console.warn(`⚠️ Failed to backup file ${file.name}:`, downloadError)
        continue
      }
      
      const backupPath = `${backupId}/storage/${file.name}`
      await this.uploadToStorage(backupPath, fileData)
      
      totalSize += file.metadata?.size || 0
      backedUpFiles.push(file.name)
    }
    
    return {
      component: 'storage',
      path: `${backupId}/storage/`,
      size_bytes: totalSize,
      files_count: backedUpFiles.length
    }
  }
  
  private async backupConfiguration(backupId: string): Promise<BackupComponent> {
    const config = {
      environment_variables: this.getBackupSafeEnvVars(),
      supabase_schema: await this.getSchemaDefinition(),
      netlify_config: await this.getNetlifyConfig(),
      deployment_config: await this.getDeploymentConfig(),
      backup_timestamp: new Date().toISOString(),
      backup_version: '1.0'
    }
    
    const configData = JSON.stringify(config, null, 2)
    const backupPath = `${backupId}/configuration.json`
    
    await this.uploadToStorage(backupPath, Buffer.from(configData))
    
    return {
      component: 'configuration',
      path: backupPath,
      size_bytes: configData.length
    }
  }
  
  async restoreFromBackup(backupId: string, options: RestoreOptions = {}): Promise<RestoreResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🔄 Starting restore from backup: ${backupId}`)
      
      // 1. Validiere Backup
      const manifest = await this.validateBackup(backupId)
      
      // 2. Pre-Restore Checks
      await this.performPreRestoreChecks(options)
      
      // 3. Restore Database
      if (options.restore_database !== false) {
        await this.restoreDatabase(backupId, options)
      }
      
      // 4. Restore Storage
      if (options.restore_storage !== false) {
        await this.restoreStorage(backupId, options)
      }
      
      // 5. Restore Configuration
      if (options.restore_configuration !== false) {
        await this.restoreConfiguration(backupId, options)
      }
      
      // 6. Post-Restore Validation
      await this.performPostRestoreValidation()
      
      const duration = Date.now() - startTime
      
      console.log(`✅ Restore completed in ${duration}ms`)
      
      return {
        backup_id: backupId,
        success: true,
        duration,
        components_restored: Object.keys(manifest.components)
      }
      
    } catch (error) {
      console.error('❌ Restore failed:', error)
      
      // Rollback if possible
      if (options.auto_rollback !== false) {
        await this.performRollback(backupId)
      }
      
      throw error
    }
  }
  
  private async restoreDatabase(backupId: string, options: RestoreOptions): Promise<void> {
    console.log('📋 Restoring database...')
    
    // Download and decompress backup
    const backupPath = `${backupId}/database.json.gz`
    const compressedData = await this.downloadFromStorage(backupPath)
    const backupData = await this.decompressData(compressedData)
    
    // Determine restore strategy
    const strategy = options.restore_strategy || 'replace'
    
    if (strategy === 'replace') {
      await this.replaceDataStrategy(backupData, options)
    } else if (strategy === 'merge') {
      await this.mergeDataStrategy(backupData, options)
    } else if (strategy === 'point_in_time') {
      await this.pointInTimeRestoreStrategy(backupData, options)
    }
  }
  
  private async replaceDataStrategy(backupData: any, options: RestoreOptions): Promise<void> {
    // GEFÄHRLICH: Vollständige Datenersetzung
    const tables = Object.keys(backupData)
    
    for (const table of tables) {
      if (options.exclude_tables?.includes(table)) {
        console.log(`⏭️ Skipping table: ${table}`)
        continue
      }
      
      console.log(`🔄 Replacing data in table: ${table}`)
      
      // Backup current data first
      await this.createTableSnapshot(table)
      
      // Clear table
      await this.supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      
      // Insert backup data in batches
      const batchSize = 1000
      const records = backupData[table]
      
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize)
        
        const { error } = await this.supabase
          .from(table)
          .insert(batch)
        
        if (error) {
          throw new Error(`Failed to restore ${table} batch ${i}: ${error.message}`)
        }
      }
      
      console.log(`✅ Restored ${records.length} records to ${table}`)
    }
  }
  
  async createIncrementalBackup(lastBackupId?: string): Promise<BackupResult> {
    const backupId = `incremental_${Date.now()}`
    
    // Bestimme Änderungen seit letztem Backup
    const lastBackupTime = lastBackupId ? 
      await this.getBackupTimestamp(lastBackupId) : 
      new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h fallback
    
    const changes = await this.getDataChangesSince(lastBackupTime)
    
    if (changes.total_changes === 0) {
      console.log('ℹ️ No changes detected, skipping incremental backup')
      return { backup_id: backupId, success: true, duration: 0, size_bytes: 0 }
    }
    
    // Backup nur geänderte Daten
    const incrementalData = await this.extractChangedData(changes)
    const compressed = await this.compressData(incrementalData)
    
    await this.uploadToStorage(`${backupId}/incremental.json.gz`, compressed)
    
    return {
      backup_id: backupId,
      success: true,
      duration: 0,
      size_bytes: compressed.length,
      incremental: true,
      base_backup: lastBackupId,
      changes_count: changes.total_changes
    }
  }
  
  async scheduleBackups(): Promise<void> {
    // Setup automated backup schedule
    const schedules = [
      {
        type: 'full',
        frequency: 'daily',
        time: '02:00',
        retention_days: 30
      },
      {
        type: 'incremental',
        frequency: 'hourly',
        retention_days: 7
      },
      {
        type: 'critical',
        trigger: 'before_deployment',
        retention_days: 90
      }
    ]
    
    for (const schedule of schedules) {
      await this.registerBackupSchedule(schedule)
    }
  }
}

interface BackupResult {
  backup_id: string
  success: boolean
  duration: number
  size_bytes: number
  components?: any
  incremental?: boolean
  base_backup?: string
  changes_count?: number
}

interface BackupComponent {
  component: string
  path: string
  size_bytes: number
  [key: string]: any
}

interface RestoreOptions {
  restore_database?: boolean
  restore_storage?: boolean
  restore_configuration?: boolean
  restore_strategy?: 'replace' | 'merge' | 'point_in_time'
  exclude_tables?: string[]
  auto_rollback?: boolean
  dry_run?: boolean
}

interface RestoreResult {
  backup_id: string
  success: boolean
  duration: number
  components_restored: string[]
}
```

### Disaster Recovery Plan

```typescript
// src/utils/disaster-recovery.ts
class DisasterRecoveryManager {
  private recoveryPlan: RecoveryPlan = {
    rto: 4 * 60 * 60, // 4 hours Recovery Time Objective
    rpo: 1 * 60 * 60, // 1 hour Recovery Point Objective
    priority_services: ['url_monitoring', 'notifications', 'user_access'],
    recovery_stages: [
      {
        stage: 'immediate',
        services: ['url_monitoring'],
        max_duration: 30 * 60 // 30 minutes
      },
      {
        stage: 'priority',
        services: ['notifications', 'user_access'],
        max_duration: 2 * 60 * 60 // 2 hours
      },
      {
        stage: 'full',
        services: ['analytics', 'reporting', 'optimization'],
        max_duration: 4 * 60 * 60 // 4 hours
      }
    ]
  }
  
  async executeDisasterRecovery(incident: DisasterIncident): Promise<RecoveryResult> {
    const recoveryId = `recovery_${Date.now()}`
    const startTime = Date.now()
    
    try {
      console.log(`🚨 Starting disaster recovery for incident: ${incident.type}`)
      
      // 1. Assess Damage
      const damage = await this.assessDamage(incident)
      
      // 2. Determine Recovery Strategy
      const strategy = this.determineRecoveryStrategy(damage)
      
      // 3. Execute Recovery Stages
      const results = []
      for (const stage of this.recoveryPlan.recovery_stages) {
        const stageResult = await this.executeRecoveryStage(stage, strategy)
        results.push(stageResult)
        
        if (!stageResult.success) {
          throw new Error(`Recovery stage ${stage.stage} failed: ${stageResult.error}`)
        }
      }
      
      // 4. Validate Recovery
      await this.validateRecovery()
      
      // 5. Post-Recovery Actions
      await this.executePostRecoveryActions(incident, results)
      
      const duration = Date.now() - startTime
      
      return {
        recovery_id: recoveryId,
        incident,
        success: true,
        duration,
        stages_completed: results.length,
        rto_met: duration <= this.recoveryPlan.rto * 1000,
        services_restored: results.flatMap(r => r.services_restored)
      }
      
    } catch (error) {
      console.error('❌ Disaster recovery failed:', error)
      
      await this.escalateRecovery(incident, error)
      
      throw error
    }
  }
  
  private async assessDamage(incident: DisasterIncident): Promise<DamageAssessment> {
    const assessment: DamageAssessment = {
      affected_services: [],
      data_integrity: 'unknown',
      severity: incident.severity,
      estimated_downtime: 0,
      recovery_complexity: 'medium'
    }
    
    // Check each service component
    const checks = [
      { service: 'database', check: this.checkDatabaseIntegrity },
      { service: 'storage', check: this.checkStorageIntegrity },
      { service: 'agents', check: this.checkAgentsStatus },
      { service: 'apis', check: this.checkExternalAPIs },
      { service: 'network', check: this.checkNetworkConnectivity }
    ]
    
    for (const { service, check } of checks) {
      try {
        const result = await check()
        if (!result.healthy) {
          assessment.affected_services.push({
            service,
            status: result.status,
            issues: result.issues
          })
        }
      } catch (error) {
        assessment.affected_services.push({
          service,
          status: 'critical',
          issues: [error.message]
        })
      }
    }
    
    // Determine overall data integrity
    if (assessment.affected_services.some(s => s.service === 'database' && s.status === 'critical')) {
      assessment.data_integrity = 'compromised'
      assessment.recovery_complexity = 'high'
    } else if (assessment.affected_services.length > 0) {
      assessment.data_integrity = 'partial'
      assessment.recovery_complexity = 'medium'
    } else {
      assessment.data_integrity = 'intact'
      assessment.recovery_complexity = 'low'
    }
    
    return assessment
  }
  
  private determineRecoveryStrategy(damage: DamageAssessment): RecoveryStrategy {
    if (damage.data_integrity === 'compromised') {
      return {
        type: 'full_restore',
        backup_source: 'latest_full_backup',
        data_loss_acceptable: true,
        parallel_recovery: false
      }
    } else if (damage.affected_services.length > 2) {
      return {
        type: 'service_restart',
        backup_source: 'incremental_backup',
        data_loss_acceptable: false,
        parallel_recovery: true
      }
    } else {
      return {
        type: 'targeted_repair',
        backup_source: 'none',
        data_loss_acceptable: false,
        parallel_recovery: true
      }
    }
  }
  
  private async executeRecoveryStage(stage: RecoveryStage, strategy: RecoveryStrategy): Promise<StageResult> {
    console.log(`🔄 Executing recovery stage: ${stage.stage}`)
    
    const stageStartTime = Date.now()
    const restoredServices = []
    
    for (const service of stage.services) {
      try {
        await this.restoreService(service, strategy)
        restoredServices.push(service)
        console.log(`✅ Service restored: ${service}`)
      } catch (error) {
        console.error(`❌ Failed to restore service ${service}:`, error)
        
        if (this.recoveryPlan.priority_services.includes(service)) {
          // Critical service failure - abort stage
          return {
            stage: stage.stage,
            success: false,
            duration: Date.now() - stageStartTime,
            services_restored: restoredServices,
            error: `Critical service ${service} restoration failed: ${error.message}`
          }
        }
      }
    }
    
    const duration = Date.now() - stageStartTime
    
    return {
      stage: stage.stage,
      success: true,
      duration,
      services_restored: restoredServices,
      within_target: duration <= stage.max_duration * 1000
    }
  }
  
  private async restoreService(service: string, strategy: RecoveryStrategy): Promise<void> {
    switch (service) {
      case 'url_monitoring':
        await this.restoreURLMonitoring(strategy)
        break
      case 'notifications':
        await this.restoreNotifications(strategy)
        break
      case 'user_access':
        await this.restoreUserAccess(strategy)
        break
      case 'analytics':
        await this.restoreAnalytics(strategy)
        break
      default:
        throw new Error(`Unknown service: ${service}`)
    }
  }
  
  private async restoreURLMonitoring(strategy: RecoveryStrategy): Promise<void> {
    // 1. Restore critical URL configurations
    if (strategy.backup_source !== 'none') {
      await this.restoreFromBackup(['watched_urls'], strategy.backup_source)
    }
    
    // 2. Restart Observer Agent
    await this.restartAgent('observer')
    
    // 3. Validate monitoring is working
    await this.validateURLMonitoring()
  }
  
  private async restoreNotifications(strategy: RecoveryStrategy): Promise<void> {
    // 1. Restore notification configurations
    if (strategy.backup_source !== 'none') {
      await this.restoreFromBackup(['push_subscriptions'], strategy.backup_source)
    }
    
    // 2. Restart Notifier Agent
    await this.restartAgent('notifier')
    
    // 3. Test notification delivery
    await this.testNotificationDelivery()
  }
  
  async createRecoveryRunbooks(): Promise<void> {
    const runbooks = [
      {
        scenario: 'database_corruption',
        steps: [
          'Stop all agents to prevent further corruption',
          'Assess extent of corruption using integrity checks',
          'Restore from latest clean backup',
          'Replay incremental backups if available',
          'Restart agents in staged manner',
          'Validate data integrity',
          'Resume normal operations'
        ],
        estimated_time: '2-4 hours',
        prerequisites: ['Valid backup within RPO', 'Database admin access']
      },
      {
        scenario: 'agent_failure',
        steps: [
          'Identify which agents are affected',
          'Check for underlying infrastructure issues',
          'Restart failed agents',
          'If restart fails, redeploy agents',
          'Validate agent functionality',
          'Clear any backlogged tasks'
        ],
        estimated_time: '30 minutes - 2 hours',
        prerequisites: ['Deployment access', 'Monitoring access']
      },
      {
        scenario: 'external_api_outage',
        steps: [
          'Identify affected external APIs',
          'Switch to backup APIs if available',
          'Implement graceful degradation',
          'Queue operations for retry',
          'Monitor API status for recovery',
          'Resume normal operations when APIs recover'
        ],
        estimated_time: 'Depends on external provider',
        prerequisites: ['API status monitoring', 'Backup API configurations']
      }
    ]
    
    await this.saveRunbooks(runbooks)
  }
}

interface DisasterIncident {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  detected_at: string
  affected_components: string[]
}

interface RecoveryPlan {
  rto: number // seconds
  rpo: number // seconds
  priority_services: string[]
  recovery_stages: RecoveryStage[]
}

interface RecoveryStage {
  stage: string
  services: string[]
  max_duration: number // seconds
}

interface DamageAssessment {
  affected_services: {
    service: string
    status: string
    issues: string[]
  }[]
  data_integrity: 'intact' | 'partial' | 'compromised' | 'unknown'
  severity: string
  estimated_downtime: number
  recovery_complexity: 'low' | 'medium' | 'high'
}

interface RecoveryStrategy {
  type: 'full_restore' | 'service_restart' | 'targeted_repair'
  backup_source: string
  data_loss_acceptable: boolean
  parallel_recovery: boolean
}

interface StageResult {
  stage: string
  success: boolean
  duration: number
  services_restored: string[]
  within_target?: boolean
  error?: string
}

interface RecoveryResult {
  recovery_id: string
  incident: DisasterIncident
  success: boolean
  duration: number
  stages_completed: number
  rto_met: boolean
  services_restored: string[]
}
```

## 🚀 Deployment & CI/CD Pipeline

### Comprehensive Deployment Strategy

```typescript
// .github/workflows/deploy.yml
name: URL Watcher Deployment Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
  NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Setup test database
        run: |
          npm run db:setup:test
          npm run db:migrate:test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
      
      - name: Run linting
        run: npm run lint
      
      - name: Run type checking
        run: npm run type-check
      
      - name: Run unit tests
        run: npm run test:unit -- --coverage
        env:
          NODE_ENV: test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          NODE_ENV: test
          SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_TEST_KEY }}
      
      - name: Upload test coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  security-scan:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run security audit
        run: npm audit --audit-level high
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Run SAST scanning
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript
      
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v2

  build:
    runs-on: ubuntu-latest
    needs: [test, security-scan]
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          REACT_APP_SUPABASE_URL: ${{ secrets.REACT_APP_SUPABASE_URL }}
          REACT_APP_SUPABASE_ANON_KEY: ${{ secrets.REACT_APP_SUPABASE_ANON_KEY }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
      
      - name: Deploy to staging
        run: |
          npm run deploy:staging
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_STAGING_SITE_ID }}
      
      - name: Run smoke tests
        run: npm run test:smoke
        env:
          STAGING_URL: ${{ secrets.STAGING_URL }}
      
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
      
      - name: Create backup before deployment
        run: npm run backup:create
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      
      - name: Deploy database migrations
        run: npx supabase db push --project-ref ${{ env.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Deploy Edge Functions
        run: |
          npx supabase functions deploy url-observer --project-ref ${{ env.SUPABASE_PROJECT_ID }}
          npx supabase functions deploy change-analyzer --project-ref ${{ env.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Deploy to production
        run: npm run deploy:production
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ env.NETLIFY_SITE_ID }}
      
      - name: Run health checks
        run: npm run health:check
        env:
          PRODUCTION_URL: ${{ secrets.PRODUCTION_URL }}
      
      - name: Update monitoring
        run: npm run monitoring:update
        env:
          DATADOG_API_KEY: ${{ secrets.DATADOG_API_KEY }}
      
      - name: Notify successful deployment
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: '🚀 URL Watcher deployed to production successfully!'
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  post-deploy-validation:
    runs-on: ubuntu-latest
    needs: [deploy-production]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Wait for deployment stabilization
        run: sleep 60
      
      - name: Run comprehensive health checks
        run: |
          curl -f ${{ secrets.PRODUCTION_URL }}/health || exit 1
          curl -f ${{ secrets.PRODUCTION_URL }}/api/health/agents || exit 1
      
      - name: Run end-to-end tests
        run: npm run test:e2e:production
        env:
          E2E_BASE_URL: ${{ secrets.PRODUCTION_URL }}
          E2E_TEST_USER: ${{ secrets.E2E_TEST_USER }}
          E2E_TEST_PASSWORD: ${{ secrets.E2E_TEST_PASSWORD }}
      
      - name: Validate monitoring alerts
        run: npm run monitoring:validate
        env:
          MONITORING_API_KEY: ${{ secrets.MONITORING_API_KEY }}
      
      - name: Create deployment tag
        run: |
          git tag "deploy-$(date +%Y%m%d-%H%M%S)"
          git push origin --tags
```

### Blue-Green Deployment Strategy

```typescript
// scripts/blue-green-deploy.ts
class BlueGreenDeployment {
  private currentEnvironment: 'blue' | 'green' = 'blue'
  private environments = {
    blue: {
      netlify_site_id: process.env.NETLIFY_BLUE_SITE_ID!,
      supabase_project: process.env.SUPABASE_BLUE_PROJECT!,
      domain: process.env.BLUE_DOMAIN!
    },
    green: {
      netlify_site_id: process.env.NETLIFY_GREEN_SITE_ID!,
      supabase_project: process.env.SUPABASE_GREEN_PROJECT!,
      domain: process.env.GREEN_DOMAIN!
    }
  }
  
  async deployToInactive(): Promise<DeploymentResult> {
    const inactiveEnv = this.currentEnvironment === 'blue' ? 'green' : 'blue'
    const deployment = this.environments[inactiveEnv]
    
    console.log(`🚀 Deploying to ${inactiveEnv} environment`)
    
    try {
      // 1. Deploy application
      await this.deployApplication(deployment)
      
      // 2. Deploy database changes
      await this.deployDatabase(deployment)
      
      // 3. Deploy Edge Functions
      await this.deployEdgeFunctions(deployment)
      
      // 4. Run smoke tests
      const smokeTestResults = await this.runSmokeTests(deployment.domain)
      
      if (!smokeTestResults.success) {
        throw new Error(`Smoke tests failed: ${smokeTestResults.errors.join(', ')}`)
      }
      
      // 5. Run load tests
      const loadTestResults = await this.runLoadTests(deployment.domain)
      
      return {
        environment: inactiveEnv,
        success: true,
        deployment_id: `deploy_${Date.now()}`,
        smoke_tests: smokeTestResults,
        load_tests: loadTestResults,
        ready_for_switch: true
      }
      
    } catch (error) {
      console.error(`❌ Deployment to ${inactiveEnv} failed:`, error)
      
      // Rollback inactive environment
      await this.rollbackEnvironment(inactiveEnv)
      
      throw error
    }
  }
  
  async switchTraffic(): Promise<SwitchResult> {
    const inactiveEnv = this.currentEnvironment === 'blue' ? 'green' : 'blue'
    
    console.log(`🔄 Switching traffic from ${this.currentEnvironment} to ${inactiveEnv}`)
    
    try {
      // 1. Health check before switch
      const healthCheck = await this.healthCheckEnvironment(inactiveEnv)
      if (!healthCheck.healthy) {
        throw new Error(`Target environment ${inactiveEnv} is not healthy`)
      }
      
      // 2. Gradual traffic switch (canary deployment)
      await this.gradualTrafficSwitch(inactiveEnv)
      
      // 3. Monitor for issues during switch
      const switchMonitoring = await this.monitorTrafficSwitch(inactiveEnv)
      
      if (switchMonitoring.error_rate > 0.05) {
        // High error rate - abort switch
        await this.rollbackTrafficSwitch()
        throw new Error(`High error rate detected during switch: ${switchMonitoring.error_rate}`)
      }
      
      // 4. Complete the switch
      await this.completeTrafficSwitch(inactiveEnv)
      
      // 5. Update current environment
      this.currentEnvironment = inactiveEnv
      
      console.log(`✅ Traffic successfully switched to ${inactiveEnv}`)
      
      return {
        from: this.currentEnvironment === 'blue' ? 'green' : 'blue',
        to: inactiveEnv,
        success: true,
        switch_duration: switchMonitoring.duration,
        error_rate: switchMonitoring.error_rate
      }
      
    } catch (error) {
      console.error('❌ Traffic switch failed:', error)
      
      // Attempt to rollback
      await this.rollbackTrafficSwitch()
      
      throw error
    }
  }
  
  private async gradualTrafficSwitch(targetEnv: 'blue' | 'green'): Promise<void> {
    const trafficPercentages = [10, 25, 50, 75, 90, 100]
    
    for (const percentage of trafficPercentages) {
      console.log(`🔄 Switching ${percentage}% traffic to ${targetEnv}`)
      
      await this.updateLoadBalancer(targetEnv, percentage)
      
      // Wait and monitor
      await new Promise(resolve => setTimeout(resolve, 30000)) // 30 seconds
      
      const metrics = await this.getEnvironmentMetrics(targetEnv)
      
      if (metrics.error_rate > 0.02 || metrics.response_time > 5000) {
        throw new Error(`Environment ${targetEnv} showing degraded performance at ${percentage}% traffic`)
      }
    }
  }
  
  private async runSmokeTests(domain: string): Promise<SmokeTestResult> {
    const tests = [
      { name: 'health_endpoint', url: `https://${domain}/health` },
      { name: 'api_health', url: `https://${domain}/api/health` },
      { name: 'dashboard_load', url: `https://${domain}/dashboard` },
      { name: 'agent_status', url: `https://${domain}/api/agents/status` }
    ]
    
    const results = []
    const errors = []
    
    for (const test of tests) {
      try {
        const response = await fetch(test.url, {
          timeout: 10000,
          headers: { 'User-Agent': 'BlueGreenDeployment/SmokeTest' }
        })
        
        if (!response.ok) {
          errors.push(`${test.name}: HTTP ${response.status}`)
        } else {
          results.push({ test: test.name, status: 'passed', response_time: 0 })
        }
      } catch (error) {
        errors.push(`${test.name}: ${error.message}`)
      }
    }
    
    return {
      success: errors.length === 0,
      tests_passed: results.length,
      tests_failed: errors.length,
      errors
    }
  }
  
  async createDeploymentPlan(version: string): Promise<DeploymentPlan> {
    return {
      version,
      target_environment: this.currentEnvironment === 'blue' ? 'green' : 'blue',
      steps: [
        {
          step: 'pre_deployment_backup',
          description: 'Create backup before deployment',
          estimated_duration: 300 // 5 minutes
        },
        {
          step: 'deploy_application',
          description: 'Deploy new application version',
          estimated_duration: 600 // 10 minutes
        },
        {
          step: 'deploy_database',
          description: 'Run database migrations',
          estimated_duration: 180 // 3 minutes
        },
        {
          step: 'deploy_functions',
          description: 'Deploy Edge Functions',
          estimated_duration: 120 // 2 minutes
        },
        {
          step: 'smoke_tests',
          description: 'Run smoke tests',
          estimated_duration: 300 // 5 minutes
        },
        {
          step: 'load_tests',
          description: 'Run load tests',
          estimated_duration: 600 // 10 minutes
        },
        {
          step: 'traffic_switch',
          description: 'Gradually switch traffic',
          estimated_duration: 900 // 15 minutes
        }
      ],
      estimated_total_duration: 3000, // 50 minutes
      rollback_plan: {
        automated: true,
        trigger_conditions: ['error_rate > 5%', 'response_time > 10s'],
        max_rollback_time: 300 // 5 minutes
      }
    }
  }
}

interface DeploymentResult {
  environment: string
  success: boolean
  deployment_id: string
  smoke_tests: SmokeTestResult
  load_tests: any
  ready_for_switch: boolean
}

interface SwitchResult {
  from: string
  to: string
  success: boolean
  switch_duration: number
  error_rate: number
}

interface SmokeTestResult {
  success: boolean
  tests_passed: number
  tests_failed: number
  errors: string[]
}

interface DeploymentPlan {
  version: string
  target_environment: string
  steps: DeploymentStep[]
  estimated_total_duration: number
  rollback_plan: RollbackPlan
}

interface DeploymentStep {
  step: string
  description: string
  estimated_duration: number
}

interface RollbackPlan {
  automated: boolean
  trigger_conditions: string[]
  max_rollback_time: number
}
```

### Feature Flags & Progressive Rollout

```typescript
// src/utils/feature-flags.ts
class FeatureFlagManager {
  private flags: Map<string, FeatureFlag> = new Map()
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  async initializeFlags(): Promise<void> {
    // Load feature flags from database
    const { data: flagsData } = await this.supabase
      .from('feature_flags')
      .select('*')
      .eq('is_active', true)
    
    for (const flagData of flagsData || []) {
      this.flags.set(flagData.flag_name, {
        name: flagData.flag_name,
        enabled: flagData.enabled,
        rollout_percentage: flagData.rollout_percentage,
        conditions: flagData.conditions || {},
        created_at: flagData.created_at,
        updated_at: flagData.updated_at
      })
    }
    
    console.log(`📋 Loaded ${this.flags.size} feature flags`)
  }
  
  isEnabled(flagName: string, context: FlagContext = {}): boolean {
    const flag = this.flags.get(flagName)
    
    if (!flag) {
      console.warn(`⚠️ Feature flag ${flagName} not found, defaulting to false`)
      return false
    }
    
    if (!flag.enabled) {
      return false
    }
    
    // Check rollout percentage
    if (flag.rollout_percentage < 100) {
      const userHash = this.hashUser(context.user_id || 'anonymous')
      const userPercentile = userHash % 100
      
      if (userPercentile >= flag.rollout_percentage) {
        return false
      }
    }
    
    // Check additional conditions
    return this.evaluateConditions(flag.conditions, context)
  }
  
  async createFlag(flag: CreateFlagRequest): Promise<void> {
    const { error } = await this.supabase
      .from('feature_flags')
      .insert({
        flag_name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        rollout_percentage: flag.rollout_percentage,
        conditions: flag.conditions,
        created_by: flag.created_by
      })
    
    if (error) {
      throw new Error(`Failed to create feature flag: ${error.message}`)
    }
    
    // Update local cache
    await this.initializeFlags()
  }
  
  async updateRollout(flagName: string, percentage: number): Promise<void> {
    const { error } = await this.supabase
      .from('feature_flags')
      .update({ 
        rollout_percentage: percentage,
        updated_at: new Date().toISOString()
      })
      .eq('flag_name', flagName)
    
    if (error) {
      throw new Error(`Failed to update rollout: ${error.message}`)
    }
    
    // Update local cache
    const flag = this.flags.get(flagName)
    if (flag) {
      flag.rollout_percentage = percentage
    }
    
    console.log(`🎚️ Updated rollout for ${flagName} to ${percentage}%`)
  }
  
  async progressiveRollout(flagName: string, schedule: RolloutSchedule): Promise<void> {
    console.log(`🚀 Starting progressive rollout for ${flagName}`)
    
    for (const stage of schedule.stages) {
      console.log(`📈 Rolling out ${flagName} to ${stage.percentage}% of users`)
      
      await this.updateRollout(flagName, stage.percentage)
      
      // Monitor metrics during rollout
      await this.monitorRollout(flagName, stage)
      
      // Wait before next stage
      if (stage.duration_minutes > 0) {
        console.log(`⏳ Waiting ${stage.duration_minutes} minutes before next stage`)
        await new Promise(resolve => setTimeout(resolve, stage.duration_minutes * 60 * 1000))
      }
    }
    
    console.log(`✅ Progressive rollout completed for ${flagName}`)
  }
  
  private async monitorRollout(flagName: string, stage: RolloutStage): Promise<void> {
    const monitoringDuration = Math.min(stage.duration_minutes * 60 * 1000, 10 * 60 * 1000) // Max 10 minutes
    const startTime = Date.now()
    
    while (Date.now() - startTime < monitoringDuration) {
      const metrics = await this.getRolloutMetrics(flagName)
      
      // Check for issues
      if (metrics.error_rate > stage.max_error_rate) {
        console.error(`❌ High error rate detected for ${flagName}: ${metrics.error_rate}`)
        await this.pauseRollout(flagName)
        throw new Error(`Rollout paused due to high error rate: ${metrics.error_rate}`)
      }
      
      if (metrics.performance_degradation > stage.max_performance_degradation) {
        console.error(`❌ Performance degradation detected for ${flagName}: ${metrics.performance_degradation}`)
        await this.pauseRollout(flagName)
        throw new Error(`Rollout paused due to performance degradation: ${metrics.performance_degradation}`)
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 30000)) // 30 seconds
    }
  }
  
  private evaluateConditions(conditions: any, context: FlagContext): boolean {
    for (const [key, value] of Object.entries(conditions)) {
      switch (key) {
        case 'user_type':
          if (context.user_type !== value) return false
          break
        case 'min_version':
          if (!context.app_version || this.compareVersions(context.app_version, value as string) < 0) {
            return false
          }
          break
        case 'environment':
          if (process.env.NODE_ENV !== value) return false
          break
        case 'time_range':
          if (!this.isInTimeRange(value as TimeRange)) return false
          break
        default:
          console.warn(`Unknown condition: ${key}`)
      }
    }
    
    return true
  }
  
  private hashUser(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}

// Feature Flag Schema
/*
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  conditions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feature_flags_name_active ON feature_flags(flag_name) WHERE is_active = true;
CREATE INDEX idx_feature_flags_enabled ON feature_flags(enabled) WHERE is_active = true;
*/

interface FeatureFlag {
  name: string
  enabled: boolean
  rollout_percentage: number
  conditions: any
  created_at: string
  updated_at: string
}

interface FlagContext {
  user_id?: string
  user_type?: string
  app_version?: string
  environment?: string
}

interface CreateFlagRequest {
  name: string
  description: string
  enabled: boolean
  rollout_percentage: number
  conditions: any
  created_by: string
}

interface RolloutSchedule {
  stages: RolloutStage[]
}

interface RolloutStage {
  percentage: number
  duration_minutes: number
  max_error_rate: number
  max_performance_degradation: number
}

interface TimeRange {
  start_time: string
  end_time: string
  timezone: string
}
```

## 🔧 Troubleshooting & Debugging

### Comprehensive Debugging System

```typescript
// src/utils/debug-manager.ts
class DebugManager {
  private supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  private debugSessions: Map<string, DebugSession> = new Map()
  
  async startDebugSession(sessionId: string, config: DebugConfig): Promise<DebugSession> {
    const session: DebugSession = {
      id: sessionId,
      started_at: new Date().toISOString(),
      config,
      events: [],
      traces: [],
      metrics: new Map(),
      status: 'active'
    }
    
    this.debugSessions.set(sessionId, session)
    
    console.log(`🐛 Debug session started: ${sessionId}`)
    return session
  }
  
  async debugURLProcessing(urlId: string, options: URLDebugOptions = {}): Promise<URLDebugResult> {
    const debugId = `url_debug_${Date.now()}`
    const session = await this.startDebugSession(debugId, {
      type: 'url_processing',
      target: urlId,
      verbosity: options.verbosity || 'detailed'
    })
    
    try {
      // 1. URL Configuration Check
      const urlConfig = await this.debugURLConfiguration(urlId, session)
      
      // 2. Network Connectivity Check
      const connectivity = await this.debugNetworkConnectivity(urlConfig.url, session)
      
      // 3. Content Extraction Debug
      const extraction = await this.debugContentExtraction(urlConfig, session)
      
      // 4. Change Detection Debug
      const changeDetection = await this.debugChangeDetection(urlId, session)
      
      // 5. LLM Analysis Debug
      const llmAnalysis = await this.debugLLMAnalysis(urlId, session)
      
      return {
        debug_id: debugId,
        url_id: urlId,
        success: true,
        components: {
          url_config: urlConfig,
          connectivity,
          extraction,
          change_detection: changeDetection,
          llm_analysis: llmAnalysis
        },
        recommendations: this.generateRecommendations(session),
        session_logs: session.events
      }
      
    } catch (error) {
      this.logDebugEvent(session, 'error', `Debug session failed: ${error.message}`, { error })
      
      return {
        debug_id: debugId,
        url_id: urlId,
        success: false,
        error: error.message,
        session_logs: session.events
      }
    } finally {
      session.status = 'completed'
      session.completed_at = new Date().toISOString()
    }
  }
  
  private async debugURLConfiguration(urlId: string, session: DebugSession): Promise<URLConfigDebug> {
    this.logDebugEvent(session, 'info', 'Checking URL configuration')
    
    const { data: url, error } = await this.supabase
      .from('watched_urls')
      .select('*')
      .eq('id', urlId)
      .single()
    
    if (error || !url) {
      throw new Error(`URL not found: ${urlId}`)
    }
    
    const issues = []
    const warnings = []
    
    // Validate URL format
    try {
      new URL(url.url)
    } catch {
      issues.push('Invalid URL format')
    }
    
    // Check monitoring instructions
    if (!url.monitoring_instructions || url.monitoring_instructions.length < 10) {
      warnings.push('Monitoring instructions are very short - consider adding more detail')
    }
    
    // Check error rate
    const errorRate = url.check_count > 0 ? url.error_count / url.check_count : 0
    if (errorRate > 0.1) {
      issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`)
    }
    
    // Check last successful check
    const lastCheck = url.last_checked ? new Date(url.last_checked) : null
    const hoursSinceLastCheck = lastCheck ? (Date.now() - lastCheck.getTime()) / (1000 * 60 * 60) : Infinity
    
    if (hoursSinceLastCheck > 24) {
      issues.push('URL has not been successfully checked in over 24 hours')
    }
    
    this.logDebugEvent(session, 'info', `URL configuration checked: ${issues.length} issues, ${warnings.length} warnings`)
    
    return {
      url_config: url,
      validation: {
        valid_url: issues.length === 0,
        issues,
        warnings
      },
      statistics: {
        total_checks: url.check_count,
        error_count: url.error_count,
        error_rate: errorRate,
        hours_since_last_check: hoursSinceLastCheck
      }
    }
  }
  
  private async debugNetworkConnectivity(url: string, session: DebugSession): Promise<ConnectivityDebug> {
    this.logDebugEvent(session, 'info', `Testing network connectivity to ${url}`)
    
    const startTime = Date.now()
    const results = []
    
    try {
      // DNS Resolution
      const dnsStart = Date.now()
      const dnsResult = await this.resolveDNS(url)
      const dnsDuration = Date.now() - dnsStart
      
      results.push({
        test: 'dns_resolution',
        success: dnsResult.success,
        duration: dnsDuration,
        details: dnsResult
      })
      
      // HTTP Connection
      const httpStart = Date.now()
      const httpResult = await this.testHTTPConnection(url)
      const httpDuration = Date.now() - httpStart
      
      results.push({
        test: 'http_connection',
        success: httpResult.success,
        duration: httpDuration,
        details: httpResult
      })
      
      // SSL Certificate Check
      if (url.startsWith('https://')) {
        const sslStart = Date.now()
        const sslResult = await this.testSSLCertificate(url)
        const sslDuration = Date.now() - sslStart
        
        results.push({
          test: 'ssl_certificate',
          success: sslResult.success,
          duration: sslDuration,
          details: sslResult
        })
      }
      
      // Response Headers Check
      const headersStart = Date.now()
      const headersResult = await this.checkResponseHeaders(url)
      const headersDuration = Date.now() - headersStart
      
      results.push({
        test: 'response_headers',
        success: headersResult.success,
        duration: headersDuration,
        details: headersResult
      })
      
      const totalDuration = Date.now() - startTime
      const allSuccessful = results.every(r => r.success)
      
      this.logDebugEvent(session, 'info', `Connectivity tests completed: ${results.length} tests, ${allSuccessful ? 'all passed' : 'some failed'}`)
      
      return {
        overall_success: allSuccessful,
        total_duration: totalDuration,
        tests: results,
        recommendations: this.generateConnectivityRecommendations(results)
      }
      
    } catch (error) {
      this.logDebugEvent(session, 'error', `Connectivity test failed: ${error.message}`)
      throw error
    }
  }
  
  private async debugContentExtraction(urlConfig: any, session: DebugSession): Promise<ExtractionDebug> {
    this.logDebugEvent(session, 'info', 'Testing content extraction')
    
    try {
      // Simulate the actual extraction process
      const mockBrowser = await this.createMockBrowser()
      const mockPage = await mockBrowser.newPage()
      
      const extractionStart = Date.now()
      
      await mockPage.goto(urlConfig.url, { waitUntil: 'domcontentloaded' })
      
      // Test different extraction strategies
      const strategies = [
        { name: 'default', selectors: [] },
        { name: 'with_custom_selectors', selectors: urlConfig.css_selectors || [] },
        { name: 'content_focused', selectors: ['main', 'article', '.content'] }
      ]
      
      const results = []
      
      for (const strategy of strategies) {
        const strategyStart = Date.now()
        
        try {
          const extracted = await this.extractWithStrategy(mockPage, strategy, urlConfig)
          const strategyDuration = Date.now() - strategyStart
          
          results.push({
            strategy: strategy.name,
            success: true,
            duration: strategyDuration,
            content_length: extracted.text?.length || 0,
            elements_found: extracted.elements || 0,
            metadata: extracted.metadata
          })
          
        } catch (error) {
          results.push({
            strategy: strategy.name,
            success: false,
            duration: Date.now() - strategyStart,
            error: error.message
          })
        }
      }
      
      await mockBrowser.close()
      
      const totalDuration = Date.now() - extractionStart
      
      this.logDebugEvent(session, 'info', `Content extraction tested: ${results.length} strategies`)
      
      return {
        total_duration: totalDuration,
        strategies: results,
        recommendations: this.generateExtractionRecommendations(results),
        best_strategy: this.findBestStrategy(results)
      }
      
    } catch (error) {
      this.logDebugEvent(session, 'error', `Content extraction debug failed: ${error.message}`)
      throw error
    }
  }
  
  async createDebugReport(sessionId: string): Promise<DebugReport> {
    const session = this.debugSessions.get(sessionId)
    
    if (!session) {
      throw new Error(`Debug session not found: ${sessionId}`)
    }
    
    const report: DebugReport = {
      session_id: sessionId,
      generated_at: new Date().toISOString(),
      config: session.config,
      duration: session.completed_at ? 
        new Date(session.completed_at).getTime() - new Date(session.started_at).getTime() : 
        Date.now() - new Date(session.started_at).getTime(),
      events: session.events,
      metrics: Object.fromEntries(session.metrics),
      summary: this.generateDebugSummary(session),
      recommendations: this.generateRecommendations(session)
    }
    
    // Save to database for historical analysis
    await this.saveDebugReport(report)
    
    return report
  }
  
  private logDebugEvent(session: DebugSession, level: string, message: string, data?: any): void {
    const event: DebugEvent = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    }
    
    session.events.push(event)
    
    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG:${session.id}] ${level.toUpperCase()}: ${message}`, data || '')
    }
  }
  
  private generateRecommendations(session: DebugSession): string[] {
    const recommendations = []
    
    // Analyze events for patterns
    const errors = session.events.filter(e => e.level === 'error')
    const warnings = session.events.filter(e => e.level === 'warn')
    
    if (errors.length > 0) {
      recommendations.push(`Found ${errors.length} errors - review error details for resolution steps`)
    }
    
    if (warnings.length > 0) {
      recommendations.push(`Found ${warnings.length} warnings - consider addressing to improve reliability`)
    }
    
    // Add specific recommendations based on debug type
    if (session.config.type === 'url_processing') {
      recommendations.push(...this.generateURLProcessingRecommendations(session))
    }
    
    return recommendations
  }
  
  async generateTroubleshootingGuide(issue: string): Promise<TroubleshootingGuide> {
    const guides = {
      'high_error_rate': {
        title: 'High Error Rate Troubleshooting',
        description: 'When a URL shows consistently high error rates',
        steps: [
          {
            step: 'Check URL accessibility',
            description: 'Verify the URL is accessible from external networks',
            commands: ['curl -I <url>', 'ping <domain>'],
            expected_result: 'HTTP 200 response and successful ping'
          },
          {
            step: 'Review monitoring settings',
            description: 'Check if monitoring frequency is too aggressive',
            commands: [],
            expected_result: 'Interval should be at least 5 minutes for most sites'
          },
          {
            step: 'Check for rate limiting',
            description: 'The target site might be blocking our requests',
            commands: [],
            expected_result: 'Look for HTTP 429 responses in logs'
          },
          {
            step: 'Review User-Agent and headers',
            description: 'Some sites block requests without proper User-Agent',
            commands: [],
            expected_result: 'Ensure realistic User-Agent string is used'
          }
        ],
        related_docs: [
          'URL Configuration Guide',
          'Error Handling Best Practices'
        ]
      },
      
      'slow_performance': {
        title: 'Slow Performance Troubleshooting',
        description: 'When URL processing is taking too long',
        steps: [
          {
            step: 'Check network latency',
            description: 'Measure network latency to target site',
            commands: ['ping <domain>', 'traceroute <domain>'],
            expected_result: 'Latency should be under 500ms'
          },
          {
            step: 'Review page complexity',
            description: 'Large or complex pages take longer to process',
            commands: [],
            expected_result: 'Pages over 5MB or with heavy JavaScript may be slow'
          },
          {
            step: 'Optimize CSS selectors',
            description: 'Complex selectors can slow down extraction',
            commands: [],
            expected_result: 'Use specific, efficient selectors'
          },
          {
            step: 'Check concurrent processing',
            description: 'Too many concurrent URLs can overwhelm resources',
            commands: [],
            expected_result: 'Reduce concurrency if memory usage is high'
          }
        ]
      },
      
      'llm_analysis_issues': {
        title: 'LLM Analysis Issues',
        description: 'When AI analysis is producing poor results',
        steps: [
          {
            step: 'Review monitoring instructions',
            description: 'Vague instructions lead to poor analysis',
            commands: [],
            expected_result: 'Instructions should be specific and detailed'
          },
          {
            step: 'Check content quality',
            description: 'Poor content extraction affects LLM analysis',
            commands: [],
            expected_result: 'Extracted text should be clean and relevant'
          },
          {
            step: 'Review recent feedback',
            description: 'User feedback helps improve accuracy',
            commands: [],
            expected_result: 'Provide feedback on incorrect analyses'
          },
          {
            step: 'Test with different models',
            description: 'Different models may work better for specific content',
            commands: [],
            expected_result: 'Try switching between GPT-4o-mini and Claude Haiku'
          }
        ]
      }
    }
    
    return guides[issue] || {
      title: 'General Troubleshooting',
      description: 'General troubleshooting steps',
      steps: [
        {
          step: 'Check system health',
          description: 'Verify all components are healthy',
          commands: ['curl /health', 'check logs'],
          expected_result: 'All components should report healthy status'
        }
      ],
      related_docs: []
    }
  }
}

// Debugging Interfaces
interface DebugSession {
  id: string
  started_at: string
  completed_at?: string
  config: DebugConfig
  events: DebugEvent[]
  traces: any[]
  metrics: Map<string, any>
  status: 'active' | 'completed' | 'failed'
}

interface DebugConfig {
  type: string
  target: string
  verbosity: 'minimal' | 'detailed' | 'verbose'
}

interface DebugEvent {
  timestamp: string
  level: string
  message: string
  data?: any
}

interface URLDebugOptions {
  verbosity?: 'minimal' | 'detailed' | 'verbose'
  include_network_trace?: boolean
  include_browser_logs?: boolean
}

interface URLDebugResult {
  debug_id: string
  url_id: string
  success: boolean
  error?: string
  components?: {
    url_config: URLConfigDebug
    connectivity: ConnectivityDebug
    extraction: ExtractionDebug
    change_detection: any
    llm_analysis: any
  }
  recommendations?: string[]
  session_logs: DebugEvent[]
}

interface URLConfigDebug {
  url_config: any
  validation: {
    valid_url: boolean
    issues: string[]
    warnings: string[]
  }
  statistics: {
    total_checks: number
    error_count: number
    error_rate: number
    hours_since_last_check: number
  }
}

interface ConnectivityDebug {
  overall_success: boolean
  total_duration: number
  tests: any[]
  recommendations: string[]
}

interface ExtractionDebug {
  total_duration: number
  strategies: any[]
  recommendations: string[]
  best_strategy: string
}

interface DebugReport {
  session_id: string
  generated_at: string
  config: DebugConfig
  duration: number
  events: DebugEvent[]
  metrics: any
  summary: string
  recommendations: string[]
}

interface TroubleshootingGuide {
  title: string
  description: string
  steps: TroubleshootingStep[]
  related_docs?: string[]
}

interface TroubleshootingStep {
  step: string
  description: string
  commands: string[]
  expected_result: string
}
```

### Interactive Debugging Dashboard

```typescript
// src/components/DebugDashboard.tsx
import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Bug, Play, Pause, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const DebugDashboard: React.FC = () => {
  const [activeSessions, setActiveSessions] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)
  const [debugLogs, setDebugLogs] = useState([])
  const [systemHealth, setSystemHealth] = useState(null)
  
  useEffect(() => {
    loadActiveSessions()
    loadSystemHealth()
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadActiveSessions()
      if (selectedSession) {
        loadSessionLogs(selectedSession.id)
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [selectedSession])
  
  const loadActiveSessions = async () => {
    const response = await fetch('/api/debug/sessions')
    const sessions = await response.json()
    setActiveSessions(sessions)
  }
  
  const loadSystemHealth = async () => {
    const response = await fetch('/api/health/detailed')
    const health = await response.json()
    setSystemHealth(health)
  }
  
  const loadSessionLogs = async (sessionId: string) => {
    const response = await fetch(`/api/debug/sessions/${sessionId}/logs`)
    const logs = await response.json()
    setDebugLogs(logs)
  }
  
  const startDebugSession = async (type: string, target: string) => {
    const response = await fetch('/api/debug/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        target,
        config: { verbosity: 'detailed' }
      })
    })
    
    const session = await response.json()
    setSelectedSession(session)
    await loadActiveSessions()
  }
  
  const downloadDebugReport = async (sessionId: string) => {
    const response = await fetch(`/api/debug/sessions/${sessionId}/report`)
    const blob = await response.blob()
    
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-report-${sessionId}.json`
    a.click()
    window.URL.revokeObjectURL(url)
  }
  
  return (
    <div className="debug-dashboard p-6">
      <div className="header mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bug className="text-red-600" />
          Debug Dashboard
        </h1>
        <p className="text-gray-600">Real-time system debugging and diagnostics</p>
      </div>
      
      {/* System Health Overview */}
      <div className="system-health mb-8">
        <h2 className="text-lg font-semibold mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {systemHealth && Object.entries(systemHealth.components).map(([component, health]) => (
            <HealthCard key={component} component={component} health={health} />
          ))}
        </div>
      </div>
      
      {/* Debug Actions */}
      <div className="debug-actions mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Debug Actions</h2>
        <div className="flex flex-wrap gap-3">
          <DebugButton 
            label="Debug URL Processing"
            onClick={() => {
              const urlId = prompt('Enter URL ID:')
              if (urlId) startDebugSession('url_processing', urlId)
            }}
          />
          <DebugButton 
            label="Debug Agent Performance"
            onClick={() => startDebugSession('agent_performance', 'all')}
          />
          <DebugButton 
            label="Debug LLM Analysis"
            onClick={() => {
              const changeId = prompt('Enter Change ID:')
              if (changeId) startDebugSession('llm_analysis', changeId)
            }}
          />
          <DebugButton 
            label="Debug Notifications"
            onClick={() => startDebugSession('notifications', 'all')}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Sessions */}
        <div className="active-sessions">
          <h2 className="text-lg font-semibold mb-4">Active Debug Sessions</h2>
          <div className="space-y-3">
            {activeSessions.map(session => (
              <SessionCard 
                key={session.id}
                session={session}
                isSelected={selectedSession?.id === session.id}
                onSelect={setSelectedSession}
                onDownloadReport={downloadDebugReport}
              />
            ))}
            {activeSessions.length === 0 && (
              <p className="text-gray-500 text-center py-8">No active debug sessions</p>
            )}
          </div>
        </div>
        
        {/* Session Logs */}
        <div className="session-logs">
          <h2 className="text-lg font-semibold mb-4">
            Session Logs {selectedSession && `- ${selectedSession.id}`}
          </h2>
          <div className="bg-black text-green-400 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
            {debugLogs.map((log, index) => (
              <LogEntry key={index} log={log} />
            ))}
            {debugLogs.length === 0 && (
              <p className="text-gray-500">Select a debug session to view logs</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Troubleshooting Guides */}
      <div className="troubleshooting-guides mt-8">
        <h2 className="text-lg font-semibold mb-4">Troubleshooting Guides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TroubleshootingCard 
            title="High Error Rate"
            description="URLs showing consistent failures"
            guide="high_error_rate"
          />
          <TroubleshootingCard 
            title="Slow Performance"
            description="Processing taking too long"
            guide="slow_performance"
          />
          <TroubleshootingCard 
            title="LLM Analysis Issues"
            description="Poor AI analysis results"
            guide="llm_analysis_issues"
          />
        </div>
      </div>
    </div>
  )
}

const HealthCard: React.FC<{ component: string; health: any }> = ({ component, health }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50'
      case 'degraded': return 'text-yellow-600 bg-yellow-50'
      case 'critical': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle size={16} />
      case 'degraded': return <AlertTriangle size={16} />
      case 'critical': return <AlertTriangle size={16} />
      default: return <Clock size={16} />
    }
  }
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.status)}`}>
        {getStatusIcon(health.status)}
        {health.status}
      </div>
      <h3 className="font-medium text-gray-900 mt-2 capitalize">{component.replace('_', ' ')}</h3>
      {health.response_time && (
        <p className="text-sm text-gray-600 mt-1">
          Response: {health.response_time}ms
        </p>
      )}
      {health.last_error && (
        <p className="text-xs text-red-600 mt-1 truncate">
          {health.last_error}
        </p>
      )}
    </div>
  )
}

const DebugButton: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  >
    <Play size={16} />
    {label}
  </button>
)

const SessionCard: React.FC<{
  session: any
  isSelected: boolean
  onSelect: (session: any) => void
  onDownloadReport: (sessionId: string) => void
}> = ({ session, isSelected, onSelect, onDownloadReport }) => (
  <div 
    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
    }`}
    onClick={() => onSelect(session)}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-medium text-gray-900">{session.config.type}</h3>
        <p className="text-sm text-gray-600">Target: {session.config.target}</p>
        <p className="text-xs text-gray-500">Started: {new Date(session.started_at).toLocaleTimeString()}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${
          session.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
        }`} />
        {session.status === 'completed' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDownloadReport(session.id)
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <Download size={14} />
          </button>
        )}
      </div>
    </div>
  </div>
)

const LogEntry: React.FC<{ log: any }> = ({ log }) => {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-400'
      case 'warn': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
      default: return 'text-green-400'
    }
  }
  
  return (
    <div className="mb-1">
      <span className="text-gray-500">
        {new Date(log.timestamp).toLocaleTimeString()}
      </span>
      <span className={`ml-2 ${getLevelColor(log.level)}`}>
        [{log.level.toUpperCase()}]
      </span>
      <span className="ml-2">{log.message}</span>
      {log.data && (
        <pre className="ml-8 text-xs text-gray-400 whitespace-pre-wrap">
          {JSON.stringify(log.data, null, 2)}
        </pre>
      )}
    </div>
  )
}

const TroubleshootingCard: React.FC<{
  title: string
  description: string
  guide: string
}> = ({ title, description, guide }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
    <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-3">{description}</p>
    <button
      onClick={() => window.open(`/docs/troubleshooting/${guide}`, '_blank')}
      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
    >
      View Guide →
    </button>
  </div>
)

export default DebugDashboard
```

---

## Zusammenfassung

Das URL Watcher Tool Briefing ist nun vollständig und umfasst:

### ✅ Abgedeckte Bereiche:
1. **🔧 Detaillierte Implementierung** - Vollständige Agent-Code-Beispiele
2. **🎯 Erweiterte Features** - PDF-Monitoring, API-Endpoints, Visual Changes
3. **🔗 Cross-Tool Integration** - Shared Learning, Unified Dashboard
4. **🧪 Testing & Qualität** - Unit/Integration/Performance Tests
5. **🔒 Sicherheit & Datenschutz** - GDPR-Compliance, Security Best Practices
6. **📊 Business & Operations** - Cost Management, Monitoring & Alerting
7. **🚀 Performance & Scaling** - Database Optimization, Caching, Auto-Scaling
8. **🔄 Backup & Recovery** - Comprehensive Backup System, Disaster Recovery
9. **🚀 Deployment & CI/CD** - Blue-Green Deployment, Feature Flags
10. **🔧 Troubleshooting & Debugging** - Debug Dashboard, Troubleshooting Guides

### 📊 Kernmetriken:
- **Geschätzte Entwicklungszeit:** 5-6 Wochen für MVP
- **Laufende Kosten:** ~$0.20/Monat für LLM-APIs (deutlich unter Budget!)
- **Skalierung:** Bis zu 50 URLs gleichzeitig überwachbar
- **Performance:** Unter 5 Minuten für komplette URL-Verarbeitung
- **Verfügbarkeit:** 99%+ durch Serverless-Architektur

### 🎯 Besondere Stärken:
- **Token-effiziente LLM-Nutzung** durch intelligentes Batch-Processing
- **4-Agent-Architektur** für klare Separation of Concerns
- **Kontinuierliches Lernen** durch User-Feedback
- **Nahtlose Integration** mit bestehendem E-Mail-Tool
- **Production-ready** mit umfassendem Monitoring und Debugging

Das System ist bereit für die Implementierung und bietet eine solide Grundlage für eine skalierbare, intelligente URL-Überwachungslösung!