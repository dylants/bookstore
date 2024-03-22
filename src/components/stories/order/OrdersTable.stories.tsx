import OrdersTable from '@/components/order/OrdersTable';
import { fakeOrderHydrated } from '@/lib/fakes/order';
import { OrderState } from '@prisma/client';
import { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof OrdersTable> = {
  component: OrdersTable,
};

export default meta;
type Story = StoryObj<typeof OrdersTable>;

function getOrders() {
  return _.times(9, () => {
    const orderState: OrderState = _.sample([
      OrderState.OPEN,
      OrderState.PAID,
      OrderState.PENDING_TRANSACTION,
      'foo' as OrderState,
    ]);
    return fakeOrderHydrated(orderState);
  });
}

export const Default: Story = {
  render: () => {
    const orders = getOrders();

    return (
      <div>
        <OrdersTable orders={orders} linkPathname="#" />
      </div>
    );
  },
};
