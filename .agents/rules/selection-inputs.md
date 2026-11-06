---
trigger: always_on
description: Permanent rule mandating Popover + Command pattern for selection inputs with more than 10 options across students, teachers, classes, violations, and counseling records.
---

## Selection Inputs Standard: Popover + Command Mandate

### 1. Mandatory Rule
All future selection inputs, dropdowns, and form comboboxes with **more than 10 options** MUST use the **Popover + Command (`cmdk`)** pattern instead of native HTML `<select>`.

Native HTML `<select>` elements are strictly prohibited for large option sets (>10 options) due to OS-level combobox glitches (e.g. premature close on mouse release / press-drag-release behavior), lack of live search, and poor mobile/cross-platform accessibility.

### 2. Applicable Modules & Entities
This convention applies across all SMADAP POINER modules, specifically:
1. **Students (`students`)**:
   - Student selectors in violation reporting, counseling forms, parent notifications, and student filters.
2. **Teachers (`teachers`)**:
   - Teacher selectors in counselor assigning, piket shifts, report recorders, and homeroom (wali kelas) assignments.
3. **Classes (`classes`)**:
   - Class selectors ([`ClassSelector`](file:///home/anrigupa/Desktop/poiner/src/components/ui/ClassSelector.tsx)) across Student Management, Kelas Binaan, Wali Kelas, search filters, and export filters.
4. **Violations (`violations`)**:
   - Rule / violation selectors in student violation recording, teacher logging, and category filters.
5. **Counseling Records (`counseling records`)**:
   - Student, counselor, action type, and follow-up category selectors in counseling & pemutihan modules.

### 3. Implementation Requirements
- **Primitif Stack**:
  - `Popover`, `PopoverTrigger`, `PopoverContent` from [`src/components/ui/popover.tsx`](file:///home/anrigupa/Desktop/poiner/src/components/ui/popover.tsx) (using `@radix-ui/react-popover` with portal `z-[60]`).
  - `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem` from [`src/components/ui/command.tsx`](file:///home/anrigupa/Desktop/poiner/src/components/ui/command.tsx) (using `cmdk`).
- **Interaction Contract**:
  - Click once to open.
  - Click once to select and automatically close.
  - Live instant text search with responsive filtering.
  - Full keyboard accessibility: Arrow keys (↑/↓), Enter to select, ESC to dismiss.
  - Click-outside dismiss via Radix Popover.
  - Display selected option clearly in trigger button with appropriate icon.
- **Form Integration**:
  - Seamlessly bound to `react-hook-form` via controlled `value` and `onChange` (or `setValue(name, val, { shouldValidate: true })`).
  - Integrated with `zod` schemas.
- **Small Selects Exception**:
  - Native HTML `<select>` is permitted ONLY for small, fixed, static options with ≤ 5 options (e.g. Gender `L`/`P`, Status `active`/`inactive`, Sort Order `asc`/`desc`).
