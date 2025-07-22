export const dynamic = 'force-dynamic';

// E-Mail Agent Main API Route
// System-Status und manuelle Trigger für das Multi-Agent E-Mail-System

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createClient } from '@supabase/supabase-js';
import { LogService } from '../../../lib/services/log-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const logger = LogService.getInstance();

// GET: System-Status abrufen
export async function GET(request: NextRequest) {
  try {
    await logger.info('email-agent-api', 'System status requested');

    // System-Status zusammenstellen
    const status = await getSystemStatus();

    return NextResponse.json({
      success: true,
      status: status,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logger.error('email-agent-api', `Failed to get system status: ${errorMessage}`);
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

// POST: Manuelle Aktionen ausführen
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();
    await logger.info('email-agent-api', `Manual action triggered: ${action}`);

    switch (action) {
      case 'manual_run':
        return await triggerManualRun();
      
      case 'force_sync':
        return await forceSyncAllAccounts();
      
      case 'generate_summary':
        return await generateDailySummary();
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logger.error('email-agent-api', `Failed to execute action: ${errorMessage}`);
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

async function getSystemStatus() {
  try {
    // Aktive E-Mail-Konten zählen
    const { data: accounts, error: accountsError } = await supabase
      .from('email_accounts')
      .select('id, is_active, last_checked, error_count')
      .eq('is_active', true);

    if (accountsError) {
      throw new Error(`Failed to fetch accounts: ${accountsError.message}`);
    }

    const activeAccounts = accounts?.length || 0;

    // E-Mails heute zählen
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: todayEmails, error: emailsError } = await supabase
      .from('emails')
      .select('id')
      .gte('received_at', today.toISOString());

    if (emailsError) {
      throw new Error(`Failed to fetch today's emails: ${emailsError.message}`);
    }

    const totalEmailsToday = todayEmails?.length || 0;

    // Zusammenfassungen heute zählen
    const { data: todaySummaries, error: summariesError } = await supabase
      .from('daily_summaries')
      .select('id')
      .gte('created_at', today.toISOString());

    if (summariesError) {
      throw new Error(`Failed to fetch today's summaries: ${summariesError.message}`);
    }

    const summariesGenerated = todaySummaries?.length || 0;

    // Letzten und nächsten Lauf ermitteln
    const { data: lastRun } = await supabase
      .from('system_logs')
      .select('created_at')
      .eq('source', 'mail-manager')
      .eq('level', 'info')
      .like('message', '%completed successfully%')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // System-Health bewerten
    const errorAccounts = accounts?.filter(acc => acc.error_count > 0).length || 0;
    const staleBoundary = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 Stunden
    const staleAccounts = accounts?.filter(acc => 
      !acc.last_checked || new Date(acc.last_checked) < staleBoundary
    ).length || 0;

    let systemHealth: 'healthy' | 'warning' | 'error' = 'healthy';
    const errors: string[] = [];

    if (errorAccounts > 0) {
      systemHealth = 'warning';
      errors.push(`${errorAccounts} Konten haben Fehler`);
    }

    if (staleAccounts > 0) {
      if (systemHealth === 'healthy') systemHealth = 'warning';
      errors.push(`${staleAccounts} Konten sind veraltet`);
    }

    if (activeAccounts === 0) {
      systemHealth = 'error';
      errors.push('Keine aktiven E-Mail-Konten');
    }

    // Nächster geplanter Lauf (alle 30 Minuten)
    const nextRun = new Date();
    if (lastRun) {
      const lastRunTime = new Date(lastRun.created_at);
      nextRun.setTime(lastRunTime.getTime() + 30 * 60 * 1000);
    } else {
      nextRun.setTime(nextRun.getTime() + 30 * 60 * 1000);
    }

    return {
      last_run: lastRun?.created_at || null,
      next_run: nextRun.toISOString(),
      active_accounts: activeAccounts,
      total_emails_today: totalEmailsToday,
      summaries_generated: summariesGenerated,
      system_health: systemHealth,
      errors: errors,
      uptime: process.uptime(),
      version: '1.0.0'
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logger.error('email-agent-api', `Failed to get system status: ${errorMessage}`);
    throw error;
  }
}

async function triggerManualRun() {
  try {
    await logger.info('email-agent-api', 'Manual run triggered');

    // Trigger Mail Manager via Netlify Function
    const mailManagerResponse = await fetch(`${process.env.NEXTAUTH_URL}/.netlify/functions/mail-manager`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({ source: 'manual_trigger' })
    });

    if (!mailManagerResponse.ok) {
      throw new Error(`Mail Manager failed: ${mailManagerResponse.statusText}`);
    }

    const mailResult = await mailManagerResponse.json();

    // Trigger Summary Generator nach dem Mail-Abruf
    if (mailResult.success && mailResult.new_emails > 0) {
      const summaryResponse = await fetch(`${process.env.NEXTAUTH_URL}/.netlify/functions/summary-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
        },
        body: JSON.stringify({ source: 'manual_trigger' })
      });

      const summaryResult = summaryResponse.ok ? await summaryResponse.json() : null;

      return NextResponse.json({
        success: true,
        message: 'Manual run completed',
        mail_result: mailResult,
        summary_result: summaryResult,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Manual run completed (no new emails)',
      mail_result: mailResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logger.error('email-agent-api', `Manual run failed: ${errorMessage}`);
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

async function forceSyncAllAccounts() {
  try {
    await logger.info('email-agent-api', 'Force sync all accounts triggered');

    // Reset error counts und last_checked für alle Accounts
    const { error: resetError } = await supabase
      .from('email_accounts')
      .update({
        error_count: 0,
        consecutive_errors: 0,
        last_checked: null
      })
      .eq('is_active', true);

    if (resetError) {
      throw new Error(`Failed to reset accounts: ${resetError.message}`);
    }

    // Trigger Mail Manager
    const response = await fetch(`${process.env.NEXTAUTH_URL}/.netlify/functions/mail-manager`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({ 
        source: 'force_sync',
        force_all: true 
      })
    });

    if (!response.ok) {
      throw new Error(`Force sync failed: ${response.statusText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Force sync completed',
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logger.error('email-agent-api', `Force sync failed: ${errorMessage}`);
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}

async function generateDailySummary() {
  try {
    await logger.info('email-agent-api', 'Generate daily summary triggered');

    // Trigger Summary Generator
    const response = await fetch(`${process.env.NEXTAUTH_URL}/.netlify/functions/summary-generator`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`
      },
      body: JSON.stringify({ 
        source: 'manual_summary',
        force_generate: true 
      })
    });

    if (!response.ok) {
      throw new Error(`Summary generation failed: ${response.statusText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Daily summary generated',
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await logger.error('email-agent-api', `Summary generation failed: ${errorMessage}`);
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
} 