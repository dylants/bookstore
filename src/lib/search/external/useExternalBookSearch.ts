import logger from '@/lib/logger';

export type ExternalBookSearchInput = {
  isbn: string;
};

export type ExternalBookSearchResult = {
  authorsHint?: string;
  genresHint?: string;
  imageUrl?: string;
  isbn13?: string;
  publishedDate?: Date;
  publisherHint?: string;
  title?: string;
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
): Promise<ExternalBookSearchResult | null> {
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

    const book: ExternalBookSearchResult = {
      authorsHint: authors?.join(', '),
      genresHint: categories?.join(', '),
      imageUrl: imageLinks?.thumbnail?.replaceAll('http://', 'https://'),
      isbn13: industryIdentifiers.find((i) => i.type === 'ISBN_13')?.identifier,
      publishedDate: publishedDateString
        ? new Date(publishedDateString)
        : undefined,
      publisherHint: publisher,
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
) => Promise<ExternalBookSearchResult | null>;

export default function useExternalBookSearch(): UseExternalBookSearchResult {
  const search = async (
    input: ExternalBookSearchInput,
  ): Promise<ExternalBookSearchResult | null> => {
    // currently only support Google as a search mechanism
    return googleBookSearch(input);
  };

  return search;
}
