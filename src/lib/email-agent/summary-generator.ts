// Summary Generator Service (Agent 2)
// Verantwortlich für Relevanz-Bewertung und Zusammenfassungs-Generierung

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { LogService } from '../services/log-service';
import { EncryptionService } from '../services/encryption';
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
    // API Key wird dynamisch geladen
  }

  static getInstance(): SummaryGeneratorService {
    if (!SummaryGeneratorService.instance) {
      SummaryGeneratorService.instance = new SummaryGeneratorService();
    }
    return SummaryGeneratorService.instance;
  }

  /**
   * API Key dynamisch laden und Client initialisieren
   */
  private async initializeClient(userId?: string): Promise<void> {
    try {
      // Versuche zuerst, API Key aus user_secrets zu laden (neues System)
      if (userId) {
        const apiKeys = await this.getDecryptedApiKeysFromUserSecrets(userId);
        
        if (apiKeys.anthropic_api_key) {
          this.anthropicClient = new Anthropic({
            apiKey: apiKeys.anthropic_api_key,
          });
          await this.logger.info('summary-generator', 'Anthropic client initialized with user API key from user_secrets');
          return;
        }
      }
      
      // Fallback auf Environment Variable
      if (process.env.ANTHROPIC_API_KEY) {
        this.anthropicClient = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY
        });
        await this.logger.info('summary-generator', 'Anthropic client initialized with environment API key');
      } else {
        throw new Error('No Anthropic API key available');
      }
    } catch (error) {
      await this.logger.error('summary-generator', 'Failed to initialize Anthropic client', error);
      throw error;
    }
  }

  /**
   * API Keys aus user_secrets entschlüsseln (neues System)
   */
  private async getDecryptedApiKeysFromUserSecrets(userId: string): Promise<{ anthropic_api_key?: string; openai_api_key?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('user_secrets')
        .select('anthropic_api_key, openai_api_key')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        await this.logger.warn('summary-generator', 'No API keys found in user_secrets for user', { userId });
        return {};
      }

      const result: { anthropic_api_key?: string; openai_api_key?: string } = {};

      // Entschlüsseln der Keys mit EncryptionService
      if (data.anthropic_api_key) {
        try {
          result.anthropic_api_key = EncryptionService.decrypt(data.anthropic_api_key);
        } catch (error) {
          await this.logger.error('summary-generator', 'Failed to decrypt Anthropic key', { error });
        }
      }

      if (data.openai_api_key) {
        try {
          result.openai_api_key = EncryptionService.decrypt(data.openai_api_key);
        } catch (error) {
          await this.logger.error('summary-generator', 'Failed to decrypt OpenAI key', { error });
        }
      }

      return result;
    } catch (error) {
      await this.logger.error('summary-generator', 'Error loading API keys from user_secrets', { error, userId });
      return {};
    }
  }

  /**
   * Hauptfunktion: Neue E-Mails verarbeiten und Zusammenfassungen erstellen
   */
  async processNewEmails(): Promise<void> {
    try {
      await this.logger.info('summary-generator', 'Starting new email processing');

      // Hole alle User mit neuen E-Mails
      const usersWithNewEmails = await this.getUsersWithNewEmails();
      
      for (const userId of usersWithNewEmails) {
        await this.processEmailsForUser(userId);
      }

      await this.logger.info('summary-generator', 'Email processing completed');
    } catch (error) {
      await this.logger.error('summary-generator', 'Error in processNewEmails', error);
      throw error;
    }
  }

  private async getUsersWithNewEmails(): Promise<string[]> {
    const { data } = await this.supabase
      .from('emails')
      .select('DISTINCT(user_id)')
      .eq('is_processed', false);

    return data?.map((row: any) => row.user_id) || [];
  }

  private async processEmailsForUser(userId: string): Promise<void> {
    try {
      // Client für diesen User initialisieren
      await this.initializeClient(userId);

      // Hole unverarbeitete E-Mails für diesen User
      const { data: emails } = await this.supabase
        .from('emails')
        .select('*')
        .eq('user_id', userId)
        .eq('is_processed', false)
        .order('received_at', { ascending: false });

      if (!emails || emails.length === 0) {
        await this.logger.info('summary-generator', 'No new emails for user', { userId });
        return;
      }

      await this.logger.info('summary-generator', `Processing ${emails.length} emails for user`, { userId });

      for (const email of emails) {
        await this.processEmail(email);
      }

    } catch (error) {
      await this.logger.error('summary-generator', 'Error processing emails for user', { error, userId });
    }
  }

  private async processEmail(email: any): Promise<void> {
    try {
      // Relevanz-Bewertung
      const relevanceResult = await this.evaluateEmailRelevance(email);
      
      // E-Mail mit Bewertung aktualisieren
      await this.supabase
        .from('emails')
        .update({
          relevance_score: relevanceResult.score,
          relevance_confidence: relevanceResult.confidence,
          category: relevanceResult.category,
          is_processed: true
        })
        .eq('id', email.id);

      await this.logger.info('summary-generator', 'Email processed successfully', {
        emailId: email.id,
        relevanceScore: relevanceResult.score,
        category: relevanceResult.category
      });

    } catch (error) {
      await this.logger.error('summary-generator', 'Error processing email', { error, emailId: email.id });
      
      // Markiere als verarbeitet, auch wenn Fehler
      await this.supabase
        .from('emails')
        .update({ is_processed: true })
        .eq('id', email.id);
    }
  }

  /**
   * E-Mail-Relevanz bewerten
   */
  private async evaluateEmailRelevance(email: any): Promise<RelevanceEvaluationResult> {
    const startTime = Date.now();

    try {
      // Client initialisieren falls noch nicht geschehen
      if (!this.anthropicClient) {
        await this.initializeClient();
      }
      
      // Aktiven Prompt für Relevanz-Bewertung abrufen
      const prompt = await this.getActivePrompt('relevance');
      
      // Sender-Priorität abrufen
      const senderPriority = await this.getSenderPriority(email.sender_email);
      
      // AI-Prompt erstellen
      const aiPrompt = this.createRelevancePrompt(email, prompt, senderPriority);
      
      // Claude Haiku für schnelle Bewertung verwenden
      const response = await this.anthropicClient.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        temperature: 0.1,
        messages: [{ role: "user", content: aiPrompt }]
      });

      const result = this.parseRelevanceResponse(response.content[0].text);
      
      // Performance-Logging
      await this.logEmailProcessing(email.id, 'relevance_evaluation', Date.now() - startTime, true);
      
      return result;

    } catch (error) {
      await this.logger.error('summary-generator', 'Error evaluating email relevance', { error, emailId: email.id });
      await this.logEmailProcessing(email.id, 'relevance_evaluation', Date.now() - startTime, false, error);
      
      // Fallback-Bewertung
      return {
        score: 5,
        confidence: 0.1,
        category: 'unknown',
        reasoning: 'Error during AI evaluation'
      };
    }
  }

  /**
   * Tägliche Zusammenfassung generieren
   */
  async generateDailySummary(userId: string, date: string): Promise<DailySummary | null> {
    try {
      // Client für diesen User initialisieren
      await this.initializeClient(userId);
      
      // Relevante E-Mails für den Tag abrufen
      const { data: relevantEmails } = await this.supabase
        .from('emails')
        .select('*')
        .eq('user_id', userId)
        .gte('received_at', `${date}T00:00:00Z`)
        .lt('received_at', `${date}T23:59:59Z`)
        .gte('relevance_score', 6)
        .order('relevance_score', { ascending: false });

      if (!relevantEmails || relevantEmails.length === 0) {
        await this.logger.info('summary-generator', 'No relevant emails for daily summary', { userId, date });
        return null;
      }

      // Zusammenfassung generieren
      const summaryText = await this.generateSummaryText(relevantEmails);
      
      // In Datenbank speichern
      const { data: summary } = await this.supabase
        .from('daily_summaries')
        .insert({
          user_id: userId,
          date,
          summary_text: summaryText,
          total_emails: relevantEmails.length,
          high_priority_count: relevantEmails.filter(e => e.relevance_score >= 8).length,
          prompt_version: 'v1.0'
        })
        .select()
        .single();

      await this.logger.info('summary-generator', 'Daily summary generated', { userId, date, summaryId: summary.id });
      
      return summary;

    } catch (error) {
      await this.logger.error('summary-generator', 'Error generating daily summary', { error, userId, date });
      return null;
    }
  }

  private async getActivePrompt(type: string): Promise<string> {
    const { data } = await this.supabase
      .from('prompt_versions')
      .select('prompt_text')
      .eq('agent_type', type)
      .eq('is_active', true)
      .single();

    return data?.prompt_text || this.getDefaultPrompt(type);
  }

  private getDefaultPrompt(type: string): string {
    if (type === 'relevance') {
      return `
Bewerte die Relevanz dieser E-Mail auf einer Skala von 1-10:

ABSENDER: {sender_email} ({sender_name})
BETREFF: {subject}
INHALT: {body_preview}

Antworte nur mit JSON:
{
  "score": <1-10>,
  "confidence": <0.0-1.0>,
  "category": "<personal|system|marketing|other>",
  "reasoning": "<kurze Begründung>"
}
      `;
    }
    return 'Default prompt not available';
  }

  private createRelevancePrompt(email: any, promptTemplate: string, senderPriority: any): string {
    return promptTemplate
      .replace('{sender_email}', email.sender_email || 'unknown')
      .replace('{sender_name}', email.sender_name || 'unknown')
      .replace('{subject}', email.subject || 'no subject')
      .replace('{body_preview}', (email.body_text || '').substring(0, 300));
  }

  private parseRelevanceResponse(responseText: string): RelevanceEvaluationResult {
    try {
      const parsed = JSON.parse(responseText);
      return {
        score: parsed.score || 5,
        confidence: parsed.confidence || 0.5,
        category: parsed.category || 'other',
        reasoning: parsed.reasoning || 'No reasoning provided'
      };
    } catch (error) {
      return {
        score: 5,
        confidence: 0.1,
        category: 'other',
        reasoning: 'Failed to parse AI response'
      };
    }
  }

  private async getSenderPriority(senderEmail: string): Promise<any> {
    const { data } = await this.supabase
      .from('sender_priorities')
      .select('*')
      .eq('email_address', senderEmail)
      .single();

    return data || { priority_weight: 1 };
  }

  private async generateSummaryText(emails: any[]): Promise<string> {
    // Client initialisieren falls noch nicht geschehen
    if (!this.anthropicClient) {
      await this.initializeClient();
    }

    const emailsText = emails
      .map(email => `
VON: ${email.sender_name} <${email.sender_email}>
BETREFF: ${email.subject}
RELEVANZ: ${email.relevance_score}/10
INHALT: ${(email.body_text || '').substring(0, 200)}...
---`)
      .join('\n');

    const prompt = `
Erstelle eine prägnante deutsche Zusammenfassung der wichtigsten E-Mails:

${emailsText}

Anforderungen:
- Gruppiere nach Themen
- Hebe besonders wichtige Punkte hervor
- Erwähne Handlungsbedarf
- Maximal 200 Wörter
    `;

    try {
      const response = await this.anthropicClient.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }]
      });

      return response.content[0].text;
    } catch (error) {
      await this.logger.error('summary-generator', 'Error generating summary text', error);
      return `Zusammenfassung konnte nicht generiert werden. ${emails.length} E-Mails erhalten.`;
    }
  }

  private async logEmailProcessing(emailId: string, operation: string, duration: number, success: boolean, error?: any): Promise<void> {
    try {
      await this.supabase
        .from('email_processing_logs')
        .insert({
          email_id: emailId,
          operation,
          duration_ms: duration,
          success,
          error_message: error ? JSON.stringify(error) : null
        });
    } catch (logError) {
      // Fehler beim Logging sollten den Hauptprozess nicht stoppen
      console.error('Failed to log email processing:', logError);
    }
  }
} 