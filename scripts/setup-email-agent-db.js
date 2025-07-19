#!/usr/bin/env node

/**
 * E-Mail Agent Database Setup Script
 * Erstellt alle notwendigen Tabellen für das E-Mail Agent System
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Umgebungsvariablen laden
config({ path: join(__dirname, '..', '.env.local') });

// Supabase Client erstellen
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupEmailAgentDatabase() {
  console.log('🚀 Setting up E-Mail Agent Database...\n');
  console.log(`📡 Connecting to: ${supabaseUrl}\n`);

  try {
    // Schema-Datei lesen
    const schemaPath = join(__dirname, '..', 'supabase-schema-email-agent.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    console.log('📋 Executing E-Mail Agent schema...');

    // Schema in Teile aufteilen und einzeln ausführen
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          // Direkte SQL-Ausführung über Supabase
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          if (stmtError) {
            console.log(`⚠️  Statement failed (continuing): ${stmtError.message}`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (e) {
          console.log(`⚠️  Statement skipped: ${e.message}`);
          errorCount++;
        }
      }
    }

    console.log(`✅ Schema execution completed: ${successCount} successful, ${errorCount} errors`);

    // Test: Prüfen ob Tabellen erstellt wurden
    console.log('\n🔍 Verifying tables...');
    
    const tables = [
      'email_accounts',
      'sender_priorities', 
      'emails',
      'daily_summaries',
      'summary_feedback',
      'relevance_feedback',
      'prompt_versions',
      'email_processing_logs'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (e) {
        console.log(`❌ Table ${table}: ${e.message}`);
      }
    }

    // Test: Prüfen ob Standard-Prompts vorhanden sind
    console.log('\n🔍 Checking default prompts...');
    
    const { data: prompts, error: promptsError } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('is_active', true);

    if (promptsError) {
      console.log(`❌ Error checking prompts: ${promptsError.message}`);
    } else {
      console.log(`✅ Found ${prompts?.length || 0} active prompts`);
      if (prompts) {
        prompts.forEach(prompt => {
          console.log(`   - ${prompt.version_name} (${prompt.agent_type})`);
        });
      }
    }

    // Test: Prüfen ob Standard-Sender-Prioritäten vorhanden sind
    console.log('\n🔍 Checking sender priorities...');
    
    const { data: priorities, error: prioritiesError } = await supabase
      .from('sender_priorities')
      .select('*');

    if (prioritiesError) {
      console.log(`❌ Error checking priorities: ${prioritiesError.message}`);
    } else {
      console.log(`✅ Found ${priorities?.length || 0} sender priorities`);
      if (priorities) {
        priorities.forEach(priority => {
          console.log(`   - ${priority.email_address} (${priority.priority_weight}/10)`);
        });
      }
    }

    console.log('\n🎉 E-Mail Agent Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Add email accounts in the Family Toolbox UI');
    console.log('   2. Test email fetching with the Mail Manager');
    console.log('   3. Check logs for any remaining issues');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Script ausführen
setupEmailAgentDatabase(); 