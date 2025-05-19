-- Ensure RLS is enabled on relevant tables
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_facilities ENABLE ROW LEVEL SECURITY;

-- ==== Policies for public.facilities ====
-- Public read access to active facilities
CREATE POLICY "Allow public read access to active facilities"
    ON public.facilities
    FOR SELECT
    USING (is_active = true);

-- Admin full access to facilities
CREATE POLICY "Allow admin full access to facilities"
    ON public.facilities
    FOR ALL -- Covers SELECT, INSERT, UPDATE, DELETE
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ==== Policies for public.providers ====
-- Public read access to active providers
CREATE POLICY "Allow public read access to active providers"
    ON public.providers
    FOR SELECT
    USING (is_active = true);

-- Policy for providers to update their own profile (if user_id link exists and is populated)
CREATE POLICY "Allow provider to update own linked profile details"
    ON public.providers
    FOR UPDATE
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);
    -- Note: INSERT for providers should likely be an admin-only or a specific backend process.

-- Admin full access to providers
CREATE POLICY "Allow admin full access to providers"
    ON public.providers
    FOR ALL -- Covers SELECT, INSERT, UPDATE, DELETE
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ==== Policies for public.specialties (Lookup table) ====
-- Public read access to specialties
CREATE POLICY "Allow public read access to specialties"
    ON public.specialties
    FOR SELECT
    USING (true);

-- Admin full access to specialties
CREATE POLICY "Allow admin full access to specialties"
    ON public.specialties
    FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ==== Policies for public.provider_specialties (Linking table) ====
-- Public read access
CREATE POLICY "Allow public read access to provider specialties"
    ON public.provider_specialties
    FOR SELECT
    USING (true); -- Assumes that if one can see a provider, one can see their linked specialties.
                   -- Could be restricted further if needed by joining to active providers.

-- Admin full access
CREATE POLICY "Allow admin full access to provider specialties"
    ON public.provider_specialties
    FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ==== Policies for public.provider_facilities (Linking table) ====
-- Public read access
CREATE POLICY "Allow public read access to provider facilities"
    ON public.provider_facilities
    FOR SELECT
    USING (true); -- Assumes that if one can see a provider/facility, one can see their link.
                   -- Could be restricted further.

-- Admin full access
CREATE POLICY "Allow admin full access to provider facilities"
    ON public.provider_facilities
    FOR ALL
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Ensure the public.is_admin function is robustly defined and works as intended.
-- The SECURITY DEFINER clause on helper functions like is_admin() is crucial
-- to allow them to query tables like user_roles without the calling user
-- needing direct SELECT permission on those role tables. 