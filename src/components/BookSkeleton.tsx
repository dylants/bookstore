import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading state of the Book component
 */
export default function BookSkeleton() {
  return (
    <div className="flex gap-4 h-[192px]">
      <div className="">
        <Skeleton className="h-[192px] w-[128px]" />
      </div>
      <div className="flex flex-col w-full justify-between text-customPalette-500">
        <div>
          <Skeleton className="h-7 w-full mb-2" />
        </div>
        <div className="flex flex-col gap-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    </div>
  );
}
