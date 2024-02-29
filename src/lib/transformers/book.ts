import { stringToFormat } from '@/lib/book/format';
import { convertDateToFormInputString } from '@/lib/date';
import { convertCentsToDollars, convertDollarsToCents } from '@/lib/money';
import BookCreateInput from '@/types/BookCreateInput';
import BookFormInput from '@/types/BookFormInput';
import BookHydrated from '@/types/BookHydrated';
import { Genre } from '@prisma/client';
import _ from 'lodash';

export function transformBookHydratedToBookFormInput({
  bookHydrated,
  timezone,
}: {
  bookHydrated: BookHydrated;
  timezone: string;
}): BookFormInput {
  return {
    authors: bookHydrated.authors.map((a) => a.name).join(', '),
    format: bookHydrated.format,
    genre: bookHydrated.genre,
    imageUrl: bookHydrated.imageUrl,
    isbn13: bookHydrated.isbn13.toString(),
    priceInCents: convertCentsToDollars(bookHydrated.priceInCents).toString(),
    publishedDate: bookHydrated.publishedDate
      ? convertDateToFormInputString(bookHydrated.publishedDate, timezone)
      : '',
    publisher: bookHydrated.publisher.name,
    quantity: bookHydrated.quantity.toString(),
    title: bookHydrated.title,
  };
}

export function transformBookFormInputToBookCreateInput({
  bookFormInput,
  quantity,
}: {
  bookFormInput: BookFormInput;
  quantity?: string;
}): BookCreateInput {
  return {
    ...bookFormInput,
    format: stringToFormat(bookFormInput.format),
    // TODO fixme
    genre: Genre.FANTASY,
    isbn13: BigInt(bookFormInput.isbn13),
    // the book form input is presented as dollars, so convert to cents
    priceInCents: convertDollarsToCents(bookFormInput.priceInCents),
    publishedDate: new Date(bookFormInput.publishedDate),
    quantity: _.toNumber(quantity || 0),
  };
}
