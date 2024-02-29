'use server';

import { getBook } from '@/lib/actions/book';
import logger from '@/lib/logger';
import { googleBookSearch } from '@/lib/search/google';
import { transformBookHydratedToBookFormInput } from '@/lib/transformers/book';
import BookFormInput from '@/types/BookFormInput';

/**
 * Searches to find a Book first internally, and if not found, then externally.
 */
export async function findBookByIsbn13({
  isbn13,
  timezone,
}: {
  isbn13: string;
  timezone: string;
}): Promise<Partial<BookFormInput>> {
  const bookHydrated = await getBook(BigInt(isbn13));
  if (bookHydrated) {
    logger.trace('book found internally, with ID: %s', bookHydrated.id);
    const bookFormInput = transformBookHydratedToBookFormInput({
      bookHydrated,
      timezone,
    });
    logger.trace('returning book %j', bookFormInput);
    return bookFormInput;
  }

  logger.trace('book not found internally, using google search...');
  return googleBookSearch({ isbn13 });
}
