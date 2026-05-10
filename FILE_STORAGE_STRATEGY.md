# HiveHaul File Storage Strategy

## Overview

HiveHaul will eventually need to store:
1. **Intake form photos** (optional, Phase 1)
2. **Delivery proof photos** (required, Phase 3)
3. **Job progress photos** (Phase 3+)
4. **Invoice PDFs** (generated, Phase 5)
5. **Signatures/proof documents** (Phase 4+)

## Recommended Solution: Supabase Storage

### Why Supabase Storage?

**Advantages:**
- ✅ Already integrated with Supabase project
- ✅ PostgreSQL integration (store file paths in database)
- ✅ Row-level security (RLS) works with files
- ✅ Edge caching (Supabase CDN)
- ✅ Simple file management API
- ✅ No additional services/costs to manage
- ✅ Free tier: 1GB storage
- ✅ Works on mobile (web & native apps)
- ✅ Automatic cleanup with database cascades

**Disadvantages:**
- ⚠️ Supabase project-dependent (vendor lock-in)
- ⚠️ Limited to ~50MB files (single file size)
- ⚠️ Custom thumbnail generation requires function

### Alternatives Considered

| Option | Pros | Cons | Recommendation |
|--------|------|------|-----------------|
| **Supabase Storage** | Integrated, simple, RLS-enabled | Vendor lock-in | ✅ **USE THIS** |
| AWS S3 | Industry standard, cheap | Complex setup, more ops | ❌ Overkill for Phase 1 |
| Cloudinary | Image processing, CDN | Third-party dependency, cost | ❌ Skip for now |
| Firebase Storage | Simple, scalable | Limited RLS control | ❌ Prefer Supabase |
| Local uploads | None | Not viable for production | ❌ Never use |

---

## Phase 1: Skip Photos (Optional)

**Current state:** Intake form doesn't include photo upload  
**Decision:** Keep Phase 1 minimal, add photos in Phase 3

**Why:**
- ✅ Reduces scope complexity
- ✅ Proves core job flow works first
- ✅ Allows time for photo UX design
- ✅ GPS/location setup can wait

---

## Phase 3: Implement Photo Uploads

### Database Setup

```sql
-- Create bucket in Supabase Storage
-- Via Dashboard: Storage > Create Bucket > job_photos

-- Table: job_photos (reference stored files)
CREATE TABLE job_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  
  -- File metadata
  storage_path TEXT NOT NULL,  -- path in bucket
  file_name TEXT NOT NULL,     -- original filename
  mime_type TEXT,              -- image/jpeg, etc
  file_size INTEGER,           -- bytes
  
  -- Photo metadata
  photo_type TEXT NOT NULL,    -- intake, proof, progress
  description TEXT,            -- optional note
  
  -- Audit trail
  uploaded_by UUID,            -- provider_id or system
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- For Phase 4
  location_lat DECIMAL(10, 8),
  location_lon DECIMAL(11, 8),
  gps_accuracy_meters INTEGER
);

-- Indexes
CREATE INDEX idx_job_photos_job_id ON job_photos(job_id);
CREATE INDEX idx_job_photos_type ON job_photos(photo_type);
CREATE INDEX idx_job_photos_created ON job_photos(uploaded_at DESC);

-- RLS (Phase 2+)
ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view all photos" ON job_photos
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'manager'
  );

CREATE POLICY "Providers can view own job photos" ON job_photos
  FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'provider'
    AND job_id IN (
      SELECT id FROM jobs WHERE assigned_provider = auth.uid()
    )
  );

CREATE POLICY "Only providers can upload photos" ON job_photos
  FOR INSERT WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'provider'
  );
```

### Folder Structure

```
job_photos/
├── [job_id]/
│   ├── intake_20260509_101530_abc123.jpg
│   ├── proof_20260509_143000_def456.jpg
│   ├── proof_20260509_143015_ghi789.jpg
│   └── progress_20260509_150000_jkl012.jpg
```

**Path naming scheme:**
- `[photo_type]_[YYYYMMDD]_[HHMMSS]_[random].jpg`
- Easy to sort chronologically
- Prevents filename collisions
- Includes timestamp for ordering

### Upload Implementation

