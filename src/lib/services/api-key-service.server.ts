import { createClient } from '@supabase/supabase-js';
import { EncryptionService } from './encryption';
import { ApiKeys } from '@/lib/types';
import { PostgrestError } from '@supabase/supabase-js';

// --- SERVER-SIDE METHODS ---

function getSupabaseInstance() {
  // Verwende NEXT_PUBLIC_ Variablen für Konsistenz
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  
  console.log('🗄️ Server: Using SUPABASE_URL:', supabaseUrl?.substring(0, 30) + '...');
  console.log('🗄️ Server: Using SUPABASE_ANON_KEY:', supabaseAnonKey?.substring(0, 20) + '...');
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getServerMaskedKeys(userId: string): Promise<{ openai: string; anthropic: string }> {
  console.log('🗄️ getServerMaskedKeys called for user:', userId);
  
  try {
    const supabase = getSupabaseInstance();
    console.log('🗄️ Supabase instance created successfully');
    
    const { data, error } = await supabase
      .from('user_secrets')
      .select('openai_api_key, anthropic_api_key')
      .eq('user_id', userId)
      .single();

    console.log('🗄️ Supabase query result:', { data, error });

    if (error && error.code !== 'PGRST116') {
      console.error('🗄️ Database error (not "no rows"):', error);
      // Return empty values instead of error message for better UX
      return { openai: '', anthropic: '' };
    }

    if (error && error.code === 'PGRST116') {
      console.log('🗄️ No user secrets found (PGRST116), returning empty values');
      return { openai: '', anthropic: '' };
    }

    const result = {
      openai: data?.openai_api_key ? 'OPENAI_API_KEY_SET' : '',
      anthropic: data?.anthropic_api_key ? 'ANTHROPIC_API_KEY_SET' : '',
    };

    console.log('🗄️ Returning masked keys result:', result);
    return result;
  } catch (error) {
    console.error('🗄️ Unexpected error in getServerMaskedKeys:', error);
    console.error('🗄️ Error stack:', error instanceof Error ? error.stack : 'No stack');
    return { openai: '', anthropic: '' };
  }
}

export async function saveServerApiKeys(userId: string, keys: ApiKeys): Promise<{ error: PostgrestError | null }> {
  const supabase = getSupabaseInstance();

  const encryptedKeys: { [key: string]: string | undefined } = {};
  if (keys.openai_api_key) {
    encryptedKeys.openai_api_key = EncryptionService.encrypt(keys.openai_api_key);
  }
  if (keys.anthropic_api_key) {
    encryptedKeys.anthropic_api_key = EncryptionService.encrypt(keys.anthropic_api_key);
  }

  if (Object.keys(encryptedKeys).length === 0) {
    return { error: null };
  }

  const { error } = await supabase
    .from('user_secrets')
    .upsert({ user_id: userId, ...encryptedKeys }, { onConflict: 'user_id' });

  return { error };
} 