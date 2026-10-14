-- ================================================================
-- Supabase Storage Setup for NaijaVestor
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ================================================================

-- 1. Create the storage bucket for business media (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-media',
  'business-media',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

-- 2. Clean up any existing duplicate policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- 3. Policy: Anyone can view business media (Public read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'business-media');

-- 4. Policy: Authenticated users can upload media
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'business-media');

-- 5. Policy: Authenticated users can update media
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'business-media');

-- 6. Policy: Authenticated users can delete media
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'business-media');
