# Phase 2 Address Autocomplete - Testing Guide

## Pre-Deployment Checklist

### Environment Setup ✅
- [x] Google API Key added to Vercel: `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`
- [x] Key has Places API enabled
- [x] Key has Maps JavaScript API enabled
- [x] Domain restrictions include hivehaul.ca, www.hivehaul.ca
- [x] `.env.local` configured for local testing (git-ignored)
- [x] `.env.example` has placeholder (no hardcoded keys)

### Code ✅
- [x] `AddressAutocomplete.tsx` component created
- [x] Form integration complete (pickup & dropoff fields)
- [x] API route updated to handle structured fields
- [x] Manager dashboard updated for display
- [x] Database migration ready
- [x] Build compiles successfully (no errors)

### Documentation ✅
- [x] `PHASE_2_ADDRESS_AUTOCOMPLETE.md` - Complete implementation docs
- [x] This testing guide

---

## Manual Testing (Local)

### 1. Start the Dev Server
```bash
cd C:\Users\shahv\HiveHaul
npm run dev
# Server runs on http://localhost:3006 (or next available port)
```

### 2. Client Intake Form Testing

**URL:** `http://localhost:3006/client/intake`

#### Test Case 1: Pickup Address Autocomplete
1. Scroll to "Pickup Address" field
2. Start typing: `"255 Maitland"`
3. **Expected:** Dropdown appears with suggestions:
   - 255 Maitland St, Kitchener, ON
   - 255 Maitland St, London, ON
   - etc.
4. Click first suggestion
5. **Expected:** 
   - Field populates with full address
   - All structured fields filled (visible in form submission)
   - Dropdown closes

#### Test Case 2: Dropoff (Unloading Point) Autocomplete
1. Scroll to "Unloading Point" field
2. Start typing: `"100 King"`
3. **Expected:** Suggestions appear for matching addresses
4. Select one
5. **Expected:** Field and structured fields populated

#### Test Case 3: Manual Entry Fallback
1. In address field, type: `"123 Unknown St"`
2. Wait 2 seconds (no suggestions appear)
3. **Expected:** "Can't find address? Enter manually" link appears below field
4. Click link
5. **Expected:** Modal form opens with textarea
6. Enter full address: `"123 Unknown Street, Kitchener, ON N2G 1K2"`
7. Click "Use This Address"
8. **Expected:** 
   - Field populated with manual entry
   - Structured fields empty (fallback mode)
   - Modal closes

#### Test Case 4: Helper Text
1. Look at both address fields
2. **Expected:** Helper text appears: "Please select your address from suggestions when possible to reduce delivery errors."

#### Test Case 5: Mobile Responsiveness
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Switch to mobile view (375px width)
4. Test address autocomplete
5. **Expected:** Dropdown suggests positioned correctly, not cut off

### 3. Form Submission Testing

#### Test Case 6: Full Form with Autocomplete
1. Fill all required fields with autocomplete addresses
2. Complete rest of form
3. Click "Submit Service Request"
4. **Expected:**
   - Success redirect to confirmation page with job number
   - Console shows no errors
   - Job appears in manager dashboard

### 4. Manager Dashboard Testing

**URL:** `http://localhost:3006/manager/jobs`

#### Test Case 7: Address Display
1. Open manager jobs page
2. Find job created in Test Case 6
3. **Expected:**
   - Shows formatted address (from autocomplete)
   - Below it: "City, Province, PostalCode" on separate line
   - Label changed to "Unloading Point" for dropoff

#### Test Case 8: Job Detail View
1. Click job to open details
2. Scroll to address section
3. **Expected:**
   - Pickup address shows formatted address
   - Unloading point shows formatted address
   - Structured fields visible below if clicked to expand

---

## Browser Console Testing

Open DevTools (F12) → Console tab

### Test Case 9: No API Errors
1. Perform address autocomplete steps
2. Check console for errors
3. **Expected:** No red error messages related to Google API

### Test Case 10: Network Tab
1. Open DevTools → Network tab
2. Type in address field
3. **Expected:** Requests to `maps.googleapis.com` appear
4. Click a suggestion
5. **Expected:** Additional request to fetch place details

### Test Case 11: Invalid API Key Handling
1. Temporarily edit `.env.local`: Set key to `AIzaSyDEMPTY123`
2. Restart dev server: `npm run dev`
3. Try autocomplete
4. **Expected:** Error message: "Address service temporarily unavailable"
5. **Expected:** Manual entry fallback still works
6. Restore correct key

---

## API Testing

### Test Case 12: API Receives Structured Fields

Using curl or Postman:

