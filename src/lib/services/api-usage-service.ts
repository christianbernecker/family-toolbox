import { LogService } from './log-service';

export interface ApiUsageRecord {
  id?: string;
  user_id: string;
  provider: 'openai' | 'anthropic';
  model: string;
  tokens_input: number;
  tokens_output: number;
  cost_usd: number;
  response_time_ms: number;
  timestamp: string;
  request_type: string; // 'chat', 'completion', 'embedding', etc.
  success: boolean;
  error_message?: string;
}

export interface ApiUsageStats {
  provider: 'openai' | 'anthropic';
  totalTokens: number;
  totalCost: number;
  requestCount: number;
  avgResponseTime: number;
  lastUsed: string;
  successRate: number;
  tokensByModel: Record<string, number>;
  costByModel: Record<string, number>;
}

export class ApiUsageService {
  private static instance: ApiUsageService;
  private logger: LogService;

  private constructor() {
    this.logger = LogService.getInstance();
  }

  static getInstance(): ApiUsageService {
    if (!ApiUsageService.instance) {
      ApiUsageService.instance = new ApiUsageService();
    }
    return ApiUsageService.instance;
  }

  /**
   * Zeichnet API-Nutzung auf
   */
  async recordUsage(usage: Omit<ApiUsageRecord, 'id' | 'timestamp'>): Promise<void> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceKey) {
        throw new Error('Missing Supabase configuration');
      }

      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false }
      });

      const record: ApiUsageRecord = {
        ...usage,
        timestamp: new Date().toISOString()
      };

      const { error } = await adminClient
        .from('api_usage')
        .insert([record]);

      if (error) {
        throw error;
      }

      await this.logger.info('api-usage-service', 'API usage recorded', {
        provider: usage.provider,
        model: usage.model,
        tokens_total: usage.tokens_input + usage.tokens_output,
        cost_usd: usage.cost_usd,
        success: usage.success
      }, usage.user_id);

    } catch (error) {
      await this.logger.error('api-usage-service', 'Failed to record API usage', {
        error: error instanceof Error ? error.message : 'Unknown error',
        usage
      }, usage.user_id);
      throw error;
    }
  }

  /**
   * Holt API-Nutzungsstatistiken für einen User
   */
  async getUsageStats(userId: string, days: number = 30): Promise<ApiUsageStats[]> {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !serviceKey) {
        throw new Error('Missing Supabase configuration');
      }

      const adminClient = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false }
      });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await adminClient
        .from('api_usage')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        throw error;
      }

      const records = data as ApiUsageRecord[];

      // Gruppiere nach Provider
      const statsByProvider = new Map<string, ApiUsageStats>();

      for (const record of records) {
        const provider = record.provider;
        
        if (!statsByProvider.has(provider)) {
          statsByProvider.set(provider, {
            provider,
            totalTokens: 0,
            totalCost: 0,
            requestCount: 0,
            avgResponseTime: 0,
            lastUsed: record.timestamp,
            successRate: 0,
            tokensByModel: {},
            costByModel: {}
          });
        }

        const stats = statsByProvider.get(provider)!;
        
        stats.totalTokens += record.tokens_input + record.tokens_output;
        stats.totalCost += record.cost_usd;
        stats.requestCount++;
        
        // Update Model-spezifische Stats
        const model = record.model;
        stats.tokensByModel[model] = (stats.tokensByModel[model] || 0) + record.tokens_input + record.tokens_output;
        stats.costByModel[model] = (stats.costByModel[model] || 0) + record.cost_usd;
        
        // Update LastUsed wenn neueres Datum
        if (new Date(record.timestamp) > new Date(stats.lastUsed)) {
          stats.lastUsed = record.timestamp;
        }
      }

      // Berechne abgeleitete Statistiken
      for (const [provider, stats] of statsByProvider) {
        const providerRecords = records.filter(r => r.provider === provider);
        
        // Erfolgsrate
        const successfulRequests = providerRecords.filter(r => r.success).length;
        stats.successRate = stats.requestCount > 0 ? (successfulRequests / stats.requestCount) * 100 : 0;
        
        // Durchschnittliche Response Zeit
        const totalResponseTime = providerRecords.reduce((sum, r) => sum + r.response_time_ms, 0);
        stats.avgResponseTime = stats.requestCount > 0 ? Math.round(totalResponseTime / stats.requestCount) : 0;
      }

      return Array.from(statsByProvider.values());

    } catch (error) {
      await this.logger.error('api-usage-service', 'Failed to get usage stats', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        days
      }, userId);
      
      // Fallback: Leere Stats zurückgeben
      return [];
    }
  }

  /**
   * Berechnet Kosten basierend auf Provider, Model und Token-Anzahl
   */
  calculateCost(provider: 'openai' | 'anthropic', model: string, inputTokens: number, outputTokens: number): number {
    // Preise per 1000 Token (Stand: 2024)
    const pricing: Record<string, { input: number; output: number }> = {
      // OpenAI Preise
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
      'gpt-4-turbo': { input: 0.01, output: 0.03 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.001, output: 0.002 },
      
      // Anthropic Preise
      'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
      'claude-3-5-haiku-20241022': { input: 0.001, output: 0.005 },
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
      'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 }
    };

    const modelPricing = pricing[model];
    if (!modelPricing) {
      // Fallback für unbekannte Modelle
      const defaultPricing = provider === 'openai' 
        ? { input: 0.001, output: 0.002 } // GPT-3.5-turbo Preise
        : { input: 0.001, output: 0.005 }; // Haiku Preise
      
      return ((inputTokens / 1000) * defaultPricing.input) + ((outputTokens / 1000) * defaultPricing.output);
    }

    return ((inputTokens / 1000) * modelPricing.input) + ((outputTokens / 1000) * modelPricing.output);
  }

  /**
   * Helper Funktion für API-Call Tracking
   * Verwendet in API-Routen um automatisch Usage zu tracken
   */
  async trackApiCall<T>(
    userId: string,
    provider: 'openai' | 'anthropic',
    model: string,
    requestType: string,
    apiCall: () => Promise<{ data: T; inputTokens: number; outputTokens: number; responseTime: number }>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      const cost = this.calculateCost(provider, model, result.inputTokens, result.outputTokens);
      
      await this.recordUsage({
        user_id: userId,
        provider,
        model,
        tokens_input: result.inputTokens,
        tokens_output: result.outputTokens,
        cost_usd: cost,
        response_time_ms: result.responseTime,
        request_type: requestType,
        success: true
      });
      
      return result.data;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      await this.recordUsage({
        user_id: userId,
        provider,
        model,
        tokens_input: 0,
        tokens_output: 0,
        cost_usd: 0,
        response_time_ms: responseTime,
        request_type: requestType,
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }
} 