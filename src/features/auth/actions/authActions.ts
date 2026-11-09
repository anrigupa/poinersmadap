"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/features/auth/schemas/loginSchema";
import {
  AUTH_COOKIE_NAME,
  getRoleRedirectPath,
  isValidDatabaseRole,
  normalizeRole,
} from "@/lib/constants/auth";
import { AuthActionResult, AuthSession, UserProfile } from "@/types/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signSessionCookie, verifySessionCookie } from "@/lib/security/sessionToken";
import { sanitizeSearchQuery } from "@/lib/security/guards";

const ROLE_MISMATCH_ERROR_MESSAGE =
  "Akses ditolak. Akun tidak sesuai dengan peran yang dipilih.";

const ACCOUNT_DEACTIVATED_ERROR_MESSAGE =
  "Akun Anda telah dinonaktifkan atau dihapus. Silakan hubungi administrator.";

/**
 * Server Action: Authenticate user exclusively via Supabase Auth & database role records,
 * verify role alignment, establish cryptographically signed session, and return role redirect.
 *
 * Security Invariants:
 * - Zero demo accounts, zero fallback authentication, zero password-length role adoption.
 * - Role is derived strictly from database (`profiles.role` / `teachers` / `students` / `app_metadata.role`).
 * - Any mismatch between selected portal tab and database role is rejected immediately.
 */
