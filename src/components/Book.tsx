import { Book as BookType } from "@/types/Book";
import Image from "next/image";

export default function Book({ book }: { book: BookType }) {
  return (
    <div>
      <div>ISBN: {book.isbn}</div>
      <div>Title: {book.title}</div>
      <div>Author: {book.author}</div>
      {book.imageUrl && (
        <Image alt={book.title} src={book.imageUrl} width={128} height={192} />
      )}
    </div>
  );
}
