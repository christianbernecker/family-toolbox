import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';

interface Body {
  email: string;
  openai?: string;
  anthropic?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Body;
    const { email, openai = '', anthropic = '' } = body;

    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Missing supabase credentials' }, { status: 500 });
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false }
    });

    // Hole user ID
    const { data: users, error: userErr } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userErr) {
      return NextResponse.json({ error: userErr.message }, { status: 500 });
    }

    let userId: string;
    if (!users) {
      // Dummy User anlegen (nur für Debug-Zwecke)
      userId = crypto.randomUUID();
      const { error: insertUserErr } = await admin.from('users').insert({ id: userId, email });
      if (insertUserErr) {
        return NextResponse.json({ error: insertUserErr.message }, { status: 500 });
      }
    } else {
      userId = users.id;
    }

    // Upsert in user_secrets
    const { error: upsertErr } = await admin.from('user_secrets').upsert({
      user_id: userId,
      openai_api_key: openai,
      anthropic_api_key: anthropic
    });

    if (upsertErr) {
      return NextResponse.json({ error: upsertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
} 