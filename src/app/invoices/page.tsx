'use client';

import InvoiceCreate from '@/components/invoice/InvoiceCreate';
import InvoicesTable from '@/components/invoice/InvoicesTable';
import { Separator } from '@/components/ui/separator';
import { getBookSources } from '@/lib/actions/book-source';
import { createInvoice, getInvoices } from '@/lib/actions/invoice';
import { DEFAULT_LIMIT } from '@/lib/pagination';
import BookSourceSerialized from '@/types/BookSourceSerialized';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Array<InvoiceHydrated> | null>();
  const [vendors, setVendors] = useState<Array<BookSourceSerialized>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const loadVendors = useCallback(async () => {
    // TODO handle pagination
    const { bookSources: vendors } = await getBookSources({
      isVendor: true,
      paginationQuery: {
        first: DEFAULT_LIMIT,
      },
    });
    setVendors(vendors);
  }, []);

  // Delay the loading animation a tiny amount to avoid screen flicker for quick connections (localhost)
  const setDelayedLoading = useCallback(() => {
    const timeout = setTimeout(() => setIsLoading(true), 50);
    return () => {
      setIsLoading(false);
      clearTimeout(timeout);
    };
  }, []);

  const loadInvoices = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    // TODO handle pagination
    const { invoices } = await getInvoices({
      paginationQuery: {
        first: DEFAULT_LIMIT,
      },
    });
    setInvoices(invoices);
    doneLoading();
  }, [setDelayedLoading]);

  // on initial render, load all the things
  useEffect(() => {
    loadInvoices();
    loadVendors();
  }, [loadInvoices, loadVendors]);

  return (
    <>
      <div className="flex justify-between items-center h-5 my-8 text-2xl">
        <Link href="/invoices">
          <div>Invoices</div>
        </Link>
        <InvoiceCreate
          onCreate={async (data) => {
            setIsLoading(true);
            await createInvoice(data);
            loadInvoices();
          }}
          vendors={vendors}
        />
      </div>
      <Separator className="mt-4 mb-8" />

      <InvoicesTable
        invoices={invoices || []}
        isLoading={!invoices || isLoading}
        onClick={(id) => router.push(`${pathname}/${id}`)}
      />
    </>
  );
}
