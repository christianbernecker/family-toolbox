#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * Testet die Verbindung zu Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

// Umgebungsvariablen laden
config({ path: join(__dirname, '..', '.env.local') });

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Environment Variables:');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseKey ? '✅ Set' : '❌ Missing'}`);

  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ Missing Supabase environment variables');
    return;
  }

  console.log(`\nSupabase URL: ${supabaseUrl}`);
  console.log(`Service Role Key: ${supabaseKey.substring(0, 20)}...`);

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Einfache Verbindung
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase
      .from('emails')
      .select('count')
      .limit(1);

    if (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      console.log(`   Code: ${error.code}`);
      console.log(`   Details: ${error.details}`);
      console.log(`   Hint: ${error.hint}`);
    } else {
      console.log('✅ Basic connection successful');
    }

    // Test 2: Health Check
    console.log('\n2. Testing health check...');
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      });
      
      if (response.ok) {
        console.log('✅ Health check successful');
      } else {
        console.log(`❌ Health check failed: ${response.status} ${response.statusText}`);
      }
    } catch (healthError) {
      console.log(`❌ Health check error: ${healthError.message}`);
    }

    // Test 3: Network connectivity
    console.log('\n3. Testing network connectivity...');
    try {
      const url = new URL(supabaseUrl);
      const hostname = url.hostname;
      
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);
      
      try {
        const { stdout } = await execAsync(`ping -c 1 ${hostname}`);
        console.log('✅ Network connectivity successful');
      } catch (pingError) {
        console.log(`❌ Network connectivity failed: ${pingError.message}`);
      }
    } catch (urlError) {
      console.log(`❌ URL parsing failed: ${urlError.message}`);
    }

  } catch (error) {
    console.error('\n❌ Supabase client creation failed:', error.message);
  }
}

// Script ausführen
testSupabaseConnection(); 