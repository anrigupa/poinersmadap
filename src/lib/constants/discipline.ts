/**
 * SMADAP POINER - Disciplinary Configuration & Threshold Constants
 * Single source of truth for violation point calculations and sanction escalations.
 */

export interface SanctionLevelConfig {
  level: "Aman" | "SP1" | "SP2" | "SP3 (Kepala Sekolah)";
  minPoints: number;
  maxPoints: number;
  badgeClass: string;
  badgeColor: "emerald" | "amber" | "orange" | "rose";
  authority: string;
  actionRequired: string;
}

export const DISCIPLINE_THRESHOLDS: Record<string, SanctionLevelConfig> = {
  AMAN: {
    level: "Aman",
    minPoints: 0,
    maxPoints: 35,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badgeColor: "emerald",
    authority: "Wali Kelas",
    actionRequired: "Disiplin normal, pertahankan budi pekerti baik.",
  },
  SP1: {
    level: "SP1",
    minPoints: 36,
    maxPoints: 75,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    badgeColor: "amber",
    authority: "Wali Kelas & Guru BK",
    actionRequired: "Surat Peringatan 1 (SP1). Bimbingan kedisiplinan wali kelas.",
  },
  SP2: {
    level: "SP2",
    minPoints: 76,
    maxPoints: 150,
    badgeClass: "bg-orange-50 text-orange-700 border-orange-200",
    badgeColor: "orange",
    authority: "Guru BK & Kesiswaan",
    actionRequired: "Surat Peringatan 2 (SP2). Pemanggilan orang tua ke ruang BK.",
  },
  SP3: {
    level: "SP3 (Kepala Sekolah)",
    minPoints: 151,
    maxPoints: Infinity,
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
    badgeColor: "rose",
    authority: "Kepala Sekolah & Dewan Guru",
    actionRequired: "Surat Peringatan 3 (SP3). Konferensi kasus khusus & evaluasi skorsing.",
  },
};

export function getDisciplinaryLevel(points: number): SanctionLevelConfig {
  if (points <= 35) return DISCIPLINE_THRESHOLDS.AMAN;
  if (points <= 75) return DISCIPLINE_THRESHOLDS.SP1;
  if (points <= 150) return DISCIPLINE_THRESHOLDS.SP2;
  return DISCIPLINE_THRESHOLDS.SP3;
}
