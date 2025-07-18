// E-Mail API Route
// Verwaltung von E-Mails

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LogService } from '../../../../lib/services/log-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const logger = LogService.getInstance();

// GET: E-Mails abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const accountId = searchParams.get('accountId');
    const category = searchParams.get('category');
    const minRelevance = searchParams.get('minRelevance');
    const isProcessed = searchParams.get('isProcessed');

    await logger.info('email-api', 'Fetching emails', { 
      limit, 
      accountId, 
      category, 
      minRelevance, 
      isProcessed 
    });

    let query = supabase
      .from('emails')
      .select(`
        *,
        email_accounts!inner(email, provider)
      `)
      .order('received_at', { ascending: false })
      .limit(limit);

    if (accountId) {
      query = query.eq('account_id', accountId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (minRelevance) {
      query = query.gte('relevance_score', parseInt(minRelevance));
    }

    if (isProcessed !== null) {
      query = query.eq('is_processed', isProcessed === 'true');
    }

    const { data: emails, error } = await query;

    if (error) {
      throw error;
    }

    await logger.info('email-api', `Retrieved ${emails?.length || 0} emails`);

    return NextResponse.json({
      success: true,
      emails: emails || []
    });

  } catch (error) {
    await logger.error('email-api', 'Failed to fetch emails', {
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