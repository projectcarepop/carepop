-- SERVICE MANAGEMENT SCHEMA
-- This migration enhances and creates the tables necessary for managing services,
-- provider availability, and dynamic forms.

-- 1. Create `service_categories` table
--    - Stores categories for services to allow for better organization.
create table if not exists public.service_categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
comment on table public.service_categories is 'Stores categories for clinical services.';

-- 2. Enhance `services` table
--    - Adds cost, requirements, and a link to the new categories table.
alter table public.services
add column if not exists cost numeric(10, 2) default 0.00,
add column if not exists requirements text,
add column if not exists category_id uuid references public.service_categories(id) on delete set null;

comment on column public.services.cost is 'The cost of the service.';
comment on column public.services.requirements is 'Prerequisites or requirements for the patient before the service.';
comment on column public.services.category_id is 'Foreign key to the service_categories table.';


-- 3. Create `forms` table
--    - A generic table to define dynamic forms (e.g., intake, consent).
--    - The `schema_definition` column uses jsonb to store the form structure.
create table if not exists public.forms (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    description text,
    schema_definition jsonb not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
comment on table public.forms is 'Defines the structure and schema of dynamic forms.';
comment on column public.forms.schema_definition is 'JSONB schema defining the form fields, validation, and layout.';


-- 4. Create `form_submissions` table
--    - Stores user submissions for the dynamic forms.
--    - `submission_data_encrypted` will hold encrypted form data for security.
create table if not exists public.form_submissions (
    id uuid default gen_random_uuid() primary key,
    form_id uuid not null references public.forms(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    submission_data_encrypted text not null,
    iv text not null,
    auth_tag text not null,
    submitted_at timestamptz default now()
);
comment on table public.form_submissions is 'Stores user-submitted data for forms, with encrypted content.';
comment on column public.form_submissions.submission_data_encrypted is 'Encrypted (AES-256-GCM) form submission data.';
comment on column public.form_submissions.iv is 'Initialization Vector used for encryption.';
comment on column public.form_submissions.auth_tag is 'Authentication Tag for verifying encrypted data integrity.';


-- 5. Create `provider_service_schedules` table
--    - Manages recurring weekly schedules for providers, specific to a service and clinic.
create table if not exists public.provider_service_schedules (
    id uuid default gen_random_uuid() primary key,
    provider_id uuid not null references public.providers(id) on delete cascade,
    service_id uuid not null references public.services(id) on delete cascade,
    clinic_id uuid not null references public.clinics(id) on delete cascade,
    day_of_week smallint not null check (day_of_week >= 1 and day_of_week <= 7), -- 1: Monday, 7: Sunday
    start_time time not null,
    end_time time not null,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint unique_provider_service_schedule unique (provider_id, service_id, clinic_id, day_of_week, start_time)
);
comment on table public.provider_service_schedules is 'Defines the recurring weekly availability of a provider for a specific service at a specific clinic.';
comment on column public.provider_service_schedules.day_of_week is 'Day of the week (1=Monday, 7=Sunday).';
