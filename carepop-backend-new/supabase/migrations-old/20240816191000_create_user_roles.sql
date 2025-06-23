-- Create a custom type for user roles to ensure data integrity.
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'provider');

-- User Roles Table
-- Assigns roles to users. A user can have multiple roles.
CREATE TABLE public.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    PRIMARY KEY (user_id, role)
);

COMMENT ON TABLE public.user_roles IS 'Assigns roles (admin, user, provider) to users.';

--- Helper Function to check for admin role ---
-- This function is a "security definer" so it can see all roles
-- while checking a user's permission.
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = is_admin.user_id AND ur.role = 'admin'
    );
$$;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policies for User Roles
-- 1. Users can view their own roles.
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- 2. Admins have full access to roles.
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid())); 