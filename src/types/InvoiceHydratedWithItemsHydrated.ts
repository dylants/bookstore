import InvoiceHydrated from '@/types/InvoiceHydrated';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';

type InvoiceHydratedWithItemsHydrated = InvoiceHydrated & {
  invoiceItems: Array<InvoiceItemHydrated>;
};
export default InvoiceHydratedWithItemsHydrated;
