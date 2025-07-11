import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { toolManager } from '@/lib/tools/manager';
import { isToolId } from '@/lib/tools/registry';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { toolId } = await params;

    // Validate toolId
    if (!isToolId(toolId)) {
      return NextResponse.json(
        { error: 'Invalid tool ID' },
        { status: 400 }
      );
    }

    // Toggle tool status
    const updatedStatus = await toolManager.toggleTool(session.user.id, toolId);

    return NextResponse.json({
      success: true,
      data: {
        toolId: toolId,
        isActive: updatedStatus.isActive,
        settings: updatedStatus.settings,
        lastUsed: updatedStatus.lastUsed
      }
    });

  } catch (error) {
    console.error('Error toggling tool:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to toggle tool',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ toolId: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { toolId } = await params;

    // Validate toolId
    if (!isToolId(toolId)) {
      return NextResponse.json(
        { error: 'Invalid tool ID' },
        { status: 400 }
      );
    }

    // Get tool status
    const toolStatus = await toolManager.getToolStatus(session.user.id, toolId);

    if (!toolStatus) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        toolId: toolId,
        isActive: toolStatus.isActive,
        settings: toolStatus.settings,
        lastUsed: toolStatus.lastUsed,
        hasErrors: toolStatus.hasErrors,
        errorMessage: toolStatus.errorMessage
      }
    });

  } catch (error) {
    console.error('Error getting tool status:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get tool status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 