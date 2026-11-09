import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getRoleRedirectPath, normalizeRole } from "@/lib/constants/auth";
import { AuthSession } from "@/types/auth";
import { verifySessionCookie } from "@/lib/security/sessionToken";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // Read and cryptographically verify poiner cookie session (HMAC-SHA256)
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let currentSession: AuthSession | null = await verifySessionCookie(sessionCookie);
  const isPersistent = currentSession?.rememberMe === true;

  // If a cookie was sent by the client but failed cryptographic verification or expired, purge it
  if (sessionCookie && !currentSession) {
    response.cookies.delete(AUTH_COOKIE_NAME);
  }

  // Attempt Supabase live session refresh if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey && supabaseUrl !== "https://placeholder-project.supabase.co") {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          const finalOptions: CookieOptions = isPersistent
            ? options
            : { ...options, maxAge: undefined, expires: undefined };
          request.cookies.set({ name, value, ...finalOptions });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...finalOptions });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    // 1. If verified session cookie is missing, but a lingering Supabase user session exists:
    // do NOT auto re-authenticate. Clean up Supabase session.
    if (!currentSession && user) {
      try {
        await supabase.auth.signOut();
      } catch {
        // silent
      }
      response.cookies.delete(AUTH_COOKIE_NAME);
    } else if (currentSession && !user) {
      // 2. If application cookie exists without an active Supabase user session,
      // immediately invalidate the session (prevents any offline/forged/stale cookie usage).
      currentSession = null;
      response.cookies.delete(AUTH_COOKIE_NAME);
    } else if (currentSession && user && user.id !== currentSession.user.id) {
      // 3. Prevent cross-account session mismatch between Supabase token and application cookie
      currentSession = null;
      try {
        await supabase.auth.signOut();
      } catch {
        // silent
      }
      response.cookies.delete(AUTH_COOKIE_NAME);
    } else if (currentSession && user && pathname.startsWith("/admin")) {
      // 4. Strict Admin Verification against Supabase user metadata:
      // If Supabase metadata explicitly marks user as teacher/guru/student/siswa, block /admin immediately.
      const metaRole = user.app_metadata?.role || user.user_metadata?.role;
      if (metaRole && normalizeRole(metaRole) !== "admin") {
        currentSession = {
          ...currentSession,
          user: {
            ...currentSession.user,
            role: normalizeRole(metaRole),
          },
        };
      }
    }
  }

  // Define route protection boundaries
  const isLoginPage = pathname === "/login";
  const isProtectedAdmin = pathname.startsWith("/admin");
  const isProtectedGuru = pathname.startsWith("/guru") || pathname.startsWith("/teacher");
  const isProtectedSiswa = pathname.startsWith("/siswa") || pathname.startsWith("/student");
  const isProtected = isProtectedAdmin || isProtectedGuru || isProtectedSiswa;

  // 1. Authenticated user attempting to visit /login -> redirect to their designated dashboard
  if (isLoginPage && currentSession) {
    const targetUrl = getRoleRedirectPath(currentSession.user.role);
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // 2. Unauthenticated user attempting to access protected route -> redirect to /login
  if (isProtected && !currentSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated user attempting to access route outside their role permission
  if (currentSession && isProtected) {
    const rawRole = currentSession.user.role;
    const role = normalizeRole(rawRole);

    // Strict exact check for /admin and /admin/*: ONLY canonical "admin" role is permitted
    if (isProtectedAdmin && (rawRole !== "admin" || role !== "admin")) {
      const targetUrl = role === "guru" || role === "siswa" ? getRoleRedirectPath(role) : "/login";
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    if (isProtectedGuru && role !== "guru" && role !== "admin") {
      // Siswa trying to access guru portal -> bounce to siswa dashboard
      const targetUrl = getRoleRedirectPath(role);
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }

    if (isProtectedSiswa && role !== "siswa" && role !== "admin") {
      // Guru accessing student-only portal -> bounce to guru dashboard
      const targetUrl = getRoleRedirectPath(role);
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }
  }

  return response;
}
