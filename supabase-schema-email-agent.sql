-- E-Mail Agent Tool - Supabase Schema
-- Erstellt für Family Toolbox E-Mail Agent System

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
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Absender-Prioritäten
CREATE TABLE sender_priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_address VARCHAR(255) UNIQUE NOT NULL,
  priority_weight INTEGER DEFAULT 1, -- 1-10, höher = wichtiger
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E-Mails
CREATE TABLE emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
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
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tägliche Zusammenfassungen
CREATE TABLE daily_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
  time_range_start TIMESTAMP WITH TIME ZONE NOT NULL,
  time_range_end TIMESTAMP WITH TIME ZONE NOT NULL,
  summary_text TEXT NOT NULL,
  total_emails INTEGER NOT NULL,
  relevant_emails INTEGER NOT NULL,
  high_priority_emails INTEGER NOT NULL,
  prompt_version VARCHAR(50),
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback zu Zusammenfassungen
CREATE TABLE summary_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  summary_id UUID REFERENCES daily_summaries(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 6), -- Schulnotensystem
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback zu E-Mail-Relevanz (Lernphase)
CREATE TABLE relevance_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
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
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- E-Mail Verarbeitungs-Logs
CREATE TABLE email_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES email_accounts(id) ON DELETE CASCADE,
  process_type VARCHAR(50) NOT NULL, -- 'fetch', 'summarize', 'relevance'
  status VARCHAR(50) NOT NULL, -- 'success', 'error', 'partial'
  emails_processed INTEGER DEFAULT 0,
  emails_new INTEGER DEFAULT 0,
  emails_errors INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX idx_emails_account_received ON emails(account_id, received_at DESC);
CREATE INDEX idx_emails_relevance ON emails(relevance_score DESC, received_at DESC);
CREATE INDEX idx_emails_category ON emails(category, received_at DESC);
CREATE INDEX idx_emails_sender ON emails(sender_email, received_at DESC);
CREATE INDEX idx_emails_processed ON emails(is_processed, received_at DESC);

CREATE INDEX idx_summaries_date_account ON daily_summaries(date DESC, account_id);
CREATE INDEX idx_summaries_time_range ON daily_summaries(time_range_start, time_range_end);

CREATE INDEX idx_sender_priorities_email ON sender_priorities(email_address);
CREATE INDEX idx_sender_priorities_weight ON sender_priorities(priority_weight DESC);

CREATE INDEX idx_feedback_summary ON summary_feedback(summary_id, created_at DESC);
CREATE INDEX idx_feedback_relevance ON relevance_feedback(email_id, created_at DESC);

CREATE INDEX idx_prompt_versions_active ON prompt_versions(is_active, agent_type);
CREATE INDEX idx_prompt_versions_performance ON prompt_versions(performance_score DESC);

CREATE INDEX idx_processing_logs_account_date ON email_processing_logs(account_id, created_at DESC);
CREATE INDEX idx_processing_logs_status ON email_processing_logs(status, created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sender_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE summary_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE relevance_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_processing_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Admin-Zugriff (Service Role)
CREATE POLICY "Service role can access all email data" ON email_accounts
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all sender priorities" ON sender_priorities
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all emails" ON emails
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all summaries" ON daily_summaries
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all feedback" ON summary_feedback
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all relevance feedback" ON relevance_feedback
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all prompt versions" ON prompt_versions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can access all processing logs" ON email_processing_logs
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies für authentifizierte Benutzer
CREATE POLICY "Users can view email accounts" ON email_accounts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view sender priorities" ON sender_priorities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view emails" ON emails
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view summaries" ON daily_summaries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage feedback" ON summary_feedback
  FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid()::text);

CREATE POLICY "Users can manage relevance feedback" ON relevance_feedback
  FOR ALL USING (auth.role() = 'authenticated' AND user_id = auth.uid()::text);

CREATE POLICY "Users can view prompt versions" ON prompt_versions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view processing logs" ON email_processing_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger für updated_at Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_accounts_updated_at BEFORE UPDATE ON email_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sender_priorities_updated_at BEFORE UPDATE ON sender_priorities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompt_versions_updated_at BEFORE UPDATE ON prompt_versions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initiale Daten für Standard-Prompts
INSERT INTO prompt_versions (version_name, agent_type, prompt_text, is_active) VALUES
('relevance-v1', 'relevance', 'Bewerte die Relevanz dieser E-Mail für einen Kita-Verein auf einer Skala von 1-10. Berücksichtige: Persönliche Kommunikation, Finanzangelegenheiten, Vorstandsentscheidungen, Werbung/Spam. Höhere Relevanz für: amandabernecker@gmail.com, Finanz- und Vorstandsmails.', TRUE),
('summary-v1', 'summary', 'Erstelle eine prägnante Zusammenfassung der wichtigsten E-Mails der letzten 6 Stunden. Gruppiere nach Kategorien (persönlich, finanziell, vorstand). Hebe dringende Angelegenheiten hervor. Maximal 300 Wörter.', TRUE);

-- Initiale Absender-Prioritäten
INSERT INTO sender_priorities (email_address, priority_weight, notes) VALUES
('amandabernecker@gmail.com', 10, 'Ehefrau - höchste Priorität'),
('finanzen@wuermchen.org', 8, 'Finanzielle Angelegenheiten'),
('vorstand@wuermchen.org', 8, 'Vorstandsentscheidungen'),
('info@wuermchen.org', 6, 'Allgemeine Vereinsinformationen'),
('noreply@wuermchen.org', 2, 'System-E-Mails'),
('newsletter@wuermchen.org', 3, 'Newsletter - niedrige Priorität');

-- Kommentare für Dokumentation
COMMENT ON TABLE email_accounts IS 'Konfiguration der E-Mail-Accounts für IMAP-Zugriff';
COMMENT ON TABLE sender_priorities IS 'Prioritäts-Gewichtung für E-Mail-Absender';
COMMENT ON TABLE emails IS 'Gespeicherte E-Mails mit Relevanz-Bewertung';
COMMENT ON TABLE daily_summaries IS 'Tägliche E-Mail-Zusammenfassungen';
COMMENT ON TABLE summary_feedback IS 'Benutzer-Feedback zu Zusammenfassungen';
COMMENT ON TABLE relevance_feedback IS 'Manuelle Relevanz-Bewertungen für Learning';
COMMENT ON TABLE prompt_versions IS 'A/B-Testing für AI-Prompts';
COMMENT ON TABLE email_processing_logs IS 'Logs der E-Mail-Verarbeitung'; 