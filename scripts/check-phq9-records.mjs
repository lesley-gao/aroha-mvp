/**
 * Debug script to check PHQ-9 records in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkRecords() {
  console.log('🔍 Checking PHQ-9 records...\n');

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ Not authenticated. Please login first.');
      console.log('Expected user: lesleygao.it@gmail.com');
      return;
    }

    console.log('✅ Authenticated as:', user.email);
    console.log('User ID:', user.id);
    console.log('');

    // Fetch PHQ-9 records
    const { data: records, error } = await supabase
      .from('phq9_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching records:', error);
      return;
    }

    console.log(`📊 Found ${records?.length || 0} PHQ-9 records\n`);

    if (records && records.length > 0) {
      records.forEach((record, index) => {
        console.log(`Record ${index + 1}:`);
        console.log('  Date:', new Date(record.created_at).toLocaleString());
        console.log('  Score:', record.total);
        console.log('  Severity:', record.severity);
        console.log('  Answers:', record.answers);
        console.log('');
      });
    } else {
      console.log('ℹ️  No PHQ-9 records found.');
      console.log('');
      console.log('To create records:');
      console.log('1. Login to your app');
      console.log('2. Navigate to the PHQ-9 Assessment page');
      console.log('3. Complete an assessment');
      console.log('4. Make sure Cloud Sync is enabled in Settings');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkRecords();
