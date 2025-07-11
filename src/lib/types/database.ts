// Database Types für Family Toolbox
// Auto-generated from Supabase Schema

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: UserInsert
        Update: UserUpdate
      }
      accounts: {
        Row: Account
        Insert: AccountInsert
        Update: AccountUpdate
      }
      sessions: {
        Row: Session
        Insert: SessionInsert
        Update: SessionUpdate
      }
      verification_tokens: {
        Row: VerificationToken
        Insert: VerificationTokenInsert
        Update: VerificationTokenUpdate
      }
      user_tool_settings: {
        Row: UserToolSettings
        Insert: UserToolSettingsInsert
        Update: UserToolSettingsUpdate
      }
      bauplan_analyses: {
        Row: BauplanAnalysis
        Insert: BauplanAnalysisInsert
        Update: BauplanAnalysisUpdate
      }
      agent_configurations: {
        Row: AgentConfiguration
        Insert: AgentConfigurationInsert
        Update: AgentConfigurationUpdate
      }
      agent_results: {
        Row: AgentResult
        Insert: AgentResultInsert
        Update: AgentResultUpdate
      }
      file_uploads: {
        Row: FileUpload
        Insert: FileUploadInsert
        Update: FileUploadUpdate
      }
      audit_logs: {
        Row: AuditLog
        Insert: AuditLogInsert
        Update: AuditLogUpdate
      }
    }
  }
}

// NextAuth.js Types
export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  email_verified: string | null
  created_at: string
  updated_at: string
}

export interface UserInsert {
  id?: string
  email: string
  name?: string | null
  image?: string | null
  email_verified?: string | null
  created_at?: string
  updated_at?: string
}

export interface UserUpdate {
  id?: string
  email?: string
  name?: string | null
  image?: string | null
  email_verified?: string | null
  created_at?: string
  updated_at?: string
}

export interface Account {
  id: string
  user_id: string
  type: string
  provider: string
  provider_account_id: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
  created_at: string
  updated_at: string
}

export interface AccountInsert {
  id?: string
  user_id: string
  type: string
  provider: string
  provider_account_id: string
  refresh_token?: string | null
  access_token?: string | null
  expires_at?: number | null
  token_type?: string | null
  scope?: string | null
  id_token?: string | null
  session_state?: string | null
  created_at?: string
  updated_at?: string
}

export interface AccountUpdate {
  id?: string
  user_id?: string
  type?: string
  provider?: string
  provider_account_id?: string
  refresh_token?: string | null
  access_token?: string | null
  expires_at?: number | null
  token_type?: string | null
  scope?: string | null
  id_token?: string | null
  session_state?: string | null
  created_at?: string
  updated_at?: string
}

export interface Session {
  id: string
  session_token: string
  user_id: string
  expires: string
  created_at: string
  updated_at: string
}

export interface SessionInsert {
  id?: string
  session_token: string
  user_id: string
  expires: string
  created_at?: string
  updated_at?: string
}

export interface SessionUpdate {
  id?: string
  session_token?: string
  user_id?: string
  expires?: string
  created_at?: string
  updated_at?: string
}

export interface VerificationToken {
  identifier: string
  token: string
  expires: string
  created_at: string
}

export interface VerificationTokenInsert {
  identifier: string
  token: string
  expires: string
  created_at?: string
}

export interface VerificationTokenUpdate {
  identifier?: string
  token?: string
  expires?: string
  created_at?: string
}

