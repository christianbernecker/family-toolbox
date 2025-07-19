// Email Agent Feedback API Route
// Sammlung von Benutzer-Feedback für Machine Learning

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LogService } from '../../../../lib/services/log-service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const logger = LogService.getInstance();

// POST: Feedback hinzufügen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email_id, feedback_type, relevance_score, category_feedback, summary_quality, notes } = body;

    // Validierung
    if (!email_id || !feedback_type) {
      return NextResponse.json(
        { error: 'Missing required fields: email_id, feedback_type' },
        { status: 400 }
      );
    }

    // Feedback-Typ validieren
    const validFeedbackTypes = ['relevance', 'category', 'summary', 'general'];
    if (!validFeedbackTypes.includes(feedback_type)) {
      return NextResponse.json(
        { error: 'Invalid feedback_type. Valid types: relevance, category, summary, general' },
        { status: 400 }
      );
    }

    await logger.info('feedback-api', 'Creating feedback', { email_id, feedback_type });

    const { data: feedback, error } = await supabase
      .from('user_feedback')
      .insert({
        email_id,
        feedback_type,
        relevance_score,
        category_feedback,
        summary_quality,
        notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    await logger.info('feedback-api', 'Successfully created feedback', { 
      feedbackId: feedback.id,
      email_id 
    });

    return NextResponse.json({
      success: true,
      feedback
    });

  } catch (error) {
    await logger.error('feedback-api', 'Failed to create feedback', {
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

// GET: Feedback abrufen
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const email_id = searchParams.get('email_id');
    const feedback_type = searchParams.get('feedback_type');
    
    await logger.info('feedback-api', 'Fetching feedback', { limit, email_id, feedback_type });
    
    let query = supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (email_id) {
      query = query.eq('email_id', email_id);
    }
    
    if (feedback_type) {
      query = query.eq('feedback_type', feedback_type);
    }
    
    const { data: feedback, error } = await query;

    if (error) {
      throw error;
    }

    await logger.info('feedback-api', `Retrieved ${feedback?.length || 0} feedback entries`);
    
    return NextResponse.json({
      success: true,
      feedback: feedback || []
    });

  } catch (error) {
    await logger.error('feedback-api', 'Failed to fetch feedback', {
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