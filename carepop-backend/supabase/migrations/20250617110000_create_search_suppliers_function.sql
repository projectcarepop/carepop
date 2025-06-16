DROP FUNCTION IF EXISTS public.search_suppliers(text, uuid);

-- Function to search suppliers with filtering
CREATE OR REPLACE FUNCTION search_suppliers(
    search_term TEXT DEFAULT NULL
)
RETURNS SETOF public.suppliers AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.*
    FROM
        public.suppliers s
    WHERE
        search_term IS NULL OR
        search_term = '' OR
        s.name ILIKE '%' || search_term || '%' OR
        s.contact_person ILIKE '%' || search_term || '%' OR
        s.contact_email ILIKE '%' || search_term || '%' OR
        s.address ILIKE '%' || search_term || '%';
END;
$$ LANGUAGE plpgsql; 