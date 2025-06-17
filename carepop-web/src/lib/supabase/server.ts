import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase';

export const createSupabaseServerClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          try {
            const cookieStore = await cookies()
            cookieStore.set(name, value, options)
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove: async (name: string, options: CookieOptions) => {
          try {
            const cookieStore = await cookies()
            cookieStore.set(name, '', options)
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}