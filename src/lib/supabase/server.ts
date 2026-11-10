import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/constants/auth";
import { verifySessionCookie } from "@/lib/security/sessionToken";

export interface CreateClientConfig {
  isPersistent?: boolean;
}

export async function createClient(config?: CreateClientConfig) {
  let cookieStore: any = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Outside request scope fallback (testing or background tasks)
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  // Determine persistence: explicitly provided (e.g. login), or derived from verified HMAC session cookie
  let isPersistent = config?.isPersistent;
  if (isPersistent === undefined) {
    const sessionCookie = cookieStore?.get ? cookieStore.get(AUTH_COOKIE_NAME)?.value : undefined;
    if (sessionCookie) {
      const verifiedSession = await verifySessionCookie(sessionCookie);
      isPersistent = verifiedSession?.rememberMe === true;
    } else {
      isPersistent = false;
    }
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore?.get ? cookieStore.get(name)?.value : undefined;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          if (!cookieStore?.set) return;
          const finalOptions: CookieOptions = isPersistent
            ? options
            : {
                ...options,
                maxAge: undefined,
                expires: undefined,
              };
          cookieStore.set({ name, value, ...finalOptions });
        } catch {
          // The `set` method was called from a Server Component.
          // Can be ignored if middleware is refreshing sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          if (!cookieStore?.set) return;
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // The `delete` method was called from a Server Component.
        }
      },
    },
  });
}
