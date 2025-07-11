// Agent Registry für Family Toolbox Multi-Agent System
// Zentrale Verwaltung aller verfügbaren Agents

import { BaseAgent } from './base-agent';
import { EmailMonitorAgent } from './email-monitor';
import type { AgentType } from '@/lib/types/database';

export interface AgentDefinition {
  type: AgentType;
  name: string;
  description: string;
  version: string;
  category: 'communication' | 'automation' | 'analysis' | 'monitoring';
  features: string[];
  requiredConfig: string[];
  defaultConfig: Record<string, any>;
  requiresApiKeys: ('openai' | 'claude')[];
  status: 'stable' | 'beta' | 'experimental';
}

export const AVAILABLE_AGENTS: AgentDefinition[] = [
  {
    type: 'email-monitor',
    name: 'Email Monitor',
    description: 'Überwacht E-Mail-Postfächer und extrahiert wichtige Informationen mit KI-Zusammenfassungen',
    version: '1.0.0',
    category: 'communication',
    features: [
      'E-Mail Überwachung',
      'Intelligente Kategorisierung',
      'Prioritätserkennung',
      'KI-basierte Zusammenfassungen',
      'Flexible Benachrichtigungen',
      'Multi-Ordner Support'
    ],
    requiredConfig: [
      'email_server',
      'port',
      'username', 
      'password',
      'folders'
    ],
    defaultConfig: {
      port: 993,
      use_ssl: true,
      folders: ['INBOX'],
      keywords: [],
      exclude_senders: [],
      max_emails_per_run: 20,
      mark_as_read: false,
      ai_summary: true,
      notification_threshold: 'important'
    },
    requiresApiKeys: ['openai', 'claude'],
    status: 'beta'
  },
  {
    type: 'content-summarizer',
    name: 'Content Summarizer',
    description: 'Fasst Dokumente und Web-Inhalte automatisch zusammen',
    version: '0.8.0',
    category: 'analysis',
    features: [
      'PDF Zusammenfassung',
      'Web-Scraping',
      'Multi-Format Support',
      'Keyword-Extraktion',
      'Sentiment-Analyse'
    ],
    requiredConfig: [
      'source_types',
      'output_format'
    ],
    defaultConfig: {
      source_types: ['pdf', 'url'],
      output_format: 'markdown',
      max_length: 500,
      language: 'de',
      include_keywords: true
    },
    requiresApiKeys: ['openai', 'claude'],
    status: 'experimental'
  },
  {
    type: 'document-processor',
    name: 'Document Processor',
    description: 'Verarbeitet und organisiert Dokumente automatisch',
    version: '0.9.0',
    category: 'automation',
    features: [
      'Automatische Sortierung',
      'OCR-Texterkennung',
      'Metadaten-Extraktion',
      'Duplikat-Erkennung',
      'Tag-Management'
    ],
    requiredConfig: [
      'input_directory',
      'output_directory'
    ],
    defaultConfig: {
      input_directory: '/uploads',
      output_directory: '/processed',
      auto_rename: true,
      extract_metadata: true,
      ocr_enabled: true
    },
    requiresApiKeys: [],
    status: 'experimental'
  }
];

export class AgentRegistry {
  private static instance: AgentRegistry;
  private agents: Map<AgentType, BaseAgent> = new Map();
  private definitions: Map<AgentType, AgentDefinition> = new Map();

  private constructor() {
    this.initializeRegistry();
  }

  static getInstance(): AgentRegistry {
    if (!AgentRegistry.instance) {
      AgentRegistry.instance = new AgentRegistry();
    }
    return AgentRegistry.instance;
  }

  private initializeRegistry(): void {
    // Initialize agent definitions
    AVAILABLE_AGENTS.forEach(def => {
      this.definitions.set(def.type, def);
    });

    // Initialize agent instances
    this.agents.set('email-monitor', new EmailMonitorAgent());
    
    // TODO: Add other agents when implemented
    // this.agents.set('content-summarizer', new ContentSummarizerAgent());
    // this.agents.set('document-processor', new DocumentProcessorAgent());
  }

  // ==========================================
  // AGENT MANAGEMENT
  // ==========================================

  getAgent(type: AgentType): BaseAgent | null {
    return this.agents.get(type) || null;
  }

  getAgentDefinition(type: AgentType): AgentDefinition | null {
    return this.definitions.get(type) || null;
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }

  getAllDefinitions(): AgentDefinition[] {
    return Array.from(this.definitions.values());
  }

  getAgentsByCategory(category: string): AgentDefinition[] {
    return this.getAllDefinitions().filter(def => def.category === category);
  }

  getStableAgents(): AgentDefinition[] {
    return this.getAllDefinitions().filter(def => def.status === 'stable');
  }

