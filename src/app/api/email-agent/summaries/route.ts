// E-Mail Summaries API Route
// Verwaltung von E-Mail-Zusammenfassungen

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LogService } from '../../../../lib/services/log-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const logger = LogService.getInstance();

// GET: Zusammenfassungen abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const accountId = searchParams.get('accountId');
    const date = searchParams.get('date');

    await logger.info('email-summaries-api', 'Fetching summaries', { limit, accountId, date });

    let query = supabase
      .from('daily_summaries')
      .select(`
        *,
        email_accounts!inner(email, provider)
      `)
      .order('date', { ascending: false })
      .limit(limit);

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    if (date) {
      query = query.eq('date', date);
    }

    const { data: summaries, error } = await query;

    if (error) {
      throw error;
    }

    await logger.info('email-summaries-api', `Retrieved ${summaries?.length || 0} summaries`);

    return NextResponse.json({
      success: true,
      summaries: summaries || []
    });

  } catch (error) {
    await logger.error('email-summaries-api', 'Failed to fetch summaries', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 