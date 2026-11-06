/**
 * Date and Time utilities for POINER SMADAP
 * Official school operations: SMAN 2 Pangkep, Sulawesi Selatan (WITA / UTC+8 / Asia/Makassar)
 */

export type ViolationDateRange = "all" | "today" | "this_week" | "this_month";

export interface DateBounds {
  startDate: Date;
  endDate: Date;
  startIso: string;
  endIso: string;
}

export const PERIOD_LABELS: Record<ViolationDateRange, string> = {
  all: "Semua Waktu",
  today: "Hari Ini",
  this_week: "Minggu Ini",
  this_month: "Bulan Ini",
};

/**
 * Calculates start and end ISO and Date boundaries in Asia/Makassar (WITA, UTC+8).
 * - "today": 00:00:00.000 WITA to 23:59:59.999 WITA
 * - "this_week": Monday (Senin) 00:00:00.000 WITA to Sunday (Minggu) 23:59:59.999 WITA
 * - "this_month": Day 1 00:00:00.000 WITA to last day of current month 23:59:59.999 WITA
 */
export function getMakassarDateBounds(
  range: ViolationDateRange,
  refDate: Date = new Date()
): DateBounds | null {
  if (range === "all") return null;

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(refDate);

  const getPart = (type: string) => parts.find((p) => p.type === type)?.value;
  const year = parseInt(getPart("year")!, 10);
  const month = parseInt(getPart("month")!, 10) - 1; // 0-indexed for UTC constructors
  const day = parseInt(getPart("day")!, 10);

  const localDate = new Date(Date.UTC(year, month, day));
  const OFFSET_MS = 8 * 3600 * 1000; // WITA is UTC+8

  if (range === "today") {
    const startUtc = Date.UTC(year, month, day, 0, 0, 0, 0) - OFFSET_MS;
    const endUtc = Date.UTC(year, month, day, 23, 59, 59, 999) - OFFSET_MS;
    return {
      startDate: new Date(startUtc),
      endDate: new Date(endUtc),
      startIso: new Date(startUtc).toISOString(),
      endIso: new Date(endUtc).toISOString(),
    };
  }

  if (range === "this_week") {
    // Indonesian school week starts Monday (Senin)
    const dayOfWeek = localDate.getUTCDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const mondayUtc = Date.UTC(year, month, day + diffToMonday, 0, 0, 0, 0) - OFFSET_MS;
    const sundayUtc = Date.UTC(year, month, day + diffToMonday + 6, 23, 59, 59, 999) - OFFSET_MS;
    return {
      startDate: new Date(mondayUtc),
      endDate: new Date(sundayUtc),
      startIso: new Date(mondayUtc).toISOString(),
      endIso: new Date(sundayUtc).toISOString(),
    };
  }

  if (range === "this_month") {
    // 1st of month 00:00:00 WITA to last day of month 23:59:59.999 WITA
    const firstDayUtc = Date.UTC(year, month, 1, 0, 0, 0, 0) - OFFSET_MS;
    const lastDayUtc = Date.UTC(year, month + 1, 0, 23, 59, 59, 999) - OFFSET_MS;
    return {
      startDate: new Date(firstDayUtc),
      endDate: new Date(lastDayUtc),
      startIso: new Date(firstDayUtc).toISOString(),
      endIso: new Date(lastDayUtc).toISOString(),
    };
  }

  return null;
}

/**
 * Checks whether a given timestamp falls within the specified Makassar date range.
 */
export function isDateWithinMakassarRange(
  dateIsoOrString: string,
  range: ViolationDateRange,
  refDate: Date = new Date()
): boolean {
  if (range === "all") return true;
  const bounds = getMakassarDateBounds(range, refDate);
  if (!bounds) return true;

  const t = new Date(dateIsoOrString).getTime();
  if (isNaN(t)) return false;

  return t >= bounds.startDate.getTime() && t <= bounds.endDate.getTime();
}

/**
 * Formats an ISO string into standard Indonesian date format in Asia/Makassar (WITA).
 */
export function formatMakassarDate(dateIsoOrString: string): string {
  try {
    const d = new Date(dateIsoOrString);
    if (isNaN(d.getTime())) return dateIsoOrString;

    return (
      new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Makassar",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d) + " WITA"
    );
  } catch {
    return dateIsoOrString;
  }
}
