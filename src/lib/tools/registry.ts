// Tool Registry System für Family Toolbox
// Zentrale Definition aller verfügbaren Tools

import { LucideIcon, FileCheck, Bot, Settings, BarChart3, Globe } from 'lucide-react';
import type { ToolId } from '@/lib/types/database';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  longDescription?: string;
  icon: LucideIcon;
  category: ToolCategory;
  version: string;
  requiresConfig: boolean;
  defaultSettings: Record<string, any>;
  features: string[];
  dependencies?: string[];
  minUserRole?: 'user' | 'admin';
  status: 'stable' | 'beta' | 'experimental';
}

export type ToolCategory = 'analysis' | 'automation' | 'utility' | 'ai';

export const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    id: 'bauplan-checker',
    name: 'Bauplan Checker',
    description: 'PDF-Bauplan-Validation gegen DIN-Normen mit RAG-System',
    longDescription: 'Analysiert hochgeladene Baupläne automatisch gegen DIN-Normen und erstellt detaillierte Compliance-Berichte mit Handlungsempfehlungen.',
    icon: FileCheck,
    category: 'analysis',
    version: '1.0.0',
    requiresConfig: false,
    defaultSettings: {
      notifications: true,
      auto_analysis: false,
      din_normen: ['DIN_18040', 'DIN_276', 'DIN_277'],
      output_format: 'detailed',
      save_history: true
    },
    features: [
      'PDF-Upload mit Drag & Drop',
      'OCR-Texterkennung',
      'DIN-Normen Compliance-Check',
      'Automatische Fehlermarkierungen',
      'Detaillierte Berichte',
      'Empfehlungen zur Verbesserung'
    ],
    dependencies: ['openai-api'],
    minUserRole: 'user',
    status: 'beta'
  },
  {
    id: 'url-watcher',
    name: 'URL Watcher',
    description: 'Intelligente Website-Überwachung mit KI-basierter Relevanz-Bewertung',
    longDescription: 'Überwacht bis zu 50 URLs auf relevante inhaltliche Änderungen und benachrichtigt automatisch via E-Mail und Browser-Push. 4-Agent-Architektur mit Observer, Änderungs-Checker, Notifier und Optimizer für kontinuierliches Lernen.',
    icon: Globe,
    category: 'automation',
    version: '1.0.0',
    requiresConfig: true,
    defaultSettings: {
      monitoring_enabled: true,
      default_interval: 60,
      max_urls: 50,
      notifications: {
        email: true,
        push: true,
        frequency: 'immediate'
      },
      relevance_threshold: 6,
      data_retention_days: 90,
      learning_enabled: true
    },
    features: [
      'Multi-URL Überwachung (bis zu 50 URLs)',
      'KI-basierte Relevanz-Bewertung mit GPT-4o-mini',
      'Intelligente Content-Extraktion mit Playwright',
      'E-Mail & Browser-Push Benachrichtigungen',
      'Tag-System für URL-Organisation',
      'Kontinuierliches Lernen durch User-Feedback',
      'A/B-Testing von LLM-Prompts',
      '4-Agent-Architektur (Observer, Checker, Notifier, Optimizer)',
      'Dashboard mit Änderungs-Historie',
      'Diff-Visualisierung und Change-Details'
    ],
    dependencies: ['openai-api', 'claude-api'],
    minUserRole: 'user',
    status: 'beta'
  },
  {
    id: 'multi-agent-system',
    name: 'Multi-Agent System',
    description: 'Intelligente Agenten für Email-Monitoring und KI-basierte Automatisierung',
    longDescription: 'Vollständiges Framework für intelligente Background-Agents mit BaseAgent-Architektur, Agent Registry, Scheduler und lifecycle management. Implementiert Email Monitor mit KI-Analyse, Prioritätserkennung und automatischen Benachrichtigungen.',
    icon: Bot,
    category: 'automation',
    version: '1.0.0',
    requiresConfig: true,
    defaultSettings: {
      email_monitoring: false,
      alert_frequency: 'daily',
      max_agents: 3,
      background_processing: true,
      notification_channels: ['web', 'email'],
      agent_timeout: 300,
      retry_failed_jobs: true,
      api_keys_required: true
    },
    features: [
      'Email-Monitor Agent (voll implementiert)',
      'Content-Summarizer Agent (geplant)',
      'Document-Processor Agent (geplant)',
      'Cron-Job Scheduling & Lifecycle Management',
      'KI-basierte Kategorisierung & Prioritätserkennung',
      'Agent Registry & Validation System',
      'Background-Processing mit Error Recovery',
      'Database Integration & Result Logging'
    ],
    dependencies: ['openai-api', 'claude-api'],
    minUserRole: 'user',
    status: 'beta'
  }
];

