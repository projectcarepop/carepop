DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Create user_roles table
CREATE TABLE public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'provider')),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add comments
COMMENT ON TABLE public.user_roles IS 'Stores the role for each user, linking to Supabase auth.';
COMMENT ON COLUMN public.user_roles.user_id IS 'Link to the authenticated user in auth.users.';
COMMENT ON COLUMN public.user_roles.role IS 'The role of the user (e.g., user, admin, provider).';

-- Add trigger for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE PROCEDURE extensions.moddatetime('updated_at');

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Grant usage on the public schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant permissions on the table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_roles TO authenticated;
GRANT ALL ON TABLE public.user_roles TO service_role;

-- RLS Policies
CREATE POLICY "Allow admin full access" 
ON public.user_roles 
FOR ALL 
USING ( (
  SELECT auth.uid() IN ( SELECT user_roles.user_id
  FROM user_roles
  WHERE user_roles.role = 'admin'::text)
)) WITH CHECK ( (
  SELECT auth.uid() IN ( SELECT user_roles.user_id
  FROM user_roles
  WHERE user_roles.role = 'admin'::text)
));

CREATE POLICY "Allow users to view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id); 