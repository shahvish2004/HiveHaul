#!/usr/bin/env node
/**
 * Apply SQL migration to HiveHaul database
 * Uses Supabase JavaScript SDK to execute migration
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xzgmzizwexfrxdvuxgoe.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Z216aXp3ZXhmcnhkdnV4Z29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4MzE4MiwiImV4cCI6MjA5Mzk1OTE4Mn0.41AYSlcKErjRP-Btt4kvyKz5k3Hymoj-Tmh0kmbjoFg';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Read migration SQL
const migrationSql = `
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE jobs ADD CONSTRAINT jobs_status_check
CHECK (
  status IN (
    'New',
    'Under Review',
    'Approved',
    'Deposit Requested',
    'Deposit Received',
    'Scheduled',
    'In Progress',
    'Completed',
    'Cancelled',
    'Declined'
  )
);
`;

async function applyMigration() {
  try {
    console.log('Applying migration...');
    console.log('');

    // Since Supabase client doesn't support raw SQL execution through the anon key,
    // we need to use a workaround. Let's try creating a test update to verify connection first.

    // Test 1: Try to fetch a job to verify connection
    const { data: testData, error: testError } = await supabase
      .from('jobs')
      .select('status')
      .limit(1);

    if (testError) {
      console.error('❌ Connection failed:', testError);
      console.log('');
      console.log('The Supabase JavaScript client cannot execute raw SQL.');
      console.log('');
      console.log('To apply the migration, use one of these methods:');
      console.log('');
      console.log('METHOD 1: Supabase Dashboard (Easiest)');
      console.log('=========================================');
      console.log('1. Go to: https://app.supabase.com/');
      console.log('2. Select your project: xzgmzizwexfrxdvuxgoe');
      console.log('3. Click: SQL Editor (left sidebar)');
      console.log('4. Click: New Query');
      console.log('5. Paste this SQL:');
      console.log('');
      console.log(migrationSql);
      console.log('');
      console.log('6. Click: RUN');
      console.log('');
      console.log('METHOD 2: Supabase CLI');
      console.log('=====================');
      console.log('$ supabase link --project-ref xzgmzizwexfrxdvuxgoe');
      console.log('$ supabase db push');
      console.log('');
      process.exit(1);
    }

    console.log('✅ Connection successful');
    console.log('Current statuses in database:', testData?.map(d => d.status) || 'none');
    console.log('');
    console.log('⚠️  Supabase JavaScript client does not support raw SQL execution.');
    console.log('Manual migration required via Dashboard or CLI.');
    process.exit(1);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
