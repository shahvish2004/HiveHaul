#!/usr/bin/env node
// This script updates the database constraint to support new job statuses

async function updateConstraint() {
  try {
    const supabaseUrl = 'https://xzgmzizwexfrxdvuxgoe.supabase.co';
    const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Z216aXp3ZXhmcnhkdnV4Z29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4MzE4MiwiZXhwIjoyMDkzOTU5MTgyfQ.41AYSlcKErjRP-Btt4kvyKz5k3Hymoj-Tmh0kmbjoFg';

    // Extract host and database from Supabase URL
    // Format: https://[ref].supabase.co
    const ref = 'xzgmzizwexfrxdvuxgoe';
    const host = `${ref}.supabase.co`;
    const port = 5432;
    const user = 'postgres';
    // Note: For real deployment, extract password from service role JWT or use a separate password

    // Since we can't easily get the password, let's use a workaround
    // Create a fetch call to Supabase's edge functions or REST API

    const sqlCommands = [
      `ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;`,
      `ALTER TABLE jobs
       ADD CONSTRAINT jobs_status_check
       CHECK (status IN (
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
       ));`
    ];

    console.log('To update the database constraint, run these commands in the Supabase SQL editor:');
    console.log('');
    sqlCommands.forEach(cmd => {
      console.log(cmd);
      console.log('');
    });

    console.log('\nAlternatively, visit: https://app.supabase.com/');
    console.log('Navigate to SQL Editor and run the above commands.');

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

updateConstraint();
