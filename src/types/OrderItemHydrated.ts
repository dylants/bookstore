import BookHydrated from '@/types/BookHydrated';
import { OrderItem } from '@prisma/client';

type OrderItemHydrated = OrderItem & {
  book?: BookHydrated;
};
export default OrderItemHydrated;
