-- URL Watcher Tool - Database Schema Extension

-- URL-Konfiguration
CREATE TABLE IF NOT EXISTS watched_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  tags TEXT[] DEFAULT '{}', -- Array für Tag-System
  notification_settings JSONB DEFAULT '{"email": true, "push": true, "frequency": "immediate"}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_user_url UNIQUE(user_id, url),
  CONSTRAINT valid_interval CHECK (monitoring_interval >= 15),
  CONSTRAINT valid_url_format CHECK (url ~ '^https?://.*')
);

-- Content-Snapshots
CREATE TABLE IF NOT EXISTS url_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES watched_urls(id) ON DELETE CASCADE,
  content_hash VARCHAR(64) NOT NULL, -- SHA-256 für Change-Detection
  raw_content TEXT, -- Komprimiert gespeichert
  extracted_text TEXT NOT NULL, -- Bereinigter Text-Content
  metadata JSONB, -- Title, Meta-Tags, etc.
  content_size INTEGER,
  fetch_duration INTEGER, -- Millisekunden
  fetch_status INTEGER, -- HTTP Status Code
  captured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index für Performance
  INDEX idx_snapshots_url_captured(url_id, captured_at DESC)
);

-- Erkannte Änderungen
CREATE TABLE IF NOT EXISTS content_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url_id UUID REFERENCES watched_urls(id) ON DELETE CASCADE,
  previous_snapshot_id UUID REFERENCES url_snapshots(id),
  current_snapshot_id UUID REFERENCES url_snapshots(id),
  change_type VARCHAR(50) NOT NULL DEFAULT 'content', -- 'content', 'structure', 'metadata'
  diff_text TEXT, -- Textuelle Beschreibung der Änderung
  diff_html TEXT, -- HTML mit Highlighting
  change_summary TEXT, -- Von Agent 1 generiert
  relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 10), -- 1-10 von Agent 2
  relevance_category VARCHAR(50), -- 'high', 'medium', 'low', 'irrelevant'
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0), -- 0.00-1.00
  llm_reasoning TEXT, -- Begründung vom LLM
  is_user_relevant BOOLEAN, -- Basierend auf User-Feedback
  notification_sent BOOLEAN DEFAULT FALSE,
  analyzed_at TIMESTAMP WITH TIME ZONE,
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index für Performance
  INDEX idx_changes_url_detected(url_id, detected_at DESC),
  INDEX idx_changes_relevance(relevance_score DESC, detected_at DESC)
);

-- Benachrichtigungen
CREATE TABLE IF NOT EXISTS url_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  change_id UUID REFERENCES content_changes(id) ON DELETE CASCADE,
  notification_type VARCHAR(20) NOT NULL, -- 'email', 'push', 'in_app'
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'read'
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index für Performance
  INDEX idx_notifications_user_status(user_id, status, created_at DESC)
);

-- User-Feedback für Learning
CREATE TABLE IF NOT EXISTS url_change_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  change_id UUID REFERENCES content_changes(id) ON DELETE CASCADE,
  feedback_type VARCHAR(20) NOT NULL DEFAULT 'relevance', -- 'relevance', 'quality', 'accuracy'
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1=irrelevant, 5=sehr relevant
  feedback_text TEXT,
  correction_data JSONB, -- Strukturierte Korrekturen
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index für Feedback-Analyse
  INDEX idx_feedback_change(change_id),
  CONSTRAINT unique_user_change_feedback UNIQUE(user_id, change_id, feedback_type)
);

-- LLM-Prompt-Versionen für A/B-Testing
CREATE TABLE IF NOT EXISTS url_prompt_templates (
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
CREATE TABLE IF NOT EXISTS url_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tag_name VARCHAR(50) NOT NULL,
  tag_color VARCHAR(7), -- Hex-Farbcode
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tag_name)
);

-- Push-Subscription für Browser-Notifications
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_data JSONB NOT NULL, -- Web Push Subscription Object
  device_info JSONB, -- Browser, OS, etc.
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Performance-Metriken für URL Watcher
CREATE TABLE IF NOT EXISTS url_system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type VARCHAR(50) NOT NULL,
  metric_value DECIMAL(10,4) NOT NULL,
  metric_unit VARCHAR(20),
  agent_name VARCHAR(50),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index für Performance-Analyse
  INDEX idx_metrics_type_recorded(metric_type, recorded_at DESC)
);

-- Trigger für automatische Updates
CREATE OR REPLACE FUNCTION update_url_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger anwenden
DROP TRIGGER IF EXISTS update_watched_urls_updated_at ON watched_urls;
CREATE TRIGGER update_watched_urls_updated_at 
  BEFORE UPDATE ON watched_urls
  FOR EACH ROW EXECUTE FUNCTION update_url_updated_at_column();

