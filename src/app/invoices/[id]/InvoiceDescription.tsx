import { discountPercentageToDisplayString } from '@/lib/money';
import InvoiceHydrated from '@/types/InvoiceHydrated';

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
        <div className="font-bold" data-testid="vendor-name">
          {vendor.name}
        </div>
        <div className="grid grid-cols-2 gap-0">
          <div>
            <div>Discount:</div>
          </div>
          <div className="text-right" data-testid="discount-percentage">
            <div>
              {discountPercentageToDisplayString(vendor.discountPercentage)}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-1">
          <div>
            <div>Invoice Number:</div>
            <div>Invoice Date:</div>
            {invoice.isCompleted && <div>Received:</div>}
          </div>
          <div className="text-right">
            <div data-testid="invoice-number">{invoice.invoiceNumber}</div>
            <div data-testid="invoice-date">
              {invoice.invoiceDate.toLocaleDateString()}
            </div>
            {invoice.isCompleted && (
              <div>{invoice.dateReceived?.toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
