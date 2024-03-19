import { OrderItem } from '@prisma/client';

type OrderItemCreateInput = Omit<
  OrderItem,
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | 'orderId'
  | 'productPriceInCents'
  | 'totalPriceInCents'
> & {
  orderUID: string;
};
export default OrderItemCreateInput;
