"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  BookOpen,
  Filter,
  CheckCircle2,
  ArrowUpDown,
  Layers,
  Sparkles,
} from "lucide-react";
import CategoryManagementBar from "@/features/rules/components/CategoryManagementBar";
import ViolationTable from "@/features/rules/components/ViolationTable";
import PaginationControls from "@/features/rules/components/PaginationControls";
import CategoryModal from "@/features/rules/components/CategoryModal";
import ViolationModal from "@/features/rules/components/ViolationModal";
import DeleteConfirmDialog from "@/features/rules/components/DeleteConfirmDialog";
import {
  ViolationCategory,
  ViolationItem,
  PaginatedResult,
} from "@/features/rules/types";
import {
  getViolationsAction,
  deleteCategoryAction,
  deleteViolationAction,
  getCategoriesAction,
} from "@/features/rules/actions";

interface ViolationManagementClientProps {
  initialCategories: ViolationCategory[];
  initialViolations: PaginatedResult<ViolationItem>;
}

export default function ViolationManagementClient({
  initialCategories,
  initialViolations,
}: ViolationManagementClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State
  const [categories, setCategories] = useState<ViolationCategory[]>(initialCategories);
  const [violationsResult, setViolationsResult] = useState<PaginatedResult<ViolationItem>>(initialViolations);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"code" | "name" | "points">("points");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast / Feedback message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Visibility State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<ViolationCategory | null>(null);

  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [violationToEdit, setViolationToEdit] = useState<ViolationItem | null>(null);

  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: "category" | "violation";
    targetId: string;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "violation",
    targetId: "",
    title: "",
    description: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch / Refresh Violations based on current filter state
  const reloadData = () => {
    startTransition(async () => {
      const [newViolations, newCategories] = await Promise.all([
        getViolationsAction({
          search: searchTerm,
          categoryId: selectedCategory === "all" ? undefined : selectedCategory,
          page: currentPage,
          pageSize,
          sortBy,
          sortOrder,
        }),
        getCategoriesAction(),
      ]);

      setViolationsResult(newViolations);
      setCategories(newCategories);
    });
  };

  useEffect(() => {
    reloadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, sortBy, sortOrder, currentPage, pageSize]);

  // Handle Category Modals
  const handleOpenCreateCategory = () => {
    setCategoryToEdit(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: ViolationCategory) => {
    setCategoryToEdit(cat);
    setIsCategoryModalOpen(true);
  };

  const handleRequestDeleteCategory = (cat: ViolationCategory) => {
    setDeleteDialog({
      isOpen: true,
      type: "category",
      targetId: cat.id,
      title: `Hapus Kategori "${cat.name}"?`,
      description:
        "Kategori hanya dapat dihapus jika tidak memiliki aturan pelanggaran yang berafiliasi dengannya.",
    });
  };

  // Handle Violation Modals
  const handleOpenCreateViolation = () => {
    setViolationToEdit(null);
    setIsViolationModalOpen(true);
  };

  const handleOpenEditViolation = (v: ViolationItem) => {
    setViolationToEdit(v);
    setIsViolationModalOpen(true);
  };

  const handleRequestDeleteViolation = (v: ViolationItem) => {
    setDeleteDialog({
      isOpen: true,
      type: "violation",
      targetId: v.id,
      title: `Hapus Aturan [${v.code}] "${v.name}"?`,
      description:
        "Aturan ini akan dihapus dari katalog tata tertib dan tidak lagi dapat dipilih dalam pelaporan baru.",
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.type === "category") {
      const res = await deleteCategoryAction(deleteDialog.targetId);
      if (res.success) {
        showToast(res.message);
        setSelectedCategory("all");
        reloadData();
      } else {
        alert(res.message);
      }
    } else {
      const res = await deleteViolationAction(deleteDialog.targetId);
      if (res.success) {
        showToast(res.message);
        reloadData();
      } else {
        alert(res.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Katalog Master Tata Tertib
            </span>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Buku Saku Resmi Sekolah</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Aturan & Kategori Pelanggaran
          </h1>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleOpenCreateViolation}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm shadow-blue-500/20 inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pelanggaran Baru</span>
        </button>
      </div>

      {/* Category Filter & Management Bar */}
      <CategoryManagementBar
        categories={categories}
        selectedCategoryId={selectedCategory}
        onSelectCategory={(id) => {
          setSelectedCategory(id);
          setCurrentPage(1);
        }}
        onOpenCreateModal={handleOpenCreateCategory}
        onOpenEditModal={handleOpenEditCategory}
        onRequestDeleteCategory={handleRequestDeleteCategory}
      />

      {/* Search & Sort Tool Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari berdasarkan nama pelanggaran, kode pasal, atau deskripsi..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Urutkan:</span>
          </span>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [f, o] = e.target.value.split("-") as [any, any];
              setSortBy(f);
              setSortOrder(o);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          >
            <option value="points-asc">Poin: Terendah ke Tertinggi</option>
            <option value="points-desc">Poin: Tertinggi ke Terendah</option>
            <option value="code-asc">Kode Pasal: A - Z</option>
            <option value="name-asc">Nama Pelanggaran: A - Z</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <ViolationTable
        items={violationsResult.items}
        onEdit={handleOpenEditViolation}
        onDelete={handleRequestDeleteViolation}
      />

      {/* Pagination Controls */}
      <PaginationControls
        page={violationsResult.page}
        pageSize={violationsResult.pageSize}
        totalItems={violationsResult.totalItems}
        totalPages={violationsResult.totalPages}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
      />

      {/* Modals */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={categoryToEdit}
        onSuccess={(msg) => {
          showToast(msg);
          reloadData();
        }}
      />

      <ViolationModal
        isOpen={isViolationModalOpen}
        onClose={() => setIsViolationModalOpen(false)}
        categories={categories}
        violationToEdit={violationToEdit}
        onSuccess={(msg) => {
          showToast(msg);
          reloadData();
        }}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        title={deleteDialog.title}
        description={deleteDialog.description}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
