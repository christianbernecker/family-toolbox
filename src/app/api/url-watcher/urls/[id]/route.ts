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

// PATCH - URL-Einstellungen aktualisieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await request.json();

    // Prüfen ob URL dem User gehört
    const { data: existingUrl } = await supabase
      .from('watched_urls')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (!existingUrl) {
      return NextResponse.json({ error: 'URL nicht gefunden' }, { status: 404 });
    }

    // Erlaubte Felder für Updates
    const allowedFields = [
      'title',
      'description',
      'monitoring_instructions',
      'monitoring_interval',
      'is_active',
      'is_snoozed',
      'notification_settings',
      'tags'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    // Timestamp für Updates
    updateData['updated_at'] = new Date().toISOString();

    const { data: updatedUrl, error } = await supabase
      .from('watched_urls')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'URL erfolgreich aktualisiert',
      url: updatedUrl
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - URL aus der Überwachung entfernen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Prüfen ob URL dem User gehört
    const { data: existingUrl } = await supabase
      .from('watched_urls')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single();

    if (!existingUrl) {
      return NextResponse.json({ error: 'URL nicht gefunden' }, { status: 404 });
    }

    // URL und alle zugehörigen Daten löschen (CASCADE durch DB-Schema)
    const { error } = await supabase
      .from('watched_urls')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'URL erfolgreich entfernt'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 