// Family Toolbox Specific Types
export interface UserToolSettings {
  id: string
  user_id: string
  tool_id: string
  is_active: boolean
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserToolSettingsInsert {
  id?: string
  user_id: string
  tool_id: string
  is_active?: boolean
  settings?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface UserToolSettingsUpdate {
  id?: string
  user_id?: string
  tool_id?: string
  is_active?: boolean
  settings?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface BauplanAnalysis {
  id: string
  user_id: string
  filename: string
  original_filename: string
  file_size: number | null
  file_path: string | null
  analysis_results: BauplanAnalysisResults | null
  status: 'processing' | 'completed' | 'error' | 'cancelled'
  error_message: string | null
  processing_duration_ms: number | null
  created_at: string
  updated_at: string
}

export interface BauplanAnalysisInsert {
  id?: string
  user_id: string
  filename: string
  original_filename: string
  file_size?: number | null
  file_path?: string | null
  analysis_results?: BauplanAnalysisResults | null
  status?: 'processing' | 'completed' | 'error' | 'cancelled'
  error_message?: string | null
  processing_duration_ms?: number | null
  created_at?: string
  updated_at?: string
}

export interface BauplanAnalysisUpdate {
  id?: string
  user_id?: string
  filename?: string
  original_filename?: string
  file_size?: number | null
  file_path?: string | null
  analysis_results?: BauplanAnalysisResults | null
  status?: 'processing' | 'completed' | 'error' | 'cancelled'
  error_message?: string | null
  processing_duration_ms?: number | null
  created_at?: string
  updated_at?: string
}

export interface BauplanAnalysisResults {
  compliance_score: number
  violations: Array<{
    type: string
    severity: 'error' | 'warning' | 'info'
    description: string
    page?: number
    coordinates?: { x: number, y: number, width: number, height: number }
  }>
  recommendations: string[]
  total_pages: number
  analyzed_elements: number
  summary?: string
}

export interface AgentConfiguration {
  id: string
  user_id: string
  agent_type: string
  name: string
  description: string | null
  configuration: Record<string, any>
  is_active: boolean
  schedule: string | null
  last_execution: string | null
  next_execution: string | null
  execution_count: number
  created_at: string
  updated_at: string
}

export interface AgentConfigurationInsert {
  id?: string
  user_id: string
  agent_type: string
  name: string
  description?: string | null
  configuration: Record<string, any>
  is_active?: boolean
  schedule?: string | null
  last_execution?: string | null
  next_execution?: string | null
  execution_count?: number
  created_at?: string
  updated_at?: string
}

export interface AgentConfigurationUpdate {
  id?: string
  user_id?: string
  agent_type?: string
  name?: string
  description?: string | null
  configuration?: Record<string, any>
  is_active?: boolean
  schedule?: string | null
  last_execution?: string | null
  next_execution?: string | null
  execution_count?: number
  created_at?: string
  updated_at?: string
}

export interface AgentResult {
  id: string
  agent_config_id: string
  execution_time: string
  results: Record<string, any> | null
  status: 'success' | 'error' | 'timeout' | 'cancelled'
  error_message: string | null
  duration_ms: number | null
  metadata: Record<string, any>
  created_at: string
}

export interface AgentResultInsert {
  id?: string
  agent_config_id: string
  execution_time?: string
  results?: Record<string, any> | null
  status?: 'success' | 'error' | 'timeout' | 'cancelled'
  error_message?: string | null
  duration_ms?: number | null
  metadata?: Record<string, any>
  created_at?: string
}

export interface AgentResultUpdate {
  id?: string
  agent_config_id?: string
  execution_time?: string
  results?: Record<string, any> | null
  status?: 'success' | 'error' | 'timeout' | 'cancelled'
  error_message?: string | null
  duration_ms?: number | null
  metadata?: Record<string, any>
  created_at?: string
}

export interface FileUpload {
  id: string
  user_id: string
  tool_id: string
  filename: string
  original_filename: string
  mime_type: string | null
  file_size: number | null
  storage_path: string
  metadata: Record<string, any>
  status: 'uploaded' | 'processing' | 'processed' | 'error'
  created_at: string
  updated_at: string
}

export interface FileUploadInsert {
  id?: string
  user_id: string
  tool_id: string
  filename: string
  original_filename: string
  mime_type?: string | null
  file_size?: number | null
  storage_path: string
  metadata?: Record<string, any>
  status?: 'uploaded' | 'processing' | 'processed' | 'error'
  created_at?: string
  updated_at?: string
}

export interface FileUploadUpdate {
  id?: string
  user_id?: string
  tool_id?: string
  filename?: string
  original_filename?: string
  mime_type?: string | null
  file_size?: number | null
  storage_path?: string
  metadata?: Record<string, any>
  status?: 'uploaded' | 'processing' | 'processed' | 'error'
  created_at?: string
  updated_at?: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  table_name: string | null
  record_id: string | null
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AuditLogInsert {
  id?: string
  user_id?: string | null
  action: string
  table_name?: string | null
  record_id?: string | null
  old_values?: Record<string, any> | null
  new_values?: Record<string, any> | null
  ip_address?: string | null
  user_agent?: string | null
  created_at?: string
}

export interface AuditLogUpdate {
  id?: string
  user_id?: string | null
  action?: string
  table_name?: string | null
  record_id?: string | null
  old_values?: Record<string, any> | null
  new_values?: Record<string, any> | null
  ip_address?: string | null
  user_agent?: string | null
  created_at?: string
}

// Utility Types
export type ToolId = 'bauplan-checker' | 'multi-agent-system'
export type AgentType = 'email-monitor' | 'content-summarizer' | 'document-processor'

// Add after existing types
export interface UserSettings {
  id: string;
  user_id: string;
  api_keys: {
    openai_api_key?: string;
    claude_api_key?: string;
    encrypted: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'de' | 'en';
    notifications_enabled: boolean;
    email_notifications: boolean;
    auto_updates: boolean;
  };
  security: {
    two_factor_enabled: boolean;
    session_timeout: number; // in minutes
    login_notifications: boolean;
  };
  ai_settings: {
    default_model: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'claude-2';
    temperature: number;
    max_tokens: number;
    system_prompt?: string;
  };
  created_at: string;
  updated_at: string;
}

export type UserSettingsInsert = Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>;
export type UserSettingsUpdate = Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at'>>; 