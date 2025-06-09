create or replace function public.search_users(
    search_term text default '',
    role_filter text default '',
    limit_val integer default 10,
    offset_val integer default 0,
    sort_by text default 'created_at',
    sort_order text default 'desc'
)
returns table (
    user_id uuid,
    first_name text,
    last_name text,
    email text,
    created_at timestamptz,
    role text,
    total_count bigint
)
language plpgsql
security definer
as $$
declare
    query_sql text;
    role_clause text := '';
    search_clause text := '';
    sort_direction text;
    total_records bigint;
begin
    -- Prevent SQL injection for sort_order
    if lower(sort_order) = 'asc' then
        sort_direction := 'asc';
    else
        sort_direction := 'desc';
    end if;

    -- Build WHERE clauses
    if role_filter is not null and role_filter != '' then
        role_clause := format('and ur.role = %L', role_filter);
    end if;

    if search_term is not null and search_term != '' then
        search_clause := format(
            'and (p.first_name ilike ''%%%s%%'' or p.last_name ilike ''%%%s%%'' or u.email ilike ''%%%s%%'')',
            search_term, search_term, search_term
        );
    end if;

    -- First, get the total count
    query_sql := 'select count(*) from auth.users u ' ||
                 'left join public.profiles p on u.id = p.user_id ' ||
                 'left join public.user_roles ur on u.id = ur.user_id ' ||
                 'where 1=1 ' || role_clause || ' ' || search_clause;

    execute query_sql into total_records;

    -- Then, get the paginated data
    query_sql := 'select u.id as user_id, p.first_name, p.last_name, u.email, u.created_at, ur.role, ' || total_records || ' as total_count ' ||
                 'from auth.users u ' ||
                 'left join public.profiles p on u.id = p.user_id ' ||
                 'left join public.user_roles ur on u.id = ur.user_id ' ||
                 'where 1=1 ' || role_clause || ' ' || search_clause ||
                 ' order by ' || quote_ident(sort_by) || ' ' || sort_direction ||
                 ' limit ' || limit_val ||
                 ' offset ' || offset_val;

    return query execute query_sql;
end;
$$; 