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
    notes text,
    user_full_name text,
    user_email text,
    user_contact_no text,
    service_name text,
    service_price numeric,
    service_duration_minutes integer,
    provider_name text,
    clinic_name text,
    total_records bigint
) AS $$
DECLARE
    v_offset int;
    v_query text;
BEGIN
    v_offset := (p_page_num - 1) * p_page_size;

    -- Using format for safe dynamic sorting.
    -- %1$L: p_clinic_id (literal)
    -- %2$L: p_search_term (literal)
    -- %3$I: sort_by column (identifier)
    -- %4$s: sort_order (string)
    -- %5$s: page_size (string)
    -- %6$s: offset (string)
    v_query := format(
        $query$
        WITH appointment_details AS (
            SELECT
                a.id,
                a.start_time AS appointment_datetime,
                a.status,
                a.notes,
                p_patient.id as patient_profile_id,
                p_patient.first_name as patient_first_name,
                p_patient.last_name as patient_last_name,
                p_patient.email as patient_email,
                p_patient.contact_no as patient_contact_no,
                s.name AS service_name,
                s.price as service_price,
                s.duration_minutes as service_duration_minutes,
                p_provider.first_name as provider_first_name,
                p_provider.last_name as provider_last_name,
                c.name AS clinic_name,
                count(*) OVER() as total_records
            FROM
                public.appointments AS a
            LEFT JOIN public.profiles AS p_patient ON a.patient_id = p_patient.id
            LEFT JOIN public.services AS s ON a.service_id = s.id
            LEFT JOIN public.clinics AS c ON a.clinic_id = c.id
            LEFT JOIN public.providers AS prov ON a.provider_id = prov.id
            LEFT JOIN public.profiles AS p_provider ON prov.profile_id = p_provider.id
            WHERE
                a.clinic_id = %1$L
        ),
        filtered_appointments AS (
             SELECT 
                *,
                COALESCE(TRIM(patient_first_name || ' ' || patient_last_name), 'Not Set') AS user_full_name,
                COALESCE(TRIM(provider_first_name || ' ' || provider_last_name), 'N/A') as provider_name
             FROM appointment_details
             WHERE %2$L IS NULL OR %2$L = '' OR
                status ILIKE '%%' || %2$L || '%%' OR
                patient_first_name ILIKE '%%' || %2$L || '%%' OR
                patient_last_name ILIKE '%%' || %2$L || '%%' OR
                patient_email ILIKE '%%' || %2$L || '%%' OR
                service_name ILIKE '%%' || %2$L || '%%' OR
                (provider_first_name || ' ' || provider_last_name) ILIKE '%%' || %2$L || '%%'
        )
        SELECT
            fa.id,
            fa.appointment_datetime,
            fa.status,
            fa.notes,
            fa.user_full_name,
            fa.patient_email as user_email,
            fa.patient_contact_no as user_contact_no,
            fa.service_name,
            fa.service_price,
            fa.service_duration_minutes,
            fa.provider_name,
            fa.clinic_name,
            fa.total_records
        FROM
            filtered_appointments fa
        ORDER BY
            %3$I %4$s
        LIMIT %5$s
        OFFSET %6$s
        $query$,
        p_clinic_id,
        p_search_term,
        CASE 
            WHEN p_sort_by IN ('user_full_name', 'service_name', 'provider_name', 'status', 'id') THEN p_sort_by
            ELSE 'appointment_datetime'
        END,
        CASE 
            WHEN upper(p_sort_order) = 'ASC' THEN 'ASC'
            ELSE 'DESC'
        END,
        p_page_size,
        v_offset
    );

    RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql; 