import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import { AuthSession, UserRole, UserProfile } from "@/types/auth";
import { ROLE_REDIRECT_MAP } from "@/lib/constants/auth";

export class SecurityError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = "SecurityError";
    this.statusCode = statusCode;
  }
}

/**
 * Page-Level Route Guard: Require Active Authentication
 * Used in React Server Components for defense-in-depth behind middleware
 */
export async function requireAuth(callbackUrl?: string): Promise<AuthSession> {
  const session = await getCurrentSession();
  if (!session) {
    const target = callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login";
    redirect(target);
  }
  return session;
}

/**
 * Page-Level Route Guard: Require Specific Role(s)
 * Automatically redirects to the user's role-appropriate home if forbidden
 */
export async function requireRole(
  allowedRoles: UserRole[],
  currentPath?: string
): Promise<AuthSession> {
  const session = await requireAuth(currentPath);
  const userRole = session.user.role;

  if (!allowedRoles.includes(userRole)) {
    // Redirect unauthorized user to their proper portal
    const properTarget = ROLE_REDIRECT_MAP[userRole] || "/login";
    redirect(properTarget);
  }

  return session;
}

/**
 * Server Action Guard: Assert Authenticated Session
 */
export function assertAuthenticated(session: AuthSession | null): asserts session is AuthSession {
  if (!session) {
    throw new SecurityError("Akses ditolak: Anda harus login untuk melakukan tindakan ini.", 401);
  }
}

/**
 * Server Action Guard: Assert Role Permission
 */
export function assertRole(
  session: AuthSession | null,
  allowedRoles: UserRole[],
  actionDescription = "tindakan ini"
): asserts session is AuthSession {
  assertAuthenticated(session);
  if (!allowedRoles.includes(session.user.role)) {
    throw new SecurityError(
      `Akses dibatasi: Peran '${session.user.role}' tidak memiliki izin untuk ${actionDescription}.`,
      403
    );
  }
}

/**
 * Server Action Guard: Assert Student Personal Data Ownership
 * Enforces that a student can only read/access their own profile and incidents
 */
export function assertPersonalStudentAccess(
  session: AuthSession,
  targetStudentProfileId?: string,
  targetStudentNis?: string
): void {
  // Admin has full access
  if (session.user.role === "admin") return;

  // Teachers can view students for violation recording and counseling
  if (session.user.role === "guru") return;

  // Student role MUST strictly match own profile ID or NIS
  if (session.user.role === "siswa") {
    const isOwner =
      (targetStudentProfileId && targetStudentProfileId === session.user.id) ||
      (targetStudentNis && targetStudentNis === session.user.nis);

    if (!isOwner) {
      throw new SecurityError(
        "Pelanggaran Keamanan: Anda hanya diperbolehkan mengakses data kedisiplinan Anda sendiri.",
        403
      );
    }
  }
}

/**
 * Server Action Guard: Assert Teacher Personal Submissions Ownership
 * Enforces that a teacher can only view their own reported submissions
 */
export function assertPersonalTeacherAccess(
  session: AuthSession,
  targetTeacherProfileId: string
): void {
  // Admin has full audit access
  if (session.user.role === "admin") return;

  // Teacher role MUST strictly match own profile ID
  if (session.user.role === "guru") {
    if (session.user.id !== targetTeacherProfileId) {
      throw new SecurityError(
        "Pelanggaran Keamanan: Anda hanya diperbolehkan melihat arsip laporan yang Anda input sendiri.",
        403
      );
    }
  }
}

/**
 * Sanitizes search queries to protect against wildcard abuse or injection
 */
export function sanitizeSearchQuery(query?: string): string {
  if (!query) return "";
  return query
    .trim()
    .replace(/[<>'"%_]/g, "")
    .slice(0, 100);
}
