// Daily Summaries API Route für Email Agent
// Abrufen der täglichen E-Mail-Zusammenfassungen

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LogService } from '../../../../lib/services/log-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const logger = LogService.getInstance();

// GET: Tägliche Zusammenfassungen abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    await logger.info('summaries-api', 'Fetching daily summaries', { limit, offset });
    
    const { data: summaries, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    await logger.info('summaries-api', `Retrieved ${summaries?.length || 0} summaries`);
    
    return NextResponse.json({
      success: true,
      summaries: summaries || []
    });

  } catch (error) {
    await logger.error('summaries-api', 'Failed to fetch summaries', {
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