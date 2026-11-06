/**
 * Utilities for generating secure, mobile-friendly WhatsApp and telephone links
 * from stored teacher phone numbers.
 */

/**
 * Normalizes an Indonesian or international phone number into digits-only E.164
 * format required by `https://wa.me/{phone_number}` (e.g. `081234567890` -> `6281234567890`).
 */
export function normalizePhoneForWhatsApp(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return "";

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith("8")) {
    return `62${digits}`;
  }
  return digits;
}

/**
 * Generates a direct `https://wa.me/{phone_number}` URL from a stored phone number.
 */
export function generateWhatsAppLink(rawPhone: string, counselorName?: string): string {
  const normalized = normalizePhoneForWhatsApp(rawPhone);
  if (!normalized) return "#";

  const baseUrl = `https://wa.me/${normalized}`;
  if (!counselorName) {
    return baseUrl;
  }

  const greeting = encodeURIComponent(
    `Halo Bapak/Ibu ${counselorName} (Guru BK SMADAP), saya ingin berkonsultasi / menyampaikan laporan.`
  );
  return `${baseUrl}?text=${greeting}`;
}

/**
 * Generates a mobile-friendly `tel:` URI from a stored phone number.
 */
export function generateCallLink(rawPhone: string): string {
  const normalized = normalizePhoneForWhatsApp(rawPhone);
  if (!normalized) return "#";
  return `tel:+${normalized}`;
}

/**
 * Formats a stored phone number for readable UI display (e.g. `0812-3456-7890`).
 */
export function formatPhoneDisplay(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (!digits) return "-";

  const localDigits = digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
  if (localDigits.length >= 10) {
    return `${localDigits.slice(0, 4)}-${localDigits.slice(4, 8)}-${localDigits.slice(8)}`;
  }
  return rawPhone;
}
