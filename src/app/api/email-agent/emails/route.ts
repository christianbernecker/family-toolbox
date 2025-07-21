export const dynamic = 'force-dynamic';

// E-Mail API Route für Email Agent
// Abrufen und Verwalten der verarbeiteten E-Mails

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LogService } from '../../../../lib/services/log-service';
import Anthropic from '@anthropic-ai/sdk';

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

// POST: Manuelle Relevanz-Bewertung
export async function POST(request: NextRequest) {
  try {
    const { subject, from, body } = await request.json();
    
    if (!subject || !from || !body) {
      return NextResponse.json(
        { success: false, error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      );
    }

    await logger.info('email-api', 'Evaluating email relevance', { from, subject });

    // Claude API für Relevanz-Bewertung verwenden
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const prompt = `
Du bist ein AI-Assistent für einen Kita-Verein (wuermchen.org). 
Bewerte die Relevanz dieser E-Mail auf einer Skala von 1-10:

ABSENDER: ${from}
BETREFF: ${subject}
INHALT: ${body}

KONTEXT:
- Dies ist ein Kita-Verein
- Persönliche Mails sind wichtiger als System-/Werbemails
- amandabernecker@gmail.com hat höchste Priorität
- Finanzen und Vorstandsthemen sind wichtig

KATEGORIEN:
- personal: Persönliche Kommunikation, wichtige Anfragen
- system: Automatische Benachrichtigungen, Server-Mails
- marketing: Werbung, Newsletter, Spam
- other: Alles andere

Antworte NUR mit diesem JSON-Format:
{
  "score": <1-10>,
  "confidence": <0.0-1.0>,
  "category": "<personal|system|marketing|other>",
  "reasoning": "<kurze Begründung>"
}
`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }]
    });

    const resultText = response.content[0].type === 'text' ? response.content[0].text : '';
    const result = JSON.parse(resultText);

    await logger.info('email-api', 'Email relevance evaluated', { 
      score: result.score, 
      category: result.category 
    });
    
    return NextResponse.json({
      success: true,
      relevance_score: result.score,
      category: result.category,
      confidence: result.confidence,
      reasoning: result.reasoning
    });

  } catch (error) {
    await logger.error('email-api', 'Failed to evaluate email relevance', {
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