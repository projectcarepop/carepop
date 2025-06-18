CREATE OR REPLACE FUNCTION search_medical_records(p_user_id UUID, p_search_term TEXT)
RETURNS TABLE (
    id UUID,
    record_title TEXT,
    record_details TEXT,
    record_file_url TEXT,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mr.id,
        mr.record_title,
        mr.record_details,
        mr.record_file_url,
        mr.created_at
    FROM
        medical_records AS mr
    WHERE
        mr.user_id = p_user_id
        AND (
            p_search_term = ''
            OR mr.record_title ILIKE '%' || p_search_term || '%'
        )
    ORDER BY
        mr.created_at DESC;
END;
$$ LANGUAGE plpgsql; 