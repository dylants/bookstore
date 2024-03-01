import { convertDateToFormInputString } from '@/lib/date';
import { convertCentsToDollars, convertDollarsToCents } from '@/lib/money';
import BookCreateInput from '@/types/BookCreateInput';
import BookFormInput from '@/types/BookFormInput';
import BookHydrated from '@/types/BookHydrated';
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
    formatId: bookHydrated.format.id,
    genreId: bookHydrated.genre.id,
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
  const {
    formatId,
    genreId,
    isbn13,
    priceInCents,
    publishedDate,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    quantity: ignoreQuantity,
    ...rest
  } = bookFormInput;

  if (!formatId) {
    throw new Error('formatId required');
  }
  if (!genreId) {
    throw new Error('genreId required');
  }

  return {
    ...rest,
    formatId,
    genreId,
    isbn13: BigInt(isbn13),
    // the book form input is presented as dollars, so convert to cents
    priceInCents: convertDollarsToCents(priceInCents),
    publishedDate: new Date(publishedDate),
    quantity: _.toNumber(quantity || 0),
  };
}
