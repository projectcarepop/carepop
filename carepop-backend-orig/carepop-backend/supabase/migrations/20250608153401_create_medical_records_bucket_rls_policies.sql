-- Allow insert for all authenticated users
CREATE POLICY "Allow authenticated inserts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical-records');

-- Allow select for all authenticated users
CREATE POLICY "Allow authenticated selects"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'medical-records');

-- Allow update for all authenticated users
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'medical-records');

-- Allow delete for all authenticated users
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'medical-records');
