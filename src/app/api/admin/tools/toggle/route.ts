import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { ToolManagementService } from '@/lib/services/tool-management';

const AUTHORIZED_EMAILS = [
  'chr.bernecker@gmail.com',
  'amandabernecker@gmail.com'
];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Check admin permissions
    if (!AUTHORIZED_EMAILS.includes(session.user.email.toLowerCase())) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { toolId, isActive } = body;

    if (!toolId || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Ungültige Parameter' },
        { status: 400 }
      );
    }

    // Update tool status
    const toolManager = new ToolManagementService();
    const success = await toolManager.setToolStatus(toolId, isActive, session.user.id || '');

    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Aktualisieren des Tool-Status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Tool ${isActive ? 'aktiviert' : 'deaktiviert'}`,
      toolId,
      isActive
    });

  } catch (error) {
    console.error('Error in tool toggle API:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
} 