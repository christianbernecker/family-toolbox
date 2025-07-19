// E-Mail API Route für Email Agent
// Abrufen und Verwalten der verarbeiteten E-Mails

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
    const offset = parseInt(searchParams.get('offset') || '0');
    const accountId = searchParams.get('accountId');
    
    await logger.info('email-api', 'Fetching emails', { limit, offset, accountId });
    
    let query = supabase
      .from('processed_emails')
      .select('*')
      .order('received_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (accountId) {
      query = query.eq('account_id', accountId);
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