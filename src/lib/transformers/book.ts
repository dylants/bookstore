import { convertDateToFormInputString } from '@/lib/date';
import { convertCentsToDollars } from '@/lib/money';
import BookFormInput from '@/types/BookFormInput';
import BookHydrated from '@/types/BookHydrated';

export function transformBookHydratedToBookFormInput(
  book: BookHydrated,
  timezone: string,
): BookFormInput {
  return {
    authors: book.authors.map((a) => a.name).join(', '),
    format: book.format,
    genre: book.genre,
    imageUrl: book.imageUrl,
    isbn13: book.isbn13.toString(),
    priceInCents: convertCentsToDollars(book.priceInCents).toString(),
    publishedDate: book.publishedDate
      ? convertDateToFormInputString(book.publishedDate, timezone)
      : '',
    publisher: book.publisher.name,
    quantity: book.quantity.toString(),
    title: book.title,
  };
}
