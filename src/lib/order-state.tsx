import { OrderState } from '@prisma/client';

export function getDisplayName(orderState: OrderState): string {
  let displayName: string;
  switch (orderState) {
    case OrderState.OPEN:
      displayName = 'Open';
      break;
    case OrderState.PAID:
      displayName = 'Paid';
      break;
    case OrderState.PENDING_TRANSACTION:
      displayName = 'Pending Transaction';
      break;
    default:
      displayName = 'Unknown';
      break;
  }

  return displayName;
}
