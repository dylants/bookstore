'use server';

import { getBook } from '@/lib/actions/book';
import logger from '@/lib/logger';
import prisma from '@/lib/prisma';
import { googleBookSearch } from '@/lib/search/google';
import { serializeBookSource } from '@/lib/serializers/book-source';
import { transformBookHydratedToBookFormInput } from '@/lib/transformers/book';
import BookFormInput from '@/types/BookFormInput';
import BookHydrated from '@/types/BookHydrated';
import { Prisma } from '@prisma/client';
import _ from 'lodash';

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

/**
 * Searches internally to find a book
 */
export async function findBooksBySearchString(
  searchString: string,
): Promise<Array<BookHydrated>> {
  let whereClauses: Prisma.BookWhereInput[];
  const searchStringNumber = _.toNumber(searchString);
  if (_.isFinite(searchStringNumber)) {
    whereClauses = [{ isbn13: { equals: searchStringNumber } }];
  } else {
    const search = searchString.split(' ').join(' & ');
    whereClauses = [
      { authors: { some: { name: { search } } } },
      { title: { search } },
    ];
  }

  const rawBooks = await prisma.book.findMany({
    include: {
      authors: true,
      format: true,
      genre: true,
      publisher: true,
    },
    where: {
      OR: whereClauses,
    },
  });

  const books = rawBooks.map((book) => ({
    ...book,
    publisher: serializeBookSource(book.publisher),
  }));

  logger.trace('books found: %j', books);

  return books;
}
