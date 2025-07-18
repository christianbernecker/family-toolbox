import { NextRequest, NextResponse } from 'next/server';
import { RobustSessionHandler } from '@/lib/auth/robust-session-handler';
import { ApiUsageService } from '@/lib/services/api-usage-service';
import { LogService } from '@/lib/services/log-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const logger = LogService.getInstance();
  await logger.info('api/admin/api-usage-stats', 'API usage stats request started');

  try {
    // Session-Validierung
    const sessionHandler = RobustSessionHandler.getInstance();
    const sessionResult = await sessionHandler.validateApiSession(request);

    if (!sessionResult.session || !sessionResult.userId) {
      await logger.warn('api/admin/api-usage-stats', 'Session validation failed', { error: sessionResult.error });
      return NextResponse.json(
        { error: 'Unauthorized', details: sessionResult.error },
        { status: 401 }
      );
    }

    await logger.info('api/admin/api-usage-stats', 'Session validated successfully', {
      userId: sessionResult.userId
    }, sessionResult.userId);

    // URL Parameter
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Invalid days parameter', details: 'Days must be between 1 and 365' },
        { status: 400 }
      );
    }

    // API Usage Service
    const apiUsageService = ApiUsageService.getInstance();
    const stats = await apiUsageService.getUsageStats(sessionResult.userId, days);

    await logger.info('api/admin/api-usage-stats', 'API usage stats retrieved successfully', {
      days,
      providersCount: stats.length,
      totalRequests: stats.reduce((sum, s) => sum + s.requestCount, 0)
    }, sessionResult.userId);

    return NextResponse.json({
      success: true,
      data: stats,
      meta: {
        days,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    await logger.error('api/admin/api-usage-stats', 'Unexpected error in API usage stats handler', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 