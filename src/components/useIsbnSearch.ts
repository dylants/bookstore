import logger from '@/lib/logger';
import { Book as BookType } from '@/types/Book';

export interface IsbnSearchInput {
  isbn: string;
}

interface GoogleSearchResponse {
  totalItems: number;
  items: [
    {
      volumeInfo: {
        authors?: [string];
        categories?: [string];
        imageLinks: {
          thumbnail: string;
        };
        industryIdentifiers: [
          {
            identifier: string;
            type: string;
          },
        ];
        publishedDate?: Date;
        publisher: string;
        title: string;
      };
    },
  ];
}

function buildSearchUrl(ISBN: string) {
  return `https://www.googleapis.com/books/v1/volumes?q=isbn:${ISBN}`;
}

// TODO refactor search to use multiple search query methods other than ISBN
export default function useIsbnSearch() {
  const search = async ({
    isbn,
  }: IsbnSearchInput): Promise<BookType | null> => {
    const searchUrl = buildSearchUrl(isbn);

    const response = await fetch(searchUrl);
    // TODO split out Google to allow for other search protocols
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
          industryIdentifiers,
          publishedDate,
          publisher,
          title,
        },
      } = item;

      const foundIdentifier = industryIdentifiers.find(
        (i) => i.type === 'ISBN_13',
      );
      // TODO standardize this to pull the ISBN from the response
      if (foundIdentifier) {
        logger.trace('found ISBN: %s', foundIdentifier.identifier);
      }

      const book: BookType = {
        author: authors?.join(', ') || '',
        genre: categories?.join(', ') || '',
        imageUrl: imageLinks.thumbnail
          ? imageLinks.thumbnail.replaceAll('http://', 'https://')
          : undefined,
        isbn,
        // TODO what to do when there's no published date?
        publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
        publisher,
        title,
      };
      logger.trace('returning book %j', book);

      return book;
    } else {
      logger.trace('no data found, returning null');
      return null;
    }
  };

  return search;
}
