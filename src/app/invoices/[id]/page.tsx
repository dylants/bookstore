'use client';

import InvoiceItemsTable from '@/components/invoice-item/InvoiceItemsTable';
import { Separator } from '@/components/ui/separator';
import { getInvoice } from '@/lib/actions/invoice';
import { getInvoiceItems } from '@/lib/actions/invoice-item';
import { DEFAULT_LIMIT } from '@/lib/pagination';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';
import _ from 'lodash';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

export default function InvoicePage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<InvoiceHydrated | null>();
  const [invoiceItems, setInvoiceItems] =
    useState<Array<InvoiceItemHydrated> | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // TODO we should validate this input
  const id = _.toNumber(params.id);

  // Delay the loading animation a tiny amount to avoid screen flicker for quick connections (localhost)
  const setDelayedLoading = useCallback(() => {
    const timeout = setTimeout(() => setIsLoading(true), 50);
    return () => {
      setIsLoading(false);
      clearTimeout(timeout);
    };
  }, []);

  const loadInvoice = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    const invoice = await getInvoice(id);
    setInvoice(invoice);
    doneLoading();
  }, [id, setDelayedLoading]);

  const loadInvoiceItems = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    // TODO handle pagination
    const { invoiceItems } = await getInvoiceItems({
      invoiceId: id,
      paginationQuery: {
        first: DEFAULT_LIMIT,
      },
    });
    setInvoiceItems(invoiceItems);
    doneLoading();
  }, [id, setDelayedLoading]);

  // on initial render, load all the things
  useEffect(() => {
    loadInvoice();
    loadInvoiceItems();
  }, [loadInvoice, loadInvoiceItems]);

  return (
    <>
      <div className="flex h-5 items-center space-x-4 my-8 text-2xl">
        <Link href="/invoices">
          <div>Invoices</div>
        </Link>
        <div>/</div>
        <div>{invoice?.invoiceNumber}</div>
      </div>
      <Separator className="mt-4 mb-8" />

      <InvoiceItemsTable
        invoiceItems={invoiceItems || []}
        isLoading={!invoiceItems || isLoading}
      />
    </>
  );
}
