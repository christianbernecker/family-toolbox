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

// GET - Erkannte Änderungen abrufen
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is available
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Service temporarily unavailable',
        changes: [],
        count: 0 
      }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category'); // high, medium, low, irrelevant

    let query = supabase
      .from('content_changes')
      .select(`
        id,
        change_summary,
        relevance_score,
        relevance_category,
        confidence_score,
        detected_at,
        notification_sent,
        is_user_relevant,
        watched_urls!inner(
          id,
          title,
          url,
          user_id
        )
      `)
      .eq('watched_urls.user_id', session.user.id)
      .order('detected_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter nach Kategorie falls angegeben
    if (category && ['high', 'medium', 'low', 'irrelevant'].includes(category)) {
      query = query.eq('relevance_category', category);
    }

    const { data: changes, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Transformiere Daten für Frontend
    const transformedChanges = changes?.map(change => ({
      id: change.id,
      url_title: change.watched_urls.title,
      url: change.watched_urls.url,
      change_summary: change.change_summary,
      relevance_score: change.relevance_score,
      relevance_category: change.relevance_category,
      confidence_score: change.confidence_score,
      detected_at: change.detected_at,
      notification_sent: change.notification_sent,
      is_user_relevant: change.is_user_relevant
    })) || [];

    return NextResponse.json({ 
      changes: transformedChanges,
      count: transformedChanges.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 