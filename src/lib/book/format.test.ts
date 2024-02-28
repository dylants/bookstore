import {
  FORMAT_OPTIONS,
  formatToDisplayString,
  stringToFormat,
} from '@/lib/book/format';
import { Format } from '@prisma/client';

describe('book format lib', () => {
  describe('formatToDisplayString', () => {
    it('should work with existing format', () => {
      expect(formatToDisplayString(Format.TRADE_PAPERBACK)).toEqual(
        'Trade Paperback',
      );
    });

    it('should work with non-format', () => {
      expect(formatToDisplayString('hi' as Format)).toEqual('');
    });
  });

  describe('stringToFormat', () => {
    it('should work with a valid format', () => {
      expect(stringToFormat(Format.HARDCOVER.toString())).toEqual(
        Format.HARDCOVER,
      );
    });

    it('should throw error with an invalid format', () => {
      expect(() => stringToFormat('hi')).toThrowErrorMatchingInlineSnapshot(
        `"unsupported format: hi"`,
      );
    });
  });

  describe('FORMAT_OPTIONS', () => {
    it('should list all the formats', () => {
      expect(FORMAT_OPTIONS).toEqual([
        { label: 'Hardcover', value: Format.HARDCOVER },
        { label: 'Mass Market Paperback', value: Format.MASS_MARKET },
        { label: 'Trade Paperback', value: Format.TRADE_PAPERBACK },
      ]);
    });
  });
});
