// E-Mail Detail API Route
// Abrufen einer einzelnen E-Mail

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LogService } from '../../../../../lib/services/log-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const logger = LogService.getInstance();

// GET: Einzelne E-Mail abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const emailId = params.id;

    if (!emailId) {
      return NextResponse.json(
        { error: 'Email ID is required' },
        { status: 400 }
      );
    }

    await logger.info('email-detail-api', 'Fetching email', { emailId });

    const { data: email, error } = await supabase
      .from('emails')
      .select(`
        *,
        email_accounts!inner(email, provider)
      `)
      .eq('id', emailId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Email not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    await logger.info('email-detail-api', 'Successfully retrieved email', { 
      emailId,
      subject: email.subject 
    });

    return NextResponse.json({
      success: true,
      email
    });

  } catch (error) {
    await logger.error('email-detail-api', 'Failed to fetch email', {
      error: error instanceof Error ? error.message : 'Unknown error',
      emailId: params.id
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