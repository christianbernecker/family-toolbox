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

// GET - Dashboard-Statistiken abrufen
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is available
    if (!supabase) {
      return NextResponse.json({ 
        stats: {
          total_urls: 0,
          active_urls: 0,
          changes_today: 0,
          high_priority_changes: 0,
          avg_relevance_score: 0
        }
      }, { status: 200 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parallel Queries für verschiedene Statistiken
    const [
      urlsResult,
      todayChangesResult,
      highPriorityResult,
      avgRelevanceResult
    ] = await Promise.all([
      // Gesamt-URLs und aktive URLs
      supabase
        .from('watched_urls')
        .select('id, is_active', { count: 'exact' })
        .eq('user_id', session.user.id),
      
      // Änderungen heute
      supabase
        .from('content_changes')
        .select('id', { count: 'exact' })
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .eq('watched_urls.user_id', session.user.id),
      
      // Hohe Priorität Änderungen heute
      supabase
        .from('content_changes')
        .select('id', { count: 'exact' })
        .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .eq('relevance_category', 'high')
        .eq('watched_urls.user_id', session.user.id),
      
      // Durchschnittliche Relevanz der letzten 30 Tage
      supabase
        .from('content_changes')
        .select('relevance_score')
        .gte('detected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .eq('watched_urls.user_id', session.user.id)
    ]);

    // Fehler-Handling
    if (urlsResult.error) throw urlsResult.error;
    if (todayChangesResult.error) throw todayChangesResult.error;
    if (highPriorityResult.error) throw highPriorityResult.error;
    if (avgRelevanceResult.error) throw avgRelevanceResult.error;

    // Statistiken berechnen
    const totalUrls = urlsResult.count || 0;
    const activeUrls = urlsResult.data?.filter(url => url.is_active).length || 0;
    const changesToday = todayChangesResult.count || 0;
    const highPriorityChanges = highPriorityResult.count || 0;
    
    const relevanceScores = avgRelevanceResult.data?.map(change => change.relevance_score) || [];
    const avgRelevanceScore = relevanceScores.length > 0 
      ? relevanceScores.reduce((sum, score) => sum + score, 0) / relevanceScores.length
      : 0;

    return NextResponse.json({ 
      stats: {
        total_urls: totalUrls,
        active_urls: activeUrls,
        changes_today: changesToday,
        high_priority_changes: highPriorityChanges,
        avg_relevance_score: Math.round(avgRelevanceScore * 10) / 10
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 