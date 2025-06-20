import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { env } from '../config';

export const createSupabaseClient = (c: Context) => {
  const supabase = createServerClient(
    env.SUPABASE_URL,
    env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(key: string) {
          return getCookie(c, key);
        },
        set(key: string, value: string, options: CookieOptions) {
          setCookie(c, key, value, options);
        },
        remove(key: string, options: CookieOptions) {
          deleteCookie(c, key, options);
        },
      },
      cookieOptions: {
        // Set a reasonable max age for cookies to avoid the 400-day limit
        maxAge: 60 * 60 * 24 * 7, // 1 week
      },
    }
  );

  return supabase;
};

// We can also create a service role client here if needed for admin tasks
export const supabaseAdmin = createServerClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    cookies: {
      // A dummy cookies object is required for the admin client,
      // but it doesn't need to do anything.
      get(key: string) {
        return undefined;
      },
      set(key: string, value: string, options: CookieOptions) {},
      remove(key: string, options: CookieOptions) {},
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
); 