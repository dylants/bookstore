import { convertDateToFormInputString } from '@/lib/date';

describe('date lib', () => {
  describe('convertDateToFormInputString', () => {
    it('should convert year only properly', () => {
      expect(convertDateToFormInputString('2000', 'America/Chicago')).toEqual(
        '2000-01-01',
      );
    });

    it('should convert year/month/day properly', () => {
      expect(
        convertDateToFormInputString('2000-02-03', 'America/Chicago'),
      ).toEqual('2000-02-03');
    });

    it('should convert ISO string properly', () => {
      expect(
        convertDateToFormInputString(
          '2000-04-05T06:00:00.000Z',
          'America/Chicago',
        ),
      ).toEqual('2000-04-05');
    });

    it('should convert Date properly', () => {
      expect(
        convertDateToFormInputString(
          new Date('2001-10-12T16:00:00.000Z'),
          'America/Chicago',
        ),
      ).toEqual('2001-10-12');
    });
  });
});
