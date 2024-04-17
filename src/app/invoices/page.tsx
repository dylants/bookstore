'use client';

import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsHome,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import InvoiceCreate from '@/components/invoice/InvoiceCreate';
import InvoicesTable from '@/components/invoice/InvoicesTable';
import { getBookSources } from '@/lib/actions/book-source';
import { createInvoice, getInvoices } from '@/lib/actions/invoice';
import BookSourceSerialized from '@/types/BookSourceSerialized';
import InvoiceHydrated from '@/types/InvoiceHydrated';
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
        first: 100,
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
        first: 100,
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
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsText>Invoices</BreadcrumbsText>
      </Breadcrumbs>

      <h1 className="mt-8">Invoices</h1>
      <div className="flex w-full justify-end mb-4">
        <InvoiceCreate
          onCreate={async (data) => {
            setIsLoading(true);
            const invoice = await createInvoice(data);
            router.push(`${pathname}/${invoice.id}`);
          }}
          vendors={vendors}
        />
      </div>

      <InvoicesTable
        invoices={invoices || []}
        isLoading={!invoices || isLoading}
        linkPathname={pathname}
      />
    </>
  );
}
