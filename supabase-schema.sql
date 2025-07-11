-- Family Toolbox Database Schema für Supabase
-- Führe dieses Script in deinem Supabase Dashboard aus: SQL Editor > New Query

-- 1. NextAuth.js Tabellen (falls noch nicht vorhanden)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  email_verified TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (identifier, token)
);

-- 2. Family Toolbox Spezifische Tabellen

-- User Settings (mit verschlüsselten API Keys)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  api_keys JSONB DEFAULT '{"encrypted": true}'::jsonb,
  preferences JSONB DEFAULT '{
    "theme": "system",
    "language": "de",
    "notifications_enabled": true,
    "email_notifications": true,
    "auto_updates": true
  }'::jsonb,
  security JSONB DEFAULT '{
    "two_factor_enabled": false,
    "session_timeout": 60,
    "login_notifications": true
  }'::jsonb,
  ai_settings JSONB DEFAULT '{
    "default_model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Tool Settings (welche Tools aktiv sind)
CREATE TABLE IF NOT EXISTS user_tool_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL CHECK (tool_id IN ('bauplan-checker', 'multi-agent-system')),
  is_active BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- Bauplan Analyses
CREATE TABLE IF NOT EXISTS bauplan_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT,
  file_path TEXT,
  analysis_results JSONB,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error', 'cancelled')),
  error_message TEXT,
  processing_duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Configurations (für Multi-Agent System)
CREATE TABLE IF NOT EXISTS agent_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('email-monitor', 'content-summarizer', 'document-processor')),
  name TEXT NOT NULL,
  description TEXT,
  configuration JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT FALSE,
  schedule TEXT, -- Cron expression
  last_execution TIMESTAMPTZ,
  next_execution TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent Results
CREATE TABLE IF NOT EXISTS agent_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_config_id UUID REFERENCES agent_configurations(id) ON DELETE CASCADE,
  execution_time TIMESTAMPTZ DEFAULT NOW(),
  results JSONB,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout', 'cancelled')),
  error_message TEXT,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- File Uploads (für alle Tools)
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  storage_path TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs (für Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_tool_settings_user_id ON user_tool_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_bauplan_analyses_user_id ON bauplan_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_bauplan_analyses_status ON bauplan_analyses(status);
CREATE INDEX IF NOT EXISTS idx_agent_configurations_user_id ON agent_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_configurations_active ON agent_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_agent_results_config_id ON agent_results(agent_config_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- 4. Trigger für updated_at Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tool_settings_updated_at BEFORE UPDATE ON user_tool_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bauplan_analyses_updated_at BEFORE UPDATE ON bauplan_analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_configurations_updated_at BEFORE UPDATE ON agent_configurations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_uploads_updated_at BEFORE UPDATE ON file_uploads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tool_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bauplan_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- User können nur ihre eigenen Daten sehen/bearbeiten
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tool settings" ON user_tool_settings
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own bauplan analyses" ON bauplan_analyses
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own agent configurations" ON agent_configurations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own agent results" ON agent_results
    FOR SELECT USING (auth.uid() = (SELECT user_id FROM agent_configurations WHERE id = agent_config_id));

CREATE POLICY "Users can manage own file uploads" ON file_uploads
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own audit logs" ON audit_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Service Role kann alles (für API-Operationen)
CREATE POLICY "Service role can manage all data" ON users
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all settings" ON user_settings
    FOR ALL TO service_role USING (true);

CREATE POLICY "Service role can manage all tool settings" ON user_tool_settings
    FOR ALL TO service_role USING (true);

-- 6. Storage Bucket für Datei-Uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-toolbox-uploads', 'family-toolbox-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'family-toolbox-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'family-toolbox-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'family-toolbox-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Fertig!
SELECT 'Family Toolbox Database Schema erfolgreich erstellt!' as status; 