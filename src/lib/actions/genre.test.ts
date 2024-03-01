import { findGenre, findGenreOrThrow, getGenres } from '@/lib/actions/genre';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakeGenre } from '@/lib/fakes/genre';

describe('genre actions', () => {
  const genre1 = fakeGenre();
  const genre2 = fakeGenre();
  const genre3 = fakeGenre();

  describe('getGenres', () => {
    it('should get books when provided with default input', async () => {
      prismaMock.genre.findMany.mockResolvedValue([genre1, genre2, genre3]);

      const result = await getGenres({});

      expect(result).toEqual({
        genres: [genre1, genre2, genre3],
        pageInfo: {
          endCursor: genre3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: genre1.id.toString(),
        },
      });
    });

    it('should get books when provided with pagination query input', async () => {
      prismaMock.genre.findMany.mockResolvedValue([genre2, genre3]);

      const result = await getGenres({
        paginationQuery: {
          after: '1',
          first: 2,
        },
      });

      expect(result).toEqual({
        genres: [genre2, genre3],
        pageInfo: {
          endCursor: genre3.id.toString(),
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: genre2.id.toString(),
        },
      });
    });
  });

  describe('findGenre', () => {
    it('should pass the correct values to prisma', async () => {
      prismaMock.genre.findUnique.mockResolvedValue(genre1);

      await findGenre('Science Fiction');

      expect(prismaMock.genre.findUnique).toHaveBeenCalledWith({
        where: { displayName: 'Science Fiction' },
      });
    });
  });

  describe('findGenreOrThrow', () => {
    it('should pass the correct values to prisma', async () => {
      prismaMock.genre.findUniqueOrThrow.mockResolvedValue(genre1);

      await findGenreOrThrow('Science Fiction');

      expect(prismaMock.genre.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { displayName: 'Science Fiction' },
      });
    });
  });
});
