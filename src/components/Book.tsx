import { Skeleton } from "@/components/ui/skeleton";
import { Book as BookType } from "@/types/Book";
import Image from "next/image";

function BookKey({
  book,
  fieldName,
}: {
  book: BookType;
  fieldName: keyof BookType;
}) {
  let fieldNameToDisplay: string = fieldName;
  let fieldToDisplay = book[fieldName]?.toString();
  if (fieldName === "publishedDate") {
    fieldNameToDisplay = "Published Date";
    fieldToDisplay = book[fieldName]?.toLocaleDateString?.();
  } else if (fieldName === "isbn") {
    fieldNameToDisplay = "ISBN";
  }

  return (
    <div>
      <span className="font-bold mr-1 capitalize">{fieldNameToDisplay}:</span>
      {fieldToDisplay}
    </div>
  );
}

export default function Book({ book }: { book: BookType }) {
  return (
    <div className="flex gap-4 h-[192px]">
      {book.imageUrl ? (
        <Image alt={book.title} src={book.imageUrl} width={128} height={192} />
      ) : (
        <div className="border rounded-sm border-customPalette-300 w-[128px] h-[192px] flex justify-center items-center text-slate-900">
          No Image
        </div>
      )}
      <div className="flex flex-col justify-between text-customPalette-500">
        <div>
          <div className="text-xl font-bold mb-2">{book.title}</div>
        </div>
        <div>
          <BookKey book={book} fieldName="isbn" />
          <BookKey book={book} fieldName="author" />
          <BookKey book={book} fieldName="genre" />
          <BookKey book={book} fieldName="publisher" />
          <BookKey book={book} fieldName="publishedDate" />
        </div>
      </div>
    </div>
  );
}

/**
 * Loading state of the Book component
 */
export function BookSkeleton() {
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
