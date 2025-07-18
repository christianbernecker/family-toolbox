import { NextRequest, NextResponse } from 'next/server';
import { RobustSessionHandler } from '@/lib/auth/robust-session-handler';
import { SupabaseConnectionManager } from '@/lib/services/supabase-connection-manager';
import { LogService } from '@/lib/services/log-service';
import CryptoJS from 'crypto-js';

export const dynamic = 'force-dynamic';

interface TestResult {
  provider: 'openai' | 'anthropic';
  success: boolean;
  error?: string;
  details?: any;
  responseTime?: number;
}

export async function POST(request: NextRequest) {
  const logger = LogService.getInstance();
  await logger.info('api/test-api-keys', 'API Keys test started');

  try {
    // Session-Validierung
    const sessionHandler = RobustSessionHandler.getInstance();
    const sessionResult = await sessionHandler.validateApiSession(request);

    if (!sessionResult.session || !sessionResult.userId) {
      await logger.warn('api/test-api-keys', 'Session validation failed', { error: sessionResult.error });
      return NextResponse.json(
        { error: 'Unauthorized', details: sessionResult.error },
        { status: 401 }
      );
    }

    await logger.info('api/test-api-keys', 'Session validated successfully', {
      userId: sessionResult.userId
    }, sessionResult.userId);

    // API-Keys aus Datenbank laden
    const apiKeys = await getDecryptedApiKeys(sessionResult.userId);
    
    if (!apiKeys.openai_api_key && !apiKeys.anthropic_api_key) {
      await logger.warn('api/test-api-keys', 'No API keys found to test', {}, sessionResult.userId);
      return NextResponse.json({
        error: 'No API keys found',
        message: 'Bitte zuerst API-Keys speichern'
      }, { status: 400 });
    }

    const testResults: TestResult[] = [];

    // OpenAI API testen
    if (apiKeys.openai_api_key) {
      await logger.info('api/test-api-keys', 'Testing OpenAI API key', {}, sessionResult.userId);
      const openaiResult = await testOpenAiKey(apiKeys.openai_api_key);
      testResults.push(openaiResult);
      
      await logger.info('api/test-api-keys', 'OpenAI test completed', {
        success: openaiResult.success,
        error: openaiResult.error,
        responseTime: openaiResult.responseTime
      }, sessionResult.userId);
    }

    // Anthropic API testen
    if (apiKeys.anthropic_api_key) {
      await logger.info('api/test-api-keys', 'Testing Anthropic API key', {}, sessionResult.userId);
      const anthropicResult = await testAnthropicKey(apiKeys.anthropic_api_key);
      testResults.push(anthropicResult);
      
      await logger.info('api/test-api-keys', 'Anthropic test completed', {
        success: anthropicResult.success,
        error: anthropicResult.error,
        responseTime: anthropicResult.responseTime
      }, sessionResult.userId);
    }

    const successCount = testResults.filter(r => r.success).length;
    const totalCount = testResults.length;

    await logger.info('api/test-api-keys', 'API Keys test completed', {
      successCount,
      totalCount,
      results: testResults
    }, sessionResult.userId);

    return NextResponse.json({
      success: true,
      summary: {
        total: totalCount,
        successful: successCount,
        failed: totalCount - successCount
      },
      results: testResults
    });

  } catch (error) {
    await logger.error('api/test-api-keys', 'Unexpected error in test handler', { 
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

async function getDecryptedApiKeys(userId: string): Promise<{ openai_api_key?: string; anthropic_api_key?: string }> {
  const logger = LogService.getInstance();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!supabaseUrl || !serviceKey || !encryptionKey) {
    throw new Error('Missing required environment variables');
  }

  const { createClient } = await import('@supabase/supabase-js');
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await adminClient
    .from('user_secrets')
    .select('openai_api_key, anthropic_api_key')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    await logger.warn('api/test-api-keys', 'No API keys found for user', { userId });
    return {};
  }

  const result: { openai_api_key?: string; anthropic_api_key?: string } = {};

  // Entschlüsseln der Keys
  if (data.openai_api_key) {
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(data.openai_api_key, encryptionKey);
      result.openai_api_key = decryptedBytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      await logger.error('api/test-api-keys', 'Failed to decrypt OpenAI key', { error });
    }
  }

  if (data.anthropic_api_key) {
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(data.anthropic_api_key, encryptionKey);
      result.anthropic_api_key = decryptedBytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      await logger.error('api/test-api-keys', 'Failed to decrypt Anthropic key', { error });
    }
  }

  return result;
}

async function testOpenAiKey(apiKey: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        provider: 'openai',
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        responseTime
      };
    }

    const data = await response.json();
    
    return {
      provider: 'openai',
      success: true,
      details: {
        modelsCount: data.data?.length || 0,
        firstModel: data.data?.[0]?.id || 'unknown'
      },
      responseTime
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      provider: 'openai',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    };
  }
}

async function testAnthropicKey(apiKey: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    // Anthropic verwendet x-api-key Header anstatt Authorization Bearer
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1,
        messages: [
          {
            role: 'user',
            content: 'Hi'
          }
        ]
      }),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        provider: 'anthropic',
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        responseTime
      };
    }

    const data = await response.json();
    
    return {
      provider: 'anthropic',
      success: true,
      details: {
        model: data.model || 'unknown',
        usage: data.usage || {}
      },
      responseTime
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    return {
      provider: 'anthropic',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime
    };
  }
} 