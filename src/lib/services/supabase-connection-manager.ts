import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConnectionResult {
  client: SupabaseClient | null;
  success: boolean;
  error: string | null;
  diagnostics: {
    urlValid: boolean;
    keyValid: boolean;
    connectionTest: boolean;
    encryptionTest: boolean;
    databaseTest: boolean;
  };
}

export class SupabaseConnectionManager {
  private static instance: SupabaseConnectionManager;
  private client: SupabaseClient | null = null;
  private lastConnectionTest: number = 0;
  private readonly CONNECTION_TEST_INTERVAL = 60000; // 1 minute

  public static getInstance(): SupabaseConnectionManager {
    if (!SupabaseConnectionManager.instance) {
      SupabaseConnectionManager.instance = new SupabaseConnectionManager();
    }
    return SupabaseConnectionManager.instance;
  }

  /**
   * Robuste Supabase-Verbindung mit umfassender Diagnose
   */
  async getConnection(): Promise<SupabaseConnectionResult> {
    console.log('🗄️ SupabaseConnectionManager: Starting connection resolution');

    const diagnostics = {
      urlValid: false,
      keyValid: false,
      connectionTest: false,
      encryptionTest: false,
      databaseTest: false
    };

    try {
      // Schritt 1: Umgebungsvariablen validieren
      const envResult = this.validateEnvironmentVariables();
      if (!envResult.success) {
        return {
          client: null,
          success: false,
          error: envResult.error,
          diagnostics
        };
      }

      diagnostics.urlValid = true;
      diagnostics.keyValid = true;

      // Schritt 2: Supabase-Client erstellen
      const client = this.createSupabaseClient();
      if (!client) {
        return {
          client: null,
          success: false,
          error: 'Failed to create Supabase client',
          diagnostics
        };
      }

      // Schritt 3: Verbindungstest
      const connectionTest = await this.testConnection(client);
      diagnostics.connectionTest = connectionTest.success;

      if (!connectionTest.success) {
        console.warn('🗄️ Connection test failed (non-fatal):', connectionTest.error);
      }

      // Schritt 4: Verschlüsselungstest
      const encryptionTest = await this.testEncryption();
      diagnostics.encryptionTest = encryptionTest.success;

      if (!encryptionTest.success) {
        console.warn('🗄️ Encryption test failed:', encryptionTest.error);
        // Nicht kritisch, aber warnen
      }

      // Schritt 5: Datenbanktest
      const databaseTest = await this.testDatabase(client);
      diagnostics.databaseTest = databaseTest.success;

      if (!databaseTest.success) {
        // Datenbanktest fehlgeschlagen ⇒ warnen, aber nicht abbrechen
        console.warn('🗄️ Database test failed (non-fatal):', databaseTest.error);
      }

      console.log('🗄️ Supabase connection successful');
      this.client = client;
      this.lastConnectionTest = Date.now();

      return {
        client,
        success: true,
        error: null,
        diagnostics
      };

    } catch (error) {
      console.error('🗄️ Supabase connection error:', error);
      return {
        client: null,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown connection error',
        diagnostics
      };
    }
  }

  /**
   * Umgebungsvariablen validieren
   */
  private validateEnvironmentVariables(): { success: boolean; error: string | null } {
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'ENCRYPTION_KEY'
    ];

    const fallbackVars = [
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY'
    ];

    console.log('🗄️ Validating environment variables...');

    // Prüfe primäre Variablen
    for (const varName of requiredVars) {
      const value = process.env[varName];
      if (!value) {
        console.error(`🗄️ Missing environment variable: ${varName}`);
        
        // Prüfe Fallback-Variablen
        if (varName === 'NEXT_PUBLIC_SUPABASE_URL' && process.env.SUPABASE_URL) {
          console.log('🗄️ Using fallback SUPABASE_URL');
          continue;
        }
        if (varName === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && process.env.SUPABASE_ANON_KEY) {
          console.log('🗄️ Using fallback SUPABASE_ANON_KEY');
          continue;
        }

        return {
          success: false,
          error: `Missing required environment variable: ${varName}`
        };
      }
    }

