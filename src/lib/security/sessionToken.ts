import { AuthSession } from "@/types/auth";
import { isValidDatabaseRole, normalizeRole } from "@/lib/constants/auth";

/**
 * Cryptographic Session Signing & Verification (HMAC-SHA256)
 * Uses Web Crypto API (crypto.subtle) for universal compatibility across
 * Next.js Edge Middleware and Node.js Server Actions / RSCs.
 *
 * Remediates CRITICAL-01: Prevents plaintext JSON cookie tampering and role escalation.
 */

function getSigningSecret(): string {
  const secret =
    process.env.AUTH_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (secret && secret.length >= 16) {
    return `smadap_poiner_hmac_v2:${secret}`;
  }

  return "smadap_poiner_hmac_v2:production_session_integrity_key_2026_sman2pangkep";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(base64Url: string): Uint8Array | null {
  try {
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + "=".repeat(padLength);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    return null;
  }
}

async function getHmacKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(getSigningSecret());
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Serializes and cryptographically signs an AuthSession payload using HMAC-SHA256.
 * Output format: `<base64url(payload)>.<base64url(hmac_sha256_signature)>`
 */
export async function signSessionCookie(session: AuthSession): Promise<string> {
  const encoder = new TextEncoder();
  const jsonString = JSON.stringify(session);
  const payloadBytes = encoder.encode(jsonString);
  const payloadB64 = toBase64Url(payloadBytes);

  const key = await getHmacKey();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );
  const signatureB64 = toBase64Url(new Uint8Array(signatureBuffer));

  return `${payloadB64}.${signatureB64}`;
}

/**
 * Verifies the cryptographic HMAC-SHA256 signature and expiration of a session cookie.
 * Immediately rejects unsigned plaintext JSON cookies or tampered payloads.
 */
export async function verifySessionCookie(
  rawCookieValue?: string | null
): Promise<AuthSession | null> {
  if (!rawCookieValue) return null;

  // Decode URI component if cookie was URL-encoded
  let token = rawCookieValue;
  try {
    token = decodeURIComponent(rawCookieValue);
  } catch {
    return null;
  }

  // Strictly require `<payloadB64>.<signatureB64>` format (rejects raw JSON cookies)
  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadB64, signatureB64] = parts;
  if (!payloadB64 || !signatureB64) {
    return null;
  }

  const signatureBytes = fromBase64Url(signatureB64);
  if (!signatureBytes) {
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const key = await getHmacKey();

    // Constant-time HMAC verification via Web Crypto API
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes.buffer.slice(
        signatureBytes.byteOffset,
        signatureBytes.byteOffset + signatureBytes.byteLength
      ) as ArrayBuffer,
      encoder.encode(payloadB64)
    );

    if (!isValid) {
      return null;
    }

    const payloadBytes = fromBase64Url(payloadB64);
    if (!payloadBytes) {
      return null;
    }

    const decoder = new TextDecoder();
    const parsed = JSON.parse(decoder.decode(payloadBytes));

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.user?.id ||
      typeof parsed.user.id !== "string" ||
      parsed.user.id.startsWith("usr-") ||
      !isValidDatabaseRole(parsed.user?.role)
    ) {
      return null;
    }

    // Enforce session expiration timestamp
    if (parsed.expiresAt && Number(parsed.expiresAt) < Date.now()) {
      return null;
    }

    return {
      ...parsed,
      user: {
        ...parsed.user,
        role: normalizeRole(parsed.user.role),
      },
    } as AuthSession;
  } catch {
    return null;
  }
}
