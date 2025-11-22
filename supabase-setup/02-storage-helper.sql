-- =====================================================
-- Storage Bucket Policies for Property Images
-- Run this in Supabase SQL Editor after creating the bucket
-- =====================================================

-- Policy 1: Allow anyone to READ/VIEW images (public access)
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'property-images' );

-- Policy 2: Allow authenticated users to UPLOAD images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'property-images' );

-- Policy 3: Allow authenticated users to UPDATE images
CREATE POLICY "Authenticated users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'property-images' )
WITH CHECK ( bucket_id = 'property-images' );

-- Policy 4: Allow authenticated users to DELETE images
CREATE POLICY "Authenticated users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'property-images' );

-- =====================================================
-- Verification Query
-- Run this to check your policies are active
-- =====================================================

-- Check if policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%images%';

