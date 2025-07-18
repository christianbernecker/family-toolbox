// E-Mail Agent Types
// Definiert alle TypeScript-Interfaces für das E-Mail Agent System

export interface EmailAccount {
  id: string;
  name?: string;
  email: string;
  provider: 'gmail' | 'ionos' | 'outlook' | 'yahoo' | 'protonmail' | 'custom';
  imap_host: string;
  imap_port: number;
  username: string;
  password_encrypted: string;
  priority_weight: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SenderPriority {
  id: string;
  email_address: string;
  priority_weight: number; // 1-10
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Email {
  id: string;
  account_id: string;
  message_id: string;
  sender_email: string;
  sender_name?: string;
  subject: string;
  body_text?: string;
  body_html?: string;
  received_at: string;
  relevance_score?: number; // 1-10
  relevance_confidence?: number; // 0.00-1.00
  category?: 'personal' | 'system' | 'marketing' | 'other';
  is_processed: boolean;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface DailySummary {
  id: string;
  date: string;
  account_id: string;
  time_range_start: string;
  time_range_end: string;
  summary_text: string;
  total_emails: number;
  relevant_emails: number;
  high_priority_emails: number;
  prompt_version?: string;
  tokens_used?: number;
  processing_time_ms?: number;
  created_at: string;
}

export interface SummaryFeedback {
  id: string;
  summary_id: string;
  user_id: string;
  rating: number; // 1-6 (Schulnotensystem)
  feedback_text?: string;
  created_at: string;
}

export interface RelevanceFeedback {
  id: string;
  email_id: string;
  user_id: string;
  manual_relevance_score: number; // 1-10
  feedback_notes?: string;
  created_at: string;
}

export interface PromptVersion {
  id: string;
  version_name: string;
  agent_type: 'summary' | 'relevance';
  prompt_text: string;
  is_active: boolean;
  performance_score?: number; // 0.00-1.00
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface EmailProcessingLog {
  id: string;
  account_id: string;
  process_type: 'fetch' | 'summarize' | 'relevance';
  status: 'success' | 'error' | 'partial';
  emails_processed: number;
  emails_new: number;
  emails_errors: number;
  processing_time_ms?: number;
  error_message?: string;
  created_at: string;
}

// API Response Types
export interface EmailFetchResult {
  account: string;
  newEmails: number;
  processed: boolean;
  error?: string;
}

export interface SummaryGenerationResult {
  summary: DailySummary;
  emails: Email[];
  processingTime: number;
  tokensUsed: number;
}

export interface RelevanceEvaluationResult {
  emailId: string;
  relevanceScore: number;
  confidence: number;
  category: string;
  processingTime: number;
}

// Frontend State Types
export interface EmailDashboardState {
  summaries: DailySummary[];
  recentEmails: Email[];
  isLoading: boolean;
  error?: string;
}

export interface EmailConfigState {
  accounts: EmailAccount[];
  senderPriorities: SenderPriority[];
  isLoading: boolean;
  error?: string;
}

// IMAP Configuration Types
export interface ImapConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  tls: boolean;
  tlsOptions?: {
    rejectUnauthorized: boolean;
  };
}

// AI Processing Types
export interface RelevanceEvaluationRequest {
  emailId: string;
  subject: string;
  bodyText: string;
  senderEmail: string;
  senderName?: string;
}

export interface SummaryGenerationRequest {
  accountId: string;
  timeRangeStart: string;
  timeRangeEnd: string;
  emails: Email[];
  promptVersion?: string;
}

// Feedback Types
export interface FeedbackSubmission {
  type: 'summary' | 'relevance';
  targetId: string; // summary_id oder email_id
  rating: number;
  feedbackText?: string;
  userId: string;
}

// Real-time Update Types
export interface EmailUpdate {
  type: 'new_email' | 'email_processed' | 'summary_generated';
  data: Email | DailySummary;
  timestamp: string;
}

// Error Types
export interface EmailAgentError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Utility Types
export type EmailCategory = 'personal' | 'system' | 'marketing' | 'other';
export type EmailProvider = 'gmail' | 'ionos';
export type ProcessType = 'fetch' | 'summarize' | 'relevance';
export type ProcessStatus = 'success' | 'error' | 'partial';
export type AgentType = 'summary' | 'relevance';

// Constants
export const EMAIL_CATEGORIES: EmailCategory[] = ['personal', 'system', 'marketing', 'other'];
export const EMAIL_PROVIDERS: EmailProvider[] = ['gmail', 'ionos'];
export const PROCESS_TYPES: ProcessType[] = ['fetch', 'summarize', 'relevance'];
export const PROCESS_STATUSES: ProcessStatus[] = ['success', 'error', 'partial'];
export const AGENT_TYPES: AgentType[] = ['summary', 'relevance'];

// Default IMAP Configurations
export const DEFAULT_IMAP_CONFIGS: Record<string, Omit<ImapConfig, 'username' | 'password'>> = {
  gmail: {
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false
    }
  },
  outlook: {
    host: 'outlook.office365.com',
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false
    }
  },
  yahoo: {
    host: 'imap.mail.yahoo.com',
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false
    }
  },
  protonmail: {
    host: 'imap.protonmail.ch',
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false
    }
  },
  ionos: {
    host: 'imap.ionos.de',
    port: 993,
    tls: true,
    tlsOptions: {
      rejectUnauthorized: false
    }
  }
}; 