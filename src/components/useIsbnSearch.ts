import { Book } from "@/types/Book";

export interface IsbnSearchInput {
  ISBN: string;
}

interface GoogleSearchResponse {
  totalItems: number;
  items: [
    {
      volumeInfo: {
        title: string;
        authors?: [string];
        imageLinks: {
          thumbnail: string;
        };
      };
    },
  ];
}

function buildSearchUrl(ISBN: string) {
  return `https://www.googleapis.com/books/v1/volumes?q=isbn:${ISBN}`;
}

export default function useIsbnSearch() {
  const search = async ({ ISBN }: IsbnSearchInput): Promise<Book | null> => {
    const searchUrl = buildSearchUrl(ISBN);

    const response = await fetch(searchUrl);
    const data: GoogleSearchResponse = await response.json();

    if (data.totalItems > 0) {
      // assume there is only 1 book in the response, since we searched by ISBN
      // which should be unique
      const book = data.items[0];
      const {
        volumeInfo: { title, authors, imageLinks },
      } = book;
      return {
        ISBN,
        author: authors?.join(", ") || "",
        imageUrl: imageLinks.thumbnail
          ? imageLinks.thumbnail.replaceAll("http://", "https://")
          : undefined,
        title,
      };
    } else {
      return null;
    }
  };

  return search;
}
