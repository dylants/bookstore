import { BookSkeleton } from "@/components/Book";

export default function ListPageLoading() {
  return (
    <div className="flex flex-col gap-8">
      <BookSkeleton />
      <BookSkeleton />
      <BookSkeleton />
    </div>
  );
}
