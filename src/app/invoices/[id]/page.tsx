'use client';

import BookForm from '@/app/invoices/[id]/BookForm';
import InvoiceDescription from '@/app/invoices/[id]/InvoiceDescription';
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
import { completeInvoice, getInvoice } from '@/lib/actions/invoice';
import { getInvoiceItems } from '@/lib/actions/invoice-item';
import InvoiceHydrated from '@/types/InvoiceHydrated';
import InvoiceItemHydrated from '@/types/InvoiceItemHydrated';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';

export default function InvoicePage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<InvoiceHydrated | null>();
  const [invoiceItems, setInvoiceItems] =
    useState<Array<InvoiceItemHydrated> | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // TODO we should validate this input
  const invoiceId = _.toNumber(params.id);

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
    const invoice = await getInvoice(invoiceId);
    setInvoice(invoice);
    doneLoading();
  }, [invoiceId, setDelayedLoading]);

  const loadInvoiceItems = useCallback(async () => {
    const doneLoading = setDelayedLoading();
    // TODO handle pagination
    const { invoiceItems } = await getInvoiceItems({
      invoiceId,
      paginationQuery: {
        first: 100,
      },
    });
    setInvoiceItems(invoiceItems);
    doneLoading();
  }, [invoiceId, setDelayedLoading]);

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

      <InvoiceDescription invoice={invoice} />

      {!invoice.isCompleted && (
        <div className="flex justify-end mt-2">
          <Button
            variant="secondary"
            onClick={async () => {
              await completeInvoice(invoiceId);
              loadInvoice();
            }}
          >
            Complete Invoice
          </Button>
        </div>
      )}

      <hr className="my-8 mx-8 bg-slate-300" />

      {!invoice.isCompleted && (
        <BookForm
          invoice={invoice}
          onCreateInvoiceItem={() => {
            loadInvoiceItems();
            // TODO add success
          }}
        />
      )}

      <div className="mt-4">
        <InvoiceItemsTable
          invoiceItems={invoiceItems || []}
          isLoading={!invoiceItems || isLoading}
        />
      </div>
    </>
  );
}
