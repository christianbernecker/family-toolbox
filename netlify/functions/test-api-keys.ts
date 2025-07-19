import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import CryptoJS from 'crypto-js';

export const handler: Handler = async (event, context) => {
  console.log('🧪 Testing API Keys on Netlify...');

  try {
    // 1. Umgebungsvariablen prüfen
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const encryptionKey = process.env.ENCRYPTION_KEY;

    console.log('Environment Variables:');
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`   ENCRYPTION_KEY: ${encryptionKey ? '✅ Set' : '❌ Missing'}`);

    if (!supabaseUrl || !supabaseKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Missing Supabase environment variables'
        })
      };
    }

    if (!encryptionKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Missing ENCRYPTION_KEY'
        })
      };
    }

    // 2. Supabase Client erstellen
    console.log('2. Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created');

    // 3. User finden
    console.log('3. Finding user...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
      .single();

    if (userError) {
      console.log('❌ Error finding user:', userError.message);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: `Error finding user: ${userError.message}`
        })
      };
    }

    if (!users) {
      console.log('❌ No users found in database');
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'No users found in database'
        })
      };
    }

    console.log(`✅ Found user: ${users.email} (${users.id})`);

    // 4. API Keys aus user_secrets laden
    console.log('4. Loading API keys from user_secrets...');
    const { data: secrets, error: secretsError } = await supabase
      .from('user_secrets')
      .select('anthropic_api_key')
      .eq('user_id', users.id)
      .single();

    if (secretsError) {
      console.log('❌ Error loading secrets:', secretsError.message);
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: `Error loading secrets: ${secretsError.message}`
        })
      };
    }

    if (!secrets) {
      console.log('❌ No user_secrets record found');
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'No user_secrets record found'
        })
      };
    }

    if (!secrets.anthropic_api_key) {
      console.log('❌ No Anthropic API key found in user_secrets');
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'No Anthropic API key found in user_secrets'
        })
      };
    }

    console.log('✅ Found encrypted Anthropic API key in database');
    console.log(`   Encrypted key length: ${secrets.anthropic_api_key.length} characters`);

    // 5. API Key entschlüsseln
    console.log('5. Decrypting API key...');
    
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(secrets.anthropic_api_key, encryptionKey);
      const anthropicKey = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!anthropicKey) {
        console.log('❌ Failed to decrypt API key - empty result');
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            error: 'Failed to decrypt API key - empty result'
          })
        };
      }

      console.log('✅ Successfully decrypted API key');
      console.log(`   Key starts with: ${anthropicKey.substring(0, 20)}...`);
      console.log(`   Key length: ${anthropicKey.length} characters`);

      // 6. Anthropic Client testen
      console.log('6. Testing Anthropic client...');
      const anthropic = new Anthropic({
        apiKey: anthropicKey
      });

      console.log('✅ Anthropic client created');

      // 7. Einfacher API Test
      console.log('7. Testing Anthropic API call...');
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
      console.log(`   Response: ${response.content[0].type === 'text' ? response.content[0].text : 'Non-text response'}`);
      console.log(`   Tokens used: ${response.usage?.input_tokens || 0} input, ${response.usage?.output_tokens || 0} output`);

      // 8. Summary-Generator Test
      console.log('8. Testing summary generation...');
      const summaryResponse = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
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
      console.log(`   Summary: ${summaryResponse.content[0].type === 'text' ? summaryResponse.content[0].text : 'Non-text response'}`);
      console.log(`   Tokens used: ${summaryResponse.usage?.input_tokens || 0} input, ${summaryResponse.usage?.output_tokens || 0} output`);

      console.log('🎉 All backend API key tests PASSED!');

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'All backend API key tests passed!',
          data: {
            user: {
              id: users.id,
              email: users.email
            },
            apiKey: {
              encrypted: true,
              length: secrets.anthropic_api_key.length,
              decrypted: true
            },
            tests: {
              anthropicClient: true,
              simpleApiCall: true,
              summaryGeneration: true
            },
            responses: {
              simple: response.content[0].type === 'text' ? response.content[0].text : 'Non-text response',
              summary: summaryResponse.content[0].type === 'text' ? summaryResponse.content[0].text : 'Non-text response',
              tokens: {
                simple: {
                  input: response.usage?.input_tokens || 0,
                  output: response.usage?.output_tokens || 0
                },
                summary: {
                  input: summaryResponse.usage?.input_tokens || 0,
                  output: summaryResponse.usage?.output_tokens || 0
                }
              }
            }
          }
        })
      };

    } catch (decryptError) {
      console.log('❌ Decryption failed:', decryptError instanceof Error ? decryptError.message : 'Unknown decrypt error');
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: `Decryption failed: ${decryptError instanceof Error ? decryptError.message : 'Unknown decrypt error'}`
        })
      };
    }

  } catch (error) {
    console.error('❌ Test failed:', error instanceof Error ? error.message : 'Unknown error');
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}; 