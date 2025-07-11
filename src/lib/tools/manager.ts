// Tool Manager für Family Toolbox
// Verwaltet User-Tool-Settings und Tool-Status

// import { db } from '@/lib/services/database';
import { toolRegistry, type ToolDefinition } from './registry';
import type { 
  ToolId, 
  UserToolSettings, 
  UserToolSettingsInsert,
  UserToolSettingsUpdate 
} from '@/lib/types/database';

export interface ToolStatus {
  tool: ToolDefinition;
  isActive: boolean;
  settings: Record<string, any>;
  lastUsed?: string;
  usageCount?: number;
  hasErrors?: boolean;
  errorMessage?: string;
}

export interface UserToolManager {
  userId: string;
  tools: Map<ToolId, ToolStatus>;
}

export class ToolManager {
  private static instance: ToolManager;
  private userManagers: Map<string, UserToolManager> = new Map();

  private constructor() {}

  static getInstance(): ToolManager {
    if (!ToolManager.instance) {
      ToolManager.instance = new ToolManager();
    }
    return ToolManager.instance;
  }

  // ==========================================
  // USER TOOL MANAGEMENT
  // ==========================================

  async initializeUserTools(userId: string): Promise<UserToolManager> {
    // Temporär deaktiviert für Staging-Deploy
    // const userSettings = await db.getUserToolSettings(userId);
    const userSettings: any[] = []; // Mock-Daten
    const availableTools = toolRegistry.getAllTools();

    const tools = new Map<ToolId, ToolStatus>();

    // Initialize all available tools
    for (const tool of availableTools) {
      const userSetting = userSettings.find(s => s.tool_id === tool.id);
      
      const toolStatus: ToolStatus = {
        tool,
        isActive: userSetting?.is_active ?? false,
        settings: userSetting?.settings ?? tool.defaultSettings,
        lastUsed: userSetting?.updated_at,
        usageCount: 0, // TODO: Calculate from usage logs
        hasErrors: false,
        errorMessage: undefined
      };

      tools.set(tool.id, toolStatus);
    }

    const userManager: UserToolManager = {
      userId,
      tools
    };

    this.userManagers.set(userId, userManager);
    return userManager;
  }

  async getUserToolManager(userId: string): Promise<UserToolManager> {
    let manager = this.userManagers.get(userId);
    if (!manager) {
      manager = await this.initializeUserTools(userId);
    }
    return manager;
  }

  // ==========================================
  // TOOL ACTIVATION / DEACTIVATION
  // ==========================================

  async toggleTool(userId: string, toolId: ToolId): Promise<ToolStatus> {
    const manager = await this.getUserToolManager(userId);
    const currentStatus = manager.tools.get(toolId);

    if (!currentStatus) {
      throw new Error(`Tool ${toolId} not found`);
    }

    // Validate tool compatibility before activation
    const compatibility = toolRegistry.validateToolCompatibility(toolId, 'user');
    if (!compatibility.compatible && !currentStatus.isActive) {
      throw new Error(`Cannot activate tool: ${compatibility.reasons.join(', ')}`);
    }

    const newActiveState = !currentStatus.isActive;

    // Update in database
    const updatedSetting = await db.toggleTool(userId, toolId);

    // Update local cache
    const newStatus: ToolStatus = {
      ...currentStatus,
      isActive: updatedSetting.is_active,
      settings: updatedSetting.settings,
      lastUsed: updatedSetting.updated_at,
      hasErrors: false,
      errorMessage: undefined
    };

    manager.tools.set(toolId, newStatus);

    // Trigger tool-specific initialization/cleanup
    if (newActiveState) {
      await this.initializeTool(userId, toolId);
    } else {
      await this.cleanupTool(userId, toolId);
    }

    return newStatus;
  }

  async activateTool(userId: string, toolId: ToolId): Promise<ToolStatus> {
    const manager = await this.getUserToolManager(userId);
    const currentStatus = manager.tools.get(toolId);

    if (!currentStatus) {
      throw new Error(`Tool ${toolId} not found`);
    }

    if (currentStatus.isActive) {
      return currentStatus; // Already active
    }

    return this.toggleTool(userId, toolId);
  }

  async deactivateTool(userId: string, toolId: ToolId): Promise<ToolStatus> {
    const manager = await this.getUserToolManager(userId);
    const currentStatus = manager.tools.get(toolId);

    if (!currentStatus) {
      throw new Error(`Tool ${toolId} not found`);
    }

    if (!currentStatus.isActive) {
      return currentStatus; // Already inactive
    }

    return this.toggleTool(userId, toolId);
  }

  // ==========================================
  // TOOL SETTINGS MANAGEMENT
  // ==========================================

