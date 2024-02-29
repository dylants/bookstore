import {
  GENRE_OPTIONS,
  genreToDisplayString,
  stringToGenre,
} from '@/lib/book/genre';
import { Genre } from '@prisma/client';

describe('book genre lib', () => {
  describe('genreToDisplayString', () => {
    it('should work with existing format', () => {
      expect(genreToDisplayString(Genre.SCIENCE_FICTION)).toEqual(
        'Science Fiction',
      );
    });

    it('should work with non-format', () => {
      expect(genreToDisplayString('hi' as Genre)).toEqual('');
    });
  });

  describe('stringToGenre', () => {
    it('should work with a valid format', () => {
      expect(stringToGenre(Genre.COOKBOOKS.toString())).toEqual(
        Genre.COOKBOOKS,
      );
    });

    it('should throw error with an invalid format', () => {
      expect(() => stringToGenre('hi')).toThrowErrorMatchingInlineSnapshot(
        `"unsupported genre: hi"`,
      );
    });
  });

  describe('GENRE_OPTIONS', () => {
    it('should list all the formats', () => {
      expect(GENRE_OPTIONS).toEqual([
        // Fiction
        { label: 'Fantasy', value: Genre.FANTASY },
        { label: 'Literary Fiction', value: Genre.LITERARY_FICTION },
        { label: 'Romance', value: Genre.ROMANCE },
        { label: 'Science Fiction', value: Genre.SCIENCE_FICTION },

        // Young Adult
        { label: 'YA Fantasy', value: Genre.YOUNG_ADULT_FANTASY },

        // Kids
        { label: 'Middle Grade', value: Genre.MIDDLE_GRADE },

        // Non-Fiction
        { label: 'Business and Finance', value: Genre.BUSINESS_AND_FINANCE },
        { label: 'Cookbooks', value: Genre.COOKBOOKS },
      ]);
    });
  });
});
