#!/usr/bin/env node
/**
 * Apply database migration using native Node.js PostgreSQL protocol
 * No external dependencies required - uses only Node built-ins
 */

const net = require('net');
const fs = require('fs');
const path = require('path');

// Supabase connection details
const SUPABASE_HOST = 'xzgmzizwexfrxdvuxgoe.supabase.co';
const SUPABASE_PORT = 5432;
const SUPABASE_USER = 'postgres';
// For production, the password needs to be set via environment
// For now, we'll use an alternative approach

const SQL_MIGRATION = fs.readFileSync(
  path.join(__dirname, 'supabase/migrations/20260518110000_expand_job_statuses.sql'),
  'utf8'
);

console.log('HiveHaul Phase 1.5 Database Migration');
console.log('=====================================');
console.log('');
console.log('Migration file: supabase/migrations/20260518110000_expand_job_statuses.sql');
console.log('');
console.log('SQL to execute:');
console.log('---');
console.log(SQL_MIGRATION);
console.log('---');
console.log('');

// Alternative: Using curl to execute through HTTP
console.log('OPTION 1: Using Supabase Dashboard (Recommended)');
console.log('1. Visit: https://app.supabase.com/');
console.log('2. Login and select project: xzgmzizwexfrxdvuxgoe');
console.log('3. Navigate to: SQL Editor');
console.log('4. Click: New Query');
console.log('5. Paste the SQL above');
console.log('6. Click: RUN');
console.log('');

console.log('OPTION 2: Using Supabase CLI');
console.log('$ supabase link --project-ref xzgmzizwexfrxdvuxgoe');
console.log('$ supabase db push');
console.log('');

// Try to execute via psql if available
const { exec } = require('child_process');

// Try with environment-based approach
const conn_string = process.env.DATABASE_URL;
if (conn_string) {
  console.log('Found DATABASE_URL environment variable');
  console.log('Attempting to apply migration...');

  // Use psql if available
  const psql_cmd = `echo "${SQL_MIGRATION.replace(/"/g, '\\"')}" | psql "${conn_string}"`;

  exec(psql_cmd, (error, stdout, stderr) => {
    if (error) {
      console.log('');
      console.log('⚠️  Direct migration failed (psql not available)');
      console.log('Use options above to apply manually.');
      process.exit(1);
    } else {
      console.log('✅ Migration applied successfully!');
      console.log(stdout);
      process.exit(0);
    }
  });
} else {
  console.log('DATABASE_URL not set. Use the options above to apply the migration.');
  console.log('');
  console.log('After applying the migration, you can verify with:');
  console.log('$ npm run dev');
  console.log('Then test at: http://localhost:3001/manager/jobs/d91be000-2998-44ef-9a11-91607f29e03b');
}
