#!/usr/bin/env node
// Apply migration using Supabase API
const https = require('https');
const url = require('url');

const SUPABASE_URL = 'https://xzgmzizwexfrxdvuxgoe.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Z216aXp3ZXhmcnhkdnV4Z29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4MzE4MiwiZXhwIjoyMDkzOTU5MTgyfQ.41AYSlcKErjRP-Btt4kvyKz5k3Hymoj-Tmh0kmbjoFg';

// SQL commands to execute
const sqlCommands = `
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

async function executeSql(sql) {
  // Note: Supabase JavaScript client doesn't expose raw SQL execution
  // This is a placeholder that shows what needs to be done

  console.log('To apply the migration, you need to:');
  console.log('');
  console.log('1. Visit: https://app.supabase.com/');
  console.log('2. Select your project (xzgmzizwexfrxdvuxgoe)');
  console.log('3. Go to SQL Editor');
  console.log('4. Create a new query');
  console.log('5. Run this SQL:');
  console.log('');
  console.log(sql);
  console.log('');
  console.log('Or use Supabase CLI:');
  console.log('  supabase link');
  console.log('  supabase db push');
  process.exit(0);
}

executeSql(sqlCommands);
