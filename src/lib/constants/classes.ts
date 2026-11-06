/**
 * Predefined student classes for SMAN 2 Pangkep (SMADAP POINER)
 * Standardized Kurikulum Merdeka structure:
 * - Kelas X: X.A through X.I
 * - Kelas XI: XI.A through XI.I
 * - Kelas XII: XII.A through XII.I
 */

export const AVAILABLE_CLASSES_X = [
  "X.A",
  "X.B",
  "X.C",
  "X.D",
  "X.E",
  "X.F",
  "X.G",
  "X.H",
  "X.I",
] as const;

export const AVAILABLE_CLASSES_XI = [
  "XI.A",
  "XI.B",
  "XI.C",
  "XI.D",
  "XI.E",
  "XI.F",
  "XI.G",
  "XI.H",
  "XI.I",
] as const;

export const AVAILABLE_CLASSES_XII = [
  "XII.A",
  "XII.B",
  "XII.C",
  "XII.D",
  "XII.E",
  "XII.F",
  "XII.G",
  "XII.H",
  "XII.I",
] as const;

export const ALL_AVAILABLE_CLASSES = [
  ...AVAILABLE_CLASSES_X,
  ...AVAILABLE_CLASSES_XI,
  ...AVAILABLE_CLASSES_XII,
] as const;

export type AvailableClass = (typeof ALL_AVAILABLE_CLASSES)[number];

export const CLASS_GROUPS = [
  { label: "Kelas X", classes: AVAILABLE_CLASSES_X },
  { label: "Kelas XI", classes: AVAILABLE_CLASSES_XI },
  { label: "Kelas XII", classes: AVAILABLE_CLASSES_XII },
] as const;
