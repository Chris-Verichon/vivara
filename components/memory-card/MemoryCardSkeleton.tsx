import { Skeleton } from "@/components/ui/skeleton"

export function MemoryCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
      <Skeleton className="w-full aspect-[4/3]" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  )
}

export function MemoryCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mb-4 break-inside-avoid">
          <MemoryCardSkeleton />
        </div>
      ))}
    </div>
  )
}
