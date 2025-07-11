// Agent Scheduler für Family Toolbox Multi-Agent System
// Verwaltet geplante Ausführungen von Agents

import { db } from '@/lib/services/database';
import { agentRegistry } from './registry';
import type { 
  AgentConfiguration, 
  AgentType 
} from '@/lib/types/database';
import type { AgentExecutionContext } from './base-agent';

export interface ScheduledJob {
  id: string;
  agentConfigId: string;
  userId: string;
  agentType: AgentType;
  schedule: string;
  nextExecution: Date;
  isActive: boolean;
  metadata?: Record<string, any>;
}

export class AgentScheduler {
  private static instance: AgentScheduler;
  private scheduledJobs: Map<string, ScheduledJob> = new Map();
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private checkInterval: number = 60000; // Check every minute

  private constructor() {}

  static getInstance(): AgentScheduler {
    if (!AgentScheduler.instance) {
      AgentScheduler.instance = new AgentScheduler();
    }
    return AgentScheduler.instance;
  }

  // ==========================================
  // SCHEDULER LIFECYCLE
  // ==========================================

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Agent scheduler is already running');
      return;
    }

    console.log('Starting Agent Scheduler...');
    this.isRunning = true;

    // Load existing scheduled jobs
    await this.loadScheduledJobs();

    // Start the scheduler loop
    this.intervalId = setInterval(() => {
      this.checkAndExecuteJobs();
    }, this.checkInterval);

    console.log(`Agent Scheduler started with ${this.scheduledJobs.size} scheduled jobs`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      console.log('Agent scheduler is not running');
      return;
    }

    console.log('Stopping Agent Scheduler...');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.scheduledJobs.clear();
    console.log('Agent Scheduler stopped');
  }

  isActive(): boolean {
    return this.isRunning;
  }

  // ==========================================
  // JOB MANAGEMENT
  // ==========================================

  async scheduleAgent(config: AgentConfiguration): Promise<void> {
    if (!config.schedule || !config.is_active) {
      return;
    }

    const nextExecution = this.calculateNextExecution(config.schedule);
    if (!nextExecution) {
      console.warn(`Unable to calculate next execution for agent config ${config.id}`);
      return;
    }

    const job: ScheduledJob = {
      id: `job-${config.id}`,
      agentConfigId: config.id,
      userId: config.user_id,
      agentType: config.agent_type as AgentType,
      schedule: config.schedule,
      nextExecution,
      isActive: config.is_active,
      metadata: {
        configName: config.name,
        lastScheduled: new Date().toISOString()
      }
    };

    this.scheduledJobs.set(job.id, job);
    console.log(`Scheduled agent ${config.name} (${config.agent_type}) for execution at ${nextExecution.toISOString()}`);

    // Update database with next execution time
    await db.updateAgentConfiguration(config.id, config.user_id, {
      next_execution: nextExecution.toISOString()
    });
  }

  async unscheduleAgent(configId: string): Promise<void> {
    const jobId = `job-${configId}`;
    const job = this.scheduledJobs.get(jobId);
    
    if (job) {
      this.scheduledJobs.delete(jobId);
      console.log(`Unscheduled agent config ${configId}`);
    }
  }

  async rescheduleAgent(config: AgentConfiguration): Promise<void> {
    await this.unscheduleAgent(config.id);
    if (config.is_active && config.schedule) {
      await this.scheduleAgent(config);
    }
  }

  // ==========================================
  // JOB EXECUTION
  // ==========================================

  private async checkAndExecuteJobs(): Promise<void> {
    const now = new Date();
    const jobsToExecute: ScheduledJob[] = [];

    // Find jobs that are due for execution
    for (const job of this.scheduledJobs.values()) {
      if (job.isActive && job.nextExecution <= now) {
        jobsToExecute.push(job);
      }
    }

    if (jobsToExecute.length === 0) {
      return;
    }

    console.log(`Executing ${jobsToExecute.length} scheduled agent jobs`);

    // Execute jobs in parallel (with some concurrency limit)
    const concurrencyLimit = 3;
    for (let i = 0; i < jobsToExecute.length; i += concurrencyLimit) {
      const batch = jobsToExecute.slice(i, i + concurrencyLimit);
      
      await Promise.allSettled(
        batch.map(job => this.executeJob(job))
      );
    }
  }

  private async executeJob(job: ScheduledJob): Promise<void> {
    try {
      console.log(`Executing scheduled job: ${job.id} (${job.agentType})`);

      // Get agent configuration from database
      const configs = await db.getAgentConfigurations(job.userId);
      const config = configs.find(c => c.id === job.agentConfigId);
      
      if (!config) {
        console.error(`Agent configuration not found: ${job.agentConfigId}`);
        await this.unscheduleAgent(job.agentConfigId);
        return;
      }

      if (!config.is_active) {
        console.log(`Agent configuration is inactive: ${job.agentConfigId}`);
        await this.unscheduleAgent(job.agentConfigId);
        return;
      }

      // Get agent instance
      const agent = agentRegistry.getAgent(job.agentType);
      if (!agent) {
        console.error(`Agent implementation not found: ${job.agentType}`);
        return;
      }

      // Get user API keys
      const apiKeys = await db.getDecryptedApiKeys(job.userId);

      // Create execution context
      const context: AgentExecutionContext = {
        userId: job.userId,
        configId: job.agentConfigId,
        config,
        apiKeys,
        userSettings: await db.getUserSettings(job.userId)
      };

      // Execute agent
      const result = await agent.executeWithLifecycle(context);

      if (result.success) {
        console.log(`Scheduled job completed successfully: ${job.id}`);
      } else {
        console.error(`Scheduled job failed: ${job.id} - ${result.error}`);
      }

      // Calculate next execution time
      const nextExecution = this.calculateNextExecution(job.schedule);
      if (nextExecution) {
        job.nextExecution = nextExecution;
        
        // Update database
        await db.updateAgentConfiguration(job.agentConfigId, job.userId, {
          next_execution: nextExecution.toISOString(),
          execution_count: config.execution_count + 1
        });
        
        console.log(`Next execution scheduled for ${job.id}: ${nextExecution.toISOString()}`);
      } else {
        console.warn(`Unable to calculate next execution for job ${job.id}, unscheduling`);
        await this.unscheduleAgent(job.agentConfigId);
      }

    } catch (error) {
      console.error(`Error executing scheduled job ${job.id}:`, error);
    }
  }

  // ==========================================
  // SCHEDULE PARSING
  // ==========================================

  private calculateNextExecution(schedule: string): Date | null {
    const now = new Date();

    try {
      // Simple cron-like schedule parsing
      // Format: "*/minutes * * * *" or "minute hour * * *" or preset names
      
      if (schedule === 'hourly') {
        return new Date(now.getTime() + 60 * 60 * 1000);
      } else if (schedule === 'daily') {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
      } else if (schedule === 'weekly') {
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(0, 0, 0, 0);
        return nextWeek;
      }

      // Parse cron-like expressions
      const parts = schedule.split(' ');
      if (parts.length !== 5) {
        console.warn(`Invalid schedule format: ${schedule}`);
        return null;
      }

      const [minute, hour, day, month, weekday] = parts;

      // Handle interval patterns like "*/5"
      if (minute.startsWith('*/')) {
        const interval = parseInt(minute.substring(2));
        if (!isNaN(interval) && interval > 0) {
          return new Date(now.getTime() + interval * 60 * 1000);
        }
      }

      // Handle hourly patterns like "0 * * * *"
      if (minute !== '*' && hour === '*') {
        const targetMinute = parseInt(minute);
        if (!isNaN(targetMinute) && targetMinute >= 0 && targetMinute <= 59) {
          const next = new Date(now);
          next.setMinutes(targetMinute, 0, 0);
          
          // If the target time has passed this hour, schedule for next hour
          if (next <= now) {
            next.setHours(next.getHours() + 1);
          }
          
          return next;
        }
      }

      // Handle daily patterns like "0 9 * * *" (9 AM daily)
      if (minute !== '*' && hour !== '*' && day === '*') {
        const targetMinute = parseInt(minute);
        const targetHour = parseInt(hour);
        
        if (!isNaN(targetMinute) && !isNaN(targetHour) && 
            targetMinute >= 0 && targetMinute <= 59 &&
            targetHour >= 0 && targetHour <= 23) {
          
          const next = new Date(now);
          next.setHours(targetHour, targetMinute, 0, 0);
          
          // If the target time has passed today, schedule for tomorrow
          if (next <= now) {
            next.setDate(next.getDate() + 1);
          }
          
          return next;
        }
      }

      console.warn(`Unsupported schedule format: ${schedule}`);
      return null;

    } catch (error) {
      console.error(`Error parsing schedule "${schedule}":`, error);
      return null;
    }
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  private async loadScheduledJobs(): Promise<void> {
    try {
      // This would typically load from database
      // For now, we'll load active agent configurations
      console.log('Loading scheduled jobs from database...');
      
      // Implementation would fetch all active agent configurations with schedules
      // and add them to the scheduler
      
    } catch (error) {
      console.error('Error loading scheduled jobs:', error);
    }
  }

  getScheduledJobs(): ScheduledJob[] {
    return Array.from(this.scheduledJobs.values());
  }

  getJobsForUser(userId: string): ScheduledJob[] {
    return Array.from(this.scheduledJobs.values()).filter(job => job.userId === userId);
  }

  getJobsByAgentType(agentType: AgentType): ScheduledJob[] {
    return Array.from(this.scheduledJobs.values()).filter(job => job.agentType === agentType);
  }

  getSchedulerStats(): {
    totalJobs: number;
    activeJobs: number;
    jobsByType: Record<string, number>;
    nextExecution?: Date;
  } {
    const jobs = Array.from(this.scheduledJobs.values());
    const activeJobs = jobs.filter(job => job.isActive);
    
    const jobsByType = jobs.reduce((acc, job) => {
      acc[job.agentType] = (acc[job.agentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const nextExecution = activeJobs
      .map(job => job.nextExecution)
      .sort((a, b) => a.getTime() - b.getTime())[0];

    return {
      totalJobs: jobs.length,
      activeJobs: activeJobs.length,
      jobsByType,
      nextExecution
    };
  }
}

// Export singleton instance
export const agentScheduler = AgentScheduler.getInstance(); 