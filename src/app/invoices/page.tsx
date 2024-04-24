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
import { DEFAULT_LIMIT } from '@/lib/pagination';
import BookSourceSerialized from '@/types/BookSourceSerialized';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import PageInfo from '@/types/PageInfo';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function InvoicesPage() {
  const [vendors, setVendors] = useState<Array<BookSourceSerialized>>([]);
  const [invoices, setInvoices] = useState<Array<InvoiceHydrated> | null>();
  const [pageInfo, setPageInfo] = useState<PageInfo>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  const loadVendors = useCallback(async () => {
    const { bookSources: vendors } = await getBookSources({
      isVendor: true,
      paginationQuery: {
        first: 100, // TODO handle pagination
      },
    });
    setVendors(vendors);
  }, []);

  const loadInvoices = useCallback(async () => {
    const { invoices, pageInfo } = await getInvoices({
      paginationQuery: {
        first: DEFAULT_LIMIT,
      },
    });
    setInvoices(invoices);
    setPageInfo(pageInfo);
  }, []);

  // on initial render, load all the things
  useEffect(() => {
    loadInvoices();
    loadVendors();
  }, [loadInvoices, loadVendors]);

  // Delay the loading animation a tiny amount to avoid screen flicker for quick connections (localhost)
  const setDelayedLoading = useCallback(() => {
    const timeout = setTimeout(() => setIsLoading(true), 50);
    return () => {
      setIsLoading(false);
      clearTimeout(timeout);
    };
  }, []);

  const onNext = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    const { invoices: newInvoices, pageInfo: newPageInfo } = await getInvoices({
      paginationQuery: {
        after: pageInfo?.endCursor,
        first: DEFAULT_LIMIT,
      },
    });
    setInvoices(newInvoices);
    setPageInfo(newPageInfo);
    doneLoading();
  }, [pageInfo, setDelayedLoading]);

  const onPrevious = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    const { invoices: newInvoices, pageInfo: newPageInfo } = await getInvoices({
      paginationQuery: {
        before: pageInfo?.startCursor,
        last: DEFAULT_LIMIT,
      },
    });
    setInvoices(newInvoices);
    setPageInfo(newPageInfo);
    doneLoading();
  }, [pageInfo, setDelayedLoading]);

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
        onNext={pageInfo?.hasNextPage ? onNext : undefined}
        onPrevious={pageInfo?.hasPreviousPage ? onPrevious : undefined}
      />
    </>
  );
}
