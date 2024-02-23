'use client';

import {
  Breadcrumbs,
  BreadcrumbsHome,
  BreadcrumbsDivider,
  BreadcrumbsLink,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import InvoiceItemsTable from '@/components/invoice-item/InvoiceItemsTable';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getInvoice } from '@/lib/actions/invoice';
import { getInvoiceItems } from '@/lib/actions/invoice-item';
import { DEFAULT_LIMIT } from '@/lib/pagination';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';

function InvoiceDescription({ invoice }: { invoice: InvoiceHydrated }) {
  const { vendor } = invoice;
  return (
    <div className="flex w-full justify-between text-lg">
      <div className="flex flex-col">
        <div className="font-bold">{vendor.name}</div>
        <div className="grid grid-cols-2 gap-0">
          <div>
            <div>Account number:</div>
            <div>Discount:</div>
          </div>
          <div className="text-right">
            <div>{vendor.accountNumber}</div>
            <div>
              {vendor.discountPercentage
                ? `${vendor.discountPercentage * 100}%`
                : ''}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1">
        <div>
          <div>Invoice Number:</div>
          <div>Invoice Date:</div>
          <div>Complete:</div>
        </div>
        <div className="text-right">
          <div>{invoice.invoiceNumber}</div>
          <div>{invoice.invoiceDate.toLocaleDateString()}</div>
          <div>{invoice.isCompleted ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
}

export default function InvoicePage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<InvoiceHydrated | null>();
  const [invoiceItems, setInvoiceItems] =
    useState<Array<InvoiceItemHydrated> | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // TODO we should validate this input
  const id = _.toNumber(params.id);

  // Delay the loading animation a tiny amount to avoid screen flicker for quick connections (localhost)
  const setDelayedLoading = useCallback(() => {
    const timeout = setTimeout(() => setIsLoading(true), 100);
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

  if (!invoice) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsLink href="/invoices">Invoices</BreadcrumbsLink>
        <BreadcrumbsDivider />
        <BreadcrumbsText>{invoice.invoiceNumber}</BreadcrumbsText>
      </Breadcrumbs>

      <div className="my-4">
        <InvoiceDescription invoice={invoice} />
      </div>

      <div className="flex flex-col gap-4 mt-8">
        <div className="flex w-full justify-end">
          <Button variant="secondary" disabled={invoice.isCompleted}>
            Add Item
          </Button>
        </div>
        <InvoiceItemsTable
          invoiceItems={invoiceItems || []}
          isLoading={!invoiceItems || isLoading}
        />
      </div>
    </>
  );
}
