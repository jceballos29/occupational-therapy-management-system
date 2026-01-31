import { TableSkeleton } from "@/components/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-5 w-64 sm:w-96" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>

          <TableSkeleton />
        </div>
    </div>
  );
}
