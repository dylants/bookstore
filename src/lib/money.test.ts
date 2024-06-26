import {
  convertCentsToDollars,
  discountPercentageToDisplayString,
  convertDollarsToCents,
  determineDiscountedAmountInCents,
  computeTax,
  determineDiscountPercentage,
  discountPercentageToDisplayNumber,
  discountPercentageDisplayNumberToNumber,
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

    it('should work with non-round numbers', () => {
      expect(
        determineDiscountedAmountInCents({
          discountPercentage: 0.4,
          priceInCents: 2699,
        }),
      ).toEqual(1619);
    });
  });

  describe('determineDiscountPercentage', () => {
    it('should work with a simple numbers', () => {
      expect(
        determineDiscountPercentage({
          discountedPriceInCents: 1000,
          fullPriceInCents: 2000,
        }),
      ).toEqual(0.5);
    });

    it('should work with no discount', () => {
      expect(
        determineDiscountPercentage({
          discountedPriceInCents: 2000,
          fullPriceInCents: 2000,
        }),
      ).toEqual(0);
    });

    it('should work with full discount', () => {
      expect(
        determineDiscountPercentage({
          discountedPriceInCents: 0,
          fullPriceInCents: 2000,
        }),
      ).toEqual(1);
    });

    it('should work with non-round numbers', () => {
      expect(
        determineDiscountPercentage({
          discountedPriceInCents: 1619,
          fullPriceInCents: 2699,
        }),
      ).toEqual(0.4);
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

  describe('discountPercentageToDisplayNumber', () => {
    it('should work with a simple number', () => {
      expect(discountPercentageToDisplayNumber(0.56)).toEqual(56);
    });

    it('should work with a complex number', () => {
      expect(discountPercentageToDisplayNumber(0.56348)).toEqual(56.35);
    });

    it('should work with 0', () => {
      expect(discountPercentageToDisplayNumber(0)).toEqual(0);
    });

    it('should work with null', () => {
      expect(discountPercentageToDisplayNumber(null)).toEqual(0);
    });
  });

  describe('discountPercentageDisplayNumberToNumber', () => {
    it('should work with a simple number', () => {
      expect(discountPercentageDisplayNumberToNumber(56)).toEqual(0.56);
    });

    it('should work with a complex number', () => {
      expect(discountPercentageDisplayNumberToNumber(56.35)).toEqual(0.5635);
    });

    it('should work with 0', () => {
      expect(discountPercentageDisplayNumberToNumber(0)).toEqual(0);
    });

    it('should work with undefined', () => {
      expect(discountPercentageDisplayNumberToNumber(undefined)).toEqual(0);
    });
  });

  describe('computeTax', () => {
    it('should work with a simple number', () => {
      expect(computeTax(500)).toEqual(41);
    });

    it('should work with a large number', () => {
      expect(computeTax(56348)).toEqual(4649);
    });

    it('should work with 0', () => {
      expect(computeTax(0)).toEqual(0);
    });

    it('should work with a negative number', () => {
      expect(computeTax(-500)).toEqual(0);
    });
  });
});