```bash
curl -X POST http://localhost:3006/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "Test User",
    "client_email": "test@example.com",
    "client_phone": "555-1234",
    "service_type": "Moving",
    "pickup_address": "255 Maitland St, Kitchener, ON N2G 1K2",
    "pickup_formatted_address": "255 Maitland St, Kitchener, ON N2G 1K2, Canada",
    "pickup_city": "Kitchener",
    "pickup_province": "ON",
    "pickup_postal_code": "N2G 1K2",
    "dropoff_address": "100 King St W, Toronto, ON M5H 1A1",
    "dropoff_formatted_address": "100 King St W, Toronto, ON M5H 1A1, Canada",
    "dropoff_city": "Toronto",
    "dropoff_province": "ON",
    "dropoff_postal_code": "M5H 1A1",
    "pickup_date": "2026-05-25",
    "pickup_time": "10:00",
    "item_description": "Office furniture",
    "pickup_building_type": "Commercial",
    "dropoff_building_type": "Commercial",
    "pickup_access": "Front entrance",
    "dropoff_access": "Loading dock",
    "assistance_pickup": "Yes",
    "assistance_dropoff": "Yes",
    "terms_accepted": true,
    "confirm_item_details_accurate": true,
    "understand_pricing_may_change": true,
    "confirm_no_prohibited_items": true,
    "understand_hivehaul_approval_required": true,
    "understand_deposit_may_be_required": true,
    "agree_to_terms_and_service": true,
    "confirm_cargo_declared_accurately": true,
    "understand_cargo_responsibility": true,
    "confirm_cargo_details_truthful": true
  }'
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "job_number": "JOB-XXXXX",
  "client_name": "Test User",
  "pickup_city": "Kitchener",
  "dropoff_city": "Toronto",
  ...
}
```

### Test Case 13: Database Storage
1. Run API test above
2. Check Supabase dashboard
3. Navigate to `jobs` table
4. **Expected:** New row with all structured address fields populated
5. **Expected:** Fields like `pickup_city`, `dropoff_province` contain correct values

---

## Phase 1 Backward Compatibility Testing

### Test Case 14: Old Jobs Still Display
1. In Supabase, find a job created before Phase 2
2. Open in manager dashboard
3. **Expected:** 
   - Shows `pickup_address` text (fallback)
   - No structured fields (because they're NULL)
   - Dashboard doesn't crash
   - Display gracefully degraded

---

## Performance Testing

### Test Case 15: Autocomplete Latency
1. Open address field
2. Type slowly: `"255 Maitland"` (5-10 seconds)
3. **Expected:** Suggestions appear after ~500-800ms of user stopping typing
4. **Expected:** No hanging or lag

### Test Case 16: Suggestion Dropdown Performance
1. Type to get suggestions
2. Move mouse over suggestions
3. Click suggestion
4. **Expected:** Smooth interaction, no jank

---

## Error Handling Testing

### Test Case 17: API Rate Limit
1. Rapidly type/delete in address field (10+ times/second) for 30 seconds
2. **Expected:** 
   - Component manages requests (debouncing)
   - No error crashes
   - Suggestions still work after

### Test Case 18: Network Offline
1. Open DevTools → Network → Throttle to "Offline"
2. Try address autocomplete
3. **Expected:** Error message: "Failed to fetch suggestions"
4. **Expected:** Manual entry still available
5. Re-enable network

### Test Case 19: Invalid Address
1. Type: `"zzzzzzzzzzzzzzzzzzzzz no address here"`
2. Wait 2 seconds
3. **Expected:** No suggestions appear
4. **Expected:** Manual entry link appears
5. Manual entry works

---

## Cross-Browser Testing (if available)

- [ ] Chrome (primary)
- [ ] Firefox
- [ ] Safari
- [ ] Edge

Each should pass:
- Autocomplete suggestions work
- Selection populates fields
- Manual entry works
- Mobile responsive

---

## Deployment Testing

### Pre-Production (Staging)
1. Deploy to Vercel preview via PR
2. Run all test cases above on preview URL
3. Verify API key from Vercel environment variables works
4. Check no errors in Vercel logs

### Production
1. Deploy to https://hivehaul.ca
2. Smoke test key scenarios:
   - Autocomplete suggestions work
   - Form submission succeeds
   - Manager can view jobs
3. Monitor Vercel logs for errors
4. Check Supabase for new job records with structured fields

---

## Sign-Off Checklist

- [ ] All test cases pass
- [ ] No console errors
- [ ] Database migration applied
- [ ] Vercel environment variables set
- [ ] Build successful
- [ ] No API keys in git commits
- [ ] Documentation complete
- [ ] Ready for production

---

## Troubleshooting

### "Address service temporarily unavailable"
- Check API key is correct in `.env.local`
- Check API key in Vercel dashboard
- Verify Places API is enabled on the key
- Check Google Cloud API quota

### Suggestions don't appear
- Open DevTools → Network tab
- Type in address field
- Look for requests to `maps.googleapis.com`
- If requests fail, check API key
- If requests succeed but no data, check API response

### Manual entry link doesn't appear
- Ensure component rendered (check in React DevTools)
- Check that no suggestions were returned
- Try different search term

### Form won't submit
- Check all required fields are filled
- Open DevTools → Console for error messages
- Check network tab for API errors
- Verify all 9 waiver checkboxes are checked

---

## Contacts

For Google API issues:
- Console: https://console.cloud.google.com/
- Places API docs: https://developers.google.com/maps/documentation/places

For Vercel issues:
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs

For HiveHaul issues:
- Supabase: https://app.supabase.com/
- GitHub: Check commit logs
