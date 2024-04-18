import Dollars from '@/components/Dollars';
import { Invoice } from '@prisma/client';

export default function InvoiceTotal({ invoice }: { invoice: Invoice }) {
  return (
    <div className="grid grid-cols-2 gap-2" data-testid="invoice-total">
      <div>Subtotal:</div>
      <div className="text-right">
        <Dollars amountInCents={invoice.subTotalInCents} />
      </div>
      <div>Tax:</div>
      <div className="text-right">
        <Dollars amountInCents={invoice.taxInCents} />
      </div>
      <div className="font-bold text-lg">Total:</div>
      <div className="font-bold text-lg text-right">
        <Dollars amountInCents={invoice.totalInCents} />
      </div>
    </div>
  );
}
