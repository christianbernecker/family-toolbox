import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import CryptoJS from 'crypto-js';

export const handler: Handler = async (event, context) => {
  console.log('🧪 Testing API Keys (Simple) on Netlify...');

  try {
    // 1. Umgebungsvariablen prüfen
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const encryptionKey = process.env.ENCRYPTION_KEY;

    if (!supabaseUrl || !supabaseKey || !encryptionKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Missing environment variables'
        })
      };
    }

    // 2. Supabase Client erstellen
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. User finden
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
      .single();

    if (userError || !users) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: `Error finding user: ${userError?.message || 'No users found'}`
        })
      };
    }

    // 4. API Keys aus user_secrets laden
    const { data: secrets, error: secretsError } = await supabase
      .from('user_secrets')
      .select('anthropic_api_key')
      .eq('user_id', users.id)
      .single();

    if (secretsError || !secrets?.anthropic_api_key) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: `Error loading secrets: ${secretsError?.message || 'No API key found'}`
        })
      };
    }

    // 5. API Key entschlüsseln
    try {
      const decryptedBytes = CryptoJS.AES.decrypt(secrets.anthropic_api_key, encryptionKey);
      const anthropicKey = decryptedBytes.toString(CryptoJS.enc.Utf8);

      if (!anthropicKey) {
        return {
          statusCode: 500,
          body: JSON.stringify({
            success: false,
            error: 'Failed to decrypt API key - empty result'
          })
        };
      }

      // 6. Anthropic Client testen
      const anthropic = new Anthropic({
        apiKey: anthropicKey
      });

      // 7. Einfacher API Test
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

      const responseText = response.content[0].type === 'text' ? response.content[0].text : 'Non-text response';

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'API key test successful!',
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
            test: {
              anthropicClient: true,
              simpleApiCall: true
            },
            response: responseText,
            tokens: {
              input: response.usage?.input_tokens || 0,
              output: response.usage?.output_tokens || 0
            }
          }
        })
      };

    } catch (decryptError) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: `Decryption failed: ${decryptError instanceof Error ? decryptError.message : 'Unknown decrypt error'}`
        })
      };
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}; 