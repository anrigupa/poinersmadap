"use client";

import * as React from "react";
import { Check, ChevronsUpDown, ShieldAlert, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface ViolationOptionBase {
  id: string;
  name: string;
  categoryName: string;
  points: number;
  code?: string;
  description?: string;
  categoryColor?: string;
  isActive?: boolean;
}

export interface ViolationSelectorProps<T extends ViolationOptionBase = ViolationOptionBase> {
  rules: T[];
  value?: string;
  onChange?: (ruleId: string, rule: T | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean | string;
  className?: string;
  id?: string;
  name?: string;
  allowClear?: boolean;
  categoryFilter?: string;
  groupByCategory?: boolean;
}

/**
 * Multi-field search filter matching:
 * 1. Violation Name (e.g. "Datang Terlambat", "Tidak Memakai Seragam Lengkap")
 * 2. Violation Category (e.g. "Kehadiran", "Kedisiplinan", "Kerapian", "Pelanggaran Berat")
 * 3. Keywords, Code, or Description (e.g. "terlam", "K-01", "seragam", "rokok")
 *
 * All whitespace-separated terms must match anywhere in the item's composite value.
 */
function violationSearchFilter(itemValue: string, search: string): number {
  const s = search.trim().toLowerCase();
  if (!s) return 1;

  const terms = s.split(/\s+/).filter(Boolean);
  const iv = itemValue.toLowerCase();

  // Every typed term must match
  const allMatch = terms.every((term) => iv.includes(term));
  if (!allMatch) return 0;

  // Exact starts-with prefix bonus on the full search query
  if (iv.startsWith(s)) return 1;
  return 0.85;
}

export default function ViolationSelector<T extends ViolationOptionBase = ViolationOptionBase>({
  rules = [],
  value,
  onChange,
  placeholder = "Pilih jenis pelanggaran...",
  searchPlaceholder = "Cari jenis pelanggaran...",
  disabled = false,
  error,
  className,
  id,
  name,
  allowClear = false,
  categoryFilter,
  groupByCategory = false,
}: ViolationSelectorProps<T>) {
  const [open, setOpen] = React.useState(false);

  // Active rules (filter out inactive rules if specified)
  const activeRules = React.useMemo(() => {
    let list = rules.filter((r) => r.isActive !== false);
    if (categoryFilter && categoryFilter !== "all") {
      list = list.filter((r) => r.categoryName.toLowerCase() === categoryFilter.toLowerCase());
    }
    return list;
  }, [rules, categoryFilter]);

  // Selected rule reference
  const selectedRule = React.useMemo(() => {
    if (!value) return null;
    return rules.find((r) => r.id === value) || null;
  }, [rules, value]);

  const handleSelect = (ruleId: string) => {
    if (allowClear && ruleId === value) {
      onChange?.("", null);
      setOpen(false);
      return;
    }
    const found = rules.find((r) => r.id === ruleId) || null;
    onChange?.(ruleId, found);
    setOpen(false);
  };

  // Unique categories for optional grouping
  const groupedRules = React.useMemo(() => {
    if (!groupByCategory) return null;
    const groups: Record<string, T[]> = {};
    for (const rule of activeRules) {
      const cat = rule.categoryName || "Lainnya";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(rule);
    }
    return groups;
  }, [activeRules, groupByCategory]);

  const renderRuleItem = (rule: T) => {
    const isSelected = rule.id === value;
    // Composite searchable string: Name + Category + Code + Description
    const searchString = `${rule.name} ${rule.categoryName} ${rule.code || ""} ${
      rule.description || ""
    }`.toLowerCase();

    return (
      <CommandItem
        key={rule.id}
        value={searchString}
        onSelect={() => handleSelect(rule.id)}
        className={cn(
          "flex items-center justify-between p-2.5 cursor-pointer rounded-xl text-xs transition",
          isSelected
            ? "bg-blue-50 text-blue-900 font-semibold"
            : "hover:bg-slate-50 text-slate-800"
        )}
      >
        <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
          <div
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 transition",
              isSelected
                ? "bg-blue-600 text-white"
                : rule.points >= 25
                ? "bg-rose-100 text-rose-700"
                : rule.points >= 15
                ? "bg-amber-100 text-amber-800"
                : "bg-blue-100 text-blue-700"
            )}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>

          <div className="min-w-0 flex-1">
            {/* 1. Violation Name */}
            <div className="font-bold text-slate-900 truncate">
              {rule.name}
            </div>

            {/* 2. Category • Point Value */}
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span className="font-medium text-slate-700">{rule.categoryName}</span>
              <span>•</span>
              <span className="font-semibold text-rose-600">{rule.points} poin</span>
              {rule.code && (
                <>
                  <span>•</span>
                  <span className="font-mono text-slate-400">[{rule.code}]</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Point Badge and Selected Check */}
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-md border",
              rule.points >= 25
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : rule.points >= 15
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            )}
          >
            +{rule.points} Poin
          </span>
          {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
        </div>
      </CommandItem>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          name={name}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className={cn(
            "w-full px-3.5 py-2.5 text-xs rounded-xl border bg-white flex items-center justify-between text-left transition shadow-2xs outline-none",
            "hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
            error
              ? "border-rose-400 bg-rose-50/20 text-rose-950 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-200 text-slate-800",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50",
            className
          )}
        >
          <div className="flex items-center gap-2.5 truncate pr-2">
            <div
              className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition",
                selectedRule
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-400"
              )}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>

            {selectedRule ? (
              <div className="flex items-baseline gap-2 truncate">
                <span className="font-bold text-slate-900 truncate">
                  {selectedRule.name}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  ({selectedRule.categoryName} • {selectedRule.points} poin)
                </span>
              </div>
            ) : (
              <span className="text-slate-400 font-medium">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="w-4 h-4 shrink-0 text-slate-400 opacity-80" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] min-w-[300px] sm:min-w-[420px] max-w-[620px] p-0 shadow-xl border-slate-200 z-[60]"
      >
        <Command filter={violationSearchFilter} className="w-full">
          <CommandInput placeholder={searchPlaceholder} autoFocus />
          <CommandList className="max-h-72 overflow-y-auto p-1">
            <CommandEmpty className="py-6 text-center text-xs text-slate-500">
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Search className="w-5 h-5 text-slate-300" />
                <span className="font-semibold text-slate-700">Pelanggaran tidak ditemukan</span>
                <span className="text-[11px] text-slate-400">
                  Coba kata kunci lain (contoh: terlambat, seragam, upacara, rokok).
                </span>
              </div>
            </CommandEmpty>

            {groupedRules ? (
              Object.entries(groupedRules).map(([catName, items]) => (
                <CommandGroup key={catName} heading={`${catName} (${items.length})`}>
                  {items.map(renderRuleItem)}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup heading={`Daftar Pelanggaran (${activeRules.length})`}>
                {activeRules.map(renderRuleItem)}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
