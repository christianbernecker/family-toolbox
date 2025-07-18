#!/usr/bin/env node

// Test-Skript für E-Mail-Abruf-Funktionalität
// Debuggt warum keine E-Mails abgerufen werden

const { createClient } = require('@supabase/supabase-js');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const fs = require('fs');
const path = require('path');

// Umgebungsvariablen laden
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

// Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testEmailFetch() {
  console.log('🔍 Testing E-Mail Fetch Functionality...\n');

  try {
    // 1. E-Mail-Accounts aus Datenbank abrufen
    console.log('1. Fetching email accounts from database...');
    const { data: accounts, error } = await supabase
      .from('email_accounts')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('❌ Database error:', error);
      return;
    }

    if (!accounts || accounts.length === 0) {
      console.log('⚠️  No active email accounts found');
      return;
    }

    console.log(`✅ Found ${accounts.length} active account(s):`);
    accounts.forEach(account => {
      console.log(`   - ${account.email} (${account.provider})`);
    });

    // 2. Ersten Account testen
    const account = accounts[0];
    console.log(`\n2. Testing account: ${account.email}`);

    // 3. Passwort entschlüsseln
    const password = Buffer.from(account.password_encrypted, 'base64').toString('utf-8');
    console.log(`   Password decrypted: ${password.substring(0, 4)}...`);

    // 4. IMAP-Konfiguration erstellen
    const imapConfig = {
      host: account.imap_host,
      port: account.imap_port,
      user: account.username,
      password: password,
      tls: true,
      tlsOptions: {
        rejectUnauthorized: false
      }
    };

    console.log(`   IMAP Config: ${imapConfig.host}:${imapConfig.port}`);
    console.log(`   Username: ${imapConfig.user}`);

    // 5. IMAP-Verbindung testen
    console.log('\n3. Testing IMAP connection...');
    
    const imap = new Imap(imapConfig);
    
    imap.once('ready', () => {
      console.log('✅ IMAP connection ready');
      
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          console.error('❌ Failed to open INBOX:', err);
          imap.end();
          return;
        }

        console.log(`✅ INBOX opened. Total messages: ${box.messages.total}`);
        
        // Nur E-Mails der letzten 24 Stunden abrufen
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        const searchCriteria = [['SINCE', yesterday]];
        console.log(`   Searching for emails since: ${yesterday.toISOString()}`);

        imap.search(searchCriteria, (err, results) => {
          if (err) {
            console.error('❌ Search failed:', err);
            imap.end();
            return;
          }

          console.log(`✅ Found ${results.length} emails in last 24 hours`);

          if (results.length === 0) {
            console.log('⚠️  No emails found in the last 24 hours');
            imap.end();
            return;
          }

          // Erste 3 E-Mails abrufen
          const emailsToFetch = results.slice(0, 3);
          console.log(`   Fetching first ${emailsToFetch.length} emails...`);

          const fetch = imap.fetch(emailsToFetch, { bodies: '', struct: true });
          let emailCount = 0;

          fetch.on('message', (msg, seqno) => {
            console.log(`   Processing message ${seqno}...`);
            let buffer = '';
            let attributes;

            msg.on('body', (stream, info) => {
              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });
            });

            msg.once('attributes', (attrs) => {
              attributes = attrs;
            });

            msg.once('end', async () => {
              try {
                const parsed = await simpleParser(buffer);
                emailCount++;
                
                console.log(`   ✅ Email ${emailCount}:`);
                console.log(`      Subject: ${parsed.subject}`);
                console.log(`      From: ${parsed.from?.value[0]?.address}`);
                console.log(`      Date: ${parsed.date}`);
                console.log(`      Message ID: ${parsed.messageId}`);
                
                if (emailCount >= emailsToFetch.length) {
                  console.log('\n✅ Email fetch test completed successfully!');
                  imap.end();
                }
              } catch (parseError) {
                console.error(`   ❌ Failed to parse email ${seqno}:`, parseError);
              }
            });
          });

          fetch.once('error', (err) => {
            console.error('❌ Fetch error:', err);
            imap.end();
          });

          fetch.once('end', () => {
            console.log('✅ Fetch completed');
          });
        });
      });
    });

    imap.once('error', (err) => {
      console.error('❌ IMAP connection error:', err);
    });

    imap.once('end', () => {
      console.log('🔚 IMAP connection ended');
    });

    imap.connect();

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test ausführen
testEmailFetch().catch(console.error); 