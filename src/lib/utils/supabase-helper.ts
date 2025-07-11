import { supabase } from '../supabase/client';

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }
  return supabase;
}

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
} 