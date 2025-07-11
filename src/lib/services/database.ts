// Database Service für Family Toolbox
// Zentrale Abstraktion für alle Database-Operationen

import { getSupabaseClient } from '@/lib/utils/supabase-helper';
import type {
  UserToolSettings,
  UserToolSettingsInsert,
  UserToolSettingsUpdate,
  UserSettings,
  UserSettingsInsert,
  UserSettingsUpdate,
  BauplanAnalysis,
  BauplanAnalysisInsert,
  BauplanAnalysisUpdate,
  AgentConfiguration,
  AgentConfigurationInsert,
  AgentConfigurationUpdate,
  AgentResult,
  AgentResultInsert,
  FileUpload,
  FileUploadInsert,
  FileUploadUpdate,
  AuditLog,
  AuditLogInsert,
  ToolId,
  AgentType,
} from '@/lib/types/database';

export class DatabaseService {
  private static instance: DatabaseService;
  private supabase: any;

  private constructor() {
    this.supabase = getSupabaseClient();
  }

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // ==========================================
  // USER TOOL SETTINGS
  // ==========================================

  async getUserToolSettings(userId: string): Promise<UserToolSettings[]> {
    const { data, error } = await this.supabase
      .from('user_tool_settings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user tool settings: ${error.message}`);
    return data || [];
  }

  async getActiveTools(userId: string): Promise<ToolId[]> {
    const { data, error } = await this.supabase
      .from('user_tool_settings')
      .select('tool_id')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw new Error(`Failed to fetch active tools: ${error.message}`);
    return (data || []).map(item => item.tool_id as ToolId);
  }

  async toggleTool(userId: string, toolId: ToolId): Promise<UserToolSettings> {
    // Prüfe ob Setting bereits existiert
    const { data: existing } = await this.supabase
      .from('user_tool_settings')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .single();

    if (existing) {
      // Update existing setting
      const { data, error } = await this.supabase
        .from('user_tool_settings')
        .update({ is_active: !existing.is_active })
        .eq('user_id', userId)
        .eq('tool_id', toolId)
        .select('*')
        .single();

      if (error) throw new Error(`Failed to toggle tool: ${error.message}`);
      return data;
    } else {
      // Create new setting
      const { data, error } = await this.supabase
        .from('user_tool_settings')
        .insert({
          user_id: userId,
          tool_id: toolId,
          is_active: true,
          settings: {}
        })
        .select('*')
        .single();

      if (error) throw new Error(`Failed to create tool setting: ${error.message}`);
      return data;
    }
  }

  async updateToolSettings(
    userId: string, 
    toolId: ToolId, 
    settings: Record<string, any>
  ): Promise<UserToolSettings> {
    const { data, error } = await this.supabase
      .from('user_tool_settings')
      .upsert({
        user_id: userId,
        tool_id: toolId,
        settings,
        is_active: true,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update tool settings: ${error.message}`);
    return data;
  }

  // ==========================================
  // BAUPLAN ANALYSES
  // ==========================================

  async createBauplanAnalysis(analysis: BauplanAnalysisInsert): Promise<BauplanAnalysis> {
    const { data, error } = await this.supabase
      .from('bauplan_analyses')
      .insert(analysis)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create bauplan analysis: ${error.message}`);
    return data;
  }

  async getBauplanAnalyses(userId: string): Promise<BauplanAnalysis[]> {
    const { data, error } = await this.supabase
      .from('bauplan_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch bauplan analyses: ${error.message}`);
    return data || [];
  }

  async getBauplanAnalysis(id: string, userId: string): Promise<BauplanAnalysis | null> {
    const { data, error } = await this.supabase
      .from('bauplan_analyses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch bauplan analysis: ${error.message}`);
    }
    return data || null;
  }

  async updateBauplanAnalysis(
    id: string, 
    userId: string, 
    updates: BauplanAnalysisUpdate
  ): Promise<BauplanAnalysis> {
    const { data, error } = await this.supabase
      .from('bauplan_analyses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update bauplan analysis: ${error.message}`);
    return data;
  }

  async deleteBauplanAnalysis(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('bauplan_analyses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete bauplan analysis: ${error.message}`);
  }

  // ==========================================
  // AGENT CONFIGURATIONS
  // ==========================================

  async createAgentConfiguration(config: AgentConfigurationInsert): Promise<AgentConfiguration> {
    const { data, error } = await this.supabase
      .from('agent_configurations')
      .insert(config)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create agent configuration: ${error.message}`);
    return data;
  }

  async getAgentConfigurations(userId: string): Promise<AgentConfiguration[]> {
    const { data, error } = await this.supabase
      .from('agent_configurations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch agent configurations: ${error.message}`);
    return data || [];
  }

  async getActiveAgentConfigurations(userId: string): Promise<AgentConfiguration[]> {
    const { data, error } = await this.supabase
      .from('agent_configurations')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch active agent configurations: ${error.message}`);
    return data || [];
  }

  async updateAgentConfiguration(
    id: string, 
    userId: string, 
    updates: AgentConfigurationUpdate
  ): Promise<AgentConfiguration> {
    const { data, error } = await this.supabase
      .from('agent_configurations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update agent configuration: ${error.message}`);
    return data;
  }

  async deleteAgentConfiguration(id: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('agent_configurations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to delete agent configuration: ${error.message}`);
  }

  // ==========================================
  // AGENT RESULTS
  // ==========================================

  async createAgentResult(result: AgentResultInsert): Promise<AgentResult> {
    const { data, error } = await this.supabase
      .from('agent_results')
      .insert(result)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create agent result: ${error.message}`);
    return data;
  }

  async getAgentResults(
    agentConfigId: string, 
    limit: number = 50
  ): Promise<AgentResult[]> {
    const { data, error } = await this.supabase
      .from('agent_results')
      .select('*')
      .eq('agent_config_id', agentConfigId)
      .order('execution_time', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch agent results: ${error.message}`);
    return data || [];
  }

  async getRecentAgentResults(userId: string, limit: number = 20): Promise<AgentResult[]> {
    const { data, error } = await this.supabase
      .from('agent_results')
      .select(`
        *,
        agent_configurations!inner(user_id, name, agent_type)
      `)
      .eq('agent_configurations.user_id', userId)
      .order('execution_time', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch recent agent results: ${error.message}`);
    return data || [];
  }

  // ==========================================
  // FILE UPLOADS
  // ==========================================

  async createFileUpload(upload: FileUploadInsert): Promise<FileUpload> {
    const { data, error } = await this.supabase
      .from('file_uploads')
      .insert(upload)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create file upload: ${error.message}`);
    return data;
  }

  async getFileUploads(userId: string, toolId?: ToolId): Promise<FileUpload[]> {
    let query = this.supabase
      .from('file_uploads')
      .select('*')
      .eq('user_id', userId);

    if (toolId) {
      query = query.eq('tool_id', toolId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch file uploads: ${error.message}`);
    return data || [];
  }

  async updateFileUploadStatus(
    id: string, 
    userId: string, 
    status: FileUpload['status']
  ): Promise<FileUpload> {
    const { data, error } = await this.supabase
      .from('file_uploads')
      .update({ status })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to update file upload status: ${error.message}`);
    return data;
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================

  async createAuditLog(log: AuditLogInsert): Promise<AuditLog> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .insert(log)
      .select('*')
      .single();

    if (error) throw new Error(`Failed to create audit log: ${error.message}`);
    return data;
  }

  async getAuditLogs(
    userId: string, 
    limit: number = 100
  ): Promise<AuditLog[]> {
    const { data, error } = await this.supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`);
    return data || [];
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  async getUserStats(userId: string): Promise<{
    activeTools: number;
    bauplanAnalyses: number;
    agentConfigurations: number;
    recentAgentExecutions: number;
  }> {
    // Parallele Abfragen für bessere Performance
    const [
      { count: activeToolsCount },
      { count: bauplanAnalysesCount },
      { count: agentConfigurationsCount },
      { count: recentExecutionsCount }
    ] = await Promise.all([
      this.supabase
        .from('user_tool_settings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true),
      this.supabase
        .from('bauplan_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      this.supabase
        .from('agent_configurations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      this.supabase
        .from('agent_results')
        .select(`
          *,
          agent_configurations!inner(user_id)
        `, { count: 'exact', head: true })
        .eq('agent_configurations.user_id', userId)
        .gte('execution_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    ]);

    return {
      activeTools: activeToolsCount || 0,
      bauplanAnalyses: bauplanAnalysesCount || 0,
      agentConfigurations: agentConfigurationsCount || 0,
      recentAgentExecutions: recentExecutionsCount || 0,
    };
  }

  // ==========================================
  // USER SETTINGS MANAGEMENT
  // ==========================================

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return default settings
        return this.createDefaultUserSettings(userId);
      }
      console.error('Error fetching user settings:', error);
      throw error;
    }

    return data as UserSettings;
  }

  async updateUserSettings(userId: string, settings: UserSettingsUpdate): Promise<UserSettings> {
    // First check if settings exist
    const existingSettings = await this.getUserSettings(userId);
    
    if (!existingSettings) {
      // Create new settings
      const newSettings: UserSettingsInsert = {
        user_id: userId,
        api_keys: settings.api_keys || { encrypted: false },
        preferences: settings.preferences || {
          theme: 'system',
          language: 'de',
          notifications_enabled: true,
          email_notifications: false,
          auto_updates: true
        },
        security: settings.security || {
          two_factor_enabled: false,
          session_timeout: 480, // 8 hours
          login_notifications: true
        },
        ai_settings: settings.ai_settings || {
          default_model: 'gpt-4',
          temperature: 0.7,
          max_tokens: 2000
        }
      };

      const { data, error } = await this.supabase
        .from('user_settings')
        .insert(newSettings)
        .select()
        .single();

      if (error) {
        console.error('Error creating user settings:', error);
        throw error;
      }

      return data as UserSettings;
    } else {
      // Update existing settings
      const { data, error } = await this.supabase
        .from('user_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user settings:', error);
        throw error;
      }

      return data as UserSettings;
    }
  }

  async updateApiKeys(userId: string, apiKeys: { openai_api_key?: string; claude_api_key?: string }): Promise<UserSettings> {
    // Encrypt API keys before storing (simple base64 for now - in production use proper encryption)
    const encryptedKeys = {
      openai_api_key: apiKeys.openai_api_key ? btoa(apiKeys.openai_api_key) : undefined,
      claude_api_key: apiKeys.claude_api_key ? btoa(apiKeys.claude_api_key) : undefined,
      encrypted: true
    };

    return this.updateUserSettings(userId, { api_keys: encryptedKeys });
  }

  async getDecryptedApiKeys(userId: string): Promise<{ openai_api_key?: string; claude_api_key?: string }> {
    const settings = await this.getUserSettings(userId);
    
    if (!settings?.api_keys) {
      return {};
    }

    // Decrypt API keys (simple base64 for now)
    return {
      openai_api_key: settings.api_keys.openai_api_key ? atob(settings.api_keys.openai_api_key) : undefined,
      claude_api_key: settings.api_keys.claude_api_key ? atob(settings.api_keys.claude_api_key) : undefined
    };
  }

  private async createDefaultUserSettings(userId: string): Promise<UserSettings> {
    const defaultSettings: UserSettingsInsert = {
      user_id: userId,
      api_keys: { encrypted: false },
      preferences: {
        theme: 'system',
        language: 'de',
        notifications_enabled: true,
        email_notifications: false,
        auto_updates: true
      },
      security: {
        two_factor_enabled: false,
        session_timeout: 480, // 8 hours
        login_notifications: true
      },
      ai_settings: {
        default_model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000
      }
    };

    const { data, error } = await this.supabase
      .from('user_settings')
      .insert(defaultSettings)
      .select()
      .single();

    if (error) {
      console.error('Error creating default user settings:', error);
      throw error;
    }

    return data as UserSettings;
  }
}

// Export singleton instance
export const db = DatabaseService.getInstance(); 