import logger from '@/lib/logger';
import BookType from '@/types/Book';

export interface ExternalBookSearchInput {
  isbn: string;
}

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
      publishedDate?: Date;
      publisher: string;
      title: string;
    };
  }>;
}

function buildGoogleSearchUrl(ISBN: string) {
  return `https://www.googleapis.com/books/v1/volumes?q=isbn:${ISBN}`;
}

async function googleBookSearch(
  input: ExternalBookSearchInput,
): Promise<BookType | null> {
  // TODO do we need to care about other search input?
  const searchUrl = buildGoogleSearchUrl(input.isbn);

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
        industryIdentifiers,
        publishedDate: publishedDateString,
        publisher,
        title,
      },
    } = item;

    const author = authors?.join(', ') || '';
    const genre = categories?.join(', ') || '';
    const imageUrl = imageLinks?.thumbnail
      ? imageLinks.thumbnail.replaceAll('http://', 'https://')
      : null;
    const isbn =
      industryIdentifiers.find((i) => i.type === 'ISBN_13')?.identifier ?? '';
    const publishedDate = publishedDateString
      ? new Date(publishedDateString)
      : null;

    const book: BookType = {
      author,
      genre,
      imageUrl,
      isbn,
      publishedDate,
      publisher,
      title,
    };
    logger.trace('returning book %j', book);

    return book;
  } else {
    logger.trace('no data found, returning null');
    return null;
  }
}

export type UseExternalBookSearchResult = (
  input: ExternalBookSearchInput,
) => Promise<BookType | null>;

export default function useExternalBookSearch(): UseExternalBookSearchResult {
  const search = async (
    input: ExternalBookSearchInput,
  ): Promise<BookType | null> => {
    // currently only support Google as a search mechanism
    return googleBookSearch(input);
  };

  return search;
}
