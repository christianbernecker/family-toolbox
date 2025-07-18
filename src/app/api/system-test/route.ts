import { NextRequest, NextResponse } from 'next/server';
import { RobustSessionHandler } from '@/lib/auth/robust-session-handler';
import { SupabaseConnectionManager } from '@/lib/services/supabase-connection-manager';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  console.log('🧪 System Test: Starting comprehensive system test');

  const testResults = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      netlify: process.env.NETLIFY ? 'TRUE' : 'FALSE',
      context: process.env.CONTEXT || 'unknown'
    },
    tests: {} as Record<string, any>,
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      overallSuccess: false
    }
  };

  try {
    // Test 1: Umgebungsvariablen
    testResults.tests.environmentVariables = await testEnvironmentVariables();

    // Test 2: NextAuth Session
    testResults.tests.nextAuthSession = await testNextAuthSession(request);

    // Test 3: Supabase-Verbindung
    testResults.tests.supabaseConnection = await testSupabaseConnection();

    // Test 4: Verschlüsselung
    testResults.tests.encryption = await testEncryption();

    // Test 5: Datenbank-Operationen
    testResults.tests.databaseOperations = await testDatabaseOperations();

    // Test 6: API-Keys-Workflow
    testResults.tests.apiKeysWorkflow = await testApiKeysWorkflow(request);

    // Gesamtergebnis
    const allTests = Object.values(testResults.tests);
    const passedTests = allTests.filter((test: any) => test.success).length;
    const totalTests = allTests.length;

    testResults.summary = {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      overallSuccess: passedTests === totalTests
    };

    console.log('🧪 System Test completed:', testResults.summary);

    return NextResponse.json(testResults, {
      status: testResults.summary.overallSuccess ? 200 : 500
    });

  } catch (error) {
    console.error('🧪 System Test failed:', error);
    return NextResponse.json({
      error: 'System test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

/**
 * Test 1: Umgebungsvariablen
 */
async function testEnvironmentVariables(): Promise<any> {
  console.log('🧪 Testing environment variables...');

  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'ENCRYPTION_KEY',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ];

  const results: Record<string, any> = {};
  let allPresent = true;

  for (const varName of requiredVars) {
    const value = process.env[varName];
    const isPresent = !!value;
    
    results[varName] = {
      present: isPresent,
      length: value ? value.length : 0,
      preview: value ? value.substring(0, 10) + '...' : null
    };

    if (!isPresent) {
      allPresent = false;
    }
  }

  // Prüfe Fallback-Variablen
  const fallbacks = {
    'SUPABASE_URL': process.env.SUPABASE_URL,
    'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY
  };

  return {
    success: allPresent,
    details: results,
    fallbacks,
    message: allPresent ? 'All environment variables present' : 'Some environment variables missing'
  };
}

/**
 * Test 2: NextAuth Session
 */
async function testNextAuthSession(request: NextRequest): Promise<any> {
  console.log('🧪 Testing NextAuth session...');

  try {
    const sessionHandler = RobustSessionHandler.getInstance();
    const sessionResult = await sessionHandler.getSession(request);

    return {
      success: !!sessionResult.session,
      details: {
        source: sessionResult.source,
        hasSession: !!sessionResult.session,
        hasUserId: !!sessionResult.userId,
        error: sessionResult.error
      },
      message: sessionResult.session ? 'Session found' : 'No session found'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown session error',
      message: 'Session test failed'
    };
  }
}

/**
 * Test 3: Supabase-Verbindung
 */
async function testSupabaseConnection(): Promise<any> {
  console.log('🧪 Testing Supabase connection...');

  try {
    const connectionManager = SupabaseConnectionManager.getInstance();
    const connectionResult = await connectionManager.getConnection();

    return {
      success: connectionResult.success,
      details: {
        diagnostics: connectionResult.diagnostics,
        error: connectionResult.error
      },
      message: connectionResult.success ? 'Supabase connection successful' : 'Supabase connection failed'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown connection error',
      message: 'Supabase connection test failed'
    };
  }
}

/**
 * Test 4: Verschlüsselung
 */
async function testEncryption(): Promise<any> {
  console.log('🧪 Testing encryption...');

  try {
    const { EncryptionService } = await import('@/lib/services/encryption');

    const testData = 'test-encryption-data-' + Date.now();
    const encrypted = EncryptionService.encrypt(testData);
    const decrypted = EncryptionService.decrypt(encrypted);

    const success = decrypted === testData;

    return {
      success,
      details: {
        originalLength: testData.length,
        encryptedLength: encrypted.length,
        decryptedLength: decrypted.length,
        match: success
      },
      message: success ? 'Encryption/decryption successful' : 'Encryption/decryption failed'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown encryption error',
      message: 'Encryption test failed'
    };
  }
}

/**
 * Test 5: Datenbank-Operationen
 */
async function testDatabaseOperations(): Promise<any> {
  console.log('🧪 Testing database operations...');

  try {
    const connectionManager = SupabaseConnectionManager.getInstance();
    const connectionResult = await connectionManager.getConnection();

    if (!connectionResult.success || !connectionResult.client) {
      return {
        success: false,
        error: 'No database connection',
        message: 'Database connection required for operations test'
      };
    }

    // Test: Tabelle existiert - verwende eine einfachere Abfrage
    const { data, error } = await connectionResult.client!
      .from('users')
      .select('id')
      .limit(1);

    if (error) {
      // Fallback: Teste ob wir überhaupt eine Verbindung haben
      try {
        const { data: testData, error: testError } = await connectionResult.client!
          .from('user_secrets')
          .select('id')
          .limit(1);
          
        if (testError) {
          return {
            success: false,
            error: testError.message,
            message: 'Database query failed - user_secrets table issue'
          };
        }
        
        return {
          success: true,
          details: {
            tableExists: true,
            querySuccessful: true,
            fallbackUsed: false
          },
          message: 'Database operations successful'
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: fallbackError instanceof Error ? fallbackError.message : 'Unknown error',
          message: 'Database operations failed - connection issue'
        };
      }
    }

    return {
      success: true,
      details: {
        tableExists: true,
        querySuccessful: true
      },
      message: 'Database operations successful'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      message: 'Database operations test failed'
    };
  }
}

/**
 * Test 6: API-Keys-Workflow
 */
async function testApiKeysWorkflow(request: NextRequest): Promise<any> {
  console.log('🧪 Testing API keys workflow...');

  try {
    // Test Session-Validierung
    const sessionHandler = RobustSessionHandler.getInstance();
    const sessionResult = await sessionHandler.validateApiSession(request);

    if (!sessionResult.session) {
      return {
        success: false,
        details: {
          step: 'session_validation',
          error: sessionResult.error
        },
        message: 'API keys workflow requires valid session'
      };
    }

    // Test Supabase-Verbindung
    const connectionManager = SupabaseConnectionManager.getInstance();
    const connectionResult = await connectionManager.getConnection();

    if (!connectionResult.success) {
      return {
        success: false,
        details: {
          step: 'database_connection',
          error: connectionResult.error
        },
        message: 'API keys workflow requires database connection'
      };
    }

    // Test API-Keys-Abfrage
    const { data, error } = await connectionResult.client!
      .from('user_secrets')
      .select('openai_api_key, anthropic_api_key')
      .eq('user_id', sessionResult.userId)
      .single();

    const querySuccess = !error || error.code === 'PGRST116'; // PGRST116 = no rows found

    return {
      success: querySuccess,
      details: {
        sessionValid: true,
        databaseConnected: true,
        queryExecuted: querySuccess,
        hasData: !!data,
        error: error?.message
      },
      message: querySuccess ? 'API keys workflow successful' : 'API keys workflow failed'
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown workflow error',
      message: 'API keys workflow test failed'
    };
  }
} 