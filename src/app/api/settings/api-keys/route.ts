import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/services/database';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get decrypted API keys (but don't return the actual values for security)
    const apiKeys = await db.getDecryptedApiKeys(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        hasOpenAiKey: !!apiKeys.openai_api_key,
        hasClaudeKey: !!apiKeys.claude_api_key,
        // Don't return actual keys for security
      }
    });

  } catch (error) {
    console.error('Error fetching API keys status:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch API keys status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate request body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { openai_api_key, claude_api_key } = body;

    // Basic validation for API keys format
    if (openai_api_key && !openai_api_key.startsWith('sk-')) {
      return NextResponse.json(
        { error: 'Invalid OpenAI API key format' },
        { status: 400 }
      );
    }

    if (claude_api_key && !claude_api_key.startsWith('sk-ant-')) {
      return NextResponse.json(
        { error: 'Invalid Claude API key format' },
        { status: 400 }
      );
    }

    // Update API keys
    const updatedSettings = await db.updateApiKeys(session.user.id, {
      openai_api_key,
      claude_api_key
    });

    return NextResponse.json({
      success: true,
      message: 'API keys updated successfully',
      data: {
        hasOpenAiKey: !!openai_api_key,
        hasClaudeKey: !!claude_api_key,
      }
    });

  } catch (error) {
    console.error('Error updating API keys:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to update API keys',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 