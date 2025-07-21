// Summary Generator Service (Agent 2)
// Verantwortlich für Relevanz-Bewertung und Zusammenfassungs-Generierung

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { LogService } from '../services/log-service';
import { 
  Email, 
  DailySummary, 
  SenderPriority,
  PromptVersion,
  SummaryGenerationResult,
  RelevanceEvaluationResult,
  EmailProcessingLog
} from '../../types/email-agent';

export class SummaryGeneratorService {
  private static instance: SummaryGeneratorService;
  private supabase: any;
  private logger: LogService;
  private anthropicClient: any;

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.logger = LogService.getInstance();
    this.anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!
    });
  }

  public static getInstance(): SummaryGeneratorService {
    if (!SummaryGeneratorService.instance) {
      SummaryGeneratorService.instance = new SummaryGeneratorService();
    }
    return SummaryGeneratorService.instance;
  }

  /**
   * Hauptfunktion: Neue E-Mails verarbeiten und Zusammenfassungen erstellen
   */
  async processNewEmails(): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('summary-generator', 'Starting processing of new emails');
      
      // Alle unverarbeiteten E-Mails abrufen
      const { data: unprocessedEmails, error } = await this.supabase
        .from('emails')
        .select(`
          *,
          email_accounts!inner(email, priority_weight)
        `)
        .eq('is_processed', false)
        .order('received_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch unprocessed emails: ${error.message}`);
      }

      if (!unprocessedEmails || unprocessedEmails.length === 0) {
        await this.logger.info('summary-generator', 'No unprocessed emails found');
        return;
      }

      await this.logger.info('summary-generator', `Found ${unprocessedEmails.length} unprocessed emails`);

      // E-Mails nach Accounts gruppieren
      const emailsByAccount = this.groupEmailsByAccount(unprocessedEmails);
      
      // Parallel alle Accounts verarbeiten
      const promises = Object.entries(emailsByAccount).map(([accountId, emails]) => 
        this.processAccountEmails(accountId, emails)
      );
      
      await Promise.allSettled(promises);

      const processingTime = Date.now() - startTime;
      await this.logger.info('summary-generator', 'Completed processing new emails', {
        totalEmails: unprocessedEmails.length,
        processingTime
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.logger.error('summary-generator', 'Failed to process new emails', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });
      throw error;
    }
  }

  /**
   * E-Mails nach Accounts gruppieren
   */
  private groupEmailsByAccount(emails: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    for (const email of emails) {
      const accountId = email.account_id;
      if (!grouped[accountId]) {
        grouped[accountId] = [];
      }
      grouped[accountId].push(email);
    }
    
    return grouped;
  }

  /**
   * E-Mails eines Accounts verarbeiten
   */
  private async processAccountEmails(accountId: string, emails: any[]): Promise<void> {
    const startTime = Date.now();
    let processedCount = 0;
    let errors = 0;

    try {
      await this.logger.info('summary-generator', `Processing ${emails.length} emails for account ${accountId}`);

      // E-Mails der letzten 6 Stunden für Zusammenfassung
      const sixHoursAgo = new Date();
      sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

      const recentEmails = emails.filter(email => 
        new Date(email.received_at) >= sixHoursAgo
      );

      // Jede E-Mail einzeln verarbeiten (Relevanz-Bewertung)
      for (const email of emails) {
        try {
          await this.evaluateEmailRelevance(email);
          processedCount++;
        } catch (error) {
          errors++;
          await this.logger.error('summary-generator', `Failed to evaluate email: ${email.id}`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            emailId: email.id
          });
        }
      }

      // Zusammenfassung für die letzten 6 Stunden erstellen
      if (recentEmails.length > 0) {
        try {
          await this.generateDailySummary(accountId, recentEmails);
        } catch (error) {
          await this.logger.error('summary-generator', `Failed to generate summary for account ${accountId}`, {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Verarbeitungs-Log speichern
      const processingTime = Date.now() - startTime;
      await this.saveProcessingLog({
        account_id: accountId,
        process_type: 'relevance',
        status: errors > 0 ? 'partial' : 'success',
        emails_processed: emails.length,
        emails_new: processedCount,
        emails_errors: errors,
        processing_time_ms: processingTime
      });

      await this.logger.info('summary-generator', `Completed processing account ${accountId}`, {
        totalEmails: emails.length,
        processedCount,
        errors,
        processingTime
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      await this.saveProcessingLog({
        account_id: accountId,
        process_type: 'relevance',
        status: 'error',
        emails_processed: 0,
        emails_new: 0,
        emails_errors: 1,
        processing_time_ms: processingTime,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      await this.logger.error('summary-generator', `Failed to process account ${accountId}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });
    }
  }

  /**
   * E-Mail-Relevanz bewerten
   */
  private async evaluateEmailRelevance(email: any): Promise<RelevanceEvaluationResult> {
    const startTime = Date.now();

    try {
      // Aktiven Prompt für Relevanz-Bewertung abrufen
      const prompt = await this.getActivePrompt('relevance');
      
      // Sender-Priorität abrufen
      const senderPriority = await this.getSenderPriority(email.sender_email);
      
      // AI-Prompt erstellen
      const aiPrompt = this.createRelevancePrompt(email, prompt, senderPriority);
      
      // Claude Haiku für schnelle Bewertung verwenden
      const response = await this.anthropicClient.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: aiPrompt
          }
        ]
      });

      const result = this.parseRelevanceResponse(response.content[0].text);
      
      // E-Mail in Datenbank aktualisieren
      await this.updateEmailRelevance(email.id, result);
      
      const processingTime = Date.now() - startTime;
      
      await this.logger.info('summary-generator', `Evaluated email relevance: ${email.id}`, {
        emailId: email.id,
        relevanceScore: result.relevanceScore,
        category: result.category,
        processingTime
      });

      return {
        emailId: email.id,
        relevanceScore: result.relevanceScore,
        confidence: result.confidence,
        category: result.category,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.logger.error('summary-generator', `Failed to evaluate email relevance: ${email.id}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });
      throw error;
    }
  }

  /**
   * Tägliche Zusammenfassung erstellen
   */
  private async generateDailySummary(accountId: string, emails: any[]): Promise<SummaryGenerationResult> {
    const startTime = Date.now();

    try {
      // Aktiven Prompt für Zusammenfassung abrufen
      const prompt = await this.getActivePrompt('summary');
      
      // Relevante E-Mails filtern (Score >= 5)
      const relevantEmails = emails.filter(email => 
        email.relevance_score && email.relevance_score >= 5
      );
      
      // Hochprioritäts-E-Mails zählen
      const highPriorityEmails = emails.filter(email => 
        email.relevance_score && email.relevance_score >= 8
      ).length;

      if (relevantEmails.length === 0) {
        await this.logger.info('summary-generator', `No relevant emails for summary in account ${accountId}`);
        return {
          summary: {} as DailySummary,
          emails: [],
          processingTime: Date.now() - startTime,
          tokensUsed: 0
        };
      }

      // AI-Prompt für Zusammenfassung erstellen
      const aiPrompt = this.createSummaryPrompt(relevantEmails, prompt);
      
      // Claude Sonnet für detaillierte Zusammenfassung verwenden
      const response = await this.anthropicClient.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: aiPrompt
          }
        ]
      });

      const summaryText = response.content[0].text;
      const tokensUsed = response.usage?.input_tokens + response.usage?.output_tokens || 0;
      
      // Zeitbereich für Zusammenfassung
      const timeRangeStart = new Date(Math.min(...emails.map(e => new Date(e.received_at).getTime())));
      const timeRangeEnd = new Date(Math.max(...emails.map(e => new Date(e.received_at).getTime())));
      
      // Zusammenfassung in Datenbank speichern
      const summary: Partial<DailySummary> = {
        date: new Date().toISOString().split('T')[0],
        account_id: accountId,
        time_range_start: timeRangeStart.toISOString(),
        time_range_end: timeRangeEnd.toISOString(),
        summary_text: summaryText,
        total_emails: emails.length,
        relevant_emails: relevantEmails.length,
        high_priority_emails: highPriorityEmails,
        prompt_version: prompt.version_name,
        tokens_used: tokensUsed,
        processing_time_ms: Date.now() - startTime
      };

      const { data: savedSummary, error } = await this.supabase
        .from('daily_summaries')
        .insert(summary)
        .select()
        .single();

      if (error) {
        throw error;
      }

      const processingTime = Date.now() - startTime;
      
      await this.logger.info('summary-generator', `Generated summary for account ${accountId}`, {
        accountId,
        totalEmails: emails.length,
        relevantEmails: relevantEmails.length,
        highPriorityEmails,
        tokensUsed,
        processingTime
      });

      return {
        summary: savedSummary,
        emails: relevantEmails,
        processingTime,
        tokensUsed
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.logger.error('summary-generator', `Failed to generate summary for account ${accountId}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });
      throw error;
    }
  }

  /**
   * Aktiven Prompt für Agent-Typ abrufen
   */
  private async getActivePrompt(agentType: 'summary' | 'relevance'): Promise<PromptVersion> {
    const { data: prompt, error } = await this.supabase
      .from('prompt_versions')
      .select('*')
      .eq('agent_type', agentType)
      .eq('is_active', true)
      .single();

    if (error || !prompt) {
      throw new Error(`No active prompt found for agent type: ${agentType}`);
    }

    return prompt;
  }

  /**
   * Sender-Priorität abrufen
   */
  private async getSenderPriority(senderEmail: string): Promise<SenderPriority | null> {
    const { data: priority } = await this.supabase
      .from('sender_priorities')
      .select('*')
      .eq('email_address', senderEmail)
      .single();

    return priority;
  }

  /**
   * Prompt für Relevanz-Bewertung erstellen
   */
  private createRelevancePrompt(email: any, prompt: PromptVersion, senderPriority: SenderPriority | null): string {
    const priorityWeight = senderPriority?.priority_weight || 1;
    
    return `${prompt.prompt_text}

E-Mail Details:
- Absender: ${email.sender_name || 'Unbekannt'} <${email.sender_email}>
- Betreff: ${email.subject}
- Absender-Priorität: ${priorityWeight}/10
- Inhalt: ${email.body_text?.substring(0, 500) || 'Kein Text-Inhalt'}

Antworte nur mit einem JSON-Objekt im Format:
{
  "relevance_score": <1-10>,
  "confidence": <0.00-1.00>,
  "category": "<personal|system|marketing|other>",
  "reasoning": "<kurze Begründung>"
}`;
  }

  /**
   * Prompt für Zusammenfassung erstellen
   */
  private createSummaryPrompt(emails: any[], prompt: PromptVersion): string {
    const emailList = emails.map(email => `
- ${email.sender_name || email.sender_email}: ${email.subject}
  Relevanz: ${email.relevance_score}/10
  Kategorie: ${email.category}
  Empfangen: ${new Date(email.received_at).toLocaleString('de-DE')}
`).join('');

    return `${prompt.prompt_text}

E-Mails der letzten 6 Stunden:
${emailList}

Erstelle eine strukturierte Zusammenfassung mit den wichtigsten Punkten.`;
  }

  /**
   * AI-Antwort für Relevanz-Bewertung parsen
   */
  private parseRelevanceResponse(response: string): {
    relevanceScore: number;
    confidence: number;
    category: string;
  } {
    try {
      // JSON aus Antwort extrahieren
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        relevanceScore: Math.max(1, Math.min(10, parseInt(parsed.relevance_score) || 5)),
        confidence: Math.max(0, Math.min(1, parseFloat(parsed.confidence) || 0.5)),
        category: parsed.category || 'other'
      };
    } catch (error) {
      // Fallback-Werte bei Parsing-Fehlern
      return {
        relevanceScore: 5,
        confidence: 0.5,
        category: 'other'
      };
    }
  }

  /**
   * E-Mail-Relevanz in Datenbank aktualisieren
   */
  private async updateEmailRelevance(emailId: string, result: any): Promise<void> {
    const { error } = await this.supabase
      .from('emails')
      .update({
        relevance_score: result.relevanceScore,
        relevance_confidence: result.confidence,
        category: result.category,
        is_processed: true
      })
      .eq('id', emailId);

    if (error) {
      throw error;
    }
  }

  /**
   * Verarbeitungs-Log speichern
   */
  private async saveProcessingLog(log: Omit<EmailProcessingLog, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_processing_logs')
        .insert(log);

      if (error) {
        throw error;
      }
    } catch (error) {
      await this.logger.error('summary-generator', 'Failed to save processing log', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 