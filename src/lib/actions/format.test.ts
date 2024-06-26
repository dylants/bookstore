import {
  findFormat,
  findFormatOrThrow,
  getFormats,
} from '@/lib/actions/format';
import { prismaMock } from '../../../test-setup/prisma-mock.setup';
import { fakeFormat } from '@/lib/fakes/format';

describe('format actions', () => {
  const format1 = fakeFormat();
  const format2 = fakeFormat();
  const format3 = fakeFormat();

  describe('getFormats', () => {
    it('should get formats when provided with default input', async () => {
      prismaMock.format.findMany.mockResolvedValue([format1, format2, format3]);

      const result = await getFormats();

      expect(result).toEqual([format1, format2, format3]);
    });
  });

  describe('findFormat', () => {
    it('should pass the correct values to prisma', async () => {
      prismaMock.format.findUnique.mockResolvedValue(format1);

      await findFormat('Science Fiction');

      expect(prismaMock.format.findUnique).toHaveBeenCalledWith({
        where: { displayName: 'Science Fiction' },
      });
    });
  });

  describe('findFormatOrThrow', () => {
    it('should pass the correct values to prisma', async () => {
      prismaMock.format.findUniqueOrThrow.mockResolvedValue(format1);

      await findFormatOrThrow('Science Fiction');

      expect(prismaMock.format.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { displayName: 'Science Fiction' },
      });
    });
  });
});
