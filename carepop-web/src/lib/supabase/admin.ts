import { createClient } from '@supabase/supabase-js'

// This client is intended for server-side use in API routes where
// elevated privileges are required. It uses the SERVICE_ROLE_KEY
// and should be used with extreme caution.
//
// IMPORTANT: RLS is bypassed when using this client. Ensure your queries
// are secure and do not expose sensitive data unintentionally.
//
// Do not expose this client to the browser.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is not defined. Check your environment variables.')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
}) 