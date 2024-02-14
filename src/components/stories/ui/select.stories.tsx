import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { faker } from '@faker-js/faker';
import { Meta, StoryObj } from '@storybook/react';
import _ from 'lodash';

const meta: Meta<typeof Select> = {
  component: Select,
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => {
    const vendors = _.times(10, () => ({
      id: faker.number.int(),
      name: faker.company.name(),
    }));

    return (
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Vendor..." />
        </SelectTrigger>
        <SelectContent>
          {vendors.map((v) => (
            <SelectItem key={v.id} value={v.id.toString()}>
              {v.name}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value="new">Add new vendor...</SelectItem>
        </SelectContent>
      </Select>
    );
  },
};
