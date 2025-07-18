import { NextRequest, NextResponse } from 'next/server';
import { LogService, LogLevel } from '@/lib/services/log-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Frontend kann Logs an diese Route senden
 * POST /api/log
 */
export async function POST(request: NextRequest) {
  try {
    const logger = LogService.getInstance();
    
    // Request-Body validieren
    const body = await request.json();
    const { level, source, message, payload } = body;

    if (!level || !source || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: level, source, message' },
        { status: 400 }
      );
    }

    // Level validieren
    const validLevels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: 'Invalid log level. Must be: DEBUG, INFO, WARN, ERROR' },
        { status: 400 }
      );
    }

    // Log schreiben
    await logger.log({
      level,
      source: `frontend:${source}`,
      message,
      payload,
      sessionId: request.headers.get('x-session-id') || undefined
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API /log error:', error);
    return NextResponse.json(
      { error: 'Failed to process log entry' },
      { status: 500 }
    );
  }
}

/**
 * Admin kann Logs abrufen
 * GET /api/log?limit=100&level=ERROR&source=api
 */
export async function GET(request: NextRequest) {
  try {
    const logger = LogService.getInstance();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '100');
    const level = searchParams.get('level') as LogLevel | undefined;
    const source = searchParams.get('source') || undefined;

    const logs = await logger.getLogs(limit, level, source);

    return NextResponse.json({ 
      success: true, 
      data: logs,
      count: logs.length 
    });

  } catch (error) {
    console.error('API /log GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    );
  }
} 