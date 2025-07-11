import { getSupabaseClient } from '@/lib/utils/supabase-helper';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  features: string[];
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ToolStatus {
  toolId: string;
  isActive: boolean;
  updatedAt: string;
  updatedBy: string;
}

export class ToolManagementService {
  private supabase = getSupabaseClient();

  // Alle verfügbaren Tools (definiert im Code)
  private readonly availableTools: Omit<Tool, 'isActive' | 'createdAt' | 'updatedAt'>[] = [
    {
      id: "bauplan-checker",
      name: "Bauplan Checker",
      description: "PDF-Bauplan-Validation gegen DIN-Normen mit RAG-System für präzise Compliance-Prüfung",
      icon: "FileCheck",
      href: "/tools/bauplan-checker",
      color: "bg-blue-500",
      order: 1,
      features: [
        "PDF-Upload und -Verarbeitung",
        "DIN-Normen Compliance-Prüfung",
        "RAG-basierte Analyse",
        "Detaillierte Validierungsberichte"
      ]
    },
    {
      id: "multi-agent",
      name: "Multi-Agent System",
      description: "Framework für Background-Agents mit Email-Monitoring und intelligenten Benachrichtigungen",
      icon: "Bot",
      href: "/tools/multi-agent",
      color: "bg-purple-500",
      order: 2,
      features: [
        "Email-Monitoring Agents",
        "Content-Zusammenfassung",
        "Automatische Benachrichtigungen",
        "Erweiterbare Agent-Architektur"
      ]
    }
  ];

  /**
   * Alle Tools mit ihrem aktuellen Aktivierungsstatus abrufen
   */
  async getAllTools(): Promise<Tool[]> {
    try {
      // Tool-Status aus der Datenbank abrufen
      const { data: toolStatuses, error } = await this.supabase
        .from('tool_statuses')
        .select('*');

      if (error) {
        console.error('Error fetching tool statuses:', error);
      }

      // Tools mit Status kombinieren
      const tools: Tool[] = this.availableTools.map(tool => {
        const status = toolStatuses?.find(s => s.tool_id === tool.id);
        return {
          ...tool,
          isActive: status?.is_active ?? false, // Default: inaktiv
          createdAt: status?.created_at || new Date().toISOString(),
          updatedAt: status?.updated_at || new Date().toISOString()
        };
      });

      return tools.sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error('Error in getAllTools:', error);
      return this.availableTools.map(tool => ({
        ...tool,
        isActive: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
    }
  }

  /**
   * Nur aktive Tools abrufen
   */
  async getActiveTools(): Promise<Tool[]> {
    const allTools = await this.getAllTools();
    return allTools.filter(tool => tool.isActive);
  }

  /**
   * Tool-Status ändern (Admin-Funktion)
   */
  async setToolStatus(toolId: string, isActive: boolean, userId: string): Promise<boolean> {
    try {
      // Prüfen ob Tool existiert
      const toolExists = this.availableTools.find(tool => tool.id === toolId);
      if (!toolExists) {
        throw new Error(`Tool with ID ${toolId} does not exist`);
      }

      const { error } = await this.supabase
        .from('tool_statuses')
        .upsert({
          tool_id: toolId,
          is_active: isActive,
          updated_by: userId,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating tool status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in setToolStatus:', error);
      return false;
    }
  }

  /**
   * Tool-Status für ein bestimmtes Tool abrufen
   */
  async getToolStatus(toolId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('tool_statuses')
        .select('is_active')
        .eq('tool_id', toolId)
        .single();

      if (error || !data) {
        return false; // Default: inaktiv
      }

      return data.is_active;
    } catch (error) {
      console.error('Error getting tool status:', error);
      return false;
    }
  }

  /**
   * Alle Tool-Status für Admin-Interface
   */
  async getToolStatuses(): Promise<ToolStatus[]> {
    try {
      const { data, error } = await this.supabase
        .from('tool_statuses')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching tool statuses:', error);
        return [];
      }

      return (data || []).map(item => ({
        toolId: item.tool_id,
        isActive: item.is_active,
        updatedAt: item.updated_at,
        updatedBy: item.updated_by
      }));
    } catch (error) {
      console.error('Error in getToolStatuses:', error);
      return [];
    }
  }
} 