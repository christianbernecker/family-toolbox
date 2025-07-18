export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  level: LogLevel;
  source: string;
  message: string;
  userId?: string;
  payload?: any;
  sessionId?: string;
}

export class LogService {
  private static instance: LogService;

  public static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }
    return LogService.instance;
  }

  /**
   * Schreibt einen Log-Eintrag in die Datenbank
   */
  async log(entry: LogEntry): Promise<void> {
    try {
      // Console-Log für lokales Debugging beibehalten
      const timestamp = new Date().toISOString();
      const logLine = `[${timestamp}] ${entry.level} [${entry.source}] ${entry.message}`;
      
      if (entry.level === 'ERROR') {
        console.error(logLine, entry.payload || '');
      } else if (entry.level === 'WARN') {
        console.warn(logLine, entry.payload || '');
      } else {
        console.log(logLine, entry.payload || '');
      }

      // In Datenbank schreiben (Service Role verwenden)
      await this.writeToDatabase(entry);
    } catch (error) {
      // Fallback: Bei DB-Fehlern nur Console-Logging
      console.error('LogService: Failed to write to database:', error);
    }
  }

  /**
   * Helper-Methoden für verschiedene Log-Level
   */
  async debug(source: string, message: string, payload?: any, userId?: string): Promise<void> {
    await this.log({ level: 'DEBUG', source, message, payload, userId });
  }

  async info(source: string, message: string, payload?: any, userId?: string): Promise<void> {
    await this.log({ level: 'INFO', source, message, payload, userId });
  }

  async warn(source: string, message: string, payload?: any, userId?: string): Promise<void> {
    await this.log({ level: 'WARN', source, message, payload, userId });
  }

  async error(source: string, message: string, payload?: any, userId?: string): Promise<void> {
    await this.log({ level: 'ERROR', source, message, payload, userId });
  }

  /**
   * Schreibt Log-Eintrag in Supabase-Datenbank
   */
  private async writeToDatabase(entry: LogEntry): Promise<void> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceKey) {
        // Keine DB-Verbindung möglich → nur Console-Logging
        return;
      }

      const { createClient } = await import('@supabase/supabase-js');
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false }
      });

      const { error } = await adminClient
        .from('logs')
        .insert({
          level: entry.level,
          source: entry.source,
          message: entry.message,
          user_id: entry.userId || null,
          payload: entry.payload || null,
          session_id: entry.sessionId || null
        });

      if (error) {
        console.error('LogService: Database insert failed:', error);
      }
    } catch (error) {
      console.error('LogService: Database connection failed:', error);
    }
  }

  /**
   * Liest Logs aus der Datenbank (für Admin-Interface)
   */
  async getLogs(limit = 100, level?: LogLevel, source?: string): Promise<any[]> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceKey) {
        return [];
      }

      const { createClient } = await import('@supabase/supabase-js');
      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false }
      });

      let query = adminClient
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (level) {
        query = query.eq('level', level);
      }

      if (source) {
        query = query.eq('source', source);
      }

      const { data, error } = await query;

      if (error) {
        console.error('LogService: Failed to read logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('LogService: Read logs error:', error);
      return [];
    }
  }
} 