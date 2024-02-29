'use server';

import { stringToGenre } from '@/lib/book/genre';
import logger from '@/lib/logger';
import BookFormInput from '@/types/BookFormInput';

export type GoogleBookSearchInput = {
  isbn13: string;
};

export interface GoogleSearchResponse {
  totalItems: number;
  items: Array<{
    volumeInfo: {
      authors?: [string];
      categories?: [string];
      imageLinks?: {
        thumbnail?: string;
      };
      industryIdentifiers: Array<{
        identifier: string;
        type: string;
      }>;
      publishedDate?: string;
      publisher: string;
      title: string;
    };
  }>;
}

function buildGoogleSearchUrl(ISBN: string) {
  return `https://www.googleapis.com/books/v1/volumes?q=isbn:${ISBN}`;
}

export async function googleBookSearch(
  input: GoogleBookSearchInput,
): Promise<Partial<BookFormInput>> {
  const { isbn13 } = input;
  const searchUrl = buildGoogleSearchUrl(isbn13);

  const response = await fetch(searchUrl);
  const data: GoogleSearchResponse = await response.json();
  logger.trace('data returned from Google search %j', data);

  if (data.totalItems > 0) {
    // assume there is only 1 item in the response, since we searched by ISBN
    // which should be unique
    const item = data.items[0];
    logger.trace('data returned item %j', item);

    const {
      volumeInfo: {
        authors,
        categories,
        imageLinks,
        publishedDate,
        publisher,
        title,
      },
    } = item;

    // TODO map Google genres to our genres
    const googleGenre = categories?.[0] || '';
    logger.trace('google genre returned: %s', googleGenre);
    let genre = undefined;
    try {
      genre = stringToGenre(googleGenre);
    } catch {
      // ignore, no matching genre was found
      logger.trace('unable to map google genre to internal genre');
    }

    const book: Partial<BookFormInput> = {
      authors: authors?.join(', '),
      genre,
      imageUrl: imageLinks?.thumbnail?.replaceAll('http://', 'https://'),
      isbn13,
      publishedDate,
      publisher,
      title,
    };
    logger.trace('returning book %j', book);

    return book;
  } else {
    logger.trace('no data found, returning only input ISBN number');
    return {
      isbn13,
    };
  }
}
