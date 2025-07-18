import { NextRequest, NextResponse } from 'next/server';
import { RobustSessionHandler } from '@/lib/auth/robust-session-handler';
import { SupabaseConnectionManager } from '@/lib/services/supabase-connection-manager';
import { ApiKeys } from '@/lib/types';
import { LogService } from '@/lib/services/log-service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const logger = LogService.getInstance();
  await logger.info('api/settings/api-keys', 'GET request started');

  try {
    // Schritt 1: Robuste Session-Validierung
    const sessionHandler = RobustSessionHandler.getInstance();
    const sessionResult = await sessionHandler.validateApiSession(request);

    if (!sessionResult.session || !sessionResult.userId) {
      await logger.warn('api/settings/api-keys', 'Session validation failed', { error: sessionResult.error });
      return NextResponse.json(
        { error: 'Unauthorized', details: sessionResult.error },
        { status: 401 }
      );
    }

    await logger.info('api/settings/api-keys', 'Session validated successfully', {
      source: sessionResult.source,
      userId: sessionResult.userId
    }, sessionResult.userId);

    // Schritt 2: Robuste Supabase-Verbindung
    const connectionManager = SupabaseConnectionManager.getInstance();
    const connectionResult = await connectionManager.getConnection();

    if (!connectionResult.success || !connectionResult.client) {
      await logger.error('api/settings/api-keys', 'Supabase connection failed', {
        error: connectionResult.error,
        diagnostics: connectionResult.diagnostics
      }, sessionResult.userId);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: connectionResult.error,
          diagnostics: connectionResult.diagnostics
        },
        { status: 500 }
      );
    }

    await logger.info('api/settings/api-keys', 'Supabase connection successful', connectionResult.diagnostics, sessionResult.userId);

    // Schritt 3: Robuste Datenabfrage mit Retry-Logik
    const apiKeysResult = await getApiKeysWithRetry(
      sessionResult.userId,
      3 // max retries
    );

    if (!apiKeysResult.success) {
      await logger.error('api/settings/api-keys', 'API keys retrieval failed', { error: apiKeysResult.error }, sessionResult.userId);
      return NextResponse.json(
        { 
          error: 'Failed to retrieve API keys',
          details: apiKeysResult.error
        },
        { status: 500 }
      );
    }

    await logger.info('api/settings/api-keys', 'API keys retrieved successfully', apiKeysResult.data, sessionResult.userId);

    return NextResponse.json({ success: true, data: apiKeysResult.data });

  } catch (error) {
    await logger.error('api/settings/api-keys', 'Unexpected error in GET handler', { 
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

export async function POST(request: NextRequest) {
  const logger = LogService.getInstance();
  await logger.info('api/settings/api-keys', 'POST request started');

  try {
    // Schritt 1: Robuste Session-Validierung
    const sessionHandler = RobustSessionHandler.getInstance();
    const sessionResult = await sessionHandler.validateApiSession(request);

    if (!sessionResult.session || !sessionResult.userId) {
      await logger.warn('api/settings/api-keys', 'POST: Session validation failed', { error: sessionResult.error });
      return NextResponse.json(
        { error: 'Unauthorized', details: sessionResult.error },
        { status: 401 }
      );
    }

    await logger.info('api/settings/api-keys', 'POST: Session validated successfully', {
      source: sessionResult.source,
      userId: sessionResult.userId
    }, sessionResult.userId);

    // Stelle sicher, dass ein users-Datensatz existiert (FK-Constraint)
    if (sessionResult.session?.user?.email) {
      await ensureSupabaseUserExists(sessionResult.userId, sessionResult.session.user.email);
    }

    // Schritt 2: Request-Body validieren
    let body: ApiKeys;
    try {
      body = await request.json();
      await logger.debug('api/settings/api-keys', 'POST: Request body received', { 
        keys: Object.keys(body),
        hasOpenAI: !!body.openai_api_key,
        hasAnthropic: !!body.anthropic_api_key,
        openAILength: body.openai_api_key ? body.openai_api_key.length : 0,
        anthropicLength: body.anthropic_api_key ? body.anthropic_api_key.length : 0
      }, sessionResult.userId);
    } catch (error) {
      await logger.error('api/settings/api-keys', 'POST: Invalid request body', { error }, sessionResult.userId);
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Schritt 3: Robuste Supabase-Verbindung
    const connectionManager = SupabaseConnectionManager.getInstance();
    const connectionResult = await connectionManager.getConnection();

    if (!connectionResult.success || !connectionResult.client) {
      await logger.error('api/settings/api-keys', 'POST: Supabase connection failed', {
        error: connectionResult.error,
        diagnostics: connectionResult.diagnostics
      }, sessionResult.userId);
      return NextResponse.json(
        { 
          error: 'Database connection failed',
          details: connectionResult.error,
          diagnostics: connectionResult.diagnostics
        },
        { status: 500 }
      );
    }

    await logger.info('api/settings/api-keys', 'POST: Supabase connection successful', {}, sessionResult.userId);

    // Schritt 4: Robuste Datenspeicherung mit Retry-Logik
    const saveResult = await saveApiKeysWithRetry(
      sessionResult.userId,
      body,
      3 // max retries
    );

    if (!saveResult.success) {
      await logger.error('api/settings/api-keys', 'POST: API keys save failed', { error: saveResult.error }, sessionResult.userId);
      return NextResponse.json(
        { 
          error: 'Failed to save API keys',
          details: saveResult.error
        },
        { status: 500 }
      );
    }

    await logger.info('api/settings/api-keys', 'POST: API keys saved successfully', {}, sessionResult.userId);

    // Gib aktuellen Status zurück (für UI)
    const statusRes = await getApiKeysWithRetry(sessionResult.userId, 2);

    return NextResponse.json({ success: true, data: statusRes.data });

  } catch (error) {
    await logger.error('api/settings/api-keys', 'POST: Unexpected error in handler', { 
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

// Alias: PUT verhält sich wie POST (wird vom Frontend verwendet)
export const PUT = POST;

/**
 * Robuste API-Keys-Abfrage mit Retry-Logik
 */
async function getApiKeysWithRetry(
  userId: string,
  maxRetries: number
): Promise<{ success: boolean; data?: any; error?: string }> {

  const logger = LogService.getInstance();
  await logger.debug('api/settings/api-keys', 'getApiKeysWithRetry started', { userId, maxRetries }, userId);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    await logger.error('api/settings/api-keys', 'Missing Supabase credentials in getApiKeys', {}, userId);
    return { success: false, error: 'Missing SUPABASE_SERVICE_ROLE_KEY env var' };
  }

  const { createClient } = await import('@supabase/supabase-js');
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await logger.info('api/settings/api-keys', `API keys retrieval attempt ${attempt}/${maxRetries}`, { userId }, userId);

      const { data, error } = await adminClient
        .from('user_secrets')
        .select('openai_api_key, anthropic_api_key')
        .eq('user_id', userId)
        .single();

      await logger.debug('api/settings/api-keys', 'Database query result', { 
        hasData: !!data,
        error: error?.message,
        errorCode: error?.code,
        userId 
      }, userId);

      if (error) {
        if (error.code === 'PGRST116') {
          // Kein Datensatz gefunden - das ist ok
          await logger.info('api/settings/api-keys', 'No user secrets found, returning empty values', { userId }, userId);
          return {
            success: true,
            data: { openai: '', anthropic: '' }
          };
        }

        await logger.error('api/settings/api-keys', `Database error on attempt ${attempt}`, { 
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          userId
        }, userId);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Database error after ${maxRetries} attempts: ${error.message}`
          };
        }

        // Kurz warten vor dem nächsten Versuch
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      // Erfolgreiche Abfrage
      await logger.debug('api/settings/api-keys', 'Raw data from database', { 
        data,
        hasOpenAiKey: !!data?.openai_api_key,
        hasClaudeKey: !!data?.anthropic_api_key,
        openAiKeyLength: data?.openai_api_key?.length || 0,
        claudeKeyLength: data?.anthropic_api_key?.length || 0,
        userId
      }, userId);

      const result = {
        openai: !!data?.openai_api_key ? 'SET' : '',
        anthropic: !!data?.anthropic_api_key ? 'SET' : ''
      };

      await logger.info('api/settings/api-keys', 'API keys retrieved successfully', { 
        result,
        userId
      }, userId);
      return { success: true, data: result };

    } catch (error) {
      await logger.error('api/settings/api-keys', `Unexpected error on attempt ${attempt}`, { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userId
      }, userId);
      
      if (attempt === maxRetries) {
        return {
          success: false,
          error: `Unexpected error after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      // Kurz warten vor dem nächsten Versuch
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded'
  };
}

/**
 * Robuste API-Keys-Speicherung mit Retry-Logik
 */
async function saveApiKeysWithRetry(
  userId: string,
  keys: ApiKeys,
  maxRetries: number
): Promise<{ success: boolean; error?: string }> {

  const logger = LogService.getInstance();
  await logger.debug('api/settings/api-keys', 'saveApiKeysWithRetry started', { 
    userId, 
    hasOpenAI: !!keys.openai_api_key,
    hasAnthropic: !!keys.anthropic_api_key,
    openAILength: keys.openai_api_key?.length || 0,
    anthropicLength: keys.anthropic_api_key?.length || 0,
    maxRetries 
  }, userId);

  // Verschlüsselung vorbereiten
  let encryptedKeys: { [key: string]: string | undefined } = {};
  
  try {
    const { EncryptionService } = await import('@/lib/services/encryption');
    
    if (keys.openai_api_key) {
      await logger.debug('api/settings/api-keys', 'Encrypting OpenAI key', { length: keys.openai_api_key.length }, userId);
      encryptedKeys.openai_api_key = EncryptionService.encrypt(keys.openai_api_key);
    }
    if (keys.anthropic_api_key) {
      await logger.debug('api/settings/api-keys', 'Encrypting Anthropic key', { length: keys.anthropic_api_key.length }, userId);
      encryptedKeys.anthropic_api_key = EncryptionService.encrypt(keys.anthropic_api_key);
    }

    if (Object.keys(encryptedKeys).length === 0) {
      await logger.warn('api/settings/api-keys', 'No keys to save - both fields empty', { 
        originalKeys: keys,
        encryptedKeys: Object.keys(encryptedKeys)
      }, userId);
      return { success: true };
    }
    
    await logger.info('api/settings/api-keys', 'Keys encrypted successfully', { 
      encryptedKeyCount: Object.keys(encryptedKeys).length,
      encryptedKeys: Object.keys(encryptedKeys)
    }, userId);

  } catch (error) {
    await logger.error('api/settings/api-keys', 'Encryption error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, userId);
    return {
      success: false,
      error: `Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }

  // Verwende Admin-Client (Service-Role-Key), um RLS-Einschränkungen zu umgehen
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    await logger.error('api/settings/api-keys', 'Missing Supabase credentials', {}, userId);
    return { success: false, error: 'Missing SUPABASE_SERVICE_ROLE_KEY env var' };
  }

  const { createClient } = await import('@supabase/supabase-js');
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false }
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await logger.info('api/settings/api-keys', `Save attempt ${attempt}/${maxRetries}`, { 
        userId,
        keysToSave: Object.keys(encryptedKeys)
      }, userId);

      const { error } = await adminClient
        .from('user_secrets')
        .upsert(
          { user_id: userId, ...encryptedKeys },
          { onConflict: 'user_id' }
        );

      if (error) {
        await logger.error('api/settings/api-keys', `Database error on attempt ${attempt}`, { 
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }, userId);
        
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Database error after ${maxRetries} attempts: ${error.message}`
          };
        }

        // Kurz warten vor dem nächsten Versuch
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      // Erfolgreiche Speicherung
      await logger.info('api/settings/api-keys', 'API keys saved successfully in database', { 
        attempt,
        userId,
        savedKeys: Object.keys(encryptedKeys)
      }, userId);
      return { success: true };

    } catch (error) {
      await logger.error('api/settings/api-keys', `Unexpected error on attempt ${attempt}`, { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }, userId);
      
      if (attempt === maxRetries) {
        return {
          success: false,
          error: `Unexpected error after ${maxRetries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }

      // Kurz warten vor dem nächsten Versuch
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }

  return {
    success: false,
    error: 'Max retries exceeded'
  };
}

// Hilfsfunktion: legt bei Bedarf einen User an (id = NextAuth-UserId)
async function ensureSupabaseUserExists(userId: string, email: string) {
  const logger = LogService.getInstance();
  await logger.info('api/settings/api-keys', 'ensureSupabaseUserExists called', { userId, email }, userId);
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    await logger.error('api/settings/api-keys', 'Missing Supabase credentials in ensureUser', {}, userId);
    return;
  }
  
  const { createClient } = await import('@supabase/supabase-js');
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  
  // Prüfe, ob User bereits existiert
  const { data, error: selectError } = await admin.from('users').select('id').eq('id', userId).single();
  
  await logger.debug('api/settings/api-keys', 'User existence check', { 
    userId, 
    userExists: !!data, 
    selectError: selectError?.message 
  }, userId);
  
  if (!data) {
    await logger.info('api/settings/api-keys', 'Creating new user in database', { userId, email }, userId);
    const { error: insertError } = await admin.from('users').insert({ id: userId, email });
    
    if (insertError) {
      await logger.error('api/settings/api-keys', 'Failed to create user', { 
        userId, 
        email, 
        error: insertError.message,
        code: insertError.code 
      }, userId);
    } else {
      await logger.info('api/settings/api-keys', 'User created successfully', { userId, email }, userId);
    }
  } else {
    await logger.info('api/settings/api-keys', 'User already exists', { userId }, userId);
  }
} 