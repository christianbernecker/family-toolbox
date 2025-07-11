export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  enabled: boolean;
  version: string;
  config?: Record<string, any>;
}

export type ToolCategory = 
  | 'analysis'
  | 'development'
  | 'automation'
  | 'utility'
  | 'documentation';

export interface ToolAccess {
  userId: string;
  toolId: string;
  enabled: boolean;
  settings: Record<string, any>;
  usageCount: number;
  lastUsed?: Date;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  processingTime?: number;
}

export interface ToolConfig {
  maxFileSize?: number;
  supportedFormats?: string[];
  apiEndpoint?: string;
  features?: string[];
} 