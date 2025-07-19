// E-Mail Agent API Route
// Koordiniert alle drei Agents: Mail Manager, Summary Generator, Learning Optimizer

import { NextRequest, NextResponse } from 'next/server';
import { MailManagerService } from '../../../lib/email-agent/mail-manager';
import { SummaryGeneratorService } from '../../../lib/email-agent/summary-generator';
import { LearningOptimizerService } from '../../../lib/email-agent/learning-optimizer';
import { LogService } from '../../../lib/services/log-service';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const logger = LogService.getInstance();
  
  try {
    await logger.info('email-agent-api', 'Starting E-Mail Agent processing');
    
    const body = await request.json();
    const { action, accountId } = body;
    
    // Validierung der Aktion
    const validActions = ['fetch', 'process', 'learn', 'full-cycle', 'start'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Valid actions: fetch, process, learn, full-cycle, start' },
        { status: 400 }
      );
    }
    
    const results: any = {};
    
    // Agent 1: Mail Manager (E-Mails abrufen)
    if (action === 'fetch' || action === 'full-cycle' || action === 'start') {
      try {
        await logger.info('email-agent-api', 'Starting Mail Manager (Agent 1)');
        const mailManager = MailManagerService.getInstance();
        const fetchResults = await mailManager.processAllAccounts();
        results.mailManager = {
          success: true,
          results: fetchResults,
          totalNewEmails: fetchResults.reduce((sum, r) => sum + r.newEmails, 0)
        };
        await logger.info('email-agent-api', 'Completed Mail Manager (Agent 1)', {
          totalNewEmails: results.mailManager.totalNewEmails
        });
      } catch (error) {
        results.mailManager = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        await logger.error('email-agent-api', 'Mail Manager (Agent 1) failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Agent 2: Summary Generator (E-Mails verarbeiten)
    if (action === 'process' || action === 'full-cycle' || action === 'start') {
      try {
        await logger.info('email-agent-api', 'Starting Summary Generator (Agent 2)');
        const summaryGenerator = SummaryGeneratorService.getInstance();
        await summaryGenerator.processNewEmails();
        results.summaryGenerator = {
          success: true,
          message: 'New emails processed successfully'
        };
        await logger.info('email-agent-api', 'Completed Summary Generator (Agent 2)');
      } catch (error) {
        results.summaryGenerator = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        await logger.error('email-agent-api', 'Summary Generator (Agent 2) failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Agent 3: Learning Optimizer (Feedback verarbeiten)
    if (action === 'learn' || action === 'full-cycle') {
      try {
        await logger.info('email-agent-api', 'Starting Learning Optimizer (Agent 3)');
        const learningOptimizer = LearningOptimizerService.getInstance();
        await learningOptimizer.processFeedback();
        results.learningOptimizer = {
          success: true,
          message: 'Feedback processed successfully'
        };
        await logger.info('email-agent-api', 'Completed Learning Optimizer (Agent 3)');
      } catch (error) {
        results.learningOptimizer = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        await logger.error('email-agent-api', 'Learning Optimizer (Agent 3) failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Cleanup alter E-Mails (nur bei full-cycle)
    if (action === 'full-cycle') {
      try {
        await logger.info('email-agent-api', 'Starting cleanup of old emails');
        const mailManager = MailManagerService.getInstance();
        await mailManager.cleanupOldEmails(30); // 30 Tage Retention
        results.cleanup = {
          success: true,
          message: 'Old emails cleaned up successfully'
        };
        await logger.info('email-agent-api', 'Completed cleanup of old emails');
      } catch (error) {
        results.cleanup = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        await logger.error('email-agent-api', 'Cleanup failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    const processingTime = Date.now() - startTime;
    
    await logger.info('email-agent-api', 'Completed E-Mail Agent processing', {
      action,
      processingTime,
      results: Object.keys(results)
    });
    
    return NextResponse.json({
      success: true,
      action,
      processingTime,
      results,
      isRunning: true
    });
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    await logger.error('email-agent-api', 'E-Mail Agent processing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTime
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        isRunning: false
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const logger = LogService.getInstance();
    await logger.info('email-agent-api', 'E-Mail Agent status check');
    
    // Status-Informationen sammeln
    const status = {
      timestamp: new Date().toISOString(),
      isRunning: false, // Default false, set to true during processing
      agents: {
        mailManager: 'available',
        summaryGenerator: 'available',
        learningOptimizer: 'available'
      },
      environment: {
        supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anthropic: !!process.env.ANTHROPIC_API_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    };
    
    return NextResponse.json({
      success: true,
      ...status
    });
    
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        isRunning: false
      },
      { status: 500 }
    );
  }
} 