  async updateToolSettings(
    userId: string, 
    toolId: ToolId, 
    settings: Record<string, any>
  ): Promise<ToolStatus> {
    const manager = await this.getUserToolManager(userId);
    const currentStatus = manager.tools.get(toolId);

    if (!currentStatus) {
      throw new Error(`Tool ${toolId} not found`);
    }

    // Validate settings against tool definition
    const tool = toolRegistry.getTool(toolId);
    if (!tool) {
      throw new Error(`Tool definition for ${toolId} not found`);
    }

    // Merge with default settings
    const mergedSettings = { ...tool.defaultSettings, ...settings };

    // Update in database
    const updatedSetting = await db.updateToolSettings(userId, toolId, mergedSettings);

    // Update local cache
    const newStatus: ToolStatus = {
      ...currentStatus,
      settings: updatedSetting.settings,
      lastUsed: updatedSetting.updated_at
    };

    manager.tools.set(toolId, newStatus);

    // Apply settings if tool is active
    if (newStatus.isActive) {
      await this.applyToolSettings(userId, toolId, mergedSettings);
    }

    return newStatus;
  }

  async resetToolSettings(userId: string, toolId: ToolId): Promise<ToolStatus> {
    const tool = toolRegistry.getTool(toolId);
    if (!tool) {
      throw new Error(`Tool ${toolId} not found`);
    }

    return this.updateToolSettings(userId, toolId, tool.defaultSettings);
  }

  // ==========================================
  // TOOL STATUS QUERIES
  // ==========================================

  async getToolStatus(userId: string, toolId: ToolId): Promise<ToolStatus | null> {
    const manager = await this.getUserToolManager(userId);
    return manager.tools.get(toolId) || null;
  }

  async getActiveTools(userId: string): Promise<ToolStatus[]> {
    const manager = await this.getUserToolManager(userId);
    return Array.from(manager.tools.values()).filter(status => status.isActive);
  }

  async getAllUserTools(userId: string): Promise<ToolStatus[]> {
    const manager = await this.getUserToolManager(userId);
    return Array.from(manager.tools.values());
  }

  async getToolsByCategory(
    userId: string, 
    category: string
  ): Promise<ToolStatus[]> {
    const manager = await this.getUserToolManager(userId);
    return Array.from(manager.tools.values())
      .filter(status => status.tool.category === category);
  }

  async isToolActive(userId: string, toolId: ToolId): Promise<boolean> {
    const status = await this.getToolStatus(userId, toolId);
    return status?.isActive ?? false;
  }

  // ==========================================
  // TOOL LIFECYCLE MANAGEMENT
  // ==========================================

  private async initializeTool(userId: string, toolId: ToolId): Promise<void> {
    // Tool-specific initialization logic
    switch (toolId) {
      case 'bauplan-checker':
        // Initialize bauplan-checker specific resources
        console.log(`Initializing Bauplan Checker for user ${userId}`);
        break;
      case 'multi-agent-system':
        // Initialize agent system
        console.log(`Initializing Multi-Agent System for user ${userId}`);
        break;
      default:
        console.log(`Initializing generic tool ${toolId} for user ${userId}`);
    }
  }

  private async cleanupTool(userId: string, toolId: ToolId): Promise<void> {
    // Tool-specific cleanup logic
    switch (toolId) {
      case 'bauplan-checker':
        // Cleanup bauplan-checker resources
        console.log(`Cleaning up Bauplan Checker for user ${userId}`);
        break;
      case 'multi-agent-system':
        // Stop agents, cleanup jobs
        console.log(`Cleaning up Multi-Agent System for user ${userId}`);
        break;
      default:
        console.log(`Cleaning up generic tool ${toolId} for user ${userId}`);
    }
  }

  private async applyToolSettings(
    userId: string, 
    toolId: ToolId, 
    settings: Record<string, any>
  ): Promise<void> {
    // Apply tool-specific settings
    switch (toolId) {
      case 'bauplan-checker':
        // Apply bauplan-checker settings
        break;
      case 'multi-agent-system':
        // Apply agent system settings
        break;
    }
  }

  // ==========================================
  // STATISTICS & MONITORING
  // ==========================================

  async getUserToolStats(userId: string): Promise<{
    totalTools: number;
    activeTools: number;
    inactiveTools: number;
    toolsWithErrors: number;
    lastActivity?: string;
  }> {
    const manager = await this.getUserToolManager(userId);
    const tools = Array.from(manager.tools.values());

    const activeTools = tools.filter(t => t.isActive);
    const inactiveTools = tools.filter(t => !t.isActive);
    const toolsWithErrors = tools.filter(t => t.hasErrors);

    const lastActivity = tools
      .filter(t => t.lastUsed)
      .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())[0]?.lastUsed;

    return {
      totalTools: tools.length,
      activeTools: activeTools.length,
      inactiveTools: inactiveTools.length,
      toolsWithErrors: toolsWithErrors.length,
      lastActivity
    };
  }

  async setToolError(
    userId: string, 
    toolId: ToolId, 
    error: string | null
  ): Promise<void> {
    const manager = await this.getUserToolManager(userId);
    const status = manager.tools.get(toolId);

    if (status) {
      status.hasErrors = error !== null;
      status.errorMessage = error ?? undefined;
      manager.tools.set(toolId, status);
    }
  }

  // ==========================================
  // CACHE MANAGEMENT
  // ==========================================

  clearUserCache(userId: string): void {
    this.userManagers.delete(userId);
  }

  clearAllCaches(): void {
    this.userManagers.clear();
  }

  async refreshUserTools(userId: string): Promise<UserToolManager> {
    this.clearUserCache(userId);
    return this.initializeUserTools(userId);
  }
}

// Export singleton instance
export const toolManager = ToolManager.getInstance(); 