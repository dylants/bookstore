import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsHome,
  BreadcrumbsLink,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Breadcrumbs> = {
  component: Breadcrumbs,
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  render: () => {
    return (
      <>
        <Breadcrumbs>
          <BreadcrumbsHome />
          <BreadcrumbsDivider />
          <BreadcrumbsLink href="#">Invoices</BreadcrumbsLink>
          <BreadcrumbsDivider />
          <BreadcrumbsText>123</BreadcrumbsText>
        </Breadcrumbs>
      </>
    );
  },
};
