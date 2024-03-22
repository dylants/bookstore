import { getDisplayName } from '@/lib/order-state';
import { Order } from '@prisma/client';
import { GiftIcon } from 'lucide-react';

export default function OrderDescription({ order }: { order: Order }) {
  return (
    <div className="flex w-full justify-between text-lg">
      <div className="flex flex-col">
        <div className="font-bold flex gap-2 items-center">
          <GiftIcon /> Order Details
        </div>
        <div className="flex gap-3">
          <div>
            <div>Number:</div>
          </div>
          <div>
            <div>{order.orderUID}</div>
          </div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2">
          <div>State:</div>
          <div className="text-right">{getDisplayName(order.orderState)}</div>
          <div>Date:</div>
          <div className="text-right">
            {order.orderOpenedDate.toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
