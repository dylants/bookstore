import OrderItemHydrated from '@/types/OrderItemHydrated';
import { Order } from '@prisma/client';

type OrderWithItemsHydrated = Order & {
  orderItems: Array<OrderItemHydrated>;
};
export default OrderWithItemsHydrated;