export async function signInAction(rawInput: unknown): Promise<AuthActionResult> {
  // 1. Validate Form Input with Zod
  const validation = loginSchema.safeParse(rawInput);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!errors[field]) errors[field] = [];
      errors[field].push(issue.message);
    }
    return {
      success: false,
      message: "Data login tidak valid. Silakan periksa kembali isian Anda.",
      errors,
    };
  }

  const { identifier, password, role, rememberMe = false } = validation.data;

  // Strict Token Validation & Length Checks (Defense-in-depth against SQLi and PostgREST syntax injection)
  const rawId = identifier.trim();
  if (rawId.length < 3 || rawId.length > 100) {
    return {
      success: false,
      message: "Format identitas login tidak valid (panjang 3-100 karakter).",
    };
  }

  // Whitelist pattern: allow only alphanumeric characters, @, ., -, _
  // Reject unexpected token patterns before query construction
  const IDENTIFIER_WHITELIST = /^[a-zA-Z0-9@._-]+$/;
  if (!IDENTIFIER_WHITELIST.test(rawId)) {
    return {
      success: false,
      message: "Format identitas login mengandung karakter yang tidak diizinkan.",
    };
  }

  // Apply sanitizeSearchQuery() before any PostgREST filter construction
  const normalizedId = sanitizeSearchQuery(rawId).toLowerCase();
  const isRememberMe = Boolean(rememberMe);

  // 2. Require live Supabase Auth configuration (No local/demo fallback permitted)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseConfigured =
    Boolean(supabaseUrl) &&
    supabaseUrl !== "https://placeholder-project.supabase.co" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!isSupabaseConfigured) {
    return {
      success: false,
      message: "Layanan autentikasi database belum terkonfigurasi. Hubungi Administrator Sistem.",
    };
  }

  let authenticatedUser: UserProfile | null = null;

  try {
    const supabase = await createClient({ isPersistent: isRememberMe });
    const adminDb = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : null;

    // Resolve email using normalized identifier and administrative service-role client (never anonymous client)
    let resolvedEmail = normalizedId.includes("@")
      ? normalizedId
      : `${normalizedId}@smadap.sch.id`;
    let preAuthProfileRole: string | null = null;

    if (adminDb) {
      if (normalizedId.includes("@")) {
        // Normalize email lookup against profiles table if present
        const { data: emailProfile } = await adminDb
          .from("profiles")
          .select("email, role")
          .ilike("email", normalizedId)
          .maybeSingle();
        if (emailProfile?.email) {
          resolvedEmail = emailProfile.email.trim().toLowerCase();
        }
        if (emailProfile?.role) {
          preAuthProfileRole = emailProfile.role;
        }
      } else {
        // Pre-auth identifier resolution for non-email identifiers (NIP, NIS, NISN, or Admin username)
        let lookupEmail: string | undefined;

        const targetRole = normalizeRole(role);

        if (targetRole === "guru") {
          // Teacher: NIP -> teachers -> profile -> email
          const { data: teacherLookup } = await adminDb
            .from("teachers")
            .select("profile_id, profiles!inner(email, role)")
            .eq("nip", normalizedId)
            .maybeSingle();
          const joinedEmail = (teacherLookup as any)?.profiles?.email;
          const joinedRole = (teacherLookup as any)?.profiles?.role;
          if (joinedEmail && typeof joinedEmail === "string") {
            lookupEmail = joinedEmail.trim().toLowerCase();
          }
          if (joinedRole && typeof joinedRole === "string") {
            preAuthProfileRole = joinedRole;
          }
        } else if (targetRole === "siswa") {
          // Student: NIS / NISN -> students -> profile -> email
          const { data: studentLookup } = await adminDb
            .from("students")
            .select("profile_id, profiles!inner(email, role)")
            .or(`nis.eq.${normalizedId},nisn.eq.${normalizedId}`)
            .maybeSingle();
          const joinedEmail = (studentLookup as any)?.profiles?.email;
          const joinedRole = (studentLookup as any)?.profiles?.role;
          if (joinedEmail && typeof joinedEmail === "string") {
            lookupEmail = joinedEmail.trim().toLowerCase();
          }
          if (joinedRole && typeof joinedRole === "string") {
            preAuthProfileRole = joinedRole;
          }
        } else if (targetRole === "admin") {
          // Admin: configured admin username -> profile -> email
          const { data: adminLookup } = await adminDb
            .from("profiles")
            .select("email, role")
            .eq("role", "admin")
            .or(`full_name.ilike.${normalizedId},email.ilike.${normalizedId}@%`)
            .maybeSingle();
          if (adminLookup?.email) {
            lookupEmail = adminLookup.email.trim().toLowerCase();
          }
          if (adminLookup?.role) {
            preAuthProfileRole = adminLookup.role;
          }
        }

        // Cross-role fallback lookup so that if a Teacher enters NIP on Admin tab (or Student enters NISN on Teacher tab),
        // the identifier still resolves to their real account and triggers the explicit role-mismatch rejection.
        if (!lookupEmail) {
          const { data: anyTeacher } = await adminDb
            .from("teachers")
            .select("profile_id, profiles!inner(email, role)")
            .eq("nip", normalizedId)
            .maybeSingle();
          const tEmail = (anyTeacher as any)?.profiles?.email;
          const tRole = (anyTeacher as any)?.profiles?.role;
          if (tEmail && typeof tEmail === "string") {
            lookupEmail = tEmail.trim().toLowerCase();
          }
          if (tRole && typeof tRole === "string") {
            preAuthProfileRole = tRole;
          }
        }

        if (!lookupEmail) {
          const { data: anyStudent } = await adminDb
            .from("students")
            .select("profile_id, profiles!inner(email, role)")
            .or(`nis.eq.${normalizedId},nisn.eq.${normalizedId}`)
            .maybeSingle();
          const sEmail = (anyStudent as any)?.profiles?.email;
          const sRole = (anyStudent as any)?.profiles?.role;
          if (sEmail && typeof sEmail === "string") {
            lookupEmail = sEmail.trim().toLowerCase();
          }
          if (sRole && typeof sRole === "string") {
            preAuthProfileRole = sRole;
          }
        }

        if (lookupEmail) {
          resolvedEmail = lookupEmail;
        }
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password,
    });

    console.info("[AUTH_RUNTIME_TRACE]", {
      identifierReceived: (rawInput as any)?.identifier ?? identifier,
      normalizedIdentifier: normalizedId,
      resolvedEmail,
      selectedRole: role,
      profileRole: preAuthProfileRole,
      supabaseResponse: {
        hasUser: Boolean(data?.user),
        userId: data?.user?.id ?? null,
        userEmail: data?.user?.email ?? null,
        hasSession: Boolean(data?.session),
      },
      supabaseErrorCode: (error as any)?.code ?? null,
      supabaseErrorMessage: error?.message ?? null,
    });

    if (error || !data?.user) {
      return {
        success: false,
        message: "Email/identitas atau kata sandi tidak valid. Silakan periksa kembali kredensial Anda.",
      };
    }

    // 3. Resolve profile strictly from server-side database (`profiles` table)
    // FIX 2: If no active profile exists in public.profiles, do NOT create session,
    // do NOT fall back to metadata, and reject immediately with deactivation notice.
    const roleQueryClient = adminDb || supabase;
    let detectedRole: string | undefined;
    let resolvedFullName: string | undefined = data.user.user_metadata?.full_name;
    let profileExists = false;

    try {
      const { data: profile } = await roleQueryClient
        .from("profiles")
        .select("role, full_name")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profile) {
        profileExists = true;
        if (profile.role && isValidDatabaseRole(profile.role)) {
          detectedRole = profile.role;
        }
        if (profile.full_name) {
          resolvedFullName = profile.full_name;
        }
      }
    } catch {
      // Continue to verification
    }

    // Require active profile record in public.profiles.
    // If deleted/absent, revoke session immediately.
    if (!profileExists || !detectedRole) {
      try {
        await supabase.auth.signOut();
      } catch {
        // silent
      }
      const cookieStore = await cookies();
      cookieStore.delete(AUTH_COOKIE_NAME);
      return {
        success: false,
        message: ACCOUNT_DEACTIVATED_ERROR_MESSAGE,
      };
    }

    // Secondary authoritative check against `teachers` and `students` tables
    let teacherRecord: {
      id: string;
      nip: string | null;
      teacher_type: string | null;
      specialization: string | null;
      assigned_class: string | null;
      phone_number: string | null;
    } | null = null;

    let studentRecord: {
      nis: string | null;
      class_name: string | null;
    } | null = null;

    try {
      const { data: tRow, error: tErr } = await roleQueryClient
        .from("teachers")
        .select("id, nip, teacher_type, specialization, assigned_class, phone_number")
        .eq("profile_id", data.user.id)
        .maybeSingle();
      if (tRow) {
        teacherRecord = tRow;
        if (!detectedRole) {
          detectedRole = "teacher";
        }
      } else if (tErr) {
        const { data: fallbackTRow } = await roleQueryClient
          .from("teachers")
          .select("id, nip, specialization, assigned_class")
          .eq("profile_id", data.user.id)
          .maybeSingle();
        if (fallbackTRow) {
          teacherRecord = {
            ...fallbackTRow,
            teacher_type: fallbackTRow.specialization === "guru_bk" ? "counselor" : "teacher",
            phone_number: null,
          };
          if (!detectedRole) {
            detectedRole = "teacher";
          }
        }
      }
    } catch {
      // Optional teacher lookup
    }

    try {
      const { data: sRow } = await roleQueryClient
        .from("students")
        .select("nis, class_name")
        .eq("profile_id", data.user.id)
        .maybeSingle();
      if (sRow) {
        studentRecord = sRow;
        if (!detectedRole) {
          detectedRole = "student";
        }
      }
    } catch {
      // Optional student lookup
    }

    // If teacher role was detected, verify corresponding teacher record exists
    if (normalizeRole(detectedRole) === "guru" && !teacherRecord) {
      try {
        await supabase.auth.signOut();
      } catch {
        // silent
      }
      const cookieStore = await cookies();
      cookieStore.delete(AUTH_COOKIE_NAME);
      return {
        success: false,
        message: ACCOUNT_DEACTIVATED_ERROR_MESSAGE,
      };
    }

    // If student role was detected, verify corresponding student record exists
    if (normalizeRole(detectedRole) === "siswa" && !studentRecord) {
      try {
        await supabase.auth.signOut();
      } catch {
        // silent
      }
      const cookieStore = await cookies();
      cookieStore.delete(AUTH_COOKIE_NAME);
      return {
        success: false,
        message: ACCOUNT_DEACTIVATED_ERROR_MESSAGE,
      };
    }

    // Reject if user has no verified role in database
    if (!detectedRole || !isValidDatabaseRole(detectedRole)) {
      try {
        await supabase.auth.signOut();
      } catch {
        // silent
      }
      const cookieStore = await cookies();
      cookieStore.delete(AUTH_COOKIE_NAME);
      return {
        success: false,
        message: ROLE_MISMATCH_ERROR_MESSAGE,
      };
    }

    const normalizedUserRole = normalizeRole(detectedRole);
    const normalizedSelectedRole = normalizeRole(role);

    // Defense-in-depth: A user with a teacher or student record can NEVER assume 'admin' role
    if (normalizedUserRole === "admin" && (teacherRecord || studentRecord)) {
      try {
        await supabase.auth.signOut();
      } catch {
        // silent
      }
      const cookieStore = await cookies();
      cookieStore.delete(AUTH_COOKIE_NAME);
      return {
        success: false,
        message: ROLE_MISMATCH_ERROR_MESSAGE,
      };
    }

    // 4. Strict Role Enforcement: Selected login tab MUST match database role
    // Rules:
    // - role = admin -> Admin access allowed ONLY
    // - role = teacher / guru -> Teacher access ONLY
    // - role = student / siswa -> Student access ONLY
    if (!role || normalizedSelectedRole !== normalizedUserRole) {
      try {
        await supabase.auth.signOut();
      } catch {
        // silent
      }
      const cookieStore = await cookies();
      cookieStore.delete(AUTH_COOKIE_NAME);
      return {
        success: false,
        message: ROLE_MISMATCH_ERROR_MESSAGE,
      };
    }

    authenticatedUser = {
      id: data.user.id,
      email: data.user.email || resolvedEmail,
      fullName: resolvedFullName || data.user.email || "Pengguna",
      role: normalizedUserRole,
    };

    if (normalizedUserRole === "guru" && teacherRecord) {
      authenticatedUser.teacherId = teacherRecord.id;
      authenticatedUser.nip = teacherRecord.nip || undefined;
      authenticatedUser.teacherType = (teacherRecord.teacher_type as any) || "teacher";
      authenticatedUser.specialization = teacherRecord.specialization || undefined;
      authenticatedUser.assignedClass = teacherRecord.assigned_class || undefined;
      authenticatedUser.className = teacherRecord.assigned_class || undefined;
      authenticatedUser.phoneNumber = teacherRecord.phone_number || undefined;
    } else if (normalizedUserRole === "siswa" && studentRecord) {
      authenticatedUser.nis = studentRecord.nis || undefined;
      authenticatedUser.className = studentRecord.class_name || undefined;
    }
  } catch (err: unknown) {
    console.error("[signInAction] Unexpected verification error:", err);
    return {
      success: false,
      message: "Terjadi kesalahan saat memverifikasi akun. Silakan coba kembali.",
    };
  }

  if (!authenticatedUser) {
    return {
      success: false,
      message: "Otentikasi gagal. Silakan periksa kembali kredensial Anda.",
    };
  }

  // 5. Create and persist cryptographically signed (HMAC-SHA256) session cookie
  const sessionData: AuthSession = {
    user: authenticatedUser,
    token: `tok_${authenticatedUser.id}_${Date.now()}`,
    expiresAt: isRememberMe
      ? Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days persistent
      : Date.now() + 24 * 60 * 60 * 1000, // Session duration
    rememberMe: isRememberMe,
  };

  const cookieStore = await cookies();
  const cookieOptions: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "lax" | "strict" | "none";
    path: string;
    maxAge?: number;
    expires?: Date;
  } = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  // Only attach maxAge and expires if user explicitly requested persistent login ("Ingat Saya")
  if (isRememberMe) {
    cookieOptions.maxAge = 7 * 24 * 60 * 60; // 7 days
    cookieOptions.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const signedSessionToken = await signSessionCookie(sessionData);
  cookieStore.set(AUTH_COOKIE_NAME, signedSessionToken, cookieOptions);

  const targetPath = getRoleRedirectPath(authenticatedUser.role);

  return {
    success: true,
    message: `Selamat datang, ${authenticatedUser.fullName}! Mengalihkan ke dashboard...`,
    redirectTo: targetPath,
  };
}

