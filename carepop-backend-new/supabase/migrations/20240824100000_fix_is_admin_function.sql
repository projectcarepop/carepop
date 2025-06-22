-- This migration fixes a critical bug in the is_admin function.
-- The original function incorrectly referenced itself (`is_admin.user_id`)
-- instead of its input parameter (`user_id`).

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        -- Correctly reference the function's `user_id` parameter, not the function itself.
        WHERE ur.user_id = user_id AND ur.role = 'admin'
    );
$$; 