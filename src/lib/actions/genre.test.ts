import { findGenre, findGenreOrThrow, getGenres } from '@/lib/actions/genre';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakeGenre } from '@/lib/fakes/genre';

describe('genre actions', () => {
  const genre1 = fakeGenre();
  const genre2 = fakeGenre();
  const genre3 = fakeGenre();

  describe('getGenres', () => {
    it('should get genres when provided with default input', async () => {
      prismaMock.genre.findMany.mockResolvedValue([genre1, genre2, genre3]);

      const result = await getGenres();

      expect(result).toEqual([genre1, genre2, genre3]);
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
