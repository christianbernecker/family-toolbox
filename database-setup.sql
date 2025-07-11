-- Family Toolbox Database Setup
-- Führe dieses Script in der Supabase SQL-Konsole aus

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (wird automatisch von Supabase Auth erstellt, aber erweitern)
-- CREATE TABLE IF NOT EXISTS auth.users (...); -- Automatisch vorhanden

-- User Tool Settings
CREATE TABLE IF NOT EXISTS user_tool_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, tool_id)
);

-- User Settings (für API Keys, Preferences, etc.)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  api_keys JSONB DEFAULT '{"encrypted": false}',
  preferences JSONB DEFAULT '{
    "theme": "system",
    "language": "de", 
    "notifications_enabled": true,
    "email_notifications": false,
    "auto_updates": true
  }',
  security JSONB DEFAULT '{
    "two_factor_enabled": false,
    "session_timeout": 480,
    "login_notifications": true
  }',
  ai_settings JSONB DEFAULT '{
    "default_model": "gpt-4",
    "temperature": 0.7,
    "max_tokens": 2000
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bauplan Analyses
CREATE TABLE IF NOT EXISTS bauplan_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_size BIGINT,
  file_path TEXT,
  analysis_results JSONB,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'error', 'cancelled')),
  error_message TEXT,
  processing_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Configurations
CREATE TABLE IF NOT EXISTS agent_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  configuration JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT FALSE,
  schedule TEXT, -- Cron expression
  last_execution TIMESTAMP WITH TIME ZONE,
  next_execution TIMESTAMP WITH TIME ZONE,
  execution_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent Results
CREATE TABLE IF NOT EXISTS agent_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_config_id UUID REFERENCES agent_configurations(id) ON DELETE CASCADE,
  execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  results JSONB,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout', 'cancelled')),
  error_message TEXT,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File Uploads
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  storage_path TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'processed', 'error')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE user_tool_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bauplan_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- User Tool Settings
CREATE POLICY "Users can manage their own tool settings" ON user_tool_settings
  FOR ALL USING (auth.uid() = user_id);

-- User Settings  
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Bauplan Analyses
CREATE POLICY "Users can manage their own analyses" ON bauplan_analyses
  FOR ALL USING (auth.uid() = user_id);

-- Agent Configurations
CREATE POLICY "Users can manage their own agent configs" ON agent_configurations
  FOR ALL USING (auth.uid() = user_id);

-- Agent Results
CREATE POLICY "Users can view their own agent results" ON agent_results
  FOR SELECT USING (auth.uid() IN (
    SELECT user_id FROM agent_configurations WHERE id = agent_config_id
  ));

-- File Uploads
CREATE POLICY "Users can manage their own uploads" ON file_uploads
  FOR ALL USING (auth.uid() = user_id);

-- Audit Logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tool_settings_user_id ON user_tool_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_bauplan_analyses_user_id ON bauplan_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_configurations_user_id ON agent_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_results_config_id ON agent_results(agent_config_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_tool_settings_updated_at BEFORE UPDATE ON user_tool_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bauplan_analyses_updated_at BEFORE UPDATE ON bauplan_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_configurations_updated_at BEFORE UPDATE ON agent_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_uploads_updated_at BEFORE UPDATE ON file_uploads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 