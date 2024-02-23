import InvoiceHydrated from '@/types/InvoiceHydrated';
import { HomeIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

export default function Breadcrumbs({
  invoice,
}: {
  invoice?: InvoiceHydrated;
}) {
  return (
    <div className="flex h-5 items-center space-x-3 mt-4 mb-8 font-medium text-sm text-slate-500">
      <Link href="/">
        <HomeIcon />
      </Link>
      <div>/</div>
      <Link href="/invoices">
        <div>Invoices</div>
      </Link>
      {invoice && (
        <>
          <div>/</div>
          <div>{invoice.invoiceNumber}</div>
        </>
      )}
    </div>
  );
}
