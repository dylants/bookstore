import {
  convertCentsToDollars,
  convertDollarsToCents,
  determineDiscountedAmountInCents,
} from '@/lib/money';

describe('money', () => {
  describe('convertCentsToDollars', () => {
    it('should convert number', () => {
      expect(convertCentsToDollars(1025)).toEqual(10.25);
    });

    it('should convert string', () => {
      expect(convertCentsToDollars('1025')).toEqual(10.25);
    });
  });

  describe('convertDollarsToCents', () => {
    it('should convert number', () => {
      expect(convertDollarsToCents(10.25)).toEqual(1025);
    });

    it('should convert string', () => {
      expect(convertDollarsToCents('10.25')).toEqual(1025);
    });
  });

  describe('determineDiscountedAmountInCents', () => {
    it('should work with a valid percentage', () => {
      expect(
        determineDiscountedAmountInCents({
          discountPercentage: 0.5,
          priceInCents: 2000,
        }),
      ).toEqual(1000);
    });

    it('should work with 0%', () => {
      expect(
        determineDiscountedAmountInCents({
          discountPercentage: 0,
          priceInCents: 2000,
        }),
      ).toEqual(2000);
    });

    it('should work with 100%', () => {
      expect(
        determineDiscountedAmountInCents({
          discountPercentage: 1,
          priceInCents: 2000,
        }),
      ).toEqual(0);
    });
  });
});
