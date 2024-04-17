import Dollars from '@/components/Dollars';
import { Order } from '@prisma/client';

export default function OrderTotal({ order }: { order: Order }) {
  return (
    <div className="grid grid-cols-2 gap-2" data-testid="order-total">
      <div>Subtotal:</div>
      <div className="text-right">
        <Dollars amountInCents={order.subTotalInCents} />
      </div>
      <div>Tax:</div>
      <div className="text-right">
        <Dollars amountInCents={order.taxInCents} />
      </div>
      <div className="font-bold text-lg">Total:</div>
      <div className="font-bold text-lg text-right">
        <Dollars amountInCents={order.totalInCents} />
      </div>
    </div>
  );
}
