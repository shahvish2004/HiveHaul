# HiveHaul Phase 2: Address Autocomplete Implementation

## Overview
Phase 2 introduces Google Places Autocomplete to replace free-text address fields with intelligent address suggestions, reducing typos and city confusion. All addresses are stored with structured components for future integrations (maps, navigation, analytics).

## What Changed

### 1. Database Schema (Migration: `20260518000000_add_structured_addresses.sql`)

Added 20 new columns to the `jobs` table for structured address data:

**Pickup Address Fields:**
- `pickup_formatted_address` - Full formatted address from Google
- `pickup_street_number` - Street number (e.g., "255")
- `pickup_street_name` - Street name (e.g., "Maitland St")
- `pickup_city` - City (e.g., "Kitchener")
- `pickup_province` - Province/state (e.g., "ON")
- `pickup_postal_code` - Postal code (e.g., "N2G 1K2")
- `pickup_country` - Country (e.g., "Canada")
- `pickup_latitude` - Geocoded latitude
- `pickup_longitude` - Geocoded longitude
- `pickup_place_id` - Google Places unique ID (for deduplication)

**Dropoff Address Fields:** Same structure with `dropoff_` prefix

**Indexes Added:**
- `idx_pickup_place_id` - Fast lookups by place_id
- `idx_dropoff_place_id` - Fast lookups by place_id
- `idx_pickup_geo` - Geographic queries for future maps integration
- `idx_dropoff_geo` - Geographic queries for future maps integration

### 2. Frontend: AddressAutocomplete Component

**Location:** `components/AddressAutocomplete.tsx`

A new React component that:
- Fetches suggestions from Google Places API as user types
- Displays formatted suggestions with main and secondary text
- Retrieves detailed place information when user selects a suggestion
- Parses address components into structured fields
- Provides manual entry fallback ("Can't find address? Enter manually")
- Mobile-responsive with dropdown suggestions
- Shows helper text: "Please select your address from suggestions when possible to reduce delivery errors."

**Key Features:**
- Debounced API calls for efficiency
- Abort previous requests on rapid input changes
- Suggestion dropdown with proper positioning
- Manual override form for edge cases
- Error states with fallback messaging

### 3. Client Intake Form Updates

**File:** `app/client/intake/page.tsx`

Changes:
- Imported `AddressAutocomplete` component
- Extended `FormData` interface with 30 new structured address fields
- Updated initial form state to include all address fields
- Added `handlePickupAddressSelect` handler to populate structured fields
- Added `handleDropoffAddressSelect` handler to populate structured fields
- Replaced plain `<input>` fields with `<AddressAutocomplete>` components
- Components call handlers on address selection to populate all fields

**UX Changes:**
- Pickup/Dropoff now show autocomplete suggestions as user types
- Address selection populates all structured fields automatically
- Manual entry option available via "Can't find address? Enter manually" link
- Helper text guides users to select from suggestions

### 4. API Route Updates

**File:** `app/api/jobs/route.ts`

Changes:
- Destructured all 24 new structured address fields from request body
- Updated `createJob` call to pass structured address fields
- All fields are optional (backward compatible with old submissions)
- Structured fields stored directly in jobs table for easy access

### 5. Manager Dashboard Updates

**Files:**
- `app/manager/jobs/page.tsx` - Job listing page
- `app/manager/jobs/[jobId]/page.tsx` - Job detail page
- `lib/types.ts` - Job interface

Changes:
- Extended `Job` interface with all 30 new address fields
- Updated address display to show `formatted_address` (if available)
- Falls back to `dropoff_address` for Phase 1 data
- Shows parsed city/province/postal_code below formatted address
- Label changed from "Dropoff" to "Unloading Point" for consistency

Display Priority:
1. `pickup_formatted_address` (if structured data exists)
2. `pickup_address` (fallback for Phase 1 data)
3. Below: City, Province, Postal Code (if available)

### 6. Environment Configuration

**Files Updated:**
- `.env.example` - Added `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` placeholder
- `.env.local` - Added empty key field (user must add their own key)

## Setup Instructions

### 1. Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Places API"
4. Create an API key (Credentials > Create Credentials > API Key)
5. Restrict key to:
   - **Application restrictions:** HTTP referrers
   - **API restrictions:** Places API

