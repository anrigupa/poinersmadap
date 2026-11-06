import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, ROLE_REDIRECT_MAP, getRoleRedirectPath, normalizeRole } from "@/lib/constants/auth";
import { AuthSession, UserRole } from "@/types/auth";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // Read poiner cookie session (supports both Supabase token and demo fallback session)
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  let currentSession: AuthSession | null = null;

  if (sessionCookie) {
    try {
      const decoded = JSON.parse(decodeURIComponent(sessionCookie));
      if (decoded && decoded.user && decoded.user.role) {
        currentSession = {
          ...decoded,
          user: {
            ...decoded.user,
            role: normalizeRole(decoded.user.role),
          },
        } as AuthSession;
      }
    } catch {
      // Invalid cookie format
    }
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
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
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
    if (user && !currentSession) {
      let rawRole = user.user_metadata?.role;
      if (!rawRole) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", user.id)
            .maybeSingle();
          if (profile?.role) {
            rawRole = profile.role;
          }
        } catch {
          // Fallback to user metadata
        }
      }
      const role = normalizeRole(rawRole);
      currentSession = {
        user: {
          id: user.id,
          email: user.email || "",
          fullName: user.user_metadata?.full_name || user.email || "Pengguna",
          role,
        },
        token: user.id,
        expiresAt: Date.now() + 86400 * 1000,
      };
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
    const role = normalizeRole(currentSession.user.role);

    if (isProtectedAdmin && role !== "admin") {
      // Non-admin trying to access /admin -> bounce to their own role dashboard
      const targetUrl = getRoleRedirectPath(role);
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
