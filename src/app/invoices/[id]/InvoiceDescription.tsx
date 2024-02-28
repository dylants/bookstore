import { discountPercentageToDisplayString } from '@/lib/money';
import InvoiceHydrated from '@/types/InvoiceHydrated';

export default function InvoiceDescription({
  invoice,
}: {
  invoice: InvoiceHydrated;
}) {
  const { vendor } = invoice;
  return (
    <div className="flex w-full justify-between text-lg">
      <div className="flex flex-col">
        <div className="font-bold">{vendor.name}</div>
        <div className="grid grid-cols-2 gap-0">
          <div>
            <div>Discount:</div>
          </div>
          <div className="text-right">
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
            <div>{invoice.invoiceNumber}</div>
            <div>{invoice.invoiceDate.toLocaleDateString()}</div>
            {invoice.isCompleted && (
              <div>{invoice.dateReceived?.toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
