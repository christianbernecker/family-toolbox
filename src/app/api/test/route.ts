import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('TEST ROUTE: Simple test route called successfully');
  
  return NextResponse.json({ 
    status: 'success', 
    message: 'Test route works',
    timestamp: new Date().toISOString(),
    env_check: {
      supabase_url_exists: !!process.env.SUPABASE_URL,
      next_public_supabase_url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_key_exists: !!process.env.SUPABASE_ANON_KEY,
      next_public_supabase_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      encryption_key_exists: !!process.env.ENCRYPTION_KEY
    }
  });
} 