import { OrderItem } from '@prisma/client';

type OrderItemCreateInput = Omit<
  OrderItem,
  'id' | 'createdAt' | 'updatedAt' | 'productPriceInCents' | 'totalPriceInCents'
>;
export default OrderItemCreateInput;
