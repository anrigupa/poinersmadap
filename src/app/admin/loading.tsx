export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4 w-56 bg-slate-200 dark:bg-slate-800 rounded-full" />
            <div className="h-7 w-80 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
          <div className="flex gap-2.5">
            <div className="h-9 w-44 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>

        {/* 4 KPI Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
              </div>
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-3 w-40 bg-slate-100 dark:bg-slate-800/70 rounded" />
            </div>
          ))}
        </div>

        {/* Charts Row 1 Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
          <div className="lg:col-span-5 h-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
        </div>

        {/* Charts Row 2 Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
          <div className="lg:col-span-6 h-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800" />
        </div>
      </div>
    </div>
  );
}
