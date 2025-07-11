// Mock Tool Manager für Staging-Deploy
// Vereinfachte Implementation ohne Datenbank-Abhängigkeiten

import { toolRegistry, type ToolDefinition } from './registry';
import type { ToolId } from '@/lib/types/database';

export interface ToolStatus {
  tool: ToolDefinition;
  isActive: boolean;
  settings: Record<string, any>;
  lastUsed?: string;
  usageCount?: number;
  hasErrors?: boolean;
  errorMessage?: string;
}

export class MockToolManager {
  private static instance: MockToolManager;
  private mockData: Map<string, Map<ToolId, ToolStatus>> = new Map();

  private constructor() {}

  static getInstance(): MockToolManager {
    if (!MockToolManager.instance) {
      MockToolManager.instance = new MockToolManager();
    }
    return MockToolManager.instance;
  }

  async toggleTool(userId: string, toolId: ToolId): Promise<ToolStatus> {
    const userTools = this.getUserTools(userId);
    const currentStatus = userTools.get(toolId);

    if (!currentStatus) {
      throw new Error(`Tool ${toolId} not found`);
    }

    const newStatus: ToolStatus = {
      ...currentStatus,
      isActive: !currentStatus.isActive,
      lastUsed: new Date().toISOString(),
    };

    userTools.set(toolId, newStatus);
    return newStatus;
  }

  async getToolStatus(userId: string, toolId: ToolId): Promise<ToolStatus | null> {
    const userTools = this.getUserTools(userId);
    return userTools.get(toolId) || null;
  }

  async getAllUserTools(userId: string): Promise<ToolStatus[]> {
    const userTools = this.getUserTools(userId);
    return Array.from(userTools.values());
  }

  async getUserToolStats(userId: string): Promise<{
    totalTools: number;
    activeTools: number;
    inactiveTools: number;
    toolsWithErrors: number;
    lastActivity?: string;
  }> {
    const tools = await this.getAllUserTools(userId);
    const activeTools = tools.filter(t => t.isActive);
    const inactiveTools = tools.filter(t => !t.isActive);
    const toolsWithErrors = tools.filter(t => t.hasErrors);

    return {
      totalTools: tools.length,
      activeTools: activeTools.length,
      inactiveTools: inactiveTools.length,
      toolsWithErrors: toolsWithErrors.length,
      lastActivity: tools.find(t => t.lastUsed)?.lastUsed
    };
  }

  private getUserTools(userId: string): Map<ToolId, ToolStatus> {
    if (!this.mockData.has(userId)) {
      this.initializeUserTools(userId);
    }
    return this.mockData.get(userId)!;
  }

  private initializeUserTools(userId: string): void {
    const availableTools = toolRegistry.getAllTools();
    const userTools = new Map<ToolId, ToolStatus>();

    for (const tool of availableTools) {
      const toolStatus: ToolStatus = {
        tool,
        isActive: false,
        settings: tool.defaultSettings,
        hasErrors: false,
        usageCount: 0
      };

      userTools.set(tool.id, toolStatus);
    }

    this.mockData.set(userId, userTools);
  }
}

// Export singleton instance
export const toolManager = MockToolManager.getInstance(); 