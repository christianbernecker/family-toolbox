// Email Monitor Agent für Family Toolbox
// Überwacht E-Mails und extrahiert wichtige Informationen

import { BaseAgent, type AgentExecutionContext, type AgentExecutionResult } from './base-agent';
import type { AgentConfiguration } from '@/lib/types/database';

interface EmailMonitorConfig {
  email_server: string;
  port: number;
  username: string;
  password: string;
  use_ssl: boolean;
  folders: string[];
  keywords: string[];
  exclude_senders: string[];
  max_emails_per_run: number;
  mark_as_read: boolean;
  ai_summary: boolean;
  notification_threshold: 'all' | 'important' | 'urgent';
}

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string[];
  date: string;
  body: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  categories: string[];
  summary?: string;
}

export class EmailMonitorAgent extends BaseAgent {
  constructor() {
    super(
      'email-monitor',
      'Email Monitor',
      'Überwacht E-Mail-Postfächer und extrahiert wichtige Informationen',
      '1.0.0'
    );
  }

  validateConfig(config: AgentConfiguration): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const emailConfig = config.configuration as EmailMonitorConfig;

    // Required fields validation
    if (!emailConfig.email_server) {
      errors.push('Email-Server ist erforderlich');
    }

    if (!emailConfig.username) {
      errors.push('Benutzername ist erforderlich');
    }

    if (!emailConfig.password) {
      errors.push('Passwort ist erforderlich');
    }

    if (!emailConfig.port || emailConfig.port < 1 || emailConfig.port > 65535) {
      errors.push('Gültiger Port ist erforderlich (1-65535)');
    }

    // Validate email server format
    if (emailConfig.email_server && !this.isValidEmailServer(emailConfig.email_server)) {
      errors.push('Ungültiger Email-Server Format');
    }

    // Validate folders array
    if (!emailConfig.folders || !Array.isArray(emailConfig.folders) || emailConfig.folders.length === 0) {
      errors.push('Mindestens ein E-Mail-Ordner muss angegeben werden');
    }

    // Validate limits
    if (emailConfig.max_emails_per_run && emailConfig.max_emails_per_run > 100) {
      errors.push('Maximale E-Mails pro Durchlauf sollte nicht mehr als 100 sein');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
    try {
      const config = context.config.configuration as EmailMonitorConfig;
      console.log(`Starting email monitoring for user ${context.userId}`);

      // Step 1: Connect to email server
      const connection = await this.connectToEmailServer(config);
      
      // Step 2: Fetch emails from specified folders
      const emails = await this.fetchEmails(connection, config);
      
      // Step 3: Process and categorize emails
      const processedEmails = await this.processEmails(emails, config, context);
      
      // Step 4: Generate AI summaries if enabled
      if (config.ai_summary && context.apiKeys) {
        await this.generateAISummaries(processedEmails, context);
      }
      
      // Step 5: Send notifications based on threshold
      await this.sendNotificationsIfNeeded(processedEmails, config, context);
      
      // Step 6: Cleanup and close connection
      await this.closeConnection(connection);

      const result = {
        emails_processed: emails.length,
        important_emails: processedEmails.filter(e => e.priority === 'high' || e.priority === 'urgent').length,
        notifications_sent: processedEmails.filter(e => this.shouldNotify(e, config)).length,
        categories_found: [...new Set(processedEmails.flatMap(e => e.categories))],
        processed_emails: processedEmails.map(e => ({
          id: e.id,
          subject: e.subject,
          from: e.from,
          priority: e.priority,
          categories: e.categories,
          summary: e.summary
        }))
      };

      return {
        success: true,
        data: result,
        metadata: {
          execution_type: 'email_monitoring',
          server: config.email_server,
          folders_checked: config.folders,
        }
      };

    } catch (error) {
      console.error('Email monitoring failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during email monitoring',
        metadata: {
          execution_type: 'email_monitoring',
          error_type: error instanceof Error ? error.constructor.name : 'UnknownError'
        }
      };
    }
  }

  async cleanup(context: AgentExecutionContext): Promise<void> {
    console.log(`Cleaning up Email Monitor Agent for user ${context.userId}`);
    // Close any persistent connections, clear caches, etc.
  }

