import OrdersTable from '@/components/order/OrdersTable';
import { fakeOrderHydrated } from '@/lib/fakes/order';
import { faker } from '@faker-js/faker';
import { OrderState } from '@prisma/client';
import { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof OrdersTable> = {
  component: OrdersTable,
};

export default meta;
type Story = StoryObj<typeof OrdersTable>;

function getOrders() {
  return _.times(9, () =>
    fakeOrderHydrated(
      faker.datatype.boolean() ? OrderState.OPEN : OrderState.PAID,
    ),
  );
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