### 2. Add API Key to Environment

```bash
# In .env.local
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=AIzaSyD... (your key)
```

### 3. Apply Database Migration

```bash
npm run apply-migration -- supabase/migrations/20260518000000_add_structured_addresses.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

## Data Storage

### Phase 1 Jobs (Backward Compatible)
- `pickup_address` and `dropoff_address` still work
- No structured fields populated
- Manager dashboard falls back to plain text display

### Phase 2+ Jobs
- All fields populated via Google Places API
- `formatted_address` contains full address from Google
- Component fields enable parsing and validation
- Place ID allows deduplication across submissions
- Coordinates enable future maps/routing integration

## Future Enhancements

This foundation enables:

1. **Maps Integration**
   - Use `latitude`/`longitude` to show pickup/dropoff on map
   - Visual confirmation of address before submission

2. **Route Planning**
   - Use coordinates for route optimization
   - Distance/time estimates between pickup and dropoff

3. **Address Validation**
   - Detect common address typos
   - Flag unusual address combinations

4. **Analytics**
   - Service area heatmaps
   - Regional demand analysis
   - Delivery time prediction models

5. **Deduplication**
   - Use `place_id` to group jobs for same location
   - Batch scheduling for nearby stops

## Error Handling

**If API Key Missing:**
- Component passes empty string to AddressAutocomplete
- Manual entry form always available
- Addresses can be entered manually (no structured data)
- System continues to function

**If API Unavailable:**
- Error message displayed: "Address service temporarily unavailable"
- Manual entry option visible
- User can enter address manually
- Job submission still succeeds

**If Address Not Found:**
- User sees "Can't find address? Enter manually" link
- Clicking opens manual entry form
- Address stored without structured components
- No geocoding data but job completes normally

## Testing Checklist

### Component Testing
- [ ] Autocomplete shows suggestions while typing
- [ ] Selecting suggestion populates all fields
- [ ] Manual entry form works
- [ ] Required field validation works
- [ ] Mobile layout responsive

### Form Testing
- [ ] Pickup address autocomplete works
- [ ] Dropoff address autocomplete works
- [ ] Both handlers populate FormData correctly
- [ ] Form submission includes all fields

### API Testing
- [ ] POST /api/jobs receives structured fields
- [ ] Fields stored in database
- [ ] Backward compatible with Phase 1 data
- [ ] Manager can view jobs with/without structured data

### Manager Dashboard Testing
- [ ] Formatted address displays when available
- [ ] Falls back to original address gracefully
- [ ] City/province/postal shown below address
- [ ] Works on both job list and detail pages

## Migration Notes

### For Existing Users
1. No data loss - Phase 1 data remains in `pickup_address`/`dropoff_address`
2. Jobs created before Phase 2 won't have structured fields
3. Manager dashboard handles gracefully with fallback display
4. Can batch-geocode old addresses later if needed

### Database Space
- ~350 bytes per job for structured fields
- All fields nullable (no size impact for fallback entries)
- Indexes ~10KB per 1000 jobs

## Cost Implications

Google Places API Pricing:
- **Autocomplete (without details):** $0.00 per request (free tier 100k/month)
- **Place Details:** $0.017 per request ($17 per 1000)
- **Geocoding:** $0.005 per request ($5 per 1000)

**Typical job:**
- 5-10 autocomplete suggestions as user types (~3 jobs/day avg)
- 1 place details call per address selected (~2 per job)
- Total: ~$0.34 per job or ~$10/month for 30 jobs

Free tier ($200/month credit) covers ~40,000 place details calls.

## Rollback Plan

If issues arise:
1. Address autocomplete component gracefully degrades to manual entry
2. All Phase 1 data remains intact
3. Can disable Google API key - manual entry still works
4. No database changes required to rollback (structured fields just stay empty)

## Related Files

- **Component:** `components/AddressAutocomplete.tsx`
- **Form Page:** `app/client/intake/page.tsx`
- **API Route:** `app/api/jobs/route.ts`
- **Manager Dashboard:** `app/manager/jobs/page.tsx`, `app/manager/jobs/[jobId]/page.tsx`
- **Types:** `lib/types.ts`
- **Supabase Lib:** `lib/supabase.ts`
- **Database:** `supabase/migrations/20260518000000_add_structured_addresses.sql`
