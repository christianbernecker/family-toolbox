-- Row Level Security Policies für Family Toolbox
-- Sicherheitskonfiguration für Supabase

-- Enable RLS on all user tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tool_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bauplan_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users Table Policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Accounts Table Policies (NextAuth)
CREATE POLICY "Users can manage their own accounts" ON accounts
  FOR ALL USING (auth.uid() = user_id);

-- Sessions Table Policies (NextAuth)
CREATE POLICY "Users can manage their own sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

-- User Tool Settings Policies
CREATE POLICY "Users can manage their own tool settings" ON user_tool_settings
  FOR ALL USING (auth.uid() = user_id);

-- Bauplan Analyses Policies
CREATE POLICY "Users can manage their own bauplan analyses" ON bauplan_analyses
  FOR ALL USING (auth.uid() = user_id);

-- Agent Configurations Policies
CREATE POLICY "Users can manage their own agent configurations" ON agent_configurations
  FOR ALL USING (auth.uid() = user_id);

-- Agent Results Policies
CREATE POLICY "Users can view their own agent results" ON agent_results
  FOR SELECT USING (
    auth.uid() = (
      SELECT user_id FROM agent_configurations 
      WHERE id = agent_config_id
    )
  );

CREATE POLICY "System can insert agent results" ON agent_results
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM agent_configurations 
      WHERE id = agent_config_id 
      AND user_id = auth.uid()
    )
  );

-- File Uploads Policies
CREATE POLICY "Users can manage their own file uploads" ON file_uploads
  FOR ALL USING (auth.uid() = user_id);

-- Audit Logs Policies
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true); -- Audit logs können vom System erstellt werden

-- Verification Tokens (NextAuth) - Keine RLS nötig, wird von NextAuth verwaltet
-- ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY; -- Nicht aktiviert

-- Functions für erweiterte Security Checks
CREATE OR REPLACE FUNCTION auth.user_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- In der Family Toolbox sind alle User admins (2-3 User total)
  -- Hier könnte man später eine admin_users Tabelle referenzieren
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy für Admin-Funktionen (falls später benötigt)
-- CREATE POLICY "Admins can manage all data" ON [table_name]
--   FOR ALL USING (auth.user_is_admin());

-- Storage Policies (für File-Uploads)
-- Diese müssen in der Supabase UI oder via API erstellt werden:
/*
-- Bauplan-Uploads Bucket Policy
INSERT INTO storage.buckets (id, name, public) VALUES ('bauplan-uploads', 'bauplan-uploads', false);

-- Storage Policy für Bauplan-Uploads
CREATE POLICY "Users can upload their own bauplans" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'bauplan-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own bauplans" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'bauplan-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own bauplans" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'bauplan-uploads' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
*/ 