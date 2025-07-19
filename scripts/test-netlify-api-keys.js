#!/usr/bin/env node

/**
 * Netlify API Keys Test Script
 * Ruft die Netlify Function auf, um die API Keys zu testen
 */

async function testNetlifyApiKeys() {
  console.log('🧪 Testing API Keys via Netlify Function...\n');

  const functionUrl = 'https://family-toolbox.netlify.app/.netlify/functions/test-api-keys';
  
  console.log(`📡 Calling Netlify Function: ${functionUrl}`);

  try {
    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Function call failed:');
      console.log('   Error text:', errorText);
      return;
    }

    const data = await response.json();
    
    console.log('\n📋 Function Response:');
    console.log('   Success:', data.success);
    console.log('   Message:', data.message);

    if (data.success && data.data) {
      console.log('\n✅ API Keys Test Results:');
      console.log('   User:', data.data.user.email);
      console.log('   API Key encrypted:', data.data.apiKey.encrypted);
      console.log('   API Key length:', data.data.apiKey.length);
      console.log('   API Key decrypted:', data.data.apiKey.decrypted);
      
      console.log('\n🧪 Test Results:');
      console.log('   Anthropic Client:', data.data.tests.anthropicClient ? '✅' : '❌');
      console.log('   Simple API Call:', data.data.tests.simpleApiCall ? '✅' : '❌');
      console.log('   Summary Generation:', data.data.tests.summaryGeneration ? '✅' : '❌');
      
      console.log('\n💬 API Responses:');
      console.log('   Simple:', data.data.responses.simple);
      console.log('   Summary:', data.data.responses.summary);
      
      console.log('\n📊 Token Usage:');
      console.log('   Simple - Input:', data.data.responses.tokens.simple.input, 'Output:', data.data.responses.tokens.simple.output);
      console.log('   Summary - Input:', data.data.responses.tokens.summary.input, 'Output:', data.data.responses.tokens.summary.output);

      if (data.data.tests.anthropicClient && data.data.tests.simpleApiCall && data.data.tests.summaryGeneration) {
        console.log('\n🎉 All API key tests PASSED!');
        console.log('   → The API keys are working correctly on Netlify');
        console.log('   → Summary generation should work in the UI');
      } else {
        console.log('\n⚠️ Some tests failed');
      }
    } else {
      console.log('\n❌ Function returned error:');
      console.log('   Error:', data.error);
    }

  } catch (error) {
    console.error('❌ Function call failed:', error.message);
  }
}

// Script ausführen
testNetlifyApiKeys(); 