  getBetaAgents(): AgentDefinition[] {
    return this.getAllDefinitions().filter(def => def.status === 'beta');
  }

  getExperimentalAgents(): AgentDefinition[] {
    return this.getAllDefinitions().filter(def => def.status === 'experimental');
  }

  // ==========================================
  // VALIDATION & COMPATIBILITY
  // ==========================================

  isValidAgentType(type: string): type is AgentType {
    return this.definitions.has(type as AgentType);
  }

  validateAgentCompatibility(
    type: AgentType, 
    apiKeys: { openai_api_key?: string; claude_api_key?: string } = {}
  ): { compatible: boolean; reasons: string[] } {
    const def = this.getAgentDefinition(type);
    const reasons: string[] = [];

    if (!def) {
      return { compatible: false, reasons: ['Agent not found'] };
    }

    // Check API key requirements
    const missingKeys = def.requiresApiKeys.filter(keyType => {
      if (keyType === 'openai') return !apiKeys.openai_api_key;
      if (keyType === 'claude') return !apiKeys.claude_api_key;
      return false;
    });

    if (missingKeys.length > 0) {
      reasons.push(`Missing required API keys: ${missingKeys.join(', ')}`);
    }

    // Check agent availability
    const agent = this.getAgent(type);
    if (!agent) {
      reasons.push('Agent implementation not available');
    }

    return {
      compatible: reasons.length === 0,
      reasons
    };
  }

  getConfigTemplate(type: AgentType): Record<string, any> | null {
    const def = this.getAgentDefinition(type);
    return def ? { ...def.defaultConfig } : null;
  }

  validateAgentConfig(type: AgentType, config: Record<string, any>): { valid: boolean; errors: string[] } {
    const def = this.getAgentDefinition(type);
    if (!def) {
      return { valid: false, errors: ['Agent type not found'] };
    }

    const errors: string[] = [];

    // Check required configuration fields
    for (const requiredField of def.requiredConfig) {
      if (!(requiredField in config) || config[requiredField] === undefined || config[requiredField] === '') {
        errors.push(`Required field missing: ${requiredField}`);
      }
    }

    // Agent-specific validation (delegate to agent if available)
    const agent = this.getAgent(type);
    if (agent) {
      try {
        const agentValidation = agent.validateConfig({
          id: 'temp',
          user_id: 'temp',
          agent_type: type,
          name: 'temp',
          description: null,
          configuration: config,
          is_active: false,
          schedule: null,
          last_execution: null,
          next_execution: null,
          execution_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (!agentValidation.valid) {
          errors.push(...agentValidation.errors);
        }
      } catch (error) {
        errors.push('Agent-specific validation failed');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // ==========================================
  // STATISTICS & MONITORING
  // ==========================================

  getAgentStats(): {
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    implemented: number;
    requiresApiKeys: number;
  } {
    const definitions = this.getAllDefinitions();
    
    const byCategory = definitions.reduce((acc, def) => {
      acc[def.category] = (acc[def.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byStatus = definitions.reduce((acc, def) => {
      acc[def.status] = (acc[def.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const implemented = definitions.filter(def => this.agents.has(def.type)).length;
    const requiresApiKeys = definitions.filter(def => def.requiresApiKeys.length > 0).length;

    return {
      total: definitions.length,
      byCategory,
      byStatus,
      implemented,
      requiresApiKeys
    };
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  getAgentIcon(type: AgentType): string {
    const iconMap: Record<AgentType, string> = {
      'email-monitor': '📧',
      'content-summarizer': '📄',
      'document-processor': '🗂️'
    };
    return iconMap[type] || '🤖';
  }

  getAgentDisplayName(type: AgentType): string {
    const def = this.getAgentDefinition(type);
    return def?.name || type;
  }

  getAgentDescription(type: AgentType): string {
    const def = this.getAgentDefinition(type);
    return def?.description || '';
  }

  getCategoryDisplayName(category: string): string {
    const categoryMap: Record<string, string> = {
      'communication': 'Kommunikation',
      'automation': 'Automatisierung',
      'analysis': 'Analyse',
      'monitoring': 'Überwachung'
    };
    return categoryMap[category] || category;
  }

  // ==========================================
  // DEVELOPMENT HELPERS
  // ==========================================

  registerAgent(type: AgentType, agent: BaseAgent, definition: AgentDefinition): void {
    this.agents.set(type, agent);
    this.definitions.set(type, definition);
  }

  unregisterAgent(type: AgentType): void {
    this.agents.delete(type);
    this.definitions.delete(type);
  }

  isAgentImplemented(type: AgentType): boolean {
    return this.agents.has(type);
  }
}

// Export singleton instance
export const agentRegistry = AgentRegistry.getInstance(); 