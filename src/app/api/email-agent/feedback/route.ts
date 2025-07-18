// E-Mail Agent Feedback API Route
// Verwaltung von Zusammenfassungs- und Relevanz-Feedback

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LogService } from '../../../../lib/services/log-service';
import { FeedbackSubmission } from '../../../../types/email-agent';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const logger = LogService.getInstance();

// GET: Feedback abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'summary' oder 'relevance'
    const limit = parseInt(searchParams.get('limit') || '50');
    const userId = searchParams.get('userId');

    await logger.info('email-feedback-api', 'Fetching feedback', { type, limit, userId });

    let query;
    
    if (type === 'summary') {
      query = supabase
        .from('summary_feedback')
        .select(`
          *,
          daily_summaries!inner(date, summary_text, account_id)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
    } else if (type === 'relevance') {
      query = supabase
        .from('relevance_feedback')
        .select(`
          *,
          emails!inner(subject, sender_email, relevance_score)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
    } else {
      // Beide Typen abrufen
      const [summaryFeedback, relevanceFeedback] = await Promise.all([
        supabase
          .from('summary_feedback')
          .select(`
            *,
            daily_summaries!inner(date, summary_text, account_id)
          `)
          .order('created_at', { ascending: false })
          .limit(limit / 2),
        supabase
          .from('relevance_feedback')
          .select(`
            *,
            emails!inner(subject, sender_email, relevance_score)
          `)
          .order('created_at', { ascending: false })
          .limit(limit / 2)
      ]);

      if (summaryFeedback.error) throw summaryFeedback.error;
      if (relevanceFeedback.error) throw relevanceFeedback.error;

      await logger.info('email-feedback-api', 'Retrieved feedback', {
        summaryCount: summaryFeedback.data?.length || 0,
        relevanceCount: relevanceFeedback.data?.length || 0
      });

      return NextResponse.json({
        success: true,
        summary: summaryFeedback.data || [],
        relevance: relevanceFeedback.data || []
      });
    }

    // User-spezifisches Feedback filtern
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: feedback, error } = await query;

    if (error) {
      throw error;
    }

    await logger.info('email-feedback-api', `Retrieved ${feedback?.length || 0} feedback entries`, { type });

    return NextResponse.json({
      success: true,
      feedback: feedback || []
    });

  } catch (error) {
    await logger.error('email-feedback-api', 'Failed to fetch feedback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST: Neues Feedback erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, targetId, rating, feedbackText, userId }: FeedbackSubmission = body;

    // Validierung
    if (!type || !targetId || !rating || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, targetId, rating, userId' },
        { status: 400 }
      );
    }

    if (!['summary', 'relevance'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type. Valid types: summary, relevance' },
        { status: 400 }
      );
    }

    // Rating validieren
    if (type === 'summary' && (rating < 1 || rating > 6)) {
      return NextResponse.json(
        { error: 'Summary rating must be between 1 and 6' },
        { status: 400 }
      );
    }

    if (type === 'relevance' && (rating < 1 || rating > 10)) {
      return NextResponse.json(
        { error: 'Relevance rating must be between 1 and 10' },
        { status: 400 }
      );
    }

    await logger.info('email-feedback-api', 'Creating new feedback', { 
      type, 
      targetId, 
      rating, 
      userId 
    });

    let feedback;
    let error;

    if (type === 'summary') {
      // Prüfen ob Zusammenfassung existiert
      const { data: summary } = await supabase
        .from('daily_summaries')
        .select('id')
        .eq('id', targetId)
        .single();

      if (!summary) {
        return NextResponse.json(
          { error: 'Summary not found' },
          { status: 404 }
        );
      }

      const { data, error: insertError } = await supabase
        .from('summary_feedback')
        .insert({
          summary_id: targetId,
          user_id: userId,
          rating,
          feedback_text: feedbackText
        })
        .select()
        .single();

      feedback = data;
      error = insertError;

    } else {
      // Prüfen ob E-Mail existiert
      const { data: email } = await supabase
        .from('emails')
        .select('id')
        .eq('id', targetId)
        .single();

      if (!email) {
        return NextResponse.json(
          { error: 'Email not found' },
          { status: 404 }
        );
      }

      const { data, error: insertError } = await supabase
        .from('relevance_feedback')
        .insert({
          email_id: targetId,
          user_id: userId,
          manual_relevance_score: rating,
          feedback_notes: feedbackText
        })
        .select()
        .single();

      feedback = data;
      error = insertError;
    }

    if (error) {
      throw error;
    }

    await logger.info('email-feedback-api', 'Successfully created feedback', { 
      feedbackId: feedback.id,
      type,
      rating 
    });

    return NextResponse.json({
      success: true,
      feedback
    });

  } catch (error) {
    await logger.error('email-feedback-api', 'Failed to create feedback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT: Feedback aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, type, rating, feedbackText } = body;

    if (!id || !type) {
      return NextResponse.json(
        { error: 'Feedback ID and type are required' },
        { status: 400 }
      );
    }

    await logger.info('email-feedback-api', 'Updating feedback', { feedbackId: id, type });

    let updateData: any = {};
    
    if (rating !== undefined) {
      if (type === 'summary' && (rating < 1 || rating > 6)) {
        return NextResponse.json(
          { error: 'Summary rating must be between 1 and 6' },
          { status: 400 }
        );
      }
      if (type === 'relevance' && (rating < 1 || rating > 10)) {
        return NextResponse.json(
          { error: 'Relevance rating must be between 1 and 10' },
          { status: 400 }
        );
      }
      
      if (type === 'summary') {
        updateData.rating = rating;
      } else {
        updateData.manual_relevance_score = rating;
      }
    }

    if (feedbackText !== undefined) {
      if (type === 'summary') {
        updateData.feedback_text = feedbackText;
      } else {
        updateData.feedback_notes = feedbackText;
      }
    }

    const tableName = type === 'summary' ? 'summary_feedback' : 'relevance_feedback';
    
    const { data: feedback, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json(
          { error: 'Feedback not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    await logger.info('email-feedback-api', 'Successfully updated feedback', { 
      feedbackId: id,
      type 
    });

    return NextResponse.json({
      success: true,
      feedback
    });

  } catch (error) {
    await logger.error('email-feedback-api', 'Failed to update feedback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE: Feedback löschen
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json(
        { error: 'Feedback ID and type are required' },
        { status: 400 }
      );
    }

    if (!['summary', 'relevance'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type. Valid types: summary, relevance' },
        { status: 400 }
      );
    }

    await logger.info('email-feedback-api', 'Deleting feedback', { feedbackId: id, type });

    const tableName = type === 'summary' ? 'summary_feedback' : 'relevance_feedback';
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json(
          { error: 'Feedback not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    await logger.info('email-feedback-api', 'Successfully deleted feedback', { feedbackId: id, type });

    return NextResponse.json({
      success: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    await logger.error('email-feedback-api', 'Failed to delete feedback', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 