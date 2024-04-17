import { discountPercentageToDisplayString } from '@/lib/money';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import { PackageOpenIcon } from 'lucide-react';

export default function InvoiceDescription({
  invoice,
}: {
  invoice: InvoiceHydrated;
}) {
  const { vendor } = invoice;
  return (
    <div
      className="flex w-full justify-between text-lg"
      data-testid="invoice-description"
    >
      <div className="flex flex-col">
        <div className="font-bold flex gap-2 items-center">
          <PackageOpenIcon /> Invoice Details
        </div>
        <div data-testid="vendor-name">{vendor.name}</div>
        <div className="grid grid-cols-2">
          <div>Discount:</div>
          <div className="text-right" data-testid="discount-percentage">
            {discountPercentageToDisplayString(vendor.discountPercentage)}
          </div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2">
          <div>Invoice Number:</div>
          <div className="text-right" data-testid="invoice-number">
            {invoice.invoiceNumber}
          </div>
          <div>Invoice Date:</div>
          <div className="text-right" data-testid="invoice-date">
            {invoice.invoiceDate.toLocaleDateString()}
          </div>
          {invoice.isCompleted && (
            <>
              <div>Received:</div>
              <div className="text-right">
                {invoice.dateReceived?.toLocaleDateString()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
