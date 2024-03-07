import _ from 'lodash';

// TODO should we store this somewhere else?
const TAX = 0.0825;

export function convertCentsToDollars(cents: string | number): number {
  return _.toNumber(cents) / 100;
}

export function convertDollarsToCents(dollars: string | number): number {
  // math is annoying in js
  return _.round(_.toNumber(dollars) * 100);
}

export function determineDiscountedAmountInCents({
  priceInCents,
  discountPercentage,
}: {
  priceInCents: number;
  discountPercentage: number;
}): number {
  const cost = priceInCents - _.round(priceInCents * discountPercentage);
  return cost;
}

export function discountPercentageToDisplayString(
  discountPercentage: number | null,
): string {
  return `${_.round((discountPercentage ?? 0) * 100, 2)}%`;
}

export function computeTax(priceInCents: number): number {
  return _.round(priceInCents * TAX);
}
