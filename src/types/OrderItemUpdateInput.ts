import { OrderItem } from '@prisma/client';

type OrderItemUpdateInput = Pick<
  OrderItem,
  'productPriceInCents' | 'quantity' | 'totalPriceInCents'
>;
export default OrderItemUpdateInput;
