#!/usr/bin/env node

/**
 * Direct API Keys Test Script
 * Testet die API Keys direkt aus der Datenbank
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Umgebungsvariablen laden
config({ path: join(__dirname, '..', '.env.local') });

async function testApiKeysDirect() {
  console.log('🧪 Testing API Keys Directly...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const encryptionKey = process.env.ENCRYPTION_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  if (!encryptionKey) {
    console.error('❌ Missing ENCRYPTION_KEY environment variable');
    return;
  }

  console.log('✅ Environment variables found');
  
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. User finden
    console.log('\n1. Finding user...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
      .single();

    if (userError || !users) {
      console.log('❌ No users found:', userError?.message);
      return;
    }

    console.log(`✅ Found user: ${users.email} (${users.id})`);

    // 2. API Keys laden
    console.log('\n2. Loading API keys...');
    const { data: secrets, error: secretsError } = await supabase
      .from('user_secrets')
      .select('anthropic_api_key')
      .eq('user_id', users.id)
      .single();

    if (secretsError) {
      console.log('❌ Error loading secrets:', secretsError.message);
      return;
    }

    if (!secrets?.anthropic_api_key) {
      console.log('❌ No Anthropic API key found in database');
      return;
    }

    console.log('✅ Found encrypted Anthropic API key');

    // 3. API Key entschlüsseln
    console.log('\n3. Decrypting API key...');
    const { default: CryptoJS } = await import('crypto-js');
    
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(secrets.anthropic_api_key, encryptionKey);
      const anthropicKey = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!anthropicKey) {
        console.log('❌ Failed to decrypt API key');
        return;
      }

      console.log('✅ Successfully decrypted API key');
      console.log(`   Key starts with: ${anthropicKey.substring(0, 20)}...`);

      // 4. Anthropic Client testen
      console.log('\n4. Testing Anthropic client...');
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      
      const anthropic = new Anthropic({
        apiKey: anthropicKey
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 50,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: 'Say "Hello, API test successful!" in German'
          }
        ]
      });

      console.log('✅ Anthropic API test successful!');
      console.log(`   Response: ${response.content[0].text}`);
      console.log(`   Tokens used: ${response.usage?.input_tokens || 0} input, ${response.usage?.output_tokens || 0} output`);

    } catch (decryptError) {
      console.log('❌ Decryption failed:', decryptError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Script ausführen
testApiKeysDirect(); 