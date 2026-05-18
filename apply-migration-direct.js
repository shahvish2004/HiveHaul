#!/usr/bin/env node
/**
 * Apply migration directly using Supabase REST API
 * Attempts to execute SQL through available endpoints
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xzgmzizwexfrxdvuxgoe.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Z216aXp3ZXhmcnhkdnV4Z29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4MzE4MiwiZXhwIjoyMDkzOTU5MTgyfQ.41AYSlcKErjRP-Btt4kvyKz5k3Hymoj-Tmh0kmbjoFg';

// Read migration SQL
const migrationSql = fs.readFileSync(
  path.join(__dirname, 'supabase/migrations/20260518110000_expand_job_statuses.sql'),
  'utf8'
);

console.log('Attempting to apply migration to Supabase...\n');

// Try approach 1: POST to rest/v1/rpc endpoint
function tryRpcApproach() {
  return new Promise((resolve) => {
    console.log('Approach 1: Testing Supabase RPC endpoint...');

    const payload = {
      sql: migrationSql
    };

    const options = {
      hostname: 'xzgmzizwexfrxdvuxgoe.supabase.co',
      port: 443,
      path: '/rest/v1/rpc/execute_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ RPC Approach succeeded!\n');
          resolve({ success: true, method: 'RPC' });
        } else if (res.statusCode === 404) {
          console.log('⚠️  RPC endpoint not found (404)\n');
          resolve({ success: false, status: res.statusCode });
        } else {
          console.log(`Response Status: ${res.statusCode}`);
          console.log(`Response: ${data}\n`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`Error: ${err.message}\n`);
      resolve({ success: false });
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

// Try approach 2: Test database connection
async function tryDatabaseConnection() {
  console.log('Approach 2: Testing direct database endpoint...');

  return new Promise((resolve) => {
    const options = {
      hostname: 'xzgmzizwexfrxdvuxgoe.supabase.co',
      port: 443,
      path: '/rest/v1/jobs?select=id,status&limit=1',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            console.log('✅ Database connection confirmed\n');
            console.log(`Current jobs in database: ${parsed.length}`);
            if (parsed.length > 0) {
              console.log(`Sample status: ${parsed[0].status}\n`);
            }
            resolve({ success: true, canQuery: true });
          } else {
            console.log(`Unexpected response: ${data}\n`);
            resolve({ success: false });
          }
        } catch (e) {
          console.log(`Error parsing response: ${e.message}\n`);
          resolve({ success: false });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`Error: ${err.message}\n`);
      resolve({ success: false });
    });

    req.end();
  });
}

async function main() {
  console.log('Migration SQL to apply:');
  console.log('---');
  console.log(migrationSql);
  console.log('---\n');

  const rpcResult = await tryRpcApproach();

  if (!rpcResult.success) {
    await tryDatabaseConnection();
  }

  console.log('\n=== RESULT ===\n');
  console.log('Status: Cannot apply migration programmatically');
  console.log('Reason: Supabase JavaScript/REST API does not expose raw SQL execution');
  console.log('');
  console.log('Required Action: Apply migration manually via Supabase Dashboard');
  console.log('');
  console.log('Steps:');
  console.log('1. Go to: https://app.supabase.com/');
  console.log('2. Log in and select project: xzgmzizwexfrxdvuxgoe');
  console.log('3. Navigate to: SQL Editor (left sidebar)');
  console.log('4. Click: New Query');
  console.log('5. Copy and paste the SQL above');
  console.log('6. Click: RUN');
  console.log('7. Confirm: "Success. No rows returned"');
  console.log('');
  console.log('After applying, run: npm run dev');
  console.log('Then test the workflow at: http://localhost:3001/manager');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
