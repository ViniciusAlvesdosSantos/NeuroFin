import { Skeleton } from '@/components/ui/skeleton';

/** Dashboard Skeleton - mimics the KPI cards + transactions layout */
export function DashboardSkeleton() {
  return (
    <div className="animate-fade-in-up">
      {/* Account Tabs Skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="skeleton-line h-10 w-36" />
        <div className="skeleton-line h-10 w-28" />
        <div className="skeleton-line h-10 w-28" />
      </div>

      {/* Safe to Spend Hero Skeleton */}
      <div className="mb-6">
        <div className="skeleton-line h-48 w-full rounded-2xl" />
      </div>

      {/* Insight Banner Skeleton */}
      <div className="mb-4">
        <div className="skeleton-line h-20 w-full rounded-xl" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3 flex-1">
                <div className="skeleton-line h-3 w-24" />
                <div className="skeleton-line h-7 w-32" />
                <div className="skeleton-line h-2.5 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
          </div>
        ))}
      </div>

      {/* Content Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transactions Skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="skeleton-line h-5 w-40" />
            <div className="skeleton-line h-8 w-28 rounded-lg" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3">
                <div className="space-y-2 flex-1">
                  <div className="skeleton-line h-4 w-40" />
                  <div className="skeleton-line h-3 w-28" />
                </div>
                <div className="skeleton-line h-5 w-24" />
              </div>
            ))}
          </div>
        </div>

        {/* Categories Chart Skeleton */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="skeleton-line h-5 w-48 mb-4" />
          <div className="flex justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
          <div className="space-y-3 mt-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-3 rounded-full" />
                <div className="skeleton-line h-3 w-24" />
                <div className="skeleton-line h-3 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Goals Page Skeleton */
export function GoalsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="skeleton-line h-4 w-32" />
              <div className="skeleton-line h-3 w-20" />
            </div>
          </div>
          <div className="skeleton-line h-32 w-full rounded-xl" />
          <div className="flex justify-between">
            <div className="skeleton-line h-4 w-24" />
            <div className="skeleton-line h-4 w-24" />
          </div>
          <div className="skeleton-line h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

/** Transaction List Skeleton */
export function TransactionSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg">
          <div className="space-y-2 flex-1">
            <div className="skeleton-line h-4 w-40" />
            <div className="skeleton-line h-3 w-28" />
          </div>
          <div className="skeleton-line h-5 w-24" />
        </div>
      ))}
    </div>
  );
}
