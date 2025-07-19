#!/usr/bin/env node

/**
 * Insert Default Prompts Script
 * Fügt Standard-Prompts für den E-Mail Agent ein
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

async function insertDefaultPrompts() {
  console.log('🚀 Inserting default prompts...\n');

  try {
    // Standard-Prompts definieren
    const defaultPrompts = [
      {
        version_name: 'relevance-v1',
        agent_type: 'relevance',
        prompt_text: 'Bewerte die Relevanz dieser E-Mail für einen Kita-Verein auf einer Skala von 1-10. Berücksichtige: Persönliche Kommunikation, Finanzangelegenheiten, Vorstandsentscheidungen, Werbung/Spam. Höhere Relevanz für: amandabernecker@gmail.com, Finanz- und Vorstandsmails.',
        is_active: true
      },
      {
        version_name: 'summary-v1',
        agent_type: 'summary',
        prompt_text: 'Erstelle eine prägnante Zusammenfassung der wichtigsten E-Mails der letzten 6 Stunden. Gruppiere nach Kategorien (persönlich, finanziell, vorstand). Hebe dringende Angelegenheiten hervor. Maximal 300 Wörter.',
        is_active: true
      }
    ];

    // Standard-Sender-Prioritäten definieren
    const defaultPriorities = [
      {
        email_address: 'amandabernecker@gmail.com',
        priority_weight: 10,
        notes: 'Ehefrau - höchste Priorität'
      },
      {
        email_address: 'finanzen@wuermchen.org',
        priority_weight: 8,
        notes: 'Finanzielle Angelegenheiten'
      },
      {
        email_address: 'vorstand@wuermchen.org',
        priority_weight: 8,
        notes: 'Vorstandsentscheidungen'
      },
      {
        email_address: 'info@wuermchen.org',
        priority_weight: 6,
        notes: 'Allgemeine Vereinsinformationen'
      },
      {
        email_address: 'noreply@wuermchen.org',
        priority_weight: 2,
        notes: 'System-E-Mails'
      },
      {
        email_address: 'newsletter@wuermchen.org',
        priority_weight: 3,
        notes: 'Newsletter - niedrige Priorität'
      }
    ];

    // Prompts einfügen
    console.log('📝 Inserting default prompts...');
    for (const prompt of defaultPrompts) {
      try {
        const { data, error } = await supabase
          .from('prompt_versions')
          .upsert(prompt, { onConflict: 'version_name' })
          .select()
          .single();

        if (error) {
          console.log(`⚠️  Prompt ${prompt.version_name}: ${error.message}`);
        } else {
          console.log(`✅ Prompt ${prompt.version_name}: Inserted`);
        }
      } catch (e) {
        console.log(`❌ Prompt ${prompt.version_name}: ${e.message}`);
      }
    }

    // Sender-Prioritäten einfügen
    console.log('\n👤 Inserting sender priorities...');
    for (const priority of defaultPriorities) {
      try {
        const { data, error } = await supabase
          .from('sender_priorities')
          .upsert(priority, { onConflict: 'email_address' })
          .select()
          .single();

        if (error) {
          console.log(`⚠️  Priority ${priority.email_address}: ${error.message}`);
        } else {
          console.log(`✅ Priority ${priority.email_address}: Inserted`);
        }
      } catch (e) {
        console.log(`❌ Priority ${priority.email_address}: ${e.message}`);
      }
    }

    // Verifikation
    console.log('\n🔍 Verifying data...');
    
    const { data: prompts, error: promptsError } = await supabase
      .from('prompt_versions')
      .select('*')
      .eq('is_active', true);

    if (promptsError) {
      console.log(`❌ Error checking prompts: ${promptsError.message}`);
    } else {
      console.log(`✅ Found ${prompts?.length || 0} active prompts`);
    }

    const { data: priorities, error: prioritiesError } = await supabase
      .from('sender_priorities')
      .select('*');

    if (prioritiesError) {
      console.log(`❌ Error checking priorities: ${prioritiesError.message}`);
    } else {
      console.log(`✅ Found ${priorities?.length || 0} sender priorities`);
    }

    console.log('\n🎉 Default data insertion completed!');

  } catch (error) {
    console.error('❌ Insertion failed:', error.message);
    process.exit(1);
  }
}

// Script ausführen
insertDefaultPrompts(); 