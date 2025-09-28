 -- bucket creation
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true), ('files', 'files', false);

-- MIME types and file size limits for 'images' and 'files' buckets
UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']::TEXT[],
  file_size_limit = 5242880
WHERE id = 'images';

UPDATE storage.buckets
SET
  allowed_mime_types = ARRAY['application/pdf']::TEXT[],
  file_size_limit = 5242880
WHERE id = 'files';

-- publicly view files, but only authenticated users can upload.
CREATE POLICY "Allow public image views"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Allow authenticated image uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'images' AND auth.uid() = owner_id::uuid);

-- RLS policies for 'files'
-- Only authenticated users can upload and view their own files.
CREATE POLICY "Allow authenticated file uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'files' AND auth.uid() = owner_id::uuid);

CREATE POLICY "Allow authenticated file views"
ON storage.objects FOR SELECT
USING (bucket_id = 'files' AND auth.uid() = owner_id::uuid);
