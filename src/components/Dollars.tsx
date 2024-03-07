import { convertCentsToDollars } from '@/lib/money';

export default function Dollars({ amountInCents }: { amountInCents: number }) {
  return <>${convertCentsToDollars(amountInCents).toFixed(2)}</>;
}
