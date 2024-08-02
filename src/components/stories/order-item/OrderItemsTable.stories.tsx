import OrderItemsTable from '@/components/order-item/OrderItemsTable';
import { fakeOrderItemHydrated } from '@/lib/fakes/order-item';
import { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof OrderItemsTable> = {
  component: OrderItemsTable,
};

export default meta;
type Story = StoryObj<typeof OrderItemsTable>;

function getOrderItems() {
  return _.times(9, () => fakeOrderItemHydrated());
}

export const Default: Story = {
  render: () => {
    const items = getOrderItems();

    return (
      <div>
        <OrderItemsTable orderItems={items} />
      </div>
    );
  },
};

export const NoResults: Story = {
  args: {
    orderItems: [],
  },
};

export const EditableDiscount: Story = {
  render: () => {
    const items = getOrderItems();

    return (
      <div>
        <OrderItemsTable
          orderItems={items}
          editableDiscountCallback={async () => {}}
        />
      </div>
    );
  },
};
