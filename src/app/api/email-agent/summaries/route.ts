export const dynamic = 'force-dynamic';

// Daily Summaries API Route für Email Agent
// Abrufen der täglichen E-Mail-Zusammenfassungen

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LogService } from '../../../../lib/services/log-service';
import Anthropic from '@anthropic-ai/sdk';

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

// POST: Manuelle Zusammenfassung erstellen
export async function POST(request: NextRequest) {
  try {
    const { subject, from, body } = await request.json();
    
    if (!subject || !from || !body) {
      return NextResponse.json(
        { success: false, error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      );
    }

    await logger.info('summaries-api', 'Creating manual summary', { from, subject });

    // Claude API für Zusammenfassung verwenden
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const prompt = `
Erstelle eine prägnante deutsche Zusammenfassung für diese E-Mail:

ABSENDER: ${from}
BETREFF: ${subject}
INHALT: ${body}

ANFORDERUNGEN:
- Fasse die wichtigsten Informationen zusammen
- Verwende deutsche Sprache
- Sei prägnant aber informativ
- Strukturiere die Zusammenfassung klar
- Hebe besonders wichtige Punkte hervor
- Erwähne Handlungsbedarf falls vorhanden

Zusammenfassung:
`;

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }]
    });

    const summaryText = response.content[0].type === 'text' ? response.content[0].text : '';

    // Zusammenfassung in Datenbank speichern
    const { data: summary, error } = await supabase
      .from('daily_summaries')
      .insert({
        date: new Date().toISOString().split('T')[0],
        time_range_start: new Date().toISOString(),
        time_range_end: new Date().toISOString(),
        summary_text: summaryText,
        total_emails: 1,
        relevant_emails: 1,
        high_priority_emails: 0,
        prompt_version: 'manual-v1.0'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await logger.info('summaries-api', 'Manual summary created successfully', { summaryId: summary.id });
    
    return NextResponse.json({
      success: true,
      summary: summaryText,
      summaryId: summary.id
    });

  } catch (error) {
    await logger.error('summaries-api', 'Failed to create manual summary', {
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