    // Validiere URL-Format
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
      return {
        success: false,
        error: 'Invalid Supabase URL format'
      };
    }

    // Validiere Key-Format
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (supabaseKey && !supabaseKey.startsWith('eyJ')) {
      return {
        success: false,
        error: 'Invalid Supabase key format'
      };
    }

    console.log('🗄️ Environment variables validated successfully');
    return { success: true, error: null };
  }

  /**
   * Supabase-Client erstellen
   */
  private createSupabaseClient(): SupabaseClient | null {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials');
      }

      console.log('🗄️ Creating Supabase client...');
      console.log('🗄️ URL:', supabaseUrl.substring(0, 30) + '...');
      console.log('🗄️ Key:', supabaseKey.substring(0, 20) + '...');

      const client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
        global: {
          // Vermeide keepalive, da Netlify-Fetch dies in Server-Functions nicht unterstützt
          fetch: (input: RequestInfo | URL, init?: RequestInit) => {
            return fetch(input, { ...(init || {}), keepalive: false });
          },
          headers: {
            'X-Client-Info': 'family-toolbox/1.0.0'
          }
        }
      });

      console.log('🗄️ Supabase client created successfully');
      return client;

    } catch (error) {
      console.error('🗄️ Failed to create Supabase client:', error);
      return null;
    }
  }

  /**
   * Verbindungstest
   */
  private async testConnection(client: SupabaseClient): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('🗄️ Testing Supabase connection...');
      
      // Robuster Connection-Test mit Supabase Client SDK
      try {
        // Einfacher Select-Test auf eine system-Tabelle
        const { data, error } = await client
          .from('user_secrets')
          .select('user_id')
          .limit(1);

        if (error) {
          // Prüfe ob es ein Berechtigungsfehler ist (das ist ok)
          if (error.code === '42501' || error.message.includes('permission denied')) {
            console.log('🗄️ Connection test successful (permission denied is expected for anonymous users)');
            return { success: true, error: null };
          }
          
          // Prüfe ob es ein "table not found" Fehler ist (das ist auch ok)
          if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
            console.log('🗄️ Connection test successful (table not found is ok for initial setup)');
            return { success: true, error: null };
          }
          
          // Andere Fehler sind problematisch
          console.error('🗄️ Connection test failed:', error);
          return {
            success: false,
            error: `Connection test failed: ${error.message}`
          };
        }

        console.log('🗄️ Connection test successful');
        return { success: true, error: null };

      } catch (clientError) {
        console.error('🗄️ Connection test error:', clientError);
        return {
          success: false,
          error: clientError instanceof Error ? clientError.message : 'Connection test failed'
        };
      }

      console.log('🗄️ Connection test successful');
      return { success: true, error: null };

    } catch (error) {
      console.error('🗄️ Connection test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      };
    }
  }

  /**
   * Verschlüsselungstest
   */
  private async testEncryption(): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('🗄️ Testing encryption...');
      
      const { EncryptionService } = await import('./encryption');
      
      const testData = 'test-encryption-data';
      const encrypted = EncryptionService.encrypt(testData);
      const decrypted = EncryptionService.decrypt(encrypted);

      if (decrypted !== testData) {
        return {
          success: false,
          error: 'Encryption/decryption test failed'
        };
      }

      console.log('🗄️ Encryption test successful');
      return { success: true, error: null };

    } catch (error) {
      console.error('🗄️ Encryption test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Encryption test failed'
      };
    }
  }

  /**
   * Datenbanktest
   */
  private async testDatabase(client: SupabaseClient): Promise<{ success: boolean; error: string | null }> {
    try {
      console.log('🗄️ Testing database access...');
      
      // Prüfe, ob user_secrets Tabelle existiert
      const { data, error } = await client
        .from('user_secrets')
        .select('user_id')
        .limit(1);

      if (error) {
        console.error('🗄️ Database test failed:', error);
        return {
          success: false,
          error: `Database test failed: ${error.message}`
        };
      }

      console.log('🗄️ Database test successful');
      return { success: true, error: null };

    } catch (error) {
      console.error('🗄️ Database test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Database test failed'
      };
    }
  }

  /**
   * Cached Client abrufen (falls verfügbar)
   */
  getCachedClient(): SupabaseClient | null {
    const now = Date.now();
    if (this.client && (now - this.lastConnectionTest < this.CONNECTION_TEST_INTERVAL)) {
      return this.client;
    }
    return null;
  }

  /**
   * Verbindung zurücksetzen
   */
  resetConnection(): void {
    this.client = null;
    this.lastConnectionTest = 0;
  }
} 