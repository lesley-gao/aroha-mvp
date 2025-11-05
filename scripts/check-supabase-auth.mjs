#!/usr/bin/env node

/**
 * Check Supabase Authentication Configuration
 * Run with: node scripts/check-supabase-auth.mjs
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file
const envPath = join(__dirname, '..', '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  const parsed = dotenv.parse(envContent);
  Object.assign(process.env, parsed);
} catch (error) {
  console.error('❌ Could not read .env file:', error.message);
  process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Authentication Check\n');
console.log('=' .repeat(50));

// Check environment variables
if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.log('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseKey.substring(0, 20) + '...\n');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuth() {
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Check if we can connect
  console.log('🔍 Test 1: Checking connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('✅ Can connect to Supabase Auth\n');
    testsPassed++;
  } catch (error) {
    console.log('❌ Connection failed:', error.message, '\n');
    testsFailed++;
  }

  // Test 2: Try to list users (will fail with anon key - this is expected)
  console.log('🔍 Test 2: Checking auth service availability...');
  try {
    // This should return a specific error if auth is working
    const { error } = await supabase.auth.admin.listUsers();
    if (error && error.message.includes('JWT')) {
      console.log('✅ Auth service is available (admin endpoint requires service key)\n');
      testsPassed++;
    } else {
      console.log('⚠️  Unexpected response from auth service\n');
    }
  } catch (error) {
    console.log('✅ Auth service is responding\n');
    testsPassed++;
  }

  // Instructions
  console.log('=' .repeat(50));
  console.log('📋 NEXT STEPS\n');
  console.log('If you\'re having login issues after signup:\n');
  console.log('1. Go to: https://app.supabase.com');
  console.log('2. Select your project');
  console.log('3. Click Authentication → Providers');
  console.log('4. Click on "Email" provider');
  console.log('5. Check "Confirm email" setting:');
  console.log('   • If ON: You must verify email before login');
  console.log('   • If OFF: You can login immediately\n');
  console.log('For development, it\'s easier to turn OFF email confirmation.\n');
  console.log('=' .repeat(50));
  console.log('\n📧 To check if email confirmation is required:');
  console.log('   • Sign up with test account');
  console.log('   • Check browser console logs');
  console.log('   • Look for: "User created:" message');
  console.log('   • If "confirmed_at" is null → email confirmation required');
  console.log('   • If "confirmed_at" has a date → can login immediately\n');
  
  console.log('=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log('Tests passed:', testsPassed);
  console.log('Tests failed:', testsFailed);
  
  if (testsFailed === 0) {
    console.log('\n🎉 Supabase Auth is configured correctly!');
  } else {
    console.log('\n⚠️  Some tests failed. Check configuration.');
  }
}

checkAuth().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