// Tool-Management Utilities
export class ToolRegistry {
  private static instance: ToolRegistry;
  private tools: Map<ToolId, ToolDefinition>;

  private constructor() {
    this.tools = new Map();
    this.initializeTools();
  }

  static getInstance(): ToolRegistry {
    if (!ToolRegistry.instance) {
      ToolRegistry.instance = new ToolRegistry();
    }
    return ToolRegistry.instance;
  }

  private initializeTools(): void {
    AVAILABLE_TOOLS.forEach(tool => {
      this.tools.set(tool.id, tool);
    });
  }

  getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  getTool(toolId: ToolId): ToolDefinition | null {
    return this.tools.get(toolId) || null;
  }

  getToolsByCategory(category: ToolCategory): ToolDefinition[] {
    return this.getAllTools().filter(tool => tool.category === category);
  }

  getStableTools(): ToolDefinition[] {
    return this.getAllTools().filter(tool => tool.status === 'stable');
  }

  getBetaTools(): ToolDefinition[] {
    return this.getAllTools().filter(tool => tool.status === 'beta');
  }

  getExperimentalTools(): ToolDefinition[] {
    return this.getAllTools().filter(tool => tool.status === 'experimental');
  }

  getToolsRequiringConfig(): ToolDefinition[] {
    return this.getAllTools().filter(tool => tool.requiresConfig);
  }

  isValidToolId(toolId: string): toolId is ToolId {
    return this.tools.has(toolId as ToolId);
  }

  getToolDependencies(toolId: ToolId): string[] {
    const tool = this.getTool(toolId);
    return tool?.dependencies || [];
  }

  validateToolCompatibility(toolId: ToolId, userRole: 'user' | 'admin' = 'user'): {
    compatible: boolean;
    reasons: string[];
  } {
    const tool = this.getTool(toolId);
    const reasons: string[] = [];

    if (!tool) {
      return { compatible: false, reasons: ['Tool not found'] };
    }

    // Check user role
    if (tool.minUserRole === 'admin' && userRole !== 'admin') {
      reasons.push('Admin role required');
    }

    // Check dependencies (simplified check)
    const missingDeps = tool.dependencies?.filter(dep => {
      // In real implementation, check if dependency is available
      return false; // Placeholder - assume all deps are available for now
    }) || [];

    if (missingDeps.length > 0) {
      reasons.push(`Missing dependencies: ${missingDeps.join(', ')}`);
    }

    return {
      compatible: reasons.length === 0,
      reasons
    };
  }

  getToolStats(): {
    total: number;
    byCategory: Record<ToolCategory, number>;
    byStatus: Record<string, number>;
  } {
    const tools = this.getAllTools();
    
    const byCategory = tools.reduce((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {} as Record<ToolCategory, number>);

    const byStatus = tools.reduce((acc, tool) => {
      acc[tool.status] = (acc[tool.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: tools.length,
      byCategory,
      byStatus
    };
  }
}

// Export singleton instance
export const toolRegistry = ToolRegistry.getInstance();

// Type guards and utilities
export function isToolId(id: string): id is ToolId {
  return toolRegistry.isValidToolId(id);
}

export function getToolIcon(toolId: ToolId): LucideIcon {
  const tool = toolRegistry.getTool(toolId);
  return tool?.icon || Settings;
}

export function getToolDisplayName(toolId: ToolId): string {
  const tool = toolRegistry.getTool(toolId);
  return tool?.name || toolId;
}

export function getToolDescription(toolId: ToolId): string {
  const tool = toolRegistry.getTool(toolId);
  return tool?.description || '';
} 