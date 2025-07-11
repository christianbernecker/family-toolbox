// Base Agent Class für Family Toolbox Multi-Agent System
// Abstract base class die alle Agents implementieren müssen

import { db } from '@/lib/services/database';
import type { 
  AgentConfiguration, 
  AgentResult, 
  AgentResultInsert,
  AgentType 
} from '@/lib/types/database';

export interface AgentExecutionContext {
  userId: string;
  configId: string;
  config: AgentConfiguration;
  apiKeys?: {
    openai_api_key?: string;
    claude_api_key?: string;
  };
  userSettings?: any;
}

export interface AgentExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
  next_execution?: Date;
}

export abstract class BaseAgent {
  protected readonly agentType: AgentType;
  protected readonly name: string;
  protected readonly description: string;
  protected readonly version: string;

  constructor(
    agentType: AgentType,
    name: string,
    description: string,
    version: string = '1.0.0'
  ) {
    this.agentType = agentType;
    this.name = name;
    this.description = description;
    this.version = version;
  }

  // ==========================================
  // ABSTRACT METHODS - Must be implemented by subclasses
  // ==========================================

  /**
   * Validate agent configuration
   */
  abstract validateConfig(config: AgentConfiguration): { valid: boolean; errors: string[] };

  /**
   * Main execution method - implemented by each agent
   */
  abstract execute(context: AgentExecutionContext): Promise<AgentExecutionResult>;

  /**
   * Cleanup method called when agent is disabled/deleted
   */
  abstract cleanup(context: AgentExecutionContext): Promise<void>;

  // ==========================================
  // SHARED METHODS - Available to all agents
  // ==========================================

  /**
   * Get agent metadata
   */
  getMetadata() {
    return {
      type: this.agentType,
      name: this.name,
      description: this.description,
      version: this.version,
    };
  }

  /**
   * Log agent execution result to database
   */
  protected async logResult(
    context: AgentExecutionContext,
    result: AgentExecutionResult
  ): Promise<void> {
    try {
             const agentResult: AgentResultInsert = {
         agent_config_id: context.configId,
         execution_time: new Date().toISOString(),
         status: result.success ? 'success' : 'error',
         results: result.data || null,
         error_message: result.error || null,
         metadata: {
           ...result.metadata,
           agent_type: this.agentType,
           agent_version: this.version,
         },
       };

      await db.createAgentResult(agentResult);
    } catch (error) {
      console.error('Failed to log agent result:', error);
    }
  }

  /**
   * Update agent configuration with new status
   */
     protected async updateConfigStatus(
     configId: string,
     userId: string,
     isActive: boolean,
     lastError?: string
   ): Promise<void> {
     try {
       await db.updateAgentConfiguration(configId, userId, {
         is_active: isActive,
         last_execution: new Date().toISOString(),
         // Note: last_error field doesn't exist in schema, store in configuration instead
         configuration: lastError ? { 
           ...((await db.getAgentConfigurations(userId)).find(c => c.id === configId)?.configuration || {}),
           last_error: lastError 
         } : undefined,
       });
     } catch (error) {
       console.error('Failed to update agent config status:', error);
     }
   }

  /**
   * Execute agent with full lifecycle management
   */
  async executeWithLifecycle(context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Pre-execution logging
      console.log(`Executing agent: ${this.name} (${this.agentType}) for user ${context.userId}`);
      
             // Update status to running (keep active but mark as running in config)
       await this.updateConfigStatus(context.configId, context.userId, true);
      
      // Validate configuration
      const validation = this.validateConfig(context.config);
             if (!validation.valid) {
         const error = `Configuration validation failed: ${validation.errors.join(', ')}`;
         await this.updateConfigStatus(context.configId, context.userId, false, error);
         return { success: false, error };
       }

      // Execute agent
      const result = await this.execute(context);
      
      // Update execution metadata
      result.metadata = {
        ...result.metadata,
        execution_duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };

      // Log result
      await this.logResult(context, result);
      
             // Update status
       await this.updateConfigStatus(
         context.configId, 
         context.userId, 
         result.success,
         result.error
       );

      console.log(`Agent execution completed: ${this.name} - ${result.success ? 'SUCCESS' : 'FAILED'}`);
      
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Agent execution failed: ${this.name}`, error);
      
      // Log error
      const errorResult: AgentExecutionResult = {
        success: false,
        error: errorMessage,
        metadata: {
          execution_duration_ms: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
      };
      
             await this.logResult(context, errorResult);
       await this.updateConfigStatus(context.configId, context.userId, false, errorMessage);
       
       return errorResult;
    }
  }

  /**
   * Get API client for external services
   */
  protected async getApiClient(
    context: AgentExecutionContext,
    service: 'openai' | 'claude'
  ): Promise<any> {
    if (!context.apiKeys) {
      throw new Error('API keys not available in execution context');
    }

    switch (service) {
      case 'openai':
        if (!context.apiKeys.openai_api_key) {
          throw new Error('OpenAI API key not configured');
        }
        // Return OpenAI client (would need to install openai package)
        // const { OpenAI } = await import('openai');
        // return new OpenAI({ apiKey: context.apiKeys.openai_api_key });
        throw new Error('OpenAI client not implemented yet');
        
      case 'claude':
        if (!context.apiKeys.claude_api_key) {
          throw new Error('Claude API key not configured');
        }
        // Return Claude client (would need to install @anthropic-ai/sdk)
        // const { Anthropic } = await import('@anthropic-ai/sdk');
        // return new Anthropic({ apiKey: context.apiKeys.claude_api_key });
        throw new Error('Claude client not implemented yet');
        
      default:
        throw new Error(`Unsupported API service: ${service}`);
    }
  }

  /**
   * Schedule next execution for recurring agents
   */
     protected calculateNextExecution(
     config: AgentConfiguration,
     lastExecution?: Date
   ): Date | null {
     if (!config.schedule) {
       return null;
     }

     // Simple schedule calculation (in production, use a proper cron parser)
     const now = new Date();
     const schedule = config.schedule;

    // Parse basic schedules like "*/5 * * * *" (every 5 minutes)
    if (schedule === '*/5 * * * *') {
      return new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
    } else if (schedule === '0 * * * *') {
      return new Date(now.getTime() + 60 * 60 * 1000); // 1 hour
    } else if (schedule === '0 0 * * *') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow; // Daily at midnight
    }

    // Default: 1 hour for unknown schedules
    return new Date(now.getTime() + 60 * 60 * 1000);
  }

  /**
   * Utility method for making HTTP requests
   */
  protected async makeHttpRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('HTTP request failed:', error);
      throw error;
    }
  }

  /**
   * Send notification to user
   */
  protected async sendNotification(
    context: AgentExecutionContext,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'error' | 'success' = 'info'
  ): Promise<void> {
    try {
      // In a real implementation, this would send notifications via:
      // - Web push notifications
      // - Email (if enabled in user settings)
      // - Database notification system
      
      console.log(`Notification for user ${context.userId}: [${type.toUpperCase()}] ${title} - ${message}`);
      
      // TODO: Implement actual notification system
      // await notificationService.send({
      //   userId: context.userId,
      //   title,
      //   message,
      //   type,
      //   source: this.agentType
      // });
      
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
} 