```typescript
// lib/storage.ts
import { supabase } from './supabase'

export async function uploadJobPhoto(
  jobId: string,
  file: File,
  photoType: 'intake' | 'proof' | 'progress'
): Promise<{ path: string; url: string }> {
  const timestamp = new Date().toISOString().replace(/[:-]/g, '').slice(0, 15)
  const random = Math.random().toString(36).slice(2, 9)
  const ext = file.name.split('.').pop()
  
  const path = `${jobId}/${photoType}_${timestamp}_${random}.${ext}`
  
  const { error } = await supabase.storage
    .from('job_photos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
  
  if (error) throw error
  
  // Get signed URL (valid for 1 year)
  const { data } = supabase.storage
    .from('job_photos')
    .getPublicUrl(path)
  
  // Save to database
  await supabase.from('job_photos').insert({
    job_id: jobId,
    storage_path: path,
    file_name: file.name,
    mime_type: file.type,
    file_size: file.size,
    photo_type: photoType,
  })
  
  return {
    path,
    url: data.publicUrl,
  }
}

export async function getJobPhotos(jobId: string) {
  const { data, error } = await supabase
    .from('job_photos')
    .select('*')
    .eq('job_id', jobId)
    .order('uploaded_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function deleteJobPhoto(photoId: string) {
  // Get path first
  const { data: photo } = await supabase
    .from('job_photos')
    .select('storage_path')
    .eq('id', photoId)
    .single()
  
  // Delete from storage
  await supabase.storage
    .from('job_photos')
    .remove([photo.storage_path])
  
  // Delete from database (cascades)
  await supabase
    .from('job_photos')
    .delete()
    .eq('id', photoId)
}
```

### Upload UI Component

```typescript
// components/PhotoUpload.tsx
'use client'

import { useState } from 'react'
import { uploadJobPhoto } from '@/lib/storage'

export default function PhotoUpload({ jobId }: { jobId: string }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Client-side preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)
    
    try {
      setLoading(true)
      await uploadJobPhoto(jobId, file, 'proof')
      
      // Clear and show success
      setPreview(null)
      e.target.value = ''
      alert('Photo uploaded successfully')
      
      // Refetch photos list
      window.location.reload()
    } catch (error) {
      alert('Upload failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="photo-upload">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        disabled={loading}
      />
      
      {preview && (
        <div className="preview">
          <img src={preview} alt="Preview" style={{ maxWidth: '200px' }} />
          {loading && <p>Uploading...</p>}
        </div>
      )}
      
      <p className="text-sm text-gray-500">
        Max 5MB. Formats: JPG, PNG, WebP
      </p>
    </div>
  )
}
```

---

## Phase 4: Add GPS Data

```sql
-- Add to job_photos table (already included above)
location_lat DECIMAL(10, 8),
location_lon DECIMAL(11, 8),
gps_accuracy_meters INTEGER

-- When uploading photo:
const { latitude, longitude, accuracy } = await getGPSLocation()
await uploadJobPhoto(..., { latitude, longitude, accuracy })
```

---

## Phase 5: Invoice PDF Storage

```sql
CREATE TABLE invoice_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id),
  storage_path TEXT NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generate PDF
const pdf = generateInvoicePDF(job)
const buffer = await pdf.toBuffer()

// Upload to storage
await supabase.storage
  .from('invoices')
  .upload(`${invoice_id}.pdf`, buffer, {
    contentType: 'application/pdf',
  })

// Save reference
await supabase.from('invoice_files').insert({
  invoice_id,
  storage_path: `${invoice_id}.pdf`,
})
```

---

## Security & Cleanup

### File Cleanup
```sql
-- Automatic: Database cascade deletes files when job is deleted
-- Manual: Clean up orphaned files via periodic function

-- No public access (all files require authentication)
-- Photos are private to job/provider
```

### Size Limits
```
Max file size: 5MB (mobile-appropriate)
Photo resolution: Auto-compress via browser API
Bucket size: 1GB free (grows as needed)
```

### Best Practices
- ✅ Always validate file type (client + server)
- ✅ Never trust `file.type` alone
- ✅ Verify MIME type server-side
- ✅ Compress images client-side before upload
- ✅ Generate unique filenames (no collisions)
- ✅ Use signed URLs for downloads
- ✅ Clean up temp files

---

## Cost Estimation

| Phase | Storage | Cost/Month |
|-------|---------|-----------|
| Phase 1 | 0 MB | $0 |
| Phase 3 | ~500 MB (photos) | $0 (free tier) |
| Phase 4 | ~1 GB | $0-5 (varies) |
| Phase 5 | ~1.5 GB | $0-5 |
| Growth | 10 GB | $10-20 |
| Large scale | 100 GB | $100+ |

**Note:** Supabase free tier includes 1GB. Scaling is pay-as-you-go.

---

## Implementation Timeline

- **Phase 1:** Skip (no photos)
- **Phase 3:** Implement intake + proof photos
- **Phase 4:** Add GPS data to photos
- **Phase 5:** Add invoice PDF storage

---

## Approval Needed

1. ✅ Supabase Storage preferred?
2. ✅ 5MB file size limit acceptable?
3. ✅ Mandatory photo upload on completion, or optional?
4. ✅ Keep original filenames or use timestamps?
5. ✅ GPS data required, or optional enhancement?