-- Stored Procedures für häufige Operationen

-- Increment Check Count
CREATE OR REPLACE FUNCTION increment_url_check_count(url_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE watched_urls 
  SET check_count = check_count + 1,
      last_checked = NOW()
  WHERE id = url_id;
END;
$$ LANGUAGE plpgsql;

-- Increment Error Count
CREATE OR REPLACE FUNCTION increment_url_error_count(url_id UUID, error_message TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  UPDATE watched_urls 
  SET error_count = error_count + 1,
      last_error = COALESCE(error_message, last_error),
      last_checked = NOW()
  WHERE id = url_id;
END;
$$ LANGUAGE plpgsql;

-- Reset Error Count
CREATE OR REPLACE FUNCTION reset_url_error_count(url_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE watched_urls 
  SET error_count = 0,
      last_error = NULL
  WHERE id = url_id;
END;
$$ LANGUAGE plpgsql;

-- Cleanup alte Snapshots (90 Tage)
CREATE OR REPLACE FUNCTION cleanup_old_url_snapshots()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM url_snapshots 
  WHERE captured_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) Policies

-- watched_urls policies
ALTER TABLE watched_urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own watched URLs"
  ON watched_urls FOR ALL
  USING (auth.uid() = user_id);

-- url_snapshots policies (via watched_urls)
ALTER TABLE url_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access snapshots of their URLs"
  ON url_snapshots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM watched_urls 
      WHERE watched_urls.id = url_snapshots.url_id 
      AND watched_urls.user_id = auth.uid()
    )
  );

-- content_changes policies (via watched_urls)
ALTER TABLE content_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access changes of their URLs"
  ON content_changes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM watched_urls 
      WHERE watched_urls.id = content_changes.url_id 
      AND watched_urls.user_id = auth.uid()
    )
  );

-- url_notifications policies
ALTER TABLE url_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own notifications"
  ON url_notifications FOR ALL
  USING (auth.uid() = user_id);

-- url_change_feedback policies
ALTER TABLE url_change_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own feedback"
  ON url_change_feedback FOR ALL
  USING (auth.uid() = user_id);

-- url_tags policies
ALTER TABLE url_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own tags"
  ON url_tags FOR ALL
  USING (auth.uid() = user_id);

-- push_subscriptions policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Default Prompt Templates einfügen
INSERT INTO url_prompt_templates (template_name, template_type, prompt_content, version, is_active, performance_score)
VALUES 
(
  'default_relevance_analysis',
  'relevance_analysis',
  'Du bist ein AI-Assistent für die Überwachung von Website-Änderungen.

WEBSITE-INFORMATIONEN:
URL: {url}
Titel: {title}
Überwachungsanweisungen: {monitoring_instructions}

ERKANNTE ÄNDERUNG:
{diff_text}

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
}',
  '1.0',
  true,
  0.85
),
(
  'default_change_summary',
  'change_summary', 
  'Erstelle eine prägnante Zusammenfassung der folgenden Website-Änderung:

URL: {url}
Änderung: {diff_text}

Fasse die wichtigsten Änderungen in 1-2 Sätzen zusammen. Fokussiere auf den Inhalt, nicht auf technische Details.',
  '1.0',
  true,
  0.80
)
ON CONFLICT (template_name) DO NOTHING;

-- Beispiel-Tags für bessere UX
INSERT INTO url_tags (user_id, tag_name, tag_color, description)
SELECT 
  auth.uid(),
  tag_name,
  tag_color,
  description
FROM (VALUES 
  ('News', '#3b82f6', 'Nachrichten-Websites'),
  ('Shopping', '#10b981', 'Online-Shops und Preise'),
  ('Business', '#6366f1', 'Geschäftliche Websites'),
  ('Personal', '#f59e0b', 'Persönliche oder Familie-Websites'),
  ('Technology', '#8b5cf6', 'Tech-News und Updates'),
  ('Important', '#ef4444', 'Besonders wichtige Websites')
) AS default_tags(tag_name, tag_color, description)
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id, tag_name) DO NOTHING;

-- Indizes für Performance (falls nicht automatisch erstellt)
CREATE INDEX IF NOT EXISTS idx_watched_urls_active ON watched_urls(is_active, last_checked) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_watched_urls_user ON watched_urls(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_url_captured ON url_snapshots(url_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_changes_url_detected ON content_changes(url_id, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_changes_relevance ON content_changes(relevance_score DESC, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_status ON url_notifications(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_change ON url_change_feedback(change_id);
CREATE INDEX IF NOT EXISTS idx_metrics_type_recorded ON url_system_metrics(metric_type, recorded_at DESC); 