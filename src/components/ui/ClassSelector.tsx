"use client";

import * as React from "react";
import { Check, ChevronsUpDown, GraduationCap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CLASS_GROUPS, ALL_AVAILABLE_CLASSES } from "@/lib/constants/classes";
import { cn } from "@/lib/utils";

export interface ClassSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: boolean | string;
  className?: string;
  id?: string;
  name?: string;
  /**
   * For editing records with historical/legacy class formats (e.g. old non-Kurikulum Merdeka)
   */
  legacyValue?: string | null;
  /**
   * Allows selecting "all" option when reused inside search/filter toolbars
   */
  allowAll?: boolean;
  allLabel?: string;
}

/**
 * Intelligent filter matching Kurikulum Merdeka class naming patterns:
 * - "XI" -> matches all XI.A - XI.I
 * - "I" -> prioritizes section I (X.I, XI.I, XII.I)
 * - "X.A" -> exact class matches
 */
function classSearchFilter(value: string, search: string): number {
  const s = search.trim().toUpperCase();
  const v = value.toUpperCase();
  if (!s) return 1;

  // Exact match gets highest score
  if (v === s) return 1;

  // If user searches by single section letter (A through I)
  if (s.length === 1 && /^[A-I]$/.test(s)) {
    const parts = v.split(".");
    if (parts[1] === s) return 0.95;
    if (v.includes(s)) return 0.3;
    return 0;
  }

  // If user searches by grade level (X, XI, XII)
  if (s === "X" || s === "XI" || s === "XII") {
    const parts = v.split(".");
    if (parts[0] === s) return 0.9;
    return 0;
  }

  // Prefix match (e.g. "XI." or "XI")
  if (v.startsWith(s)) return 0.9;

  // Substring match
  if (v.includes(s)) return 0.5;

  return 0;
}

export default function ClassSelector({
  value,
  onChange,
  placeholder = "Pilih kelas...",
  searchPlaceholder = "Cari kelas...",
  disabled = false,
  error,
  className,
  id,
  name,
  legacyValue,
  allowAll = false,
  allLabel = "Semua Kelas",
}: ClassSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const isLegacy =
    Boolean(legacyValue) &&
    !ALL_AVAILABLE_CLASSES.includes(legacyValue as any) &&
    value === legacyValue;

  const handleSelect = (selectedValue: string) => {
    onChange?.(selectedValue);
    setOpen(false);
  };

  // Determine display label for trigger
  const displayLabel = React.useMemo(() => {
    if (allowAll && value === "all") {
      return allLabel;
    }
    if (value) {
      return value;
    }
    return null;
  }, [value, allowAll, allLabel]);

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
            "w-full px-3 py-2 text-xs rounded-xl border bg-white flex items-center justify-between text-left transition shadow-2xs outline-none",
            "hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20",
            error
              ? "border-rose-400 bg-rose-50/20 text-rose-950 focus:border-rose-500 focus:ring-rose-500/20"
              : "border-slate-200 text-slate-800",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50",
            className
          )}
        >
          <div className="flex items-center gap-2 truncate pr-2">
            <GraduationCap
              className={cn(
                "w-4 h-4 shrink-0",
                displayLabel ? "text-blue-600" : "text-slate-400"
              )}
            />
            {displayLabel ? (
              <span className="font-semibold text-slate-900 font-mono tracking-tight">
                {displayLabel}
                {isLegacy && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-md bg-amber-100 text-amber-900 border border-amber-300 font-sans font-medium">
                    Format Lama
                  </span>
                )}
              </span>
            ) : (
              <span className="text-slate-400">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="w-4 h-4 shrink-0 text-slate-400 opacity-80" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] min-w-[260px] p-0 shadow-xl border-slate-200"
      >
        <Command filter={classSearchFilter} className="w-full">
          <CommandInput placeholder={searchPlaceholder} autoFocus />
          <CommandList className="max-h-64 overflow-y-auto">
            <CommandEmpty className="py-5 text-center text-xs text-slate-500">
              Kelas tidak ditemukan.
            </CommandEmpty>

            {/* Legacy Format Notice (Disabled Option) */}
            {isLegacy && legacyValue && (
              <CommandGroup heading="Format Lama">
                <CommandItem
                  value={legacyValue}
                  disabled
                  className="opacity-60 text-slate-400 cursor-not-allowed"
                >
                  <span className="font-mono text-xs line-through">{legacyValue}</span>
                  <span className="text-[10px] text-amber-600 ml-2">
                    (Format Lama - Pilih kelas Kurikulum Merdeka resmi)
                  </span>
                </CommandItem>
              </CommandGroup>
            )}

            {/* Optional All Filter */}
            {allowAll && (
              <CommandGroup heading="Umum">
                <CommandItem
                  value="all"
                  onSelect={() => handleSelect("all")}
                  className="flex items-center justify-between cursor-pointer px-2.5 py-2 text-xs"
                >
                  <span className="font-medium text-slate-800">{allLabel}</span>
                  {value === "all" && <Check className="w-4 h-4 text-blue-600" />}
                </CommandItem>
              </CommandGroup>
            )}

            {/* Kurikulum Merdeka Predefined Classes */}
            {CLASS_GROUPS.map((group) => (
              <CommandGroup key={group.label} heading={group.label}>
                {group.classes.map((cls) => {
                  const isSelected = value === cls;
                  return (
                    <CommandItem
                      key={cls}
                      value={cls}
                      onSelect={() => handleSelect(cls)}
                      className={cn(
                        "flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                        isSelected
                          ? "bg-blue-50/80 font-bold text-blue-700"
                          : "text-slate-700 hover:bg-slate-50 font-medium"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold tracking-tight">{cls}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({group.label})
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
