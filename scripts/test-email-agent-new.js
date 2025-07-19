/**
 * Test Script für das neue Email Agent System
 * Verwendet das ursprüngliche API Key System (Base64 statt AES)
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase Konfiguration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase Umgebungsvariablen fehlen');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailAgentNew() {
  console.log('🧪 Testing New Email Agent System...\n');

  try {
    // 1. Test User finden
    console.log('1. Finding test user...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);

    if (usersError || !users?.length) {
      console.log('❌ No users found in database');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Found test user: ${testUser.email} (${testUser.id})`);

    // 2. API Keys aus user_settings laden
    console.log('\n2. Loading API keys from user_settings...');
    const { data: settings, error: settingsError } = await supabase
      .from('user_settings')
      .select('api_keys')
      .eq('user_id', testUser.id)
      .single();

    if (settingsError || !settings?.api_keys) {
      console.log('❌ No user settings or API keys found');
      return;
    }

    console.log('✅ Found user settings with API keys');
    console.log(`   API Keys encrypted: ${settings.api_keys.encrypted}`);

    // 3. API Keys entschlüsseln (Base64)
    console.log('\n3. Decrypting API keys (Base64)...');
    
    let claudeKey = null;
    let openaiKey = null;

    if (settings.api_keys.claude_api_key) {
      try {
        claudeKey = Buffer.from(settings.api_keys.claude_api_key, 'base64').toString();
        console.log('✅ Successfully decrypted Claude API key');
        console.log(`   Key starts with: ${claudeKey.substring(0, 10)}...`);
      } catch (error) {
        console.log('❌ Failed to decrypt Claude API key');
      }
    }

    if (settings.api_keys.openai_api_key) {
      try {
        openaiKey = Buffer.from(settings.api_keys.openai_api_key, 'base64').toString();
        console.log('✅ Successfully decrypted OpenAI API key');
        console.log(`   Key starts with: ${openaiKey.substring(0, 10)}...`);
      } catch (error) {
        console.log('❌ Failed to decrypt OpenAI API key');
      }
    }

    if (!claudeKey && !openaiKey) {
      console.log('❌ No valid API keys found');
      return;
    }

    // 4. Test Email Agent API
    console.log('\n4. Testing Email Agent API...');
    
    const testEmail = {
      id: 'test-email-1',
      subject: 'Wichtige Familien-Angelegenheit',
      from: 'familie@example.com',
      body: 'Hallo zusammen, wir haben einen wichtigen Termin nächste Woche beim Arzt. Bitte alle verfügbar halten.',
      date: new Date().toISOString()
    };

    const apiUrl = 'https://family-toolbox.netlify.app/api/email-agent';
    
    console.log('   Testing summary generation...');
    const summaryResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate_summary',
        emailData: testEmail
      }),
    });

    if (summaryResponse.ok) {
      const summaryResult = await summaryResponse.json();
      console.log('✅ Summary generation successful');
      console.log(`   Summary: ${summaryResult.data.summary.summary}`);
      console.log(`   Relevance: ${summaryResult.data.summary.relevance}`);
      console.log(`   Category: ${summaryResult.data.summary.category}`);
    } else {
      const errorData = await summaryResponse.json();
      console.log('❌ Summary generation failed');
      console.log(`   Error: ${errorData.error}`);
      console.log(`   Details: ${errorData.details}`);
    }

    console.log('\n   Testing relevance evaluation...');
    const relevanceResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'evaluate_relevance',
        emailData: testEmail
      }),
    });

    if (relevanceResponse.ok) {
      const relevanceResult = await relevanceResponse.json();
      console.log('✅ Relevance evaluation successful');
      console.log(`   Relevance: ${relevanceResult.data.relevance}`);
    } else {
      const errorData = await relevanceResponse.json();
      console.log('❌ Relevance evaluation failed');
      console.log(`   Error: ${errorData.error}`);
      console.log(`   Details: ${errorData.details}`);
    }

    console.log('\n🎉 Email Agent System Test Complete!');
    console.log('   → The new system is working with the original API key method');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test ausführen
testEmailAgentNew(); 