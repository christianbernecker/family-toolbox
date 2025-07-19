#!/usr/bin/env node

/**
 * Backend API Keys Test Script
 * Testet die API Keys direkt aus der Datenbank im Backend
 */

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import CryptoJS from 'crypto-js';
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Umgebungsvariablen laden
config({ path: join(__dirname, '..', '.env.local') });

async function testBackendApiKeys() {
  console.log('🧪 Testing Backend API Keys...\n');

  // 1. Umgebungsvariablen prüfen
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const encryptionKey = process.env.ENCRYPTION_KEY;

  console.log('Environment Variables:');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   ENCRYPTION_KEY: ${encryptionKey ? '✅ Set' : '❌ Missing'}`);

  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Missing Supabase environment variables');
    return;
  }

  if (!encryptionKey) {
    console.error('\n❌ Missing ENCRYPTION_KEY - this is expected locally, will use Netlify environment');
    console.log('   → Testing will continue with Netlify deployment...');
  }

  // 2. Supabase Client erstellen
  console.log('\n2. Creating Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client created');

  try {
    // 3. User finden
    console.log('\n3. Finding user...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
      .single();

    if (userError) {
      console.log('❌ Error finding user:', userError.message);
      return;
    }

    if (!users) {
      console.log('❌ No users found in database');
      return;
    }

    console.log(`✅ Found user: ${users.email} (${users.id})`);

    // 4. API Keys aus user_secrets laden
    console.log('\n4. Loading API keys from user_secrets...');
    const { data: secrets, error: secretsError } = await supabase
      .from('user_secrets')
      .select('anthropic_api_key')
      .eq('user_id', users.id)
      .single();

    if (secretsError) {
      console.log('❌ Error loading secrets:', secretsError.message);
      console.log('   Code:', secretsError.code);
      console.log('   Details:', secretsError.details);
      return;
    }

    if (!secrets) {
      console.log('❌ No user_secrets record found');
      return;
    }

    if (!secrets.anthropic_api_key) {
      console.log('❌ No Anthropic API key found in user_secrets');
      return;
    }

    console.log('✅ Found encrypted Anthropic API key in database');
    console.log(`   Encrypted key length: ${secrets.anthropic_api_key.length} characters`);

    // 5. API Key entschlüsseln
    console.log('\n5. Decrypting API key...');
    
    if (!encryptionKey) {
      console.log('❌ Cannot decrypt locally - ENCRYPTION_KEY not available');
      console.log('   → This is expected in local development');
      console.log('   → Testing will continue on Netlify deployment');
      return;
    }

    try {
      const decryptedBytes = CryptoJS.AES.decrypt(secrets.anthropic_api_key, encryptionKey);
      const anthropicKey = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!anthropicKey) {
        console.log('❌ Failed to decrypt API key - empty result');
        return;
      }

      console.log('✅ Successfully decrypted API key');
      console.log(`   Key starts with: ${anthropicKey.substring(0, 20)}...`);
      console.log(`   Key length: ${anthropicKey.length} characters`);

      // 6. Anthropic Client testen
      console.log('\n6. Testing Anthropic client...');
      const anthropic = new Anthropic({
        apiKey: anthropicKey
      });

      console.log('✅ Anthropic client created');

      // 7. Einfacher API Test
      console.log('\n7. Testing Anthropic API call...');
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: 'Say "Backend API test successful!" in German'
          }
        ]
      });

      console.log('✅ Anthropic API test successful!');
      console.log(`   Response: ${response.content[0].text}`);
      console.log(`   Tokens used: ${response.usage?.input_tokens || 0} input, ${response.usage?.output_tokens || 0} output`);

      // 8. Summary-Generator Test
      console.log('\n8. Testing summary generation...');
      const summaryResponse = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 200,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: `Erstelle eine kurze Zusammenfassung für diese Test-E-Mails:

E-Mail 1: Wichtige Rechnung von Apple (Score: 8/10)
E-Mail 2: Newsletter von Amazon (Score: 3/10)

Fasse die wichtigsten Informationen zusammen.`
          }
        ]
      });

      console.log('✅ Summary generation test successful!');
      console.log(`   Summary: ${summaryResponse.content[0].text}`);
      console.log(`   Tokens used: ${summaryResponse.usage?.input_tokens || 0} input, ${summaryResponse.usage?.output_tokens || 0} output`);

      console.log('\n🎉 All backend API key tests PASSED!');
      console.log('   → The API keys are working correctly');
      console.log('   → Summary generation should work in the UI');

    } catch (decryptError) {
      console.log('❌ Decryption failed:', decryptError.message);
      console.log('   → This might be due to wrong ENCRYPTION_KEY');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Script ausführen
testBackendApiKeys(); 