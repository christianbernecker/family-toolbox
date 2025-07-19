#!/usr/bin/env node

/**
 * Summary Generator Test Script
 * Testet den Summary-Generator direkt
 */

import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Umgebungsvariablen laden
config({ path: join(__dirname, '..', '.env.local') });

async function testSummaryGenerator() {
  console.log('🧪 Testing Summary Generator...\n');

  try {
    // Summary Generator importieren
    const { SummaryGeneratorService } = await import('../src/lib/email-agent/summary-generator.ts');
    
    console.log('✅ SummaryGeneratorService imported');
    
    // Service-Instanz erstellen
    const summaryGenerator = SummaryGeneratorService.getInstance();
    console.log('✅ SummaryGeneratorService instance created');
    
    // Test der Offline-Verarbeitung
    console.log('\n🔄 Testing offline processing...');
    await summaryGenerator.processNewEmails();
    
    console.log('✅ Offline processing completed');
    
  } catch (error) {
    console.error('\n❌ Summary Generator Test Error:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
  }
}

// Script ausführen
testSummaryGenerator(); 