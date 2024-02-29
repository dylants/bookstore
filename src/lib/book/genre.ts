import { Genre } from '@prisma/client';

export function genreToDisplayString(genre: Genre): string {
  switch (genre) {
    // Fiction
    case 'FANTASY':
      return 'Fantasy';
    case 'LITERARY_FICTION':
      return 'Literary Fiction';
    case 'ROMANCE':
      return 'Romance';
    case 'SCIENCE_FICTION':
      return 'Science Fiction';

    // Young Adult
    case 'YOUNG_ADULT_FANTASY':
      return 'YA Fantasy';

    // Kids
    case 'MIDDLE_GRADE':
      return 'Middle Grade';

    // Non-Fiction
    case 'BUSINESS_AND_FINANCE':
      return 'Business and Finance';
    case 'COOKBOOKS':
      return 'Cookbooks';

    // else
    default:
      return '';
  }
}

const genreKeys = Object.keys(Genre) as Genre[];
export function stringToGenre(genreAsString: string): Genre {
  const genre = genreKeys.find((gk) => gk.toString() === genreAsString);
  if (genre) {
    return genre;
  }

  throw new Error('unsupported genre: ' + genreAsString);
}

export const GENRE_OPTIONS = genreKeys.map((genre) => ({
  label: genreToDisplayString(genre),
  value: genre,
}));
