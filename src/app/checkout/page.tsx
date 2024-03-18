import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsHome,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';

export default function CheckoutPage() {
  return (
    <>
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsText>Checkout</BreadcrumbsText>
      </Breadcrumbs>

      <h1 className="mt-8">Checkout</h1>
    </>
  );
}
