export default function AdminSettingsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-7 w-72 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="h-9 w-52 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Active Banner Skeleton */}
        <div className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl" />

        {/* Form & Registry Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
          <div className="lg:col-span-5 h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
        </div>
      </div>
    </div>
  );
}
