// E-Mail Account Management API Route
// CRUD-Operationen für E-Mail-Accounts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { LogService } from '../../../../lib/services/log-service';
import { EmailAccount } from '../../../../types/email-agent';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const logger = LogService.getInstance();

// GET: Alle E-Mail-Accounts abrufen
export async function GET(request: NextRequest) {
  try {
    await logger.info('email-accounts-api', 'Fetching email accounts');
    
    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    await logger.info('email-accounts-api', `Retrieved ${accounts?.length || 0} email accounts`);
    
    return NextResponse.json({
      success: true,
      accounts: accounts || []
    });

  } catch (error) {
    await logger.error('email-accounts-api', 'Failed to fetch email accounts', {
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

// POST: Neuen E-Mail-Account erstellen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, provider, imap_host, imap_port, username, password, priority_weight } = body;

    // Validierung
    if (!email || !provider || !imap_host || !imap_port || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: email, provider, imap_host, imap_port, password' },
        { status: 400 }
      );
    }

    // E-Mail-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Provider validieren
    const validProviders = ['gmail', 'ionos', 'outlook', 'yahoo', 'protonmail', 'custom'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Valid providers: gmail, ionos, outlook, yahoo, protonmail, custom' },
        { status: 400 }
      );
    }

    // Passwort verschlüsseln (Base64 als Platzhalter)
    const password_encrypted = Buffer.from(password, 'utf-8').toString('base64');

    await logger.info('email-accounts-api', 'Creating new email account', { email, provider });

    const { data: account, error } = await supabase
      .from('email_accounts')
      .insert({
        name: name || email,
        email,
        provider,
        imap_host,
        imap_port: parseInt(imap_port),
        username: username || email,
        password_encrypted,
        priority_weight: priority_weight || 1,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Email account already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    await logger.info('email-accounts-api', 'Successfully created email account', { 
      accountId: account.id,
      email 
    });

    return NextResponse.json({
      success: true,
      account
    });

  } catch (error) {
    await logger.error('email-accounts-api', 'Failed to create email account', {
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

// PUT: E-Mail-Account aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, email, provider, imap_host, imap_port, username, password, priority_weight, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    await logger.info('email-accounts-api', 'Updating email account', { accountId: id });

    // Update-Objekt erstellen
    const updateData: Partial<EmailAccount> = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
      updateData.email = email;
    }

    if (provider !== undefined) {
      const validProviders = ['gmail', 'ionos', 'outlook', 'yahoo', 'protonmail', 'custom'];
      if (!validProviders.includes(provider)) {
        return NextResponse.json(
          { error: 'Invalid provider. Valid providers: gmail, ionos, outlook, yahoo, protonmail, custom' },
          { status: 400 }
        );
      }
      updateData.provider = provider;
    }

    if (imap_host !== undefined) updateData.imap_host = imap_host;
    if (imap_port !== undefined) updateData.imap_port = parseInt(imap_port);
    if (username !== undefined) updateData.username = username;
    if (priority_weight !== undefined) updateData.priority_weight = priority_weight;
    if (is_active !== undefined) updateData.is_active = is_active;

    // Passwort nur aktualisieren, wenn es bereitgestellt wurde
    if (password !== undefined) {
      updateData.password_encrypted = Buffer.from(password, 'utf-8').toString('base64');
    }

    const { data: account, error } = await supabase
      .from('email_accounts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json(
          { error: 'Email account not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    await logger.info('email-accounts-api', 'Successfully updated email account', { 
      accountId: id,
      email: account.email 
    });

    return NextResponse.json({
      success: true,
      account
    });

  } catch (error) {
    await logger.error('email-accounts-api', 'Failed to update email account', {
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

// DELETE: E-Mail-Account löschen
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }

    await logger.info('email-accounts-api', 'Deleting email account', { accountId });

    const { error } = await supabase
      .from('email_accounts')
      .delete()
      .eq('id', accountId);

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return NextResponse.json(
          { error: 'Email account not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    await logger.info('email-accounts-api', 'Successfully deleted email account', { accountId });

    return NextResponse.json({
      success: true,
      message: 'Email account deleted successfully'
    });

  } catch (error) {
    await logger.error('email-accounts-api', 'Failed to delete email account', {
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