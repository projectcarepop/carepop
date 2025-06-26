import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

export function createClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // The `set` method may fail if called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // The `delete` method may fail if called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
} 