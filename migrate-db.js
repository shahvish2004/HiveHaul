#!/usr/bin/env node
/**
 * HiveHaul Phase 1.5 Database Migration
 * Applies job status constraint update without external dependencies
 */

const net = require('net');
const fs = require('fs');
const path = require('path');

// Extract Supabase credentials from environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xzgmzizwexfrxdvuxgoe.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('HiveHaul Phase 1.5 Database Migration');
console.log('=====================================\n');

// Read migration SQL
const migrationPath = path.join(__dirname, 'supabase/migrations/20260518110000_expand_job_statuses.sql');
const migrationSql = fs.readFileSync(migrationPath, 'utf8');

console.log('✅ Migration file verified');
console.log(`   Location: supabase/migrations/20260518110000_expand_job_statuses.sql`);
console.log(`   Size: ${migrationSql.length} bytes\n`);

// Since we cannot use pg package or psql, use Supabase Dashboard
console.log('⚠️  Supabase JavaScript client does not support raw SQL execution.\n');

console.log('To apply the migration, use the Supabase Dashboard:\n');

console.log('STEP-BY-STEP INSTRUCTIONS:');
console.log('========================\n');

console.log('1. Open browser: https://app.supabase.com/');
console.log('2. Click "Projects" and select: xzgmzizwexfrxdvuxgoe');
console.log('3. In left sidebar, click: "SQL Editor"');
console.log('4. Click: "+ New Query"');
console.log('5. Copy all text below and paste into the query editor:');
console.log('\n---BEGIN SQL---');
console.log(migrationSql);
console.log('---END SQL---\n');
console.log('6. Click the blue "RUN" button');
console.log('7. You should see: "Success. No rows returned"');
console.log('8. Dashboard will show migration is applied\n');

console.log('VERIFICATION:');
console.log('=============');
console.log('After applying, test the workflow:');
console.log('1. Start dev server: npm run dev');
console.log('2. Go to: http://localhost:3001/manager');
console.log('3. Click on a job to open details');
console.log('4. Click "Review" button - should transition to "Under Review"\n');

// Alternative method using environment variable
if (process.env.DATABASE_URL) {
  console.log('ALTERNATIVE: Environment Variable Method');
  console.log('=========================================');
  console.log('DATABASE_URL is configured. Attempting direct execution...\n');

  const { exec } = require('child_process');

  // Try to execute via psql if available
  const sqlFile = migrationPath;
  const cmd = `psql "${ process.env.DATABASE_URL}" < "${ sqlFile}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      if (error.code === 127) {
        console.log('⚠️  psql not available on this system');
        console.log('    Use the Supabase Dashboard method instead\n');
      } else {
        console.log(`Error executing migration: ${error.message}`);
      }
      process.exit(1);
    } else {
      console.log('✅ Migration applied successfully!\n');
      console.log('Output:');
      console.log(stdout);
      process.exit(0);
    }
  });
} else {
  console.log('💡 TIP: Set DATABASE_URL environment variable for automatic migration');
  console.log('   Example: DATABASE_URL=postgresql://user:pass@host:5432/db npm run migrate\n');
  process.exit(0);
}
