// Mail Manager Service (Agent 1)
// Verantwortlich für IMAP-Verbindung, E-Mail-Abruf und -Speicherung

import { createClient } from '@supabase/supabase-js';
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import { LogService } from '../services/log-service';
import { 
  EmailAccount, 
  Email, 
  EmailFetchResult, 
  EmailProcessingLog,
  ImapConfig,
  DEFAULT_IMAP_CONFIGS 
} from '../../types/email-agent';

export class MailManagerService {
  private static instance: MailManagerService;
  private supabase: any;
  private logger: LogService;

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.logger = LogService.getInstance();
  }

  public static getInstance(): MailManagerService {
    if (!MailManagerService.instance) {
      MailManagerService.instance = new MailManagerService();
    }
    return MailManagerService.instance;
  }

  /**
   * Hauptfunktion: Alle aktiven E-Mail-Accounts abrufen und verarbeiten
   */
  async processAllAccounts(): Promise<EmailFetchResult[]> {
    const startTime = Date.now();
    
    try {
      await this.logger.info('mail-manager', 'Starting email fetch for all accounts');
      
      // Alle aktiven E-Mail-Accounts abrufen
      const { data: accounts, error } = await this.supabase
        .from('email_accounts')
        .select('*')
        .eq('is_active', true);

      if (error) {
        throw new Error(`Failed to fetch email accounts: ${error.message}`);
      }

      if (!accounts || accounts.length === 0) {
        await this.logger.warn('mail-manager', 'No active email accounts found');
        return [];
      }

      const results: EmailFetchResult[] = [];
      
      // Parallel alle Accounts verarbeiten
      const promises = accounts.map((account: EmailAccount) => this.processAccount(account));
      const accountResults = await Promise.allSettled(promises);
      
      for (let i = 0; i < accountResults.length; i++) {
        const result = accountResults[i];
        const account = accounts[i];
        
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            account: account.email,
            newEmails: 0,
            processed: false,
            error: result.reason?.message || 'Unknown error'
          });
          
          await this.logger.error('mail-manager', `Failed to process account ${account.email}`, {
            error: result.reason?.message
          });
        }
      }

      const processingTime = Date.now() - startTime;
      await this.logger.info('mail-manager', 'Completed email fetch for all accounts', {
        totalAccounts: accounts.length,
        successfulAccounts: results.filter(r => r.processed).length,
        totalNewEmails: results.reduce((sum, r) => sum + r.newEmails, 0),
        processingTime
      });

      return results;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      await this.logger.error('mail-manager', 'Failed to process email accounts', {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });
      
      throw error;
    }
  }

  /**
   * Einzelnen E-Mail-Account verarbeiten
   */
  private async processAccount(account: EmailAccount): Promise<EmailFetchResult> {
    const startTime = Date.now();
    let newEmails = 0;
    let errors = 0;

    try {
      await this.logger.info('mail-manager', `Processing account: ${account.email}`);

      // IMAP-Konfiguration erstellen
      const imapConfig = this.createImapConfig(account);
      
      // E-Mails abrufen
      const emails = await this.fetchEmailsFromAccount(imapConfig, account);
      
      // Neue E-Mails in Datenbank speichern
      for (const email of emails) {
        try {
          const saved = await this.saveEmail(email, account.id);
          if (saved) newEmails++;
        } catch (error) {
          errors++;
          await this.logger.error('mail-manager', `Failed to save email: ${email.message_id}`, {
            error: error instanceof Error ? error.message : 'Unknown error',
            accountId: account.id
          });
        }
      }

      // Verarbeitungs-Log speichern
      const processingTime = Date.now() - startTime;
      await this.saveProcessingLog({
        account_id: account.id,
        process_type: 'fetch',
        status: errors > 0 ? 'partial' : 'success',
        emails_processed: emails.length,
        emails_new: newEmails,
        emails_errors: errors,
        processing_time_ms: processingTime
      });

      await this.logger.info('mail-manager', `Completed processing account: ${account.email}`, {
        totalEmails: emails.length,
        newEmails,
        errors,
        processingTime
      });

      return {
        account: account.email,
        newEmails,
        processed: true
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Fehler-Log speichern
      await this.saveProcessingLog({
        account_id: account.id,
        process_type: 'fetch',
        status: 'error',
        emails_processed: 0,
        emails_new: 0,
        emails_errors: 1,
        processing_time_ms: processingTime,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

      await this.logger.error('mail-manager', `Failed to process account: ${account.email}`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime
      });

      return {
        account: account.email,
        newEmails: 0,
        processed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * IMAP-Konfiguration für Account erstellen
   */
  private createImapConfig(account: EmailAccount): any {
    const baseConfig = DEFAULT_IMAP_CONFIGS[account.provider];
    
    return {
      ...baseConfig,
      user: account.username,
      password: this.decryptPassword(account.password_encrypted)
    };
  }

  /**
   * Passwort entschlüsseln
   */
  private decryptPassword(encryptedPassword: string): string {
    // TODO: Implementiere Verschlüsselung/Entschlüsselung
    // Für jetzt: Base64 Decoding als Platzhalter
    return Buffer.from(encryptedPassword, 'base64').toString('utf-8');
  }

  /**
   * E-Mails von IMAP-Server abrufen
   */
  private async fetchEmailsFromAccount(imapConfig: any, account: EmailAccount): Promise<Partial<Email>[]> {
    return new Promise((resolve, reject) => {
      const imap = new Imap(imapConfig);
      const emails: Partial<Email>[] = [];

      imap.once('ready', () => {
        imap.openBox('INBOX', false, (err: any, box: any) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          // Nur E-Mails der letzten 24 Stunden abrufen
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          const searchCriteria = [
            ['SINCE', yesterday]
          ];

          imap.search(searchCriteria, (err: any, results: any) => {
            if (err) {
              imap.end();
              return reject(err);
            }

            if (results.length === 0) {
              imap.end();
              return resolve([]);
            }

            const fetch = imap.fetch(results, { bodies: '', struct: true });

            fetch.on('message', (msg: any, seqno: any) => {
              let buffer = '';
              let attributes: any;

              msg.on('body', (stream: any, info: any) => {
                stream.on('data', (chunk: any) => {
                  buffer += chunk.toString('utf8');
                });
              });

              msg.once('attributes', (attrs: any) => {
                attributes = attrs;
              });

              msg.once('end', async () => {
                try {
                  const parsed = await simpleParser(buffer);
                  
                  const email: Partial<Email> = {
                    message_id: parsed.messageId || `msg_${Date.now()}_${Math.random()}`,
                    sender_email: parsed.from?.value[0]?.address || '',
                    sender_name: parsed.from?.value[0]?.name || '',
                    subject: parsed.subject || '',
                    body_text: parsed.text || '',
                    body_html: parsed.html || '',
                    received_at: parsed.date?.toISOString() || new Date().toISOString(),
                    is_processed: false,
                    is_read: false
                  };

                  emails.push(email);
                } catch (parseError) {
                  console.error('Failed to parse email:', parseError);
                }
              });
            });

            fetch.once('error', (err: any) => {
              imap.end();
              reject(err);
            });

            fetch.once('end', () => {
              imap.end();
              resolve(emails);
            });
          });
        });
      });

      imap.once('error', (err: any) => {
        reject(err);
      });

      imap.once('end', () => {
        // Connection ended
      });

      imap.connect();
    });
  }

  /**
   * E-Mail in Datenbank speichern (mit Duplikatserkennung)
   */
  private async saveEmail(email: Partial<Email>, accountId: string): Promise<boolean> {
    try {
      // Prüfen ob E-Mail bereits existiert
      const { data: existing } = await this.supabase
        .from('emails')
        .select('id')
        .eq('message_id', email.message_id)
        .eq('account_id', accountId)
        .single();

      if (existing) {
        return false; // E-Mail bereits vorhanden
      }

      // Neue E-Mail speichern
      const { error } = await this.supabase
        .from('emails')
        .insert({
          ...email,
          account_id: accountId
        });

      if (error) {
        throw error;
      }

      return true;

    } catch (error) {
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
      await this.logger.error('mail-manager', 'Failed to save processing log', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Alte E-Mails löschen (Retention Policy)
   */
  async cleanupOldEmails(retentionDays: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      const { error } = await this.supabase
        .from('emails')
        .delete()
        .lt('received_at', cutoffDate.toISOString());

      if (error) {
        throw error;
      }

      await this.logger.info('mail-manager', 'Cleaned up old emails', {
        retentionDays,
        cutoffDate: cutoffDate.toISOString()
      });

    } catch (error) {
      await this.logger.error('mail-manager', 'Failed to cleanup old emails', {
        error: error instanceof Error ? error.message : 'Unknown error',
        retentionDays
      });
    }
  }
} 