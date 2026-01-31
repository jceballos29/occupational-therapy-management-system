import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 p-4">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-4 flex-1" />
          </div>
        </div>

        {/* Rows */}
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="p-4 border-t">
            <div className="flex gap-4 items-center">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 flex-1" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[100px]" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
}