/**
 * Server Action: Terminate active session and redirect to /login.
 */
export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies();

  // Supabase sign-out
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Silent catch
  }

  // Clear application cookie
  cookieStore.delete(AUTH_COOKIE_NAME);

  redirect("/login");
}

/**
 * Server Action / Query: Retrieve and cryptographically verify the currently authenticated session on server.
 * Rejects any unsigned or tampered cookies.
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  if (process.env.NODE_ENV !== "production" && (globalThis as any).__TEST_SESSION__) {
    return (globalThis as any).__TEST_SESSION__;
  }
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!sessionCookie) return null;

    return await verifySessionCookie(sessionCookie);
  } catch {
    return null;
  }
}

/**
 * Server Action: Request password reset email using Supabase Auth.
 */
export async function sendPasswordResetEmailAction(
  rawInput: unknown,
  redirectToUrl?: string
): Promise<{ success: boolean; message: string; errors?: Record<string, string[]> }> {
  const { forgotPasswordSchema } = await import("@/features/auth/schemas/passwordResetSchema");
  const validation = forgotPasswordSchema.safeParse(rawInput);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!errors[field]) errors[field] = [];
      errors[field].push(issue.message);
    }
    return {
      success: false,
      message: "Format email tidak valid. Silakan periksa kembali email Anda.",
      errors,
    };
  }

  const normalizedEmail = validation.data.email.trim().toLowerCase();

  try {
    const supabase = await createClient();
    const fallbackRedirect = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password`;
    const targetRedirect = redirectToUrl || fallbackRedirect;

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: targetRedirect,
    });

    if (error) {
      console.error("[sendPasswordResetEmailAction] Supabase reset error:", error);
      return {
        success: false,
        message: error.message || "Gagal mengirim link reset kata sandi. Silakan coba kembali.",
      };
    }

    return {
      success: true,
      message: "Link reset kata sandi telah dikirim ke email Anda.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem saat mengirim link reset.";
    return {
      success: false,
      message: msg,
    };
  }
}

/**
 * Server Action: Update user password on an active Supabase recovery session.
 */
export async function updatePasswordWithRecoverySessionAction(
  rawInput: unknown
): Promise<{ success: boolean; message: string; errors?: Record<string, string[]> }> {
  const { resetPasswordSchema } = await import("@/features/auth/schemas/passwordResetSchema");
  const validation = resetPasswordSchema.safeParse(rawInput);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const field = issue.path[0]?.toString() || "form";
      if (!errors[field]) errors[field] = [];
      errors[field].push(issue.message);
    }
    return {
      success: false,
      message: "Kata sandi tidak valid. Pastikan minimal 8 karakter dan konfirmasi cocok.",
      errors,
    };
  }

  const { password } = validation.data;

  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        message: "Sesi pemulihan tidak valid atau telah kadaluarsa. Silakan ajukan ulang link reset kata sandi.",
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return {
        success: false,
        message: updateError.message || "Gagal memperbarui kata sandi. Silakan coba lagi.",
      };
    }

    // Terminate session and clear any existing cookies to ensure clean login with new credentials
    try {
      await supabase.auth.signOut();
    } catch {
      // silent
    }
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);

    return {
      success: true,
      message: "Kata sandi berhasil diperbarui.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Terjadi kesalahan sistem saat menyimpan kata sandi baru.";
    return {
      success: false,
      message: msg,
    };
  }
}
