import {
  convertCentsToDollars,
  discountPercentageToDisplayString,
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

    it('should convert string 1999', () => {
      expect(convertCentsToDollars('1999')).toEqual(19.99);
    });
  });

  describe('convertDollarsToCents', () => {
    it('should convert number', () => {
      expect(convertDollarsToCents(10.25)).toEqual(1025);
    });

    it('should convert string', () => {
      expect(convertDollarsToCents('10.25')).toEqual(1025);
    });

    it('should convert string 19.99', () => {
      expect(convertDollarsToCents('19.99')).toEqual(1999);
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

  describe('discountPercentageToDisplayString', () => {
    it('should work with a simple number', () => {
      expect(discountPercentageToDisplayString(0.56)).toEqual('56%');
    });

    it('should work with a complex number', () => {
      expect(discountPercentageToDisplayString(0.56348)).toEqual('56.35%');
    });

    it('should work with 0', () => {
      expect(discountPercentageToDisplayString(0)).toEqual('0%');
    });

    it('should work with null', () => {
      expect(discountPercentageToDisplayString(null)).toEqual('0%');
    });
  });
});
