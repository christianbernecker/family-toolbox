#!/usr/bin/env node

/**
 * Summary Problem Debug Script
 * Analysiert das Problem mit leeren Zusammenfassungen
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Umgebungsvariablen laden
config({ path: join(__dirname, '..', '.env.local') });

// Supabase Client erstellen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugSummaryProblem() {
  console.log('🔍 Debugging Summary Problem...\n');

  try {
    // 1. Prüfen ob E-Mails mit Relevanz-Scores existieren
    console.log('1. Checking emails with relevance scores...');
    const { data: emailsWithScores, error: emailsError } = await supabase
      .from('emails')
      .select('*')
      .not('relevance_score', 'is', null)
      .gte('relevance_score', 5)
      .order('received_at', { ascending: false })
      .limit(10);

    if (emailsError) {
      console.log(`❌ Error fetching emails with scores: ${emailsError.message}`);
    } else {
      console.log(`✅ Found ${emailsWithScores?.length || 0} emails with relevance scores >= 5`);
      if (emailsWithScores && emailsWithScores.length > 0) {
        emailsWithScores.forEach(email => {
          console.log(`   - ${email.subject} (${email.sender_email}) - Score: ${email.relevance_score}/10`);
        });
      }
    }

    // 2. Prüfen ob E-Mails der letzten 6 Stunden existieren
    console.log('\n2. Checking emails from last 6 hours...');
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    
    const { data: recentEmails, error: recentError } = await supabase
      .from('emails')
      .select('*')
      .gte('received_at', sixHoursAgo.toISOString())
      .order('received_at', { ascending: false });

    if (recentError) {
      console.log(`❌ Error fetching recent emails: ${recentError.message}`);
    } else {
      console.log(`✅ Found ${recentEmails?.length || 0} emails from last 6 hours`);
      if (recentEmails && recentEmails.length > 0) {
        const relevantRecent = recentEmails.filter(e => e.relevance_score && e.relevance_score >= 5);
        console.log(`   - ${relevantRecent.length} relevant emails (score >= 5)`);
        relevantRecent.forEach(email => {
          console.log(`     * ${email.subject} - Score: ${email.relevance_score}/10`);
        });
      }
    }

    // 3. Prüfen ob daily_summaries Tabelle existiert und Einträge hat
    console.log('\n3. Checking daily_summaries table...');
    const { data: summaries, error: summariesError } = await supabase
      .from('daily_summaries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (summariesError) {
      console.log(`❌ Error fetching summaries: ${summariesError.message}`);
      console.log('   → This explains why no summaries are shown!');
    } else {
      console.log(`✅ Found ${summaries?.length || 0} daily summaries`);
      if (summaries && summaries.length > 0) {
        summaries.forEach(summary => {
          console.log(`   - ${summary.date}: ${summary.relevant_emails} relevant emails, ${summary.summary_text?.substring(0, 50)}...`);
        });
      }
    }

    // 4. Prüfen ob prompt_versions existieren
    console.log('\n4. Checking prompt_versions...');
    const { data: prompts, error: promptsError } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('agent_type', 'summary')
      .eq('is_active', true);

    if (promptsError) {
      console.log(`❌ Error fetching prompts: ${promptsError.message}`);
    } else {
      console.log(`✅ Found ${prompts?.length || 0} active summary prompts`);
      if (prompts && prompts.length > 0) {
        prompts.forEach(prompt => {
          console.log(`   - ${prompt.version_name}: ${prompt.prompt_text.substring(0, 50)}...`);
        });
      }
    }

    // 5. Prüfen ob E-Mail-Accounts existieren
    console.log('\n5. Checking email accounts...');
    const { data: accounts, error: accountsError } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('is_active', true);

    if (accountsError) {
      console.log(`❌ Error fetching accounts: ${accountsError.message}`);
    } else {
      console.log(`✅ Found ${accounts?.length || 0} active email accounts`);
      if (accounts && accounts.length > 0) {
        accounts.forEach(account => {
          console.log(`   - ${account.email} (${account.provider})`);
        });
      }
    }

    // 6. Prüfen ob E-Mails nach Accounts gruppiert werden können
    console.log('\n6. Checking email grouping by accounts...');
    if (recentEmails && recentEmails.length > 0) {
      const emailsByAccount = {};
      recentEmails.forEach(email => {
        if (email.account_id) {
          if (!emailsByAccount[email.account_id]) {
            emailsByAccount[email.account_id] = [];
          }
          emailsByAccount[email.account_id].push(email);
        }
      });
      
      console.log(`✅ Emails grouped by ${Object.keys(emailsByAccount).length} accounts`);
      Object.entries(emailsByAccount).forEach(([accountId, emails]) => {
        const relevantEmails = emails.filter(e => e.relevance_score && e.relevance_score >= 5);
        console.log(`   - Account ${accountId}: ${emails.length} total, ${relevantEmails.length} relevant`);
      });
    }

    // 7. Test der Anthropic API
    console.log('\n7. Testing Anthropic API...');
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      console.log('❌ ANTHROPIC_API_KEY not found in environment');
    } else {
      console.log('✅ ANTHROPIC_API_KEY found');
    }

    // 8. Zusammenfassung und Empfehlungen
    console.log('\n📋 Summary:');
    console.log(`   - Emails with scores >= 5: ${emailsWithScores?.length || 0}`);
    console.log(`   - Recent emails (6h): ${recentEmails?.length || 0}`);
    console.log(`   - Daily summaries: ${summaries?.length || 0}`);
    console.log(`   - Active summary prompts: ${prompts?.length || 0}`);
    console.log(`   - Active email accounts: ${accounts?.length || 0}`);
    console.log(`   - Anthropic API: ${anthropicKey ? '✅' : '❌'}`);

    // 9. Empfehlungen
    console.log('\n💡 Recommendations:');
    
    if (!emailsWithScores || emailsWithScores.length === 0) {
      console.log('   - No emails with relevance scores >= 5 found');
      console.log('   - Run "E-Mails verarbeiten" to generate relevance scores');
    }
    
    if (!recentEmails || recentEmails.length === 0) {
      console.log('   - No recent emails found');
      console.log('   - Run "E-Mails abrufen" to fetch new emails');
    }
    
    if (!summaries || summaries.length === 0) {
      console.log('   - No daily summaries found');
      if (emailsWithScores && emailsWithScores.length > 0) {
        console.log('   - Run "E-Mails verarbeiten" to generate summaries');
      }
    }
    
    if (!prompts || prompts.length === 0) {
      console.log('   - No active summary prompts found');
      console.log('   - Create prompt_versions table and insert default prompts');
    }
    
    if (!anthropicKey) {
      console.log('   - Set ANTHROPIC_API_KEY environment variable');
    }

    // 10. Test der Summary-Generierung
    if (emailsWithScores && emailsWithScores.length > 0 && accounts && accounts.length > 0) {
      console.log('\n🧪 Testing summary generation logic...');
      
      const testAccountId = accounts[0].id;
      const testEmails = emailsWithScores.filter(e => e.account_id === testAccountId);
      
      if (testEmails.length > 0) {
        console.log(`   - Test account: ${accounts[0].email}`);
        console.log(`   - Test emails: ${testEmails.length} with scores >= 5`);
        
        const relevantTestEmails = testEmails.filter(e => e.relevance_score >= 5);
        console.log(`   - Relevant emails for summary: ${relevantTestEmails.length}`);
        
        if (relevantTestEmails.length > 0) {
          console.log('   ✅ Summary generation should work with these emails');
        } else {
          console.log('   ❌ No relevant emails for summary generation');
        }
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

// Script ausführen
debugSummaryProblem(); 