import { ApiKeys } from '@/lib/types';

export class ApiKeyService {
  // Client-side method
  static async getMaskedApiKeys(): Promise<{ openai: string; anthropic: string }> {
    try {
      const response = await fetch('/api/settings/api-keys', {
        // Ensure no caching to force server request every time
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API request failed:', response.status, response.statusText, errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Properly extract the data from the API response structure
      if (data.success && data.data) {
        return {
          openai: data.data.openai === 'SET' ? 'OPENAI_API_KEY_SET' : '',
          anthropic: data.data.anthropic === 'SET' ? 'ANTHROPIC_API_KEY_SET' : ''
        };
      } else {
        console.error('Unexpected API response structure:', data);
        return { openai: '', anthropic: '' };
      }
    } catch (error) {
      console.error('Failed to fetch masked keys:', error);
      throw error;
    }
  }

  // Client-side method
  static async saveApiKeys(keys: ApiKeys): Promise<Response> {
    return await fetch('/api/settings/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(keys),
    });
  }
} 