import _ from 'lodash';

export function convertCentsToDollars(cents: string | number): number {
  return _.toNumber(cents) / 100;
}

export function convertDollarsToCents(dollars: string | number): number {
  return _.toNumber(dollars) * 100;
}

export function determineDiscountedAmountInCents({
  priceInCents,
  discountPercentage,
}: {
  priceInCents: number;
  discountPercentage: number;
}): number {
  const cost = priceInCents - priceInCents * discountPercentage;
  return cost;
}
