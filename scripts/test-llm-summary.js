#!/usr/bin/env node

/**
 * LLM Summary Test Script
 * Testet die Zusammenfassungs-Generierung direkt mit der Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Umgebungsvariablen laden
config({ path: join(__dirname, '..', '.env.local') });

async function testLLMSummary() {
  console.log('🧪 Testing LLM Summary Generation...\n');

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  
  if (!anthropicKey) {
    console.error('❌ ANTHROPIC_API_KEY not found in environment');
    return;
  }

  console.log('✅ ANTHROPIC_API_KEY found');
  
  const anthropic = new Anthropic({
    apiKey: anthropicKey
  });

  // Test-E-Mails generieren
  const testEmails = [
    {
      id: 'test-1',
      subject: 'Wichtige Rechnung von Apple',
      sender_email: 'noreply@apple.com',
      sender_name: 'Apple',
      body_text: 'Sehr geehrte Damen und Herren, hiermit erhalten Sie Ihre monatliche Rechnung für Apple One. Betrag: 19,99€. Zahlungsziel: 30 Tage. Vielen Dank für Ihr Vertrauen.',
      received_at: new Date().toISOString(),
      relevance_score: 8,
      category: 'financial'
    },
    {
      id: 'test-2',
      subject: 'Neue Immobilienangebote in München',
      sender_email: 'info@immobilienscout24.de',
      sender_name: 'ImmobilienScout24',
      body_text: 'Entdecken Sie neue Immobilienangebote in München! Wir haben 15 neue Wohnungen und Häuser für Sie gefunden. Preise ab 450.000€. Klicken Sie hier für Details.',
      received_at: new Date().toISOString(),
      relevance_score: 7,
      category: 'real_estate'
    }
  ];

  console.log('📧 Test E-Mails:');
  testEmails.forEach((email, index) => {
    console.log(`   ${index + 1}. ${email.subject} (${email.sender_name}) - Score: ${email.relevance_score}/10`);
  });

  // Prompt für Zusammenfassung erstellen
  const summaryPrompt = `
Erstelle eine prägnante deutsche Zusammenfassung für das Postfach.

**E-Mails für Zusammenfassung:**
${testEmails.map(email => `
**E-Mail ${email.id}:**
- Absender: ${email.sender_name} (${email.sender_email})
- Betreff: ${email.subject}
- Relevanz: ${email.relevance_score}/10
- Kategorie: ${email.category}
- Inhalt: ${email.body_text}
`).join('\n')}

**Anforderungen:**
- Fasse die wichtigsten Informationen zusammen
- Verwende deutsche Sprache
- Sei prägnant aber informativ
- Strukturiere die Zusammenfassung klar
- Hebe besonders relevante E-Mails hervor (Score >= 7)

**Zusammenfassung:**
`;

  console.log('\n🤖 Sending prompt to Claude...');
  console.log('Prompt length:', summaryPrompt.length, 'characters');

  try {
    const startTime = Date.now();
    
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: summaryPrompt
        }
      ]
    });

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    console.log('✅ Claude API Response received!');
    console.log(`⏱️  Processing time: ${processingTime}ms`);
    console.log(`📊 Tokens used: ${response.usage?.input_tokens || 0} input, ${response.usage?.output_tokens || 0} output`);
    
    const summaryText = response.content[0].text;
    
    console.log('\n📋 Generated Summary:');
    console.log('='.repeat(50));
    console.log(summaryText);
    console.log('='.repeat(50));
    
    console.log(`\n📏 Summary length: ${summaryText.length} characters`);
    
    // Test der Zusammenfassungs-Qualität
    console.log('\n🔍 Summary Quality Check:');
    const hasContent = summaryText.trim().length > 0;
    const hasGermanText = /[äöüßÄÖÜ]/.test(summaryText);
    const mentionsEmails = testEmails.some(email => 
      summaryText.toLowerCase().includes(email.subject.toLowerCase()) ||
      summaryText.toLowerCase().includes(email.sender_name.toLowerCase())
    );
    
    console.log(`   - Has content: ${hasContent ? '✅' : '❌'}`);
    console.log(`   - German text: ${hasGermanText ? '✅' : '❌'}`);
    console.log(`   - Mentions emails: ${mentionsEmails ? '✅' : '❌'}`);
    
    if (hasContent && hasGermanText && mentionsEmails) {
      console.log('\n🎉 Summary generation test PASSED!');
    } else {
      console.log('\n⚠️  Summary generation test has issues');
    }

  } catch (error) {
    console.error('\n❌ Claude API Error:');
    console.error('   Error:', error.message);
    console.error('   Type:', error.constructor.name);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   StatusText:', error.response.statusText);
    }
    
    if (error.code) {
      console.error('   Code:', error.code);
    }
  }
}

// Script ausführen
testLLMSummary(); 