CREATE OR REPLACE VIEW public.detailed_appointments AS
SELECT
    a.id,
    a.status,
    a.appointment_datetime,
    a.clinic_id,
    json_build_object(
        'first_name', p.first_name,
        'last_name', p.last_name,
        'email', u.email
    ) AS "user",
    json_build_object(
        'name', s.name
    ) AS service,
    json_build_object(
        'first_name', prov.first_name,
        'last_name', prov.last_name
    ) AS provider
FROM
    public.appointments a
LEFT JOIN
    public.profiles p ON a.user_id = p.user_id
LEFT JOIN
    auth.users u ON a.user_id = u.id
LEFT JOIN
    public.services s ON a.service_id = s.id
LEFT JOIN
    public.providers prov ON a.provider_id = prov.id; 