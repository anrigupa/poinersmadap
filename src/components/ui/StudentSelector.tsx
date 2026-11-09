"use client";

import * as React from "react";
import { Check, ChevronsUpDown, User, Search } from "lucide-react";
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

export interface StudentOptionBase {
  id: string;
  fullName: string;
  nis?: string;
  nisn?: string;
  className?: string;
  totalViolationPoints?: number;
  totalMeritPoints?: number;
  availableMerits?: number;
  effectivePoints?: number;
  status?: string;
}

export interface StudentSelectorProps<T extends StudentOptionBase = StudentOptionBase> {
  students: T[];
  value?: string;
  onChange?: (studentId: string, student: T | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  disabled?: boolean;
  error?: boolean | string;
  className?: string;
  id?: string;
  name?: string;
  allowClear?: boolean;
}

/**
 * Multi-field search filter matching Student Name, NIS, NISN, or Class Name.
 * All whitespace-separated search terms must match any of the student's attributes.
 */
function studentSearchFilter(itemValue: string, search: string): number {
  const s = search.trim().toLowerCase();
  if (!s) return 1;

  const terms = s.split(/\s+/).filter(Boolean);
  const iv = itemValue.toLowerCase();

  // All typed terms must be present
  const allMatch = terms.every((term) => iv.includes(term));
  if (!allMatch) return 0;

  // Exact starts-with prefix bonus
  if (iv.startsWith(s)) return 1;
  return 0.85;
}

export default function StudentSelector<T extends StudentOptionBase = StudentOptionBase>({
  students = [],
  value,
  onChange,
  placeholder = "Pilih peserta didik...",
  searchPlaceholder = "Cari nama siswa, NIS, NISN, atau kelas...",
  disabled = false,
  error,
  className,
  id,
  name,
}: StudentSelectorProps<T>) {
  const [open, setOpen] = React.useState(false);

  // Selected student reference
  const selectedStudent = React.useMemo(() => {
    if (!value) return null;
    return students.find((s) => s.id === value) || null;
  }, [students, value]);

  const handleSelect = (studentId: string) => {
    const student = students.find((s) => s.id === studentId) || null;
    onChange?.(studentId, student);
    setOpen(false);
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
                selectedStudent
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-100 text-slate-400"
              )}
            >
              <User className="w-3.5 h-3.5" />
            </div>
            {selectedStudent ? (
              <div className="flex items-baseline gap-2 truncate">
                <span className="font-bold text-slate-900 truncate">
                  {selectedStudent.fullName}
                </span>
                <span className="text-[11px] text-slate-500 font-mono truncate">
                  (Kelas: {selectedStudent.className || "-"} • NIS: {selectedStudent.nis || "-"})
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
        className="w-[var(--radix-popover-trigger-width)] min-w-[280px] sm:min-w-[340px] max-w-[560px] p-0 shadow-xl border-slate-200 z-[60]"
      >
        <Command filter={studentSearchFilter} className="w-full">
          <CommandInput placeholder={searchPlaceholder} autoFocus />
          <CommandList className="max-h-72 overflow-y-auto p-1">
            <CommandEmpty className="py-6 text-center text-xs text-slate-500">
              <div className="flex flex-col items-center justify-center gap-1.5">
                <Search className="w-5 h-5 text-slate-300" />
                <span className="font-semibold text-slate-700">Peserta didik tidak ditemukan</span>
                <span className="text-[11px] text-slate-400">
                  Coba kata kunci lain (nama, NIS, NISN, atau kelas).
                </span>
              </div>
            </CommandEmpty>

            <CommandGroup heading={`Daftar Siswa (${students.length})`}>
              {students.map((student) => {
                const isSelected = student.id === value;
                // Composite searchable string containing full name, NIS, NISN, class name
                const searchString = `${student.fullName} ${student.nis || ""} ${
                  student.nisn || ""
                } ${student.className || ""}`;

                return (
                  <CommandItem
                    key={student.id}
                    value={searchString}
                    onSelect={() => handleSelect(student.id)}
                    className={cn(
                      "flex items-center justify-between p-2.5 cursor-pointer rounded-xl text-xs transition",
                      isSelected
                        ? "bg-blue-50 text-blue-900 font-semibold"
                        : "hover:bg-slate-50 text-slate-800"
                    )}
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold mt-0.5",
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {student.fullName
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {student.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5 font-sans">
                          <span className="font-mono">NIS: {student.nis || "-"}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-700">
                            Kelas: {student.className || "-"}
                          </span>
                          {student.nisn && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-400">
                                NISN: {student.nisn}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
