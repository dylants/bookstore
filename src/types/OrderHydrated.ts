import { Order } from '@prisma/client';

type OrderHydrated = Order & {
  numOrderItems: number;
};
export default OrderHydrated;
