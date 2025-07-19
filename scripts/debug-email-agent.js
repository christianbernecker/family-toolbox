#!/usr/bin/env node

/**
 * E-Mail Agent Debug Script
 * Analysiert das Problem mit dem Summary-Agent
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

async function debugEmailAgent() {
  console.log('🔍 Debugging E-Mail Agent...\n');

  try {
    // 1. Prüfen ob E-Mail-Accounts existieren
    console.log('1. Checking email accounts...');
    const { data: accounts, error: accountsError } = await supabase
      .from('email_accounts')
      .select('*');

    if (accountsError) {
      console.log(`❌ Error fetching accounts: ${accountsError.message}`);
    } else {
      console.log(`✅ Found ${accounts?.length || 0} email accounts`);
      if (accounts && accounts.length > 0) {
        accounts.forEach(account => {
          console.log(`   - ${account.email} (${account.provider})`);
        });
      }
    }

    // 2. Prüfen ob E-Mails existieren
    console.log('\n2. Checking emails...');
    const { data: emails, error: emailsError } = await supabase
      .from('emails')
      .select('*')
      .limit(5);

    if (emailsError) {
      console.log(`❌ Error fetching emails: ${emailsError.message}`);
    } else {
      console.log(`✅ Found ${emails?.length || 0} emails (showing first 5)`);
      if (emails && emails.length > 0) {
        emails.forEach(email => {
          console.log(`   - ${email.subject} (${email.sender_email}) - Processed: ${email.is_processed}`);
        });
      }
    }

    // 3. Prüfen ob unverarbeitete E-Mails existieren
    console.log('\n3. Checking unprocessed emails...');
    const { data: unprocessedEmails, error: unprocessedError } = await supabase
      .from('emails')
      .select('*')
      .eq('is_processed', false)
      .limit(5);

    if (unprocessedError) {
      console.log(`❌ Error fetching unprocessed emails: ${unprocessedError.message}`);
    } else {
      console.log(`✅ Found ${unprocessedEmails?.length || 0} unprocessed emails`);
      if (unprocessedEmails && unprocessedEmails.length > 0) {
        unprocessedEmails.forEach(email => {
          console.log(`   - ${email.subject} (${email.sender_email})`);
        });
      }
    }

    // 4. Prüfen ob prompt_versions Tabelle existiert
    console.log('\n4. Checking prompt_versions table...');
    const { data: prompts, error: promptsError } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('is_active', true);

    if (promptsError) {
      console.log(`❌ Error fetching prompts: ${promptsError.message}`);
      console.log('   → This explains why the summary agent fails!');
    } else {
      console.log(`✅ Found ${prompts?.length || 0} active prompts`);
      if (prompts && prompts.length > 0) {
        prompts.forEach(prompt => {
          console.log(`   - ${prompt.version_name} (${prompt.agent_type})`);
        });
      }
    }

    // 5. Prüfen ob sender_priorities existieren
    console.log('\n5. Checking sender priorities...');
    const { data: priorities, error: prioritiesError } = await supabase
      .from('sender_priorities')
      .select('*');

    if (prioritiesError) {
      console.log(`❌ Error fetching priorities: ${prioritiesError.message}`);
    } else {
      console.log(`✅ Found ${priorities?.length || 0} sender priorities`);
    }

    // 6. Prüfen ob daily_summaries existieren
    console.log('\n6. Checking daily summaries...');
    const { data: summaries, error: summariesError } = await supabase
      .from('daily_summaries')
      .select('*')
      .limit(5);

    if (summariesError) {
      console.log(`❌ Error fetching summaries: ${summariesError.message}`);
    } else {
      console.log(`✅ Found ${summaries?.length || 0} daily summaries`);
    }

    // 7. Test der Anthropic API
    console.log('\n7. Testing Anthropic API...');
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) {
      console.log('❌ ANTHROPIC_API_KEY not found in environment');
    } else {
      console.log('✅ ANTHROPIC_API_KEY found');
    }

    // 8. Zusammenfassung
    console.log('\n📋 Summary:');
    console.log(`   - Email accounts: ${accounts?.length || 0}`);
    console.log(`   - Total emails: ${emails?.length || 0}`);
    console.log(`   - Unprocessed emails: ${unprocessedEmails?.length || 0}`);
    console.log(`   - Active prompts: ${prompts?.length || 0}`);
    console.log(`   - Sender priorities: ${priorities?.length || 0}`);
    console.log(`   - Daily summaries: ${summaries?.length || 0}`);
    console.log(`   - Anthropic API: ${anthropicKey ? '✅' : '❌'}`);

    // 9. Empfehlungen
    console.log('\n💡 Recommendations:');
    if (!accounts || accounts.length === 0) {
      console.log('   - Add email accounts in the UI');
    }
    if (!emails || emails.length === 0) {
      console.log('   - Run Mail Manager to fetch emails');
    }
    if (!prompts || prompts.length === 0) {
      console.log('   - Create prompt_versions table and insert default prompts');
    }
    if (!anthropicKey) {
      console.log('   - Set ANTHROPIC_API_KEY environment variable');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

// Script ausführen
debugEmailAgent(); 