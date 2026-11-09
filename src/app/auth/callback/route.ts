import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/reset-password";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  // Case 1: PKCE Code Flow (?code=...)
  if (code) {
    let response = NextResponse.redirect(new URL(next, request.url));

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.redirect(new URL(next, request.url));
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.redirect(new URL(next, request.url));
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
  }

  // Case 2: Server-side Token Hash Flow (?token_hash=...&type=recovery)
  if (token_hash && type) {
    let response = NextResponse.redirect(new URL(next, request.url));

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.redirect(new URL(next, request.url));
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.redirect(new URL(next, request.url));
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });
    if (!error) {
      return response;
    }
  }

  // Fallback: If no code/token_hash or error occurred, forward query params to /reset-password
  // so client-side handlers (or token_hash fallback) can inspect them
  const fallbackUrl = new URL(next, request.url);
  requestUrl.searchParams.forEach((value, key) => {
    if (key !== "next") {
      fallbackUrl.searchParams.set(key, value);
    }
  });
  return NextResponse.redirect(fallbackUrl);
}
