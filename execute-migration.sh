#!/bin/bash
# Execute Supabase migration using curl
# This script attempts to apply the database constraint update

SUPABASE_URL="https://xzgmzizwexfrxdvuxgoe.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6Z216aXp3ZXhmcnhkdnV4Z29lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODM4MzE4MiwiZXhwIjoyMDkzOTU5MTgyfQ.41AYSlcKErjRP-Btt4kvyKz5k3Hymoj-Tmh0kmbjoFg"

echo "HiveHaul Database Migration"
echo "============================"
echo ""
echo "This script requires manual execution of SQL in Supabase Dashboard."
echo ""
echo "Steps to apply migration:"
echo ""
echo "1. Open your browser and go to:"
echo "   https://app.supabase.com/"
echo ""
echo "2. Sign in and select project: xzgmzizwexfrxdvuxgoe"
echo ""
echo "3. Navigate to: SQL Editor (in left sidebar)"
echo ""
echo "4. Click: New Query"
echo ""
echo "5. Copy and paste this SQL:"
echo ""
cat << 'MIGRATION_SQL'
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
MIGRATION_SQL

echo ""
echo ""
echo "6. Click the RUN button (or press Ctrl+Enter)"
echo ""
echo "7. Wait for the confirmation message"
echo ""
echo "After applying the migration:"
echo "- The workflow will be fully functional"
echo "- You can test at: http://localhost:3001/manager"
echo "- And: http://localhost:3001/request/status"