  // ==========================================
  // EMAIL PROCESSING METHODS
  // ==========================================

  private async connectToEmailServer(config: EmailMonitorConfig): Promise<any> {
    // Simulated email server connection
    // In real implementation, would use libraries like 'imap' or 'node-imap'
    
    console.log(`Connecting to ${config.email_server}:${config.port} (SSL: ${config.use_ssl})`);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock connection object
    return {
      server: config.email_server,
      port: config.port,
      username: config.username,
      connected: true,
      folders: config.folders
    };
  }

  private async fetchEmails(connection: any, config: EmailMonitorConfig): Promise<EmailMessage[]> {
    console.log(`Fetching emails from folders: ${config.folders.join(', ')}`);
    
    // Simulated email fetching
    const mockEmails: EmailMessage[] = [
      {
        id: '1',
        subject: 'Wichtige Rechnung von Stadtwerke',
        from: 'service@stadtwerke.de',
        to: ['user@example.com'],
        date: new Date().toISOString(),
        body: 'Ihre Stromrechnung für den Monat Dezember ist verfügbar.',
        priority: 'high',
        categories: ['billing', 'utilities']
      },
      {
        id: '2',
        subject: 'Kindergarten Newsletter',
        from: 'info@kindergarten-sonnenschein.de',
        to: ['user@example.com'],
        date: new Date(Date.now() - 3600000).toISOString(),
        body: 'Liebe Eltern, hier sind die Neuigkeiten aus dem Kindergarten...',
        priority: 'normal',
        categories: ['education', 'family']
      },
      {
        id: '3',
        subject: 'EILIG: Terminverschiebung Arzttermin',
        from: 'praxis@dr-mueller.de',
        to: ['user@example.com'],
        date: new Date(Date.now() - 1800000).toISOString(),
        body: 'Sehr geehrte/r Patient/in, wir müssen Ihren Termin leider verschieben...',
        priority: 'urgent',
        categories: ['health', 'appointments']
      }
    ];

    // Filter based on configuration
    let filteredEmails = mockEmails;

    // Apply exclude senders filter
    if (config.exclude_senders && config.exclude_senders.length > 0) {
      filteredEmails = filteredEmails.filter(email => 
        !config.exclude_senders.some(excludeSender => 
          email.from.toLowerCase().includes(excludeSender.toLowerCase())
        )
      );
    }

    // Apply keywords filter if specified
    if (config.keywords && config.keywords.length > 0) {
      filteredEmails = filteredEmails.filter(email =>
        config.keywords.some(keyword =>
          email.subject.toLowerCase().includes(keyword.toLowerCase()) ||
          email.body.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    // Limit results
    const maxEmails = config.max_emails_per_run || 20;
    return filteredEmails.slice(0, maxEmails);
  }

  private async processEmails(
    emails: EmailMessage[], 
    config: EmailMonitorConfig, 
    context: AgentExecutionContext
  ): Promise<EmailMessage[]> {
    console.log(`Processing ${emails.length} emails`);

    return emails.map(email => {
      // Enhanced categorization
      const categories = this.categorizeEmail(email);
      
      // Priority detection
      const priority = this.detectPriority(email);

      return {
        ...email,
        categories,
        priority
      };
    });
  }

  private async generateAISummaries(
    emails: EmailMessage[],
    context: AgentExecutionContext
  ): Promise<void> {
    console.log(`Generating AI summaries for ${emails.length} emails`);

    for (const email of emails) {
      try {
        // In real implementation, would use OpenAI or Claude API
        // const aiClient = await this.getApiClient(context, 'openai');
        
        // Simulated AI summary
        email.summary = this.generateMockSummary(email);
        
      } catch (error) {
        console.error(`Failed to generate summary for email ${email.id}:`, error);
        email.summary = `Automatische Zusammenfassung fehlgeschlagen: ${email.subject}`;
      }
    }
  }

  private async sendNotificationsIfNeeded(
    emails: EmailMessage[],
    config: EmailMonitorConfig,
    context: AgentExecutionContext
  ): Promise<void> {
    const emailsToNotify = emails.filter(email => this.shouldNotify(email, config));

    if (emailsToNotify.length === 0) {
      return;
    }

    console.log(`Sending notifications for ${emailsToNotify.length} emails`);

    for (const email of emailsToNotify) {
      await this.sendNotification(
        context,
        `Neue wichtige E-Mail: ${email.subject}`,
        `Von: ${email.from}\nKategorien: ${email.categories.join(', ')}\n${email.summary || ''}`,
        this.getPriorityNotificationType(email.priority)
      );
    }

    // Send summary notification if multiple emails
    if (emailsToNotify.length > 1) {
      await this.sendNotification(
        context,
        `E-Mail Zusammenfassung`,
        `${emailsToNotify.length} neue wichtige E-Mails erhalten. ${emailsToNotify.filter(e => e.priority === 'urgent').length} davon sind dringend.`,
        'info'
      );
    }
  }

  private async closeConnection(connection: any): Promise<void> {
    console.log('Closing email server connection');
    // Cleanup connection resources
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  private isValidEmailServer(server: string): boolean {
    // Basic email server validation
    const emailServerRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailServerRegex.test(server);
  }

  private categorizeEmail(email: EmailMessage): string[] {
    const categories: string[] = [];
    const content = `${email.subject} ${email.body}`.toLowerCase();

    // Financial/Billing
    if (content.includes('rechnung') || content.includes('zahlung') || content.includes('mahnung')) {
      categories.push('billing');
    }

    // Health
    if (content.includes('arzt') || content.includes('termin') || content.includes('gesundheit') || content.includes('krankenhaus')) {
      categories.push('health');
    }

    // Education
    if (content.includes('schule') || content.includes('kindergarten') || content.includes('lehrer')) {
      categories.push('education');
    }

    // Official/Government
    if (content.includes('amt') || content.includes('behörde') || content.includes('steuer')) {
      categories.push('official');
    }

    // Family
    if (content.includes('familie') || content.includes('kind') || content.includes('eltern')) {
      categories.push('family');
    }

    return categories.length > 0 ? categories : ['general'];
  }

  private detectPriority(email: EmailMessage): 'low' | 'normal' | 'high' | 'urgent' {
    const subject = email.subject.toLowerCase();
    const body = email.body.toLowerCase();

    // Urgent indicators
    if (subject.includes('eilig') || subject.includes('dringend') || subject.includes('notfall')) {
      return 'urgent';
    }

    // High priority indicators
    if (subject.includes('wichtig') || subject.includes('frist') || subject.includes('deadline')) {
      return 'high';
    }

    // Check for billing/financial urgency
    if ((subject.includes('rechnung') || subject.includes('mahnung')) && 
        (body.includes('fällig') || body.includes('überfällig'))) {
      return 'high';
    }

    // Check for appointment cancellations/changes
    if (subject.includes('termin') && (subject.includes('abgesagt') || subject.includes('verschoben'))) {
      return 'high';
    }

    return 'normal';
  }

  private generateMockSummary(email: EmailMessage): string {
    // Mock AI summary generation
    const summaries = {
      'billing': `Rechnungsdetails: ${email.subject}. Bitte prüfen und rechtzeitig begleichen.`,
      'health': `Gesundheitsbezogene Nachricht bezüglich: ${email.subject}. Termine beachten.`,
      'education': `Bildungsrelevante Information: ${email.subject}. Für Familien wichtig.`,
      'official': `Behördliche Mitteilung: ${email.subject}. Möglicherweise Handlungsbedarf.`,
      'family': `Familienbezogene Nachricht: ${email.subject}.`,
    };

    const primaryCategory = email.categories[0] || 'general';
    return summaries[primaryCategory as keyof typeof summaries] || 
           `Zusammenfassung: ${email.subject.substring(0, 100)}...`;
  }

  private shouldNotify(email: EmailMessage, config: EmailMonitorConfig): boolean {
    switch (config.notification_threshold) {
      case 'all':
        return true;
      case 'important':
        return email.priority === 'high' || email.priority === 'urgent';
      case 'urgent':
        return email.priority === 'urgent';
      default:
        return false;
    }
  }

  private getPriorityNotificationType(priority: string): 'info' | 'warning' | 'error' | 'success' {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      default:
        return 'info';
    }
  }
} 