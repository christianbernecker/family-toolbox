// Learning Optimizer Service (Agent 3)
// Verantwortlich für Feedback-Verarbeitung und Prompt-Optimierung

import { createClient } from '@supabase/supabase-js';
import { LogService } from '../services/log-service';
import { 
  SummaryFeedback,
  RelevanceFeedback,
  PromptVersion,
  EmailProcessingLog
} from '../../types/email-agent';

export class LearningOptimizerService {
  private static instance: LearningOptimizerService;
  private supabase: any;
  private logger: LogService;

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.logger = LogService.getInstance();
  }

  public static getInstance(): LearningOptimizerService {
    if (!LearningOptimizerService.instance) {
      LearningOptimizerService.instance = new LearningOptimizerService();
    }
    return LearningOptimizerService.instance;
  }

  /**
   * Hauptfunktion: Feedback verarbeiten und Prompts optimieren
   */
  async processFeedback(): Promise<void> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('learning-optimizer', 'Starting feedback processing');
      
      // Neues Feedback abrufen (letzte 24 Stunden)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { data: summaryFeedback, error: summaryError } = await this.supabase
        .from('summary_feedback')
        .select('*')
        .gte('created_at', yesterday.toISOString());

      const { data: relevanceFeedback, error: relevanceError } = await this.supabase
        .from('relevance_feedback')
        .select('*')
        .gte('created_at', yesterday.toISOString());

      if (summaryError || relevanceError) {
        throw new Error(`Failed to fetch feedback: ${summaryError?.message || relevanceError?.message}`);
      }

      const totalFeedback = (summaryFeedback?.length || 0) + (relevanceFeedback?.length || 0);
      
      if (totalFeedback === 0) {
        await this.logger.info('learning-optimizer', 'No new feedback to process');
        return;
      }

      await this.logger.info('learning-optimizer', `Found ${totalFeedback} new feedback entries`);

      // Feedback verarbeiten
      if (summaryFeedback && summaryFeedback.length > 0) {
        await this.processSummaryFeedback(summaryFeedback);
      }

      if (relevanceFeedback && relevanceFeedback.length > 0) {
        await this.processRelevanceFeedback(relevanceFeedback);
      }

      // Prompt-Performance bewerten
      await this.evaluatePromptPerformance();

      // A/B-Testing für neue Prompts
      await this.runABTesting();

      const processingTime = Date.now() - startTime;
      await this.logger.info('learning-optimizer', 'Completed feedback processing', {
        totalFeedback,
        summaryFeedback: summaryFeedback?.length || 0,
        relevanceFeedback: relevanceFeedback?.length || 0,
        processingTime
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.logger.error('learning-optimizer', 'Failed to process feedback', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });
      throw error;
    }
  }

  /**
   * Zusammenfassungs-Feedback verarbeiten
   */
  private async processSummaryFeedback(feedback: SummaryFeedback[]): Promise<void> {
    try {
      await this.logger.info('learning-optimizer', `Processing ${feedback.length} summary feedback entries`);

      // Feedback nach Prompt-Versionen gruppieren
      const feedbackByPrompt = await this.groupFeedbackByPrompt(feedback, 'summary');
      
      // Performance für jede Prompt-Version berechnen
      for (const [promptVersion, feedbackList] of Object.entries(feedbackByPrompt)) {
        const performanceScore = this.calculatePerformanceScore(feedbackList);
        
        // Prompt-Version aktualisieren
        await this.updatePromptPerformance(promptVersion, performanceScore, feedbackList.length);
        
        await this.logger.info('learning-optimizer', `Updated performance for prompt: ${promptVersion}`, {
          promptVersion,
          performanceScore,
          feedbackCount: feedbackList.length
        });
      }

      // Neue Prompt-Versionen basierend auf Feedback erstellen
      await this.generateNewPrompts('summary', feedback);

    } catch (error) {
      await this.logger.error('learning-optimizer', 'Failed to process summary feedback', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Relevanz-Feedback verarbeiten
   */
  private async processRelevanceFeedback(feedback: RelevanceFeedback[]): Promise<void> {
    try {
      await this.logger.info('learning-optimizer', `Processing ${feedback.length} relevance feedback entries`);

      // Feedback nach Prompt-Versionen gruppieren
      const feedbackByPrompt = await this.groupFeedbackByPrompt(feedback, 'relevance');
      
             // Performance für jede Prompt-Version berechnen
       for (const [promptVersion, feedbackList] of Object.entries(feedbackByPrompt)) {
         const performanceScore = await this.calculateRelevancePerformanceScore(feedbackList);
         
         // Prompt-Version aktualisieren
         await this.updatePromptPerformance(promptVersion, performanceScore, feedbackList.length);
        
        await this.logger.info('learning-optimizer', `Updated performance for prompt: ${promptVersion}`, {
          promptVersion,
          performanceScore,
          feedbackCount: feedbackList.length
        });
      }

      // Neue Prompt-Versionen basierend auf Feedback erstellen
      await this.generateNewPrompts('relevance', feedback);

    } catch (error) {
      await this.logger.error('learning-optimizer', 'Failed to process relevance feedback', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Feedback nach Prompt-Versionen gruppieren
   */
  private async groupFeedbackByPrompt(feedback: any[], agentType: 'summary' | 'relevance'): Promise<Record<string, any[]>> {
    const grouped: Record<string, any[]> = {};
    
    for (const entry of feedback) {
      let promptVersion = 'unknown';
      
      if (agentType === 'summary') {
        // Prompt-Version aus Zusammenfassung abrufen
        const { data: summary } = await this.supabase
          .from('daily_summaries')
          .select('prompt_version')
          .eq('id', entry.summary_id)
          .single();
        
        promptVersion = summary?.prompt_version || 'unknown';
      } else {
        // Für Relevanz-Feedback: aktuelle Prompt-Version verwenden
        const { data: currentPrompt } = await this.supabase
          .from('prompt_versions')
          .select('version_name')
          .eq('agent_type', 'relevance')
          .eq('is_active', true)
          .single();
        
        promptVersion = currentPrompt?.version_name || 'unknown';
      }
      
      if (!grouped[promptVersion]) {
        grouped[promptVersion] = [];
      }
      grouped[promptVersion].push(entry);
    }
    
    return grouped;
  }

  /**
   * Performance-Score für Zusammenfassungs-Feedback berechnen
   */
  private calculatePerformanceScore(feedback: SummaryFeedback[]): number {
    if (feedback.length === 0) return 0;
    
    // Schulnotensystem (1-6) in Performance-Score (0-1) umrechnen
    const totalScore = feedback.reduce((sum, entry) => sum + (7 - entry.rating), 0);
    return Math.min(1, Math.max(0, totalScore / (feedback.length * 6)));
  }

  /**
   * Performance-Score für Relevanz-Feedback berechnen
   */
  private async calculateRelevancePerformanceScore(feedback: RelevanceFeedback[]): Promise<number> {
    if (feedback.length === 0) return 0;
    
    // Manuelle vs. AI-Bewertung vergleichen
    let correctPredictions = 0;
    
    for (const entry of feedback) {
      // E-Mail mit AI-Bewertung abrufen
      const { data: email } = await this.supabase
        .from('emails')
        .select('relevance_score')
        .eq('id', entry.email_id)
        .single();
      
      if (email) {
        // Bewertung als korrekt betrachten, wenn Differenz <= 2
        const difference = Math.abs(email.relevance_score - entry.manual_relevance_score);
        if (difference <= 2) {
          correctPredictions++;
        }
      }
    }
    
    return correctPredictions / feedback.length;
  }

  /**
   * Prompt-Performance in Datenbank aktualisieren
   */
  private async updatePromptPerformance(promptVersion: string, performanceScore: number, usageCount: number): Promise<void> {
    const { error } = await this.supabase
      .from('prompt_versions')
      .update({
        performance_score: performanceScore,
        usage_count: usageCount,
        updated_at: new Date().toISOString()
      })
      .eq('version_name', promptVersion);

    if (error) {
      throw error;
    }
  }

  /**
   * Neue Prompts basierend auf Feedback generieren
   */
  private async generateNewPrompts(agentType: 'summary' | 'relevance', feedback: any[]): Promise<void> {
    try {
      // Aktuelle Prompt-Version abrufen
      const { data: currentPrompt } = await this.supabase
        .from('prompt_versions')
        .select('*')
        .eq('agent_type', agentType)
        .eq('is_active', true)
        .single();

      if (!currentPrompt) {
        await this.logger.warn('learning-optimizer', `No active prompt found for agent type: ${agentType}`);
        return;
      }

      // Feedback-Analyse für Prompt-Optimierung
      const feedbackAnalysis = this.analyzeFeedback(feedback, agentType);
      
      // Neue Prompt-Versionen erstellen
      const newPrompts = this.generatePromptVariations(currentPrompt, feedbackAnalysis);
      
      // Neue Prompts in Datenbank speichern
      for (const newPrompt of newPrompts) {
        const { error } = await this.supabase
          .from('prompt_versions')
          .insert({
            version_name: newPrompt.versionName,
            agent_type: agentType,
            prompt_text: newPrompt.promptText,
            is_active: false, // Für A/B-Testing inaktiv
            performance_score: null,
            usage_count: 0
          });

        if (error) {
          await this.logger.error('learning-optimizer', `Failed to save new prompt: ${newPrompt.versionName}`, {
            error: error.message
          });
        } else {
          await this.logger.info('learning-optimizer', `Created new prompt: ${newPrompt.versionName}`, {
            agentType,
            promptVersion: newPrompt.versionName
          });
        }
      }

    } catch (error) {
      await this.logger.error('learning-optimizer', 'Failed to generate new prompts', {
        error: error instanceof Error ? error.message : 'Unknown error',
        agentType
      });
    }
  }

  /**
   * Feedback für Prompt-Optimierung analysieren
   */
  private analyzeFeedback(feedback: any[], agentType: 'summary' | 'relevance'): any {
    if (agentType === 'summary') {
      // Zusammenfassungs-Feedback analysieren
      const lowRatings = feedback.filter(f => f.rating <= 3);
      const highRatings = feedback.filter(f => f.rating >= 5);
      
      return {
        lowRatingCount: lowRatings.length,
        highRatingCount: highRatings.length,
        averageRating: feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length,
        commonIssues: this.extractCommonIssues(lowRatings)
      };
    } else {
      // Relevanz-Feedback analysieren
      const overPredictions = feedback.filter(f => {
        // TODO: Implementiere Logik für Über-/Untervorhersagen
        return true;
      });
      
      return {
        overPredictionCount: overPredictions.length,
        underPredictionCount: feedback.length - overPredictions.length
      };
    }
  }

  /**
   * Häufige Probleme aus Feedback extrahieren
   */
  private extractCommonIssues(lowRatingFeedback: any[]): string[] {
    const issues: string[] = [];
    
    for (const feedback of lowRatingFeedback) {
      if (feedback.feedback_text) {
        // Einfache Text-Analyse für häufige Probleme
        const text = feedback.feedback_text.toLowerCase();
        
        if (text.includes('zu lang') || text.includes('zu kurz')) {
          issues.push('length');
        }
        if (text.includes('wichtig') || text.includes('fehlt')) {
          issues.push('missing_important');
        }
        if (text.includes('unverständlich') || text.includes('unklar')) {
          issues.push('unclear');
        }
      }
    }
    
    return [...new Set(issues)]; // Duplikate entfernen
  }

  /**
   * Prompt-Variationen basierend auf Feedback-Analyse generieren
   */
  private generatePromptVariations(currentPrompt: PromptVersion, feedbackAnalysis: any): Array<{versionName: string, promptText: string}> {
    const variations: Array<{versionName: string, promptText: string}> = [];
    const baseVersion = currentPrompt.version_name;
    
    // Variation 1: Länge anpassen
    if (feedbackAnalysis.commonIssues?.includes('length')) {
      variations.push({
        versionName: `${baseVersion}-length-adjusted`,
        promptText: currentPrompt.prompt_text + '\n\nWichtig: Erstelle eine prägnante, aber vollständige Zusammenfassung. Vermeide unnötige Details, aber erwähne alle wichtigen Punkte.'
      });
    }
    
    // Variation 2: Struktur verbessern
    if (feedbackAnalysis.commonIssues?.includes('unclear')) {
      variations.push({
        versionName: `${baseVersion}-structured`,
        promptText: currentPrompt.prompt_text + '\n\nStruktur: 1) Wichtigste Punkte zuerst, 2) Dringende Angelegenheiten hervorheben, 3) Klare Kategorisierung nach Priorität.'
      });
    }
    
    // Variation 3: Prioritäten stärker gewichten
    if (feedbackAnalysis.commonIssues?.includes('missing_important')) {
      variations.push({
        versionName: `${baseVersion}-priority-focused`,
        promptText: currentPrompt.prompt_text + '\n\nPrioritäten: Konzentriere dich besonders auf E-Mails von amandabernecker@gmail.com, Finanz- und Vorstandsmails. Diese haben höchste Priorität.'
      });
    }
    
    return variations;
  }

  /**
   * Prompt-Performance bewerten
   */
  private async evaluatePromptPerformance(): Promise<void> {
    try {
      await this.logger.info('learning-optimizer', 'Evaluating prompt performance');
      
      // Alle Prompt-Versionen mit Performance-Daten abrufen
      const { data: prompts, error } = await this.supabase
        .from('prompt_versions')
        .select('*')
        .not('performance_score', 'is', null)
        .order('performance_score', { ascending: false });

      if (error) {
        throw error;
      }

      if (!prompts || prompts.length === 0) {
        await this.logger.info('learning-optimizer', 'No prompts with performance data found');
        return;
      }

      // Beste Prompts identifizieren
      const bestPrompts = this.identifyBestPrompts(prompts);
      
      // Aktive Prompts aktualisieren
      await this.updateActivePrompts(bestPrompts);
      
      await this.logger.info('learning-optimizer', 'Completed prompt performance evaluation', {
        totalPrompts: prompts.length,
        bestPrompts: bestPrompts.length
      });

    } catch (error) {
      await this.logger.error('learning-optimizer', 'Failed to evaluate prompt performance', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Beste Prompts identifizieren
   */
  private identifyBestPrompts(prompts: PromptVersion[]): PromptVersion[] {
    const bestPrompts: PromptVersion[] = [];
    
    // Nach Agent-Typ gruppieren
    const promptsByType: Record<string, PromptVersion[]> = {};
    for (const prompt of prompts) {
      if (!promptsByType[prompt.agent_type]) {
        promptsByType[prompt.agent_type] = [];
      }
      promptsByType[prompt.agent_type].push(prompt);
    }
    
    // Beste Prompt für jeden Typ auswählen
    for (const [agentType, typePrompts] of Object.entries(promptsByType)) {
      const sorted = typePrompts.sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0));
      if (sorted.length > 0) {
        bestPrompts.push(sorted[0]);
      }
    }
    
    return bestPrompts;
  }

  /**
   * Aktive Prompts aktualisieren
   */
  private async updateActivePrompts(bestPrompts: PromptVersion[]): Promise<void> {
    try {
      // Alle aktuellen aktiven Prompts deaktivieren
      const { error: deactivateError } = await this.supabase
        .from('prompt_versions')
        .update({ is_active: false })
        .eq('is_active', true);

      if (deactivateError) {
        throw deactivateError;
      }

      // Beste Prompts aktivieren
      for (const prompt of bestPrompts) {
        const { error } = await this.supabase
          .from('prompt_versions')
          .update({ is_active: true })
          .eq('id', prompt.id);

        if (error) {
          await this.logger.error('learning-optimizer', `Failed to activate prompt: ${prompt.version_name}`, {
            error: error.message
          });
        } else {
          await this.logger.info('learning-optimizer', `Activated best prompt: ${prompt.version_name}`, {
            agentType: prompt.agent_type,
            performanceScore: prompt.performance_score
          });
        }
      }

    } catch (error) {
      await this.logger.error('learning-optimizer', 'Failed to update active prompts', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * A/B-Testing für neue Prompts
   */
  private async runABTesting(): Promise<void> {
    try {
      await this.logger.info('learning-optimizer', 'Running A/B testing for new prompts');
      
      // Inaktive Prompts mit ausreichend Feedback abrufen
      const { data: testPrompts, error } = await this.supabase
        .from('prompt_versions')
        .select('*')
        .eq('is_active', false)
        .gte('usage_count', 10); // Mindestens 10 Verwendungen

      if (error) {
        throw error;
      }

      if (!testPrompts || testPrompts.length === 0) {
        await this.logger.info('learning-optimizer', 'No prompts ready for A/B testing');
        return;
      }

      // A/B-Testing-Logik implementieren
      for (const prompt of testPrompts) {
        const shouldActivate = this.evaluateABTestResults(prompt);
        
        if (shouldActivate) {
          await this.activatePromptForTesting(prompt);
        }
      }

      await this.logger.info('learning-optimizer', 'Completed A/B testing', {
        testPrompts: testPrompts.length
      });

    } catch (error) {
      await this.logger.error('learning-optimizer', 'Failed to run A/B testing', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * A/B-Test-Ergebnisse bewerten
   */
  private evaluateABTestResults(prompt: PromptVersion): boolean {
    // Einfache Bewertung: Aktivieren wenn Performance > 0.7 und mindestens 10 Verwendungen
    return (prompt.performance_score || 0) > 0.7 && (prompt.usage_count || 0) >= 10;
  }

  /**
   * Prompt für A/B-Testing aktivieren
   */
  private async activatePromptForTesting(prompt: PromptVersion): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('prompt_versions')
        .update({ is_active: true })
        .eq('id', prompt.id);

      if (error) {
        throw error;
      }

      await this.logger.info('learning-optimizer', `Activated prompt for A/B testing: ${prompt.version_name}`, {
        promptVersion: prompt.version_name,
        agentType: prompt.agent_type,
        performanceScore: prompt.performance_score
      });

    } catch (error) {
      await this.logger.error('learning-optimizer', `Failed to activate prompt for testing: ${prompt.version_name}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
} 