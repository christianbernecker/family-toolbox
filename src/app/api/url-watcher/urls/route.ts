import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { createClient } from '@supabase/supabase-js';

// Conditional Supabase client for build-time
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// GET - Alle überwachten URLs für den User abrufen
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is available
    if (!supabase) {
      return NextResponse.json({ 
        urls: [],
        count: 0 
      }, { status: 200 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: urls, error } = await supabase
      .from('watched_urls')
      .select(`
        id,
        url,
        title,
        description,
        monitoring_instructions,
        monitoring_interval,
        is_active,
        is_snoozed,
        last_checked,
        last_changed,
        tags,
        notification_settings,
        check_count,
        error_count,
        created_at,
        updated_at
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ 
      urls: urls || [],
      count: urls?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Neue URL zur Überwachung hinzufügen
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is available
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable' 
      }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      url,
      title,
      description,
      monitoring_instructions,
      monitoring_interval = 60,
      notification_settings = { email: true, push: true, frequency: 'immediate' },
      tags = []
    } = body;

    // Validierung
    if (!url || !monitoring_instructions) {
      return NextResponse.json({ 
        error: 'URL und Überwachungsanweisungen sind erforderlich' 
      }, { status: 400 });
    }

    // URL Format validieren
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ 
        error: 'Ungültiges URL-Format' 
      }, { status: 400 });
    }

    // Prüfen ob User bereits 50 URLs hat
    const { count } = await supabase
      .from('watched_urls')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    if (count && count >= 50) {
      return NextResponse.json({ 
        error: 'Maximum von 50 URLs erreicht' 
      }, { status: 400 });
    }

    // Prüfen ob URL bereits existiert
    const { data: existingUrl } = await supabase
      .from('watched_urls')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('url', url)
      .single();

    if (existingUrl) {
      return NextResponse.json({ 
        error: 'Diese URL wird bereits überwacht' 
      }, { status: 400 });
    }

    // URL-Titel automatisch generieren falls nicht angegeben
    let finalTitle = title;
    if (!finalTitle) {
      try {
        const urlObj = new URL(url);
        finalTitle = urlObj.hostname;
      } catch {
        finalTitle = 'Unbenannte Website';
      }
    }

    // URL hinzufügen
    const { data: newUrl, error } = await supabase
      .from('watched_urls')
      .insert({
        user_id: session.user.id,
        url,
        title: finalTitle,
        description,
        monitoring_instructions,
        monitoring_interval,
        notification_settings,
        tags,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'URL erfolgreich hinzugefügt',
      url: newUrl
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 