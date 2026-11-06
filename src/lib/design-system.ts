/**
 * POINER SMADAP Global UI Design System Tokens & Classes
 * Enforces WCAG AA contrast compliance, standardized typography,
 * consistent spacing, solid card hierarchies, high-contrast badges, and uniform data tables.
 */

export const typography = {
  // Page Titles: Large size, High contrast, Font weight: bold, Color: slate-900
  pageTitle: "text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight",
  pageHeaderDescription: "text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-3xl",

  // Section Titles: Medium size, Font weight: semibold, Color: slate-800
  sectionTitle: "text-lg font-semibold text-slate-800 tracking-tight",
  sectionTitleSmall: "text-base font-semibold text-slate-800 tracking-tight",
  
  // Section Descriptions: Color: slate-500, One short supporting sentence
  sectionDescription: "text-xs sm:text-sm text-slate-500 mt-1 leading-normal",

  // Body text: Color: slate-700
  body: "text-sm text-slate-700 leading-relaxed",
  bodySmall: "text-xs text-slate-700 leading-relaxed",

  // Metadata: Color: slate-600
  metadata: "text-xs font-medium text-slate-600",
  metadataMuted: "text-xs text-slate-500",

  // Muted Content: text-slate-400
  muted: "text-xs text-slate-400",
};

export const spacing = {
  // Between sections: 32px minimum (space-y-8 / gap-8)
  sectionSpacing: "space-y-8",
  sectionMargin: "my-8",
  sectionPadding: "py-8",

  // Between cards: 16px minimum (gap-4 / gap-6)
  cardGrid: "grid gap-4 sm:gap-6",
  cardGrid2: "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6",
  cardGrid3: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
  cardGrid4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",

  // Between title and description: 8px (mt-2 / gap-2)
  titleToDescription: "mt-2",

  // Between section title and content: 16px (mt-4)
  sectionToContent: "mt-4",
};

export const cards = {
  // Base Card: Solid background, subtle border, gentle shadow
  base: "bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 transition-all",
  interactive: "bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-6 hover:shadow-md hover:border-blue-400 transition-all cursor-pointer",
  
  // Statistics Cards: Value -> Label -> Description hierarchy
  statCard: "bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between",
  statValue: "text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-mono",
  statLabel: "text-sm font-semibold text-slate-800 mt-2",
  statDescription: "text-xs text-slate-500 mt-1",
};

export const badges = {
  // High-contrast, WCAG AA compliant badges
  success: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300",
  warning: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-950 border border-amber-300",
  danger: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-950 border border-rose-300",
  info: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-950 border border-blue-300",
  neutral: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300",
  
  // Compact variants
  compactSuccess: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300",
  compactWarning: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-950 border border-amber-300",
  compactDanger: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-950 border border-rose-300",
  compactInfo: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-950 border border-blue-300",
  compactNeutral: "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-300",
};

export const tables = {
  container: "bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden",
  table: "w-full text-left border-collapse",
  // High visibility table header
  thead: "bg-slate-50 border-b border-slate-200",
  th: "py-3.5 px-4 sm:px-6 text-xs font-bold text-slate-700 uppercase tracking-wider",
  thRight: "py-3.5 px-4 sm:px-6 text-xs font-bold text-slate-700 uppercase tracking-wider text-right",
  tbody: "divide-y divide-slate-100 text-sm text-slate-700",
  row: "hover:bg-slate-50/75 transition-colors",
  td: "py-4 px-4 sm:px-6 text-sm text-slate-700",
  tdRight: "py-4 px-4 sm:px-6 text-sm text-slate-700 text-right",
};

export const hero = {
  // Solid, high-contrast banner with minimal transparency and zero washed-out text
  banner: "bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden",
  title: "text-2xl sm:text-3xl font-extrabold text-white tracking-tight",
  subtitle: "text-xs sm:text-sm text-blue-100 leading-relaxed mt-2 max-w-2xl",
  badge: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-900/60 text-blue-100 border border-blue-400/40",
};

/**
 * Permanent rule: Selection inputs with >10 options MUST use Popover + Command pattern
 * Applicable domains: students, teachers, classes, violations, counseling records.
 */
export const selectionInputsRule = {
  maxNativeOptionsThreshold: 10,
  pattern: "Popover + Command",
  primitives: ["Popover", "PopoverTrigger", "PopoverContent", "Command", "CommandInput", "CommandList", "CommandItem"],
  domains: ["students", "teachers", "classes", "violations", "counseling records"] as const,
};

