CREATE OR REPLACE FUNCTION get_admin_appointments_list(
    p_clinic_id uuid,
    p_search_term text,
    p_sort_by text,
    p_sort_order text,
    p_page_num int,
    p_page_size int
)
RETURNS TABLE(
    id uuid,
    appointment_datetime timestamptz,
    status text,
    user_full_name text,
    user_email text,
    service_name text,
    provider_name text,
    clinic_name text,
    total_records bigint
) AS $$
DECLARE
    v_offset int;
    v_sort_direction text;
BEGIN
    v_offset := (p_page_num - 1) * p_page_size;

    IF p_sort_order IS NOT NULL AND lower(p_sort_order) = 'desc' THEN
        v_sort_direction := 'DESC';
    ELSE
        v_sort_direction := 'ASC';
    END IF;

    RETURN QUERY
    WITH filtered_appointments AS (
        SELECT
            a.id,
            a.appointment_datetime,
            a.status::text,
            COALESCE(TRIM(p.first_name || ' ' || p.last_name), 'Not Set') AS user_full_name,
            p.email AS user_email,
            s.name AS service_name,
            COALESCE(prov.full_name, 'N/A') as provider_name,
            c.name AS clinic_name
        FROM
            appointments AS a
        LEFT JOIN
            profiles AS p ON a.user_id = p.user_id
        LEFT JOIN
            services AS s ON a.service_id = s.id
        LEFT JOIN
            clinics AS c ON a.clinic_id = c.id
        LEFT JOIN
            providers AS prov ON a.provider_id = prov.id
        WHERE
            a.clinic_id = p_clinic_id AND
            (
                p_search_term IS NULL OR p_search_term = '' OR
                p.first_name ILIKE '%' || p_search_term || '%' OR
                p.last_name ILIKE '%' || p_search_term || '%' OR
                p.email ILIKE '%' || p_search_term || '%' OR
                s.name ILIKE '%' || p_search_term || '%' OR
                prov.full_name ILIKE '%' || p_search_term || '%'
            )
    )
    SELECT
        fa.*,
        (SELECT count(*) FROM filtered_appointments) AS total_records
    FROM
        filtered_appointments fa
    ORDER BY
        CASE 
            WHEN p_sort_by = 'user_full_name' THEN fa.user_full_name
            WHEN p_sort_by = 'service_name' THEN fa.service_name
            ELSE NULL
        END,
        CASE
            WHEN p_sort_by = 'appointment_datetime' THEN fa.appointment_datetime
            ELSE NULL
        END
    LIMIT p_page_size
    OFFSET v_offset;
END;
$$ LANGUAGE plpgsql; 