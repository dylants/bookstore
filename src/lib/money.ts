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

export function determineDiscountPercentage({
  discountedPriceInCents,
  fullPriceInCents,
}: {
  discountedPriceInCents: number;
  fullPriceInCents: number;
}): number {
  return _.round(1 - discountedPriceInCents / fullPriceInCents, 2);
}

export function discountPercentageToDisplayString(
  discountPercentage: number | null,
): string {
  return `${discountPercentageToDisplayNumber(discountPercentage)}%`;
}

export function discountPercentageToDisplayNumber(
  discountPercentage: number | null,
): number {
  return _.round((discountPercentage ?? 0) * 100, 2);
}

export function discountPercentageDisplayNumberToNumber(
  discountPercentageDisplay: number | undefined,
): number {
  return _.round((discountPercentageDisplay ?? 0) / 100, 4);
}

export function computeTax(priceInCents: number): number {
  if (priceInCents < 0) {
    return 0;
  }

  return _.round(priceInCents * TAX);
}
