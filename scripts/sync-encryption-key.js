#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');

async function fetchEncryptionKey() {
  return new Promise((resolve, reject) => {
    const url = 'https://family-toolbox.netlify.app/api/debug/get-encryption-key';
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.success) {
            resolve(response.encryptionKey);
          } else {
            reject(new Error(response.error));
          }
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function setNetlifyEncryptionKey(encryptionKey) {
  try {
    const command = `netlify env:set ENCRYPTION_KEY "${encryptionKey}" --force`;
    console.log('Setting ENCRYPTION_KEY in Netlify...');
    execSync(command, { stdio: 'inherit' });
    console.log('✅ ENCRYPTION_KEY successfully set in Netlify');
  } catch (error) {
    console.error('❌ Failed to set ENCRYPTION_KEY in Netlify:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🔄 Syncing ENCRYPTION_KEY from Supabase to Netlify...');
    
    // ENCRYPTION_KEY aus Supabase abrufen
    console.log('📡 Fetching ENCRYPTION_KEY from Supabase...');
    const encryptionKey = await fetchEncryptionKey();
    console.log('✅ ENCRYPTION_KEY retrieved from Supabase');
    
    // ENCRYPTION_KEY in Netlify setzen
    await setNetlifyEncryptionKey(encryptionKey);
    
    console.log('🎉 ENCRYPTION_KEY sync completed successfully!');
    
  } catch (error) {
    console.error('❌ ENCRYPTION_KEY sync failed:', error.message);
    process.exit(1);
  }
}

main(); 