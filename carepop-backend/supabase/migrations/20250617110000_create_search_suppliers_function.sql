-- Function to search suppliers with filtering
CREATE OR REPLACE FUNCTION search_suppliers(
    search_term TEXT,
    p_clinic_id UUID
)
RETURNS SETOF public.suppliers AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.*
    FROM
        public.suppliers s
    WHERE
        (p_clinic_id IS NULL OR s.clinic_id = p_clinic_id) AND
        (
            search_term IS NULL OR
            search_term = '' OR
            s.name ILIKE '%' || search_term || '%' OR
            s.contact_name ILIKE '%' || search_term || '%' OR
            s.contact_email ILIKE '%' || search_term || '%' OR
            s.address ILIKE '%' || search_term || '%'
        );
END;
$$ LANGUAGE plpgsql; 